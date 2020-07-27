<template>
  <div class="myCreateSongList">
    <el-table
      :data="collectionList"
      style="width: 100%"
      :row-class-name="tableRowClassName"
      height="400"
    >
      <el-table-column prop="songListName" label="歌单名" width="180" />
      <el-table-column prop="introduce" label="歌单简介" width="300" />
      <el-table-column prop="collectionCount" label="曲目数" width="180" />
      <el-table-column prop="accessAount" label="收听次数" width="180" />

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="openSongList(scope.row)"
            icon="el-icon-search"
            class="btn-search"
          ></el-button>
          <el-button
            size="mini"
            @click="deleteCollection(scope.row)"
            icon="el-icon-delete"
            class="btn-delete"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--  歌单歌曲列表弹出框  -->
    <el-dialog
      title="歌单歌曲列表"
      :visible.sync="songListVisible"
      class="el-dialog_1"
      width="1200"
    >
      <el-table
        :data="songList"
        style="width: 100%"
        :row-class-name="tableRowClassName"
        height="400"
      >
        <el-table-column
          prop="songName"
          label="歌曲名称"
          :formatter="formatterSongName"
          width="500"
        >
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <i
              :id="'main-play-buttom' + scope.$index"
              @click="palyMusic(scope.$index)"
              class="el-icon-video-play main-play-buttom"
            ></i>
            <i @click="downMusic(scope.row)" class="el-icon-download"></i>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import musicApi from "@/api/music";
import { saveCollection, getCollection } from "@/utils/auth.js";
export default {
  name: "myCreateSongList",
  inject: ["reload"],
  data() {
    return {
      collectionList: [],
      songListVisible: false,
      songList: []
    };
  },
  created() {
    this.fetchData();

    PubSub.subscribe("searchMusicPubSub", (event, title) => {
      this.searchMap.songName = title;
      this.fetchMusicData();
    });

    //表示上一首歌曲
    PubSub.subscribe("previousSongPubSub", (event, music) => {
      this.isPlay = false;
      if (!music) {
        this.$message({
          message: "请在列表中选择一首歌曲播放",
          type: "warning"
        });
        return false;
      }
      if (music.index <= 0) {
        this.palyMusic(0);
      } else {
        this.palyMusic(music.index - 1);
      }
    });

    //表示下一首歌曲
    PubSub.subscribe("nextSongPubSub", (event, music) => {
      if (!music) {
        this.$message({
          message: "请在列表中选择一首歌曲播放",
          type: "warning"
        });
        return false;
      }
      this.isPlay = false;
      if (music.index >= this.totalCount - 1) {
        this.palyMusic(this.totalCount - 1);
      } else {
        this.palyMusic(music.index + 1);
      }
    });
  },

  methods: {
    fetchData() {
      musicApi.getgetSongListsByUserId().then(response => {
        const resp = response.data;
        if (resp.flag) {
          this.collectionList = resp.data;
        }
      });
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 3) {
        return "success-row";
      }
      return "";
    },

    deleteCollection(row) {
      this.$confirm("确定要删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          musicApi
            .deleteUserWithSongList(row)
            .then(response => {
              const resp = response.data;
              this.$message({
                message: resp.message,
                type: resp.flag ? "success" : "warning"
              });
              if (resp.flag) {
                //删除之后要重新刷新数据
                musicApi
                  .getgetSongListsByUserId()
                  .then(response => {
                    const resp = response.data;
                    if (resp.flag) {
                      saveCollection(resp.data);
                      this.reload();
                    }
                  })
                  .catch(error => {
                    console.log(error);
                  });
              }
            })
            .catch(error => {
              console.log(error);
            });
        })
        .catch(() => {});
    },
    formatterSongName(row, column) {
      let songName = row.songName;
      return songName.substring(0, songName.lastIndexOf("."));
    },

    openSongList(row) {
      this.songListVisible = true;
      musicApi
        .getSongListBySongListId(row.songListId)
        .then(response => {
          let resp = response.data;
          if (resp.flag) {
            this.songList = resp.data;
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    palyMusic(index) {
      //先初始化，让所有的按钮和音乐回复原样
      this.index = index;
      this.GLOBAL_AUDIO.pause();
      let PlayButtoms = document.getElementsByClassName("main-play-buttom");

      for (let i = 0; i < PlayButtoms.length; i++) {
        PlayButtoms[i].setAttribute(
          "class",
          "main-play-buttom el-icon-video-play"
        );
      }
      //this.isPlay = false;

      let mainPlayButtom = document.getElementById("main-play-buttom" + index);

      let music = this.songList[index];
      if (!this.isPlay) {
        //songUrl
        // const src = row.songUrl
        //   ? row.songUrl
        //   : process.env.VUE_APP_MUSI_BASEURL + row.songName;

        const src = music.songUrl
          ? music.songUrl
          : process.env.VUE_APP_MUSI_BASEURL + music.songName;

        this.GLOBAL_AUDIO.src = src;
        this.GLOBAL_AUDIO.play(); //播放
        this.isPlay = true; //main-play-buttom
        mainPlayButtom.setAttribute(
          "class",
          "main-play-buttom el-icon-video-pause"
        );
      } else {
        this.isPlay = false;
        this.GLOBAL_AUDIO.pause(); //暂停
        mainPlayButtom.setAttribute(
          "class",
          "main-play-buttom el-icon-video-play"
        );
      }
      //把当前播放的音乐数据保存到state中
      //let music = this.songList[index];

      music.isPlay = this.isPlay;
      music.audio = this.GLOBAL_AUDIO;
      music.index = index;

      this.$store.dispatch("SaveMusic", music); //把当前播放的音乐保存到state中

      PubSub.publish("playMusicPubMyMusic", music); //发布播放音乐这个事件
    }
  }
};
</script>

<style scoped>
.main-play-buttom,
.el-icon-download {
  font-size: 30px;
}

.el-icon-download {
  margin-left: 45px;
}

.btn-search {
  color: #409eff !important;
}

.btn-delete {
  color: #f56c6c;
}
</style>
