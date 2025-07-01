<template>
  <div class="simple-record">
    <van-nav-bar title="页面录制" fixed />
    
    <div class="content">
      <!-- 录制控制区域 -->
      <div class="control-section">
        <div class="status-info">
          <div class="status-text">
            <span v-if="!isRecording && !recordData">准备录制</span>
            <span v-if="isRecording">正在录制中...</span>
            <span v-if="!isRecording && recordData">录制完成</span>
          </div>
          <div v-if="isRecording" class="recording-indicator">
            <div class="red-dot"></div>
            <span>REC</span>
          </div>
        </div>

        <div class="control-buttons">
          <van-button 
            v-if="!isRecording && !recordData"
            type="primary" 
            size="large" 
            block
            round
            @click="startRecord"
            :loading="loading"
            icon="video-o"
          >
            开始录制
          </van-button>

          <van-button 
            v-if="isRecording"
            type="danger" 
            size="large" 
            block
            round
            @click="stopRecord"
            :loading="loading"
            icon="stop"
          >
            停止录制
          </van-button>

          <div v-if="!isRecording && recordData" class="action-buttons">
            <van-button 
              type="primary" 
              size="large"
              round
              @click="playRecord"
              icon="play"
            >
              播放回放
            </van-button>
            <van-button 
              type="info" 
              size="large"
              round
              @click="downloadCompressedFile"
              :loading="downloading"
              icon="download"
            >
              下载压缩文件
            </van-button>
            <van-button 
              type="success" 
              size="large"
              round
              @click="uploadRecord"
              :loading="uploading"
              icon="cloud-upload"
            >
              上传录制
            </van-button>
            <van-button 
              size="large"
              round
              @click="resetRecord"
              icon="refresh"
            >
              重新录制
            </van-button>
          </div>
        </div>
      </div>

      <!-- 录制信息 -->
      <div v-if="recordData" class="record-info">
        <van-cell-group title="录制信息">
          <van-cell title="录制时长" :value="recordDuration" />
          <van-cell title="事件数量" :value="recordData.events ? recordData.events.length : 0" />
          <van-cell title="数据大小" :value="recordSize" />
          <van-cell title="录制时间" :value="recordTime" />
        </van-cell-group>
      </div>

      <!-- 回放区域 -->
      <div v-if="showPlayer" class="player-section">
        <div class="player-header">
          <h3>录制回放</h3>
          <van-button size="small" @click="closePlayer" icon="cross">关闭</van-button>
        </div>
        <div ref="playerContainer" class="player-container"></div>
        <div class="player-controls">
          <van-button size="small" @click="togglePlay" :icon="isPlaying ? 'pause' : 'play'">
            {{ isPlaying ? '暂停' : '播放' }}
          </van-button>
          <van-button size="small" @click="resetPlayer" icon="replay">重播</van-button>
        </div>
      </div>

      <!-- 演示内容区域 -->
      <div class="demo-section">
        <van-cell-group title="演示操作区域">
          <van-cell title="点击这里" is-link @click="demoClick" />
          <van-field v-model="demoText" label="输入文本" placeholder="在这里输入一些文字" />
          <van-cell title="切换开关">
            <template #right-icon>
              <van-switch v-model="demoSwitch" />
            </template>
          </van-cell>
        </van-cell-group>

        <div class="demo-buttons">
          <van-button type="primary" @click="demoAlert">显示弹窗</van-button>
          <van-button type="warning" @click="demoToast">显示提示</van-button>
        </div>
      </div>

      <!-- 页面跳转区域 -->
      <div class="navigation-section">
        <van-cell-group title="录制模式">
          <van-cell title="多页面录制" is-link @click="goToMultiPage" />
        </van-cell-group>
      </div>
    </div>
  </div>
</template>

<script>
// import { record } from 'rrweb' // 已移除，使用全局变量
// import rrwebPlayer from 'rrweb-player' // 已移除，使用全局变量
// import pako from 'pako' // 已移除，使用全局变量
import axios from 'axios'

export default {
  name: 'SimpleRecord',
  data() {
    return {
      isRecording: false,
      loading: false,
      uploading: false,
      downloading: false,
      recordData: null,
      recordTime: '',
      stopFn: null,
      events: [],
      
      // 播放器相关
      showPlayer: false,
      player: null,
      isPlaying: false,
      
      // 演示数据
      demoText: '',
      demoSwitch: false
    }
  },
  computed: {
    recordDuration() {
      if (!this.recordData || !this.recordData.metadata) return '0秒'
      const duration = Math.round(this.recordData.metadata.duration / 1000)
      return `${duration}秒`
    },
    recordSize() {
      if (!this.recordData) return '0KB'
      const size = JSON.stringify(this.recordData).length
      return `${(size / 1024).toFixed(2)}KB`
    }
  },
  methods: {
    // 开始录制
    async startRecord() {
      this.loading = true
      try {
        // 等待页面完全加载
        await this.waitForPageLoad()
        
        this.events = []
        this.recordData = null
        
        // 检查全局rrweb是否可用
        if (typeof window.rrweb === 'undefined') {
          throw new Error('rrweb库未找到，请确保已正确引入')
        }
        
        console.log('SimpleRecord：开始录制，rrweb版本:', window.rrweb)
        
        // 开始rrweb录制
        this.stopFn = window.rrweb.record({
          emit: (event) => {
            this.events.push(event)
            console.log('SimpleRecord：记录事件，类型:', event.type, '总数:', this.events.length)
          },
          recordCanvas: true,
          collectFonts: true,
          checkoutEveryNms: 30 * 1000 // 每30秒创建一个检查点
        })
        
        this.isRecording = true
        this.recordTime = new Date().toLocaleString()
        this.$toast.success('开始录制')
        
        console.log('SimpleRecord：录制启动成功，stopFn:', typeof this.stopFn)
      } catch (error) {
        console.error('录制失败:', error)
        this.$toast.fail('录制失败: ' + error.message)
      } finally {
        this.loading = false
      }
    },

    // 停止录制
    async stopRecord() {
      this.loading = true
      try {
        if (this.stopFn) {
          this.stopFn()
          this.stopFn = null
        }
        
        this.isRecording = false
        
        // 生成录制数据
        this.recordData = {
          events: this.events,
          metadata: {
            recordTime: Date.now(),
            eventsCount: this.events.length,
            duration: this.events.length > 0 ? 
              this.events[this.events.length - 1].timestamp - this.events[0].timestamp : 0
          }
        }
        
        this.$toast.success('录制完成')
      } catch (error) {
        console.error('停止录制失败:', error)
        this.$toast.fail('停止录制失败')
      } finally {
        this.loading = false
      }
    },

    // 播放录制
    async playRecord() {
      if (!this.recordData || !this.recordData.events) {
        this.$toast.fail('没有录制数据')
        return
      }
      
      // 检查事件数量
      if (this.recordData.events.length < 2) {
        this.$toast.fail('录制事件不足，无法回放')
        return
      }
      
      this.showPlayer = true
      await this.$nextTick()
      
      try {
        // 清理之前的播放器
        if (this.$refs.playerContainer) {
          this.$refs.playerContainer.innerHTML = ''
        }
        
        // 检查全局rrweb-player是否可用
        if (typeof window.rrwebPlayer === 'undefined') {
          throw new Error('rrweb-player库未找到，请确保已正确引入')
        }
        
        // 创建新的播放器
        this.player = new window.rrwebPlayer({
          target: this.$refs.playerContainer,
          props: {
            events: this.recordData.events,
            width: 375,
            height: 400,
            autoPlay: false,
            showController: true,
            skipInactive: true,
            speed: 1
          }
        })
        
        this.isPlaying = false
        this.$toast.success('录制加载成功')
        
        // 监听播放器事件
        if (this.player && this.player.addEventListener) {
          this.player.addEventListener('finish', () => {
            this.isPlaying = false
          })
        }
        
      } catch (error) {
        console.error('播放失败:', error)
        this.$toast.fail('播放失败: ' + error.message)
        this.showPlayer = false
      }
    },

    // 上传录制
    async uploadRecord() {
      if (!this.recordData) {
        this.$toast.fail('没有录制数据')
        return
      }
      
      this.uploading = true
      try {
        // 生成压缩文件
        const result = await this.generateCompressedFile()
        
        if (!result.success) {
          this.$toast.fail(result.message)
          return
        }
        
        // 模拟上传到服务器
        console.log('上传数据:', result.data)
        console.log('文件大小:', (result.size / 1024 / 1024).toFixed(2) + 'MB')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        this.$toast.success(`上传成功 (${(result.size / 1024 / 1024).toFixed(2)}MB)`)
      } catch (error) {
        console.error('上传失败:', error)
        this.$toast.fail('上传失败')
      } finally {
        this.uploading = false
      }
    },

    // 生成压缩文件
    async generateCompressedFile() {
      try {
        const MAX_SIZE = 2 * 1024 * 1024 // 2MB限制
        
        // 优化录制数据
        let optimizedData = this.optimizeRecordData(this.recordData)
        
        // 检查全局pako是否可用
        if (typeof window.pako === 'undefined') {
          throw new Error('pako压缩库未找到，请确保已正确引入')
        }
        
        // 压缩数据
        const jsonString = JSON.stringify(optimizedData)
        const compressed = window.pako.gzip(jsonString)
        
        const compressedData = {
          compressed: true,
          data: Array.from(compressed),
          originalSize: jsonString.length,
          compressedSize: compressed.length,
          metadata: optimizedData.metadata,
          timestamp: new Date().toISOString()
        }
        
        const finalJson = JSON.stringify(compressedData)
        const finalSize = finalJson.length
        
        console.log('文件大小检查:')
        console.log('原始数据:', (jsonString.length / 1024).toFixed(2) + 'KB')
        console.log('压缩后:', (compressed.length / 1024).toFixed(2) + 'KB')
        console.log('最终JSON:', (finalSize / 1024).toFixed(2) + 'KB')
        console.log('压缩比:', ((1 - compressed.length / jsonString.length) * 100).toFixed(2) + '%')
        
        // 检查文件大小
        if (finalSize > MAX_SIZE) {
          // 如果超过2MB，进一步优化
          const furtherOptimized = this.furtherOptimizeData(optimizedData)
          const recompressed = window.pako.gzip(JSON.stringify(furtherOptimized))
          
          const newCompressedData = {
            compressed: true,
            data: Array.from(recompressed),
            originalSize: JSON.stringify(furtherOptimized).length,
            compressedSize: recompressed.length,
            metadata: furtherOptimized.metadata,
            timestamp: new Date().toISOString(),
            optimized: true
          }
          
          const newFinalJson = JSON.stringify(newCompressedData)
          const newFinalSize = newFinalJson.length
          
          console.log('进一步优化后:', (newFinalSize / 1024).toFixed(2) + 'KB')
          
          if (newFinalSize > MAX_SIZE) {
            return {
              success: false,
              message: `文件过大 (${(newFinalSize / 1024 / 1024).toFixed(2)}MB)，请缩短录制时间`
            }
          }
          
          return {
            success: true,
            data: newCompressedData,
            size: newFinalSize,
            optimized: true
          }
        }
        
        return {
          success: true,
          data: compressedData,
          size: finalSize,
          optimized: false
        }
        
      } catch (error) {
        console.error('压缩失败:', error)
        return {
          success: false,
          message: '数据压缩失败'
        }
      }
    },

    // 优化录制数据
    optimizeRecordData(data) {
      const optimized = {
        events: data.events.map(event => {
          // 移除不必要的字段，保留核心数据
          const optimizedEvent = {
            type: event.type,
            timestamp: event.timestamp
          }
          
          // 只保留必要的data字段
          if (event.data) {
            optimizedEvent.data = {}
            
            // 根据事件类型保留关键字段
            switch (event.type) {
              case 0: // DomContentLoaded
              case 1: // Load
                optimizedEvent.data = {
                  href: event.data.href,
                  width: event.data.width,
                  height: event.data.height
                }
                break
              case 2: // FullSnapshot
                optimizedEvent.data = {
                  node: event.data.node,
                  initialOffset: event.data.initialOffset
                }
                break
              case 3: // IncrementalSnapshot
                optimizedEvent.data = {
                  source: event.data.source,
                  type: event.data.type,
                  id: event.data.id
                }
                // 根据具体类型添加必要字段
                if (event.data.positions) optimizedEvent.data.positions = event.data.positions
                if (event.data.texts) optimizedEvent.data.texts = event.data.texts
                if (event.data.attributes) optimizedEvent.data.attributes = event.data.attributes
                break
              default:
                optimizedEvent.data = event.data
            }
          }
          
          return optimizedEvent
        }),
        metadata: data.metadata
      }
      
      return optimized
    },

    // 进一步优化数据
    furtherOptimizeData(data) {
      // 采样优化：保留关键事件，减少冗余事件
      const keyEvents = []
      const SAMPLE_INTERVAL = 100 // 每100ms保留一个事件
      
      let lastTimestamp = 0
      
      data.events.forEach(event => {
        // 始终保留关键事件类型
        if (event.type === 0 || event.type === 1 || event.type === 2) {
          keyEvents.push(event)
          lastTimestamp = event.timestamp
        } else {
          // 对其他事件进行采样
          if (event.timestamp - lastTimestamp >= SAMPLE_INTERVAL) {
            keyEvents.push(event)
            lastTimestamp = event.timestamp
          }
        }
      })
      
      return {
        events: keyEvents,
        metadata: {
          ...data.metadata,
          originalEventsCount: data.events.length,
          sampledEventsCount: keyEvents.length,
          optimized: true
        }
      }
    },

    // 下载压缩文件
    async downloadCompressedFile() {
      if (!this.recordData) {
        this.$toast.fail('没有录制数据')
        return
      }
      
      this.downloading = true
      try {
        const result = await this.generateCompressedFile()
        
        if (!result.success) {
          this.$toast.fail(result.message)
          return
        }
        
        // 生成文件名
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `record-compressed-${timestamp}.json`
        
        // 下载文件
        const content = JSON.stringify(result.data, null, 2)
        this.downloadFile(content, filename, 'application/json')
        
        const sizeInfo = (result.size / 1024).toFixed(2)
        const optimizedText = result.optimized ? ' (已优化)' : ''
        this.$toast.success(`文件已下载 (${sizeInfo}KB)${optimizedText}`)
        
      } catch (error) {
        console.error('下载失败:', error)
        this.$toast.fail('下载失败')
      } finally {
        this.downloading = false
      }
    },

    // 下载文件
    downloadFile(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },

    // 重新录制
    resetRecord() {
      this.recordData = null
      this.events = []
      this.closePlayer()
      this.$toast.success('已重置，可以重新录制')
    },

    // 播放控制
    togglePlay() {
      if (!this.player) return
      
      try {
        if (this.isPlaying) {
          if (typeof this.player.pause === 'function') {
            this.player.pause()
          }
        } else {
          if (typeof this.player.play === 'function') {
            this.player.play()
          }
        }
        this.isPlaying = !this.isPlaying
      } catch (error) {
        console.warn('播放控制出错:', error)
        this.$toast.fail('播放控制失败')
      }
    },

    resetPlayer() {
      if (!this.player) return
      
      try {
        if (typeof this.player.goto === 'function') {
          this.player.goto(0)
        } else if (typeof this.player.setCurrentTime === 'function') {
          this.player.setCurrentTime(0)
        }
        this.isPlaying = false
      } catch (error) {
        console.warn('重置播放器出错:', error)
        this.$toast.fail('重置失败')
      }
    },

    closePlayer() {
      if (this.player) {
        try {
          // 尝试不同的销毁方法
          if (typeof this.player.destroy === 'function') {
            this.player.destroy()
          } else if (typeof this.player.$destroy === 'function') {
            this.player.$destroy()
          } else if (this.player.$el && this.player.$el.parentNode) {
            // 直接移除DOM元素
            this.player.$el.parentNode.removeChild(this.player.$el)
          }
        } catch (error) {
          console.warn('播放器销毁时出现警告:', error)
        }
        this.player = null
      }
      
      // 清理播放器容器
      if (this.$refs.playerContainer) {
        this.$refs.playerContainer.innerHTML = ''
      }
      
      this.showPlayer = false
      this.isPlaying = false
    },

    // 等待页面加载
    waitForPageLoad() {
      return new Promise((resolve) => {
        if (document.readyState === 'complete') {
          setTimeout(resolve, 500)
        } else {
          window.addEventListener('load', () => {
            setTimeout(resolve, 500)
          })
        }
      })
    },

    // 演示操作
    demoClick() {
      this.$toast('你点击了演示按钮')
    },

    demoAlert() {
      this.$dialog.alert({
        message: '这是一个演示弹窗'
      })
    },

    demoToast() {
      this.$toast.success('这是一个演示提示')
    },

    // 跳转到多页面录制
    goToMultiPage() {
      this.$router.push('/multi-page')
    }
  },

  beforeDestroy() {
    if (this.isRecording && this.stopFn) {
      this.stopFn()
    }
    this.closePlayer()
  }
}
</script>

<style scoped>
.simple-record {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 60px 16px 16px;
}

.control-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.status-text {
  font-size: 16px;
  font-weight: 500;
  color: #323233;
}

.recording-indicator {
  display: flex;
  align-items: center;
  color: #ee0a24;
  font-weight: 500;
}

.red-dot {
  width: 8px;
  height: 8px;
  background: #ee0a24;
  border-radius: 50%;
  margin-right: 6px;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.control-buttons .van-button {
  height: 48px;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.record-info {
  margin-bottom: 16px;
}

.player-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.player-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.player-header h3 {
  margin: 0;
  font-size: 16px;
  color: #323233;
}

.player-container {
  border: 1px solid #ebedf0;
  border-radius: 8px;
  margin-bottom: 16px;
  min-height: 300px;
  overflow: hidden;
}

.player-controls {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.demo-buttons {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.demo-buttons .van-button {
  flex: 1;
}

.navigation-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
</style> 