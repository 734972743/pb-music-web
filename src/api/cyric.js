/*
 * @Author: your name
 * @Date: 2020-06-05 18:32:53
 * @LastEditTime: 2020-06-05 18:35:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\api\cyric.js
 */

import request from "@/utils/request";
import store from "@/store";

const userStore = store.state.user.user;

export default {
  getAllCyricsByCyric(id) {
    return request({
      url: `/cyric/getAllCyricsByCyric`,
      method: "post",
      data: {
        id,
      },
    });
  },
};
