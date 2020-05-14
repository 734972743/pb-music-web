/*
 * @Author: your name
 * @Date: 2020-05-14 14:35:38
 * @LastEditTime: 2020-05-14 15:57:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\api\type.js
 */
import request from "@/utils/request";
import store from "@/store";

export default {
  getTypesAll() {
    return request({
      url: `/type/getTypesBy`,
      method: "POST",
      data: {
        fatherTypeId: 1
      }
    });
  }
};
