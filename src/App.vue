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
      this.$nextTick(() => {
        this.isRouterAlive = true;
      });
    }
  }
};
</script>

<style >
body {
  margin: 0px;
  padding: 0px;
  font-family: "微软雅黑";
}
</style>
