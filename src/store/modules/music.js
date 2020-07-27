/*
 * @Author: your name
 * @Date: 2019-12-20 16:08:47
 * @LastEditTime: 2020-06-25 23:40:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \home\pb-music\src\store\modules\music.js
 */
const music = {
  state: {
    music: null, //这个是用来存放当前播放的音乐（一首音乐）
    isPlay: false,
    searchTitle: "", //这个是用户搜索的歌名
    selectMusicBtn: "left", //这个是底下（footer组件）选择点击哪个按钮 值有："left,right"
    audioName: "", //当前播放的音乐
    currentTime: 0, //当前播放的时间
    musicCyricContent: "", //当前播放的歌曲的歌词
  },

  getters: {
    getMusic: (state) => {
      return state.music;
    },
  },

  mutations: {
    SET_MUSIC(state, music) {
      state.music = music;
      state.music.isPlay = music.isPlay;
      state.music.audioName = music.audioName;
      state.music.currentTime = music.currentTime;
      // state.music.musicCyricContent = music.currentTime;
    },

    SET_IS_PLAY(state, isPlay) {
      state.isPlay = isPlay;
    },

    SET_SEARCH_TITLE(state, searchTitle) {
      state.searchTitle = searchTitle;
    },

    SET_AUDIO_NAME(state, audioName) {
      state.audioName = audioName;
    },

    SET_MUSIC_CYRIC_CONTENT(state, cyricContent) {
      state.musicCyricContent = cyricContent;
    },
  },

  actions: {
    SaveMusic({ commit }, music) {
      commit("SET_MUSIC", music);
    },

    SaveIsPlay({ commit }, isPlay) {
      commit("SET_IS_PLAY", isPlay);
    },

    saveSearchTitle({ commit }, title) {
      commit("SET_SEARCH_TITLE", title);
    },

    //SearchMusic({ commit }, song) {}

    saveAudioName({ commit }, audioName) {
      commit("SET_AUDIO_NAME", audioName);
    },

    //保存歌词
    saveMusicCyricContent({ commit }, cyricContent) {
      commit("SET_MUSIC_CYRIC_CONTENT", cyricContent);
    },
  },
};

export default music;
