<template>
  <div>
    <el-button type="primary" @click="uploadSongVisible = true"
      >上传音频</el-button
    >
    <el-table
      :data="songList"
      style="width: 100%"
      height="500px"
      ref="songTable"
    >
      <el-table-column
        prop="songName"
        label="歌曲名称"
        :formatter="formatterSongName"
        width="500"
      >
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <i
            :id="'main-play-buttom' + scope.$index"
            @click="palyMusic(scope.$index)"
            class="el-icon-video-play main-play-buttom"
          ></i>
          <i @click="downMusic(scope.row)" class="el-icon-download"></i>
          <i
            @click="collectionMusic(scope.$index, scope.row)"
            :id="'main-collection-buttom' + scope.$index"
            class="el-icon-star-on main-collection-buttom"
            v-if="scope.row.isCollection"
          ></i>
        </template>
      </el-table-column>
    </el-table>

    <!--  上传歌曲表单弹出框  -->
    <el-dialog
      title="上传歌曲"
      :visible.sync="uploadSongVisible"
      class="el-dialog_1"
      width="1200"
    >
      <el-form
        :model="uploadSongForm"
        status-icon
        :rules="rulesUploadSongForm"
        ref="uploadSongForm"
        label-width="100px"
      >
        <el-form-item label="音频名称" prop="songName">
          <el-input
            v-model="uploadSongForm.songName"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="音频作者" prop="singerName">
          <el-input
            v-model="uploadSongForm.singerName"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="音频类型" prop="typeId">
          <el-select
            v-model="uploadSongForm.typeId"
            placeholder="请选择音频类型"
          >
            <el-option
              v-for="item in songTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="音频文件" prop="songUrl">
          <el-upload
            :limit="1"
            :multiple="false"
            action="https://jsonplaceholder.typicode.com/posts/"
            :on-change="handleChangeUploadFile"
            :file-list="uploadFileList"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">
              只能上传音频文件，且只能上传一个
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item label="音频图片" prop="imgUrl">
          <app-upload-image
            :limit="1"
            :isAppUploadSubmit="isAppUploadSubmit"
            @appUploadIamgeUrl="appUploadSongs"
            ref="user-upload-image"
          ></app-upload-image>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="uploadSongSubmit('uploadSongForm')"
            >上传</el-button
          >
          <el-button @click="resetForm('uploadSongForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import musicApi from "@/api/music";
const PubSub = require("pubsub-js");
import AppUploadImage from "@/components/AppUploadImage";
export default {
  components: {
    AppUploadImage
  },
  created() {
    this.fetchData();

    PubSub.subscribe("searchMusicPubSub", (event, title) => {
      this.searchMap.songName = title;
      this.fetchMusicData();
    });

    //表示上一首歌曲
    PubSub.subscribe("previousSongPubSub", (event, music) => {
      this.isPlay = false;
      if (!music) {
        this.$message({
          message: "请在列表中选择一首歌曲播放",
          type: "warning"
        });
        return false;
      }
      if (music.index <= 0) {
        this.palyMusic(0);
      } else {
        this.palyMusic(music.index - 1);
      }
    });

    //表示下一首歌曲
    PubSub.subscribe("nextSongPubSub", (event, music) => {
      if (!music) {
        this.$message({
          message: "请在列表中选择一首歌曲播放",
          type: "warning"
        });
        return false;
      }
      this.isPlay = false;
      if (music.index >= this.totalCount - 1) {
        this.palyMusic(this.totalCount - 1);
      } else {
        this.palyMusic(music.index + 1);
      }
    });
  },

  data() {
    return {
      songList: [],
      uploadSongVisible: false,
      uploadSongForm: {},
      rulesUploadSongForm: {},
      isAppUploadSubmit: false,
      songTypeList: [],
      uploadFileList: []
    };
  },

  methods: {
    formatterSongName(row, column) {
      let songName = row.songName;
      return songName.substring(0, songName.lastIndexOf("."));
    },

    fetchData() {
      let that = this;
      musicApi
        .getgetSongListsByUserId()
        .then(response => {
          const resp = response.data;
          if (resp.flag) {
            //this.collectionList = resp.data;
          }
        })
        .catch(error => {
          console.log(error);
        });

      musicApi.getTypesAll(response => {
        let resp = response.data;
        if (resp.flag) {
          resp.data.forEach(type => {
            console.log("type", type);
            that.songTypeList.push({
              value: type.typeId,
              label: type.typeName
            });
          });
        }
      });
    },

    handleChangeUploadFile(file, fileList) {
      this.fileList = fileList.slice(-3);
    },

    appUploadSongs() {},

    uploadSongSubmit(formName) {
      this.$refs[formName].validate(vali => {
        if (vali) {
          let song = {};
          song.songName = this.uploadSongForm.songName;
          song.singerName = this.uploadSongForm.singerName;
          song.typeId = this.uploadSongForm.typeId;
          // song.songName = this.uploadSongForm.songName;
          // song.songName = this.uploadSongForm.songName;
          musicApi
            .addSong(song)
            .then(response => {
              let resp = response.data;
              console.log("resp", resp);
            })
            .catch(error => {
              console.log(error);
            });
        }
      });
    }
  }
};
</script>

<style scoped>
.el-button--primary {
  margin-top: 30px;
  margin-bottom: 20px;
}
</style>
