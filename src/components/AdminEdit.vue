<script>
import { ref } from "vue";
import { ElInput, ElButton, ElTable, ElTableColumn, ElPagination, ElDialog, ElForm, ElFormItem, ElSwitch } from "element-plus";
import axios from "@/http";

export default {
  name: "adminEdit",
  data() {
    return {
      queryAdminName:"",
      pagination: {
        pageNum: 1, // 当前页码
        pageSize: 10, // 每页订单数
        total: 0, // 总记录数
        pages: 1, // 总页数
      },
      admins: [
        {
          id: "",
          name: "",
          admin_phone: "",
          admin_email: "",
          is_super_admin: false,
          admin_created_time: "",
          admin_updated_time: "",
        }
      ],
      loading: false,// 显示加载动画
      addDialogVisible: false, // 控制添加管理员对话框显示
      newAdmin: {
        admin_name: "",
        admin_phone: "",
        admin_email: "",
        admin_password: "",
        admin_password_confirm: "",
        is_super_admin: false,
        captcha:""
      },
      formRules: {
        admin_name: [{ required: true, message: "管理员姓名不能为空", trigger: "blur" }],
        admin_phone: [
          { required: true, message: "管理员手机号不能为空", trigger: "blur" },
          { len: 11, message: "手机号长度必须为11位", trigger: "blur" },
        ],
        admin_email: [{ required: true, message: "管理员邮箱不能为空", trigger: "blur" }, { type: "email", message: "邮箱格式不正确", trigger: "blur" }],
        admin_password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
        admin_password_confirm: [{ required: true, message: "确认密码不能为空", trigger: "blur" },
          { validator: (rule, value, callback) => {
              if (value !== this.newAdmin.admin_password) {
                callback(new Error('密码与确认密码不一致'));
              } else {
                callback();
              }
            }, trigger: 'blur' }],
      },
      isTransfer: false,
      res:{
        code: null,
        message: null,
        data: {
          pageNum: null,
          pageSize: null,
          total:null,
          pages: null,
          pageData: [
            null
          ],
        },
      },
    };
  },
  methods: {
    // 获取管理员列表
    fetchAdmins() {
      this.loading = true;
      axios.get("/api/admin/getAdmin", {
        params: {
          admin_name: this.queryAdminName,
          pageNum: this.pagination.pageNum,
          pageSize: this.pagination.pageSize,
        }})
          .then(res => {
          this.res = res;
          if(this.res.code === 20000) {
            this.admins = res.data.pageData;
            this.pagination.pageNum = res.data.pageNum;
            this.pagination.pageSize = res.data.pageSize;
            this.pagination.total = res.data.total;
            this.pagination.pages = res.data.pages;
            this.loading = false;
        }})
          .catch(err=> {
          console.error(err);
      })
    },
    // 页码变化
    handlePageChange(pageNum) {
      this.pageNum = pageNum;
      this.fetchAdmins();
    },
    // 打开添加管理员对话框
    openAddDialog() {
      this.newAdmin = {
        admin_name: "",
        admin_phone: "",
        admin_email: "",
        admin_password: "",
        admin_password_confirm: "",
      };
      this.addDialogVisible = true;
    },
    // 提交添加管理员表单
    submitAddAdmin() {
      this.$refs.addAdminForm.validate().then(() => {
        // 验证验证码是否正确
        if (this.newAdmin.captcha !== this.captchaCode) {
          this.$message.error('验证码不正确');
          return;
        }
        axios.post("/api/admin/insertAdmin", this.newAdmin).then(res => {
          this.res = res;
          if(this.res.code === 20000) {
            this.$message.success("管理员添加成功");
            this.addDialogVisible = false;
            this.fetchAdmins(); // 添加成功后刷新管理员列表
          }else {
            this.$message.error(this.res.message);
          }
        }).catch(err => {
          this.$message.error(err);
        });
      }).catch(err => {
        this.$message.error(err);
      });
    },
    handleTransfer(row){
      axios.post('/api/admin/transferSuper', {id: row.id,}).then(res => {
        this.res = res;
        if(this.res.code === 20000) {
          this.$message.success(this.res.message+"，请重新登录");
          setTimeout(() => {
            localStorage.clear();
            this.$router.push('/'); // 先跳转页面
            setTimeout(() => {
              window.location.reload(); // 再刷新
            }, 500); // 可适当延迟刷新
          }, 2000);
        }
      }).catch(err => {
        console.error(err);
      })
    },
    handleDelete(id) {
      if (!id) {
        this.$message.error("删除失败，ID无效！");
        return;
      }
      this.$confirm('确认删除该管理员吗?', '提示', {
        type: 'warning'
      }).then(() => {
        axios.post("/api/admin/deleteAdmin",
          {id: id}).then(res => {
            this.res = res;
            if(this.res.code === 20000) {
              this.$message.success(this.res.message);
              this.fetchAdmins(); // 删除成功后刷新管理员列表
            }
        }).catch((err) => {
          console.error(err);
        });
      }).catch(() => {
        this.$message.info('取消删除');
      });
    },
    generateCaptcha() {
      const canvas = this.$refs.captchaCanvas;
      const ctx = canvas.getContext("2d");
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let captcha = "";
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 设置字体
      ctx.font = "20px Arial";
      ctx.fillStyle = "#000";
      ctx.textBaseline = "middle";

      // 随机生成验证码
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        captcha += chars[randomIndex];
      }

      // 存储验证码
      this.captchaCode = captcha;
      // 绘制验证码
      ctx.fillText(captcha, 20, 20);
    },
  },
  mounted() {
    this.fetchAdmins(); // 组件挂载时查询管理员信息
  },
};
</script>

<template>
  <div class="admin-management">
    <!-- 查询部分 -->
    <el-input
        v-model="queryAdminName"
        placeholder="请输入管理员姓名"
        clearable
        style="width: 250px; margin-bottom: 20px;"
    />
    <el-button
        type="primary"
        @click="fetchAdmins"
    >查询</el-button>
    <el-button
        type="success"
        @click="openAddDialog"
        style="margin-left: 20px;"
    >添加管理员</el-button>
    <el-button
        @click="isTransfer = !isTransfer"
        :type="isTransfer ? 'danger' : 'primary'"
    >最高权限转移</el-button>
    <!-- 管理员列表 -->
    <el-table
        :data="admins"
        style="width: 100%"
        :loading="loading"
    >
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="admin_phone" label="手机号" width="180" />
      <el-table-column prop="admin_email" label="邮箱" width="250" />
      <el-table-column prop="is_super_admin" label="超级管理员" width="180">
        <template #default="{ row }">
          <el-switch
              v-model="row.is_super_admin"
              :active-text="'是'"
              :inactive-text="'否'"
              :disabled="row.is_super_admin || !isTransfer"
          @change="handleTransfer(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="admin_created_time" label="创建时间" width="180" />
      <!-- 操作列 -->
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button type="danger" size="small" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-if="admins.total > 0"
        :current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="handlePageChange"
    />

    <!-- 添加管理员对话框 -->
    <el-dialog
        title="添加管理员"
        v-model="addDialogVisible"
        width="500px"
    >
    <el-form
          :model="newAdmin"
          :rules="formRules"
          ref="addAdminForm"
          label-width="100px"
      >
        <el-form-item label="姓名" prop="admin_name">
          <el-input v-model="newAdmin.admin_name" />
        </el-form-item>
        <el-form-item label="手机号" prop="admin_phone">
          <el-input v-model="newAdmin.admin_phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="admin_email">
          <el-input v-model="newAdmin.admin_email" />
        </el-form-item>
        <el-form-item label="密码" prop="admin_password">
          <el-input type="password" v-model="newAdmin.admin_password" />
        </el-form-item>
        <el-form-item label="确认密码" prop="admin_password_confirm">
          <el-input type="password" v-model="newAdmin.admin_password_confirm" />
        </el-form-item>
        <el-form-item label="验证码" prop="captcha">
          <el-row>
            <el-col :span="16">
              <el-input v-model="newAdmin.captcha" placeholder="请输入验证码"></el-input>
            </el-col>
            <el-col :span="8" style="text-align: right;">
              <canvas id="captcha" ref="captchaCanvas" width="100" height="40" style="border: 1px solid #ddd;"></canvas>
              <el-button type="primary" @click="generateCaptcha" size="small">刷新验证码</el-button>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddAdmin">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-management {
  margin: 20px;
}
</style>