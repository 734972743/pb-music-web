<!--
 * @Author: your name
 * @Date: 2020-05-07 13:18:39
 * @LastEditTime: 2020-05-07 16:51:46
 * @LastEditors: Please set LastEditors
 * @Description: 这个页面时用来加载广告用的
 * @FilePath: \home\pb-music\src\components\Advertisement\index.vue
 -->
<template>
  <div class="adver">
    <!-- 广告轮播图 -->
    <el-carousel :interval="8000" type="card" heigh="10px" arrow="always">
      <el-carousel-item v-for="item in adverList" :key="item.url">
        <a :href="item.url" target="_blank"><img :src="item.image"/></a>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
import music11 from "@/assets/music11.jpg";
import novel41 from "@/assets/novel41.jpg";
import message41 from "@/assets/message41.jpg";

export default {
  name: "Advertisement",

  data() {
    return {
      adverList: [
        {
          title: "PB音乐",
          url: "http://www.panbang123.com",
          image: music11
        },
        {
          title: "PB小说",
          url: "http://www.panbang123.com:8803",
          image: novel41
        },
        {
          title: "祝福短信",
          url: "http://message.panbang123.com",
          image: message41
          //   image: "@/assets/music11.jpg"
        }
      ]
    };
  }
};
</script>

<style scoped>
.el-carousel__item img {
  color: #475669;
  font-size: 18px;
  margin: 0;
  height: 278px;
  width: 602px;
}

/*
vue 中组件样式修改不了，可以试着用>>> 来穿透样式
*/
.adver >>> .el-carousel__container {
  height: 266px !important;
}
</style>
