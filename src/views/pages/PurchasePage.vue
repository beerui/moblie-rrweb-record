<template>
  <div class="purchase-page">
    <div class="page-header">
      <h3>产品购买</h3>
    </div>

    <div class="purchase-form">
      <van-cell-group title="购买信息">
        <van-cell title="产品名称" value="稳健增利1号" />
        <van-cell title="预期收益率" value="4.2%" />
      </van-cell-group>

      <van-cell-group title="投资信息">
        <van-field v-model="form.amount" label="投资金额" placeholder="请输入投资金额" type="number" />
        <van-field v-model="form.name" label="投资人姓名" placeholder="请输入姓名" />
        <van-field v-model="form.phone" label="手机号码" placeholder="请输入手机号" />
        <van-field v-model="form.idCard" label="身份证号" placeholder="请输入身份证号" />
      </van-cell-group>

      <div class="risk-notice">
        <h4>风险提示</h4>
        <p>本产品为非保本浮动收益型产品，存在投资风险，请您仔细阅读产品说明书。</p>
        <div class="agree-section">
          <van-switch v-model="form.agreeRisk" />
          <span>我已充分了解产品风险</span>
        </div>
      </div>

      <div class="demo-actions">
        <van-button type="warning" block @click="calculateIncome">计算收益</van-button>
        <van-button type="primary" block @click="confirmPurchase">确认购买</van-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PurchasePage',
  data() {
    return {
      form: {
        amount: '',
        name: '',
        phone: '',
        idCard: '',
        agreeRisk: false
      }
    }
  },
  methods: {
    calculateIncome() {
      if (!this.form.amount) {
        this.$toast.fail('请输入投资金额')
        return
      }
      const income = (this.form.amount * 10000 * 0.042 * 90 / 365).toFixed(2)
      this.$toast.success(`预计收益: ${income}元`)
    },
    confirmPurchase() {
      if (!this.form.agreeRisk) {
        this.$toast.fail('请先确认风险提示')
        return
      }
      if (!this.form.amount || !this.form.name) {
        this.$toast.fail('请填写完整信息')
        return
      }
      this.$toast.success('购买成功！')
    }
  }
}
</script>

<style scoped>
.purchase-page {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.purchase-form .van-cell-group {
  margin-bottom: 20px;
}

.risk-notice {
  background: #fff3cd;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #ffeaa7;
}

.risk-notice h4 {
  margin: 0 0 10px 0;
  color: #856404;
}

.risk-notice p {
  margin: 0 0 15px 0;
  color: #856404;
  font-size: 14px;
  line-height: 1.5;
}

.agree-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.demo-actions .van-button {
  margin-bottom: 10px;
}
</style> 