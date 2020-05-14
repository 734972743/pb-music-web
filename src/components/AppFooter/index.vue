<template>
  <div class="footer" v-if="isShow">
    <!-- <audio src="" id="mymusic"></audio> -->
    <!-- @loadedmetadata="onLoadedmetadata('audio')" 
    在canplay（浏览器可以开始播放该音视频）钩子函数回调中访问duration属性可获得（注：在dom挂载完直接获取duration会返回NaN）
  @pause="onPause"
      @play="onPlay"
   autoplay
    -->
    <audio
      id="mymusic"
      ref="audio"
      @timeupdate="onTimeupdate"
      @canplay="getDuration"
      preload="auto"
      controls="controls"
      style="display:none;"
    ></audio>

    <span class="palyStateImg" v-if="this.music">
      <i @click="previousSong()" class="el-icon-arrow-left"></i>
      <i
        v-if="this.music.isPlay"
        @click="playMusic(true)"
        class="el-icon-video-pause"
        id="el-icon-video-play"
      ></i>
      <i
        v-else
        @click="playMusic(false)"
        class="el-icon-video-play"
        id="el-icon-video-play"
      ></i>

      <i @click="nextSong()" class="el-icon-arrow-right"></i>
      <img :src="this.music.imgUrl | imgUrlFilter" alt="" width="80px" />
      <!-- <span v-if="music">
        <img :src="music.imgUrl | imgUrlFilter" alt="" width="80px" />
      </span>
      <span v-else>
        <img src="@/assets/logo.png" alt="" width="80px" />
      </span> -->
      <!-- <img src="@/assets/logo.png" alt="" width="80px" /> -->
    </span>
    <span class="songInfo" v-if="music && true">
      <!-- 上面是歌名 -->
      <div class="songName">{{ music ? music.songName : "" }}</div>
      <!-- 下面是歌曲进度条   -->
      <div class="speedTime">
        <div>{{ current.startTime }}</div>
        <el-slider
          v-model="sliderTime"
          :min="0"
          :max="100"
          :disabled="false"
          :show-tooltip="false"
          style="width:200px;"
          @change="changeSpeedTime"
        ></el-slider>
        <div>{{ current.endtime }}</div>
      </div>
    </span>

    <!-- 这是是右边的图标样式 -->
    <span class="rightIcon" v-if="music && true">
      <i class="el-icon-chat-dot-square" @click="chatNumVisible = true"></i>
      <span class="chatNum" v-if="chatNum" @click="chatNumVisible = true">{{
        chatNum
      }}</span>
      <i class="el-icon-alarm-clock" @click="clockVisible = true"></i>
      <span class="clockTime" @click="clockVisible = true">{{
        clockTimeStr
      }}</span>
    </span>

    <!--  定时弹出框  -->
    <el-dialog
      title="定时关闭"
      :visible.sync="clockVisible"
      class="el-dialog_1"
      width="500px"
    >
      <el-select
        v-model="clockTimeStr"
        placeholder="定时开关"
        @change="changeClockTime"
      >
        <el-option
          v-for="time in clockTimes"
          :key="time.value"
          :label="time.label"
          :value="time.value"
        >
        </el-option>
      </el-select>
    </el-dialog>

    <!--  歌曲评论消息弹出框  -->
    <el-dialog
      title="歌曲评论列表"
      :visible.sync="chatNumVisible"
      class="el-dialog_1"
      width="1440px"
    >
      <el-table :data="messageList" style="width: 100% height:500px;">
        <el-table-column prop="userId" label="用户" width="180">
        </el-table-column>
        <el-table-column prop="content" label="评论" width="900">
        </el-table-column>
        <el-table-column label="操作"> </el-table-column>
      </el-table>

      <el-form
        :model="formMessage"
        status-icon
        :rules="rulesMessage"
        ref="formMessage"
        label-width="900px"
      >
        <el-form-item label="评论" prop="content" label-width="100px">
          <el-input
            style="width:700px;"
            type="textarea"
            v-model="formMessage.content"
            autocomplete="off"
          ></el-input>
          <el-button
            class="messageSubmit"
            type="primary"
            @click="submitFormMessage('formMessage')"
            >提交</el-button
          >
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
let clockTimesInterval = null;

import messageApi from "@/api/message.js";

export default {
  inject: ["reload"], //注入依赖， 这个依赖在App.vue中定义了

  created() {
    self = this;
    this.initData();
  },

  updated() {
    // console.log("进入updated方法");
    // console.log("udpate", this.$store.state);
  },

  //已挂载
  mounted() {
    var that = this;
    //that.play = true;

    //let curTime = this.curTime;

    PubSub.subscribe("playMusicPub", (event, music) => {
      //歌曲进度条重置
      this.curTime = 0;
      this.sliderTime = 0;
      this.audio.isPlay = music.isPlay;
      this.audio.songName = music.songName;
    });

    this.times = setInterval(() => {
      //只有当播放的时候这个当前进度才开始计数

      //这里计算滑块滑动时音频应播放的时刻
      this.curTime = this.audio.maxTime * (this.sliderTime / 100);

      if (this.music) {
        if (this.music.isPlay) {
          this.curTime += 1;
          if (that.sliderTime >= 100) {
            window.clearInterval(times);
            this.nextSong();
            this.sliderTime = -1;
            this.curTime = -1;
          }
        }
        this.current.startTime = this.timeFormat(this.curTime); //当前时间
        this.current.endtime = this.timeFormat(this.audio.maxTime); //结束时间
        this.sliderTime = (this.curTime / this.audio.maxTime) * 100;
      }
    }, 1000);

    //设置闹钟定时开关定时器
    this.clockTimesInterval = setInterval(() => {
      if (this.clockDate) {
        let t_s = this.clockDate.getTime(); //转化为时间戳毫秒数
        let nt = this.clockDate; //定义一个新时间
        nt.setTime(t_s - 1000); //设置新时间比旧时间少一秒
        nt = new Date(nt);
        this.clockTimeStr = nt.getMinutes() + ":" + nt.getSeconds();

        if (
          nt.getHours() != 0 ||
          (nt.getMinutes() <= 0 && nt.getSeconds() <= 0)
        ) {
          //window.clearInterval(this.clockTimesInterval);
          this.clockTimeStr = "";
          this.clockDate = null;

          //暂停音乐
          this.music.isPlay = false;
          this.playMusic(false);
          this.GLOBAL_AUDIO.pause();
        }
      }
    }, 1000);
  },

  data() {
    return {
      isShow: true, //这个foot是否显示出来
      sliderTime: 0, ////进度条的当前值 0为初始值， 100位最大值

      curTime: -1, //这是记录音乐当前播放的时间
      //这个是播放音乐的数据对象
      audio: {
        playing: false, // 该字段是音频是否处于播放状态的属性
        currentTime: 0, // 音频当前播放时长
        maxTime: 0, //音频的总时长
        audioName: "" //音频的名字
      },
      //play: false, // 播放暂停按钮
      current: {
        startTime: "00:00",
        endtime: "00:00",
        index: 1,
        nextIndex: 1,
        times: ""
      },

      music: null,
      // music: this.$store.music.music,
      defaultImg: "../../assets/logo.png",
      isPlay: false,

      //audio: null
      audioHTML: null,
      clockVisible: false, //定时关闭是否显示
      clockTimeStr: "",
      clockTimes: [
        { value: "", label: "不开启" },
        { value: "10", label: "10分钟" },
        { value: "20", label: "20分钟" },
        { value: "30", label: "30分钟" },
        { value: "40", label: "40分钟" },
        { value: "50", label: "50分钟" },
        { value: "60", label: "60分钟" }
      ],
      clockDate: null,
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
    //初始化数据
    initData() {
      this.audio = {
        // 该字段是音频是否处于播放状态的属性
        playing: false,
        // 音频当前播放时长
        currentTime: 0,
        // 音频最大播放时长
        maxTime: 0 //音频的总时长
      };
    },

    previousSong() {
      PubSub.publish("previousSongPubSub", this.music);
    },

    //点击播放按钮的是否播放
    playMusic(flag) {
      console.log("this.$store.music", this.$store.music);
      if (this.$store.state.music) {
        console.log(
          "this.$store.state.music.music",
          this.$store.state.music.music
        );
        this.music.imgUrl = this.$store.state.music.music.imgUrl;
        this.music.isPlay = this.$store.state.music.music.isPlay;
      }

      //debugger;
      console.log("playMusic", this.music);
      let footerPlayButtom = document.getElementById("el-icon-video-play");
      // if (this.music && this.music.isPlay) {
      //   footerPlayButtom.setAttribute("class", "el-icon-video-pause");
      //   this.music.isPlay = false;
      //   // this.onPause();
      // } else {
      //   footerPlayButtom.setAttribute("class", "el-icon-video-play");
      //   this.music.isPlay = true;
      //   // this.onPlay();
      // }
      //debugger;
      flag = !flag;
      if (flag) {
        footerPlayButtom.setAttribute("class", "el-icon-video-pause");
        this.music.isPlay = false;
        // this.onPause();
      } else {
        footerPlayButtom.setAttribute("class", "el-icon-video-play");
        this.music.isPlay = true;
        // this.onPlay();
      }

      //把这个this.music.isPlay 保存到state中
      this.$store.dispatch("SaveIsPlay", this.music.isPlay);
      // this.audio.audioName = this.music.songName;
      // this.audio.currentTime = this.curTime;
      // this.audio.isPlay = flag;

      this.music.songName = this.music.songName;
      this.music.currentTime = this.curTime;
      this.music.isPlay = flag;

      this.$store.dispatch("SaveMusic", this.music);
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
        audio.load(); //默认的时候让所有的音频加载，否则在火狐ie等浏览器下由于jquery插件的存在导致onloadedmetadata事件不响应

        audio.onloadedmetadata = this.onLoadedmetadata("audio");
      }
    },

    musicProcess() {
      if (this.music) {
        let audio = document.getElementById("mymusic");
        let current_Time = audio.currentTime;

        this.musicSpeedCur += 1;
      }
    },

    //将单位为秒的的时间转换成mm:ss的形式
    timeFormat(number) {
      var minute = parseInt(number / 60);
      var second = parseInt(number % 60);
      minute = minute >= 10 ? minute : "0" + minute;
      second = second >= 10 ? second : "0" + second;
      return minute + ":" + second;
    },

    // 当音频播放
    onPlay() {
      this.audio.playing = true;
    },
    // 当音频暂停
    onPause() {
      this.audio.playing = false;
      var startTime = parseInt(this.audio.currentTime);

      //
      this.play = false;
    },

    // 当加载语音流元数据完成后，会触发该事件的回调函数
    // 语音元数据主要是语音的长度之类的数据
    // 结束时间
    onLoadedmetadata(res) {
      let audioHTML = document.getElementById("mymusic");

      this.audio.currentTime = 0;
    },
    // 当timeupdate事件大概每秒一次，用来更新音频流的当前播放时间
    // 当音频当前时间改变后，进度条也要改变
    onTimeupdate(res) {
      let audioHTML = document.getElementById("mymusic");

      this.audio.currentTime = res.target.currentTime;
    },

    changeSpeedTime(val) {
      this.sliderTime = val;
      this.curTime = this.audio.maxTime * (this.sliderTime / 100);
      this.GLOBAL_AUDIO.currentTime = this.curTime;
    },

    //这个是获取音乐的最大的时长
    getDuration() {
      this.audio.maxTime = this.$refs.audio.duration;
    },

    //根据选择的时间来设置关闭的时间
    setClock(clockTimeStr) {
      let date = new Date();
      date.setHours(0);
      date.setSeconds(0);
      switch (clockTimeStr) {
        case "":
          this.clockTimeStr = "";
          this.clockDate = null;
          break;
        case "10":
          date.setMinutes(10);
          break;
        case "20":
          date.setMinutes(20);
          break;
        case "30":
          date.setMinutes(30);
          break;
        case "40":
          date.setMinutes(40);
          break;
        case "50":
          date.setMinutes(50);
          break;
        case "60":
          date.setMinutes(60);
          break;
      }
      return date;
    },

    changeClockTime(val) {
      let date = this.setClock(val);
      if (val != "") {
        this.clockDate = date;
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
    }
  },

  computed: {
    //监听store里面的music对象
    listenStoreMusic(newVal) {
      let music = this.$store.state.music.music;
      if (music) {
        this.isPlay = music.isPlay;

        let songId = music.songId;
        //
        if (songId) {
          messageApi
            .getCountBySongId(songId)
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
            .getMessagesBySongId(songId, 1, 10)
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
        }
      }
      this.curTime = -1; //把这个值设为默认值

      return music;
    },
    listenStoreMusicIsPlay(newVal) {
      return this.$store.state.music.isPlay;
    }
  },

  filters: {
    //这个是图片链接过滤器
    imgUrlFilter(val) {
      if (!val) {
        debugger;
        val = self.music.imgUrl;
        console.log("val", self.music);
        //  val =
        //    "https://pb-20191014.oss-cn-beijing.aliyuncs.com/resources/image/%E5%91%A8%E6%9D%B0%E4%BC%A6.jpg";
      }
      if (val.includes("https://pb-20191014.oss-cn-b")) {
        return val;
      } else {
        return process.env.VUE_APP_IMG_BASE_URL + val;
      }
    }
  },

  watch: {
    listenStoreMusic(newVal) {
      this.music = newVal;

      this.musicTimeSpan();
    },

    //这个是isPlay值发生变化的时候出发
    //listenStoreMusicIsPlay(newVal) {
    isPlay(newVal) {
      this.isPlay = newVal;
      // this.music.isPlay = newVal;
      this.audio.isPlay = newVal;

      let footerPlayButtom = document.getElementById("el-icon-video-play");
      if (footerPlayButtom) {
        if (this.audio.isPlay) {
          footerPlayButtom.setAttribute("class", "el-icon-video-pause");
        } else {
          footerPlayButtom.setAttribute("class", "el-icon-video-play");
        }
      }
    },

    //这是用来检测歌曲名发生变化的时候，用来清空data里面的数据
    // audio: {
    //   handler(newVal, oldVal) {
    //     //  this.$store.state.music.music.songName = newVal;
    //     //let songName = this.$store.state.music.music.songName;

    //     this.initData();
    //   },
    //   deep: true
    // },

    //路由监听
    $route(to) {
      this.isShow = to.path.indexOf("video") === -1;
      if (this.isShow) {
        this.playMusic(true);
      } else {
        this.playMusic(false);
      }
    }
  }
};
</script>

<style scoped>
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
  margin-left: 50px;
  font-size: 40px;
}

.rightIcon i {
  margin-left: 40px;
}

.chatNum {
  font-size: 20px;
  position: absolute;
  color: azure;
  left: 1233px;
  top: 69px;
}

.clockTime {
  font-size: 20px;
  position: absolute;
  color: azure;
  left: 1317px;
  top: 69px;
}

.messageSubmit {
  margin-left: 50px;
}
</style>
