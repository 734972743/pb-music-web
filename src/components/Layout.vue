<!--
 * @Author: your name
 * @Date: 2019-12-20 16:08:47
 * @LastEditTime: 2020-05-07 15:35:47
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\components\Layout.vue
 -->
<template>
  <div class="app">
    <app-header></app-header>
    <app-main></app-main>
    <app-footer></app-footer>
  </div>
</template>

<script>
import AppHeader from "./AppHeader";
import AppMain from "./AppMain";
import AppFooter from "./AppFooter";

export default {
  components: {
    AppHeader,
    AppMain,
    AppFooter
  }
};
</script>

<style scoped>
/**
      1vw等于视口宽度的1%。

      2.vh：1vh等于视口高度的1%。

      3.vmin：选取vw和vh中最小的那个。

      4.vmax：选取vw和vh中最大的那个。
 */

.header {
  position: relative;
  height: 8.5vh;
  margin-left: 18.2vw;
  margin-right: 18.2vw;
  /* margin: 10px auto;
  overflow-x: hidden;
  /* background-color: red; */
}
.main {
  position: relative;
  height: auto;
  width: 62.6vw;

  margin-left: 18.33vw;
  margin-right: 0px;
  /* top: 12vh;
  */
  overflow-y: hidden;
  overflow-x: hidden;
}

.footer {
  position: relative;
  margin-top: 10px;
  height: 15vh;
  background-color: #6a48d7;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>
