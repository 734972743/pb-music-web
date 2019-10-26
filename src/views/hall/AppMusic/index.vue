<template>
  <!-- 热门歌曲 -->
  <div class="mod_index-hot">
    <div></div>
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

    <!--    歌曲列表   -->
    <el-radio-group v-model="songTypeIndex" @change="changeSongType">
      <el-radio-button label="所有"></el-radio-button>
      <el-radio-button label="新歌"></el-radio-button>
      <el-radio-button label="热门歌曲"></el-radio-button>
      <el-radio-button label="纯音乐"></el-radio-button>
      <el-radio-button label="曲艺"></el-radio-button>
    </el-radio-group>

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

          <i
            @click="openSelectCollection(scope.$index, scope.row)"
            :id="'main-collection-buttom' + scope.$index"
            class="el-icon-star-off main-collection-buttom"
            v-else
          ></i>
        </template>
      </el-table-column>
    </el-table>

    <!--    歌曲列表分页   -->
    <el-pagination
      @size-change="handleSizeChangeMusicList"
      @current-change="handleCurrentChangeMusicList"
      :current-page="songListCurpage"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="songListPageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="songListTotalCount"
    >
    </el-pagination>

    <!--    个性化推荐   -->

    <!--    新建收藏夹弹出框   -->
    <el-dialog
      title="新建收藏夹"
      :visible.sync="newCollectionVisible"
      class="el-dialog_1"
      width="400px"
    >
      <el-form
        :model="newCollectionForm"
        status-icon
        :rules="rulesNewCollection"
        ref="newCollectionForm"
        label-width="100px"
      >
        <el-form-item label="收藏夹名称" prop="collectionName">
          <el-input
            v-model="newCollectionForm.collectionName"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item label="收藏夹简介" prop="introduce">
          <el-input
            v-model="newCollectionForm.introduce"
            autocomplete="off"
            type="textarea"
          ></el-input>
        </el-form-item>

        <el-form-item label="是否公开" prop="songListStateId">
          <el-radio v-model="newCollectionForm.songListStateId" label="0"
            >是</el-radio
          >
          <el-radio
            v-model="newCollectionForm.songListStateId"
            label="1"
            disabled
            >否(vip)</el-radio
          >
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="newCollection('newCollectionForm')"
            >新建</el-button
          >
          <el-button @click="resetForm('newCollectionForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--    点击收藏按钮选择弹出哪个收藏夹   -->
    <el-dialog
      :visible.sync="selectCollectionVisible"
      title="选择一个歌单"
      class="el-dialog_selectCollection"
      width="300px"
      style="left:993px; top:200px;"
    >
      <el-table
        :data="collectionList"
        style="width: 100%"
        :row-class-name="tableRowClassName"
        height="400"
      >
        <el-table-column prop="songListName" label="歌单" width="180">
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              @click="handleSelectionChangeCollection(scope.$index, scope.row)"
              >选择</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <el-button
        type="primary"
        icon="el-icon-folder-add"
        @click="openNewCollection()"
        >添加到新歌单</el-button
      >
    </el-dialog>
  </div>
</template>

<script>
import musicApi from "@/api/music";

//let audio = new Audio();

const PubSub = require("pubsub-js");

import { saveCollection, getCollection } from "@/utils/auth.js";

export default {
  inject: ["reload"], //注入依赖， 这个依赖在App.vue中定义了
  data() {
    return {
      user: null, //用户信息
      typeList: [],
      activeIndex: "/newSong",
      songTypeIndex: "所有",
      currentPage: 1,
      pageSize: 5,
      searchMap: {
        songName: "",
        typeId: ""
      },

      //下面的是歌曲列表的配置
      songList: [],
      songListTotalCount: 0, //总记录数
      songListCurpage: 1, //当前页
      songListPageSize: 10, //每页显示的条数
      isPlay: false, //是否播放,
      index: 0, //歌曲所在行的下标
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
      }
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

    this.initData();
    this.fetchMusicData();

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
    //初始化数据
    initData() {
      this.user = this.$store.state.user.user;
    },

    changeSongType(val) {
      switch (val) {
        case "所有":
          this.searchMap.typeId = "";
          break;
        case "新歌":
          this.searchMap.typeId = 1;
          break;
        case "热门歌曲":
          this.searchMap.typeId = 2;
          break;
        case "纯音乐":
          this.searchMap.typeId = 10;
          break;
        case "曲艺":
          this.searchMap.typeId = 13;
          break;
      }
      this.fetchMusicData();
    },

    formatterSongName(row, column) {
      let songName = row.songName;
      return songName.substring(0, songName.lastIndexOf("."));
    },

    fetchTypeData() {
      this.typeList = [];
      musicApi.getTypeListSearch(1, 10, {}).then(response => {
        const resp = response.data;
        let i = 1;
        resp.data.rows.forEach(element => {
          if (i <= 5) {
            this.typeList.push(element);
            i++;
          } else {
            return true;
          }
        });
      });
    },

    fetchMusicData() {
      let collection = getCollection();
      if (!collection) {
        //collection为空，则去后台查用户有多少个收藏夹
        musicApi.getgetSongListsByUserId().then(response => {
          const resp = response.data;
          if (resp.flag) {
            saveCollection(resp.data);
            //再获取collection数据
            collection = getCollection();
            this.reload();
          }
        });
      }
      musicApi
        .getMusicSearch(
          this.songListCurpage,
          this.songListPageSize,
          this.searchMap
        )
        .then(response => {
          const resp = response.data;

          musicApi.getSongListWithSongBy(collection).then(response => {
            const resp2 = response.data;
            const songIds = resp2.data;
            for (let i = 0; i < songIds.length; i++) {
              for (let j = 0; j < resp.data.length; j++) {
                if (songIds[i].songId == resp.data[j].songId) {
                  resp.data[j].isCollection = true;
                }
              }
            }

            this.songList = resp.data;
            this.songListTotalCount = resp.page.totalCount;
          });
        });
    },
    handleSelect(key, keyPath) {},
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

                musicApi.getgetSongListsByUserId().then(response => {
                  const resp = response.data;
                  if (resp.flag) {
                    saveCollection(resp.data);
                    this.reload();
                  }
                });
              }
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

      if (this.isPlay) {
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

<style  scoped>
.mod_index-hot {
  text-align: center;
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
</style>