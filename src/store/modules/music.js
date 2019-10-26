const music = {
  state: {
    music: null, //这个是用来存放当前播放的音乐（一首音乐）
    isPlay: false,
    searchTitle: "", //这个是用户搜索的歌名
    selectMusicBtn: "left" //这个是底下（footer组件）选择点击哪个按钮 值有："left,right"
  },

  getters: {
    getMusic: state => {
      return state.music;
    }
  },

  mutations: {
    SET_MUSIC(state, music) {
      state.music = music;
      state.isPlay = music.isPlay;
    },

    SET_IS_PLAY(state, isPlay) {
      state.isPlay = isPlay;
    },

    SET_SEARCH_TITLE(state, searchTitle) {
      state.searchTitle = searchTitle;
    }
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
    }

    //SearchMusic({ commit }, song) {}
  }
};

export default music;
