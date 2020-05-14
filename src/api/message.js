import request from "@/utils/request";
import store from "@/store";

const userStore = store.state.user.user;

export default {
  getCountBySongId(songId) {
    return request({
      url: `/message/getCountBySongId/${songId}`,
      method: "get"
    });
  },

  getMessagesBySongId(songId, curPage, pageSize) {
    return request({
      url: `/message/getMessagesBySongId/${songId}/${curPage}/${pageSize}`,
      method: "get"
    });
  },

  replyMessage(message) {
    return request({
      url: "/message/replyMessage",
      method: "post",
      data: {
        songId: message.songId,
        content: message.content,
        userId: userStore.userId
      }
    });
  }
};
