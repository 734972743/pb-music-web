<template>
  <div class="my-music-header">
    <div class="header-imager">
      <span class="headSculptureUrl">
        <img
          v-show="user && user.headSculptureUrl"
          :src="user && user.headSculptureUrl"
          alt=""
        />
      </span>
      <div class="my-music-header-username">{{ user && user.userName }}</div>
    </div>

    <!--  :default-active="$route.path"  解决页面刷新后，导航无法高亮显示的问题 -->
    <el-menu
      :router="true"
      :default-active="$route.path"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#fff"
      active-text-color="#ffd04b"
    >
      <el-menu-item index="/myMusic/myLikeMusic">我喜欢</el-menu-item>
      <el-menu-item index="/myMusic/myMusicHistory">收听历史</el-menu-item>
      <el-menu-item index="/myMusic/myCreateSongList"
        >我创建的歌单</el-menu-item
      >
      <el-menu-item index="/myMusic/myUploadSong">我上传的歌曲</el-menu-item>
    </el-menu>
  </div>
</template>

<script>
export default {
  inject: ["reload"], //注入依赖， 这个依赖在App.vue中定义了
  data() {
    return {
      activeIndex: "/myMusic/ILike",
      user: this.$store.state.user.user
    };
  },
  methods: {
    handleSelect(key, keyPath) {}
  }
};
</script>

<style  scoped>
.my-music-header {
  background: url("../../assets/bg_profile.jpg");
  /* background-color: aquamarine; */
  height: 330px;
}
.header-imager {
  margin-left: 533px;
}

.header-imager img {
  margin-top: 47px;
  width: 110px;
  height: 110px;
  border-radius: 53px;
}

.header-imager .my-music-header-username {
  position: relative;
  margin-left: 23px;
  margin-top: 8px;
  color: aliceblue;
  font-size: 25px;
  font-family: "微软雅黑";
}

.el-menu {
  margin-top: 80px;
}
</style>