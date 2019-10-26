<template>
  <div class="header">
    <!-- 导航栏
    :router="true" 开启路由
     -->
    <el-menu
      :router="true"
      :default-active="$route.path"
      class="el-menu"
      mode="horizontal"
      @select="handleSelect"
      background-color="#fff"
      active-text-color="#ffd04b"
    >
      <span class="logo">
        <img src="@/assets/logo.png" alt="" width="60px" />

        <span class="title">{{ title }}</span>
      </span>
      <el-menu-item index="/hall">大厅</el-menu-item>
      <el-menu-item index="/myMusic">我的音乐</el-menu-item>
      <el-menu-item index="/vip">VIP</el-menu-item>

      <!-- 搜索框组件 -->
      <el-form
        :inline="true"
        :model="searchForm"
        ref="searchForm"
        class="form-inline"
        label-position="right"
        label-width="200px"
      >
        <!-- .native 是让组件读取原始的属性或方法  -->
        <el-form-item>
          <el-input
            v-model="searchForm.title"
            placeholder="搜索音乐，歌手"
            autocomplete="on"
            blur="blurTitle"
            @keyup.enter.native="search('searchForm')"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="search('searchForm')"
            >查询</el-button
          >
        </el-form-item>
      </el-form>
      <keep-alive>
        <div v-if="user">
          <img
            v-show="user.headSculptureUrl"
            :src="user.headSculptureUrl"
            alt=""
            class="userInfoImage"
          />
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              {{ user.userName
              }}<i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-edit" command="updateUserInfo"
                >修改用户信息</el-dropdown-item
              >
              <el-dropdown-item icon="el-icon-s-fold" command="exit"
                >退出</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <div v-else>
          <el-button class="login-button" @click="openLogin" type="primary"
            >登录</el-button
          >
        </div>
      </keep-alive>
    </el-menu>

    <!--  登录弹出框  -->
    <el-dialog
      title="登录"
      class="el-dialog_1"
      :visible.sync="loginVisible"
      width="500px"
    >
      <el-form
        :model="userForm"
        status-icon
        :rules="rulesLogin"
        ref="userForm"
        label-width="100px"
      >
        <!-- autocomplete="off" 是否启动自动补全功能  -->
        <el-form-item label="账户" prop="username">
          <el-input v-model="userForm.username" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="userForm.password"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="login('userForm')">登录</el-button>
          <el-button @click="resetForm('userForm')">重置</el-button>
        </el-form-item>

        <el-form-item class="register-text">
          没有账号，请<a @click="openRegister" href="#">注册</a>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--  注册弹出框  -->
    <el-dialog
      title="注册"
      :visible.sync="registerVisible"
      class="el-dialog_1"
      width="500px"
    >
      <el-form
        :model="registerUserForm"
        status-icon
        :rules="rulesRegister"
        ref="registerUserForm"
        label-width="100px"
      >
        <el-form-item label="账户" prop="loginId">
          <el-input
            v-model="registerUserForm.loginId"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="registerUserForm.password"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="registerCheckPassword">
          <el-input
            type="password"
            v-model="registerUserForm.registerCheckPassword"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item label="昵称" prop="userName">
          <el-input
            v-model="registerUserForm.userName"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="userSex">
          <el-radio v-model="registerUserForm.userSex" label="0">男</el-radio>
          <el-radio v-model="registerUserForm.userSex" label="1">女</el-radio>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="register('registerUserForm')"
            >注册</el-button
          >
          <el-button @click="resetForm('registerUserForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--  修改用户信息弹出框  -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="updateUserInfoVisible"
      class="el-dialog_updateUserInfo"
      width="500px"
    >
      <el-form
        :model="updateUserInfoForm"
        status-icon
        :rules="rulesupdateUserInfoForm"
        ref="updateUserInfoForm"
        label-width="100px"
      >
        <el-form-item label="昵称" prop="userName">
          <el-input
            v-model="updateUserInfoForm.userName"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="userSex">
          <el-radio v-model="updateUserInfoForm.userSex" label="0">男</el-radio>
          <el-radio v-model="updateUserInfoForm.userSex" label="1">女</el-radio>
        </el-form-item>
        <el-form-item label="用户头像" prop="headSculptureUrl">
          <app-upload-image
            :limit="1"
            :isAppUploadSubmit="isAppUploadSubmit"
            @appUploadIamgeUrl="appUploadIamgeUrl"
            ref="user-upload-image"
          ></app-upload-image>
        </el-form-item>
        <el-form-item label="个人签名" prop="sign">
          <el-input
            v-model="updateUserInfoForm.sign"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="updateUserInfo('updateUserInfoForm')"
            >修改信息</el-button
          >
          <el-button @click="resetForm('updateUserInfoForm')">重置</el-button>
        </el-form-item>
        <el-form-item class="register-text">
          <a @click="updatePsdVisible = true" href="#">修改密码</a>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!--  修改密码弹出框  -->
    <el-dialog
      title="修改密码"
      :visible.sync="updatePsdVisible"
      class="el-dialog_1"
      width="500px"
    >
      <el-form
        :model="updatePsdForm"
        status-icon
        :rules="rulesUpdatePsd"
        ref="updatePsdForm"
        label-width="100px"
      >
        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="updatePsdForm.oldPassword"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="updatePsdForm.password"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPassword">
          <el-input
            type="password"
            v-model="updatePsdForm.checkPassword"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="updatePsd('updatePsdForm')"
            >修改密码</el-button
          >
          <el-button @click="resetForm('updatePsdForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import userApi from "@/api/user";
import musicApi from "@/api/music";
import { saveUser, getUser } from "@/utils/auth";
import store from "@/store";
const PubSub = require("pubsub-js");
import AppUploadImage from "../AppUploadImage";

import { client } from "@/utils/aliyun.oss.client";

export default {
  inject: ["reload"], //注入依赖， 这个依赖在App.vue中定义了
  components: {
    AppUploadImage
  },
  created() {},

  data() {
    const valiCheckPass = (rule, value, callback) => {
      if (value != this.registerUserForm.password) {
        callback(new Error("确认密码和密码不一致"));
      } else {
        callback();
      }
    };

    const valiCheckPass2 = (rule, value, callback) => {
      if (value !== this.updatePsdForm.password) {
        callback(new Error("确认密码和密码不一致"));
      } else {
        callback();
      }
    };

    //去后台查询原密码是否正确
    const valiOldpass = (rule, value, callback) => {
      const user = {
        userId: this.userId,
        password: value
      };
      userApi.checkPwd(user).then(response => {
        const resp = response.data;
        if (resp.flag) {
          callback();
        } else {
          callback(new Error(resp.message));
        }
      });
    };

    //验证账号是否已存在
    const valiHasLoginId = (rule, value, callback) => {
      if (value && value.length >= 3) {
        userApi.valiAccount(value).then(response => {
          const resp = response.data;
          if (resp.flag) {
            callback();
          } else {
            callback(new Error("该账户已存在，请修改一下你的账户名"));
          }
        });
      } else {
        callback();
      }
    };

    return {
      title: "PB音乐",

      searchForm: {
        title: ""
      },
      user: getUser(),
      numberValidateForm: {},
      loginVisible: false,
      //用于登录注册
      userForm: {
        username: "",
        password: ""
      },
      rulesLogin: {
        username: [
          { required: true, message: "账户不能为空", trigget: "blur" }
        ],
        password: [{ required: true, message: "密码不能为空", trigget: "blur" }]
      },
      registerVisible: false,
      registerUserForm: {
        loginId: "",
        password: "",
        userName: "",
        userSex: "0",
        registerCheckPassword: ""
      },
      rulesRegister: {
        loginId: [
          { required: true, message: "账户不能为空", trigget: "blur" },
          { min: 3, message: "账户长度至少3个字符", trigger: "blur" },
          { validator: valiHasLoginId, trigget: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigget: "blur" }
        ],
        registerCheckPassword: [
          { required: true, message: "确认密码不能为空", trigget: "blur" },
          { validator: valiCheckPass, trigget: "blur" }
        ],
        userName: [{ required: true, message: "昵称不能为空", trigget: "blur" }]
      },
      updatePsdVisible: false, //修改密码弹出框是否显示
      updatePsdForm: {
        oldPassword: "",
        password: "",
        checkPassword: ""
      },
      rulesUpdatePsd: {
        oldPassword: [
          { required: true, message: "原密码不能为空", trigget: "blur" },
          { validator: valiOldpass, trigget: "blur" }
        ],
        password: [
          { required: true, message: "密码不能为空", trigget: "blur" }
        ],
        checkPassword: [
          { required: true, message: "确认密码不能为空", trigget: "blur" },
          { validator: valiCheckPass2, trigget: "blur" }
        ]
      },
      updateUserInfoVisible: false,
      updateUserInfoForm: {
        userName: "",
        userSex: "0",
        headSculptureUrl: "",
        sign: ""
      },
      rulesupdateUserInfoForm: {
        userName: [
          { required: true, message: "用户名不能为空", trigger: "blur" }
        ],
        userSex: "0",
        headSculptureUrl: [],
        sign: ""
      },
      isAppUploadSubmit: false,
      headSculptureUrlFlag: false
    };
  },

  methods: {
    handleSelect(key, keyPath) {},

    blurTitle() {
      this.$store.dispath("saveSearchTitle", this.searchForm.title);
    },

    search(formName) {
      const title = this.$store.state.music.searchTitle;
      const searchForm = {
        songName: title
      };

      //使用发布订阅模式给AppMain组件发送查询音乐列表的方法
      PubSub.publish("searchMusicPubSub", this.searchForm.title);

      // musicApi.getMusicSearch(1, 10, searchForm).then(response => {
      //   const resp = response.data;
      //   // this.$store.dispatch("",resp.data.rows)
      // });
    },

    //打开登录弹窗
    openLogin() {
      this.loginVisible = true;
      //等完全打开后，应该让这个界面进行一次重置,去掉原先的数据和校验
      this.$nextTick(() => {
        this.$refs["userForm"].resetFields();
      });
    },

    login(formName) {
      this.$refs[formName].validate(vali => {
        if (vali) {
          this.$store.dispatch("Login", this.userForm).then(resp => {
            this.$message({
              message: resp.message,
              type: resp.flag ? "success" : "warning"
            });
            if (resp.flag) {
              this.loginVisible = false;
              this.a = "2";
              this.user = getUser();
            }
          });
        } else {
          return false;
        }
      });
    },

    handleCommand(command) {
      switch (command) {
        //修改用户信息
        case "updateUserInfo":
          this.updateUserInfoVisible = true;
          this.$nextTick(() => {
            //先清空数据
            this.$refs["updateUserInfoForm"].resetFields();
            // this.$refs["user-upload-image"].clearFiles();
            //要查询数据

            userApi.getUsers({}).then(response => {
              const resp = response.data;
              if (resp.flag) {
                const data = resp.data[0];
                this.updateUserInfoForm.userName = data.userName;
                this.updateUserInfoForm.userSex = data.userSex + "";
                this.updateUserInfoForm.headSculptureUrl =
                  data.headSculptureUrl;
                this.updateUserInfoForm.sign = data.sign;
              }
            });
          });
          //this.openUpdatePsd();
          break;

        //退出系统
        case "exit":
          this.logout();
          break;
      }
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    openRegister() {
      this.loginVisible = false;
      this.registerVisible = true;
      this.$nextTick(() => {
        this.$refs["registerUserForm"].resetFields();
        this.registerUserForm = {
          loginId: "",
          password: "",
          userName: "",
          userSex: "0",
          registerCheckPassword: ""
        };
      });
    },

    register(formName) {
      this.$refs[formName].validate(vali => {
        if (vali) {
          delete this.registerUserForm.registerCheckPassword; //移除registerCheckPassword 确认密码属性
          this.$store.dispatch("Register", this.registerUserForm).then(resp => {
            this.$message({
              message: resp.message,
              type: resp.flag ? "success" : "warning"
            });
            if (resp.flag) {
              this.registerVisible = false;
              this.user = getUser();
            }
          });
        } else {
          return false;
        }
      });
    },

    logout() {
      this.$store.dispatch("Logout");
      this.user = getUser();
    },

    updatePsd(formName) {
      this.$refs[formName].validate(vali => {
        if (vali) {
          const user = {
            userId: this.user.userId,
            password: this.updatePsdForm.password
          };

          userApi.updatePsd(user).then(response => {
            const resp = response.data;

            if (resp.flag) {
              this.$message({
                message:
                  resp.message +
                  `,你的新密码为:${this.updatePsdForm.password},请重新登录`,
                type: resp.flag ? "success" : "warning"
              });
              this.updatePsdVisible = false;
              this.$store.dispath("Logout");
            } else {
              this.$message({
                message: resp.message,
                type: "warning"
              });
            }
          });
        }
      });
    },

    appUploadIamgeUrl(data) {
      this.updateUserInfoForm.headSculptureUrl = data;
      this.headSculptureUrlFlag = true;
      this.updateUserInfo("updateUserInfoForm");
    },

    //修改用户信息
    updateUserInfo(formName) {
      this.$refs[formName].validate(vali => {
        if (vali) {
          //提交信息
          this.isAppUploadSubmit = true;
          //图片上传完成后再提交表单数据到后台
          if (this.headSculptureUrlFlag) {
            userApi
              .updateUserInfo(this.updateUserInfoForm)
              .then(response => {
                const resp = response.data;

                this.$message({
                  message: resp.message,
                  type: resp.flag ? "success" : "warning"
                });
                if (resp.flag) {
                  this.updateUserInfoVisible = false;
                  this.$store.dispatch("SaveUser", resp.data);
                  this.reload();
                } else {
                  //把刚才上次的图片删除掉
                  this.$refs.child.removeUpload(
                    this.updateUserInfoForm.headSculptureUrl
                  );
                }
              })
              .catch(err => {
                console.log("err", err);
              });
          }
        }
      });
    }
  }
};
</script>

<style  scoped>
.logo {
  float: left;
  margin-right: 73px;
  vertical-align: middle; /* 垂直居中 */
  text-align: center;
}
.title {
  font-size: 30px;
  margin-top: 5px;
}

.el-menu-item {
  font-size: 30px;
}

.el-form {
  float: left;
  margin-left: 100px;
  margin-top: 14px;
}

.el-dropdown {
  float: right;
  right: 50px;
  top: 22px;
}

.login-button {
  margin-left: 113px;
  margin-top: 13px;
}

.register-text .el-form-item__content {
  font-size: 24px !important;
}

/**  如果你要修改elementui 里面的样式可以使用 >>> */
/**  是为了修改el-dialog 中高度不够的bug */
.el-dialog_1 >>> .el-dialog__body,
.el-dialog_updateUserInfo >>> .el-dialog__body {
  height: 400px;
  margin-left: -48px;
}

.el-dialog_updateUserInfo >>> .el-dialog__body {
  height: 600px;
  margin-left: -48px;
}

/**   下面是头像图片上传控件的样式 */
.el-upload {
  width: 300px;
  height: 30px !important;
}

.el-dialog_updateUserInfo >>> .el-upload-dragger {
  width: 300px;
  height: 30px !important;
}

.userInfoImage {
  position: absolute;
  left: 1018px;
  top: 9px;
  width: 73px;
  height: 62px;
}
</style>