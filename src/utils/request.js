import axios from "axios";
import { Loading, Message } from "element-ui";

const request = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 20000
});

//在请求和响应中加入拦截器 Interceptors
//我们在拦截器中加入加载动画
//需要注意的是，以服务的方式调用的全屏 Loading 是单例的

let loading = {
  loadingInstance: null,

  open() {
    //loading动画打开
    //这里使用单例模式
    if (!this.loadingInstance) {
      this.loadingInstance = Loading.service({
        target: ".main", //target 指要覆盖的节点 这里覆盖class="main"的节点， 会在这个节点里面进行渲染loading动画
        text: "小P正在拼命加载中。。。",
        background: "rgba(0, 0, 0, 0.5)"
      });
    }
  },
  close() {
    //loading动画关闭
    if (this.loadingInstance) {
      this.loadingInstance.close();
      this.loadingInstance = null;
    }
  }
};

//请求拦截器
request.interceptors.request.use(
  config => {
    loading.open();
    return config;
  },
  error => {
    loading.close();
    return Promise.reject(error);
  }
);

//响应拦截器
request.interceptors.response.use(
  response => {
    loading.close();
    const resp = response.data;
    if (resp.code !== 200) {
      Message({
        message: resp.message ? resp.message : "500,服务异常",
        type: "warning"
      });
    }
    return response;
  },
  error => {
    console.log("error.response", error);
    console.log("error.response", error.response);
    loading.close();
    let errorMsg = "";
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 404:
          errorMsg = "404,网页找不到";
          break;
        case 500:
          errorMsg = "500,服务异常";
          break;
      }
      Message({
        message: errorMsg,
        type: "error",
        duration: 5000
      });
    }

    return Promise.reject(error);
  }
);

export default request;
