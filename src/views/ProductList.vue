<template>
  <RecordWrapper 
    ref="recordWrapper"
    :show-controls="false"
    :auto-start="false"
    :stop-on-destroy="false"
    :require-consent="true"
    :metadata="{ action: 'browse_products' }"
    @record-started="onRecordStarted"
    @record-declined="onRecordDeclined"
    @record-timeout="onRecordTimeout"
    @timeout-confirmed="onTimeoutConfirmed"
  >
    <div class="product-list">
      <van-nav-bar 
        title="理财产品" 
        left-arrow 
        fixed
        @click-left="$router.back()"
      />

      <!-- 购买流程选择弹框 -->
      <van-dialog
        v-model="showModeSelection"
        title="选择购买流程"
        :show-cancel-button="true"
        confirm-button-text="分步购买流程"
        cancel-button-text="传统单页购买"
        :before-close="handleModeDialogClose"
        :close-on-click-overlay="false"
      >
        <div class="mode-dialog-content">
          <div class="dialog-icon">
            <van-icon name="shopping-cart-o" size="48" color="#1989fa" />
          </div>
          <p class="dialog-text">
            请选择您喜欢的购买方式：
          </p>
          <div class="mode-options">
            <div class="mode-option">
              <h4>📝 分步购买流程</h4>
              <p>• 分步骤引导，操作简单</p>
              <p>• 支持录制回放</p>
              <p>• 数据自动保存</p>
            </div>
            <div class="mode-option">
              <h4>⚡ 传统单页购买</h4>
              <p>• 一页完成所有操作</p>
              <p>• 快速便捷</p>
              <p>• 适合熟悉用户</p>
            </div>
          </div>
        </div>
      </van-dialog>
      
      <div class="content">
        <!-- 产品统计 -->
        <div class="stats-card">
          <div class="stat-item">
            <div class="stat-number">{{ products.length }}</div>
            <div class="stat-label">在售产品</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">4.2%-9.5%</div>
            <div class="stat-label">收益区间</div>
          </div>
        </div>

        <!-- 产品列表 -->
        <div class="products-container">
          <div 
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="goToDetail(product.id)"
          >
            <div class="product-header">
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-desc">{{ product.description }}</p>
              </div>
              <div class="product-return">
                <div class="return-rate">{{ product.expectedReturn }}</div>
                <div class="return-label">预期收益率</div>
              </div>
            </div>
            
            <div class="product-details">
              <div class="detail-item">
                <span class="detail-label">起购金额</span>
                <span class="detail-value">{{ product.minAmount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">风险等级</span>
                <van-tag 
                  :type="product.riskLevel === '低风险' ? 'success' : product.riskLevel === '中风险' ? 'warning' : 'danger'"
                  size="small"
                >
                  {{ product.riskLevel }}
                </van-tag>
              </div>
            </div>

            <div class="product-actions">
              <van-button 
                size="small" 
                type="primary"
                round
                @click.stop="handlePurchaseClick(product.id)"
              >
                立即购买
              </van-button>
              <van-button 
                size="small" 
                plain
                round
                @click.stop="goToRedeem(product.id)"
              >
                产品赎回
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
  name: 'ProductList',
  components: {
    RecordWrapper
  },
  data() {
    return {
      showModeSelection: false,
      selectedProductId: null,
      preferredPurchaseMode: 'step', // 'step' 或 'single'
      products: [
        {
          id: 1,
          name: '稳健增长理财产品',
          description: '低风险，稳定收益，适合保守型投资者',
          expectedReturn: '4.2%',
          minAmount: '1000元',
          riskLevel: '低风险',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg'
        },
        {
          id: 2,
          name: '平衡配置理财产品',
          description: '中等风险，均衡收益，适合稳健型投资者',
          expectedReturn: '6.8%',
          minAmount: '5000元',
          riskLevel: '中风险',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg'
        },
        {
          id: 3,
          name: '成长机会理财产品',
          description: '高风险高收益，适合积极型投资者',
          expectedReturn: '9.5%',
          minAmount: '10000元',
          riskLevel: '高风险',
          image: 'https://img.yzcdn.cn/vant/cat.jpeg'
        }
      ]
    }
  },
  methods: {
    goToDetail(id) {
      this.$router.push(`/product/${id}`)
    },

    // 处理购买点击
    handlePurchaseClick(id) {
      this.selectedProductId = id
      
      // 检查是否已经在录制中
      this.checkRecordingStatus().then(isRecording => {
        if (isRecording) {
          // 如果已经在录制，直接进入分步购买流程
          this.goToPurchase(id, 'step')
        } else {
          // 如果没有录制，触发录制同意弹框
          this.triggerRecordingConsent()
        }
      })
    },
    // 触发录制同意弹框
    triggerRecordingConsent() {
      // 通过ref调用RecordWrapper的录制同意弹框
      this.$refs.recordWrapper?.showRecordingConsent()
    },

    // 检查录制状态
    async checkRecordingStatus() {
      try {
        const GlobalRecorder = (await import('@/utils/global-recorder')).default
        const globalRecorder = GlobalRecorder.getInstance()
        const status = globalRecorder.getRecordingStatus()
        return status.isRecording
      } catch (error) {
        console.error('检查录制状态失败:', error)
        return false
      }
    },







    // 处理购买流程选择弹框关闭
    handleModeDialogClose(action) {
      this.showModeSelection = false
      
      if (action === 'confirm') {
        // 确认按钮 - 分步购买流程
        this.selectPurchaseMode('step')
      } else if (action === 'cancel') {
        // 取消按钮 - 传统单页购买
        this.selectPurchaseMode('single')
      }
      // 如果是其他方式关闭（比如点击遮罩），不做任何操作
    },

    // 选择购买模式
    selectPurchaseMode(mode) {
      this.preferredPurchaseMode = mode
      this.goToPurchase(this.selectedProductId, mode)
    },

    // 去购买
    goToPurchase(id, mode = 'step') {
      if (mode === 'step') {
        // 分步购买流程（默认）
        this.$router.push({
          name: 'PurchaseStepOne',
          query: { id: id }
        })
      } else {
        // 传统单页购买
        this.$router.push(`/purchase/${id}`)
      }
    },

    goToRedeem(id) {
      this.$router.push(`/redeem/${id}`)
    },

    // 录制开始事件
    onRecordStarted() {
      console.log('产品列表：录制开始')
      this.$toast.success('录制已开始，现在可以进行购买操作')
      
      // 录制开始后，直接进入分步购买流程
      if (this.selectedProductId) {
        this.goToPurchase(this.selectedProductId, 'step')
      }
    },

    // 用户拒绝录制
    onRecordDeclined() {
      console.log('产品列表：用户拒绝录制')
      this.$toast('已取消录制，将使用传统购买流程')
      
      // 用户拒绝录制，使用传统单页购买
      if (this.selectedProductId) {
        this.goToPurchase(this.selectedProductId, 'single')
      }
    },

    // 录制超时
    onRecordTimeout() {
      console.log('产品列表：录制超时')
      this.$toast.fail('录制超时，交易已取消')
      this.showModeSelection = false
    },

    // 超时确认
    onTimeoutConfirmed() {
      console.log('产品列表：超时确认')
      this.showModeSelection = false
    }
  }
}
</script>

<style scoped>
.product-list {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 60px 16px 16px;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 20px;
  font-weight: 600;
  color: #1989fa;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background-color: #ebedf0;
}

.products-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  margin: 0 0 4px 0;
}

.product-desc {
  font-size: 12px;
  color: #969799;
  margin: 0;
  line-height: 1.4;
}

.product-return {
  text-align: right;
  margin-left: 16px;
}

.return-rate {
  font-size: 20px;
  font-weight: 600;
  color: #ee0a24;
  margin-bottom: 2px;
}

.return-label {
  font-size: 10px;
  color: #969799;
}

.product-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 0;
  border-top: 1px solid #f7f8fa;
  border-bottom: 1px solid #f7f8fa;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #969799;
}

.detail-value {
  font-size: 14px;
  font-weight: 500;
  color: #323233;
}

.product-actions {
  display: flex;
  gap: 12px;
}

.product-actions .van-button {
  flex: 1;
  height: 36px;
}

/* 购买流程选择弹框样式 */
.mode-dialog-content {
  text-align: center;
  padding: 20px 0;
}

.dialog-icon {
  margin-bottom: 16px;
}

.dialog-text {
  font-size: 14px;
  color: #333;
  margin-bottom: 20px;
  line-height: 1.5;
}

.mode-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.mode-option {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.mode-option h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #323233;
  font-weight: 600;
}

.mode-option p {
  margin: 0 0 4px 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.mode-option:last-child p:last-child {
  margin-bottom: 0;
}
</style> 