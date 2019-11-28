<template>
  <div>
    <div v-if="user">
      <my-music-header></my-music-header>
      <my-music-main></my-music-main>
    </div>
    <div v-else>
      <div class="music_bg">
        <p>我的音乐空间,请登录</p>
      </div>
    </div>
  </div>
</template>

<script>
import { getUser } from "@/utils/auth";
import MyMusicHeader from "../../components/MyMusicHeader";
import MyMusicMain from "../../components/MyMusicMain";

export default {
  components: {
    MyMusicHeader,
    MyMusicMain
  },
  data() {
    return {
      user: getUser()
    };
  },

  methods: {
    openLogin() {}
  }
};
</script>

<style  scoped>
.music_bg {
  text-align: center;
  height: 345px;
  background-image: url("../../assets/music_bg2.jpg");
}

.music_bg p {
  position: relative;
  color: white;
  padding-top: 63px;
}
</style>