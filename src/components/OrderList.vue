<script>
export default {
  name: 'OrderList',
  props: {
    orders: Array, // 从父组件传递的订单列表
  },
  methods: {
    orderClick(order) {
      this.$emit('order-click', order); // 向父组件传递订单数据
    },
  },
};
</script>
<template>
  <div class="order-list">
    <el-table :data="orders" stripe border style="width: 100%" class="order-table">
      <el-table-column label="票种" prop="ticket_name" width="180" />
      <el-table-column label="票价" prop="order_price" width="120" />
      <el-table-column label="使用日期" prop="ticket_use_date" width="180" />
      <el-table-column label="状态" prop="order_status" width="120" />
      <el-table-column label="操作" width="200">
        <template v-slot="scope">
          <el-button @click="orderClick(scope.row)" type="primary" size="small" class="action-button">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.order-list {
  margin-top: 20px; /* 组件顶部的间距 */
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.order-table {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.el-table {
  font-size: 14px;
}

.el-table-column {
  text-align: center;
}

.el-table th {
  background-color: #f4f7fc;
  color: #333;
  font-weight: bold;
}

.el-button.action-button {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 5px;
}

.el-button.action-button:hover {
  background-color: #29CBDA;
  border-color: #29CBDA;
}

.el-button.action-button:focus {
  background-color: #007bff;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.el-table-row:hover {
  background-color: #f5f5f5;
}
</style>

