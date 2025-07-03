// import pako from 'pako' // 已移除，使用全局变量
import { record } from '../utils/screen-record'

class GlobalRecorder {
  constructor() {
    this.recorder = null
    this.events = []
    this.isRecording = false
    this.listeners = []
    this.recordingId = null
    this.recordingStartTime = null
    this.maxRecordingDuration = 3 * 60 * 1000 // 3分钟
    this.watermarkElement = null
    this.watermarkTimer = null
    console.log('GlobalRecorder：初始化完成')
  }

  // 获取全局唯一实例
  static getInstance() {
    if (!GlobalRecorder.instance) {
      GlobalRecorder.instance = new GlobalRecorder()
    }
    return GlobalRecorder.instance
  }

  // 添加事件监听器
  addListener(callback) {
    this.listeners.push(callback)
  }

  // 移除事件监听器
  removeListener(callback) {
    const index = this.listeners.indexOf(callback)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // 触发事件
  emit(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('监听器执行错误:', error)
      }
    })
  }

  // 开始录制
  async startRecording(metadata = {}) {
    if (this.isRecording) {
      console.warn('录制已在进行中')
      return false
    }

    try {
      console.log('GlobalRecorder：开始录制...')
      
      this.recordingId = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      this.recordingStartTime = Date.now()
      this.events = []
      
      // 检查全局rrweb是否可用
      if (typeof window.rrweb === 'undefined') {
        throw new Error('rrweb库未找到，请确保已正确引入')
      }
      
      // 直接使用全局rrweb.record函数，并将事件存储到this.events
      this.recorder = window.rrweb.record({
        emit: (event) => {
          // 直接将事件添加到全局数组
          this.events.push(event)
          console.log('GlobalRecorder：记录事件，类型:', event.type, '总数:', this.events.length)
        },
        checkoutEveryNms: 30 * 1000, // 每30秒创建一个检查点
        recordCanvas: true,
        collectFonts: true,
        inlineStylesheet: true,
        ...metadata
      })
      
      if (this.recorder && typeof this.recorder === 'function') {
        this.isRecording = true
        this.createGlobalWatermark()
        this.emit('started', { recordingId: this.recordingId })
        console.log('GlobalRecorder：录制开始成功')
        return true
      } else {
        throw new Error('录制器初始化失败')
      }
    } catch (error) {
      console.error('GlobalRecorder：开始录制失败:', error)
      this.isRecording = false
      this.removeGlobalWatermark()
      this.emit('error', error)
      return false
    }
  }

  // 开始超时定时器
  startTimeoutTimer() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
    }
    
    this.timeoutTimer = setTimeout(() => {
      this.handleRecordingTimeout()
    }, this.maxRecordingDuration)
    
    console.log('全局录制器：超时定时器已启动，', this.maxRecordingDuration / 1000, '秒后超时')
  }

  // 处理录制超时
  async handleRecordingTimeout() {
    console.log('全局录制器：录制超时，自动停止录制')
    
    if (this.isRecording) {
      try {
        await this.stopRecording()
        this.emit('timeout', {
          duration: this.maxRecordingDuration,
          message: '录制时间超过3分钟，已自动停止'
        })
      } catch (error) {
        console.error('超时停止录制失败:', error)
      }
    }
  }

  // 清除超时定时器
  clearTimeoutTimer() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
      this.timeoutTimer = null
      console.log('全局录制器：超时定时器已清除')
    }
  }

  // 停止录制
  async stopRecording() {
    if (!this.isRecording) {
      console.warn('录制未开始')
      return null
    }

    try {
      console.log('GlobalRecorder：停止录制...')
      
      if (this.recorder && typeof this.recorder === 'function') {
        this.recorder() // 调用停止函数
      }
      
      this.isRecording = false
      this.removeGlobalWatermark()
      const events = [...this.events]
      
      console.log('GlobalRecorder：录制停止成功, 事件数量:', events.length)
      console.log('GlobalRecorder：前3个事件:', events.slice(0, 3))
      
      this.emit('stopped', { events })
      
      return events
    } catch (error) {
      console.error('GlobalRecorder：停止录制失败:', error)
      this.isRecording = false
      this.removeGlobalWatermark()
      this.emit('error', error)
      return null
    }
  }

  // 获取录制状态
  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      recordingId: this.recordingId,
      eventCount: this.events.length,
      startTime: this.recordingStartTime
    }
  }

  // 停止录制并处理数据
  async stopRecordingAndProcess(additionalInfo = {}) {
    try {
      console.log('GlobalRecorder：停止录制并处理数据...')
      
      const events = await this.stopRecording()
      
      if (!events || events.length === 0) {
        return {
          success: false,
          error: '录制数据为空'
        }
      }

      console.log('GlobalRecorder：开始处理录制数据，事件数量:', events.length)
      
      // 验证事件数据格式
      const validEvents = events.filter(event => event && event.type !== undefined && event.timestamp)
      if (validEvents.length === 0) {
        return {
          success: false,
          error: '录制数据格式无效'
        }
      }
      
      console.log('GlobalRecorder：有效事件数量:', validEvents.length)
      
      // 计算录制时长
      const duration = this.recordingStartTime ? Date.now() - this.recordingStartTime : 0
      
      // 准备基础数据
      const baseData = {
        recordingId: this.recordingId,
        events: validEvents,
        startTime: new Date(this.recordingStartTime).toISOString(),
        endTime: new Date().toISOString(),
        duration: duration,
        totalEvents: validEvents.length,
        ...additionalInfo
      }
      
      // 序列化原始数据
      const originalData = JSON.stringify(baseData)
      const originalSize = new Blob([originalData]).size
      
      console.log('GlobalRecorder：原始数据大小:', originalSize, '字节')
      
      // 使用全局pako进行压缩
      if (typeof window.pako === 'undefined') {
        throw new Error('pako压缩库未找到，请确保已正确引入')
      }
      
      const compressed = window.pako.gzip(originalData)
      const compressedSize = compressed.length
      const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(2) + '%'
      
      console.log('GlobalRecorder：压缩后大小:', compressedSize, '字节，压缩率:', compressionRatio)
      
      // 准备最终数据
      const finalData = {
        ...baseData,
        compressedEvents: Array.from(compressed) // 转换为数组便于传输
      }
      
      const result = {
        success: true,
        recordingResult: {
          events: validEvents,
          duration: duration,
          eventCount: validEvents.length
        },
        data: {
          recordingId: this.recordingId,
          startTime: baseData.startTime,
          endTime: baseData.endTime,
          duration: duration,
          finalData: finalData,
          sizes: {
            original: originalSize,
            compressed: compressedSize
          },
          compressionRatio: compressionRatio
        }
      }
      
      console.log('GlobalRecorder：数据处理完成')
      return result
      
    } catch (error) {
      console.error('GlobalRecorder：处理录制数据失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // 完成录制（供外部页面调用的简单接口）
  async finishRecording(businessData = {}) {
    console.log('GlobalRecorder：收到完成录制请求，业务数据:', businessData)
    
    try {
      // 调用内部的停止录制并处理方法
      const result = await this.stopRecordingAndProcess(businessData)
      
      // 发送完成事件给父组件
      this.emit('recording-finished', result)
      
      return result
    } catch (error) {
      console.error('GlobalRecorder：完成录制失败:', error)
      const errorResult = {
        success: false,
        error: error.message,
        message: '录制完成处理失败'
      }
      
      this.emit('recording-finished', errorResult)
      return errorResult
    }
  }

  // 创建全局水印
  createGlobalWatermark() {
    if (this.watermarkElement) {
      this.removeGlobalWatermark()
    }

    // 创建水印元素
    this.watermarkElement = document.createElement('div')
    this.watermarkElement.id = 'global-recording-watermark'
    this.watermarkElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-family: monospace;
      z-index: 999999;
      pointer-events: none;
      border: 1px solid rgba(255, 255, 255, 0.3);
    `

    // 添加到body
    document.body.appendChild(this.watermarkElement)

    // 启动定时器更新时间
    this.updateWatermarkTime()
    this.watermarkTimer = setInterval(() => {
      this.updateWatermarkTime()
    }, 1000)

    console.log('GlobalRecorder：全局水印已创建')
  }

  // 更新水印时间
  updateWatermarkTime() {
    if (!this.watermarkElement) return

    const now = new Date()
    const timeText = now.getFullYear() + '年' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '月' + 
                    String(now.getDate()).padStart(2, '0') + '日 ' + 
                    String(now.getHours()).padStart(2, '0') + ':' + 
                    String(now.getMinutes()).padStart(2, '0') + ':' +
                    String(now.getSeconds()).padStart(2, '0')

    this.watermarkElement.textContent = timeText
  }

  // 移除全局水印
  removeGlobalWatermark() {
    // 清理定时器
    if (this.watermarkTimer) {
      clearInterval(this.watermarkTimer)
      this.watermarkTimer = null
    }

    // 移除DOM元素
    if (this.watermarkElement && this.watermarkElement.parentNode) {
      this.watermarkElement.parentNode.removeChild(this.watermarkElement)
      this.watermarkElement = null
      console.log('GlobalRecorder：全局水印已移除')
    }
  }
}

export default GlobalRecorder 