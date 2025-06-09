<script>
import axios from "@/http";
import {ElMessage} from "element-plus";
import {mapState } from 'vuex';
export default {
  name: "Main",
  data() {
    return {
      ticketCount: 1, // 默认为1的购票数量
      ticketUseDate: '', // 用票日期
      ticketRemain: null,
      visitors: [
          { name: '',
            code: '',
            errorMessage: ''
          }
      ], // 游客信息数组
      frequentVisitors: [
          {
            visitor_name: '',
            visitor_code: ''
          }
      ],
      orderData:{
        ticket_id: null,
        ticket_name: null,
        ticket_type: null,
        order_price: null,
        ticket_use_date: null,
        order_status: null,
        is_use: null,
        visitors: [
          {
            visitor_name: null,
            visitor_code: null
          }
        ],
        order_payment_time: null,
        discountRate: null,
        discount_amount:null,
        actual_payment_amount: null,
        ticket_count: null,
      },
      currentEditingVisitorIndex: null,   // 当前正在编辑的游客索引
      frequentVisitorListDialogVisible: false,// 常用游客浮窗
      orderConfirmDialogVisible: false,// 订单确认浮窗
      OrderId: null,// 订单ID
      cancelDialogVisible: false,// 取消订单浮窗
      cancelForm: {
        cancel_reason: '', // 取消原因
        other_reason: ''
      },
      blackCodeList: [
        {
          code:''
        }
      ],// 黑名单
      inBlackList: false,
      inventoryData: [
          {
            inventory_date:'',
            inventory_remain:''
          }
      ], // 存储库存数据
      res:{
        code: null,
        message: null,
        data: [],
      },
      selectedTicket: null,
      selectedTicketType: null,
      ticketList: [
        {
          ticket_id: "",
          ticket_name: "",
          prices: [
            {
              ticket_type_name: "",
              ticket_price: "",
            },
          ],
        },
      ],
      lastFetchTime: null, // 记录上次请求时间
    }
  },
  mounted() {
    this.fetchTickets();
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn !== null) {
      this.$store.commit('setIsLoggedIn',isLoggedIn)
    }
    const isAdminLocal = localStorage.getItem('isAdmin');
    if (isAdminLocal !== null) {
      const isAdmin = isAdminLocal === 'true';
      this.$store.commit('setIsAdmin',isAdmin)
    }
    const id = localStorage.getItem('id');
    if (id !== null) {
      this.$store.commit('setId',id)
    }
  },
  computed: {
    ...mapState(['isLoggedIn','isAdmin','id','currentStep']),
    totalAmount() {
      return (this.selectedTicketType?.ticket_price || 0) * (this.ticketCount || 0);
    },
  },
  methods: {
    async fetchTickets() {
      const now = Date.now();
      const cacheDuration = 10 * 60 * 1000; // 10 分钟缓存
      if (this.ticketList.length > 0 && now - this.lastFetchTime < cacheDuration) {
        return Promise.resolve(this.ticketList);
      }
      try {
        const res = await axios.get("/api/tickets");
        const { code, data } = res;
        if (code === 20000) {
          this.ticketList = data;
          return data;
        }
      } catch (err) {
        console.error("获取票务信息失败:", err);
      }
    },
    openFrequentVisitorsDialog(index) {
      this.currentEditingVisitorIndex = index; // 记录当前操作的游客框索引
      this.getFrequentVisitors(); // 获取常用游客列表
      this.frequentVisitorListDialogVisible = true;  // 显示浮窗
    },
    getFrequentVisitors() {
      axios.get('/api/user/visitors').then(res => {
        this.res=res
        if (this.res.code === 20000) {
          this.frequentVisitors = this.res.data
        }
      }).catch(err =>
          console.error(err)
      );
    },
    resetDialog() {
      this.frequentVisitors = [];  // 清空常用游客列表
    },
    // 添加常用游客到当前游客列表
    addFrequentVisitor(frequentVisitor) {
      // 检查身份证号码是否已经存在
      const isDuplicate = this.visitors.some(visitor => visitor.code === frequentVisitor.visitor_code);

      if (isDuplicate) {
        // 显示提示信息，表明该身份证号已存在
        ElMessage({
          type: 'error',
          message: '请勿重复添加！'
        });
        return; // 如果已存在，则不进行添加
      }
      this.visitors[this.currentEditingVisitorIndex].name = frequentVisitor.visitor_name;
      this.visitors[this.currentEditingVisitorIndex].code = frequentVisitor.visitor_code;
      this.frequentVisitorListDialogVisible = false; // 关闭浮窗
    },
    checkDuplicateCode(code, index) {
      // 清除之前的错误消息
      this.visitors[index].errorMessage = '';

      // 检查当前输入的身份证号码是否重复
      const isDuplicate = this.visitors.some((visitor, idx) => visitor.code === code && idx !== index);

      if (isDuplicate) {
        // 如果重复，设置错误消息
        this.visitors[index].errorMessage = '该身份证号码已经存在，不能重复添加！';
      }
    },
    goToMain() {
      this.selectedTicket = null;
      this.selectedTicketType = null;
      this.$store.commit('setCurrentStep',1);
    },
    goToTicketTypes(ticket) {
      this.selectedTicket = ticket;
      this.$store.commit('setCurrentStep',2);
    },
    async goToOrder(type) {
      try {
        // 执行请求获取库存信息
        const { code, data } = await axios.post('/api/ticket/getInventory', { ticket_id: this.selectedTicket.ticket_id });

        if (code === 20000) {
          this.inventoryData = data;
          if (!this.isLoggedIn) {
            this.showLoginPrompt(type); // 未登录时提示登录
            return; // 不继续执行后续代码
          }
        this.selectedTicketType = type;
        this.$store.commit('setCurrentStep',3);
      }else {
          this.$message.error("获取库存信息失败");
        }
    }catch (err){
        this.$message.error(err);
      }
    this.ticketUseDate=''
      this.visitors=[
        { name: '',
          code: '',
          errorMessage: ''
        }
      ]
      this.ticketCount = 1;
    },
    showLoginPrompt(type) {
      this.$message.warning("请先登录");
      this.$emit('showLoginPopover', 'user');
      this.selectedTicketType=type;
      const checkLoginInterval = setInterval(() => {
        if (this.isLoggedIn === 'true') {
          this.$store.commit('setCurrentStep',3);
          clearInterval(checkLoginInterval); // 清除定时器
        }
      }, 1000); // 每秒检查一次登录状态
    },
    increaseTicketCount() {
      this.ticketCount++;
      this.visitors.push({name: '', code: '', errorMessage: ''});
    },
    decreaseTicketCount() {
      if (this.ticketCount > 1) {
        this.ticketCount--;
        if (this.visitors.length > 1) {
          this.visitors.pop(); // 移除最后一个游客信息输入框
        }
      }
    },
    selectDate(inventory) {
      this.ticketUseDate = inventory.inventory_date;
      this.ticketRemain = inventory.inventory_remain;
    },
    submitOrder() {
      if (!this.ticketUseDate) {
        ElMessage({
          type: 'error',
          message: '请选择票的使用日期！'
        });
        return;
      }
      console.log(this.ticketCount,this.ticketRemain)
      if(this.ticketCount>this.ticketRemain){
        ElMessage({
          type: 'error',
          message: '票的数量不能大于库存！'
        });
        return;
      }
      const hasEmptyFields = this.visitors.some(visitor => {
        return !visitor.name || !visitor.code; // 检查姓名和身份证号码
      });
      if (hasEmptyFields) {
        ElMessage({
          type: 'error',
          message: '请确保所有游客的姓名和身份证号码都已填写！'
        });
        return;
      }
      const hasError = this.visitors.some(visitor => visitor.errorMessage !== '');
      if (hasError) {
        ElMessage({
          type: 'error',
          message: '请检查游客信息，确保没有重复的身份证号码！'
        });
        return;
      }
      axios.get('/api/user/checkOrderStatus').then(({code,data}) => {
        if (code === 20000) {
          if(data===true){
            alert('您有待支付订单，请先支付')
            this.$router.push('infoCenter/orders');
          }
          else {
            const visitorCodes = this.visitors.map(visitor => visitor.code); // 提取游客身份证号列表
            axios.post('/api/checkBlackCode',{visitorCodes}).then(({code,data})=>{
              if(code===20000 && data.inBlackList===true) {
                alert(`以下游客的身份证号在黑名单中: ${data.blackCodeList.join(', ')},请联系管理员`);
                this.goToMain()
              }
              else {
                const orderData = {
                  user_id: this.id,
                  ticket_id: this.selectedTicket.ticket_id,
                  ticket_name: this.selectedTicket.ticket_name,
                  ticket_type_id: this.selectedTicketType.ticket_type_id,
                  ticket_type_name: this.selectedTicketType.ticket_type_name,
                  order_price: this.selectedTicketType.ticket_price * this.ticketCount,
                  ticket_use_date: this.ticketUseDate,
                  visitors: this.visitors.map(visitor => ({
                    visitor_name: visitor.name,
                    visitor_code: visitor.code
                  })),
                  ticket_count: this.ticketCount,
                }
                this.payOrder().then(() => {
                  orderData.order_status = "已支付";
                  orderData.is_use = false;
                  orderData.order_payment_time = this.$store.getters.getLocalTime;
                  orderData.discount_amount = this.discount_amount;
                  orderData.actual_payment_amount = this.actual_payment_amount;
                  this.createOrder(orderData);
                }).catch(() => {
                  orderData.order_status = "待支付"
                  this.createOrder(orderData);
                });
              }
            }).catch(err=>{
              console.error(err);
            })
          }
        }
      }).catch(err=>{
        console.error(err);
      })
    },
    payOrder() {
      return new Promise((resolve, reject) => {
        axios.post('/api/getDiscount', { ticket_use_date: this.ticketUseDate })
          .then(({data}) => {
            if (!data) {
              this.discountRate = 1;
            } else {
              this.discountRate = data.discount_rate;
            }
            this.order_price = this.selectedTicketType.ticket_price * this.ticketCount; // 原价
            this.discount_amount = (this.order_price * (1 - this.discountRate)).toFixed(2); // 折扣金额
            this.actual_payment_amount = this.order_price - this.discount_amount; // 实际支付金额

            // 自定义弹窗内容
            const paymentDetails = `
            <div>
              <p><strong>票务名称：</strong>${this.selectedTicket.ticket_name} - ${this.selectedTicketType.ticket_type_name}</p>
              <p><strong>原价：</strong>￥${this.order_price}</p>
              <p><strong>折扣：</strong>￥${this.discountRate === 1 ? '无折扣' : this.discount_amount}</p>
              <p><strong>支付金额：</strong>￥${this.actual_payment_amount}</p>
              <p><strong>数量：</strong>${this.ticketCount}</p>
            </div>`;
            // 使用 ElDialog 或类似组件自定义一个支付确认弹窗
            this.$confirm(paymentDetails, '支付确认', {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确认支付',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              // 执行支付成功逻辑
              resolve(true); // 模拟支付成功
            }).catch(() => {
              reject(false);
            });
          });
      });
    },
    // 创建订单方法
    createOrder(orderData) {
      axios.post('/api/user/addOrder', orderData)
          .then(({code,message,data}) => {
            if (code === 20000) {
              this.OrderId = data.order_id;
              if (orderData.order_status === "待支付") {
                this.orderConfirmDialogVisible = true;
              }
              if(orderData.order_status === "已支付") {
                this.$message.success(message);
                // 弹出确认对话框，询问用户接下来的操作
                this.$confirm('支付成功！请选择接下来的操作：', '操作选择', {
                  confirmButtonText: '查看订单',
                  cancelButtonText: '返回主界面',
                  type: 'success'
                }).then(() => {
                  // 用户选择查看订单
                  this.goToOrdersPage();
                }).catch(() => {
                  // 用户选择返回主界面
                  this.goToMain();
                });
              }
            }
          })
          .catch((error) => {
            console.error(error);
            this.$message.error('订单创建失败，请重试');
          });
    },
    // 支付取消后再次支付
    confirmPayment() {
      // 调用支付确认函数
      this.payOrder().then(() => {
        const payOrderData = {
          order_id: this.OrderId,  // 要更新的订单ID
          order_status: '已支付',  // 更新为已支付
          is_use: false,
          discount_amount: 0,  // 折扣金额
          actual_payment_amount: this.selectedTicketType.ticket_price * this.ticketCount,  // 实际支付金额
          order_payment_time : this.$store.getters.getLocalTime
        };
        this.updateOrder(payOrderData);
      });
    },
    updateOrder(payOrderData) {
      axios.post('/api/user/payOrder', payOrderData)
          .then(({code,message}) => {
            if (code === 20000) {
              this.$message.success(message);
              // 弹出确认对话框，询问用户接下来的操作
              this.$confirm('支付成功！请选择接下来的操作：', '操作选择', {
                confirmButtonText: '查看订单',
                cancelButtonText: '返回主界面',
                type: 'success'
              }).then(() => {
                // 用户选择查看订单
                this.orderConfirmDialogVisible = false;
                this.$message.success("点击了查看订单");
                this.goToOrdersPage();
              }).catch(() => {
                this.orderConfirmDialogVisible = false;
                this.$message.success("点击了返回主界面");
                // 用户选择返回主界面
                this.goToMain();
              });
            }
          })
          .catch((error) => {this.$message.error(error);});
    },
    cancelOrder() {
      this.cancelForm.cancel_reason = ''; // 清空取消原因
      this.cancelForm.other_reason = ''; // 清空其他原因
      this.cancelDialogVisible = true;
    },
    // 重置取消表单（弹窗关闭时）
    resetCancelForm() {
      this.cancelForm.cancel_reason = '';
      this.cancelForm.other_reason = '';
    },
    // 提交取消请求
    async confirmCancel(orderId) {
      if (!this.cancelForm.cancel_reason || (this.cancelForm.cancel_reason === "其他" && !this.cancelForm.other_reason)) {
        return this.$message.error("请输入有效的取消原因");
      }
      try {
        await this.$confirm('取消操作是不可逆的，您确定要继续吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        const cancelReason = this.cancelForm.cancel_reason === '其他'
              ? this.cancelForm.other_reason
              : this.cancelForm.cancel_reason;
        const res = await this.$store.dispatch('confirmCancelOrder', { orderId, cancelReason });
        console.log("取消成功了");
        console.log(res)
        this.$message.success(res.message);
        this.cancelDialogVisible = false;
        this.orderConfirmDialogVisible = false;
        console.log("应该隐藏浮窗了")
        this.goToMain();
      } catch(error) {
        console.log("不取消了");
        // 如果是用户点了“取消”按钮，不做操作
        if (error === 'cancel') {
          this.cancelDialogVisible = false;  // 关闭取消浮窗
          return;
        }
        this.$message.error(error);
      }
    },
    goToOrdersPage() {
      this.$router.push('infoCenter/orders');
    },
  },
};
</script>
<template>
  <div class="main_container">
    <el-container>
      <el-header class="header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item @click="goToMain">景区票务</el-breadcrumb-item>
          <el-breadcrumb-item v-if="this.currentStep > 1" @click="goToTicketTypes(selectedTicket)">票务类型</el-breadcrumb-item>
          <el-breadcrumb-item v-if="this.currentStep > 2">填写订单</el-breadcrumb-item>
        </el-breadcrumb>
      </el-header>

      <el-main class="main_content">
        <!-- 默认显示景区门票 -->
        <el-row :gutter = "20">
          <el-col :span="10">
            <div v-if="this.currentStep === 1" class="ticket-list">
              <div
                  v-for="ticket in this.ticketList"
                  :key="ticket.ticket_id"
                  @click="goToTicketTypes(ticket)"
                  class="ticket-item"
              >
                <el-card class="ticket-card" shadow="hover">
                  <div class="ticket-name">{{ ticket.ticket_name }}</div>
                </el-card>
              </div>
            </div>

            <!-- 票务类型 -->
            <div v-if="this.currentStep === 2" class="ticket-types">
              <div v-for="type in this.selectedTicket.prices" :key="type.ticket_type_name" class="ticket-type-item">
                <div class="ticket-type-info">
                  <span class="ticket-type-name">{{ type.ticket_type_name }}</span>
                  <span class="ticket-price">{{ type.ticket_price }} 元</span>
                </div>
                <el-tooltip :content="type.description" placement="top">
                  <el-button v-if="isAdmin === false" type="primary" class="purchase-button" @click="goToOrder(type)">购票</el-button>
                </el-tooltip>
              </div>
            </div>

            <!-- 填写订单 -->
            <div v-if="this.currentStep === 3" class="order-form">
              <!-- 日期选择按钮 -->
              <div v-if="inventoryData.length > 0" class="inventory-selection">
                <div class="inventory-buttons">
                  <button
                      v-for="(inventory, index) in inventoryData"
                      :key="index"
                      class="inventory-button"
                      :class="{'selected': ticketUseDate === inventory.inventory_date}"
                      @click="selectDate(inventory)"
                  >
                    <span>{{ inventory.inventory_date }}</span>
                    <br>
                    <span>{{ inventory.inventory_remain }} 件</span>
                  </button>
                </div>
              </div>
              <div class="ticket-quantity">
                <span>购票数量:</span>
                <el-button @click="decreaseTicketCount" :disabled="ticketCount <= 1">-</el-button>
                <span>{{ ticketCount }}</span>
                <el-button @click="increaseTicketCount">+</el-button>
              </div>
              <h4>总价格: {{ totalAmount }} 元</h4>

              <h5>游客信息:</h5>
              <div v-for="(visitor, index) in visitors" :key="index" class="visitor-form">
                <el-input v-model="visitor.name" placeholder="姓名" />
                <el-input v-model="visitor.code" placeholder="身份证号码" @input="checkDuplicateCode(visitor.code, index)" />
                <span v-if="visitor.errorMessage" class="error-message">{{ visitor.errorMessage }}</span>
                <el-button type="primary" class="quick-add-button" @click="openFrequentVisitorsDialog(index)">快速添加</el-button>
              </div>

              <el-button type="primary" class="submit-order" @click="submitOrder">提交订单</el-button>
            </div>

            <!-- 弹窗显示常用游客 -->
            <el-dialog v-model="frequentVisitorListDialogVisible" title="选择常用游客" width="50%" @close="resetDialog">
              <div v-for="(frequentVisitor, index) in frequentVisitors" :key="index" class="frequent-visitor-item">
                <el-col :span="12">{{ frequentVisitor.visitor_name }} - {{ frequentVisitor.visitor_code }}</el-col>
                <el-col :span="12">
                  <el-button type="success" @click="addFrequentVisitor(frequentVisitor)">添加</el-button>
                </el-col>
              </div>
            </el-dialog>

            <!-- 订单确认浮窗 -->
            <el-dialog v-model="orderConfirmDialogVisible" title="订单确认" width="50%" @close="goToMain">
              <div>
                <p><strong>票务名称:</strong> {{ selectedTicket?.ticket_name || '暂无数据' }}</p>
                <p><strong>票务类型:</strong> {{ selectedTicketType?.ticket_type_name || '暂无数据'}}</p>
                <p><strong>用票日期:</strong> {{ ticketUseDate }}</p>
                <p><strong>购票数量:</strong> {{ ticketCount }}</p>
                <p><strong>总金额:</strong> {{ totalAmount }} 元</p>
                <h5>游客信息:</h5>
                <ul>
                  <li v-for="(visitor, index) in visitors" :key="index">
                    {{ visitor.name }} - {{ visitor.code }}
                  </li>
                </ul>
              </div>
              <div slot="footer" class="dialog-footer">
                <el-button type="danger" @click="cancelOrder">取消订单</el-button>
                <el-button type="primary" @click="goToOrdersPage">查看订单列表</el-button>
                <el-button type="success" @click="confirmPayment">支付</el-button>
              </div>
            </el-dialog>

            <!-- 取消原因弹框 -->
            <el-dialog
                title="取消订单"
                v-model="cancelDialogVisible"
                width="400px"
                @close="resetCancelForm"
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
                <el-button @click="cancelDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmCancel(OrderId)">确定</el-button>
              </span>
            </el-dialog>
          </el-col>
          <el-col :span="14">
            <div style="height: calc(100vh - 100px); background-color: #f5f5f5;">
              <img src="/xuanchuantu.png" alt="宣传图" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>
<style scoped>
.main_container {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(to right, #1381FA, #29CBDA);
  color: white;
  padding: 15px;
  font-size: 18px;
}

.ticket-list, .ticket-types, .order-form {
  padding: 20px;
}

.ticket-item {
  margin-bottom: 15px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.ticket-item:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ticket-card {
  padding: 15px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ticket-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.ticket-type-item {
  background-color: white;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ticket-type-name {
  font-size: 16px;
  color: #555;
}

.ticket-price {
  font-size: 18px;
  color: #ff5722;
}

.purchase-button {
  font-size: 14px;
  padding: 6px 16px;
  border-radius: 20px;
  background-color: #1381FA;
}

.purchase-button:hover {
  background-color: #29CBDA;
}

.inventory-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.inventory-button {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  width: 120px;
  text-align: center;
  font-size: 14px;
}

.inventory-button.selected {
  background-color: #1381FA;
  color: white;
}

.inventory-button:hover {
  background-color: #e8f7ff;
}

.ticket-quantity {
  display: flex;
  align-items: center;
  margin-top: 15px;
}

.ticket-quantity span {
  font-size: 16px;
  margin-right: 10px;
}

.submit-order {
  margin-top: 20px;
}

.visitor-form {
  margin-bottom: 15px;
}

.error-message {
  color: red;
  font-size: 12px;
}

.quick-add-button {
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
}

.dialog-footer{
  width: 100px;
}
</style>
