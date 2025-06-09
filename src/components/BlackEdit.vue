<script>
import axios from "@/http";

export default {
  name: "BlackEdit",
  data() {
    return {
      blackList: [],
      black_visitor_code: "",
      res:{
        code: null,
        message: null,
        data: {
          pageNum: null,
          pageSize: null,
          total:null,
          pages: null,
          pageData: [
            {
              black_id: null,
              black_visitor_code: null
            }
          ],
        },
      },
      pageNum: 1,
      pageSize: 10,
      total: 0,
      newVisitorCode: "",
      dialogVisible: false,
    }
  },
  mounted() {
    this.getBlackList();
  },
  methods:{
    getBlackList(){
      this.blackList = [];
      axios.get("/api/admin/getBlackVisitorList", {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          black_visitor_code: this.black_visitor_code},
      })
          .then(res => {
            this.res = res;
            if (this.res.code === 20000 && this.res.data.total) {
              this.blackList = this.res.data.pageData;
              this.total = this.res.data.total; // 更新总记录数
              this.$message.success(this.res.message);
            }
            if (this.res.code === 20000 && !this.res.data.total) {
              this.$message.warning("没有查询到结果");
            }
          })
          .catch(err => {
            console.error(err);
          });
    },
    // 处理分页
    handlePageChange(page) {
      this.pageNum = page;
      this.getBlackList();
    },
    // 新增黑名单
    addToBlackList() {
      if (!this.newVisitorCode) {
        this.$message.error("请输入身份证号码");
        return;
      }

      axios.post("/api/admin/addBlackVisitor", {
            black_visitor_code: this.newVisitorCode,
          })
          .then(res => {
            this.res = res;
            if (this.res.code === 20000) {
              this.$message.success("新增成功");
              this.dialogVisible = false;  // 关闭弹窗
              this.getBlackList();  // 刷新列表
            } else {
              this.$message.error(this.res.message);
            }
          })
          .catch((err) => {
            console.error(err);
          });
    },
    // 删除黑名单
    deleteFromBlackList(black_id,back_visitor_code) {
      axios.post("/api/admin/deleteBlackVisitor", { black_id , back_visitor_code})
          .then(res => {
            this.res = res;
            if (this.res.code === 20000) {
              this.$message.success("删除成功");
              this.getBlackList();  // 刷新列表
            } else {
              this.$message.error(res.data.message);
            }
          })
          .catch((err) => {
            console.error(err);
          });
    },
  }
}
</script>

<template>
  <div>
    <!-- 搜索框 -->
    <el-input
        v-model="black_visitor_code"
        placeholder="请输入身份证号码搜索"
        style="width: 300px; margin-right: 10px"
        clearable
    />
    <el-button type="primary" @click="getBlackList">搜索</el-button>

    <!-- 新增按钮 -->
    <el-button
        type="success"
        style="margin-left: 20px"
        @click="dialogVisible = true;console.log(dialogVisible)"
    >
      添加黑名单用户
    </el-button>

    <!-- 黑名单表格 -->
    <el-table :data="blackList" border stripe style="margin-top: 20px">
      <el-table-column prop="black_id" label="黑名单ID" width="100" />
      <el-table-column
          prop="black_visitor_code"
          label="身份证号码"
          width="300"
      />
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button
              type="danger"
              @click="deleteFromBlackList(row.black_id,row.black_visitor_code)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        @current-change="handlePageChange"
        style="margin-top: 20px"
    />
    <!-- 新增黑名单弹框 -->
    <el-dialog
        title="新增黑名单"
        v-model="dialogVisible"
        @close="dialogVisible = false"
        width="400px"
    >
      <el-input
          v-model="newVisitorCode"
          placeholder="请输入身份证号码"
          style="width: 100%;"
      />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addToBlackList">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>