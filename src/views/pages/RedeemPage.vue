<template>
  <div class="redeem-page">
    <div class="page-header">
      <h3>产品赎回</h3>
    </div>

    <div class="redeem-form">
      <van-cell-group title="持仓信息">
        <van-cell title="产品名称" value="稳健增利1号" />
        <van-cell title="持有金额" value="50,000.00元" />
        <van-cell title="累计收益" value="1,245.67元" />
        <van-cell title="持有天数" value="45天" />
      </van-cell-group>

      <van-cell-group title="赎回信息">
        <van-field v-model="form.redeemAmount" label="赎回金额" placeholder="请输入赎回金额" type="number" />
        <van-cell title="赎回类型">
          <template #right-icon>
            <van-switch v-model="form.isFullRedeem" @change="onRedeemTypeChange" />
            <span style="margin-left: 10px;">{{ form.isFullRedeem ? '全部赎回' : '部分赎回' }}</span>
          </template>
        </van-cell>
        <van-field v-model="form.bankCard" label="到账银行卡" placeholder="请输入银行卡号" />
      </van-cell-group>

      <div class="redeem-notice">
        <h4>赎回说明</h4>
        <ul>
          <li>赎回申请提交后不可撤销</li>
          <li>资金将在T+1个工作日到账</li>
          <li>部分赎回最低保留金额1万元</li>
        </ul>
        <div class="agree-section">
          <van-switch v-model="form.agreeRedeem" />
          <span>我已了解赎回规则</span>
        </div>
      </div>

      <div class="demo-actions">
        <van-button type="warning" block @click="calculateFee">计算手续费</van-button>
        <van-button type="danger" block @click="confirmRedeem">确认赎回</van-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RedeemPage',
  data() {
    return {
      form: {
        redeemAmount: '',
        isFullRedeem: false,
        bankCard: '',
        agreeRedeem: false
      }
    }
  },
  methods: {
    onRedeemTypeChange(value) {
      if (value) {
        this.form.redeemAmount = '50000'
      } else {
        this.form.redeemAmount = ''
      }
    },
    calculateFee() {
      if (!this.form.redeemAmount) {
        this.$toast.fail('请输入赎回金额')
        return
      }
      const fee = (this.form.redeemAmount * 0.001).toFixed(2)
      this.$toast.success(`手续费: ${fee}元`)
    },
    confirmRedeem() {
      if (!this.form.agreeRedeem) {
        this.$toast.fail('请先确认赎回规则')
        return
      }
      if (!this.form.redeemAmount || !this.form.bankCard) {
        this.$toast.fail('请填写完整信息')
        return
      }
      this.$toast.success('赎回申请提交成功！')
    }
  }
}
</script>

<style scoped>
.redeem-page {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.redeem-form .van-cell-group {
  margin-bottom: 20px;
}

.redeem-notice {
  background: #f8d7da;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
}

.redeem-notice h4 {
  margin: 0 0 10px 0;
  color: #721c24;
}

.redeem-notice ul {
  margin: 0 0 15px 0;
  padding-left: 20px;
  color: #721c24;
}

.redeem-notice li {
  margin-bottom: 5px;
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