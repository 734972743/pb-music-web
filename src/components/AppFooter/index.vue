<template>
  <div class="footer" v-if="isShow" @keyup.enter.native="playMusic(false)">
    <!-- @loadedmetadata="onLoadedmetadata('audio')" 
    在canplay（浏览器可以开始播放该音视频）钩子函数回调中访问duration属性可获得（注：在dom挂载完直接获取duration会返回NaN）
  @pause="onPause"
      @play="onPlay"
   autoplay
    -->
    <!-- 注意；我在这里使用的全局对象audio来播放音乐的，不是使用<audio>这个标签的 -->

    <span class="palyStateImg" v-if="firstPlay">
      <i @click="previousSong()" class="el-icon-arrow-left"></i>
      <i v-if="isPlay" @click="playMusic(false)" @keyup.enter="playMusic(false)" class="el-icon-video-pause"
        id="el-icon-video-play"></i>
      <i v-else @click="playMusic(true)" @keyup.space="playMusic(true)" class="el-icon-video-play"
        id="el-icon-video-play"></i>

      <i @click="nextSong()" class="el-icon-arrow-right"></i>
      <img :src="music.imgUrl | imgUrlFilter" alt="" width="80px" height="80px" />
      <!-- <span v-if="music">
        <img :src="music.imgUrl | imgUrlFilter" alt="" width="80px" />
      </span>
      <span v-else>
        <img src="@/assets/logo.png" alt="" width="80px" />
      </span> -->
      <!-- <img src="@/assets/logo.png" alt="" width="80px" /> -->
    </span>
    <span class="songInfo" v-if="firstPlay">
      <!-- 上面是歌名 -->
      <div class="songName">{{ music ? music.songName : "" }}</div>
      <!-- 下面是歌曲进度条   -->
      <div class="speedTime">
        <div>{{ current.startTime }}</div>
        <el-slider v-model="sliderTime" :min="0" :max="100" :disabled="false" :show-tooltip="false" style="width:200px;"
          @change="changeSpeedTime" @keyup.left.native="reduceSpeedTime()"></el-slider>
        <div>{{ current.endtime }}</div>
      </div>
    </span>

    <!-- 这是是右边的图标样式 -->
    <span class="rightIcon" v-if="firstPlay">
      <i class="el-icon-chat-dot-square" @click="chatNumVisible = true"></i>
      <span class="chatNum" v-if="chatNum" @click="chatNumVisible = true">{{
        chatNum
      }}</span>

      <!-- 定时器组件 -->
      <pb-timer @isEnd="isEnd" class="clockTime"></pb-timer>
    </span>

    <!--  歌曲评论消息弹出框  -->
    <el-dialog title="歌曲评论列表" :visible.sync="chatNumVisible" class="el-dialog_1" width="1440px">
      <el-table :data="messageList" style="width: 100% height:500px;">
        <el-table-column prop="userId" label="用户" width="180">
        </el-table-column>
        <el-table-column prop="content" label="评论" width="900">
        </el-table-column>
        <el-table-column label="操作"> </el-table-column>
      </el-table>

      <el-form :model="formMessage" status-icon :rules="rulesMessage" ref="formMessage" label-width="900px">
        <el-form-item label="评论" prop="content" label-width="100px">
          <el-input style="width:700px;" type="textarea" v-model="formMessage.content" autocomplete="off"></el-input>
          <el-button class="messageSubmit" type="primary" @click="submitFormMessage('formMessage')">提交</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
const PubSub = require("pubsub-js");

let self = this;

let musicProcessInterval = null;
var times = null;

import messageApi from "@/api/message.js";

import { log } from "util";

export default {
  inject: ["reload"], //注入依赖， 这个依赖在App.vue中定义了

  created() {
    self = this;
    //this.initData();
  },

  updated() {},

  //已挂载
  mounted() {
    var that = this;
    //that.play = true;

    //let curTime = this.curTime;

    PubSub.subscribe("AppMusicToFooterPlay", (event, isPlay) => {
      this.isPlay = isPlay;
    });

    PubSub.subscribe("playMusicPubHall", (event, music) => {
      //歌曲进度条重置
      this.curTime = 0;
      this.sliderTime = 0;
      this.music.isPlay = music.isPlay;
      this.music.songName = music.songName;
      this.music.imgUrl = music.imgUrl;
      this.music.index = music.index;
      this.music.songId = music.songId;

      this.firstPlay = true;

      let mainButton = document.querySelector("#el-icon-video-play");
      if (mainButton) {
        if (!music.isPlay) {
          //如果不是播放状态
          mainButton.setAttribute("class", "el-icon-video-play");
        } else {
          mainButton.setAttribute("class", "el-icon-video-pause");
        }
      }

      this.getDuration();
    });

    this.times = setInterval(() => {
      //只有当播放的时候这个当前进度才开始计数

      //这里计算滑块滑动时音频应播放的时刻
      this.curTime = this.globalAudio.maxTime * (this.sliderTime / 100);

      if (this.music) {
        if (this.isPlay) {
          this.curTime += 1;
          if (that.sliderTime >= 100) {
            window.clearInterval(times);
            this.nextSong();
            this.sliderTime = -1;
            this.curTime = 0;
          }
        }
        this.current.startTime = this.timeFormat(this.curTime); //当前时间
        this.current.endtime = this.timeFormat(this.globalAudio.maxTime); //结束时间
        this.sliderTime = (this.curTime / this.globalAudio.maxTime) * 100;
      }
    }, 1000);
  },

  data() {
    return {
      isShow: true, //这个foot是否显示出来
      isPlay: true, //是否播放
      firstPlay: false,
      curTime: 0, //这是记录音乐当前播放的时间
      sliderTime: 0, ////进度条的当前值 0为初始值， 100位最大值
      //用来展示的音乐
      music: {
        imgUrl: "",
        songName: ""
      },
      //用来定义全局音乐对象
      globalAudio: {
        currentTime: 0,
        maxTime: 10
      },

      //这个时记录进度条时间的
      current: {
        startTime: "00:00",
        endtime: "00:00",
        index: 1,
        nextIndex: 1,
        times: ""
      },
      current: {},
      sliderTime: 0,
      chatNumVisible: false,
      clockVisible: false,
      chatNum: 0,

      chatNum: 0,
      chatNumVisible: false,
      messageList: [],
      formMessage: {
        content: ""
      },
      rulesMessage: {
        content: [{ required: true, message: "评论不能为空", trigget: "blur" }]
      }
    };
  },

  methods: {
    // onTimeupdate(res) {
    //   let audioHTML = document.getElementById("mymusic");

    //   this.audio.currentTime = res.target.currentTime;
    // },

    /**
     * 这个是获取音乐的最大的时长
     */
    getDuration() {
      let durationTime = setInterval(() => {
        this.globalAudio.maxTime = this.GLOBAL_AUDIO.duration;
        this.globalAudio.maxTime = this.GLOBAL_AUDIO.duration;

        if (this.globalAudio.maxTime > 10) {
          //通知音乐的最大时间
          PubSub.publish("durationTime", this.globalAudio.maxTime);
          window.clearInterval(durationTime);
        }
      }, 500);
    },

    previousSong() {
      PubSub.publish("previousSongPubSub", this.music);
    },

    nextSong() {
      PubSub.publish("nextSongPubSub", this.music);
    },

    playMusic(type) {
      if (type) {
        this.isPlay = true;
        this.GLOBAL_AUDIO.play();
        PubSub.publish("playMusicPubHallToMain", true);
      } else {
        //暂停音乐
        this.isPlay = false;
        this.GLOBAL_AUDIO.pause();
        PubSub.publish("playMusicPubHallToMain", false);
      }
    },

    changeSpeedTime(val) {
      this.sliderTime = val;
      this.curTime = this.globalAudio.maxTime * (this.sliderTime / 100);
      this.GLOBAL_AUDIO.currentTime = this.curTime;
      PubSub.publish("changeSpeedTimePubHallToMain", this.curTime);
    },

    addSpeedTime() {
      this.sliderTime += 10;
      this.changeSpeedTime(this.sliderTime);
    },

    reduceSpeedTime() {
      this.sliderTime -= 10;
      this.changeSpeedTime(this.sliderTime);
    },

    /**
     * 这个是定时器结束后触发的事件
     */
    isEnd(val) {
      if (val) {
        //暂停音乐
        this.music.isPlay = false;
        this.playMusic(false);
        this.GLOBAL_AUDIO.pause();
      }
    },

    submitFormMessage(formName) {
      this.$refs[formName].validate(vali => {
        if (vali) {
          let message = {};
          message.songId = this.music.songId;
          message.content = this.formMessage.content;
          messageApi
            .replyMessage(message)
            .then(response => {
              let resp = response.data;
              if (resp.flag) {
                this.$message({
                  message: "评论成功",
                  type: "success"
                });
                this.formMessage.content = "";
                this.chatNumVisible = false;
                this.reload();
              } else {
                this.$message({
                  message: "评论失败",
                  type: "warning"
                });
              }
            })
            .catch(error => {
              console.log(error);
            });
        }
      });
    },

    //获取歌曲评论信息
    getMessagesInfo() {
      messageApi
        .getCountBySongId(this.music.songId)
        .then(response => {
          let resp = response.data;
          if (resp.code == 200) {
            this.chatNum = resp.data;
          }
        })
        .catch(error => {
          console.log(error);
        });

      messageApi
        .getMessagesBySongId(this.music.songId, 1, 10)
        .then(response => {
          let resp = response.data;
          if (resp.flag) {
            //给评论的作者设置作者名字
            let users = resp.obj;
            resp.data.forEach(message => {
              users.forEach(user => {
                if (message.userId == user.userId) {
                  message.userId = user.userName;
                }
              });
            });
            this.messageList = resp.data;
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    //将单位为秒的的时间转换成mm:ss的形式
    timeFormat(number) {
      var hour = parseInt(number / 3600);
      var minute = parseInt(number / 60);
      var second = parseInt(number % 60);
      minute = minute >= 10 ? minute : "0" + minute;
      second = second >= 10 ? second : "0" + second;
      if (hour > 0) {
        return hour + ":" + minute + ":" + second;
      } else {
        return minute + ":" + second;
      }
    }
  },

  filters: {
    //这个是图片链接过滤器
    imgUrlFilter(val) {
      if (!val) {
        // debugger;
        val = "歌手.jpg";
      }
      if (val.includes("https://pb-20191014.oss-cn-b")) {
        return val;
      } else {
        return process.env.VUE_APP_IMG_BASE_URL + val;
      }
    }
  },

  watch: {
    //歌曲名称发生改变的时候
    "music.songName": {
      handler(newVal, oldVal) {
        this.getDuration();
        this.getMessagesInfo();
      }
    }
  },

  computed: {}
};
</script>

<style lang="less" scoped>
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

.rightIcon {
  position: relative;
  margin-left: 50px;
  font-size: 40px;

  i {
    margin-left: 40px;
  }

  .chatNum {
    font-size: 20px;
    position: absolute;
    color: azure;
    left: 1233px;
    top: 69px;
  }

  .messageSubmit {
    margin-left: 50px;
  }

  .clockTime {
    position: absolute;
    left: 129px;
    top: 0px;
  }

  .pb-timer /deep/ .clockImg {
    font-size: 40px;
  }

  .pb-timer /deep/ .isShowClockTime {
    background: #16a085;
  }
  .pb-timer /deep/ .clockTime {
    font-size: 21px;
    color: black;
    left: 27px;
    top: 0px;
    width: 59px;
    height: 27px;
  }
}

@media screen and (max-width: 448px) {
}

/* 手机屏幕的字体大小 */
@media screen and (max-width: 1500px) and (min-width: 448px) {
  .palyStateImg {
    margin-left: 204px;
  }
}
</style>
