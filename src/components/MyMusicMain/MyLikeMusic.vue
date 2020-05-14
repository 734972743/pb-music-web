<template>
  <div>
    <!-- 列表 -->
    <el-table
      :data="songList"
      style="width: 100%"
      height="500px"
      ref="songTable"
      :row-class-name="tableRowClassName"
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
          <i
            @click="collectionMusic(scope.$index, scope.row)"
            :id="'main-collection-buttom' + scope.$index"
            class="el-icon-star-on main-collection-buttom"
            v-if="scope.row.isCollection"
          ></i>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import musicApi from "@/api/music";
import global from "@/utils/global_variable.js";
const PubSub = require("pubsub-js");

//let audio = new Audio();

import { saveCollection, getCollection } from "@/utils/auth.js";

export default {
  data() {
    return {
      songList: [],
      isPlay: false
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
    //获取歌曲数据
    fetchData() {
      musicApi
        .getCollectionSongByUserId()
        .then(response => {
          const resp = response.data;
          if (resp.flag) {
            this.songList = resp.data;
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    formatterSongName(row, column) {
      let songName = row.songName;
      return songName.substring(0, songName.lastIndexOf("."));
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 3) {
        return "success-row";
      }
      return "";
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

      PubSub.publish("playMusicPub", music); //发布播放音乐这个事件
    }
  },
  computed: {
    listenIsPlay() {
      return this.$store.state.music.isPlay;
    }
  },
  watch: {
    listenIsPlay(newVal) {
      this.isPlay = newVal;

      let mainPlayButtom = document.getElementById(
        "main-play-buttom" + this.index
      );

      if (!this.isPlay) {
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
    }
  }
};
</script>

<style scoped>
.el-menu-song-navbar,
.el-table {
  margin-left: 190px;
  margin-top: 20px;
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
</style>
