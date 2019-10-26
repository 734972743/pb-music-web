<template>
  <div class="myCreateSongList">
    <el-table
      :data="collectionList"
      style="width: 100%"
      :row-class-name="tableRowClassName"
      height="400"
    >
      <el-table-column prop="songListName" label="歌单名" width="180" />
      <el-table-column prop="introduce" label="歌单简介" width="300" />
      <el-table-column prop="collectionCount" label="曲目数" width="180" />
      <el-table-column prop="accessAount" label="收听次数" width="180" />

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="deleteCollection(scope.row)"
            icon="el-icon-delete"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import musicApi from "@/api/music";
import { saveCollection, getCollection } from "@/utils/auth.js";
export default {
  name: "myCreateSongList",
  inject: ["reload"],
  data() {
    return {
      collectionList: []
    };
  },
  created() {
    this.fetchData();
  },

  methods: {
    fetchData() {
      musicApi.getgetSongListsByUserId().then(response => {
        const resp = response.data;
        if (resp.flag) {
          this.collectionList = resp.data;
        }
      });
    },
    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 3) {
        return "success-row";
      }
      return "";
    },

    deleteCollection(row) {
      musicApi.deleteUserWithSongList(row).then(response => {
        const resp = response.data;
        this.$message({
          message: resp.message,
          type: resp.flag ? "success" : "warning"
        });
        if (resp.flag) {
          //删除之后要重新刷新数据
          musicApi.getgetSongListsByUserId().then(response => {
            const resp = response.data;
            if (resp.flag) {
              saveCollection(resp.data);
              this.reload();
            }
          });
        }
      });
    }
  }
};
</script>

<style  scoped>
</style>