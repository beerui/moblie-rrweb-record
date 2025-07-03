<template>
  <RecordWrapper 
    :auto-start="false"
    :show-controls="false"
    :stop-on-destroy="true"
    :require-consent="false"
    :metadata="{ action: 'purchase-step-4', productId: productId }"
    @record-timeout="handleRecordTimeout"
    @timeout-confirmed="handleTimeoutConfirmed"
    @recording-finished="onRecordingFinished"
    ref="recordWrapper"
  >
    <div class="purchase-step">
      <van-nav-bar 
        title="购买完成" 
        :left-arrow="false"
        fixed
      />
      
      <div class="content">
        <!-- 购买步骤 -->
        <div class="steps-container">
          <van-steps :active="3" direction="horizontal">
            <van-step>确认产品</van-step>
            <van-step>填写信息</van-step>
            <van-step>确认购买</van-step>
            <van-step>购买完成</van-step>
          </van-steps>
        </div>

        <!-- 成功内容 -->
        <div class="step-content">
          <div class="step-card success-card">
            <div class="success-content">
              <van-image
                width="10rem" 
                height="10rem"
                fit="contain"
                src="https://img01.yzcdn.cn/vant/cat.jpeg"
              />
              <h3>购买成功！</h3>
              <p>您已成功购买理财产品</p>
              
              <van-cell-group v-if="orderInfo">
                <van-cell title="订单号" :value="orderInfo.orderNo" />
                <van-cell title="购买时间" :value="orderInfo.purchaseTime" />
                <van-cell title="产品名称" :value="orderInfo.productName" />
                <van-cell title="购买金额" :value="`¥${orderInfo.amount}`" />
                <van-cell title="预期收益" :value="orderInfo.expectedProfit" />
                <van-cell title="银行卡号" :value="orderInfo.bankCard" />
              </van-cell-group>

              <!-- 录制状态显示 -->
              <div class="recording-status">
                <h4>录制状态</h4>
                <div v-if="recordingResult === null" class="status-loading">
                  <van-loading size="20" />
                  <span>正在处理录制数据...</span>
                </div>
                
                <!-- 录制成功 -->
                <div v-else-if="recordingResult && typeof recordingResult === 'object' && recordingResult.success" class="recording-success-section">
                  <van-notice-bar 
                    type="success" 
                    text="录制数据处理并上传成功"
                  />
                  
                  <div class="success-info">
                    <div class="success-item">
                      <span class="label">事件数量:</span>
                      <span class="value">{{ recordingResult.recordingResult ? recordingResult.recordingResult.eventCount : (recordingResult.data ? recordingResult.data.finalData.totalEvents : 0) }}</span>
                    </div>
                    <div class="success-item">
                      <span class="label">原始大小:</span>
                      <span class="value">{{ formatFileSize(recordingResult.data ? recordingResult.data.sizes.original : 0) }}</span>
                    </div>
                    <div class="success-item">
                      <span class="label">压缩大小:</span>
                      <span class="value">{{ formatFileSize(recordingResult.data ? recordingResult.data.sizes.compressed : 0) }}</span>
                    </div>
                    <div class="success-item">
                      <span class="label">压缩率:</span>
                      <span class="value">{{ recordingResult.data ? recordingResult.data.compressionRatio : '0%' }}</span>
                    </div>
                    <div class="success-item">
                      <span class="label">上传状态:</span>
                      <van-tag :type="recordingResult.uploadResult && recordingResult.uploadResult.success ? 'success' : 'danger'">
                        {{ recordingResult.uploadResult && recordingResult.uploadResult.success ? '成功' : '失败' }}
                      </van-tag>
                    </div>
                    <div v-if="recordingResult.uploadResult && recordingResult.uploadResult.success" class="success-item">
                      <span class="label">上传ID:</span>
                      <span class="value">{{ recordingResult.uploadResult.uploadId || '未知' }}</span>
                    </div>
                  </div>

                  <!-- 录制回放区域 -->
                  <div v-if="recordingResult.recordingResult && recordingResult.recordingResult.events" class="replay-section">
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
                      <van-button 
                        type="success" 
                        size="small" 
                        @click="exportToMP4"
                        :loading="isExporting"
                        :disabled="isReplaying"
                        icon="down"
                      >
                        {{ isExporting ? '导出中...' : '导出数据' }}
                      </van-button>
                    </div>
                                        <div 
                      id="step-replay-container" 
                      class="replay-container"
                    >
                      <!-- 水印已经录制在视频中，不需要额外显示 -->
                    </div>
                  </div>
                </div>

                <!-- 录制失败 -->
                <div v-else class="recording-error-section">
                  <van-notice-bar 
                    type="danger" 
                    :text="recordingResult ? (recordingResult.message || recordingResult.error || '录制失败') : '录制处理失败'"
                  />
                </div>
              </div>

              <!-- 操作按钮 -->
              <div class="step-actions">
                <van-button 
                  v-if="recordingResult && typeof recordingResult === 'object' && recordingResult.success" 
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
import { Loading,Image as VanImage } from 'vant'

export default {
  name: 'PurchaseStepFour',
  components: {
    RecordWrapper,
    [Loading.name]: Loading,
    [VanImage.name]: VanImage
      
    
  },
  data() {
    return {
      productId: null,
      orderInfo: null,
      recordingResult: null,
      isReplaying: false,
      replayPlayer: null,
      isExporting: false
    }
  },

  watch: {
    recordingResult: {
      handler(newVal, oldVal) {
        console.log('购买完成页面：recordingResult发生变化')
        console.log('购买完成页面：旧值:', oldVal)
        console.log('购买完成页面：新值:', newVal)
        console.log('购买完成页面：新值类型:', typeof newVal)
        if (newVal) {
          console.log('购买完成页面：新值的属性:', Object.keys(newVal))
        }
      },
      immediate: true,
      deep: true
    }
  },
  async mounted() {
    this.loadOrderInfo()
    
    // 延迟调用RecordWrapper完成录制，让用户能看到完整的购买流程
    setTimeout(() => {
      this.finishRecording()
    }, 1500)
  },
  beforeDestroy() {
    // 组件销毁前停止回放
    this.stopReplay()
  },
  methods: {
    loadOrderInfo() {
      this.productId = parseInt(this.$route.query.id) || parseInt(this.$route.params.id)
      
      // 从sessionStorage中加载订单信息
      const savedOrder = sessionStorage.getItem('orderInfo')
      if (savedOrder) {
        try {
          this.orderInfo = JSON.parse(savedOrder)
        } catch (error) {
          console.error('加载订单信息失败:', error)
        }
      }
      
      if (!this.orderInfo) {
        this.$toast.fail('订单信息丢失')
        this.$router.push('/')
      }
    },

    // 完成录制 - 使用RecordWrapper的封装方法
    async finishRecording() {
      try {
        console.log('购买完成页面：开始完成录制...')
        
        // 直接通过ref调用RecordWrapper的finishRecording方法
        if (this.$refs.recordWrapper && typeof this.$refs.recordWrapper.finishRecording === 'function') {
          console.log('购买完成页面：准备调用RecordWrapper.finishRecording')
          
          const result = await this.$refs.recordWrapper.finishRecording({
            purchaseInfo: {
              ...this.orderInfo,
              timestamp: Date.now(),
              page: 'PurchaseStepFour',
              action: 'purchase-completed'
            }
          })
          
          console.log('购买完成页面：RecordWrapper.finishRecording返回结果:', result)
          console.log('购买完成页面：结果类型:', typeof result)
          
          // 注意：结果也会通过onRecordingFinished事件回调处理
          // 但我们也可以直接处理这里的结果
          if (result && typeof result === 'object') {
            this.recordingResult = result
          }
        } else {
          console.warn('RecordWrapper组件或finishRecording方法不可用')
          this.recordingResult = {
            success: false,
            error: '录制组件不可用',
            message: '录制组件不可用，请重新开始录制流程'
          }
        }
      } catch (error) {
        console.error('购买完成页面：完成录制失败:', error)
        this.recordingResult = { 
          success: false, 
          error: error.message,
          message: '录制完成失败: ' + error.message
        }
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

    goToProducts() {
      // 清理缓存数据
      sessionStorage.removeItem('purchaseForm')
      sessionStorage.removeItem('orderInfo')
      this.$router.push('/')
    },

    goHome() {
      // 清理缓存数据
      sessionStorage.removeItem('purchaseForm')
      sessionStorage.removeItem('orderInfo')
      this.$router.push('/')
    },

    // 处理录制超时
    handleRecordTimeout() {
      console.log('步骤4：录制超时')
    },

    // 处理超时确认
    handleTimeoutConfirmed() {
      // 跳转回产品列表
      this.$router.push('/')
    },

    // 录制完成事件处理 - 由RecordWrapper触发
    onRecordingFinished(result) {
      console.log('购买完成页面：收到录制完成事件:', result)
      console.log('购买完成页面：result类型:', typeof result)
      console.log('购买完成页面：result.success:', result ? result.success : 'result为空')
      
      // 确保result是一个有效的对象
      if (result && typeof result === 'object') {
        this.recordingResult = result
        
        if (result.success) {
          this.$toast.success('录制完成并上传成功')
        } else {
          this.$toast.fail('录制完成失败: ' + (result.message || result.error))
        }
      } else {
        console.error('购买完成页面：收到无效的录制结果:', result)
        this.recordingResult = {
          success: false,
          error: '收到无效的录制结果',
          message: '录制数据格式错误'
        }
        this.$toast.fail('录制数据格式错误')
      }
    },

    // 开始回放
    async startReplay() {
      if (!this.recordingResult || !this.recordingResult.recordingResult || !this.recordingResult.recordingResult.events) {
        this.$toast.fail('没有录制数据可回放')
        return
      }
      
      try {
        console.log('开始回放流程...')
        
        // 先设置回放状态
        this.isReplaying = true
        console.log('设置isReplaying为true')
        
        // 水印已录制在视频中，无需额外处理
        
        // 清空容器并设置基础样式
        const container = document.getElementById('step-replay-container')
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
        
        console.log('PurchaseStepFour：开始回放，事件数量:', this.recordingResult.recordingResult.events.length)
        
        // 验证事件数据格式
        const events = this.recordingResult.recordingResult.events
        if (!Array.isArray(events) || events.length < 2) {
          throw new Error('录制数据格式不正确或事件太少')
        }
        
        // 检查是否有必要的事件类型
        const hasMetaEvent = events.some(e => e.type === 4)
        const hasSnapshot = events.some(e => e.type === 2)
        
        if (!hasMetaEvent || !hasSnapshot) {
          throw new Error('录制数据缺少必要的元信息或快照')
        }
        
        // 使用全局rrweb-player
        if (typeof window.rrwebPlayer === 'undefined') {
          throw new Error('rrweb-player库未找到，请确保已正确引入')
        }
        
        const rrwebPlayer = window.rrwebPlayer
        
        console.log('PurchaseStepFour：创建rrweb-player')
        
        // 直接在container中创建回放器
        this.replayPlayer = new rrwebPlayer({
          target: container,
          props: {
            events: events,
            width: container.offsetWidth || 375,
            height: 550,
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
        
        console.log('PurchaseStepFour：rrweb-player创建成功')
        
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
          
          console.log('PurchaseStepFour：已完成回放器初始化')
        }, 500)
        
        // 监听回放事件
        if (this.replayPlayer && this.replayPlayer.$on) {
          this.replayPlayer.$on('finish', () => {
            this.isReplaying = false
            console.log('PurchaseStepFour：回放完成')
          })
          
          this.replayPlayer.$on('start', () => {
            console.log('PurchaseStepFour：回放开始')
          })
        }
        
        this.$toast.success('开始回放购买流程')
        
      } catch (error) {
        console.error('PurchaseStepFour：回放失败:', error)
        this.isReplaying = false
        this.$toast.fail('回放失败: ' + error.message)
        
        // 显示错误信息
        const container = document.getElementById('step-replay-container')
        if (container) {
          container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #f56c6c; background: white;">
              <h4>回放失败</h4>
              <p style="font-size: 12px; margin-top: 10px;">${error.message}</p>
              <p style="font-size: 10px; color: #999; margin-top: 10px;">
                事件数量: ${this.recordingResult.recordingResult && this.recordingResult.recordingResult.events ? this.recordingResult.recordingResult.events.length : 0}
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
          if (this.replayPlayer.$destroy) {
            this.replayPlayer.$destroy()
          }
          this.replayPlayer = null
        } catch (error) {
          console.error('停止回放失败:', error)
        }
      }
      this.isReplaying = false
      
      // 水印已录制在视频中，无需额外处理
      
      // 清理容器
      const container = document.getElementById('step-replay-container')
      if (container) {
        container.innerHTML = '<div style="text-align: center; padding: 50px; color: #999;">回放已停止</div>'
      }
    },

    // 水印相关方法已移除，因为水印已录制在视频中

    // 导出录制数据
    async exportToMP4() {
      if (!this.recordingResult || !this.recordingResult.recordingResult || !this.recordingResult.recordingResult.events) {
        this.$toast.fail('没有录制数据可导出')
        return
      }

      this.isExporting = true
      
      try {
        const events = this.recordingResult.recordingResult.events
        const orderNo = this.orderInfo?.orderNo || 'UNKNOWN'
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '')
        
        const exportData = {
          orderNo: orderNo,
          productId: this.productId,
          productName: this.orderInfo?.productName || '未知产品',
          exportTime: new Date().toISOString(),
          duration: this.recordingResult.recordingResult.duration,
          eventCount: events.length,
          events: events
        }
        
        const filename = `购买流程录制_${orderNo}_${timestamp}.json`
        this.downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json')
        
        this.$toast.success('录制数据已导出')
        
      } catch (error) {
        this.$toast.fail('导出失败')
      } finally {
        this.isExporting = false
      }
    },



        // 下载文件的通用方法
    downloadFile(content, filename, mimeType) {
      return new Promise((resolve) => {
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        resolve()
      })
    },


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

.recording-status {
  margin-top: 20px;
  text-align: left;
}

.recording-status h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #323233;
}

.status-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f7f8fa;
  border-radius: 6px;
  color: #666;
  font-size: 14px;
}

.success-info {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 6px;
  padding: 12px;
  margin-top: 12px;
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

.recording-error-section {
  margin-top: 12px;
}

.step-actions {
  margin-top: 24px;
}

.step-actions .van-button {
  height: 48px;
  font-size: 16px;
}

.replay-section {
  margin-top: 20px;
  text-align: left;
}

.replay-controls {
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.replay-controls .van-button {
  flex: 1;
  min-width: 90px;
  margin-right: 0;
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
  overflow: visible !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* 水印相关样式已移除，因为水印已录制在视频中 */





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
  overflow: visible !important;
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
  height: calc(100% - 50px) !important;
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
</style> 