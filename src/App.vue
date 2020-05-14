<!--
 * @Author: your name
 * @Date: 2019-10-13 13:23:44
 * @LastEditTime: 2020-05-07 15:28:18
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\App.vue
 -->
<template>
  <div id="app">
    <!-- 这个App.vue 中一定要有这个router-view组件，否则不能进行渲染  -->
    <router-view v-if="isRouterAlive" />
  </div>
</template>

<script>
export default {
  provide() {
    return {
      reload: this.reload
    };
  },
  data() {
    return {
      isRouterAlive: true //是否控制页面加载
    };
  },

  methods: {
    //页面重新加载
    reload() {
      this.isRouterAlive = false;
      this.$nextTick(function() {
        this.isRouterAlive = true;
      });
    }
  }
};
</script>

<style>
body {
  margin: 0px;
  padding: 0px;
  font-family: "微软雅黑";
  overflow-y: auto;
}
</style>
