<template>
  <div class="home">
    <van-nav-bar title="手机银行理财产品" fixed />
    
    <div class="content">
      <!-- 欢迎横幅 -->
      <div class="welcome-banner">
        <div class="banner-content">
          <h2>智能录制系统</h2>
          <p>为您的每一笔理财操作提供完整的可回溯记录</p>
        </div>
        <div class="banner-image">
          <van-icon name="gold-coin-o" size="40" color="#1989fa" />
        </div>
      </div>

      <!-- 主要功能 -->
      <div class="main-features">
        <van-grid :column-num="2" :gutter="16">
          <van-grid-item
            icon="gold-coin-o"
            text="理财产品"
            @click="$router.push('/products')"
          />
          <van-grid-item
            icon="video-o"
            text="录制回放"
            @click="$router.push('/player')"
          />
        </van-grid>
      </div>

      <!-- 功能特色 -->
      <div class="features-section">
        <div class="section-title">
          <h3>功能特色</h3>
        </div>
        <van-cell-group>
          <van-cell 
            title="完整录制" 
            label="记录购买和赎回的完整操作流程"
            icon="video"
          />
          <van-cell 
            title="数据压缩" 
            label="使用pako压缩技术，节省存储空间"
            icon="compress"
          />
          <van-cell 
            title="回放功能" 
            label="支持操作回放，便于审核和复盘"
            icon="play-circle"
          />
          <van-cell 
            title="安全可靠" 
            label="数据加密传输，保障操作安全"
            icon="shield"
          />
        </van-cell-group>
      </div>

      <!-- 快速入口 -->
      <div class="quick-actions">
        <van-button 
          type="primary" 
          size="large" 
          block 
          round
          @click="$router.push('/products')"
        >
          开始体验
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 60px 16px 16px;
}

.welcome-banner {
  background: linear-gradient(135deg, #1989fa 0%, #0570e8 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);
}

.banner-content h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.banner-content p {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.4;
}

.banner-image {
  flex-shrink: 0;
}

.main-features {
  margin-bottom: 24px;
}

.main-features .van-grid-item {
  background: white;
  border-radius: 8px;
}

.features-section {
  margin-bottom: 24px;
}

.section-title {
  padding: 0 4px 16px;
}

.section-title h3 {
  color: #323233;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.features-section .van-cell-group {
  border-radius: 8px;
  overflow: hidden;
}

.quick-actions {
  margin-top: 32px;
  padding: 0 16px;
}

.quick-actions .van-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}
</style> 