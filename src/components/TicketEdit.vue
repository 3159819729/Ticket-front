<script>
import axios from "@/http";
export default {
  name: "TicketEdit",
  data() {
    return {
      tickets: [], // 存储票务列表
      ticketName: "", // 当前选中的票务名称
      ticketTypeName: "", // 当前选中的票种类型
      ticketNames: [], // 票务名称下拉框选项
      ticketTypes: [], // 票种类型下拉框选项
      addTicketVisible: false,
      deleteTicketVisible: false,
      newTicket: {
        ticket_name: null,
        prices: {
          ticket_type_id: null,
          ticket_price: null,
        },
      },
      deleteTicketId: "",
      editTicketVisible: false, // 是否显示编辑票价弹窗
      editTicketData: {
        ticket_id: null,
        ticket_name: null,
        ticket_type_id: null,
        ticket_type_name: null,
        old_price: null,
        new_price: null,
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
  created() {
    this.fetchTickets();
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
    fetchTickets() {
      this.tickets = [];
      axios.get("/api/admin/getTickets", {
        params: {
          ticket_name: this.ticketName,
          ticket_type_name: this.ticketTypeName,
        },
      })
      .then(res => {
        this.res = res;
        if (this.res.code === 20000) {
          this.tickets = this.res.data;
        }
      })
      .catch(err => {
        console.error(err);
      });
    },
    openAddTicketDialog() {
      this.addTicketVisible = true;
      if(!this.ticketTypes.length){
        this.fetchTicketTypes();
      }
    },
    openDeleteTicketDialog(){
      this.deleteTicketVisible = true;
      if(!this.ticketNames.length){
        this.fetchTicketNames();
      }
      console.log(this.ticketNames);
    },
    // 打开编辑票价对话框
    editTicketPrice(ticket) {
      this.editTicketData.ticket_id = ticket.ticket_id;
      this.editTicketData.ticket_name = ticket.ticket_name;
      this.editTicketData.ticket_type_id = ticket.ticket_type_id;
      this.editTicketData.ticket_type_name = ticket.ticket_type_name;
      this.editTicketData.old_price = ticket.ticket_price;
      this.editTicketVisible = true;
    },
    submitUpdatedTicketPrice() {
      if(this.editTicketData.new_price === "" || this.editTicketData.new_price=== null){
        this.$message.error("写了新价格再提交嘛！！！");
        return;
      }
      if(this.editTicketData.new_price === this.editTicketData.old_price){
        this.$message.error("改了和没改一样！！！");
        return;
      }
      if(this.editTicketData.new_price < 0){
        this.$message.error("不要亏钱啊！！！");
        return;
      }
      axios.post('/api/admin/editTicketPrice', {
        ticket_id: this.editTicketData.ticket_id,
        ticket_type_id: this.editTicketData.ticket_type_id,
        old_price: this.editTicketData.old_price,
        new_price: this.editTicketData.new_price
      })
        .then(res =>{
          this.res = res;
          if( this.res.code === 20000) {
            this.tickets = [];
            this.ticketName = this.editTicketData.ticket_name;
            this.ticketTypeName = this.editTicketData.ticket_type_name;
            this.$message.success(this.res.message);
            this.fetchTickets();
            this.closeEditDialog();
          }})
        .catch(err =>{
          console.error(err);
        })
    },
    // 关闭编辑票价对话框
    closeEditDialog() {
      this.editTicketVisible = false;
      this.editTicketData = {
        ticket_id: null,
        ticket_name: null,
        ticket_type_id: null,
        ticket_type_name: null,
        old_price: null,
        new_price: null,
      };
    },
    // 关闭弹窗
    closeAddDialog() {
      this.addTicketVisible = false;
      //清除输入框的值
      this.newTicket = {
        ticket_name: null,
        prices: {
          ticket_type_id: null,
          ticket_price: null,
        },
      };
    },
    closeDeleteDialog(){
      this.deleteTicketVisible = false;
      this.deleteTicketId = "";
    },
    // 提交新增票务
    submitNewTicket() {
      if(!this.newTicket.ticket_name){
        this.$message.error("票务名称不能为空");
        return;
      }
      for (let i = 0; i < this.ticketTypes.length; i++) {
        if (this.newTicket.prices[this.ticketTypes[i].ticket_type_id] === "" || this.newTicket.prices[this.ticketTypes[i].ticket_type_id] === undefined) {
          this.$message.error(`票种类型为${this.ticketTypes[i].ticket_type_name}的票价不能为空`);
          return;
        }
      }
      const payload = {
        ticket_name: this.newTicket.ticket_name,
        ticket_prices: this.ticketTypes.map(ticketType => ({
          ticket_type_id: ticketType.ticket_type_id,
          ticket_price: this.newTicket.prices[ticketType.ticket_type_id],
        }))
      };
      axios.post("/api/admin/addTicket", payload)
          .then(res => {
            this.res = res;
            if (this.res.code === 20000) {
              this.fetchTickets();
              this.$message.success(this.res.message);
              this.ticketNames = [];
            }
            this.closeAddDialog();
          }).catch(err => {
            console.error(err);
          });
    },
    deleteTicket(){
      axios.post("/api/admin/deleteTicket", {
        ticket_id: this.deleteTicketId,
      }).then(res => {
        this.res = res;
        if (this.res.code === 20000) {
          this.fetchTickets();
          this.$message.success(this.res.message);
          this.ticketNames = [];
          this.closeDeleteDialog();
        }
      }).catch(err => {
        console.error(err);
      });
    },

  },
};
</script>

<template>
  <div>
    <!-- 票务列表部分 -->
    <h1>票务列表</h1>
    <div>
      <select v-model="ticketName" @focus="fetchTicketNames" @change="fetchTickets">
        <option value="">请选择票务名称</option>
        <option v-for="ticket in ticketNames" :key="ticket.ticket_id" :value="ticket.ticket_name">
          {{ ticket.ticket_name }}
        </option>
      </select>
      <select v-model="ticketTypeName" @focus="fetchTicketTypes" @change="fetchTickets">
        <option value="">请选择票种类型</option>
        <option v-for="ticketType in ticketTypes" :key="ticketType.ticket_type_id" :value="ticketType.ticket_type_name">
          {{ ticketType.ticket_type_name }}
        </option>
      </select>
      <button @click="openAddTicketDialog">添加票务</button>
      <button @click="openDeleteTicketDialog">删除票务</button>
    </div>

    <!-- 票务列表表格 -->
    <table>
      <thead>
      <tr><th>票务名称</th><th>票种类型</th><th>票价</th><th>操作</th></tr>
      </thead>
      <tbody>
      <tr v-for="ticket in tickets" :key="ticket.ticket_id + ticket.ticket_type_id">
        <td>{{ ticket.ticket_name }}</td>
        <td>{{ ticket.ticket_type_name }}</td>
        <td>{{ ticket.ticket_price }}</td>
        <td>
          <button @click="editTicketPrice(ticket)">修改票价</button>
        </td>
      </tr>
      </tbody>
    </table>
    <el-dialog title="添加票务" v-model="addTicketVisible">
      <div>
        <div>
          <label>票务名称</label>
          <input
              type="text"
              v-model="newTicket.ticket_name"
              id="ticket_name"
              placeholder="请输入票务名称"
              required
          />
        </div>
        <!-- 票种类型及价格输入框 -->
        <div v-for="ticketType in ticketTypes" :key="ticketType.ticket_type_id">
          <label :for="`price_${ticketType.ticket_type_name}`">{{ ticketType.ticket_type_name }} 票价</label>
          <input
              type="number"
              v-model="newTicket.prices[ticketType.ticket_type_id]"
              :id="`price_${ticketType.ticket_type_id}`"
              :placeholder="`请输入${ticketType.ticket_type_name}票价`"
              required
          />元/人
        </div>
      </div>

      <!-- 操作按钮 -->
      <div slot="footer">
        <el-button @click="closeAddDialog">取消</el-button>
        <el-button type="primary" @click="submitNewTicket">提交</el-button>
      </div>
    </el-dialog>
    <el-dialog title="删除票务" v-model="deleteTicketVisible">
      <div>
        <label>选择需要删除的票务</label>
        <el-select v-model="deleteTicketId" placeholder="请选择票务">
          <el-option
              v-for="ticket in ticketNames"
              :key="ticket.ticket_id"
              :label="ticket.ticket_name"
              :value="ticket.ticket_id"
          ></el-option>
        </el-select>
      </div>
      <!-- 操作按钮 -->
      <div slot="footer">
        <el-button @click="closeDeleteDialog">取消</el-button>
        <el-button type="primary" @click="deleteTicket">确认删除</el-button>
      </div>
    </el-dialog>
    <!-- 编辑票价的弹窗 -->
    <el-dialog title="编辑票价" v-model="editTicketVisible">
      <div>
        <div>
          <label>票务名称：</label>
          <label>{{ editTicketData.ticket_name }}</label>
        </div>
        <div>
          <label>票务类型：</label>
          <label>{{ editTicketData.ticket_type_name }}</label>
        </div>
        <div>
          <span>原票价: {{ editTicketData.old_price }} 元/人</span>
        </div>
        <div>
          <input
              type="number"
              v-model="editTicketData.new_price"
              :placeholder="`请输入新票价`"
              required
          /> 元/人
        </div>
      </div>
      <div slot="footer">
        <el-button @click="closeEditDialog">取消</el-button>
        <el-button type="primary" @click="submitUpdatedTicketPrice">修改</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>

</style>
