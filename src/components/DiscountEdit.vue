<script>
import axios from "@/http";
import { ElMessage } from "element-plus"; // 导入 ElMessage 用于显示消息提示

export default {
  name: "DiscountEdit",
  data() {
    return {
      DiscountList: [],
      ticket_use_date: null,
      AddDiscountVisible: false,
      newDiscount: {
        discount_rate: "",
        discount_dates: [],
      },
      minDate: new Date().toISOString().split('T')[0], // 当前日期
      formRules: {
        discount_rate: [{required: true, message: '请输入折扣率', trigger: 'blur'},
          {
            validator:this.validateDiscountRate,
            trigger: 'blur'
          }
        ],
        discount_dates: [{required: true, message: '请选择折扣日期', trigger: 'blur'}]
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
    this.fetchDiscounts();
  },
  methods: {
    fetchDiscounts() {
      axios.get("/api/admin/getDiscountList", {
        params: { ticket_use_date: this.ticket_use_date },
      })
        .then(res => {
          this.res = res;
          if (this.res.code === 20000) {
            this.DiscountList = this.res.data;
            this.$message.success(this.res.message);
          }
        })
        .catch(err => {
          console.error(err);
        });
    },

    // 格式化折扣率
    formatDiscountRate(row, column, cellValue) {
      return `${(cellValue * 100).toFixed(0)}%`;
    },

    // 格式化日期为 YYYY-MM-DD
    formatDate(row, column, cellValue) {
      const date = new Date(cellValue);
      return date.toLocaleDateString(); // 格式化日期为 YYYY-MM-DD
    },
    disabledDate(date) {
      const target = new Date(date);
      target.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (target < today) {
        return true;
      }
      for (let discount of this.DiscountList) {
        const start = new Date(discount.discount_start_date);
        const end = new Date(discount.discount_end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        if (target >= start && target <= end) {
          return true; // 禁用这个日期
        }
      }
      return false;
    },
    // 提交折扣信息
    submitDiscount() {
      const formatDateLocal = (date) => {
        return new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(date).replace(/\//g, '-');
      };

      const [start, end] = this.newDiscount.discount_dates;
      this.newDiscount.discount_start_date = formatDateLocal(start);
      this.newDiscount.discount_end_date = formatDateLocal(end);
      const data = {
        discount_rate: this.newDiscount.discount_rate,
        discount_start_date: this.newDiscount.discount_start_date,
        discount_end_date: this.newDiscount.discount_end_date,
      };
      axios.post("/api/admin/addDiscount", data).then(res=> {
        this.res = res;
        if (this.res.code === 20000) {
          this.newDiscount = {
            discount_rate: "",
            discount_dates: [],
          };
          this.fetchDiscounts();
          this.$message.success(this.res.message);
        }
        }).catch(err => {
          console.error(err);
      });
      this.AddDiscountVisible = false;
    },
    validateDiscountRate(rule, value, callback) {
      // 判断是否为空
      if (!value) {
        return callback(new Error('请输入折扣率'));
      }

      // 判断是否是数字
      if (isNaN(value)) {
        return callback(new Error('折扣率必须是数字'));
      }

      // 判断折扣率范围
      if (value < 0 || value >= 1) {
        return callback(new Error('折扣率必须在0到1之间'));
      }

      // 判断是否是最多两位小数
      const reg = /^\d(\.\d{1,2})?$/;
      if (!reg.test(value)) {
        return callback(new Error('折扣率最多支持两位小数'));
      }

      // 验证通过
      callback();
    },
    deleteDiscount(row) {
      // 使用 el-message-box 进行二次确认
      this.$confirm('确定删除这个折扣吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用来加上8小时并转换为yyyy-MM-dd格式的函数
        function formatDateWithOffset(dateString) {
          const date = new Date(dateString);
          // 加上8小时
          date.setHours(date.getHours() + 8);
          // 去除时间部分并转为yyyy-MM-dd格式
          return date.toISOString().split('T')[0];
        }

        axios.post("/api/admin/deleteDiscount", {
          discount_start_date: formatDateWithOffset(row.discount_start_date),
          discount_end_date: formatDateWithOffset(row.discount_end_date),
        }).then(res => {
          this.res = res;
          if (this.res.code === 20000) {
            this.fetchDiscounts();
            this.$message.success(this.res.message);
          }
        }).catch(err => {
          console.error(err);
        });
      }).catch(() => {
        // 如果点击取消，不做任何操作
        this.$message.info('取消删除');
      });
    }
  },
  computed: {
    // 计算属性，判断表单是否有效
    isFormValid() {
      // 判断折扣率、开始日期和结束日期是否都已经填写
      return this.newDiscount.discount_rate &&
          this.newDiscount.discount_dates.length === 2;
    }
  }
};
</script>

<template>
  <div class="discount-list">
    <h1>折扣列表</h1>

    选择日期：<input v-model="ticket_use_date" type="date" @input="fetchDiscounts" />
    <button @click="AddDiscountVisible=true">添加折扣信息</button>

    <!-- 折扣表格 -->
    <el-table :data="DiscountList" stripe>
      <el-table-column label="折扣率" prop="discount_rate" :formatter="formatDiscountRate" />
      <el-table-column label="折扣开始日期" prop="discount_start_date" :formatter="formatDate" />
      <el-table-column label="折扣结束日期" prop="discount_end_date" :formatter="formatDate" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button @click="deleteDiscount(row)" :style="{ color: 'red' }">删除该折扣</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="添加折扣信息" v-model="AddDiscountVisible">
      <el-form :model="newDiscount" ref="discountForm" :rules="formRules">
        <el-form-item label="折扣率" prop="discount_rate">
          <el-input v-model="newDiscount.discount_rate" placeholder="请输入折扣率"></el-input>
        </el-form-item>

        <!-- 日期选择器（范围） -->
        <el-form-item label="折扣日期" prop="discount_dates">
          <el-date-picker
              v-model="newDiscount.discount_dates"
              type="daterange"
              :min-date="minDate"
              :disabled-date="disabledDate"
              range-separator="至"
              start-placeholder="选择开始日期"
              end-placeholder="选择结束日期"
          />
        </el-form-item>

        <span slot="footer" class="dialog-footer">
          <el-button @click="AddDiscountVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitDiscount" :disabled="!isFormValid">确 定</el-button>
        </span>
      </el-form>
    </el-dialog>
  </div>
</template>

<style scoped>
.discount-list {
  padding: 20px;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.el-table {
  width: 100%;
  margin-top: 20px;
}

.el-table th {
  background-color: #f5f5f5;
}

.el-table .cell {
  padding: 10px;
}
</style>