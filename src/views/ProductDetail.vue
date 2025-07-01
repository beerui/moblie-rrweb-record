<template>
  <div class="product-detail">
    <van-nav-bar 
      title="产品详情" 
      left-arrow 
      @click-left="$router.back()"
    />
    
    <div class="content" v-if="product">
      <van-card
        :title="product.name"
        :desc="product.description"
        :price="product.expectedReturn"
        :thumb="product.image"
      >
        <template #tags>
          <van-tag 
            :type="product.riskLevel === '低风险' ? 'success' : product.riskLevel === '中风险' ? 'warning' : 'danger'"
          >
            {{ product.riskLevel }}
          </van-tag>
        </template>
      </van-card>

      <van-cell-group title="产品信息">
        <van-cell title="预期收益率" :value="product.expectedReturn" />
        <van-cell title="起购金额" :value="product.minAmount" />
        <van-cell title="产品期限" :value="product.term" />
        <van-cell title="风险等级" :value="product.riskLevel" />
        <van-cell title="投资方向" :value="product.investmentDirection" />
      </van-cell-group>

      <van-cell-group title="产品特色">
        <van-cell 
          v-for="(feature, index) in product.features"
          :key="index"
          :title="feature"
        />
      </van-cell-group>

      <div class="actions">
        <van-button 
          type="primary" 
          size="large" 
          block
          @click="goToPurchase"
        >
          立即购买
        </van-button>
        <van-button 
          size="large" 
          block
          style="margin-top: 12px;"
          @click="goToRedeem"
        >
          产品赎回
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      products: {
        1: {
          id: 1,
          name: '稳健增长理财产品',
          description: '低风险，稳定收益，适合保守型投资者',
          expectedReturn: '4.2%',
          minAmount: '1000元',
          term: '90天',
          riskLevel: '低风险',
          investmentDirection: '货币市场工具、债券',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg',
          features: [
            '本金安全保障',
            '收益稳定可预期',
            '流动性较好',
            '适合保守投资者'
          ]
        },
        2: {
          id: 2,
          name: '平衡配置理财产品',
          description: '中等风险，均衡收益，适合稳健型投资者',
          expectedReturn: '6.8%',
          minAmount: '5000元',
          term: '180天',
          riskLevel: '中风险',
          investmentDirection: '债券、股票、基金',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg',
          features: [
            '风险收益平衡',
            '投资组合多样化',
            '专业团队管理',
            '适合稳健投资者'
          ]
        },
        3: {
          id: 3,
          name: '成长机会理财产品',
          description: '高风险高收益，适合积极型投资者',
          expectedReturn: '9.5%',
          minAmount: '10000元',
          term: '365天',
          riskLevel: '高风险',
          investmentDirection: '股票、期货、股权投资',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg',
          features: [
            '高收益潜力',
            '成长性投资机会',
            '风险控制机制',
            '适合积极投资者'
          ]
        }
      }
    }
  },
  created() {
    this.loadProduct()
  },
  methods: {
    loadProduct() {
      const id = parseInt(this.$route.params.id)
      this.product = this.products[id]
    },
    goToPurchase() {
      this.$router.push(`/purchase/${this.product.id}`)
    },
    goToRedeem() {
      this.$router.push(`/redeem/${this.product.id}`)
    }
  },
  watch: {
    '$route'() {
      this.loadProduct()
    }
  }
}
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 16px;
}

.actions {
  margin-top: 20px;
  padding: 0 16px 20px;
}
</style> 