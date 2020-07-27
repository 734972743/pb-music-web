<template>
  <div>
    <el-button type="danger" @click="deleteAllHistorySongs()"
      >删除所有记录</el-button
    >
    <!-- 列表 -->
    <el-table
      :data="songList"
      style="width: 100%"
      height="500px"
      ref="songTable"
      :row-class-name="tableRowClassName"
    >
      <el-table-column
        prop="songs[0].songName"
        label="歌曲名称"
        :formatter="formatterSongName"
        width="500"
      >
      </el-table-column>
      <el-table-column prop="historyDate" label="收听时间" width="500">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <i
            :id="'main-play-buttom' + scope.$index"
            @click="palyMusic(scope.$index)"
            class="el-icon-video-play main-play-buttom"
          ></i>
          <i @click="downMusic(scope.row)" class="el-icon-download"></i>
          <i
            @click="collectionMusic(scope.$index, scope.row)"
            :id="'main-collection-buttom' + scope.$index"
            class="el-icon-star-on main-collection-buttom"
            v-if="scope.row.isCollection"
          ></i>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChangeMusicList"
      @current-change="handleCurrentChangeMusicList"
      :current-page="songListCurpage"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="songListPageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="songListTotalCount"
    />
  </div>
</template>

<script>
import musicApi from "@/api/music";

Date.prototype.Format = function(fmt) {
  //author: meizz
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "H+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds() //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};

export default {
  inject: ["reload"], //注入依赖， 这个依赖在App.vue中定义了
  data() {
    return {
      songList: [],
      isPlay: false,
      songListPageSize: 10,
      songListCurpage: 0,
      songListTotalCount: 0
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
      musicApi.getUserHistorySongsByUserId().then(response => {
        const resp = response.data;
        if (resp.flag) {
          let data = resp.data;
          data.forEach(e => {
            let date = new Date(e.historyDate);

            e.historyDate = date.Format("yyyy-MM-dd HH:mm:ss");
          });

          this.songList = data;
        }
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
          : process.env.VUE_APP_MUSI_BASEURL + music.songs[0].songName;

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
    },

    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 3) {
        return "success-row";
      }
      return "";
    },

    formatterSongName(row, column) {
      let songName = row.songs[0].songName;
      return songName.substring(0, songName.lastIndexOf("."));
    },

    handleSizeChangeMusicList(val) {
      this.songListPageSize = val;
      this.fetchMusicData();
    },

    handleCurrentChangeMusicList(val) {
      this.songListCurpage = val;
      this.fetchMusicData();
    },

    deleteAllHistorySongs() {
      this.$confirm("确定要删除吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        musicApi
          .deleteAllHistorySongByUserId()
          .then(response => {
            let resp = response.data;
            if (resp.flag) {
              this.$message({
                message: "删除成功",
                type: "success"
              });
              this.reload();
            } else {
              this.$message({
                message: "删除失败",
                type: "warning"
              });
            }
          })
          .catch(error => {
            console.log(error);
          });
      });
    }
  }
};
</script>

<style scoped>
.el-menu-song-navbar,
.el-table {
  margin-top: 20px;
  margin-bottom: 30px;
}

.main-play-buttom,
.el-icon-download {
  font-size: 30px;
}

/* .el-icon-video-play {
  margin-left: 45px;
} */
.el-icon-download {
  margin-left: 45px;
}

.el-button--danger {
  margin-top: 30px;
}
</style>
