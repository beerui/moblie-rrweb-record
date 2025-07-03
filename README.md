# Vue2 + Vant + rrweb 可回溯录制项目

## 项目介绍

这是一个基于Vue2和Vant构建的手机银行理财产品录制系统，使用rrweb和rrweb-player实现前端页面的可回溯录制功能。主要用于记录用户在理财产品购买和赎回过程中的完整操作流程。

## 功能特色

- ✅ **完整录制**: 记录购买和赎回的完整操作流程
- ✅ **数据压缩**: 使用pako压缩技术，节省存储空间
- ✅ **回放功能**: 支持操作回放，便于审核和复盘
- ✅ **安全可靠**: 数据加密传输，保障操作安全
- ✅ **移动端优化**: 基于Vant组件库，完美适配移动端
- ✅ **自动录制**: 页面加载完成后自动开始录制
- ✅ **组件化**: 录制功能封装为可复用组件

## 技术栈

- **前端框架**: Vue 2.6.14
- **UI组件库**: Vant 2.12.54
- **录制库**: rrweb 2.0.0-alpha.11
- **播放器**: rrweb-player 1.0.0-alpha.11
- **压缩库**: pako 2.1.0
- **HTTP客户端**: axios 0.27.2
- **路由**: vue-router 3.5.1

## 项目结构

```
src/
├── components/
│   └── RecordWrapper.vue          # 录制包装组件
├── utils/
│   ├── global-recorder.js         # 全局录制器
│   └── screen-record.js           # 录制功能封装
├── views/
│   ├── ProductList.vue            # 理财产品列表
│   └── pages/                     # 购买流程页面
│       ├── PurchaseStepOne.vue    # 购买步骤1：确认产品
│       ├── PurchaseStepTwo.vue    # 购买步骤2：填写信息
│       ├── PurchaseStepThree.vue  # 购买步骤3：确认购买
│       └── PurchaseStepFour.vue   # 购买步骤4：购买完成
├── router/
│   └── index.js                   # 路由配置
├── App.vue                        # 根组件
└── main.js                        # 入口文件
```

## 核心功能

### 1. 录制功能 (screen-record.js)

```javascript
import ScreenRecorder from '@/utils/screen-record'

// 创建录制实例
const recorder = new ScreenRecorder({
  uploadUrl: '/api/record/upload',
  autoUpload: true,
  compressData: true
})

// 开始录制
await recorder.startRecording({
  action: 'purchase',
  productId: 1
})

// 停止录制
const result = await recorder.stopRecording()
```

### 2. 录制组件 (RecordWrapper.vue)

```vue
<template>
  <RecordWrapper 
    :auto-start="true"
    :metadata="{ action: 'purchase', productId: 1 }"
    @record-started="onRecordStarted"
    @record-stopped="onRecordStopped"
  >
    <!-- 你的页面内容 -->
  </RecordWrapper>
</template>
```

### 3. 数据压缩

使用pako库对录制数据进行gzip压缩，大幅减少数据传输量：

```javascript
// 压缩数据
const compressed = pako.gzip(JSON.stringify(data))

// 解压数据
const decompressed = pako.ungzip(compressed, { to: 'string' })
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run serve
```

### 3. 构建生产版本

```bash
npm run build
```

## 使用说明

### 1. 基本使用

在需要录制的页面中使用`RecordWrapper`组件包装：

```vue
<template>
  <RecordWrapper :auto-start="true">
    <!-- 你的页面内容 -->
  </RecordWrapper>
</template>
```

### 2. 手动控制录制

```vue
<template>
  <RecordWrapper 
    :show-controls="true"
    :auto-start="false"
    @record-started="handleRecordStart"
    @record-stopped="handleRecordStop"
  >
    <!-- 你的页面内容 -->
  </RecordWrapper>
</template>
```

### 3. 自定义配置

```javascript
const recordOptions = {
  uploadUrl: '/api/custom/upload',
  maxEvents: 2000,
  autoUpload: false,
  compressData: true
}
```

## API接口

### 上传录制数据

```
POST /api/record/upload
Content-Type: application/json

{
  "compressed": true,
  "data": [/* 压缩后的数据数组 */],
  "originalSize": 12345,
  "compressedSize": 3456
}
```

### 获取录制列表

```
GET /api/records
```

### 获取录制详情

```
GET /api/records/:id
```

## 注意事项

1. **页面加载**: 录制功能会等待页面完全加载后才开始，确保所有元素都已渲染
2. **数据压缩**: 默认开启数据压缩，可以显著减少网络传输量
3. **自动上传**: 录制停止后会自动上传数据到服务器
4. **移动端适配**: 项目专为移动端设计，建议在移动设备或浏览器移动模式下测试

## 时间水印功能

### 功能说明
在回放视频时，会在视频右上角显示时间水印，包含录制完成时的日期时间信息。

### 水印特点
- **显示时机**：仅在视频回放时显示，录制时不显示
- **位置**：固定在回放视频容器的右上角
- **样式**：半透明黑色背景，白色文字
- **内容**：录制完成时间（格式：2025年01月10日 14:30）
- **不干扰操作**：设置为 `pointer-events: none`，不影响用户操作

### 技术实现
- 在 `PurchaseStepFour.vue` 的回放容器中实现
- 回放开始时显示，停止时隐藏
- 时间来源于录制数据中的 `endTime` 字段
- 使用 CSS 绝对定位覆盖在回放视频上

### 时间数据来源
1. **优先使用**：`recordingResult.data.endTime`（录制结束时间）
2. **备用方案**：如果没有endTime，使用当前时间
3. **时间格式**：ISO 8601 格式转换为中文日期时间显示

### 回放中的水印效果
用户在购买完成页面（PurchaseStepFour.vue）观看回放时，会在视频右上角看到类似水印效果：
```
2025年01月10日 14:30
```

### 导出的录制数据
导出的JSON文件中包含完整的录制事件和时间信息，可以在支持rrweb的播放器中回放。

## 浏览器兼容性

- Chrome 51+
- Firefox 54+
- Safari 10+
- Edge 79+

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 支持购买和赎回流程录制
- 集成pako数据压缩
- 实现录制回放功能
- 移动端UI优化 