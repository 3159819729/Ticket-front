<script>
import axios from "@/http";
import OrderList from './OrderList.vue';
import {mapState} from "vuex";
export default {
  name: 'Orders',
  components: {
    OrderList,
  },
  data() {
    return {
      currentTab: 'all', // 默认选中“所有订单”
      orders: [], // 订单列表
      visitors: [], // 游客信息
      selectedOrder: {
        order_id: '',
        ticket_id: '',
        ticket_name: '',
        ticket_type: '',
        order_price: '',
        ticket_use_date: '',
        order_created_time: '',
        order_status: '',
        is_use: '',
        order_payment_time: '',
        discount_amount: '',
        actual_payment_amount: '',
        cancel_reason: '',
        cancel_time: '',
        ticket_count: '',
        order_refund_amount: '',
        order_refund_time: '',
      }, // 选中的订单
      pagination: {pageNum: 1, pageSize: 10, total: 0, pages: 1,},
      orderConfirmDialogVisible: false,
      cancelDialogVisible: false,
      cancelForm: {cancel_reason: '', other_reason: ''},
      res: {
        code: null,
        message: null,
        data: {
          pageNum: null,
          pageSize: null,
          total: null,
          pages: null,
          pageData: [
            null
          ],
        },
      },
      discount_amount: '',
      actual_payment_amount: '',
      order_payment_time: '',
      queryData: {
        ticket_use_date: null,
        ticket_type_id: '',
        ticket_id:'',
        order_status: null,
        user_id: null,
      },
      ticketNames: [],
      ticketTypes: [],
      order_status: '',
      is_use: '',
      order_id: '',
      ticket_id: '',
    }
  },
  mounted() {
    this.fetchOrders();
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== null) {
      this.$store.commit('setIsAdmin', isAdmin);
    }
    const id = localStorage.getItem('id');
    if (id !== null) {
      this.$store.commit('setId', id);
    }
  },
  computed: {
    ...mapState(['isAdmin','id']),
  },
  watch: {
    currentTab() {
      this.pagination.pageNum = 1; // 重置页码
      this.fetchOrders();
    }
  },
  methods: {
    // 获取票务名称选项
    fetchTicketNames() {
      if (this.ticketNames.length === 0) {
        axios.get("/api/getTicketNames")
            .then(res => {
              this.res = res;
              if (this.res.code === 20000) {
                this.ticketNames = this.res.data; // 填充票务名称选项
              }
            })
            .catch((err) => {
              console.error("获取票务名称失败:", err);
            });
      }
    },
    // 获取票种类型选项
    fetchTicketTypes() {
      if (this.ticketTypes.length === 0) {
        axios.get("/api/getTicketTypes")
            .then(res => {
              this.res = res;
              if (this.res.code === 20000) {
                this.ticketTypes = this.res.data; // 填充票种类型选项
              }
            })
            .catch(err => {
              console.error(err);
            });
      }
    },
    getBasePath() {
      return localStorage.getItem("role") === "admin" ? "/api/admin/getOrders" : "/api/user/getOrders";
    },
    // 获取订单数据
    // fetchOrders() {
    //   const role = localStorage.getItem('role'); // 从 LocalStorage 获取角色
    //   const basePath = role === 'admin' ? '/api/admin/getOrders' : '/api/user/getOrders'; // 动态确定 API 路径
    //   const status = this.currentTab === 'all' ? null : this.currentTab; // 判断是否过滤状态
    //
    //   // 基础参数
    //   const params = {
    //     pageNum: this.pagination.pageNum,
    //     pageSize: this.pagination.pageSize,
    //     order_status: status, // 根据标签筛选状态
    //   };
    //
    //   // 如果是用户角色，添加用户 ID 参数
    //   if (role === 'user') {
    //     params.user_id = localStorage.getItem('user_id'); // 假设用户 ID 存储在 LocalStorage
    //   }
    //
    //   // 发起请求
    //   axios.get(basePath, { params })
    //       .then((res) => {
    //         if (res.code === 20000) {
    //           // 更新分页数据
    //           this.pagination.pageNum = res.data.pageNum;
    //           this.pagination.pageSize = res.data.pageSize;
    //           this.pagination.total = res.data.total;
    //           this.pagination.pages = res.data.pages;
    //
    //           // // 转换 ticket_use_date 字段为本地时间并截取日期部分
    //           // this.orders = res.data.pageData.map(order => {
    //           //   // 先将 UTC 时间加 8 小时
    //           //   const ticketUseDate = new Date(order.ticket_use_date);
    //           //   ticketUseDate.setHours(ticketUseDate.getHours() + 8); // 加上8小时调整为本地时间
    //           //
    //           //   // 获取日期部分并格式化为 "yyyy-MM-dd"
    //           //   const year = ticketUseDate.getFullYear();
    //           //   const month = String(ticketUseDate.getMonth() + 1).padStart(2, '0');
    //           //   const day = String(ticketUseDate.getDate()).padStart(2, '0');
    //           //   order.ticket_use_date = `${year}-${month}-${day}`; // 更新订单的 ticket_use_date
    //           //
    //           //   return order;
    //           this.orders = res.data.pageData.map(order => {
    //             order.ticket_use_date = this.$store.getters.convertUtcToLocalDate(order.ticket_use_date);
    //             return order;
    //         });
    //         }
    //       })
    //       .catch((error) => {
    //         console.error('获取订单失败:', error);
    //         this.$message.error('获取订单失败');
    //       });
    // },
    fetchOrders() {
      this.orders = [];
      // this.queryData={
      //   ticket_use_date:this.ticket_use_date,
      //   ticket_type_id:this.ticket_type_id,
      //   ticket_id:this.ticket_id,
      //   order_status:this.currentTab === "all" ? null : this.currentTab,
      //   user_id:localStorage.getItem("role")==="user"?localStorage.getItem("user_id"):undefined,
      // }
      // axios.get(this.getBasePath(), {
      //     params: {
      //       pageNum: this.pagination.pageNum,
      //       pageSize: this.pagination.pageSize,
      //       ...this.queryData,
      //       // order_status: this.currentTab === "all" ? null : this.currentTab,
      //       // user_id: localStorage.getItem("role") === "user" ? localStorage.getItem("user_id") : undefined,
      //       // ticket_type_id:this.ticket_type_id,
      //       // ticket_id:this.ticket_id,
      //       // ticket_use_date:this.ticket_use_date,
      //     },
      //   })
      this.queryData = {
        ticket_use_date: this.queryData.ticket_use_date,  // 添加用票日期
        ticket_type_id: this.queryData.ticket_type_id,    // 添加票务类型
        ticket_id: this.queryData.ticket_id,              // 添加票务名称
        order_status: this.currentTab === "all" ? null : this.currentTab,
      };
      const params = {
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize,
      };
      for (const key in this.queryData) {
        if (this.queryData[key] != null && this.queryData[key] !== "") {
          params[key] = this.queryData[key];
        }
      }
      axios.get(this.getBasePath(), { params })
        .then(({ data, code }) => {if (code === 20000) {
          this.orders=data.pageData;
          Object.assign(this.pagination, data)
        }})
        .catch(error => {console.error(error);});
    },
    // 处理订单点击并获取订单的游客信息
    handleOrderClick(order) {
      console.log(order);
      // this.selectedOrder = order;
      Object.assign(this.selectedOrder, order);
      console.log(this.selectedOrder);
      this.fetchVisitors(order.order_id);
      this.orderConfirmDialogVisible = true;
    },

    // 获取选定订单的游客信息
    fetchVisitors(order_id) {
      axios.get(`/api/user/getOrderVisitors`, {params: {order_id: order_id}})
          .then(res => {this.visitors = res.data.pageData;})
          .catch(error => {console.error(error);});
    },

    // 处理分页变化
    handlePageChange(page) {
      this.pagination.pageNum = page;
      this.fetchOrders();
    },
    resetOrderConfirm(){
      this.fetchOrders();
    },
    // 支付取消后再次支付
    async confirmPayment() {
      try {
        await this.payOrder();

        const payOrderData = {
          order_id: this.selectedOrder.order_id,  // 订单 ID
          order_status: "已支付",  // 更新订单状态
          is_use: false,
          discount_amount: Number(this.discount_amount), // 确保是数值
          actual_payment_amount: Number(this.actual_payment_amount),
          order_payment_time: this.$store.getters.getLocalTime, // 支付时间
        };

        await this.updateOrder(payOrderData);

      } catch (error) {
        if (error === "cancel") {
          this.$message.info("支付已取消");
        } else {
          this.$message.error(error.message || "支付失败");
        }
      }
    },
    // confirmPayment() {
    //   // 调用支付确认函数
    //   this.payOrder().then(() => {
    //       const payOrderData = {
    //         order_id: this.selectedOrder.order_id,  // 要更新的订单ID
    //         order_status: '已支付',  // 更新为已支付
    //         is_use: false,
    //         discount_amount: this.discount_amount,
    //         actual_payment_amount: this.actual_payment_amount,  // 实际支付金额
    //         order_payment_time:this.$store.getters.getLocalTime,
    //       };
    //       // 更新订单状态为已支付
    //       this.updateOrder(payOrderData);
    //       // this.selectedOrder.discount_amount = this.discount_amount;
    //       // this.selectedOrder.actual_payment_amount = this.actual_payment_amount;
    //       // this.selectedOrder.order_payment_time = payOrderData.order_payment_time
    //     })
    // },
    // payOrder() {
    //   return new Promise((resolve, reject) => {
    //     axios.post('/api/getDiscount', { ticket_use_date: this.selectedOrder.ticket_use_date })
    //       .then(res => {
    //         if (!res.data) {
    //           this.discountRate = 1;
    //         } else {
    //           this.discountRate = res.data.discount_rate;
    //         }
    //         this.discount_amount = (this.selectedOrder.order_price * (1 - this.discountRate)).toFixed(2); // 折扣金额
    //         this.actual_payment_amount = this.selectedOrder.order_price - this.discount_amount; // 实际支付金额
    //         // 自定义弹窗内容
    //         const paymentDetails = `<div>
    //         <p><strong>票务名称：</strong>${this.selectedOrder.ticket_name} - ${this.selectedOrder.ticket_type}</p>
    //         <p><strong>原价：</strong>￥${this.selectedOrder.order_price}</p>
    //         <p><strong>折扣：</strong>￥${this.discountRate === 1 ? '无折扣' : this.discount_amount}</p>
    //         <p><strong>支付金额：</strong>￥${this.actual_payment_amount}</p>
    //         <p><strong>数量：</strong>${this.selectedOrder.ticket_count}</p>
    //       </div>`;
    //         // 使用 ElDialog 或类似组件自定义一个支付确认弹窗
    //         this.$confirm(paymentDetails, '支付确认', {
    //           dangerouslyUseHTMLString: true,
    //           confirmButtonText: '确认支付',
    //           cancelButtonText: '取消',
    //           type: 'warning'
    //         }).then(() => {
    //           resolve(true); // 模拟支付成功
    //         });
    //       })
    //   })
    //   .catch(err => {
    //     console.error(err);
    //   });
    // },
    // payOrder() {
    //   return axios.post("/api/getDiscount", { ticket_use_date: this.selectedOrder.ticket_use_date })
    //       .then(({ data }) => {
    //         this.discountRate = data ? data.discount_rate : 1;
    //         this.discount_amount = (this.selectedOrder.order_price * (1 - this.discountRate)).toFixed(2);
    //         this.actual_payment_amount = this.selectedOrder.order_price - this.discount_amount;
    //         return this.$confirm(
    //             `<div>
    //           <p><strong>票务名称：</strong>${this.selectedOrder.ticket_name} - ${this.selectedOrder.ticket_type}</p>
    //           <p><strong>原价：</strong>￥${this.selectedOrder.order_price}</p>
    //           <p><strong>折扣：</strong>￥${this.discountRate === 1 ? "无折扣" : this.discount_amount}</p>
    //           <p><strong>支付金额：</strong>￥${this.actual_payment_amount}</p>
    //           <p><strong>数量：</strong>${this.selectedOrder.ticket_count}</p>
    //         </div>`,
    //             "支付确认", { dangerouslyUseHTMLString: true, confirmButtonText: "确认支付", cancelButtonText: "取消", type: "warning" }
    //         );
    //       });
    // },
    async payOrder() {
      try {
        const { data } = await axios.post("/api/getDiscount", {
          ticket_use_date: this.selectedOrder?.ticket_use_date
        });

        // 计算折扣信息
        this.discountRate = data?.discount_rate ?? 1;
        this.discount_amount = (this.selectedOrder.order_price * (1 - this.discountRate)).toFixed(2);
        this.actual_payment_amount = (this.selectedOrder.order_price - this.discount_amount).toFixed(2);

        // 生成支付确认内容
        const confirmMessage = `
      <div>
        <p><strong>票务名称：</strong>${this.selectedOrder?.ticket_name || "未知"} - ${this.selectedOrder?.ticket_type || "未知"}</p>
        <p><strong>原价：</strong>￥${this.selectedOrder?.order_price || 0}</p>
        <p><strong>折扣：</strong>￥${this.discountRate === 1 ? "无折扣" : this.discount_amount}</p>
        <p><strong>支付金额：</strong>￥${this.actual_payment_amount}</p>
        <p><strong>数量：</strong>${this.selectedOrder?.ticket_count || 0}</p>
      </div>`;

        return this.$confirm(confirmMessage, "支付确认", {
          dangerouslyUseHTMLString: true,
          confirmButtonText: "确认支付",
          cancelButtonText: "取消",
          type: "warning"
        });
      } catch (error) {
        if(error==='cancel'){
        }
        this.$message.error(error);
      }
    },
    // 更新待支付订单为已支付订单
    updateOrder(payOrderData) {
      axios.post('/api/user/payOrder', payOrderData)
          .then(({code,message}) => {
            if (code === 20000) {
              this.$message.success(message);
              // this.selectedOrder.order_status = '已支付';
              // this.selectedOrder.is_use = false;
              Object.assign(this.selectedOrder, payOrderData)
            }
          })
          .catch((error) =>this.$message.error(error));
    },
    // 取消订单
    cancelOrder() {
    // this.cancelForm.cancel_reason = ''; // 清空取消原因
    // this.cancelForm.other_reason = ''; // 清空其他原因
    this.cancelDialogVisible = true;
      Object.assign(this.cancelForm, { cancel_reason: "", other_reason: "" });
    },
    // 计算退款金额的方法
    calculateRefundAmount(order) {
      const today = new Date();
      const ticketUseDate = new Date(order.ticket_use_date);
      const timeDiff = ticketUseDate.getTime() - today.getTime();
      const daysDifference = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // 计算天数差

      let refundRate = 0.9; // 默认 90%
      if (daysDifference <= 1) {
        refundRate = 0.5;
      } else if (daysDifference <= 2) {
        refundRate = 0.75;
      }
      return (Number(order.actual_payment_amount) * refundRate).toFixed(2); // 保留两位小数
    },
    refundOrder(order){
      // 计算退款金额
      const order_refund_amount = this.calculateRefundAmount(order);
      // 弹出确认框
      this.$confirm(`
        订单使用日期：${order.ticket_use_date}<br>
        实际支付金额：${order.actual_payment_amount} 元<br>
        退款金额：${order_refund_amount} 元<br>
        确定要申请退款吗？`, "确认退款",
          {
            dangerouslyUseHTMLString: true, // 允许 HTML 让格式更美观
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
      ).then(() => {
        const refundOrderData = {
          order_id: order.order_id,
          ticket_use_date: order.ticket_use_date,
          is_use: order.is_use,
          actual_payment_amount: Number(order.actual_payment_amount),
          order_refund_amount: Number(order_refund_amount),
        };
        axios.post('/api/user/refundOrder', refundOrderData)
            .then(({code,data}) => {
              if (code === 20000) {
                this.$message.success("退款金额为："+order_refund_amount);
                Object.assign(this.selectedOrder, { order_status: '已退款', is_use: null ,order_refund_amount:order_refund_amount,order_refund_time:data.order_refund_time});
              }
           })
        })
    },
    // 重置取消表单（弹窗关闭时）
    // resetCancelForm() {
    //   this.cancelForm.cancel_reason = '';
    //   this.cancelForm.other_reason = '';
    // },
    // 提交取消请求
    async confirmCancel(orderId) {
      if (!this.cancelForm.cancel_reason || (this.cancelForm.cancel_reason === "其他" && !this.cancelForm.other_reason)) {
        return this.$message.error("请输入有效的取消原因");
      }
      // 先确认用户是否真的想取消
      try {
        await this.$confirm('取消操作是不可逆的，您确定要继续吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 处理取消原因
        const cancelReason = this.cancelForm.cancel_reason === "其他"
            ? this.cancelForm.other_reason
            : this.cancelForm.cancel_reason;

        // 调用 Vuex 进行订单取消
        const res = await this.$store.dispatch("confirmCancelOrder", { orderId, cancelReason });
        console.log("取消成功了");
        // 取消成功
        this.$message.success(res.message);
        this.cancelDialogVisible = false;
        console.log("应该隐藏浮窗了")
        // 更新订单状态
        Object.assign(this.selectedOrder, {
          order_status: "已取消",
          cancel_reason: cancelReason,
          cancel_time: res.data.cancel_time,
        });
      } catch (error) {
        console.log("不取消了");
        // 如果是用户点了“取消”按钮，不做操作
        if (error === 'cancel') {
          // 关闭取消浮窗，显示订单确认浮窗
          this.cancelDialogVisible = false;
          return ;
        }
        this.$message.error(error);
      }
        //     .then(() => {
        //       // // 用户点击了“确定”按钮
        //       //  if (!this.cancelForm.cancel_reason) {
        //       //   this.$message.error('请选择取消原因');
        //       //   return;
        //       // }
        //       // // 如果选择了其他，确保填写了其他原因
        //       // if (this.cancelForm.cancel_reason === '其他' && !this.cancelForm.other_reason) {
        //       //   this.$message.error('请输入其他取消原因');
        //       //   return;
        //       // }
        //       return this.$store.dispatch("confirmCancelOrder", {
        //         orderId: order_id,
        //         cancelReason: this.cancelForm.cancel_reason === "其他" ? this.cancelForm.other_reason : this.cancelForm.cancel_reason,
        //       });
        //     })
        //     .then((message) => {
        //       this.$message.success(message);
        //       this.cancelDialogVisible = false;
        //       Object.assign(this.selectedOrder, {order_status: "已取消", cancel_reason: this.cancelForm.cancel_reason});
        //     })
        //     .catch(() => {
        //       this.cancelDialogVisible = false;
        //       this.orderConfirmDialogVisible = true;
        //     });
        // 提交取消请求
        // const cancelData = {
        //   order_id: Order_id,
        //   cancel_reason: this.cancelForm.cancel_reason === '其他' ? this.cancelForm.other_reason : this.cancelForm.cancel_reason
        // };
        //
        // // 发送取消订单的请求到后端
        // axios.post('/api/user/cancelOrder', cancelData).then((res) => {
        //   if (res.code === 20000) {
        //     this.$message.success(res.message);
        //     this.cancelDialogVisible = false;  // 关闭取消浮窗，取消订单成功之后的操作
        //     this.selectedOrder.order_status = '已取消';
        //     this.selectedOrder.cancel_reason = cancelData.cancel_reason;
        //   }
        // })
        //     .catch((error) => {
        //       console.error(error);
        //     });
    //     const cancelReason = this.cancelForm.cancel_reason === '其他'
    //         ? this.cancelForm.other_reason
    //         : this.cancelForm.cancel_reason;
    //     this.$store.dispatch('confirmCancelOrder', { orderId: Order_id, cancelReason})
    //         .then((message) => {
    //           this.$message.success(message);
    //           this.cancelDialogVisible = false;  // 关闭取消浮窗，取消订单成功之后的操作
    //           this.selectedOrder.order_status = '已取消';
    //           this.selectedOrder.cancel_reason = cancelReason;
    //         })
    //         .catch((error) => {
    //           console.error(error);
    //         });
    //   }).catch(() => {
    //     this.cancelDialogVisible = false;  // 关闭取消浮窗
    //     this.orderConfirmDialogVisible = true;  // 显示订单确认浮窗
    //   });
    },
  },
};
</script>
<template>
  <div class="orders">
    <h1>订单管理</h1>
      <select v-model="queryData.ticket_id" @focus="fetchTicketNames" @change="fetchOrders">
        <option value="">请选择票务名称:</option>
        <option v-for="ticket in ticketNames" :key="ticket.ticket_id" :value="ticket.ticket_id">
          {{ ticket.ticket_name }}
        </option>
      </select>
      <select v-model="queryData.ticket_type_id" @focus="fetchTicketTypes" @change="fetchOrders">
        <option value="">请选择票务类型:</option>
        <option v-for="ticketType in ticketTypes" :key="ticketType.ticket_type_id" :value="ticketType.ticket_type_id">
          {{ ticketType.ticket_type_name }}
        </option>
      </select>
      选择用票日期：<input v-model="queryData.ticket_use_date" type="date" @input="fetchOrders" />

    <!-- 根据状态筛选订单的标签页 -->
    <el-tabs v-model="currentTab" type="border-card" class="tabs">
      <el-tab-pane label="所有订单" name="all">
        <order-list :orders="orders" @order-click="handleOrderClick"/>
      </el-tab-pane>
      <el-tab-pane label="待支付" name="待支付">
        <order-list :orders="orders" @order-click="handleOrderClick"/>
      </el-tab-pane>
      <el-tab-pane label="已取消" name="已取消">
        <order-list :orders="orders" @order-click="handleOrderClick"/>
      </el-tab-pane>
      <el-tab-pane label="已支付" name="已支付">
        <order-list :orders="orders" @order-click="handleOrderClick"/>
      </el-tab-pane>
      <el-tab-pane label="已退款" name="已退款">
        <order-list :orders="orders" @order-click="handleOrderClick"/>
      </el-tab-pane>
      <el-tab-pane label="已完成" name="已完成">
        <order-list :orders="orders" @order-click="handleOrderClick"/>
      </el-tab-pane>
    </el-tabs>

    <!--显示详细订单信息-->
    <el-dialog title="订单详情" v-model="orderConfirmDialogVisible" width="50%" @close="resetOrderConfirm" class="order-dialog">
      <ul v-if="selectedOrder">
        <li>订单编号：{{ selectedOrder.order_id }}</li>
        <li>票务名称：{{ selectedOrder.ticket_name }}</li>
        <li>订单类型：{{ selectedOrder.ticket_type_name }}</li>
        <li>购票人姓名：{{ selectedOrder.user_name }}</li>
        <li>订单金额：{{ selectedOrder.order_price }}</li>
        <li>票务使用日期：{{ selectedOrder.ticket_use_date }}</li>
        <li>订单创建时间：{{ selectedOrder.order_created_time }}</li>
        <li>订单状态：{{ selectedOrder.order_status }}</li>
        <li v-if=" selectedOrder.is_use">是否使用：{{ selectedOrder.is_use ? '已使用' : '待使用' }}</li>
        <li v-if=" selectedOrder.order_payment_time">订单支付时间：{{ selectedOrder.order_payment_time }}</li>
        <li v-if=" selectedOrder.discount_amount">折扣金额：{{ selectedOrder.discount_amount }}</li>
        <li v-if=" selectedOrder.actual_payment_amount">实际支付金额：{{ selectedOrder.actual_payment_amount }}</li>
        <li v-if="selectedOrder.order_refund_amount">订单退款金额：{{ selectedOrder.order_refund_amount }}</li>
        <li v-if="selectedOrder.order_refund_time">订单退款时间：{{ selectedOrder.order_refund_time }}</li>
        <li v-if="selectedOrder.cancel_reason">订单取消原因：{{ selectedOrder.cancel_reason }}</li>
        <li v-if="selectedOrder.cancel_time != null ">订单取消时间：{{ selectedOrder.cancel_time }}</li>
        <li>游客数量：{{ selectedOrder.ticket_count}}</li>
        <el-row>
          <el-col :span="24">
            <div style="font-size: 18px; font-weight: bold;">游客列表</div>
          </el-col>
        </el-row>
        <el-table :data="visitors" v-if="visitors.length" style="margin-top: 0;">
          <el-table-column prop="visitor_name" label="姓名" />
          <el-table-column prop="visitor_code" label="身份证号" />
        </el-table>
        <template slot="footer" class="dialog-footer">
          <el-button v-show="selectedOrder.order_status === '待支付'" type="primary" @click="cancelOrder">取消订单</el-button>
          <el-button v-show="selectedOrder.order_status === '待支付'" type="primary" @click="confirmPayment">支付订单</el-button>
<!--          <el-button v-if="selectedOrder.order_status === '已支付' && isUser" type="primary" @click="refundOrder(selectedOrder)">申请退款</el-button>-->
          <el-tooltip
              v-if="selectedOrder.order_status === '已支付' && !this.isAdmin"
              class="item"
              effect="dark"
              content="距离票务使用日期不大于一天的扣款50%，不大于两天的扣款25%，其余扣款10%"
              placement="top"
          >
            <el-button type="primary" @click="refundOrder(selectedOrder)">申请退款</el-button>
          </el-tooltip>
          <el-button type="danger" @click="orderConfirmDialogVisible = false ;resetOrderConfirm">关闭</el-button>
        </template>
      </ul>
    </el-dialog>

    <!-- 取消原因弹框 -->
    <el-dialog
        title="取消订单"
        v-model="cancelDialogVisible"
        width="400px"
        @close="cancelDialogVisible = false"
        class="cancel-dialog"
    >
      <el-form :model="cancelForm">
        <el-form-item label="选择取消原因">
          <el-select v-model="cancelForm.cancel_reason" placeholder="请选择取消原因">
            <el-option label="个人原因" value="个人原因"></el-option>
            <el-option label="价格原因" value="价格原因"></el-option>
            <el-option label="其他" value="其他"></el-option>
          </el-select>
        </el-form-item>

        <!-- 其它原因输入框 -->
        <el-form-item v-if="cancelForm.cancel_reason === '其他'" label="请输入其他原因">
          <el-input v-model="cancelForm.other_reason" placeholder="请输入取消原因"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmCancel(selectedOrder.order_id)">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分页组件 -->
    <el-pagination
        :current-page="pagination.pageNum"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @current-change="handlePageChange"
        layout="prev, pager, next, jumper"
        class="pagination"
    ></el-pagination>
  </div>
</template>

<style scoped>
.orders {
  padding: 20px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.tabs {
  margin-bottom: 20px;
}

.order-dialog, .cancel-dialog {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.dialog-footer {
  padding-top: 15px;
  display: flex;
  justify-content: flex-end;
}
.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>

