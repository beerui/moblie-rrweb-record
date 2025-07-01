<template>
  <RecordWrapper 
    :auto-start="false"
    :show-controls="false"
    :stop-on-destroy="false"
    :require-consent="false"
    :metadata="{ action: 'purchase-step-3', productId: productId }"
    @record-timeout="handleRecordTimeout"
    @timeout-confirmed="handleTimeoutConfirmed"
  >
    <div class="purchase-step">
      <van-nav-bar 
        title="确认购买" 
        left-arrow 
        fixed
        @click-left="$router.back()"
      />
      
      <div class="content" v-if="product">
        <!-- 产品信息 -->
        <div class="product-info-card">
          <div class="product-header">
            <h3 class="product-name">{{ product.name }}</h3>
            <div class="product-return">{{ product.expectedReturn }}</div>
          </div>
        </div>

        <!-- 购买步骤 -->
        <div class="steps-container">
          <van-steps :active="2" direction="horizontal">
            <van-step>确认产品</van-step>
            <van-step>填写信息</van-step>
            <van-step>确认购买</van-step>
            <van-step>购买完成</van-step>
          </van-steps>
        </div>

        <!-- 步骤内容 -->
        <div class="step-content">
          <div class="step-card">
            <h4 class="step-title">确认购买信息</h4>
            <van-cell-group>
              <van-cell title="产品名称" :value="product.name" />
              <van-cell title="购买金额" :value="`¥${purchaseForm.amount}`" />
              <van-cell title="预期收益" :value="expectedProfit" />
              <van-cell title="银行卡号" :value="maskedBankCard" />
            </van-cell-group>
            
            <div class="risk-notice">
              <van-notice-bar
                left-icon="warning-o"
                text="投资有风险，理财产品不保证本金和收益，过往业绩不代表未来表现"
              />
            </div>

            <div class="step-actions">
              <van-button type="primary" size="large" block round @click="confirmPurchase" :loading="purchasing">
                确认购买
              </van-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </RecordWrapper>
</template>

<script>
import RecordWrapper from '@/components/RecordWrapper.vue'

export default {
  name: 'PurchaseStepThree',
  components: {
    RecordWrapper
  },
  data() {
    return {
      productId: null,
      product: null,
      purchaseForm: {
        amount: '',
        bankCard: '',
        password: ''
      },
      purchasing: false,
      products: {
        1: {
          id: 1,
          name: '稳健增长理财产品',
          description: '低风险，稳定收益，适合保守型投资者',
          expectedReturn: '4.2%',
          minAmount: '1000元',
          term: '90天'
        },
        2: {
          id: 2,
          name: '平衡配置理财产品',
          description: '中等风险，均衡收益，适合稳健型投资者',
          expectedReturn: '6.8%',
          minAmount: '5000元',
          term: '180天'
        },
        3: {
          id: 3,
          name: '成长机会理财产品',
          description: '高风险高收益，适合积极型投资者',
          expectedReturn: '9.5%',
          minAmount: '10000元',
          term: '365天'
        }
      }
    }
  },
  computed: {
    expectedProfit() {
      if (!this.purchaseForm.amount || !this.product) return '¥0'
      const rate = parseFloat(this.product.expectedReturn) / 100
      const profit = this.purchaseForm.amount * rate
      return `¥${profit.toFixed(2)}`
    },
    maskedBankCard() {
      if (!this.purchaseForm.bankCard) return ''
      const card = this.purchaseForm.bankCard
      return card.replace(/(\d{4})\d+(\d{4})/, '$1****$2')
    }
  },
  created() {
    this.loadProduct()
    this.loadFormData()
  },
  methods: {
    loadProduct() {
      this.productId = parseInt(this.$route.query.id) || parseInt(this.$route.params.id)
      this.product = this.products[this.productId]
      
      if (!this.product) {
        this.$toast.fail('产品不存在')
        this.$router.push('/')
        return
      }
    },

    loadFormData() {
      // 从sessionStorage中加载表单数据
      const savedForm = sessionStorage.getItem('purchaseForm')
      if (savedForm) {
        try {
          this.purchaseForm = JSON.parse(savedForm)
        } catch (error) {
          console.error('加载表单数据失败:', error)
          this.$toast.fail('表单数据加载失败，请重新填写')
          this.$router.push({
            name: 'PurchaseStepTwo',
            query: { id: this.productId }
          })
        }
      } else {
        this.$toast.fail('请先填写购买信息')
        this.$router.push({
          name: 'PurchaseStepTwo',
          query: { id: this.productId }
        })
      }
    },

    async confirmPurchase() {
      // 检查录制状态
      try {
        const GlobalRecorder = (await import('@/utils/global-recorder')).default
        const globalRecorder = GlobalRecorder.getInstance()
        const status = globalRecorder.getRecordingStatus()
        
        if (!status.isRecording) {
          this.$toast.fail('录制已停止，请重新开始购买流程')
          this.$router.push('/')
          return
        }
      } catch (error) {
        console.error('检查录制状态失败:', error)
        this.$toast.fail('录制状态检查失败')
        return
      }
      
      this.purchasing = true
      
      try {
        // 模拟购买过程
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 生成订单信息
        const orderNo = 'PO' + Date.now()
        const purchaseTime = new Date().toLocaleString()
        
        // 保存订单信息
        const orderInfo = {
          orderNo,
          purchaseTime,
          productId: this.productId,
          productName: this.product.name,
          amount: this.purchaseForm.amount,
          expectedProfit: this.expectedProfit,
          bankCard: this.maskedBankCard
        }
        
        sessionStorage.setItem('orderInfo', JSON.stringify(orderInfo))
        
        this.purchasing = false
        
        // 跳转到购买成功页面
        this.$router.push({
          name: 'PurchaseStepFour',
          query: { id: this.productId, orderNo: orderNo }
        })
        
      } catch (error) {
        console.error('购买流程出错:', error)
        this.purchasing = false
        this.$toast.fail('购买失败，请重试')
      }
    },

    // 处理录制超时
    handleRecordTimeout() {
      console.log('步骤3：录制超时')
    },

    // 处理超时确认
    handleTimeoutConfirmed() {
      // 跳转回产品列表
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.purchase-step {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 60px 16px 16px;
}

.product-info-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0;
}

.product-return {
  font-size: 18px;
  font-weight: 600;
  color: #ee0a24;
}

.steps-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.step-content {
  margin-bottom: 100px;
}

.step-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 16px 0;
}

.risk-notice {
  margin: 16px 0;
}

.step-actions {
  margin-top: 24px;
}

.step-actions .van-button {
  height: 48px;
  font-size: 16px;
}
</style> 