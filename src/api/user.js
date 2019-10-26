import request from "@/utils/request";
import store from "@/store";

const userStore = store.state.user.user;

export default {
  //注册
  register(userForm) {
    return request({
      url: "/user/register",
      method: "post",
      data: {
        //user: userForm
        loginId: userForm.loginId,
        password: userForm.password,
        userName: userForm.userName,
        userSex: parseInt(userForm.userSex)
      }
    });
  },

  //登录
  login(userForm) {
    return request({
      url: `/user/login`,
      method: "post",
      data: {
        loginId: userForm.username,
        password: userForm.password
      }
    });
  },

  //查询用户
  getUsers(user) {
    user.userId = userStore.userId;
    return request({
      url: `/user/getUsers`,
      method: "post",
      data: {
        userId: user.userId
      }
    });
  },

  //根据ID和密码来确认密码是否正确
  checkPwd(user) {
    return request({
      url: `/user/get`,
      method: "post",
      data: {
        user
      }
    });
  },

  //修改用户信息
  updateUserInfo(user) {
    user.userId = userStore.userId;
    return request({
      url: `/user/updateUserInfo`,
      method: "put",
      data: {
        userName: user.userName,
        userSex: user.userSex,
        headSculptureUrl: user.headSculptureUrl,
        sign: user.sign,
        userId: user.userId
      }
    });
  },

  //验证账户是否存在
  valiAccount(loginId) {
    return request({
      url: `/user/valiAccount/${loginId}`,
      method: "get"
    });
  }
};
