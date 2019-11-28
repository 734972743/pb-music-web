import { saveUser, getUser, removeUser, removeCollection } from "@/utils/auth";
import userApi from "@/api/user";

const user = {
  state: {
    user: getUser(),
    count: 1
  },

  mutations: {
    SET_USER(state, user) {
      state.user = null;
      if (user) {
        delete user.password; //为了用户安全，移除掉用户密码信息
      }
      if (user) {
        saveUser(user);
      } else {
        removeUser();
      }
    }
  },

  actions: {
    Login({ commit }, user) {
      return new Promise((resolve, reject) => {
        userApi
          .login(user)
          .then(response => {
            const resp = response.data;
            if (resp.flag) {
              commit("SET_USER", resp.data); //触发SET_USER函数 把返回的用户信息保存到store中
            }

            resolve(resp);
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    Register({ commit }, user) {
      return new Promise((resolve, reject) => {
        userApi
          .register(user)
          .then(response => {
            const resp = response.data;
            if (resp.flag) {
              commit("SET_USER", user);
            }

            resolve(resp);
          })
          .catch(error => {
            reject(error);
          });
      });
    },

    //退出系统
    Logout({ commit }) {
      commit("SET_USER", null);
      //清空localStoreage数据
      removeUser();
      removeCollection();
    },

    SaveUser({ commit }, user) {
      commit("SET_USER", user);
    }

    //修改密码
    // UpdatePsd({commit},user){
    //     return new Promise((resolve,reject)=>{
    //         userApi.updatePsd(user).then(response=>{
    //             const resp = response.data;

    //         })
    //     })
    // }
  }
};

export default user;
