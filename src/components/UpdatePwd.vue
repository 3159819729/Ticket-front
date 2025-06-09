<script>
import {Key} from "@element-plus/icons-vue";
import axios from "@/http";
import {ElMessage} from "element-plus";

export default {
  name: "UpdatePwd",
  components: {Key},
  data() {
    return {
      old_pwd: '',
      new_pwd: '',
      re_pwd: '',
      rules: {
        old_pwd: [
          { required: true, message: '原密码不能为空', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度必须在6到16位之间', trigger: 'blur' }
        ],
        new_pwd: [
          { required: true, message: '新密码不能为空', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度必须在6到16位之间', trigger: 'blur' }
        ],
        re_pwd: [
          { required: true, message: '确认密码不能为空', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度必须在6到16位之间', trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (value !== this.new_pwd) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            }, trigger: 'blur'
          }
        ]
      },
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
    updatePwd() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if(localStorage.getItem('role')==='user'){
            let formData = new FormData();
            formData.append('old_pwd', this.old_pwd)
            formData.append('new_pwd', this.new_pwd)
            formData.append('re_pwd', this.re_pwd)
            axios.post('/api/user/password',formData)
              .then(res=>{this.res = res; if(this.res.code===20000){this.$message.success(this.res.message);}})
              .catch(err => {console.error(err);});
          }else {
            let formData = new FormData();
            formData.append('old_pwd', this.old_pwd)
            formData.append('new_pwd', this.new_pwd)
            formData.append('re_pwd', this.re_pwd)
            axios.post('/api/admin/password',formData)
              .then(res =>{this.res = res;if(this.res.code===20000){this.$message.success(this.res.message);
                this.$router.push('/');
                localStorage.clear();
                this.$store.commit('logout');
              }})
              .catch(err => {console.error(err);});
          }
        }
      })
    },
    myBack(){
      this.$router.go(-1);
    }
  },
};
</script>

<template>
  <el-card class="container" style="max-width: 100%">
    <template #header>
      <div class="card-header">
        <div class="updatePwd_header">
          <el-space>
            <el-icon size="24" color="#FFF" style="background-color: #3FABF9;"><Key /></el-icon>
            <span>修改密码</span>
          </el-space>
          <el-space>
            <el-button type="primary" plain icon="Edit" @click="updatePwd">保存</el-button>
            <el-button type="primary" plain icon="Back" @click="myBack">返回</el-button>
          </el-space>
        </div>
      </div>
    </template>
    <div class="notice">注：为了安全起见，建议各位用户能定期（三个月或半年为期）修改自己的密码，避免密码泄露。</div>

    <el-form ref="form" :rules="rules" :model="{old_pwd, new_pwd, re_pwd}" size="small" label-position="left" label-width="80px">
      <el-form-item label="原密码" prop="old_pwd" required>
        <el-input v-model="old_pwd" style="width:320px;" />
      </el-form-item>
      <el-form-item label="新密码" prop="new_pwd" required>
        <el-input v-model="new_pwd" style="width:320px;" />
      </el-form-item>
      <el-form-item label="确认密码" prop="re_pwd" required>
        <el-input v-model="re_pwd" style="width:320px;" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
/* 外部容器 */
.container {
  height: 100vh;
}
.updatePwd_header {
  display: flex;
  justify-content: space-between;
}
/* 提示 */
.notice {
  color: #999;
  font-size: 10px;
  font-family: '宋体', serif;
  margin-top: -10px;
}
/* 表单区域 */
.el-form {
  margin: 60px auto 0;
  width: 500px;
}
</style>
