const GLOBAL_AUDIO = new Audio();

export default {
  //// Vue.js的插件应当有一个公开方法 install。这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。
  install: function(Vue) {
    Vue.prototype.GLOBAL_AUDIO = GLOBAL_AUDIO;
  }
};
