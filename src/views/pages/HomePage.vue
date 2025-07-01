<template>
  <div class="home-page">
    <div class="welcome-banner">
      <h2>欢迎使用理财产品</h2>
      <p>为您提供专业的理财服务</p>
    </div>
    
    <div class="features">
      <div class="feature-item" @click="handleClick('安全保障')">
        <div class="feature-icon">🛡️</div>
        <div class="feature-text">安全保障</div>
      </div>
      <div class="feature-item" @click="handleClick('收益稳定')">
        <div class="feature-icon">📈</div>
        <div class="feature-text">收益稳定</div>
      </div>
      <div class="feature-item" @click="handleClick('专业服务')">
        <div class="feature-icon">👨‍💼</div>
        <div class="feature-text">专业服务</div>
      </div>
    </div>

    <div class="demo-actions">
      <van-button type="primary" block @click="showDialog">查看详情</van-button>
      <van-field v-model="userInput" label="用户姓名" placeholder="请输入您的姓名" />
      <van-button type="info" block @click="submitInfo">提交信息</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      userInput: ''
    }
  },
  methods: {
    handleClick(feature) {
      this.$toast(`点击了${feature}`)
    },
    showDialog() {
      this.$dialog.alert({
        title: '产品详情',
        message: '我们提供多种理财产品，满足不同客户的需求。'
      })
    },
    submitInfo() {
      if (this.userInput) {
        this.$toast.success(`欢迎 ${this.userInput}！`)
      } else {
        this.$toast.fail('请输入姓名')
      }
    }
  }
}
</script>

<style scoped>
.home-page {
  padding: 20px;
}

.welcome-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px 20px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.welcome-banner h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.welcome-banner p {
  margin: 0;
  opacity: 0.9;
}

.features {
  display: flex;
  justify-content: space-around;
  margin-bottom: 30px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.feature-item:hover {
  transform: translateY(-2px);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 10px;
}

.feature-text {
  font-size: 14px;
  color: #666;
}

.demo-actions {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-actions .van-button {
  margin-bottom: 15px;
}

.demo-actions .van-field {
  margin-bottom: 15px;
}
</style> 