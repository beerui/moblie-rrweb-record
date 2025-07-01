<template>
  <div class="product-detail-page">
    <div class="product-banner">
      <h3>{{ product.name }}</h3>
      <div class="rate-display">{{ product.rate }}%</div>
      <p>预期年化收益率</p>
    </div>

    <div class="product-details">
      <van-cell-group title="产品信息">
        <van-cell title="起购金额" :value="`${product.minAmount}万元`" />
        <van-cell title="产品期限" :value="product.period" />
        <van-cell title="风险等级" :value="product.riskLevel" />
        <van-cell title="募集状态" value="募集中" />
      </van-cell-group>

      <van-cell-group title="收益说明">
        <van-cell title="收益类型" value="非保本浮动收益" />
        <van-cell title="计息方式" value="按日计息" />
        <van-cell title="到期处理" value="自动赎回" />
      </van-cell-group>
    </div>

    <div class="demo-interactions">
      <van-field v-model="investAmount" label="投资金额" placeholder="请输入投资金额" type="number" />
      <van-field v-model="customerName" label="客户姓名" placeholder="请输入姓名" />
      <van-switch v-model="agreeTerms" /> 
      <span style="margin-left: 10px;">我已阅读并同意产品协议</span>
    </div>

    <div class="action-buttons">
      <van-button type="primary" block @click="purchaseProduct">立即购买</van-button>
      <van-button type="info" block @click="addToFavorites">加入收藏</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductDetailPage',
  data() {
    return {
      product: {
        name: '稳健增利1号',
        rate: 4.2,
        minAmount: 1,
        period: '90天',
        riskLevel: 'R2'
      },
      investAmount: '',
      customerName: '',
      agreeTerms: false
    }
  },
  methods: {
    purchaseProduct() {
      if (!this.agreeTerms) {
        this.$toast.fail('请先同意产品协议')
        return
      }
      this.$toast.success('跳转到购买页面')
    },
    addToFavorites() {
      this.$toast.success('已加入收藏')
    }
  }
}
</script>

<style scoped>
.product-detail-page {
  padding: 20px;
}

.product-banner {
  background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
  color: white;
  padding: 30px 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.rate-display {
  font-size: 36px;
  font-weight: bold;
  margin: 10px 0;
}

.product-details {
  margin-bottom: 20px;
}

.demo-interactions {
  background: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-interactions .van-field {
  margin-bottom: 15px;
}

.action-buttons .van-button {
  margin-bottom: 10px;
}
</style> 