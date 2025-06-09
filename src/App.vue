<script>
import axios from "@/http";
import {ElMessage} from 'element-plus';
import {createRouter as $router} from "vue-router";
import {mapState} from "vuex";
export default {
  name: "App",
  data() {
    return {
      loginDialogVisible: false,
      RegisterDialogVisible: false,
      loginForm: { phone: '13800138000', password: '123456' },
      registerForm: {
        user_name: '',
        user_phone: '',
        user_sex: null,
        user_email: '',
        user_password: '',
        user_password_confirm: '',
        captcha:""
      },
      registerRules: {
        user_name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        user_phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
        user_sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
        user_email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
        user_password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '密码长度必须在6-12位之间', trigger: 'blur' }
        ],
        user_password_confirm: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { min: 6, max: 12, message: '密码长度必须在6-12位之间', trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (value !== this.$data.registerForm.user_password) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            }, trigger: 'blur' }
        ]
      },
      res:{
        code: null,
        message: null,
        data: {
          user_id: null,
          user_name: null,
          token: null,
          avatar: null,
          is_super_admin: false,
        },
      },
    };
  },

  mounted() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== null) {
      this.$store.commit('setIsLoggedIn',isLoggedIn)
    }
    const role = localStorage.getItem('role');
    if (role !== null) {
      this.$store.commit('setRole',role)
    }
    const name = localStorage.getItem('name');
    if (name !== null) {
      this.$store.commit('setName',name)
    }
    const avatar = localStorage.getItem('avatar');
    if (avatar !== null) {
      this.$store.commit('setAvatar',avatar)
    }
  },
  computed:{
    ...mapState(['isLoggedIn', 'role', 'name', 'avatar','currentStep']),
    dialogTitle() {
      return this.role === "admin" ? "管理员登录" : "游客登录";
    },
  },
  methods: {
    showLoginPopover(role) {
      this.$store.commit('chooseLoginButton', role)
      this.loginDialogVisible = true;
    },
    createLoginFormData(phone, password, role) {
      const formData = new FormData();
      if (role === 'user') {
        formData.append('user_phone', phone);
        formData.append('user_password', password);
      } else {
        formData.append('admin_phone', phone);
        formData.append('admin_password', password);
      }
      return formData;
    },
    handleLogin() {
      if (!this.loginForm.phone || !this.loginForm.password) {
        alert('请填写手机号和密码！');
        return;
      }

      const formData = this.createLoginFormData(this.loginForm.phone, this.loginForm.password, this.role);

      axios.post(`/api/${this.role}/login`, formData).then(res => {
        this.res = res;
        if (this.res.code === 20000) {
          const idKey = `${this.role}_id`
          const nameKey = `${this.role}_name`
          localStorage.setItem('token', this.res.data.token);
          this.$store.commit('login', {id:this.res.data[idKey],name: this.res.data[nameKey], avatar: this.res.data.avatar ,isSuperAdmin: this.res.data.is_super_admin});
          this.loginDialogVisible = false;
          if(this.currentStep===2 && this.role==='user'){
            this.$store.commit('setCurrentStep',3)
          }
        } else {
          ElMessage.error(this.res.message);
        }
      }).catch(() => {
        ElMessage.error('登录失败');
      });
      this.loginDialogVisible = false;
    },
    submitRegister() {
      this.$refs.registerForm.validate((valid) => {
        if (valid) {
          // 验证验证码是否正确
          if (this.registerForm.captcha !== this.captchaCode) {
            this.$message.error('验证码不正确');
            return;
          }

          axios.post('/api/user/register', this.registerForm)
              .then(res => {
                this.res = res;
                if (this.res.code === 20000) {
                  this.$message.success(this.res.message);
                  this.loginForm.phone = this.registerForm.user_phone;
                  this.loginForm.password = null;
                  this.RegisterDialogVisible = false;
                  this.loginDialogVisible = true;
                } else {
                  this.$message.error(this.res.message);
                }
              })
        } else {
          this.$message.error('请完整填写表单');
        }
      });
    },
    // 生成验证码
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
    goToInfo(){
      this.$router.push('/infoCenter');
    },
    goToMain(){
      this.$router.push('/');
      this.$store.commit('goToMain');
      // this.refreshPage();
    },
    logout() {
      this.$router.push('/');
      this.$store.commit('logout');
    },
    // refreshPage() {
    //   setTimeout(() => {
    //     // this.loginDialogVisible = false;
    //   }, 100);  // 延迟关闭，确保点击不会误触
    // },
    // handleClickOutside(event) {
    //   if (!this.loginDialogVisible) return; // 只有对话框可见时才检测
    //
    //   if (this.$refs.loginDialog && this.$refs.loginDialog.$el) {
    //     const dialogElement = this.$refs.loginDialog.$el;
    //     if (!dialogElement.contains(event.target) && !event.target.closest(".el-dialog")) {
    //       this.handleClose();
    //     }
    //   }
    // },
    handleClose() {
      console.log("关闭登录浮窗");
      this.loginDialogVisible = false;
      // this.$store.commit('closeLogin')
    },
  },
};
</script>
<template>
  <el-header class="main_header">
    <div class="header_left">大寨山景区售票系统</div>
    <div class="header_right">
      <el-space :size="16" class="header_buttons">
        <el-button v-if="!this.isLoggedIn" @click="showLoginPopover('admin')" class="login-button">管理员登录</el-button>
        <el-button v-if="!this.isLoggedIn" @click="showLoginPopover('user')" class="login-button">游客登录</el-button>
        <div v-if="this.isLoggedIn" class="user-info">
          <span class="welcome-text">欢迎 {{ this.name }}</span>
          <el-avatar class="icon_hand" v-if=" this.avatar ==null"   :size="24" icon="UserFilled" :title="name" />
          <el-avatar class="icon_hand" v-if="this.avatar!=null&& this.role === 'user'" :size="24" :src="`http://localhost:8080/user_avatar/${this.avatar}`" :title="this.name" />
          <el-avatar class="icon_hand" v-if="this.avatar!=null&& this.role === 'admin'" :size="24" :src="`http://localhost:8080/admin_avatar/${this.avatar}`" :title="this.name" />
          <el-button @click="goToMain">回到首页</el-button>
          <el-button v-if="this.role === 'user'" @click="goToInfo">个人中心</el-button>
          <el-button v-if="this.role === 'admin'" @click="goToInfo">管理中心</el-button>
          <el-button @click="logout">退出登录</el-button>
        </div>
      </el-space>
    </div>
  </el-header>

  <el-dialog v-model="loginDialogVisible" :title="dialogTitle" width="400px" @close="handleClose" :close-on-click-modal="true" >
    <el-form :model="loginForm" @submit.prevent="handleLogin">
      <el-form-item label="手机号">
        <el-input v-model="loginForm.phone"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginForm.password" type="password"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
        <el-button v-if="this.role === 'user'" link @click="RegisterDialogVisible = true">注册</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <!--注册浮窗-->
  <el-dialog title="注册新用户" v-model="RegisterDialogVisible" width="500px" @close="RegisterDialogVisible = false">
    <el-form :model="registerForm" :rules="registerRules" ref="registerForm" label-width="100px">
      <el-form-item label="用户名" prop="user_name">
        <el-input v-model="registerForm.user_name"></el-input>
      </el-form-item>
      <el-form-item label="手机号" prop="user_phone">
        <el-input v-model="registerForm.user_phone"></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="user_sex">
        <el-radio-group v-model="registerForm.user_sex">
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="邮箱" prop="user_email">
        <el-input v-model="registerForm.user_email"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="user_password">
        <el-input type="password" v-model="registerForm.user_password"></el-input>
      </el-form-item>
      <el-form-item label="确认密码" prop="user_password_confirm">
        <el-input type="password" v-model="registerForm.user_password_confirm"></el-input>
      </el-form-item>
      <!-- 添加验证码输入框 -->
      <el-form-item label="验证码" prop="captcha">
        <el-row>
          <el-col :span="16">
            <el-input v-model="registerForm.captcha" placeholder="请输入验证码"></el-input>
          </el-col>
          <el-col :span="8" style="text-align: right;">
            <canvas id="captcha" ref="captchaCanvas" width="100" height="40" style="border: 1px solid #ddd;"></canvas>
            <el-button type="primary" @click="generateCaptcha" size="small">刷新验证码</el-button>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitRegister">注册</el-button>
        <el-button @click="RegisterDialogVisible = false">取消</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>

  <el-main class="main_content">
    <RouterView @showLoginPopover="showLoginPopover"/>
  </el-main>
</template>


<style scoped>
.main_header {
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  background: linear-gradient(to right, #1381FA, #29CBDA);
  color: white;
}

.header_left {
  font-size: 20px;
  font-weight: bold;
}

.header_right {
  display: flex;
  align-items: center;
}

.header_buttons {
  display: flex;
  gap: 16px;
}

.user-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.welcome-text {
  font-size: 16px;
  margin-right: 16px;
}

.main_content {
  padding: 20px;
}
</style>

