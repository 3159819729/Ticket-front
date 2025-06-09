<script>
import axios from "@/http";

export default {
  name: "Visitors",
  data() {
    return {
      VisitorList: [
        {
          frequent_id: "",
          visitor_name: "",
          visitor_code: ""
        }
      ],
      selectedVisitors: [], // 用于存储选中的游客ID
      AddVisitorVisible: false, // 控制添加游客弹窗显示
      newVisitor: {
        visitor_name: "",
        visitor_code: ""
      },
      isEditing: false,
      res: {
        code: null,
        message: null,
        data: null,
      },
    };
  },
  methods: {
    toggleSelectionAll(event) {
      const checked = event.target.checked;
      this.VisitorList.forEach(visitor => {
        visitor.selected = checked;
      });
      this.updateSelectedVisitors(); // 更新选中的游客
    },
    updateSelectedVisitors() {
      this.selectedVisitors = this.VisitorList
          .filter(visitor => visitor.selected)  // 只保留选中的游客
          .map(visitor => visitor.frequent_id); // 提取 frequent_id
    },
    deleteSelected() {
      if (this.selectedVisitors.length === 0) {
        this.$message.warning('请选择有效的游客');
        return;
      }

      axios.post("/api/user/deleteVisitor", { frequent_ids: this.selectedVisitors })
          .then(res => {
            this.getVisitors();  // 删除成功后，刷新游客列表
            this.selectedVisitors = [];  // 清空选中的游客
            this.$message.success(res.message);
          })
          .catch(err => {
            console.error(err);
          });
    },
    addVisitor() {
      if (!this.newVisitor.visitor_name || !this.newVisitor.visitor_code) {
        alert("请填写游客姓名和身份证号");
        return;
      }
      const userAddVisitorDTO = {
        visitor_name: this.newVisitor.visitor_name,
        visitor_code: this.newVisitor.visitor_code
      };
      axios.post("/api/user/addVisitor", userAddVisitorDTO)
          .then(message => {
            this.getVisitors();
            this.AddVisitorVisible = false;
            this.$message.success(message);
          })
          .catch(err => {
            console.error(err);
          });
    },
    changeEdit() {
      this.isEditing = !this.isEditing;
    },
    getVisitors() {
      axios.get("/api/user/visitors").then(res => {
        this.VisitorList = res.data;
      });
    }
  },
  mounted() {
    this.getVisitors();
  }
};
</script>

<template>
  <div class="visitor-list">
    <h2>游客列表</h2>

    <!-- 添加游客按钮 -->
    <button @click="this.AddVisitorVisible = true;" class="add-visitor-btn">添加游客</button>

    <button @click="changeEdit" class="edit-btn">{{ isEditing ? '完成' : '编辑' }}</button>
    <button v-if="isEditing" @click="deleteSelected" class="delete-btn; hover:color-red" :disabled="!selectedVisitors.length">
      删除选中
    </button>

    <!-- 游客表格 -->
    <table>
      <thead>
      <tr>
        <th v-if="isEditing">
          <input type="checkbox" @change="toggleSelectionAll($event)" />
        </th>
        <th>游客姓名</th>
        <th>游客身份证号</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(visitor, index) in VisitorList" :key="index" :class="{'hover-row': isEditing}">
        <td v-if="isEditing">
          <!-- 单个游客复选框绑定到 visitor.selected -->
          <input type="checkbox" v-model="visitor.selected" @change="updateSelectedVisitors" />
        </td>
        <td>{{ visitor.visitor_name }}</td>
        <td>{{ visitor.visitor_code }}</td>
      </tr>
      </tbody>
    </table>

    <!-- 添加游客的浮窗 -->
    <div v-if="AddVisitorVisible" class="modal">
      <div class="modal-content">
        <h3>添加游客</h3>
        <label for="visitor_name">游客姓名:</label>
        <input type="text" id="visitor_name" v-model="newVisitor.visitor_name" />
        <br />
        <label for="visitor_code">游客身份证号:</label>
        <input type="text" id="visitor_code" v-model="newVisitor.visitor_code" />
        <br />
        <button @click="addVisitor" class="modal-btn">添加</button>
        <button @click="AddVisitorVisible = false" class="modal-btn cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visitor-list {
  padding: 20px;
}

h2 {
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
  font-size: 16px;
}

th {
  background-color: #f5f5f5;
}

tr:hover {
  background-color: #f9f9f9;
}

button {
  margin: 10px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
}

.add-visitor-btn,
.edit-btn,
.delete-btn {
  background-color: #29cbda;
  border: none;
  color: white;
  border-radius: 5px;
}

.add-visitor-btn:hover,
.edit-btn:hover,
.delete-btn:hover {
  background-color: #008c8c;
}

.delete-btn:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 100%;
}

.modal-btn {
  background-color: #29cbda;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.modal-btn:hover {
  background-color: #008c8c;
}

.cancel-btn {
  background-color: #ff4d4f;
}

.cancel-btn:hover {
  background-color: #d9363e;
}

.hover-row:hover {
  background-color: #f1f1f1;
}
</style>

