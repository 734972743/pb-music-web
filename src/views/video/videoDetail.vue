<!--
 * @Author: your name
 * @Date: 2020-01-11 23:52:15
 * @LastEditTime: 2020-05-14 16:12:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\views\video\videoDetail.vue
 -->
<template>
  <div>
    <i @click="toBack" class="el-icon-back toBack">返回</i>
    <div class="videoName">{{ video && video.videoName }}</div>
    <video :src="video && video.videoUrl" controls="controls">
      您的浏览器不支持 video 标签。
    </video>
    <div class="videoIntroduce">{{ video && video.videoIntroduce }}</div>
  </div>
</template>

<script>
import videoApi from "@/api/video";
export default {
  data() {
    return {
      searchMap: {
        videoName: "",
        id: ""
      },
      video: null
    };
  },
  created() {
    this.searchMap.id = this.$route.params.id;
    console.log("this.searchMap", this.searchMap);
    this.fetchData();
  },

  methods: {
    fetchData() {
      videoApi
        .getVideosBy(this.searchMap)
        .then(response => {
          let resp = response.data;
          console.log("resp", resp);
          if (resp.code == 200) {
            this.video = resp.data[0];
            let videoUrl = this.video.videoUrl;
            if (videoUrl.indexOf(".html") > -1) {
              // 1、window.location.href=URL ： 在本窗体打开一个新的页面，也是最常用的一种方法；
              // 2、window.open(URL)  ：  在一个新的窗口打开一个新的页面；
              // 3、location.replace(URL) ：本窗口的页面被替换为一个新的页面URL，替换后不可以回退到上个页面；
              // 4、localtion.assign(URL) ：本窗口的页面转为为一个新的页面URL，与上一方法类似，但此方法可回退至上一页面。
              //window.location.href = videoUrl;
              window.open(videoUrl);
              this.toBack();
            }
          }
        })
        .catch(error => {
          console.log(error);
        });
    },

    //返回
    toBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.toBack {
  float: left;
  font-size: 36px;
  font-weight: bold;
  margin-left: 26px;
}

.videoName {
  margin-top: 20px;
  text-align: center;
  margin-bottom: 20px;
}
video {
  width: 813px;
  height: 490px;
  clear: both;
  display: block;
  margin: auto;
}

.videoIntroduce {
  margin-top: 30px;
  text-align: center;
}
</style>
