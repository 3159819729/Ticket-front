<script>
import axios from "@/http";
import {Delete, Edit, Upload} from "@element-plus/icons-vue";
import {ElMessage} from "element-plus";
import {mapState} from "vuex";
export default {
  name: "Info",
  components: {Delete, Upload, Edit},
  data() {
    return {
      Info: {
        name: "",
        phone: "",
        email: "",
        is_super_admin: false,
        avatar: "",
      },
      admin: false,
      res: {
        code: null,
        message: null,
        data:{
          avatar: null,
          name: null,
          phone: null,
          email: null,
          is_super_admin: null,
        },
      },
      avatarPath: '',
      disabled:true,
      avatar: null,
    };
  },
  methods: {
    getInfo() {
      if (this.role=== "user") {
        axios.get("/api/user/info").then((res) => {
          this.res = res;
          if (this.res.code === 20000) {
            this.Info = this.res.data;
            if(this.Info.avatar!=null){this.avatarPath = 'http://localhost:8080/user_avatar/'+this.Info.avatar;}
          }
        }).catch((err) => {
          console.error(err);
        });
      } else if (this.role === "admin") {
        axios.get("/api/admin/info").then((res) => {
          this.res = res;
          if (this.res.code === 20000) {
            this.Info = res.data;
            if(this.Info.avatar!=null){this.avatarPath = 'http://localhost:8080/admin_avatar/'+this.Info.avatar;}
          }
        }).catch((err) => {
          console.error(err);
        });
      }
    },

    saveInfo() {
      this.disabled=!this.disabled;
      const formData = new FormData();
      if (this.avatar!=null){
        formData.append('avatar',this.avatar);  // 上传新的头像
      }
      if(this.avatarPath===''){
        formData.append('is_delete',true);
      }
      if(this.avatarPath !== ''){
        formData.append('is_delete',false);
      }
      formData.append(`${this.isAdmin===true ? 'admin_' : 'user_'}name`, this.Info.name);
      formData.append(`${this.isAdmin===true ? 'admin_' : 'user_'}phone`, this.Info.phone);
      formData.append(`${this.isAdmin===true ? 'admin_' : 'user_'}email`, this.Info.email);

      const url = this.isAdmin===true ? "/api/admin/updateAdminInfo" : "/api/user/updateUserInfo";
      axios.post(url, formData)
          .then(({ code, message ,data}) => {
            if (code === 20000) {
              ElMessage({
                type:'success',
                message: '修改个人信息成功'
              })
              // if(data.avatar!=null && data.avatar!==''){
              //   localStorage.setItem('avatar',data.avatar)
              //
              if (this.avatar!=null){
                this.$store.commit('updateInfoA',{name:this.Info.name,avatar:data.avatar})
              }else {
                this.$store.commit('updateInfo',{name:this.Info.name,})
              }
              this.getInfo(); // 重新加载信息
            } else {
              this.$message.error(message);
            }
          })
          .catch((error) => {
            console.error(error);
            this.$message.error("保存失败，请稍后再试");
          });
    },
    fileChange(e){
      let _this = this;
      let file = e.target.files[0];
      this.avatar = file;
      let reader = new FileReader();
      reader.readAsDataURL(file);
      //let img = this.$refs.img;
      reader.addEventListener('load', function (){
        //img.src = reader.result;
        _this.avatarPath = reader.result;
      })
    },
    selectFile(){
      this.$refs.file.click();
    },
    deleteFile(){
      this.avatarPath=''
    },
  },
  mounted() {
    this.getInfo();
    const name = localStorage.getItem('name');
    if (name !== null) {
      this.$store.commit('setName',name)
    }
    const role = localStorage.getItem('role');
    if (role !== null) {
      this.$store.commit('setRole',role)
    }
    const isAdminLocal = localStorage.getItem('isAdmin');
    if (isAdminLocal !== null) {
      const isAdmin = isAdminLocal === 'true';
      this.$store.commit('setIsAdmin',isAdmin)
    }
  },
  computed:{
    ...mapState(['name','role','isAdmin']),
  }
};
</script>
<template>
  <div>
    <h2>个人信息</h2>
    <el-card >
      <div class="personal_img">
        <el-image ref="img" :src="avatarPath" alt="" fit="fill" style="width:auto; height: 100px;">
          <template #error>
            暂无头像
          </template>
        </el-image>
        <el-row v-if="!disabled">
          <input type="file" ref="file" hidden @change="fileChange"/>
          <el-button type="primary" size="small" @click="selectFile"><el-icon><Upload /></el-icon>上传头像</el-button>
          <el-button type="danger" size="small" @click="deleteFile"><el-icon><Delete /></el-icon>删除头像</el-button>
        </el-row>
      </div>

      <el-form :model="Info" label-width="80px" class="info-form">
        <el-form-item label="姓名">
          <el-input v-model="Info.name" placeholder="请输入姓名" :disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="Info.phone" placeholder="请输入电话" :disabled="disabled"></el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="Info.email" placeholder="请输入邮箱" :disabled="disabled"></el-input>
        </el-form-item>

        <p v-if="admin">
          <strong>超级管理员：</strong> {{ Info.is_super_admin ? "是" : "否" }}
        </p>
        <el-form-item>
          <el-button v-if="disabled" type="primary" @click="disabled = false">
            编辑信息
          </el-button>

          <template v-else>
            <el-button type="danger" @click="disabled = true">
              取消编辑
            </el-button>
            <el-button type="primary" @click="saveInfo">
              确认编辑
            </el-button>
          </template>
        </el-form-item>

      </el-form>
    </el-card>
  </div>
</template>
<style scoped>
h2 {
  color: #333;
}
p {
  font-size: 1em;
  color: #666;
}
.info-form {
  max-width: 400px;
  margin-top: 20px;
}
</style>