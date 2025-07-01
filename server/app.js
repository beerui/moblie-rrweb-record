const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const pako = require('pako')

const app = express()
const PORT = 3000

// 中间件
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// 确保存储目录存在
const recordsDir = path.join(__dirname, 'records')
if (!fs.existsSync(recordsDir)) {
  fs.mkdirSync(recordsDir, { recursive: true })
}

// 确保视频录制存储目录存在
const videoRecordsDir = path.join(__dirname, 'video-records')
if (!fs.existsSync(videoRecordsDir)) {
  fs.mkdirSync(videoRecordsDir, { recursive: true })
}

// 上传录制数据
app.post('/api/record/upload', (req, res) => {
  try {
    const recordData = req.body
    const recordId = Date.now().toString()
    
    // 如果数据是压缩的，先解压验证
    if (recordData.compressed) {
      try {
        const uint8Array = new Uint8Array(recordData.data)
        const decompressed = pako.ungzip(uint8Array, { to: 'string' })
        const originalData = JSON.parse(decompressed)
        
        console.log('收到压缩录制数据:')
        console.log('- 原始大小:', recordData.originalSize, 'bytes')
        console.log('- 压缩大小:', recordData.compressedSize, 'bytes')
        console.log('- 压缩率:', ((1 - recordData.compressedSize / recordData.originalSize) * 100).toFixed(2) + '%')
        console.log('- 事件数量:', originalData.events ? originalData.events.length : 0)
      } catch (error) {
        console.error('解压数据失败:', error)
        return res.status(400).json({ 
          success: false, 
          message: '数据解压失败' 
        })
      }
    }

    // 保存录制数据到文件
    const filename = `record_${recordId}.json`
    const filepath = path.join(recordsDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify({
      id: recordId,
      timestamp: new Date().toISOString(),
      ...recordData
    }, null, 2))

    res.json({
      success: true,
      message: '录制数据上传成功',
      recordId: recordId,
      filename: filename
    })

  } catch (error) {
    console.error('处理录制数据失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取录制列表
app.get('/api/records', (req, res) => {
  try {
    const files = fs.readdirSync(recordsDir)
    const records = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(recordsDir, file)
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
        
        return {
          id: data.id,
          filename: file,
          timestamp: data.timestamp,
          compressed: data.compressed,
          originalSize: data.originalSize,
          compressedSize: data.compressedSize,
          eventsCount: data.metadata ? data.metadata.eventsCount : 0
        }
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    res.json({
      success: true,
      records: records
    })

  } catch (error) {
    console.error('获取录制列表失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取录制详情
app.get('/api/records/:id', (req, res) => {
  try {
    const recordId = req.params.id
    const filename = `record_${recordId}.json`
    const filepath = path.join(recordsDir, filename)

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: '录制记录不存在'
      })
    }

    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    
    // 如果请求解压数据
    if (req.query.decompress === 'true' && data.compressed) {
      try {
        const uint8Array = new Uint8Array(data.data)
        const decompressed = pako.ungzip(uint8Array, { to: 'string' })
        const originalData = JSON.parse(decompressed)
        
        res.json({
          success: true,
          record: {
            ...data,
            decompressedData: originalData
          }
        })
      } catch (error) {
        res.status(400).json({
          success: false,
          message: '数据解压失败'
        })
      }
    } else {
      res.json({
        success: true,
        record: data
      })
    }

  } catch (error) {
    console.error('获取录制详情失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 删除录制记录
app.delete('/api/records/:id', (req, res) => {
  try {
    const recordId = req.params.id
    const filename = `record_${recordId}.json`
    const filepath = path.join(recordsDir, filename)

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: '录制记录不存在'
      })
    }

    fs.unlinkSync(filepath)

    res.json({
      success: true,
      message: '录制记录删除成功'
    })

  } catch (error) {
    console.error('删除录制记录失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '服务运行正常',
    timestamp: new Date().toISOString()
  })
})

// 上传视频录制数据（专门接口）
app.post('/api/upload-video-recording', (req, res) => {
  try {
    const { recordingInfo, eventsData, sizes, businessInfo, metadata } = req.body
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    console.log('收到视频录制数据上传请求:')
    console.log('- 视频ID:', videoId)
    console.log('- 录制时长:', recordingInfo.duration)
    console.log('- 事件数量:', recordingInfo.eventCount)
    console.log('- 压缩率:', recordingInfo.compressionRatio)
    console.log('- 业务信息:', businessInfo)
    
    // 验证数据完整性
    if (!recordingInfo || !eventsData || !sizes) {
      return res.status(400).json({
        success: false,
        message: '录制数据不完整',
        error: 'INVALID_DATA'
      })
    }
    
    // 验证事件数据
    if (!Array.isArray(eventsData) || eventsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: '录制事件数据为空',
        error: 'EMPTY_EVENTS'
      })
    }
    
    // 构建完整的视频记录数据
    const videoRecord = {
      id: videoId,
      uploadTime: new Date().toISOString(),
      
      // 录制基础信息
      recording: {
        ...recordingInfo,
        status: 'completed'
      },
      
      // 录制事件数据（保持压缩状态）
      events: eventsData,
      
      // 文件大小统计
      fileSize: {
        ...sizes,
        uploadSize: JSON.stringify(req.body).length
      },
      
      // 业务信息
      business: {
        ...businessInfo,
        uploadedFrom: req.headers['user-agent'] || 'unknown',
        clientIP: req.ip || req.connection.remoteAddress
      },
      
      // 元数据
      meta: {
        ...metadata,
        recordingType: 'video-session',
        apiVersion: '1.0',
        server: 'video-recording-api'
      }
    }
    
    // 保存到专门的视频录制目录
    const filename = `${videoId}.json`
    const filepath = path.join(videoRecordsDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(videoRecord, null, 2))
    
    // 模拟生成视频回放URL
    const videoUrl = `${req.protocol}://${req.get('host')}/api/video-playback/${videoId}`
    
    console.log('视频录制数据保存成功:', filename)
    
    res.json({
      success: true,
      message: '视频录制数据上传成功',
      uploadId: videoId,
      id: videoId,
      videoUrl: videoUrl,
      filename: filename,
      stats: {
        duration: recordingInfo.duration,
        eventCount: recordingInfo.eventCount,
        compressionRatio: recordingInfo.compressionRatio,
        uploadSize: videoRecord.fileSize.uploadSize,
        savedAt: videoRecord.uploadTime
      }
    })
    
  } catch (error) {
    console.error('视频录制数据上传失败:', error)
    res.status(500).json({
      success: false,
      message: '视频上传服务器错误',
      error: error.message
    })
  }
})

// 获取视频录制列表
app.get('/api/video-recordings', (req, res) => {
  try {
    const files = fs.readdirSync(videoRecordsDir)
    const videoRecords = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(videoRecordsDir, file)
        const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
        
        return {
          id: data.id,
          uploadTime: data.uploadTime,
          duration: data.recording.duration,
          eventCount: data.recording.eventCount,
          compressionRatio: data.recording.compressionRatio,
          component: data.business.component,
          route: data.business.route,
          fileSize: data.fileSize,
          filename: file
        }
      })
      .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))
    
    res.json({
      success: true,
      count: videoRecords.length,
      records: videoRecords
    })
    
  } catch (error) {
    console.error('获取视频录制列表失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 获取视频录制详情
app.get('/api/video-recordings/:id', (req, res) => {
  try {
    const videoId = req.params.id
    const filename = `${videoId}.json`
    const filepath = path.join(videoRecordsDir, filename)
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: '视频录制记录不存在'
      })
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    
    res.json({
      success: true,
      record: data
    })
    
  } catch (error) {
    console.error('获取视频录制详情失败:', error)
    res.status(500).json({
      success: false,
      message: '服务器错误'
    })
  }
})

// 视频回放接口
app.get('/api/video-playback/:id', (req, res) => {
  try {
    const videoId = req.params.id
    const filename = `${videoId}.json`
    const filepath = path.join(videoRecordsDir, filename)
    
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({
        success: false,
        message: '视频录制不存在'
      })
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'))
    
    // 返回可用于回放的事件数据
    res.json({
      success: true,
      playbackData: {
        id: data.id,
        events: data.events,
        duration: data.recording.duration,
        eventCount: data.recording.eventCount,
        startTime: data.recording.startTime,
        endTime: data.recording.endTime
      }
    })
    
  } catch (error) {
    console.error('获取视频回放数据失败:', error)
    res.status(500).json({
      success: false,
      message: '回放数据获取失败'
    })
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`录制数据服务器运行在 http://localhost:${PORT}`)
  console.log(`录制数据存储目录: ${recordsDir}`)
})

module.exports = app 