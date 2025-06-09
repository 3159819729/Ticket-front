<script>
import axios from "@/http";
export default {
  name: "UsersEdit",
  data() {
    return {
      userList: [], // 存储用户列表数据
      queryParams: {
        name: "", // 姓名查询条件
        sex: '',  // 性别筛选条件
        status: null,
        pageNum: 1, // 当前页码
        pageSize: 10, // 每页显示条数
      },
      deleteParams:{
        id: null,
        name: "",
      },
      total: 0, // 数据总条数
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
      orders: [],
      OrderVisible: false,
      pagination: {pageNum: 1, pageSize: 10, total: 0, pages: 1,},
      order_status: '',
      id: null,
    };
  },
  methods: {
    // 获取用户列表
    getUserList() {
      axios.get('/api/admin/getUserList', { params: this.queryParams })
          .then(res => {
            this.res = res;
            if (this.res.code === 20000) {
              this.userList = this.res.data.pageData;
              this.total = this.res.data.total; // 总条数
            }
          })
          .catch(err => {
            console.log(err);
          });
    },
    handleDeactivate(user) {
      // 触发注销操作
      this.$confirm('确定要注销该用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteParams.id = user.id;
        this.deleteParams.name = user.name;
        axios.post('/api/admin/deleteUser', {id: this.deleteParams.id, name: this.deleteParams.name})
            .then(res => {
              this.res = res;
              if (this.res.code === 20000) {
                this.getUserList()
              }
            })
            .catch(err => {
              console.log(err);
            });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消注销'
        });
      });
    },
    fetchOrders(){
      const params = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
        order_status: this.order_status,
        user_id: this.id,
      }
      axios.get('/api/admin/getOrders', { params})
          .then(({ data, code }) => {if (code === 20000) {
            this.orders=data.pageData;
            this.OrderVisible = true;
            console.log('订单数据加载成功，OrderVisible:', this.OrderVisible);
          }})
          .catch(error => {console.error(error);});
    },
    handleDialogClose(){
      this.OrderVisible = false;
    },
    handleStatusChange(value) {
      this.queryParams.status = value === "true" ? true : value === "false" ? false : null;
      this.queryParams.pageNum = 1;
      this.getUserList();
    },
    handleOrderPageChange(page) {
      this.pagination.pageNum = page;
      this.fetchOrders();
    },
    // 分页切换
    handleCurrentChange(page) {
      this.queryParams.pageNum = page;
      this.getUserList();
    },
    // 性别筛选
    handleSexChange(value) {
      this.queryParams.sex = value;
      this.queryParams.pageNum = 1; // 重置页码
      this.getUserList();
    },
    // 姓名搜索
    handleSearch() {
      this.queryParams.pageNum = 1; // 重置页码
      this.getUserList();
    },
  },
  mounted() {
    this.getUserList();
  },
};
</script>

<template>
  <div class="user-edit">
    <!-- 查询条件 -->
    <el-form inline>
      <el-form-item label="姓名">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入姓名"
            clearable
            @keyup.enter.native="handleSearch"
        ></el-input>
      </el-form-item>
      <el-form-item label="性别" width="80">
        <el-select v-model="queryParams.sex" placeholder="请选择性别" @change="handleSexChange">
          <el-option label="全部" value=""></el-option>
          <el-option label="男" value="1"></el-option>
          <el-option label="女" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryParams.status" placeholder="请选择状态" @change="handleStatusChange">
          <el-option label="全部" value="null"></el-option>
          <el-option label="正常" value="true"></el-option>
          <el-option label="注销" value="false"></el-option>
        </el-select>
      </el-form-item>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </el-form>

    <el-table :data="userList" style="width: 100%" border>
      <el-table-column prop="name" label="用户名" width="auto"></el-table-column>
      <el-table-column prop="phone" label="手机号" width="auto"></el-table-column>
      <el-table-column label="性别" width="auto">
        <template #default="scope">
          <span v-if="scope.row.sex === 1">男</span>
          <span v-else>女</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="auto">
        <template #default="scope">
          <span v-if="scope.row.status === true">正常</span>
          <span v-else>已注销</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="auto">
        <template #default="scope">
          <div style="display: flex; gap: 10px;">
            <el-button
                type="primary"
                @click="this.id=scope.row.id;fetchOrders()"
            >
              查询订单
            </el-button>
            <el-button
                v-if="scope.row.status === true"
                type="danger"
                @click="handleDeactivate(scope.row)"
            >
              注销
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 订单查询浮窗 -->
    <el-dialog
        :visible.sync="OrderVisible"
        v-model="OrderVisible"
        title="订单查询"
        width="60%"
        @close="handleDialogClose"
    >
      <el-form :inline="true" label-width="80px">
        <el-form-item label="订单状态">
          <el-select v-model="order_status" placeholder="请选择订单状态" @change="fetchOrders(this.id)">
            <el-option label="全部" :value="''"></el-option>
            <el-option label="待支付" value="待支付"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
            <el-option label="已支付" value="已支付"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已退款" value="已退款"></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 订单表格 -->
      <el-table :data="orders" style="width: 100%" border>
        <el-table-column label="票种" prop="ticket_name" width="180" />
        <el-table-column label="票价" prop="order_price" width="120" />
        <el-table-column label="使用日期" prop="ticket_use_date" width="180" />
        <el-table-column label="状态" prop="order_status" width="120" />
        <el-table-column label="订单金额" prop="order_price" width="120"></el-table-column>
        <el-table-column label="创建时间" prop="order_created_time" width="180"></el-table-column>
      </el-table>

      <!-- 分页控件 -->
      <el-pagination
          style="margin-top: 20px"
          background
          layout="prev, pager, next"
          :current-page="pagination.pageNum"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @current-change="handleOrderPageChange"
      ></el-pagination>

      <!-- 关闭按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="OrderVisible = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 分页控件 -->
    <el-pagination
        style="margin-top: 20px"
        background
        layout="prev, pager, next"
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        :total="total"
        @current-change="handleCurrentChange"
    ></el-pagination>
  </div>
</template>

<style scoped>
.user-edit {
  padding: 20px;
}
</style>
