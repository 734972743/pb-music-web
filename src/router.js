import Vue from "vue";
import Router from "vue-router";

import Layout from "./components/Layout";
import Hall from "./views/hall";
import AppMusic from "./views/hall/AppMusic";

import MyMusic from "./views/MyMusic";
import MyLikeMusic from "./components/MyMusicMain/MyLikeMusic.vue";
import myMusicHistory from "./views/MyMusic/MyMusicHistory";
import MyCreateSongList from "./views/MyMusic/MyCreateSongList";
import MyUploadSong from "./views/MyMusic/MyUploadSong";

import VIP from "./views/VIP";

Vue.use(Router);

//下面的代码是为了解决
//解决vue中的NavigationDuplicated {_name: "NavigationDuplicated", name: "NavigationDuplicated"}问题

const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "layout",
      component: Layout,
      redirect: "/hall",
      children: [
        {
          path: "/hall",
          name: "hall",
          component: Hall,
          children: [
            {
              path: "/hall/music",
              name: "music",
              component: AppMusic
            }
          ]
        },
        {
          path: "/myMusic",
          name: "myMusic",
          component: MyMusic,
          redirect: "/myMusic/myLikeMusic",
          children: [
            {
              path: "/myMusic/myLikeMusic",
              name: "myLikeMusic",
              component: MyLikeMusic
            },
            {
              path: "/myMusic/myMusicHistory",
              name: "myMusicHistory",
              component: myMusicHistory
            },
            {
              path: "/myMusic/myCreateSongList",
              name: "myCreateSongList",
              component: MyCreateSongList
            },
            {
              path: "/myMusic/myUploadSong",
              name: "myUploadSong",
              component: MyUploadSong
            }
          ]
        },
        {
          path: "/vip",
          name: "vip",
          component: VIP
        }
      ]
    }
  ]
});
