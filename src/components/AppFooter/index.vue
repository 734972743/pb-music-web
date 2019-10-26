<template>
  <div class="footer">
    <audio src="" id="mymusic"></audio>

    <span class="palyStateImg">
      <i @click="previousSong()" class="el-icon-arrow-left"></i>
      <i
        v-if="music && music.isPlay"
        @click="playMusic()"
        class="el-icon-video-pause"
        id="el-icon-video-play"
      ></i>
      <i
        v-else
        @click="playMusic()"
        class="el-icon-video-play"
        id="el-icon-video-play"
      ></i>

      <i @click="nextSong()" class="el-icon-arrow-right"></i>
      <span v-if="music">
        <img :src="music.imgUrl | imgUrlFilter" alt="" width="80px" />
      </span>
      <span v-else>
        <img src="../../assets/logo.png" alt="" width="80px" />
      </span>
      <!-- <img src="@/assets/logo.png" alt="" width="80px" /> -->
    </span>
    <span class="songInfo" v-if="music && music.songName">
      <!-- 上面是歌名 -->
      <div class="songName">{{ music ? music.songName : "" }}</div>
      <!-- 下面是歌曲进度条 -->
      <div class="speedTime">
        <div>{{ musicSpeedCurStr }}</div>
        <el-slider
          v-model="musicSpeedCur"
          :min="musicSpeedMin"
          :max="musicSpeedMax"
          :disabled="true"
          style="width:200px;"
        ></el-slider>
        <div>{{ musicSpeedMaxStr }}</div>
      </div>
    </span>
  </div>
</template>


<script>
const PubSub = require("pubsub-js");

let self = this;

let musicProcessInterval = null;

export default {
  created() {
    this.initData();
  },

  updated() {},

  mounted() {
    // let audio = document.getElementById("mymusic");
    // this.audioHTML = audio;
    // if (audio.canPlayType("audio/mp3")) {
    //   audio.src = "hangge.mp3";
    // } else if (audio.canPlayType("audio/ogg")) {
    //   audio.src = "hangge.ogg";
    // }
    // audio.onloadedmetadata(() => {
    //   console.log("duration", audio.duration);
    // });
    //this.musicTimeSpan();
  },

  data() {
    return {
      music: null,
      // music: this.$store.music.music,
      defaultImg: "../../assets/logo.png",
      isPlay: false,
      musicSpeedCur: 0, //歌曲的当前进度,
      musicSpeedMin: 0, //进度最小值
      musicSpeedMax: 0, //进度最大值
      musicSpeedCurStr: "",
      musicSpeedMaxStr: "",
      //audio: null
      audioHTML: null
    };
  },

  methods: {
    initData() {
      this.musicSpeedCur = 0; //歌曲的当前进度,
      this.musicSpeedMin = 0; //进度最小值
      this.musicSpeedMax = 0; //进度最大值
      this.musicSpeedCurStr = "";
      this.musicSpeedMaxStr = "";
      //  clearInterval(musicProcessInterval);
    },

    previousSong() {
      PubSub.publish("previousSongPubSub", this.music);
    },

    //点击播放按钮的是否出发
    playMusic() {
      // console.log("footer--palyMusic", this.music);
      let footerPlayButtom = document.getElementById("el-icon-video-play");
      if (this.music && this.music.isPlay) {
        footerPlayButtom.setAttribute("class", "el-icon-video-pause");
        this.music.isPlay = false;
      } else {
        footerPlayButtom.setAttribute("class", "el-icon-video-play");
        this.music.isPlay = true;
      }

      //把这个this.music.isPlay 保存到state中
      this.$store.dispatch("SaveIsPlay", this.music.isPlay);
    },

    nextSong() {
      PubSub.publish("nextSongPubSub", this.music);
    },

    //音乐进度条
    musicTimeSpan() {
      if (this.music) {
        let audio = document.getElementById("mymusic");

        let src = this.music.songUrl
          ? this.music.songUrl
          : process.env.VUE_APP_MUSI_BASEURL + this.music.songName;
        audio.src = src;

        let current_Time = audio.currentTime;
        let time_All = audio.duration;

        this.musicSpeedCur = current_Time;
        this.musicSpeedMax = time_All;

        // audio.currentTime = 100;
        // audio.oncanplay = function() {
        //   this.currentTime = 100;
        // };

        this.musicSpeedCurStr = this.timeFormat(this.musicSpeedCur - 0);
        // console.log("time_All", time_All);
        if (time_All === "NaN") {
          this.musicSpeedMaxStr = "";
        } else {
          this.musicSpeedMaxStr = this.timeFormat(this.musicSpeedMax - 0);
        }
      }

      //musicProcessInterval = setInterval(this.musicProcess, 1000);
    },

    musicProcess() {
      if (this.music) {
        let audio = document.getElementById("mymusic");
        let current_Time = audio.currentTime;

        this.musicSpeedCur += 1;

        this.musicSpeedCurStr = this.timeFormat(this.musicSpeedCur - 0);
      }
    },

    //将单位为秒的的时间转换成mm:ss的形式
    timeFormat(number) {
      var minute = parseInt(number / 60);
      var second = parseInt(number % 60);
      minute = minute >= 10 ? minute : "0" + minute;
      second = second >= 10 ? second : "0" + second;
      return minute + ":" + second;
    }
  },

  computed: {
    //监听store里面的music对象
    listenStoreMusic(newVal) {
      if (this.$store.state.music.music) {
        this.isPlay = this.$store.state.music.music.isPlay;
      }
      return this.$store.state.music.music;
    },
    listenStoreMusicIsPlay(newVal) {
      return this.$store.state.music.isPlay;
    }
  },

  filters: {
    //这个是图片链接过滤器
    imgUrlFilter(val) {
      return process.env.VUE_APP_IMG_BASE_URL + val;
    }
  },

  watch: {
    listenStoreMusic(newVal) {
      this.music = newVal;

      if (!newVal.imgUrl) {
        this.music.imgUrl =
          "https://pb-20191014.oss-cn-beijing.aliyuncs.com/%E8%B5%84%E6%BA%90/image/%E5%91%A8%E6%9D%B0%E4%BC%A6.jpg";
      }
      // else {
      //   console.log("this.music.imgUrl", newVal.imgUrl);
      //   this.music.imgUrl = process.env.VUE_APP_IMG_BASE_URL + newVal.imgUrl;
      // }

      this.musicTimeSpan();
    },

    //这个是isPlay值发生变化的时候出发
    listenStoreMusicIsPlay(newVal) {
      this.isPlay = newVal;

      let footerPlayButtom = document.getElementById("el-icon-video-play");
      if (this.isPlay) {
        footerPlayButtom.setAttribute("class", "el-icon-video-pause");
      } else {
        footerPlayButtom.setAttribute("class", "el-icon-video-play");
      }
    },

    //这是用来检测歌曲名发生变化的时候，用来清空data里面的数据
    listenMusicName(newVal) {
      let songName = this.$store.state.music.music.songName;
      this.initData();
    }
  }
};
</script>

<style  scoped>
.footer {
  margin-top: -40px;
}

.footer div {
  display: inline-block;
}

.palyStateImg {
  margin-left: 400px;
  width: 600px;
}

/*这个是取某一个元素的兄弟元素 */
.palyStateImg ~ .songInfo {
  /*  让上下结构变成左右结构   */
  display: inline-block;
}
.palyStateImg i:nth-child(1),
.palyStateImg i:nth-child(3) {
  font-size: 40px;
  margin-top: 5px;
  margin-left: 20px;
}

/*播放按钮 */
.palyStateImg i:nth-child(2) {
  font-size: 50px;
  margin-top: 5px;
  margin-left: 20px;
}

.palyStateImg i:hover {
  color: #5cb6ff;
}

.palyStateImg img {
  margin-left: 50px;
  margin-top: 28px;
}

.songInfo {
  margin-left: 50px;
}

.songInfo > div {
  margin-left: 50px;
  display: block;
}

.songName {
  /* display: inline-block; */
  margin-left: 100px;
  line-height: 50px;
  margin-top: 10px;
}

.speedTime div {
  display: inline-block;
  margin-left: 10px;
}

.speedTime div:nth-child(1),
.speedTime div:nth-child(3) {
  margin-top: 0px;
}

.speedTime div:nth-child(2) {
  margin-bottom: -10px;
}
</style>