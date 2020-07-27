<!--
 * @Author: your name
 * @Date: 2019-12-20 16:08:47
 * @LastEditTime: 2020-06-25 23:16:57
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\views\video\index.vue
 -->
<template>
  <div class="videoWindow">
    <!-- 列表 -->
    <div class="videoList">
      <div class="imglist-item" v-for="(video, index) in videoList" :key="video.id" @click="goToVideoDetail(video)">
        <!-- :class="(index + 1) % 4 !== 0 ? 'videoDiv' : ''"> -->
        <img :src="video.videoImageUrl" alt="" />
        <p class="videoName">{{ video.videoName }}</p>
      </div>
    </div>
    <div></div>
    <!-- 列表分页 -->
    <el-pagination class="fenye" @size-change="handleSizeChangeVideoList" @current-change="handleCurrentChangeVideoList"
      :current-page="curpage" :page-sizes="[12, 24, 60, 120]" :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper" :total="total">
    </el-pagination>
  </div>
</template>

<script>
import videoApi from "@/api/video";
const PubSub = require("pubsub-js");

export default {
  data() {
    return {
      videoList: [],
      searchMap: {
        videoName: "",
        id: ""
      },
      pageSize: 12,
      pagerCount: 11,
      total: 0,
      curpage: 1
    };
  },

  created() {
    this.fetchData();
    PubSub.subscribe("searchVideoPubSub", (event, title) => {
      this.searchMap.videoName = title;
      this.fetchData();
    });
  },

  methods: {
    fetchData() {
      videoApi
        .queryListPage(this.curpage, this.pageSize, this.searchMap)
        .then(response => {
          let resp = response.data;
          this.videoList = resp.data;
          this.total = resp.page.totalCount;
        });
    },

    goToVideoDetail(video) {
      console.log("video", video);
      let id = video.id;
      //路由跳转并到参数  push使用的是path,那么参数就要使用query ,接受也要用quary
      this.$router.push({ path: `/video/videoDetail/${id}` });
    },
    handleSizeChangeVideoList(val) {
      this.pageSize = val;
      this.fetchData();
    },
    handleCurrentChangeVideoList(val) {
      this.curpage = val;
      this.fetchData();
    }
  }
};
</script>

<style scoped>
.videoWindow {
  margin: 0px;
  padding: 0px;
}

.videoList {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(4, 1fr);
  justify-items: center;
}

.main-play-buttom {
  font-size: 26px;
}

.videoDiv {
  float: left;
  display: inline;
  /* margin-top: 10px; */
}

.imglist-item {
  margin-left: 10px;
}

.imglist-item img {
  width: 331px;
  height: 190px;
  margin-top: 10px;
  margin-left: 30px;
}

.imglist-item .videoName {
  text-align: center;
}

.videoDiv .videoName {
  text-align: center;
}

.fenye {
  margin-left: 316px;
  margin-bottom: 5px;
}
</style>
