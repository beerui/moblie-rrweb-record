<template>
  <RecordWrapper 
    :auto-start="false"
    :show-controls="false"
    :stop-on-destroy="true"
    :metadata="{ action: 'purchase', productId: productId }"
    @record-started="onRecordStarted"
    @record-stopped="onRecordStopped"
  >
    <div class="purchase">
      <van-nav-bar 
        title="产品购买" 
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
          <van-steps :active="currentStep" direction="horizontal">
            <van-step>确认产品</van-step>
            <van-step>填写信息</van-step>
            <van-step>确认购买</van-step>
            <van-step>购买完成</van-step>
          </van-steps>
        </div>

        <!-- 步骤内容 -->
        <div class="step-content">
          <!-- 步骤1：确认产品 -->
          <div v-if="currentStep === 0" class="step-card">
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

          <!-- 步骤2：填写信息 -->
          <div v-if="currentStep === 1" class="step-card">
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

          <!-- 步骤3：确认购买 -->
          <div v-if="currentStep === 2" class="step-card">
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

          <!-- 步骤4：购买完成 -->
          <div v-if="currentStep === 3" class="step-card success-card">
            <div class="success-content">
              <van-icon name="success" size="50" color="#07c160" />
              <h3>购买成功！</h3>
              <p>您已成功购买理财产品</p>
              
              <van-cell-group>
                <van-cell title="订单号" :value="orderNo" />
                <van-cell title="购买时间" :value="purchaseTime" />
                <van-cell title="购买金额" :value="`¥${purchaseForm.amount}`" />
                <van-cell title="预期收益" :value="expectedProfit" />
                <van-cell 
                  v-if="recordingResult" 
                  title="录制状态" 
                  :value="recordingResult.success ? '录制完成' : '录制失败'" 
                />
                <van-cell 
                  v-if="recordingResult && recordingResult.dataSize" 
                  title="录制数据大小" 
                  :value="recordingResult.dataSize" 
                />
                <van-cell 
                  v-if="recordingResult && recordingResult.compressionRatio" 
                  title="压缩率" 
                  :value="recordingResult.compressionRatio" 
                />
              </van-cell-group>

              <!-- 录制回放区域 -->
              <div v-if="recordingResult && recordingResult.success && recordingResult.events" class="replay-section">
                <h4>购买流程回放</h4>
                <div class="replay-controls">
                  <van-button 
                    type="primary" 
                    size="small" 
                    @click="startReplay"
                    :disabled="isReplaying"
                  >
                    {{ isReplaying ? '正在回放...' : '开始回放' }}
                  </van-button>
                  <van-button 
                    v-if="isReplaying" 
                    size="small" 
                    @click="stopReplay"
                  >
                    停止回放
                  </van-button>
                </div>
                <div 
                  id="replay-container" 
                  class="replay-container"
                ></div>
              </div>

              <!-- 录制成功显示区域 -->
              <div v-if="recordingResult && recordingResult.success" class="recording-success-section">
                <h4>录制状态</h4>
                <van-notice-bar 
                  type="success" 
                  text="录制数据处理并上传成功"
                />
                
                <div class="success-info" style="margin-top: 12px;">
                  <div class="success-item">
                    <span class="label">事件数量:</span>
                                          <span class="value">{{ recordingResult.recordingResult ? recordingResult.recordingResult.eventCount : (recordingResult.data ? recordingResult.data.finalData.totalEvents : 0) }}</span>
                  </div>
                  <div class="success-item">
                    <span class="label">原始大小:</span>
                    <span class="value">{{ formatFileSize(recordingResult.stats.originalSize) }}</span>
                  </div>
                  <div class="success-item">
                    <span class="label">压缩大小:</span>
                    <span class="value">{{ formatFileSize(recordingResult.stats.compressedSize) }}</span>
                  </div>
                  <div class="success-item">
                    <span class="label">压缩率:</span>
                    <span class="value">{{ recordingResult.stats.compressionRatio }}</span>
                  </div>
                  <div class="success-item">
                    <span class="label">上传状态:</span>
                    <van-tag :type="recordingResult.uploadResult.success ? 'success' : 'danger'">
                      {{ recordingResult.uploadResult.success ? '成功' : '失败' }}
                    </van-tag>
                  </div>
                  <div v-if="recordingResult.uploadResult.success" class="success-item">
                    <span class="label">上传ID:</span>
                    <span class="value">{{ recordingResult.uploadResult.uploadId }}</span>
                  </div>
                </div>
                
                <!-- 显示上传结果详情 -->
                <div class="upload-details" style="margin-top: 16px;">
                  <h4 style="font-size: 14px; margin-bottom: 8px;">上传结果详情:</h4>
                  <div class="upload-result" style="background: #f7f8fa; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto;">
                    <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">{{ JSON.stringify(recordingResult.uploadResult, null, 2) }}</pre>
                  </div>
                </div>
              </div>

              <!-- 录制错误提示区域 -->
              <div v-else-if="recordingResult && !recordingResult.success" class="recording-error-section">
                <h4>录制状态</h4>
                <van-notice-bar 
                  type="danger" 
                  :text="recordingResult.message || recordingResult.error || '录制失败'"
                />
                <div class="error-suggestion" style="margin-top: 12px; padding: 12px; background: #fff2f0; border-radius: 4px;">
                  <p style="margin: 0; color: #ff4757; font-size: 14px;">
                    <van-icon name="info-o" style="margin-right: 4px;" />
                    建议操作流程：
                  </p>
                  <ol style="margin: 8px 0 0 20px; color: #666; font-size: 13px;">
                    <li>返回产品列表页面</li>
                    <li>点击"开始录制"按钮</li>
                    <li>再次进行购买操作</li>
                  </ol>
                </div>
              </div>

              <!-- 没有录制结果的情况 -->
              <div v-else class="no-recording-section">
                <h4>录制状态</h4>
                <van-notice-bar 
                  type="warning" 
                  text="没有录制数据，请确保在操作前已开始录制"
                />
              </div>

              <div class="step-actions">
                <van-button 
                  v-if="recordingResult && recordingResult.success" 
                  type="primary" 
                  size="large" 
                  block 
                  round 
                  @click="goHome"
                >
                  返回首页
                </van-button>
                <template v-else>
                  <van-button 
                    type="primary" 
                    size="large" 
                    block 
                    round 
                    @click="goToProducts"
                    style="margin-bottom: 12px;"
                  >
                    重新开始录制
                  </van-button>
                  <van-button 
                    type="default" 
                    size="large" 
                    block 
                    round 
                    @click="goHome"
                  >
                    返回首页
                  </van-button>
                </template>
              </div>
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
  name: 'Purchase',
  components: {
    RecordWrapper
  },
  data() {
    return {
      productId: null,
      product: null,
      currentStep: 0,
      purchasing: false,
      purchaseForm: {
        amount: '',
        bankCard: '',
        password: ''
      },
      orderNo: '',
      purchaseTime: '',
      recordingResult: null,
      isReplaying: false,
      replayPlayer: null,
      replayerObserver: null,
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
  },
  methods: {
     // 简化的录制完成方法
    async finishRecordingWithWrapper() {
      try {
        console.log('购买页面：调用RecordWrapper完成录制...')
        
        // 查找RecordWrapper组件实例
        let recordWrapper = null
        
        // 通过$parent查找
        if (this.$parent && this.$parent.$options.name === 'RecordWrapper') {
          recordWrapper = this.$parent
        }
        // 通过$root递归查找  
        else {
          const findRecordWrapper = (component) => {
            if (component.$options.name === 'RecordWrapper') {
              return component
            }
            for (let child of component.$children || []) {
              const found = findRecordWrapper(child)
              if (found) return found
            }
            return null
          }
          recordWrapper = findRecordWrapper(this.$root)
        }
        
        if (recordWrapper && typeof recordWrapper.finishRecording === 'function') {
          // 调用RecordWrapper的简单接口，只传入业务数据
          const result = await recordWrapper.finishRecording({
            purchaseInfo: {
              productId: this.productId,
              productName: this.product.name,
              amount: this.purchaseForm.amount,
              bankCard: this.maskedBankCard,
              orderNo: this.orderNo,
              timestamp: Date.now(),
              page: 'Purchase'
            }
          })
          
          console.log('购买页面：录制完成结果:', result)
          this.recordingResult = result
        } else {
          console.warn('未找到RecordWrapper组件或finishRecording方法')
          this.recordingResult = {
            success: false,
            error: '未找到录制组件',
            message: '录制组件不可用'
          }
          this.$toast.fail('录制组件不可用')
        }
      } catch (error) {
        console.error('购买页面：调用录制完成失败:', error)
        this.recordingResult = { 
          success: false, 
          error: error.message,
          message: '录制完成失败'
        }
        this.$toast.fail('录制完成失败: ' + error.message)
      }
    },


    loadProduct() {
      this.productId = parseInt(this.$route.params.id)
      this.product = this.products[this.productId]
    },
    nextStep() {

      if (this.currentStep < 3) {
        this.currentStep++
      }
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
      
      // 验证银行卡号格式（简单验证）
      if (this.purchaseForm.bankCard.length < 16) {
        this.$toast.fail('请输入正确的银行卡号')
        return
      }
      
      // 验证交易密码长度
      if (this.purchaseForm.password.length < 6) {
        this.$toast.fail('交易密码至少6位数')
        return
      }
      
      this.nextStep()
    },
    // 表单提交事件（如果使用native-type="submit"）
    onFormSubmit() {
      this.nextStep()
    },
    async confirmPurchase() {
      // 检查录制状态
      try {
        const GlobalRecorder = (await import('@/utils/global-recorder')).default
        const globalRecorder = GlobalRecorder.getInstance()
        const status = globalRecorder.getRecordingStatus()
        
        if (!status.isRecording) {
          this.$toast.fail('请先在产品列表页开始录制')
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
        
        this.orderNo = 'PO' + Date.now()
        this.purchaseTime = new Date().toLocaleString()
        
        this.purchasing = false
        this.nextStep()
        
        // 延迟停止录制，让用户能看到完整的购买流程，包括成功页面
        setTimeout(async () => {
          console.log('购买成功页面已显示，开始停止录制...')
          
          // 先检查录制状态
          const GlobalRecorder = (await import('@/utils/global-recorder')).default
          const globalRecorder = GlobalRecorder.getInstance()
          const status = globalRecorder.getRecordingStatus()
          
          console.log('当前录制状态:', status)
          
          if (status.isRecording) {
            // const loadingToast = this.$toast.loading({
            //   message: '正在处理录制数据...',
            //   forbidClick: true,
            //   duration: 0 // 不自动关闭
            // })
            
            try {
              await this.finishRecordingWithWrapper()
            } finally {
            //   loadingToast.clear() // 确保loading被关闭
            }
          } else {
            console.warn('录制已停止，可能在购买过程中被中断')
            this.recordingResult = { 
              success: false, 
              error: '录制在购买过程中被中断',
              message: '录制状态异常，请重新开始录制流程' 
            }
            this.$toast.fail('录制状态异常')
          }
        }, 1500) // 1.5秒后停止录制，确保成功页面完全显示
        
      } catch (error) {
        console.error('购买流程出错:', error)
        this.purchasing = false
        this.$toast.fail('购买失败，请重试')
      }
    },
   

    // 格式化文件大小（保留此工具方法）
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    // 开始回放
    async startReplay() {
      if (!this.recordingResult || !this.recordingResult.events) {
        this.$toast.fail('没有录制数据可回放')
        return
      }
      
      try {
        this.isReplaying = true
        
        // 清空容器并设置基础样式
        const container = document.getElementById('replay-container')
        if (!container) {
          throw new Error('回放容器未找到')
        }
        container.innerHTML = ''
        container.style.width = '100%'
        container.style.height = '600px'
        container.style.position = 'relative'
        container.style.overflow = 'visible'
        container.style.border = '1px solid #eee'
        container.style.borderRadius = '4px'
        container.style.backgroundColor = '#f5f5f5'
        
        console.log('Purchase页面：开始回放，事件数量:', this.recordingResult.events.length)
        console.log('Purchase页面：前几个事件:', this.recordingResult.events.slice(0, 3))
        
        // 验证事件数据格式
        const events = this.recordingResult.events
        if (!Array.isArray(events) || events.length < 2) {
          throw new Error('录制数据格式不正确或事件太少')
        }
        
        // 检查是否有必要的事件类型
        const hasMetaEvent = events.some(e => e.type === 4)
        const hasSnapshot = events.some(e => e.type === 2)
        
        if (!hasMetaEvent || !hasSnapshot) {
          throw new Error('录制数据缺少必要的元信息或快照')
        }
        
        // 使用带UI控制器的rrweb-player
        // 使用全局rrweb-player
        if (typeof window.rrwebPlayer === 'undefined') {
          throw new Error('rrweb-player库未找到，请确保已正确引入')
        }
        
        const rrwebPlayer = window.rrwebPlayer
        
        console.log('Purchase页面：创建rrweb-player')
        
        // 直接在container中创建回放器
        this.replayPlayer = new rrwebPlayer({
          target: container,
          props: {
            events: events,
            width: container.offsetWidth || 375,
            height: 550, // 增加高度，为控制器留出空间
            autoPlay: false,
            showController: true,
            showWarning: false,
            showDebug: false,
            speed: 1,
            speedOption: [0.5, 1, 1.5, 2, 4],
            skipInactive: false,
            mouseTail: false,
            tags: {
              'virtual-styles': {}
            }
          }
        })
        
        console.log('Purchase页面：rrweb-player创建成功')
        
        // iframe权限修复
        setTimeout(() => {
          const iframes = container.querySelectorAll('iframe')
          iframes.forEach(iframe => {
            if (iframe.hasAttribute('sandbox')) {
              iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals')
            }
            iframe.style.width = '100%'
            iframe.style.height = '100%'
            iframe.style.border = 'none'
          })
          
          console.log('Purchase页面：已完成回放器初始化')
        }, 500)
        
        // 监听回放事件
        if (this.replayPlayer && this.replayPlayer.$on) {
          this.replayPlayer.$on('finish', () => {
            this.isReplaying = false
            console.log('Purchase页面：回放完成')
          })
          
          this.replayPlayer.$on('start', () => {
            console.log('Purchase页面：回放开始')
          })
        }
        
        this.$toast.success('开始回放购买流程')
        
      } catch (error) {
        console.error('Purchase页面：回放失败:', error)
        this.isReplaying = false
        this.$toast.fail('回放失败: ' + error.message)
        
        // 显示错误信息
        const container = document.getElementById('replay-container')
        if (container) {
          container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #f56c6c; background: white;">
              <h4>回放失败</h4>
              <p style="font-size: 12px; margin-top: 10px;">${error.message}</p>
              <p style="font-size: 10px; color: #999; margin-top: 10px;">
                事件数量: ${this.recordingResult.events ? this.recordingResult.events.length : 0}
              </p>
            </div>
          `
        }
      }
    },

    // 设置DOM变化监听器，实时捕获回放器元素
    setupReplayerObserver(container, wrapperDiv) {
      console.log('Purchase页面：设置DOM监听器')
      
      // 清理之前的观察器
      if (this.replayerObserver) {
        this.replayerObserver.disconnect()
      }
      
      // 创建MutationObserver监听DOM变化
      this.replayerObserver = new MutationObserver((mutations) => {
        let needsCheck = false
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // 元素节点
                const className = node.className || ''
                const tagName = node.tagName || ''
                
                // 检查是否是回放器相关元素
                if (className.includes('replayer') || 
                    className.includes('rr-') ||
                    tagName === 'IFRAME' ||
                    node.querySelector && (
                      node.querySelector('.replayer-wrapper') ||
                      node.querySelector('.rr-player') ||
                      node.querySelector('[class*="rr-"]')
                    )) {
                  console.log('DOM监听器：发现新的回放器元素', tagName, className)
                  needsCheck = true
                }
              }
            })
          }
        })
        
        if (needsCheck) {
          // 延迟一点执行，让DOM完全构建
          setTimeout(() => {
            this.forceFixReplayerPosition(container, wrapperDiv)
          }, 100)
        }
      })
      
      // 监听document.body的变化
      this.replayerObserver.observe(document.body, {
        childList: true,
        subtree: true
      })
    },

    // 强制修复回放器位置 - 扫描所有可能的回放器元素
    forceFixReplayerPosition(container, wrapperDiv) {
      console.log('Purchase页面：开始强制修复回放器位置')
      
      // 1. 查找所有可能的回放器元素（无论在哪里）
      const allPossibleReplayers = document.querySelectorAll(`
        .replayer-wrapper,
        .rr-player,
        [class*="rr-"],
        [class*="replayer"],
        iframe[src*="blob:"]
      `)
      
      console.log('找到的回放器相关元素数量:', allPossibleReplayers.length)
      
      let moved = false
      allPossibleReplayers.forEach((element, index) => {
        console.log(`元素 ${index}:`, element.tagName, element.className, '父元素:', element.parentElement?.className)
        
        // 如果元素不在我们的容器内，就移动它
        if (!container.contains(element)) {
          console.log('移动元素到容器内:', element.className || element.tagName)
          try {
            // 移动到我们的wrapper内
            wrapperDiv.appendChild(element)
            this.fixReplayerPosition(element, wrapperDiv)
            moved = true
          } catch (error) {
            console.error('移动元素失败:', error)
          }
        } else if (!wrapperDiv.contains(element) && element !== wrapperDiv) {
          // 如果在container内但不在wrapper内，也移动到wrapper
          console.log('将元素移动到wrapper内:', element.className || element.tagName)
          try {
            wrapperDiv.appendChild(element)
            this.fixReplayerPosition(element, wrapperDiv)
            moved = true
          } catch (error) {
            console.error('移动到wrapper失败:', error)
          }
        }
      })
      
      // 2. 特别检查body下的直接子元素
      const bodyChildren = Array.from(document.body.children)
      bodyChildren.forEach(child => {
        if (child.className && (
          child.className.includes('replayer') || 
          child.className.includes('rr-') ||
          child.tagName === 'IFRAME'
        )) {
          console.log('发现body下的回放器元素:', child.className || child.tagName)
          try {
            wrapperDiv.appendChild(child)
            this.fixReplayerPosition(child, wrapperDiv)
            moved = true
          } catch (error) {
            console.error('从body移动元素失败:', error)
          }
        }
      })
      
      if (moved) {
        console.log('Purchase页面：已移动回放器元素到正确位置')
        console.log('最终容器结构:', container.innerHTML.substring(0, 300))
      } else {
        console.log('Purchase页面：未发现需要移动的回放器元素')
      }
    },

    // 修复回放器位置和样式
    fixReplayerPosition(element, container) {
      if (!element || !container) return
      
      console.log('修复回放器元素:', element.tagName, element.className)
      
      // 设置元素基础样式，但保持内容可见性
      element.style.position = 'relative'
      element.style.width = '100%'
      element.style.height = '400px'
      element.style.border = 'none'
      element.style.background = '#fff'
      element.style.left = '0'
      element.style.top = '0'
      element.style.transform = 'none'
      element.style.margin = '0'
      element.style.padding = '0'
      element.style.display = 'block'  // 确保可见
      element.style.visibility = 'visible'  // 确保可见
      element.style.opacity = '1'  // 确保不透明
      
      // 处理iframe子元素 - 更保守的样式设置
      const iframe = element.querySelector('iframe')
      if (iframe) {
        console.log('修复iframe:', iframe.src ? iframe.src.substring(0, 50) : 'no src')
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.border = 'none'
        iframe.style.display = 'block'
        iframe.style.visibility = 'visible'
        iframe.style.opacity = '1'
        
        // 修复sandbox权限问题
        if (iframe.hasAttribute('sandbox')) {
          console.log('修复iframe sandbox权限')
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-modals')
        }
        
        // 不强制设置position，让iframe保持原有定位方式
      }
      
      // 查找所有可能的视频/canvas元素
      const videos = element.querySelectorAll('video, canvas')
      videos.forEach(video => {
        console.log('修复视频/canvas元素:', video.tagName)
        video.style.display = 'block'
        video.style.visibility = 'visible'
        video.style.opacity = '1'
        video.style.width = '100%'
        video.style.height = 'auto'
      })
      
      // 处理rrweb控制器
      const controller = element.querySelector('.rr-controller')
      if (controller) {
        controller.style.position = 'absolute'
        controller.style.bottom = '0'
        controller.style.left = '0'
        controller.style.right = '0'
        controller.style.height = 'auto'
        controller.style.zIndex = '10'
        controller.style.display = 'block'
        controller.style.visibility = 'visible'
      }
      
      console.log('已修复回放器位置和可见性:', element.className)
    },

    // 调试回放器DOM结构
    debugReplayerStructure(container) {
      console.log('=== 回放器DOM结构调试 ===')
      console.log('容器:', container.id, container.className)
      console.log('容器内容:', container.innerHTML.length, '字符')
      
      // 检查所有子元素
      const children = Array.from(container.children)
      children.forEach((child, index) => {
        console.log(`子元素 ${index}:`, child.tagName, child.className, {
          display: child.style.display || getComputedStyle(child).display,
          visibility: child.style.visibility || getComputedStyle(child).visibility,
          opacity: child.style.opacity || getComputedStyle(child).opacity,
          width: child.offsetWidth,
          height: child.offsetHeight
        })
        
        // 检查iframe
        const iframe = child.querySelector('iframe')
        if (iframe) {
          console.log('  -> iframe:', {
            src: iframe.src ? iframe.src.substring(0, 50) + '...' : 'no src',
            display: iframe.style.display || getComputedStyle(iframe).display,
            visibility: iframe.style.visibility || getComputedStyle(iframe).visibility,
            width: iframe.offsetWidth,
            height: iframe.offsetHeight,
            loaded: iframe.contentDocument ? 'yes' : 'no'
          })
        }
        
        // 检查视频/canvas
        const media = child.querySelectorAll('video, canvas')
        media.forEach((m, i) => {
          console.log(`  -> ${m.tagName} ${i}:`, {
            display: m.style.display || getComputedStyle(m).display,
            width: m.offsetWidth,
            height: m.offsetHeight
          })
        })
      })
      
      console.log('=== 调试结束 ===')
    },

    // 停止回放
    stopReplay() {
      if (this.replayPlayer) {
        try {
          // rrweb-player使用$destroy方法
          if (this.replayPlayer.$destroy) {
            this.replayPlayer.$destroy()
          }
          this.replayPlayer = null
        } catch (error) {
          console.error('停止回放失败:', error)
        }
      }
      this.isReplaying = false
      
      // 清理容器
      const container = document.getElementById('replay-container')
      if (container) {
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: #999;">回放已停止</div>'
      }
    },

    goToProducts() {
      // 停止回放
      this.stopReplay()
      this.$router.push('/products')
    },
    goHome() {
      // 停止回放
      this.stopReplay()
      this.$router.push('/')
    },
    onRecordStarted() {
      console.log('购买流程录制开始')
      this.$toast.success('开始录制购买流程')
    },
    onRecordStopped(result) {
      console.log('购买流程录制完成:', result)
      this.$toast.success('购买流程录制完成')
    }
  },
  beforeDestroy() {
    // 组件销毁前停止回放
    this.stopReplay()
  }
}
</script>

<style scoped>
.purchase {
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

.risk-notice {
  margin: 16px 0;
}

.success-card {
  text-align: center;
}

.success-content .van-icon {
  margin-bottom: 16px;
}

.success-content h3 {
  margin: 0 0 8px 0;
  color: #323233;
  font-size: 18px;
}

.success-content p {
  color: #969799;
  margin: 0 0 24px 0;
  font-size: 14px;
}

.success-content .van-cell-group {
  margin-bottom: 24px;
  text-align: left;
}

.replay-section {
  margin-top: 20px;
  text-align: left;
}

.replay-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.replay-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.replay-container {
  border: 1px solid #e1e1e1;
  border-radius: 8px;
  background: #fff;
  min-height: 600px;
  max-height: 600px;
  width: 100%;
  margin-top: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  isolation: isolate;
  contain: layout style;
  z-index: 1;
}

.replay-container iframe {
  width: 100% !important;
  height: 100% !important;
  border: none;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  background: #fff !important;
}

/* rrweb-player wrapper 样式 */
.replay-container .rrweb-player-wrapper,
.replay-container .rrweb-replayer-wrapper {
  width: 100% !important;
  height: 600px !important;
  background: #fff;
  position: relative !important;
  overflow: visible !important;  /* 改为visible，避免内容被裁切 */
}

/* rrweb-player 和 replayer-wrapper 样式覆盖 */
.replay-container .rr-player,
.replay-container .replayer-wrapper {
  width: 100% !important;
  height: 600px !important;
  background: #fff;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.replay-container .rr-player__frame,
.replay-container .replayer-wrapper .rr-player__frame {
  border: none !important;
  box-shadow: none !important;
  width: 100% !important;
  height: 100% !important;
}

.replay-container .rr-controller {
  background: rgba(0, 0, 0, 0.6) !important;
  border-radius: 4px !important;
}

/* 修复replayer-wrapper问题 */
.replay-container >>> .replayer-wrapper {
  width: 100% !important;
  height: 600px !important;
  border: none !important;
  background: #fff !important;
  position: relative !important;
  left: 0 !important;
  top: 0 !important;
  transform: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.replay-container >>> .replayer-wrapper iframe {
  width: 100% !important;
  height: 100% !important;
  border: none !important;
  position: relative !important;
  left: 0 !important;
  top: 0 !important;
  transform: none !important;
}

/* 全局修复可能飘浮的回放器 */
body .replayer-wrapper,
body .rr-player {
  position: relative !important;
  left: auto !important;
  top: auto !important;
  transform: none !important;
  z-index: auto !important;
}

/* 录制成功信息样式 */
.success-info {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: 12px;
}

.success-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.success-item:last-child {
  margin-bottom: 0;
}

.success-item .label {
  color: #666;
  flex: 0 0 80px;
}

.success-item .value {
  font-weight: 500;
  color: #333;
  text-align: right;
  flex: 1;
}

/* rrweb-player控制器样式优化 */
.replay-container >>> .rr-player {
  width: 100% !important;
  height: 100% !important;
  border-radius: 8px;
  min-height: 600px !important;
}

/* 确保回放内容区域完整显示 */
.replay-container >>> .rr-player__frame {
  width: 100% !important;
  height: calc(100% - 50px) !important; /* 为控制器预留50px空间 */
  min-height: 550px !important;
  border: none !important;
  box-shadow: none !important;
}

.replay-container >>> .rr-player iframe {
  width: 100% !important;
  height: 100% !important;
  min-height: 550px !important;
  border: none !important;
}

.replay-container >>> .rr-controller {
  background: rgba(0, 0, 0, 0.6) !important;
  border-radius: 0 0 8px 8px;
  padding: 8px 12px;
  color: white;
}

.replay-container >>> .rr-timeline {
  background: rgba(255, 255, 255, 0.3) !important;
  height: 4px !important;
  border-radius: 2px !important;
  margin: 8px 0 !important;
}

.replay-container >>> .rr-progress {
  background: #1989fa !important;
  height: 4px !important;
  border-radius: 2px !important;
}

.replay-container >>> .rr-speed-item {
  color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px !important;
  padding: 2px 6px !important;
  margin: 0 2px !important;
  font-size: 12px !important;
  cursor: pointer !important;
}

.replay-container >>> .rr-speed-item.active {
  background: #1989fa !important;
  border-color: #1989fa !important;
}

.replay-container >>> .rr-controls {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

.replay-container >>> .rr-controller button {
  background: none !important;
  border: none !important;
  color: white !important;
  padding: 4px 8px !important;
  border-radius: 4px !important;
  cursor: pointer !important;
  font-size: 14px !important;
}

.replay-container >>> .rr-controller button:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.replay-container >>> .rr-timer {
  color: white !important;
  font-size: 12px !important;
  margin: 0 8px !important;
}
</style> 