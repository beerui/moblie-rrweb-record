<template>
  <RecordWrapper 
    :auto-start="false"
    :show-controls="false"
    :stop-on-destroy="false"
    :require-consent="false"
    :metadata="{ action: 'purchase-step-2', productId: productId }"
    @record-timeout="handleRecordTimeout"
    @timeout-confirmed="handleTimeoutConfirmed"
  >
    <div class="purchase-step">
      <van-nav-bar 
        title="填写信息" 
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
          <van-steps :active="1" direction="horizontal">
            <van-step>确认产品</van-step>
            <van-step>填写信息</van-step>
            <van-step>确认购买</van-step>
            <van-step>购买完成</van-step>
          </van-steps>
        </div>

        <!-- 步骤内容 -->
        <div class="step-content">
          <div class="step-card">
            <h4 class="step-title">填写购买信息</h4>
            <van-form ref="purchaseForm" @submit="onFormSubmit">
              <van-field
                v-model="purchaseForm.amount"
                name="amount"
                label="购买金额"
                placeholder="请输入购买金额"
                type="number"
                :rules="[{ required: true, message: '请填写购买金额' }]"
              />
              <van-field
                v-model="purchaseForm.bankCard"
                name="bankCard"
                label="银行卡号"
                placeholder="请输入银行卡号"
                :rules="[{ required: true, message: '请填写银行卡号' }]"
              />
              <van-field
                v-model="purchaseForm.password"
                name="password"
                label="交易密码"
                placeholder="请输入交易密码"
                type="password"
                :rules="[{ required: true, message: '请填写交易密码' }]"
              />
              <div class="step-actions">
                <van-button type="primary" size="large" block round @click="validateAndNext">
                  下一步
                </van-button>
              </div>
            </van-form>
          </div>
        </div>
      </div>
    </div>
  </RecordWrapper>
</template>

<script>
import RecordWrapper from '@/components/RecordWrapper.vue'

export default {
  name: 'PurchaseStepTwo',
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
        this.$router.back()
        return
      }
    },

    loadFormData() {
      // 从sessionStorage中加载已填写的表单数据
      const savedForm = sessionStorage.getItem('purchaseForm')
      if (savedForm) {
        try {
          this.purchaseForm = JSON.parse(savedForm)
        } catch (error) {
          console.error('加载表单数据失败:', error)
        }
      }
    },

    saveFormData() {
      // 保存表单数据到sessionStorage
      sessionStorage.setItem('purchaseForm', JSON.stringify(this.purchaseForm))
    },
    
    // 表单验证并进入下一步
    validateAndNext() {
      // 手动验证表单
      if (!this.purchaseForm.amount) {
        this.$toast.fail('请填写购买金额')
        return
      }
      if (!this.purchaseForm.bankCard) {
        this.$toast.fail('请填写银行卡号')
        return
      }
      if (!this.purchaseForm.password) {
        this.$toast.fail('请填写交易密码')
        return
      }
      
      // 验证金额是否符合最低购买要求
      const minAmount = parseInt(this.product.minAmount.replace(/[^\d]/g, ''))
      if (parseInt(this.purchaseForm.amount) < minAmount) {
        this.$toast.fail(`购买金额不能少于${this.product.minAmount}`)
        return
      }
      
      // 验证银行卡号（只要不为空即可）
      if (!this.purchaseForm.bankCard.trim()) {
        this.$toast.fail('请输入银行卡号')
        return
      }
      
      // 验证交易密码长度
      if (this.purchaseForm.password.length < 6) {
        this.$toast.fail('交易密码至少6位数')
        return
      }
      
      // 保存表单数据
      this.saveFormData()
      
      // 跳转到下一步
      this.$router.push({
        name: 'PurchaseStepThree',
        query: { id: this.productId }
      })
    },

    // 表单提交事件
    onFormSubmit() {
      this.validateAndNext()
    },

    // 处理录制超时
    handleRecordTimeout() {
      console.log('步骤2：录制超时')
    },

    // 处理超时确认
    handleTimeoutConfirmed() {
      // 跳转回产品列表
      this.$router.push('/')
    }
  },
  watch: {
    // 监听表单变化，实时保存
    purchaseForm: {
      handler() {
        this.saveFormData()
      },
      deep: true
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

.step-actions {
  margin-top: 24px;
}

.step-actions .van-button {
  height: 48px;
  font-size: 16px;
}
</style> 