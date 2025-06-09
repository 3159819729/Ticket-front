<script>
import axios from "@/http";

export default {
  name: "ActionLogs",
  data() {
    return {
      logs: [
        {
          log_id:null,
          admin_name: "",
          action_type: "",
          target_admin_name:"",
          action_time: "",
          action_details: "",
        }
      ], // 存储日志数据
      pageNum: 1, // 当前页码
      pageSize: 10, // 每页显示条数
      total: 0, // 总条数
      actionType: "", // 查询条件：操作类型
      adminName: "", // 查询条件：操作人ID
      targetAdminName: "",// 查询条件：目标管理员ID
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
    // 获取日志数据的方法
    getLogs() {
      axios.get("/api/admin/getActionLogs", {
        params: {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          action_type: this.actionType,
          admin_name: this.adminName,
          target_admin_name: this.targetAdminName
        },
      })
      .then(res => {this.res = res;if (this.res.code === 20000) {this.logs = this.res.data.pageData;this.total = this.res.data.total;}})
      .catch(err => {console.error(err);
      });
    },
    saveLogs() {
      const data = this.logs;
      const headers = ['操作人员', '操作类型', '目标人员', '操作时间', '操作详情'];
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const row of data) {
        const values = [
          row.admin_name,
          row.action_type,
          row.target_admin_name || '无',
          row.action_time.replace('T', ' '),
          row.action_details
        ];
        csvRows.push(values.join(','));
      }
      const csvString = csvRows.join('\n');
      const timestamp = new Date().toLocaleString().replace(/[/:, ]/g, '-');
      const fileName = `管理员行为日志_${timestamp}.csv`;
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    handlePageSizeChange() {
      this.pageNum = 1; // 每页条数改变时重置到第一页
      this.getLogs();
    },
    // 分页切换
    handlePageChange(newPage) {
      this.pageNum = newPage;
      this.getLogs();
    },
    // 查询
    handleSearch() {
      this.pageNum = 1; // 查询时重置到第一页
      this.getLogs();
    },
  },
  mounted() {
    // 组件加载时调用获取日志的方法
    this.getLogs();
  },
};
</script>

<template>
  <div class="action-logs">
    <h2>管理员行为日志</h2>

    <!-- 查询条件 -->
    <div class="filters">
      <label for="actionType">操作类型：</label>
      <select id="actionType" v-model="actionType" @change="handleSearch">
        <option value="">全部</option>
        <option value="新增">新增</option>
        <option value="删除">删除</option>
        <option value="权限转移">权限转移</option>
        <option value="更新">更新</option>
      </select>
      <input
          v-model="adminName"
          placeholder="请输入操作人名"
          @keyup.enter="handleSearch"
      />
      <input
          v-model="targetAdminName"
          placeholder="请输入目标人名"
          @keyup.enter="handleSearch"
      />
      <button @click="handleSearch">查询</button>
      <!-- 保存日志按钮 -->
      <button @click="saveLogs" style="margin-top: 10px;">
        保存日志
      </button>
    </div>
    <!-- 日志表格 -->
    <table>
      <thead>
      <tr>
        <th>操作人员</th>
        <th>操作类型</th>
        <th>目标人员</th>
        <th>操作时间</th>
        <th>操作详情</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="log in logs" :key="log.log_id">
        <td>{{ log.admin_name }}</td>
        <td>{{ log.action_type }}</td>
        <td>{{ log.target_admin_name || '无' }}</td>
        <td>{{ log.action_time }}</td>
        <td>{{ log.action_details }}</td>
      </tr>
      </tbody>
    </table>

    <!-- 分页控件 -->
    <div class="pagination">
      每页条数：
      <input
          type="number"
          v-model.number="pageSize"
          @change="handlePageSizeChange"
          min="1"
          placeholder="每页条数"
          style="width: 80px; margin-left: 10px;"
      />
      总数据量：{{ total }}
      <button
          :disabled="pageNum <= 1"
          @click="handlePageChange(pageNum - 1)"
      >
        上一页
      </button>
      <span>第 {{ pageNum }} 页 / 共 {{ Math.ceil(total / pageSize) }} 页</span>
      <button
          :disabled="pageNum >= Math.ceil(total / pageSize)"
          @click="handlePageChange(pageNum + 1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<style scoped>
.action-logs {
  margin: 20px;
}

.filters {
  margin-bottom: 10px;
}

.filters input {
  margin-right: 5px;
  padding: 5px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

.pagination {
  margin-top: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination button {
  margin: 0 5px;
  padding: 5px 10px;
}

.pagination span {
  margin: 0 10px;
}
</style>
