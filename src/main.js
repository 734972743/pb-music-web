import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "@/store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
//这个是log 图形插件
//var figlet = require("figlet");

import { NobugLog } from "./log/NobugLog";
import global from "@/utils/global_variable.js";

//日志教学 https://blog.csdn.net/qq_28817739/article/details/80451755

//Vue.config.productionTip = false;
Vue.config.productionTip = process.env.NODE_ENV === "production";

// console.log("SERVER_URL", process.env.VUE_APP_BASE_SERVER_URL);
// console.log("MUSI_BASEURL", process.env.VUE_APP_MUSI_BASEURL);

// figlet("www.panbang123.com", function(err, data) {
//   if (err) {
//     console.log("Something went wrong...");
//     console.dir(err);
//     return;
//   }
//   console.log(data);
// });

NobugLog();

Vue.use(ElementUI);

//引入全局变量配置文件
//教学网页： https://blog.csdn.net/qq_30669833/article/details/81706217
//使用的的方式: this.变量名
Vue.use(global);

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
