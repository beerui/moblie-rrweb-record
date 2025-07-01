// import { record } from 'rrweb' // 已移除，使用全局变量
// import pako from 'pako' // 已移除，使用全局变量

// 导出封装的record函数，供其他模块使用
export function record(options = {}) {
  if (typeof window.rrweb === 'undefined') {
    throw new Error('rrweb库未找到，请确保已正确引入')
  }
  
  const events = []
  
  // 使用全局rrweb.record函数
  const stopRecording = window.rrweb.record({
    emit(event) {
      events.push(event)
    },
    checkoutEveryNms: 30 * 1000, // 每30秒创建一个检查点
    ...options
  })
  
  return {
    stop: stopRecording,
    addEvents: (targetArray) => {
      // 将events数组的引用添加到目标数组
      targetArray.push(...events)
    },
    getEvents: () => [...events]
  }
}

class ScreenRecorder {
  constructor(options = {}) {
    this.events = []
    this.isRecording = false
    this.stopRecording = null
    this.metadata = {}
    this.options = {
      uploadUrl: '/api/record/upload',
      autoUpload: true,
      compressData: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      ...options
    }
    console.log('ScreenRecorder初始化完成，配置:', this.options)
  }

  async startRecording(metadata = {}) {
    if (this.isRecording) {
      console.log('录制已在进行中')
      return true
    }

    try {
      console.log('开始录制，元数据:', metadata)
      
      this.metadata = metadata
      this.events = []
      
      if (typeof window.rrweb === 'undefined') {
        throw new Error('rrweb库未找到，请确保已正确引入')
      }

      // 使用全局rrweb.record函数
      this.stopRecording = window.rrweb.record({
        emit: (event) => {
          this.events.push(event)
        },
        checkoutEveryNms: 30 * 1000, // 每30秒创建一个检查点
        recordCanvas: true,
        collectFonts: true,
        inlineStylesheet: true
      })

      this.isRecording = true
      console.log('录制开始成功')
      return true
    } catch (error) {
      console.error('开始录制失败:', error)
      this.isRecording = false
      return false
    }
  }

  async stopRecording() {
    if (!this.isRecording) {
      console.log('没有正在进行的录制')
      return null
    }

    try {
      console.log('停止录制...')
      
      if (this.stopRecording) {
        this.stopRecording()
        this.stopRecording = null
      }

      this.isRecording = false
      
      const result = {
        events: [...this.events],
        metadata: this.metadata,
        timestamp: Date.now(),
        duration: 0,
        eventsCount: this.events.length
      }

      console.log('录制停止成功，事件数量:', this.events.length)
      
      // 如果设置了自动上传，则上传数据
      if (this.options.autoUpload && this.events.length > 0) {
        console.log('自动上传录制数据...')
        const uploadResult = await this.uploadRecording(result)
        result.uploadResult = uploadResult
      }

      // 清空事件数组
      this.events = []
      this.metadata = {}

      return result
    } catch (error) {
      console.error('停止录制失败:', error)
      this.isRecording = false
      return null
    }
  }

  async uploadRecording(recordingData) {
    try {
      console.log('准备上传录制数据，事件数量:', recordingData.events.length)
      
      let dataToUpload = recordingData

      // 如果启用了数据压缩
      if (this.options.compressData) {
        console.log('开始压缩录制数据...')
        dataToUpload = await this.compressRecordingData(recordingData)
        console.log('数据压缩完成')
      }

      // 检查文件大小
      const dataSize = this.getDataSize(dataToUpload)
      if (dataSize > this.options.maxFileSize) {
        console.warn('录制数据过大:', this.formatFileSize(dataSize))
        // 可以在这里实现数据优化逻辑
      }

      console.log('上传数据大小:', this.formatFileSize(dataSize))
      
      // 模拟上传请求
      const uploadResult = await this.mockUpload(dataToUpload)
      console.log('上传完成:', uploadResult)
      
      return uploadResult
    } catch (error) {
      console.error('上传录制数据失败:', error)
      return { success: false, error: error.message }
    }
  }

  async compressRecordingData(data) {
    try {
      if (typeof window.pako === 'undefined') {
        throw new Error('pako压缩库未找到，请确保已正确引入')
      }
      
      const jsonStr = JSON.stringify(data)
      const originalSize = new Blob([jsonStr]).size
      
      console.log('原始数据大小:', this.formatFileSize(originalSize))
      
      // 使用全局pako进行压缩
      const compressed = window.pako.gzip(jsonStr)
      const compressedSize = compressed.length
      
      console.log('压缩后大小:', this.formatFileSize(compressedSize))
      console.log('压缩率:', ((1 - compressedSize / originalSize) * 100).toFixed(2) + '%')
      
      return {
        ...data,
        compressed: true,
        originalSize: originalSize,
        compressedSize: compressedSize,
        compressedData: Array.from(compressed) // 转换为数组便于传输
      }
    } catch (error) {
      console.error('压缩数据失败:', error)
      return data // 压缩失败时返回原始数据
    }
  }

  async mockUpload(data) {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    return {
      success: true,
      uploadId: 'upload_' + Date.now(),
      timestamp: Date.now(),
      message: '录制数据上传成功'
    }
  }

  getDataSize(data) {
    const jsonStr = JSON.stringify(data)
    return new Blob([jsonStr]).size
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  addCustomEvent(event) {
    if (this.isRecording) {
      this.events.push({
        type: 5, // 自定义事件类型
        timestamp: Date.now(),
        data: {
          tag: 'custom',
          payload: event
        }
      })
    }
  }

  getRecordingStatus() {
    return {
      isRecording: this.isRecording,
      eventsCount: this.events.length,
      metadata: this.metadata
    }
  }
}

export default ScreenRecorder 