<script>
export default {
  name: "InfoCenter",
  data() {
    return {
      Role: "",
      IsSuperAdmin:false,
    };
  },
  mounted() {
    this.Role = localStorage.getItem("role");
    this.IsSuperAdmin = localStorage.getItem("is_super_admin");
  }
};
</script>

<template>
  <div class="info-center">
    <!-- 左侧导航 -->
    <el-aside width="200px" class="sidebar">
      <el-menu index="1" class="el-menu-vertical-demo" active-text-color="purple" default-active="1-1">
        <el-menu-item index="1-1">
          <router-link to="/infoCenter/info">个人信息</router-link>
        </el-menu-item>
        <el-menu-item index="1-2">
          <router-link to="/infoCenter/updatePwd">密码修改</router-link>
        </el-menu-item>
        <el-menu-item v-if="Role === 'admin'" index="1-3">
          <router-link to="/infoCenter/orders">订单管理</router-link>
        </el-menu-item>
        <el-menu-item v-if="Role !== 'admin'" index="1-3">
          <router-link to="/infoCenter/orders">我的订单</router-link>
        </el-menu-item>
        <el-menu-item v-if="IsSuperAdmin==='true'" index="1-4">
          <router-link to="/infoCenter/usersEdit">游客管理</router-link>
        </el-menu-item>
        <el-menu-item v-if="Role !== 'admin'" index="1-4">
          <router-link to="/infoCenter/visitors">游客信息管理</router-link>
        </el-menu-item>
        <el-menu-item v-if="IsSuperAdmin==='true'" index="1-5">
          <router-link to="/infoCenter/adminEdit">管理员编辑</router-link>
        </el-menu-item>
        <el-menu-item v-if="IsSuperAdmin==='true'" index="1-6">
          <router-link to="/infoCenter/actionLogs">操作日志</router-link>
        </el-menu-item>
        <el-menu-item v-if="Role === 'admin'" index="1-7">
          <router-link to="/infoCenter/ticketEdit">票务管理</router-link>
        </el-menu-item>
        <el-menu-item v-if="Role === 'admin'" index="1-8">
          <router-link to="/infoCenter/inventoryEdit">库存管理</router-link>
        </el-menu-item>
        <el-menu-item v-if="Role === 'admin'" index="1-9">
          <router-link to="/infoCenter/discountEdit">折扣管理</router-link>
        </el-menu-item>
        <el-menu-item v-if="Role === 'admin'" index="1-10">
          <router-link to="/infoCenter/blackEdit">黑名单管理</router-link>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容显示子路由 -->
    <el-main class="main-content">
      <router-view />
    </el-main>
  </div>
</template>

<style scoped>
.info-center {
  display: flex;
}
.sidebar {
  background-color: #f2f2f2;
  height: 100vh;
}
.main-content {
  padding: 20px;
  width: 100%;
  background-color: #ffffff;
}

/* 设置选中菜单项的背景色 */
.el-menu-item.is-active {
  background-color: #1381FA !important;
  color: purple !important;
}

/* 使菜单项区域可以被点击 */
.el-menu-item {
  display: block;
  width: 100%;
}

/* 确保 router-link 填满整个 el-menu-item */
.el-menu-item a {
  display: block;
  width: 100%;
}
</style>
