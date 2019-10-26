<template>
  <div>
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

<style  scoped>
.header {
  position: absolute;
  height: 80px;
  left: 350px;
  right: 350px;
  margin: 10px auto;
  overflow-x: hidden;
  /* background-color: red; */
}
.main {
  position: absolute;
  height: 800px;
  width: 1202px;
  top: 90px;
  left: 352px;
  right: 0px;
  overflow-y: auto;
  overflow-x: hidden;
  /* background-color: aqua; */
}

.footer {
  position: absolute;
  top: 880px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background-color: #6a48d7;
  overflow-x: hidden;
  overflow-y: hidden;
}
</style>