<template>
  <RecordWrapper 
    :auto-start="false"
    :show-controls="false"
    :stop-on-destroy="true"
    :metadata="{ action: 'redeem', productId: productId }"
    @record-started="onRecordStarted"
    @record-stopped="onRecordStopped"
  >
    <div class="redeem">
      <van-nav-bar 
        title="产品赎回" 
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

        <!-- 赎回步骤 -->
        <div class="steps-container">
          <van-steps :active="currentStep" direction="horizontal">
            <van-step>选择产品</van-step>
            <van-step>填写信息</van-step>
            <van-step>确认赎回</van-step>
            <van-step>赎回完成</van-step>
          </van-steps>
        </div>

        <!-- 步骤内容 -->
        <div class="step-content">
          <!-- 步骤1：选择产品 -->
          <div v-if="currentStep === 0" class="step-card">
            <h4 class="step-title">持有产品</h4>
            <van-cell-group>
              <van-cell title="产品名称" :value="product.name" />
              <van-cell title="持有金额" value="¥50,000" />
              <van-cell title="累计收益" value="¥2,100" />
              <van-cell title="持有天数" value="45天" />
            </van-cell-group>
            <div class="step-actions">
              <van-button type="primary" size="large" block round @click="nextStep">
                选择此产品赎回
              </van-button>
            </div>
          </div>

          <!-- 步骤2：填写信息 -->
          <div v-if="currentStep === 1" class="step-card">
            <h4 class="step-title">填写赎回信息</h4>
            <van-form ref="redeemForm" @submit="onFormSubmit">
              <van-field
                v-model="redeemForm.redeemType"
                name="redeemType"
                label="赎回类型"
                placeholder="请选择赎回类型"
                readonly
                @click="showRedeemTypePicker = true"
                :rules="[{ required: true, message: '请选择赎回类型' }]"
              />
              <van-field
                v-model="redeemForm.amount"
                name="amount"
                label="赎回金额"
                placeholder="请输入赎回金额"
                type="number"
                :rules="[{ required: true, message: '请填写赎回金额' }]"
              />
              <van-field
                v-model="redeemForm.bankCard"
                name="bankCard"
                label="收款银行卡"
                placeholder="请输入收款银行卡号"
                :rules="[{ required: true, message: '请填写银行卡号' }]"
              />
              <van-field
                v-model="redeemForm.password"
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

          <!-- 步骤3：确认赎回 -->
          <div v-if="currentStep === 2" class="step-card">
            <h4 class="step-title">确认赎回信息</h4>
            <van-cell-group>
              <van-cell title="产品名称" :value="product.name" />
              <van-cell title="赎回类型" :value="redeemForm.redeemType" />
              <van-cell title="赎回金额" :value="`¥${redeemForm.amount}`" />
              <van-cell title="预计到账" :value="expectedArrival" />
              <van-cell title="收款银行卡" :value="maskedBankCard" />
            </van-cell-group>
            
            <div class="notice-section">
              <van-notice-bar
                left-icon="info-o"
                text="到账时间：T+1个工作日到账，本产品赎回免手续费"
              />
            </div>

            <div class="step-actions">
              <van-button type="primary" size="large" block round @click="confirmRedeem" :loading="redeeming">
                确认赎回
              </van-button>
            </div>
          </div>

          <!-- 步骤4：赎回完成 -->
          <div v-if="currentStep === 3" class="step-card success-card">
            <div class="success-content">
              <van-icon name="success" size="50" color="#07c160" />
              <h3>赎回申请成功！</h3>
              <p>您的赎回申请已提交，资金将在T+1个工作日到账</p>
              
              <van-cell-group>
                <van-cell title="赎回单号" :value="redeemNo" />
                <van-cell title="申请时间" :value="redeemTime" />
                <van-cell title="赎回金额" :value="`¥${redeemForm.amount}`" />
                <van-cell title="预计到账" :value="expectedArrival" />
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
                <h4>赎回流程回放</h4>
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
                  id="redeem-replay-container" 
                  class="replay-container"
                  style="border: 1px solid #eee; background: #f5f5f5; min-height: 300px; margin-top: 12px;"
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
                    <li>再次进行赎回操作</li>
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

      <!-- 赎回类型选择器 -->
      <van-action-sheet
        v-model="showRedeemTypePicker"
        :actions="redeemTypeActions"
        @select="onRedeemTypeSelect"
        cancel-text="取消"
        title="选择赎回类型"
      />
    </div>
  </RecordWrapper>
</template>

<script>
import RecordWrapper from '@/components/RecordWrapper.vue'

export default {
  name: 'Redeem',
  components: {
    RecordWrapper
  },
  data() {
    return {
      productId: null,
      product: null,
      currentStep: 0,
      redeeming: false,
      showRedeemTypePicker: false,
      redeemForm: {
        redeemType: '',
        amount: '',
        bankCard: '',
        password: ''
      },
      redeemNo: '',
      redeemTime: '',
      recordingResult: null,
      isReplaying: false,
      replayPlayer: null,
      replayerObserver: null,
      redeemTypeActions: [
        { name: '全部赎回', value: 'full' },
        { name: '部分赎回', value: 'partial' }
      ],
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
    expectedArrival() {
      if (!this.redeemForm.amount) return '¥0'
      // 模拟计算到账金额（扣除可能的费用）
      return `¥${this.redeemForm.amount}`
    },
    maskedBankCard() {
      if (!this.redeemForm.bankCard) return ''
      const card = this.redeemForm.bankCard
      return card.replace(/(\d{4})\d+(\d{4})/, '$1****$2')
    }
  },
  created() {
    this.loadProduct()
  },
  methods: {
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
      if (!this.redeemForm.redeemType) {
        this.$toast.fail('请选择赎回类型')
        return
      }
      if (!this.redeemForm.amount) {
        this.$toast.fail('请填写赎回金额')
        return
      }
      if (!this.redeemForm.bankCard) {
        this.$toast.fail('请填写收款银行卡号')
        return
      }
      if (!this.redeemForm.password) {
        this.$toast.fail('请填写交易密码')
        return
      }
      
      // 验证赎回金额
      if (parseInt(this.redeemForm.amount) <= 0) {
        this.$toast.fail('赎回金额必须大于0')
        return
      }
      
      // 验证银行卡号格式（简单验证）
      if (this.redeemForm.bankCard.length < 16) {
        this.$toast.fail('请输入正确的银行卡号')
        return
      }
      
      // 验证交易密码长度
      if (this.redeemForm.password.length < 6) {
        this.$toast.fail('交易密码至少6位数')
        return
      }
      
      this.nextStep()
    },
    // 表单提交事件（如果使用native-type="submit"）
    onFormSubmit() {
      this.nextStep()
    },
    onRedeemTypeSelect(action) {
      this.redeemForm.redeemType = action.name
      this.showRedeemTypePicker = false
    },
    async confirmRedeem() {
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
      
      this.redeeming = true
      
      try {
        // 模拟赎回过程
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        this.redeemNo = 'RD' + Date.now()
        this.redeemTime = new Date().toLocaleString()
        
        this.redeeming = false
        this.nextStep()
        
        // 延迟停止录制，让用户能看到完整的赎回流程，包括成功页面
        setTimeout(async () => {
          console.log('赎回成功页面已显示，开始停止录制...')
          
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
              await this.stopRecordingAndProcess()
            } finally {
            //   loadingToast.clear() // 确保loading被关闭
            }
          } else {
            console.warn('录制已停止，可能在赎回过程中被中断')
            this.recordingResult = { 
              success: false, 
              error: '录制在赎回过程中被中断',
              message: '录制状态异常，请重新开始录制流程' 
            }
            this.$toast.fail('录制状态异常')
          }
        }, 1500) // 1.5秒后停止录制，确保成功页面完全显示
        
      } catch (error) {
        console.error('赎回流程出错:', error)
        this.redeeming = false
        this.$toast.fail('赎回失败，请重试')
      }
    },
    // 停止录制并处理数据
    async stopRecordingAndProcess() {
      try {
        // 获取全局录制器
        const GlobalRecorder = (await import('@/utils/global-recorder')).default
        const globalRecorder = GlobalRecorder.getInstance()
        
        // 使用全局录制器的stopRecordingAndProcess方法
        const result = await globalRecorder.stopRecordingAndProcess({
          redeemInfo: {
            productId: this.productId,
            productName: this.product.name,
            amount: this.redeemForm.amount,
            bankCard: this.maskedBankCard,
            redeemNo: this.redeemNo,
            timestamp: Date.now()
          }
        })
        
        console.log('赎回页面：录制数据处理结果:', result)
        
        if (result.success) {
          // 上传录制数据并获取结果
          const uploadResult = await globalRecorder.uploadRecordingData(result.data)
          
          console.log('赎回页面：上传结果:', uploadResult)
          
          this.recordingResult = {
            success: true,
            events: result.recordingResult.events,
            data: result.data,
            uploadResult: uploadResult,
            stats: {
              originalSize: result.data.sizes.original,
              compressedSize: result.data.sizes.compressed,
              compressionRatio: result.data.compressionRatio,
              eventCount: result.data.finalData.totalEvents
            }
          }
          
          this.$toast.success('录制数据处理并上传成功')
        } else {
          console.warn('赎回页面：录制数据处理失败:', result.error)
          this.recordingResult = { 
            success: false, 
            error: result.error,
            message: result.error === '录制数据为空' ? 
              '请先在产品列表页面开始录制，然后进行赎回操作' : 
              '录制过程中出现错误'
          }
          this.$toast.fail('录制数据处理失败: ' + result.error)
        }
      } catch (error) {
        console.error('赎回页面：停止录制并处理数据失败:', error)
        this.recordingResult = { success: false, error: error.message }
        this.$toast.fail('录制处理失败: ' + error.message)
      }
    },

    // 处理录制数据
    async processRecordingData(rawData) {
      try {
        // 计算原始数据大小
        const originalJson = JSON.stringify(rawData)
        const originalSize = new Blob([originalJson]).size
        
        // 使用pako压缩
        // 使用全局pako
        if (typeof window.pako === 'undefined') {
          throw new Error('pako压缩库未找到，请确保已正确引入')
        }
        const pako = window.pako
        const compressed = pako.gzip(originalJson)
        const compressedSize = compressed.length
        
        // 计算压缩率
        const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1) + '%'
        
        return {
          success: true,
          events: rawData.events,
          originalSize: this.formatFileSize(originalSize),
          compressedSize: compressedSize,
          dataSize: this.formatFileSize(compressedSize),
          compressionRatio: compressionRatio,
          compressedSizeBytes: compressedSize,
          compressedData: Array.from(compressed), // 转为数组以便JSON序列化
          metadata: {
            ...rawData.metadata,
            redeemNo: this.redeemNo,
            redeemAmount: this.redeemForm.amount,
            redeemType: this.redeemForm.redeemType,
            processTime: new Date().toISOString()
          }
        }
      } catch (error) {
        console.error('处理录制数据失败:', error)
        return { success: false, error: error.message }
      }
    },

    // 优化录制数据（如果超过2MB）
    async optimizeRecordingData(rawData) {
      try {
        // 数据优化策略
        let optimizedEvents = [...rawData.events]
        
        // 1. 移除冗余的鼠标移动事件
        optimizedEvents = optimizedEvents.filter((event, index) => {
          if (event.type === 3 && event.data?.source === 1) { // 鼠标移动事件
            if (index > 0 && optimizedEvents[index - 1].type === 3) {
              return false // 跳过连续的鼠标移动事件
            }
          }
          return true
        })
        
        // 2. 限制事件数量
        if (optimizedEvents.length > 1000) {
          const step = Math.ceil(optimizedEvents.length / 1000)
          optimizedEvents = optimizedEvents.filter((_, index) => index % step === 0)
        }
        
        // 3. 简化事件数据
        optimizedEvents = optimizedEvents.map(event => {
          const simplifiedEvent = { ...event }
          if (event.data && typeof event.data === 'object') {
            // 移除不必要的字段
            delete simplifiedEvent.data.isCustom
            delete simplifiedEvent.data.plugin
          }
          return simplifiedEvent
        })
        
        const optimizedData = {
          ...rawData,
          events: optimizedEvents,
          metadata: {
            ...rawData.metadata,
            optimized: true,
            originalEventCount: rawData.events.length,
            optimizedEventCount: optimizedEvents.length
          }
        }
        
        return await this.processRecordingData(optimizedData)
      } catch (error) {
        console.error('优化录制数据失败:', error)
        return { success: false, error: error.message }
      }
    },

    // 上传录制数据
    async uploadRecordingData(processedData) {
      try {
        const uploadData = {
          type: 'redeem_recording',
          redeemNo: this.redeemNo,
          productId: this.productId,
          compressedData: processedData.compressedData,
          metadata: processedData.metadata,
          size: processedData.compressedSizeBytes,
          compressionInfo: {
            originalSize: processedData.originalSize,
            compressedSize: processedData.dataSize,
            compressionRatio: processedData.compressionRatio
          }
        }
        
        // 模拟上传（实际项目中替换为真实API）
        console.log('上传录制数据:', uploadData)
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        this.$toast.success('录制数据上传成功')
      } catch (error) {
        console.error('上传录制数据失败:', error)
        this.$toast.fail('录制数据上传失败')
      }
    },

    // 格式化文件大小
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
        
        console.log('Redeem页面：开始回放，事件数量:', this.recordingResult.events.length)
        console.log('Redeem页面：前几个事件:', this.recordingResult.events.slice(0, 3))
        
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
        
        console.log('Redeem页面：创建rrweb-player')
        
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
        
        console.log('Redeem页面：rrweb-player创建成功')
        
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
          
          console.log('Redeem页面：已完成回放器初始化')
        }, 500)
        
        // 监听回放事件
        if (this.replayPlayer && this.replayPlayer.$on) {
          this.replayPlayer.$on('finish', () => {
            this.isReplaying = false
            console.log('Redeem页面：回放完成')
          })
          
          this.replayPlayer.$on('start', () => {
            console.log('Redeem页面：回放开始')
          })
        }
        
        this.$toast.success('开始回放赎回流程')
        
      } catch (error) {
        console.error('Redeem页面：回放失败:', error)
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

    // 格式化文件大小（保留此工具方法）
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
      console.log('赎回流程录制开始')
      this.$toast.success('开始录制赎回流程')
    },
    onRecordStopped(result) {
      console.log('赎回流程录制完成:', result)
      this.$toast.success('赎回流程录制完成')
    }
  },
  beforeDestroy() {
    // 组件销毁前停止回放
    this.stopReplay()
  }
}
</script>

<style scoped>
.redeem {
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
  color: #07c160;
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

.notice-section {
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