/*
 * @Author: your name
 * @Date: 2020-01-11 23:06:37
 * @LastEditTime : 2020-01-17 16:56:29
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\api\video.js
 */
import request from "@/utils/request";

export default {
  getVideosBy(video) {
    let videoName = video.videoName ? video.videoName : "";
    let id = video.id ? video.id : "";
    return request({
      url: `/video/getVideosBy`,
      method: "post",
      data: {
        videoName: videoName,
        id: id - 0
      }
    });
  },

  //根据条件查询并带分页效果
  queryListPage(page, size, searchMap) {
    let videoName = searchMap.videoName ? searchMap.videoName : "";
    let id = searchMap.id ? searchMap.id : "";
    return request({
      url: `/video/queryListPage/${page}/${size}`,
      method: "post",
      data: {
        videoName: videoName,
        id: id - 0
      }
    });
  }
};
