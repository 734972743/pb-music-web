<template>
  <div>
    <el-upload
      :http-request="beforeUpload"
      :data="dataObj"
      :multiple="false"
      :show-file-list="true"
      class="image-uploader"
      drag
      action=""
    >
      <i class="el-icon-plus avatar-uploader-icon el-icon-upload" />
      <div class="el-upload__text">将图片拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <!-- <img v-if="imageUrl" :src="imageUrl" class="avatar" /> -->
  </div>
  <!-- :before-upload="beforeUpload"  -->
</template>

<script>
// list-type: text/picture/picture-card	text

import { client, timestamp } from "@/utils/aliyun.oss.client"; //前面的ali-js文件内的两个封装函数
export default {
  name: "AppUploadImage",
  props: {
    limit: {
      type: Number,
      default: 1
    },
    isAppUploadSubmit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tempUrl: "", //存上传后的图片url
      dataObj: {}, //存签名信息
      baseAli: "oss-cn-beijing.aliyuncs.com", //后面连接图片url用的，根据自己aili OSS 配制修改
      progress: 0, //进度条,
      file: null, //要上传的文件,
      imageUrl: ""
    };
  },

  created() {
    this.initData();
  },
  methods: {
    initData() {
      const user = this.$store.state.user.user;
      this.imageUrl = user.headSculptureUrl;
      console.log("this.imageUrl", this.imageUrl);
    },
    //上传图片
    beforeUpload(file) {
      this.file = file;
    },

    Upload(file) {
      if (!file) {
        return false;
      }
      const that = this;
      //判断扩展名
      console.log("Upload--file", file);
      const tmpcnt = file.file.name.lastIndexOf(".");
      const exname = file.file.name.substring(tmpcnt + 1);
      const names = ["jpg", "jpeg", "webp", "png", "bmp"];
      if (names.indexOf(exname) < 0) {
        this.$message.error("不支持的格式!");
        return;
      }
      //这里用异步的方式上次文件， 方法名为: multipartUpload
      async function multipartUpload() {
        console.log("file.file", file.file);
        //定义唯一的文件名，打印出来的uid其实就是时间戳

        var localFile = file.file; //这个是要上传的本地图片

        var fileName = localFile.name;
        var suffix = fileName.substr(fileName.indexOf(".")); //文件后缀名
        var storeAs = "resources/image/" + timestamp() + suffix; //这个要上传的路径

        // client.useBucket("pb-20191014");
        client()
          .multipartUpload(storeAs, localFile, {
            progress: function(p) {
              //获取进度条的值
              console.log("p", p);
              that.progress = p * 100;
            }
          })
          .then(result => {
            //下面是如果对返回结果再进行处理，根据项目需要
            console.log("result", result);
            that.tempUrl = `http://${result.bucket}.${that.baseAli}/${result.name}`;
            console.log("that.tempUrl", that.tempUrl);
            that.$emit("appUploadIamgeUrl", that.tempUrl);
            // 在成功之后，提交图片，失败，则删除图片
          })
          .catch(err => {
            console.log("err:", err);
          });
      }
      multipartUpload();
    },

    //删除上传的内容
    removeUpload(tempUrl) {
      async function deleteUpload() {
        client()
          .deleteUpload(tempUrl)
          .then(response => {
            console.log("response", response);
            console.log("图片删除成功", tempUrl);
          })
          .catch(error => {
            console.log("error", error);
          });
      }
      deleteUpload();
    }
  },

  watch: {
    isAppUploadSubmit(newVal, oldVal) {
      //this.submit();
      console.log("isAppUploadSubmit");
      this.Upload(this.file);
    }
  }
};
</script>

<style  scoped>
.el-upload {
  width: 300px;
  height: 30px;
}
</style>