import request from "@/utils/request";
import store from "@/store";
//import { getUser } from "@/utils/auth";

const userStore = store.state.user.user;
//let userStore = getUser();

export default {
  getTypeListSearch(page, size, searchMap) {
    return request({
      url: `/type/queryListPage/${page}/${size}`,
      method: "post",
      data: {
        searchMap
      }
    });
  },

  getMusicSearch(page, size, searchMap) {
    let typeIds = [];
    searchMap.typeId.forEach(id => {
      typeIds.push(id);
    });
    typeIds.push();
    return request({
      url: `/song/queryListPage/${page}/${size}`,
      method: "post",
      data: {
        songName: searchMap.songName,
        searchTypeIds: typeIds
      }
    });
  },

  //收藏音乐的api

  //根据当前用户ID去查自己是否有收藏列表
  getUserWithSongListSearch() {
    return request({
      url: `/userWithSongList/getUserWithSongListsBy`,
      method: "post",
      data: {
        userId: userStore.userId
      }
    });
  },

  //这个是给用户添加收藏夹
  addUserWithSongList(newCollectionForm, user) {
    return request({
      url: `/userWithSongList/addUserWithSongList`,
      method: "post",
      data: {
        collectionName: newCollectionForm.collectionName,
        introduce: newCollectionForm.introduce,
        songListStateId: newCollectionForm.songListStateId,
        userId: user.userId - 0
      }
    });
  },

  //根据收藏夹ID来删除收藏夹
  deleteUserWithSongList(collection) {
    const userId = userStore.userId;
    return request({
      url: `/userWithSongList/deleteUserWithSongList/${collection.songListId}/${userId}`,
      method: "delete"
    });
  },

  //根据当前收藏夹ID去查当前收藏夹里面的所有的歌曲
  getSongListWithSongBy(collection) {
    return request({
      url: `/songListWithSong/getSongListWithSongBy`,
      method: "post",
      data: {
        songListId: collection.collectionId
      }
    });
  },

  //这个是收藏夹添加歌曲的
  addSongListWithSong(collectionId, music) {
    return request({
      url: `/songListWithSong/addSongListWithSong`,
      method: "post",
      data: {
        songListId: collectionId,
        songId: music.songId
      }
    });
  },

  //这个是取消收藏夹
  deleteSongListWithSong(collection, music) {
    return request({
      url: `/songListWithSong/deleteSongListWithSong`,
      method: "delete",
      data: {
        songListId: collection.collectionId,
        songId: music.songId
      }
    });
  },

  //根据用户ID来查询自己收藏的歌曲信息
  getCollectionSongByUserId() {
    const userId = userStore.userId;
    return request({
      url: `/song/getCollectionSongByUserId/${userId}`,
      method: "get"
    });
  },

  //根据用户ID来获取所有的收藏夹信息
  getgetSongListsByUserId() {
    if (userStore) {
      const userId = userStore.userId;
      return request({
        url: `/songList/getgetSongListsByUserId/${userId}`,
        method: "get"
      });
    }
  },

  //根据用户ID来查询自己收听过的歌曲历史信息
  getUserHistorySongsByUserId() {
    if (userStore) {
      const userId = userStore.userId;
      return request({
        url: `/userHistorySong/getUserHistorySongsByUserId/${userId}`,
        method: "get"
      });
    }
  },

  //添加自己收听的歌曲
  addUserHistorySong(songId) {
    if (userStore) {
      const userId = userStore.userId;
      return request({
        url: `/userHistorySong/addUserHistorySong`,
        method: "post",
        data: {
          userId: userId,
          songs: [
            {
              songId: songId
            }
          ]
        }
      });
    }
  },

  //根据收藏夹ID来查询所有歌曲列表
  getSongListBySongListId(songListId) {
    return request({
      url: `/song/getSongListBySongListId/${songListId}`,
      method: "get"
    });
  },

  //根据用户ID来清空他所有的历史记录
  deleteAllHistorySongByUserId() {
    const userId = userStore.userId;
    return request({
      url: `/userHistorySong/deleteAllHistorySongByUserId/${userId}`,
      method: "delete"
    });
  },

  //获取所有的音频类型
  getTypesAll() {
    return request({
      url: "/type/getTypesAll",
      method: "get"
    });
  },

  //添加音乐
  addSong(song) {
    return request({
      url: `/song/addSong/${song.singerName}`,
      method: "post",
      data: {
        songName: song.songName,
        typeId: song.typeId
      }
    });
  }
};
