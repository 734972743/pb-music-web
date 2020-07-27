<template>
  <!-- 热门歌曲 -->

  <div class="mod_index-hot">
    <div class="guanggao">
      <span class="logo">
        <img src="@/assets/logo.png" alt="" width="60px" />
        <span class="title">{{ title }}</span>
      </span>
      <div class="tip">有你想听想看的</div>
      <el-button type="primary" @click="downClient" icon="el-icon-mobile">下载安卓客户端</el-button>
    </div>

    <!--
    <div>
      <div
        class="playlist__item_box"
        v-for="type in typeList"
        :key="type.typeId"
      >
        <div class="playlist__cover mod_cover">
          <a
            href="#"
            onclick="setStatCookie&amp;&amp;setStatCookie();"
            class="js_playlist"
          >
            <img
              :src="type.img"
              :alt="type.typeName"
              width="225px"
              height="225px"
              class="playlist__pic"
            /><i class="mod_cover__mask"></i
            ><i class="mod_cover__icon_play js_play"></i>
          </a>
        </div>
        <h4 class="playlist__title">
          <span class="playlist__title_txt"
            ><a
              href="#"
              onclick="setStatCookie&amp;&amp;setStatCookie();"
              class="js_playlist"
              >{{ type.typeName }}</a
            ></span
          >
        </h4>
        <div class="playlist__other">播放量：{{ type.playNum }}</div>
      </div>
    </div>
    <div></div>
    -->

    <div>
      <advertisement />
    </div>

    <div class="left">
      <!--    歌曲列表 
     @click.native="changeSongType(type.typeId)"
      -->
      <el-radio-group v-model="songTypeIndex" @change="changeSongType(type.typeId)" v-for="type in typeList">
        <el-radio-button :label="type.typeName"></el-radio-button>
      </el-radio-group>

      <!-- 列表 
    -->
      <el-table :data="songList" class="songListTable" style="width: 100%" height="60vh" ref="songTable"
        highlight-current-row :row-class-name="tableRowClassName">
        <el-table-column prop="songName" label="歌曲名称" :formatter="formatterSongName" width="500">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <i :id="'main-play-buttom' + scope.$index" @click="playMusic(scope.$index)"
              class="el-icon-video-play main-play-buttom"></i>
            <i @click="downMusic(scope.row)" class="el-icon-download"></i>
            <i @click="collectionMusic(scope.$index, scope.row)" :id="'main-collection-buttom' + scope.$index"
              class="el-icon-star-on main-collection-buttom" v-if="scope.row.isCollection"></i>

            <i @click="openSelectCollection(scope.$index, scope.row)" :id="'main-collection-buttom' + scope.$index"
              class="el-icon-star-off main-collection-buttom" v-else></i>
          </template>
        </el-table-column>
      </el-table>

      <!--    歌曲列表分页   -->
      <el-pagination class="pagination" @size-change="handleSizeChangeMusicList"
        @current-change="handleCurrentChangeMusicList" :current-page="songListCurpage" :page-sizes="[5, 10, 20, 30]"
        :page-size="songListPageSize" layout="total, sizes, prev, pager, next, jumper" :total="songListTotalCount">
      </el-pagination>
    </div>

    <div class="right">

      <pb-lyric :cyricContent="cyricContent" :start="cyricStart" :currentTime="currentTime"
        :isCyricFollow="isCyricFollow" class="lyricFathon">
      </pb-lyric>
    </div>

    <div class="clear"></div>

    <!--    个性化推荐   -->

    <!--    新建收藏夹弹出框   -->
    <el-dialog title="新建收藏夹" :visible.sync="newCollectionVisible" class="el-dialog_1" width="400px">
      <el-form :model="newCollectionForm" status-icon :rules="rulesNewCollection" ref="newCollectionForm"
        label-width="100px">
        <el-form-item label="收藏夹名称" prop="collectionName">
          <el-input v-model="newCollectionForm.collectionName" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="收藏夹简介" prop="introduce">
          <el-input v-model="newCollectionForm.introduce" autocomplete="off" type="textarea"></el-input>
        </el-form-item>

        <el-form-item label="是否公开" prop="songListStateId">
          <el-radio v-model="newCollectionForm.songListStateId" label="0">是</el-radio>
          <el-radio v-model="newCollectionForm.songListStateId" label="1" disabled>否(vip)</el-radio>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="newCollection('newCollectionForm')">新建</el-button>
          <el-button @click="resetForm('newCollectionForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--    点击收藏按钮选择弹出哪个收藏夹   -->
    <el-dialog :visible.sync="selectCollectionVisible" title="选择一个歌单" class="el-dialog_selectCollection" width="300px"
      style="left:993px; top:200px;">
      <el-table :data="collectionList" style="width: 100%" :row-class-name="tableRowClassName" height="400">
        <el-table-column prop="songListName" label="歌单" width="180">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleSelectionChangeCollection(scope.$index, scope.row)">选择</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-button type="primary" icon="el-icon-folder-add" @click="openNewCollection()">添加到新歌单</el-button>
    </el-dialog>
  </div>
</template>

<script>
import musicApi from "@/api/music";
import cyricApi from "@/api/cyric.js";
import Advertisement from "@/components/Advertisement";

const PubSub = require("pubsub-js");

import { saveCollection, getCollection } from "@/utils/auth.js";
import typeApi from "@/api/type.js";

import { savePageQuery, getPageQuery, removePageQuery } from "@/utils/auth.js";
import { resolve } from "url";

let times = null;

export default {
  inject: ["reload"], //注入依赖， 这个依赖在App.vue中定义了，这个是用于刷新页面
  components: {
    Advertisement
  },
  data() {
    return {
      title: "PB音乐",
      user: null, //用户信息
      typeList: [],
      isPlay: false,
      activeIndex: "/newSong",
      songTypeIndex: "所有",
      // currentPage: 1,
      // pageSize: 5,

      searchMap: {
        songName: "",
        typeId: []
      },

      //下面的是歌曲列表的配置
      songList: [],
      songListTotalCount: 0, //总记录数
      songListCurpage: 1, //当前页
      songListPageSize: 10, //每页显示的条数
      // songIndex: 0, //歌曲所在也的下标
      isPlay: false, //是否播放,
      index: -1, //歌曲所在行的下标
      newCollectionVisible: false,
      newCollectionForm: {
        collectionName: "",
        introduce: "",
        songListStateId: "0"
      },
      rulesNewCollection: {
        collectionName: [
          { required: true, message: "名称必填", trigger: "blur" }
        ]
      },
      selectCollectionVisible: false,
      collectionList: getCollection(),
      songListId: "", //这个是选择的收藏夹的ID
      collectionMusicData: {
        //这个是点击收藏音乐按钮要保存的数据
        index: "",
        row: null
      },

      cyricContent: "",
      cyricStart: false,
      isCyricFollow: "1",

      currentTime: 0, //当前音乐播放的时间
      maxTime: 0, //当前音乐的最大时间长度
      isCyricFollow: "1", //是否歌词跟随
      currentIndex: -1 //当前播放音乐的下标
    };
  },

  // filters: {
  //   //过滤掉歌曲名字后面的后缀名
  //   songNameFilter(value) {
  //     return value.substring(0, value.indexOf(".") + 1);
  //   }
  // },

  created() {
    // this.fetchTypeData();

    let pageQueryObj = getPageQuery();

    if (pageQueryObj) {
      this.songTypeIndex = pageQueryObj.songTypeName;
      this.searchMap.typeId[0] = pageQueryObj.songTypeId;
      this.songListCurpage = pageQueryObj.songListCurpage;
      this.songListPageSize = pageQueryObj.songListPageSize;
      this.index = pageQueryObj.songIndex ? pageQueryObj.songIndex : 1;
    }

    this.initData();
    this.fetchMusicData();
    this.fetchTypeData();

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

      //当音乐处于列表第一行是，上一首歌曲就是上一页的最后一首歌曲
      if (music.index == 0) {
        if (this.songListCurpage == 1) {
          return;
        }
        this.songListCurpage--;
        return new Promise((resolve, reject) => {
          this.fetchMusicData()
            .then(response => {
              if (response) {
                resolve(true);
              }
            })
            .catch(error => {
              reject(error);
            });
        }).then(data => {
          if (data) {
            this.playMusic(this.songListPageSize - 1);
          }
        });
      } else {
        this.playMusic(music.index - 1);
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
      if (music.index == this.songListPageSize - 1) {
        //如果是当前页的最后一首歌曲时，下一首歌曲应是下一页的第一首歌曲
        this.songListCurpage++;
        this.index = 0;
        //异步操作
        return new Promise((resolve, reject) => {
          this.fetchMusicData()
            .then(response => {
              if (response) {
                resolve(true);
              }
            })
            .catch(error => {
              reject(error);
            });
        }).then(data => {
          if (data) {
            this.playMusic(this.index);
          }
        });
      } else {
        this.playMusic(music.index + 1);
      }
    });

    //表示播放/暂停音乐
    PubSub.subscribe("playMusicPubHallToMain", (event, type) => {
      this.isPlay = type;

      let PlayButtom = document.querySelector("#main-play-buttom" + this.index);
      if (type) {
        PlayButtom.setAttribute(
          "class",
          "main-play-buttom el-icon-video-pause"
        );
      } else {
        PlayButtom.setAttribute("class", "main-play-buttom el-icon-video-play");
      }
    });

    //拖动进度条
    PubSub.subscribe("changeSpeedTimePubHallToMain", (event, curTime) => {
      this.currentTime = curTime;
    });

    PubSub.subscribe("durationTime", (event, maxTime) => {
      this.maxTime = maxTime;
    });
  },

  //挂载
  mounted() {
    let pageQueryObj = getPageQuery();

    //设置播放歌曲行背景颜色
    let index = pageQueryObj.songIndex;
    this.index = index;
  },

  methods: {
    //初始化数据
    initData() {
      this.user = this.$store.state.user.user;

      let pageQueryObj = getPageQuery();
      let songTypeId = [];
      if (pageQueryObj) {
        this.changeSongType(pageQueryObj.songTypeId);
      } else {
        this.changeSongType("-1");
      }
    },

    fetchTypeData() {
      this.typeList.push({ typeId: -1, typeName: "所有" });
      typeApi
        .getTypesAll()
        .then(response => {
          let resp = response.data;
          if (resp.code == 200) {
            resp.data.forEach(item => {
              this.typeList.push({
                typeId: item.typeId,
                typeName: item.typeName
              });
            });
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    changeSongType(val) {
      switch (val) {
        case "-1": //所有
          this.searchMap.typeId = [];
          break;
        default:
          this.searchMap.typeId = [val];
          break;
      }
      //每次点击歌曲类型标签时，总是显示每个标签的第一行数据
      this.songListCurpage = 1;

      //查询歌曲列表数据
      this.fetchMusicData();
    },

    formatterSongName(row, column) {
      let songName = row.songName;
      return songName.substring(0, songName.lastIndexOf("."));
    },

    fetchMusicData() {
      let self = this;
      let collection = getCollection();
      if (!collection) {
        //collection为空，则去后台查用户有多少个收藏夹
        let getgetSongListsByUserIdApi = musicApi.getgetSongListsByUserId();

        if (getgetSongListsByUserIdApi) {
          getgetSongListsByUserIdApi
            .then(response => {
              const resp = response.data;
              if (resp.flag) {
                saveCollection(resp.data);
                //再获取collection数据
                collection = getCollection();
                this.reload();
              }
            })
            .catch(error => {
              console.log("收藏夹为空", error);
            });
        }
      }

      //如果页面时默认的curpage和pageSize ，就使用localStore里的数据

      return new Promise((resolve, reject) => {
        musicApi
          .getMusicSearch(
            self.songListCurpage,
            self.songListPageSize,
            self.searchMap
          )
          .then(response => {
            const resp = response.data;

            self.songList = resp.data;
            self.songListTotalCount = resp.page.totalCount;
            resolve(resp);
          })
          .catch(error => {
            reject(error);
          });
      }).then(resp => {
        return new Promise((resolve, reject) => {
          if (collection) {
            musicApi
              .getSongListWithSongBy(collection)
              .then(response2 => {
                const resp2 = response2.data;
                const songIds = resp2.data;
                for (let i = 0; i < songIds.length; i++) {
                  for (let j = 0; j < resp.data.length; j++) {
                    if (songIds[i].songId == resp.data[j].songId) {
                      resp.data[j].isCollection = true;
                    }
                  }
                }

                self.songList = resp.data;
                self.songListTotalCount = resp.page.totalCount;

                resolve(true);
              })
              .catch(error => {
                reject(error);
              })
              .finally(() => {});
          }
        });
      });

      this.songList = self.songList;
      this.songListTotalCount = self.songListTotalCount;
    },

    handleSelect(key, keyPath) {},
    tableRowClassName({ row, rowIndex }) {
      let pageQueryObj = getPageQuery();
      if (
        (row.isPlay == true && rowIndex == this.index) ||
        (this.songTypeIndex === pageQueryObj.songTypeName &&
          rowIndex == this.index &&
          this.songListCurpage === pageQueryObj.songListCurpage)
      ) {
        //return "warning-row";
        return "current-row";
      } else {
        //return "success-row";
        return "warning-row";
      }
    },

    playMusic(index) {
      //跳转到播放音乐详情页面

      //先初始化，让所有的按钮和音乐回复原样
      // index = index ? index : 0;
      this.index = index;
      console.log("index: ", index);

      //保存当前音乐播放的状态信息
      if (this.index) {
        let currentType = this.typeList.filter(item => {
          return item.typeName == this.songTypeIndex;
        });

        let pageQueryObj = {
          songTypeName: this.songTypeIndex, //歌曲类型名称
          songTypeId: currentType[0].typeId, //歌曲类型id
          songListCurpage: this.songListCurpage,
          songListPageSize: this.songListPageSize,
          songIndex: this.index
        };
        savePageQuery(pageQueryObj);
      }

      this.GLOBAL_AUDIO.pause();
      let PlayButtoms = document.getElementsByClassName("main-play-buttom");

      for (let i = 0; i < PlayButtoms.length; i++) {
        PlayButtoms[i].setAttribute(
          "class",
          "main-play-buttom el-icon-video-play"
        );
      }

      let mainPlayButtom = document.getElementById("main-play-buttom" + index);

      let music = this.songList[index];

      if (this.currentIndex != index && music) {
        // 如果点击的音乐不是当前播放的音乐
        //添加歌曲历史
        // console.log("music: ", music);
        musicApi
          .addUserHistorySong(music.songId)
          .then(response => {
            let resp = response.data;
            if (resp.code == 200) {
            } else {
            }
          })
          .catch(error => {
            console.log(error);
          });

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
        // 如果点击的音乐是当前播放的音乐
        if (this.isPlay) {
          this.isPlay = !this.isPlay;
          this.GLOBAL_AUDIO.pause(); //暂停
          mainPlayButtom.setAttribute(
            "class",
            "main-play-buttom el-icon-video-play"
          );

          PubSub.publish("AppMusicToFooterPlay", false);
        } else {
          this.isPlay = !this.isPlay;
          this.GLOBAL_AUDIO.play();
          mainPlayButtom.setAttribute(
            "class",
            "main-play-buttom el-icon-video-pause"
          );
          PubSub.publish("AppMusicToFooterPlay", true);
        }
      }

      //修改当前播放音乐的下标
      this.currentIndex = index;

      //把当前播放的音乐数据保存到state中

      music.isPlay = this.isPlay;
      music.audio = this.GLOBAL_AUDIO;
      music.index = index;
      this.$store.dispatch("SaveMusic", music); //把当前播放的音乐保存到state中

      PubSub.publish("playMusicPubHall", music); //发布播放音乐这个事件

      //计数器清零;
      this.currentTime = 0;
      window.clearInterval(times);

      times = setInterval(() => {
        if (this.isPlay) {
          this.currentTime++;
        }
      }, 1000);

      // //显示歌词
      if (music.cyricUrl) {
        cyricApi
          .getAllCyricsByCyric(music.cyricUrl)
          .then(response => {
            let resp = response.data;
            let data = resp.data[0];

            let cyricContent = data.cyricContent;

            this.cyricContent = cyricContent;
            this.cyricStart = true;
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        this.cyricStart = false;
        this.cyricContent = "";
      }
    },

    downMusic(row) {
      // isCollection
      this.$message({
        message: "该功能正在开发中。。。",
        type: "warning"
      });
      return false;
    },

    collectionMusic(index, row) {
      //1.首先判断用户登录 ，没有登录，提示用户登录才可以收藏音乐
      if (!this.user) {
        this.$message({
          message: "登录成功后，才可以收藏音乐",
          type: "warning"
        });
        this.songListId == ""; //收藏夹ID重置
        return false;
      }

      // 1.1 用户登录则可以点击收藏，收藏按钮样式改变，并将该音乐添加都用户收藏列表中
      let mainCollectionButtom = document.getElementById(
        "main-collection-buttom" + index
      );

      //判断按钮的样式是否已收藏，如果未收藏，则收藏，
      //如已收藏，则让其取消收藏
      let cls = mainCollectionButtom.getAttribute("class");
      let collection = getCollection();

      if (cls.indexOf("el-icon-star-off") > -1) {
        //这个是未收藏

        if (this.songListId == "") {
          //没有选择收藏夹，则不继续执行
          return false;
        } else {
          this.selectCollectionVisible = false;
        }

        musicApi.addSongListWithSong(this.songListId, row).then(response => {
          const resp = response.data;
          if (resp.flag) {
            mainCollectionButtom.setAttribute(
              "class",
              "el-icon-star-on main-collection-buttom"
            );

            this.$message({
              message: "收藏成功",
              type: "success"
            });
          }
        });
      } else {
        //这个是已收藏

        //移除收藏
        musicApi.deleteSongListWithSong(collection, row).then(response => {
          const resp = response.data;
          if (resp.flag) {
            this.$message({
              message: "移除该歌曲的收藏成功",
              type: "success"
            });
            mainCollectionButtom.setAttribute(
              "class",
              "el-icon-star-off main-collection-buttom"
            );
          }
        });
      }
      this.songListId == ""; //收藏夹ID重置
    },

    handleSizeChangeMusicList(val) {
      this.songListPageSize = val;
      this.fetchMusicData();
    },

    handleCurrentChangeMusicList(val) {
      this.songListCurpage = val;
      this.fetchMusicData();
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    newCollection(formName) {
      this.$refs[formName].validate(vali => {
        if (vali) {
          musicApi
            .addUserWithSongList(this.newCollectionForm, this.user)
            .then(response => {
              const resp = response.data;
              if (resp.flag) {
                this.newCollectionVisible = false;
                //成功之后，应查询该用户所有的收藏夹，并保存到localStorage中

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
        }
      });
    },

    openSelectCollection(index, row) {
      this.selectCollectionVisible = true;
      this.collectionMusicData.index = index;
      this.collectionMusicData.row = row;
    },

    handleSelectionChangeCollection(index, row) {
      this.songListId = row.songListId;
      this.selectCollectionVisible = false;

      //上面的index，row是收藏夹的数据，而下面的是歌曲列表的数据，不要搞混了
      this.collectionMusic(
        this.collectionMusicData.index,
        this.collectionMusicData.row
      );
    },

    openNewCollection() {
      this.newCollectionVisible = true;
      this.selectCollectionVisible = false;
    },

    //下载客户端
    downClient() {
      window.location.href =
        "https://pb-20191014.oss-cn-beijing.aliyuncs.com/resources/other/PB%E9%9F%B3%E4%B9%9020200117.apk";
    },

    /**
     * 歌词解析
     * 解析后的歌词位于oLRC对象的ms数组中：
      oLRC.ms[i].t 是第i行歌词的时间，以秒计；
      oLRC.ms[i].c 是第i行歌词。
     */
    parseCyric(str) {
      //初始化
      oLRC.ms = [];

      let lrcs = []; //字符串数组，
      lrcs = str.split("\n");
      for (let l in lrcs) {
        lrcs[l] = lrcs[l].replace(/(^\s*)|(\s*$)/g, ""); //去除前后空格
        var t = lrcs[l].substring(
          lrcs[l].indexOf("[") + 1,
          lrcs[l].indexOf("]")
        ); //取[]间的内容
        var s = t.split(":"); //分离:前后文字
        if (isNaN(parseInt(s[0]))) {
          //不是数值
          for (var i in oLRC) {
            if (i != "ms" && i == s[0].toLowerCase()) {
              oLRC[i] = s[1];
            }
          }
        } else {
          //是数值
          var arr = lrcs[l].match(/\[(\d+:.+?)\]/g); //提取时间字段，可能有多个
          var start = 0;
          for (var k in arr) {
            start += arr[k].length; //计算歌词位置
          }
          var content = lrcs[l].substring(start); //获取歌词内容
          for (var k in arr) {
            var t = arr[k].substring(1, arr[k].length - 1); //取[]间的内容
            var s = t.split(":"); //分离:前后文字
            oLRC.ms.push({
              //对象{t:时间,c:歌词}加入ms数组
              t: (parseFloat(s[0]) * 60 + parseFloat(s[1])).toFixed(3),
              c: content
            });
          }
        }
      }

      oLRC.ms.sort(function(a, b) {
        //按时间顺序排序
        return a.t - b.t;
      });

      return oLRC;
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
    },

    //将时间转为秒： mm:ss ==> ss
    //  [00:02.00]  这里我们只比较前面2组数据，第三组数据我们不看
    timeFormatToSecond(str) {
      if (!str) return;
      str = str.substring(0, str.indexOf(".")); //去掉.以后的字符串
      let timeStrArr = str.split(":");
      let second = 0;
      if (timeStrArr.length === 3) {
        second =
          parseInt(timeStrArr[0]) * 3600 +
          parseInt(timeStrArr[1]) * 60 +
          parseInt(timeStrArr[2]);
      } else if (timeStrArr.length === 2) {
        second = parseInt(timeStrArr[0]) * 60 + parseInt(timeStrArr[1]);
      } else if (timeStrArr.length === 1) {
        second = parseInt(timeStrArr[0]);
      }
      return second;
    }
  },

  //vue销毁之前的时候调用
  beforeDestroy() {},

  computed: {
    listenIsPlay() {
      return this.$store.state.music.isPlay;
    }
  },

  watch: {
    listenIsPlay(newVal) {
      this.isPlay = newVal;
    },

    $route: function(newVal, oldVal) {
      console.log("$route.path", oldVal);

      // this.$store.dispath(
      //   "saveAudioName",
      //   this.songList[this.currentIndex].songName
      // );
      // this.$store.dispath("saveMusicCyricContent", this.cyricContent);
      // console.log("this.cyricContent: ", this.cyricContent);
    }
  }
};
</script>

<style scoped type="less">
.clear:after {
  clear: both;
  display: block;
  content: "";
}

.mod_index-hot {
  text-align: center;
  /* background-color: #333; */
  margin: 0;
  padding: 0;
}

.guanggao {
  /* 广告栏 */
  position: fixed;
  background-color: wheat;
  width: 180px;
  height: 180px;
  top: 33px;
  left: 19px;
  z-index: 99;
  border-radius: 13px;
}

.guanggao .logo {
  display: block;
  margin: 9px auto 0;
}

.guanggao .logo .title {
  position: relative;
  top: -22px;
  left: 8px;
  font-weight: bold;
  font-size: 21px;
}

.guanggao .tip {
  display: block;
  margin: 9px auto 0;
}
.guanggao .el-button--primary {
  display: block;
  margin: 9px auto 0;
}

.adver >>> .el-carousel--horizontal {
  overflow-x: initial;
}

.mod_index-hot .left {
  width: 60vw;
  float: left;
}

.left >>> .el-radio-group input {
  /* color: #fff; */
}

/* .left >>> .el-radio-group span,
.left >>> .el-radio-button__orig-radio span {
  border: 1px solid rgba(150, 150, 150, 0.5);
  color: #fff;
} */

.mod_index-hot .right /deep/ .cyricContent {
  width: 26vw;
  float: left;
  color: #829194;
  font-size: 24px;
  text-align: center;
  vertical-align: middle;
  margin-top: 102px;
  line-height: 44px;
  max-height: 522px;
  /* overflow: hidden; */
  overflow-y: auto;
  max-width: 738px;
  margin-left: 221px;
  padding-left: 28px;
}

.isSelect {
  color: #31c27c;
}

.isCyricFollow {
  margin-left: 27px;
}

.playlist__item_box {
  height: 250px;
  display: inline-block;
  text-align: center;
}

/* .playlist__item_box {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.playlist__cover {
  position: relative;
  display: block;
  overflow: hidden;
  padding-top: 100%;
  margin-bottom: 15px;
} */

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

.main-collection-buttom {
  margin-left: 40px;
  font-size: 30px;
}

.el-dialog_selectCollection .el-table {
  /* background-color: red; */
  margin-left: 0px;
  margin-top: -42px;
}

.songListTable >>> table {
  /* background-color: #333; */
}

.songListTable >>> .el-table__body tr.current-row > td {
  background-color: rgba(65, 188, 228, 0.5);
}

/** 这个时用来覆盖current-row 这个样式的背景颜色 */
.songListTable >>> .warning-row > td {
  background-color: white !important;
}

@media screen and (max-width: 448px) {
  .el-pagination {
    margin-top: 2vh;
  }
}

/* 手机屏幕的字体大小 */
@media screen and (max-width: 1500px) and (min-width: 448px) {
  .songListTable {
    height: 40vh !important;
    margin-left: 2vw;
  }

  .songListTable >>> .cell {
    font-size: 24px;
  }

  .songListTable >>> .el-icon-video-play,
  .songListTable >>> .el-icon-video-pause,
  .songListTable >>> .el-icon-download,
  .songListTable >>> .main-collection-buttom {
    font-size: 37px;
  }

  .pagination >>> .el-pagination__total,
  .pagination >>> .el-pagination .el-input__inner,
  .pagination >>> ul > li {
    font-size: 26px;
  }
}
</style>
