/*
 * @Author: your name
 * @Date: 2019-12-20 16:08:47
 * @LastEditTime: 2020-06-05 16:50:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\utils\global_variable.js
 */

const GLOBAL_AUDIO = new Audio();

export default {
  //// Vue.js的插件应当有一个公开方法 install。这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。
  install: function(Vue) {
    Vue.prototype.GLOBAL_AUDIO = GLOBAL_AUDIO;
  },
};
