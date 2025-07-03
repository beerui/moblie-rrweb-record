<template>
  <div class="record-wrapper">
    <!-- 水印现在由GlobalRecorder全局管理，无需在组件中显示 -->

    <!-- 录制同意弹框 -->
    <van-dialog
      v-model="showRecordDialog"
      title="录制权限申请"
      :show-cancel-button="true"
      confirm-button-text="同意录制"
      cancel-button-text="不同意"
      :before-close="handleDialogClose"
      :close-on-click-overlay="false"
    >
      <div class="record-dialog-content">
        <div class="dialog-icon">
          <van-icon name="video-o" size="48" color="#1989fa" />
        </div>
        <p class="dialog-text">
          为了更好地记录您的操作流程，我们需要录制您在此页面的操作行为。
        </p>
        <p class="dialog-note">
          • 录制仅用于操作流程分析<br>
          • 录制数据会进行加密处理<br>
          • 您可以随时停止录制
        </p>
      </div>
    </van-dialog>

    <!-- 录制超时提示弹框 -->
    <van-dialog
      v-model="showTimeoutDialog"
      title="交易超时"
      :show-cancel-button="false"
      confirm-button-text="确定"
      @confirm="handleTimeout"
    >
      <div class="timeout-dialog-content">
        <div class="dialog-icon">
          <van-icon name="warning-o" size="48" color="#ff6b35" />
        </div>
        <p class="dialog-text">
          录制时间已超过3分钟，交易失败。请重新开始操作。
        </p>
      </div>
    </van-dialog>

    <!-- 录制状态指示器 -->
    <div v-if="showIndicator && isRecording" class="record-indicator">
      <div class="record-dot"></div>
      <span>正在录制 {{ recordingTime }}</span>
    </div>

    <!-- 录制控制按钮 -->
    <div v-if="showControls" class="record-controls">
      <van-button 
        v-if="!isRecording" 
        type="primary" 
        size="small"
        round
        @click="showRecordingConsent"
        :loading="loading"
        icon="video-o"
      >
        开始录制
      </van-button>
      <van-button 
        v-else 
        type="danger" 
        size="small"
        round
        @click="stopRecord"
        :loading="loading"
        icon="pause"
      >
        停止录制
      </van-button>
    </div>

    <!-- 内容插槽 -->
    <div class="content-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import GlobalRecorder from '@/utils/global-recorder'

export default {
  name: 'RecordWrapper',
  props: {
    // 是否显示录制状态指示器
    showIndicator: {
      type: Boolean,
      default: false
    },
    // 是否显示录制控制按钮
    showControls: {
      type: Boolean,
      default: true
    },
    // 录制配置
    recordOptions: {
      type: Object,
      default: () => ({})
    },
    // 自动开始录制
    autoStart: {
      type: Boolean,
      default: false
    },
    // 录制元数据
    metadata: {
      type: Object,
      default: () => ({})
    },
    // 组件销毁时是否停止录制
    stopOnDestroy: {
      type: Boolean,
      default: false
    },
    // 录制超时时间（毫秒），默认3分钟
    timeoutDuration: {
      type: Number,
      default: 3 * 60 * 1000 // 3分钟
    },
    // 是否需要用户同意录制
    requireConsent: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      globalRecorder: null,
      isRecording: false,
      loading: false,
      showRecordDialog: false,
      showTimeoutDialog: false,
      recordingStartTime: null,
      recordingTimer: null,
      timeoutTimer: null,
      recordingTime: '00:00',
      hasUserConsent: false,
      showConsentDialog: false
    }
  },
  async mounted() {
    // 获取全局录制器实例
    this.globalRecorder = GlobalRecorder.getInstance()
    
    // 添加监听器
    this.globalRecorder.addListener(this.onRecordEvent)
    
    // 获取当前录制状态
    const status = this.globalRecorder.getRecordingStatus()
    this.isRecording = status.isRecording

    // 如果已经在录制，启动计时器
    if (this.isRecording) {
      this.startRecordingTimer()
    }

    // 如果设置了自动开始且当前没有录制
    if (this.autoStart && !this.isRecording) {
      setTimeout(() => {
        if (this.requireConsent && !this.hasUserConsent) {
          // 需要用户同意，显示弹框，但不开始录制
          console.log('RecordWrapper：显示录制同意弹框')
          this.showRecordingConsent()
        } else {
          // 不需要同意或用户已同意，直接开始录制
          console.log('RecordWrapper：自动开始录制')
          this.startRecord()
        }
      }, 500) // 减少延迟，让用户更快看到弹框
    }
  },
  beforeDestroy() {
    // 清理定时器
    this.clearTimers()
    
    // 移除监听器
    if (this.globalRecorder) {
      this.globalRecorder.removeListener(this.onRecordEvent)
    }
    
    // 组件销毁前停止录制（只有在设置了stopOnDestroy时才停止）
    if (this.isRecording && this.stopOnDestroy) {
      this.stopRecord()
    }
  },
  methods: {
    // 显示录制同意弹框（供外部调用）
    showRecordingConsent() {
      if (this.requireConsent && !this.isRecording) {
        this.showRecordDialog = true
      } else if (!this.requireConsent && !this.isRecording) {
        // 如果不需要同意，直接开始录制
        this.startRecord()
      }
    },

    // 处理弹框关闭
    handleDialogClose(action) {
      this.showRecordDialog = false
      if (action === 'confirm') {
        // 用户同意录制
        this.hasUserConsent = true
        this.startRecord()
      } else {
        // 用户拒绝录制
        this.$toast('已取消录制')
        this.$emit('record-declined')
      }
    },

    // 开始录制
    async startRecord() {
      if (this.loading || this.isRecording) return

      this.loading = true
      try {
        const success = await this.globalRecorder.startRecording({
          ...this.metadata,
          component: this.$options.name,
          route: this.$route.path,
          startTime: new Date().toISOString()
        })

        if (success) {
          this.recordingStartTime = Date.now()
          this.startRecordingTimer()
          this.startTimeoutTimer()
          this.$emit('record-started')
          this.$toast.success('开始录制')
        } else {
          this.$toast.fail('录制启动失败')
        }
      } catch (error) {
        console.error('启动录制失败:', error)
        this.$toast.fail('录制启动失败')
      } finally {
        this.loading = false
      }
    },

    // 停止录制
    async stopRecord() {
      if (this.loading || !this.isRecording) return

      this.loading = true
      try {
        this.clearTimers()
        const result = await this.globalRecorder.stopRecording()
        this.$emit('record-stopped', result)
        
        if (result) {
          this.$toast.success('录制已完成')
        } else {
          this.$toast.fail('录制停止失败')
        }
      } catch (error) {
        console.error('停止录制失败:', error)
        this.$toast.fail('录制停止失败')
      } finally {
        this.loading = false
      }
    },

    // 停止录制并处理数据（统一处理方法）
    async stopRecordingAndProcess(additionalInfo = {}) {
      if (this.loading || !this.isRecording) {
        return {
          success: false,
          error: '录制未开始或已停止'
        }
      }

      this.loading = true
      try {
        this.clearTimers()
        
        // 使用全局录制器的stopRecordingAndProcess方法
        const result = await this.globalRecorder.stopRecordingAndProcess({
          ...additionalInfo,
          component: this.$options.name,
          route: this.$route.path,
          stopTime: new Date().toISOString()
        })
        
        console.log('RecordWrapper：录制数据处理结果:', result)
        
        if (result.success) {
          // 上传录制数据到视频存储接口
          const uploadResult = await this.uploadVideoData(result.data, additionalInfo)
          
          console.log('RecordWrapper：视频上传结果:', uploadResult)
          
          const finalResult = {
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
          
          // 发送处理完成事件
          this.$emit('record-processed', finalResult)
          this.$toast.success('录制数据处理并上传成功')
          
          return finalResult
        } else {
          console.warn('RecordWrapper：录制数据处理失败:', result.error)
          const errorResult = { 
            success: false, 
            error: result.error,
            message: result.error === '录制数据为空' ? 
              '请先开始录制，然后进行操作' : 
              '录制过程中出现错误'
          }
          
          this.$emit('record-process-failed', errorResult)
          this.$toast.fail('录制数据处理失败: ' + result.error)
          
          return errorResult
        }
      } catch (error) {
        console.error('RecordWrapper：停止录制并处理数据失败:', error)
        const errorResult = { success: false, error: error.message }
        
        this.$emit('record-process-failed', errorResult)
        this.$toast.fail('录制处理失败: ' + error.message)
        
        return errorResult
      } finally {
        this.loading = false
      }
    },

    // 上传视频数据到专门的视频存储接口
    async uploadVideoData(recordingData, additionalInfo = {}) {
      try {
        console.log('RecordWrapper：开始上传视频数据...')
        
        // 准备上传数据
        const uploadData = {
          // 录制基础信息
          recordingInfo: {
            duration: recordingData.duration,
            eventCount: recordingData.finalData.totalEvents,
            startTime: recordingData.startTime,
            endTime: recordingData.endTime,
            compressionRatio: recordingData.compressionRatio
          },
          
          // 录制事件数据（压缩后）
          eventsData: recordingData.finalData.compressedEvents,
          
          // 文件大小信息
          sizes: recordingData.sizes,
          
          // 附加业务信息
          businessInfo: {
            ...additionalInfo,
            component: this.$options.name,
            route: this.$route.path,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          },
          
          // 元数据
          metadata: {
            ...this.metadata,
            recordingId: recordingData.recordingId || `rec_${Date.now()}`,
            version: '1.0'
          }
        }
        
        console.log('RecordWrapper：准备上传的数据大小:', JSON.stringify(uploadData).length, '字节')
        
        // 调用专门的视频上传接口
        const response = await fetch('/api/upload-video-recording', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Recording-Type': 'video-session'
          },
          body: JSON.stringify(uploadData)
        })
        
        if (!response.ok) {
          throw new Error(`上传请求失败: ${response.status} ${response.statusText}`)
        }
        
        const result = await response.json()
        
        console.log('RecordWrapper：视频上传成功:', result)
        
        return {
          success: true,
          uploadId: result.uploadId || result.id,
          videoUrl: result.videoUrl || result.url,
          size: JSON.stringify(uploadData).length,
          timestamp: Date.now(),
          response: result
        }
      } catch (error) {
        console.error('RecordWrapper：视频上传失败:', error)
        
        // 如果是网络错误或服务器错误，尝试本地存储
        try {
          const localStorageKey = `video_recording_${Date.now()}`
          const localData = {
            ...recordingData,
            additionalInfo,
            uploadFailedAt: new Date().toISOString(),
            error: error.message
          }
          
          localStorage.setItem(localStorageKey, JSON.stringify(localData))
          console.log('RecordWrapper：视频数据已保存到本地存储:', localStorageKey)
          
          return {
            success: false,
            error: error.message,
            localStorageKey: localStorageKey,
            fallbackStorage: true,
            message: '上传失败，数据已保存到本地存储'
          }
        } catch (localError) {
          console.error('RecordWrapper：本地存储也失败:', localError)
          
          return {
            success: false,
            error: error.message,
            localError: localError.message,
            message: '上传失败且本地存储失败'
          }
        }
      }
    },

    // 开始录制计时器
    startRecordingTimer() {
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer)
      }
      
      this.recordingTimer = setInterval(() => {
        if (this.recordingStartTime) {
          const elapsed = Date.now() - this.recordingStartTime
          this.recordingTime = this.formatTime(elapsed)
        }
      }, 1000)
    },

    // 开始超时计时器
    startTimeoutTimer() {
      if (this.timeoutTimer) {
        clearTimeout(this.timeoutTimer)
      }
      
      this.timeoutTimer = setTimeout(() => {
        this.handleRecordingTimeout()
      }, this.timeoutDuration)
    },

    // 处理录制超时
    async handleRecordingTimeout() {
      console.log('录制超时，停止录制')
      this.showTimeoutDialog = true
      
      // 停止录制
      if (this.isRecording) {
        await this.stopRecord()
      }
      
      this.$emit('record-timeout')
    },

    // 处理超时弹框确认
    handleTimeout() {
      this.showTimeoutDialog = false
      // 可以在这里添加跳转到指定页面的逻辑
      this.$emit('timeout-confirmed')
    },

    // 清理所有定时器
    clearTimers() {
      if (this.recordingTimer) {
        clearInterval(this.recordingTimer)
        this.recordingTimer = null
      }
      if (this.timeoutTimer) {
        clearTimeout(this.timeoutTimer)
        this.timeoutTimer = null
      }
    },

    // 格式化时间显示
    formatTime(milliseconds) {
      const totalSeconds = Math.floor(milliseconds / 1000)
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    },

    // 获取录制状态
    getRecordingStatus() {
      return this.globalRecorder ? this.globalRecorder.getRecordingStatus() : null
    },

    // 录制事件监听器
    onRecordEvent(event, data) {
      switch (event) {
        case 'started':
          this.isRecording = true
          break
        case 'stopped':
          this.isRecording = false
          this.clearTimers()
          this.recordingTime = '00:00'
          break
        case 'error':
          this.isRecording = false
          this.clearTimers()
          console.error('录制错误:', data)
          break
      }
    },

    // 完成录制（供外部页面调用的简单接口）
    async finishRecording(businessData = {}) {
      console.log('RecordWrapper：收到完成录制请求，业务数据:', businessData)
      
      try {
        // 检查录制状态
        if (!this.isRecording) {
          console.warn('RecordWrapper：录制未开始，无法完成录制')
          const errorResult = {
            success: false,
            error: '录制未开始',
            message: '请先开始录制，然后进行操作'
          }
          this.$emit('recording-finished', errorResult)
          return errorResult
        }
        
        // 直接调用GlobalRecorder的finishRecording方法
        const result = await this.globalRecorder.finishRecording(businessData)
        
        console.log('RecordWrapper：录制完成结果:', result)
        
        // 发送完成事件给父组件
        this.$emit('recording-finished', result)
        
        return result
      } catch (error) {
        console.error('RecordWrapper：完成录制失败:', error)
        const errorResult = {
          success: false,
          error: error.message,
          message: '录制完成处理失败'
        }
        
        this.$emit('recording-finished', errorResult)
        return errorResult
      }
    },

    // 水印相关方法已移除，现在由GlobalRecorder全局管理
  }
}
</script>

<style scoped>
.record-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content-wrapper {
  width: 100%;
  height: 100%;
}

.record-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 107, 107, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(10px);
}

.record-dot {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.record-controls {
  position: fixed;
  bottom: 30px;
  right: 20px;
  z-index: 1000;
}

.record-controls .van-button {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 弹框内容样式 */
.record-dialog-content {
  text-align: center;
  padding: 20px 0;
}

.timeout-dialog-content {
  text-align: center;
  padding: 20px 0;
}

.dialog-icon {
  margin-bottom: 16px;
}

.dialog-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-bottom: 16px;
}

.dialog-note {
  font-size: 12px;
  color: #666;
  line-height: 1.6;
  text-align: left;
  background: #f7f8fa;
  padding: 12px;
  border-radius: 6px;
  margin: 0;
}

/* 水印样式已移除，现在由GlobalRecorder全局管理 */
</style> 