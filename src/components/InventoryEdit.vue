<script>
import axios from "@/http";
export default {
  name: "InventoryEdit",
  data() {
    return {
      ticketInventoryList: [
          {
            ticket_id: null,
            ticket_name: null,
            inventory_date: null,
            inventory_total: null,
            inventory_sell:null,
            inventory_remain: null,
          },
      ],
      ticketName: "",
      inventoryDate: null,
      ticketNames: [], // 票务名称下拉框选项
      ticketInventory: 0,
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页显示条数
      total: 0, // 总条数
      pages: 0, // 总页数
      AddTicketInventoryVisible: false,
      newTicketInventory: {
        ticket_id: null,
        ticket_name: null,
        inventory_date: null,
        inventory_total: 100,
      },
      editTicketInventoryVisible: false,
      editTicketInventoryData: {
        ticket_id: null,
        ticket_name: null,
        inventory_date: null,
        inventory_total: null,
        new_total: null,
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
    }
  },
  created() {
    this.fetchTicketInventoryList()
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
    //搜索时先重置再获取
    search(){
      this.pageNum = 1;
      this.fetchTicketInventoryList();
    },
    fetchTicketInventoryList() {
      this.ticketInventoryList = [];
      axios.get("/api/admin/getTicketsInventory", {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          ticket_name: this.ticketName,
          ticket_type_name: this.ticketTypeName,
          inventory_date: this.inventoryDate,
        },
      }).then(res => {
        this.res = res;
        if (this.res.code === 20000) {
          this.ticketInventoryList = this.res.data.pageData;
          this.pages = res.data.pages;
        }
      }).catch(err => {
          console.error(err);
        });
    },
    openAddTicketInventoryDialog(){
      this.AddTicketInventoryVisible=true;
      if(!this.ticketNames.length){
        this.fetchTicketNames();
      }
    },
    submitNewTicketInventory() {
      if (!this.newTicketInventory.ticket_id || !this.newTicketInventory.inventory_date) {
        this.$message.error("请选择票务和库存日期");
        return;
      }
      if (!this.newTicketInventory.inventory_total) {
        this.$message.error("请输入库存量");
        return;
      }
      if (this.newTicketInventory.inventory_total<50) {
        this.$message.error("库存量不得少于50");
        return;
      }
      const payload = {
        ticket_id: this.newTicketInventory.ticket_id,
        inventory_date: this.formatDate(new Date(this.newTicketInventory.inventory_date).setHours(new Date(this.newTicketInventory.inventory_date).getHours() + 8)),
        inventory_total: this.newTicketInventory.inventory_total,
      };
      axios.post("/api/admin/addTicketInventory", payload).then(res => {
        this.res = res;
        if (this.res.code === 20000) {
          this.$message.success(this.res.message);
          this.ticketName = this.selectedTicketName;
          this.inventoryDate = this.formatDate(new Date(this.newTicketInventory.inventory_date).setHours(new Date(this.newTicketInventory.inventory_date).getHours() + 8));
          this.fetchTicketInventoryList();
        }
        else {
          this.$message.error(this.res.message);
        }
        this.closeAddDialog();
      }).catch(err => {
        console.error(err);
      });
    },
    closeAddDialog() {
      this.AddTicketInventoryVisible = false;
      this.newTicketInventory={
        ticket_id: null,
        inventory_date: null,
        inventory_total: 100,
      };
    },
    editTicketInventory(ticket){
      this.editTicketInventoryVisible = true;
      this.editTicketInventoryData = {
        ticket_id: ticket.ticket_id,
        ticket_name: ticket.ticket_name,
        inventory_date: this.formatDate(ticket.inventory_date),
        inventory_total: ticket.inventory_total,
      };
    },
    submitUpdatedTicketInventory(){
      if (this.editTicketInventoryData.new_total === null || this.editTicketInventoryData.new_total === "") {
        this.$message.error("写了新库存量再提交嘛！！！");
        return;
      }
      if (this.editTicketInventoryData.new_total === this.editTicketInventoryData.inventory_total) {
        this.$message.error("改了和没改一样！！！");
        return;
      }
      if (this.editTicketInventoryData.new_total < 50) {
        this.$message.error("库存量不得少于50");
        return;
      }
      axios.post("/api/admin/editTicketInventory", {
        ticket_id: this.editTicketInventoryData.ticket_id,
        inventory_date: this.formatDate(new Date(this.editTicketInventoryData.inventory_date).setHours(new Date(this.editTicketInventoryData.inventory_date).getHours() + 8)),
        old_total: this.editTicketInventoryData.old_total,
        new_total: this.editTicketInventoryData.new_total,
      }).then(res => {
        this.res = res;
        if (this.res.code === 20000) {
          this.ticketInventoryList = [];
          this.ticketName = this.editTicketInventoryData.ticket_name;
          this.inventoryDate = this.editTicketInventoryData.inventory_date;
          this.fetchTicketInventoryList();
          this.$message.success(this.res.message);
          this.closeEditDialog();
        }
      }).catch(err => {
        console.error(err);
      })
    },
    closeEditDialog(){
      this.editTicketInventoryVisible = false;
      this.editTicketInventoryData = {
        ticket_id: null,
        ticket_name: null,
        inventory_date: null,
        old_total: null,
        new_total: null,
      };
    },
    formatDate(date) {
      const dateObj = new Date(date);
      return dateObj.toISOString().split('T')[0];
    },
    changePage(newPageNum) {
      this.pageNum = newPageNum;
      this.fetchTickets(); // 获取新页的数据
    },
  },
  computed: {
    disabledDate() {
      return (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 重置时间，避免时间不一致的问题
        const after15Days = new Date(today);
        after15Days.setDate(today.getDate() + 15);
        return date.getTime() < after15Days.getTime();  // 禁止选择15天之前的日期
      };
    },
    selectedTicketName() {
      const selectedTicket = this.ticketNames.find(ticket => ticket.ticket_id === this.newTicketInventory.ticket_id);
      return selectedTicket ? selectedTicket.ticket_name : '';
    }
  }
}
</script>

<template>
  <div>
    <!-- 标题 -->
    <h1>库存管理</h1>

    <!-- 搜索栏 -->
    <div>
      <!-- 票务名称选择框 -->
      <select v-model="ticketName" @focus="fetchTicketNames" @change="search">
        <option value="">请选择票务名称</option>
        <option v-for="ticket in ticketNames" :key="ticket.ticket_id" :value="ticket.ticket_name">
          {{ ticket.ticket_name }}
        </option>
      </select>

      <!-- 库存日期选择 -->
      选择库存日期：<input v-model="inventoryDate" type="date" @input="search" />
      <button @click="openAddTicketInventoryDialog">添加库存信息</button>
    </div>

    <!-- 票务列表表格 -->
    <div>
      <table>
        <thead>
        <tr>
          <th>票务 ID</th>
          <th>票务名称</th>
          <th>库存日期</th>
          <th>库存票数</th>
          <th>已售票数</th>
          <th>剩余票数</th>
          <th>操作</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="ticket in ticketInventoryList" :key="ticket.ticket_id + ticket.inventory_date">
          <td>{{ ticket.ticket_id }}</td>
          <td>{{ ticket.ticket_name }}</td>
          <td>{{ ticket.inventory_date}}</td>
          <td>{{ ticket.inventory_total}}</td>
          <td>{{ ticket.inventory_sell}}</td>
          <td>{{ ticket.inventory_remain}}</td>
          <td>
            <button @click="editTicketInventory(ticket)">修改库存</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <el-dialog title="添加票务库存信息" v-model="AddTicketInventoryVisible">
      <div>
        <!-- 票务名称选择框 -->
        <label>票务名称</label>
        <el-select v-model="newTicketInventory.ticket_id" placeholder="请选择票务" required>
          <el-option
              v-for="ticket in ticketNames"
              :key="ticket.ticket_id"
              :label="ticket.ticket_name"
              :value="ticket.ticket_id">
          </el-option>
        </el-select>
      </div>

      <!-- 日期输入框，限制只能选择15天后的日期 -->
      <div>
        <label>库存日期</label>
        <el-date-picker
            v-model="newTicketInventory.inventory_date"
            type="date"
            placeholder="请选择日期"
            :disabled-date="disabledDate"
            required>
        </el-date-picker>
      </div>

      <!-- 库存量输入框 -->
      <div>
        <label>库存量</label>
        <el-input
            type="number"
            v-model="newTicketInventory.inventory_total"
            placeholder="请输入库存量"
            required>
        </el-input>
      </div>

      <!-- 操作按钮 -->
      <div slot="footer">
        <el-button @click="closeAddDialog">取消</el-button>
        <el-button type="primary" @click="submitNewTicketInventory">提交</el-button>
      </div>
    </el-dialog>
    <!-- 编辑库存的弹窗 -->
    <el-dialog title="编辑票价" v-model="editTicketInventoryVisible">
      <div>
        <div>
          <label>票务名称：</label>
          <label>{{ editTicketInventoryData.ticket_name }}</label>
        </div>
        <div>
          <label>库存日期：</label>
          <label>{{ editTicketInventoryData.inventory_date }}</label>
        </div>
        <div>
          <label>原库存量: </label>
          <label>{{ editTicketInventoryData.inventory_total }}</label>
        </div>
        <div>
          <input
              type="number"
              v-model="editTicketInventoryData.new_total"
              :placeholder="`请输入新库存量`"
              required
          />
        </div>
      </div>
      <div slot="footer">
        <el-button @click="closeEditDialog">取消</el-button>
        <el-button type="primary" @click="submitUpdatedTicketInventory">修改</el-button>
      </div>
    </el-dialog>
    <!-- 分页控件 -->
    <div>
      <button :disabled="pageNum === 1" @click="changePage(pageNum - 1)">上一页</button>
      <span>第 {{ pageNum }} 页 / 共 {{ pages }} 页</span>
      <button :disabled="pageNum === pages" @click="changePage(pageNum + 1)">下一页</button>
    </div>
  </div>
</template>


<style scoped>

</style>