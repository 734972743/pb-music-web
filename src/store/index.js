import Vue from "vue";
import Vuex from "vuex";
import user from "./modules/user";
import music from "./modules/music";

Vue.use(Vuex);

//进行模块化
const store = new Vuex.Store({
  modules: {
    user,
    music
  }
});
console.log("--store", store);
export default store;
