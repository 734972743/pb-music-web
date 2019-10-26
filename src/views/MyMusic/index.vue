<template>
  <div>
    <my-music-header></my-music-header>
    <my-music-main></my-music-main>
  </div>
</template>

<script>
import MyMusicHeader from "../../components/MyMusicHeader";
import MyMusicMain from "../../components/MyMusicMain";

export default {
  components: {
    MyMusicHeader,
    MyMusicMain
  }
};
</script>

<style  scoped>
</style>