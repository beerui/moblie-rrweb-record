<template>
  <RecordWrapper 
    :auto-start="false"
    :show-controls="false"
    :stop-on-destroy="false"
    :require-consent="false"
    :metadata="{ action: 'purchase-step-1', productId: productId, flow: 'purchase-start' }"
    @record-timeout="handleRecordTimeout"
    @timeout-confirmed="handleTimeoutConfirmed"
    @record-started="onRecordStarted"
    @record-declined="onRecordDeclined"
    ref="recordWrapper"
  >
    <div class="purchase-step">
      <van-nav-bar 
        title="确认产品" 
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
          <p class="product-desc">{{ product.description }}</p>
        </div>

        <!-- 购买步骤 -->
        <div class="steps-container">
          <van-steps :active="0" direction="horizontal">
            <van-step>确认产品</van-step>
            <van-step>填写信息</van-step>
            <van-step>确认购买</van-step>
            <van-step>购买完成</van-step>
          </van-steps>
        </div>

        <!-- 步骤内容 -->
        <div class="step-content">
          <div class="step-card">
            <h4 class="step-title">产品确认</h4>
            <van-cell-group>
              <van-cell title="产品名称" :value="product.name" />
              <van-cell title="预期收益率" :value="product.expectedReturn" />
              <van-cell title="起购金额" :value="product.minAmount" />
              <van-cell title="产品期限" :value="product.term" />
            </van-cell-group>
            <div class="step-actions">
              <van-button type="primary" size="large" block round @click="nextStep">
                确认产品信息
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
  name: 'PurchaseStepOne',
  components: {
    RecordWrapper
  },
  data() {
    return {
      productId: null,
      product: null,
      products: {
        1: {
          id: 1,
          name: '稳健增长理财产品',
          description: '低风险，稳定收益，适合保守型投资者',
          expectedReturn: '4.2%',
          minAmount: '1000元',
          term: '90天',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg'
        },
        2: {
          id: 2,
          name: '平衡配置理财产品',
          description: '中等风险，均衡收益，适合稳健型投资者',
          expectedReturn: '6.8%',
          minAmount: '5000元',
          term: '180天',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg'
        },
        3: {
          id: 3,
          name: '成长机会理财产品',
          description: '高风险高收益，适合积极型投资者',
          expectedReturn: '9.5%',
          minAmount: '10000元',
          term: '365天',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg'
        }
      }
    }
  },
  created() {
    this.loadProduct()
  },
  async mounted() {
    // 检查录制状态，如果还没有录制，说明用户直接访问了这个页面
    // 使用nextTick确保组件完全挂载后再执行
    this.$nextTick(async () => {
      await this.checkAndHandleRecording()
    })
  },
  methods: {
    loadProduct() {
      this.productId = parseInt(this.$route.query.id) || parseInt(this.$route.params.id)
      this.product = this.products[this.productId]
      
      if (!this.product) {
        this.$toast.fail('产品不存在')
        this.$router.back()
        return
      }
    },
    
    nextStep() {
      // 跳转到下一步，携带产品信息
      this.$router.push({
        name: 'PurchaseStepTwo',
        query: { id: this.productId }
      })
    },

    // 处理录制超时
    handleRecordTimeout() {
      console.log('步骤1：录制超时')
    },

    // 处理超时确认
    handleTimeoutConfirmed() {
      // 跳转回产品列表
      this.$router.push('/')
    },

    onRecordStarted() {
      console.log('录制开始')
    },

    onRecordDeclined() {
      console.log('录制拒绝')
      // 如果用户拒绝录制，返回产品列表
      this.$toast('录制被拒绝，返回产品列表')
      this.$router.push('/')
    },

    // 检查并处理录制状态
    async checkAndHandleRecording() {
      try {
        const GlobalRecorder = (await import('@/utils/global-recorder')).default
        const globalRecorder = GlobalRecorder.getInstance()
        const status = globalRecorder.getRecordingStatus()
        
        console.log('PurchaseStepOne：录制状态检查:', status)
        
        if (!status.isRecording) {
          // 如果没有录制，说明用户直接访问了这个页面，需要开始录制
          console.log('PurchaseStepOne：检测到未录制，开始录制流程')
          this.$toast('检测到未开始录制，正在启动录制...')
          
          // 修改RecordWrapper配置以要求同意
          if (this.$refs.recordWrapper) {
            // 显示录制同意弹框
            this.$refs.recordWrapper.showRecordingConsent()
          }
        } else {
          console.log('PurchaseStepOne：检测到已经在录制中，继续购买流程')
          this.$toast.success('继续购买流程录制')
        }
      } catch (error) {
        console.error('PurchaseStepOne：检查录制状态失败:', error)
        // 如果检查失败，尝试开始录制
        if (this.$refs.recordWrapper) {
          this.$refs.recordWrapper.showRecordingConsent()
        }
      }
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

.product-desc {
  font-size: 12px;
  color: #969799;
  margin: 0;
  line-height: 1.4;
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

.step-actions {
  margin-top: 24px;
}

.step-actions .van-button {
  height: 48px;
  font-size: 16px;
}
</style> 