<template>
  <div class="router-index">
    <van-nav-bar title="路由导航" fixed />
    
    <div class="content">
      <div class="section">
        <h3>录制功能</h3>
        <van-cell-group>
          <van-cell title="单页面录制" is-link to="/SimpleRecord" />
          <van-cell title="多页面录制" is-link to="/multi-page" />
        </van-cell-group>
      </div>

      <div class="section">
        <h3>业务页面</h3>
        <van-cell-group>
          <van-cell title="产品列表" is-link to="/" />
          <van-cell title="产品详情" is-link to="/product/1" />
          <van-cell title="传统购买流程" is-link to="/purchase/1" />
          <van-cell title="产品赎回" is-link to="/redeem/1" />
          <van-cell title="录制回放" is-link to="/player" />
        </van-cell-group>
      </div>

      <div class="section">
        <h3>新分步购买流程</h3>
        <van-cell-group>
          <van-cell 
            title="步骤1：确认产品" 
            is-link 
            :to="{ name: 'PurchaseStepOne', query: { id: 1 } }" 
          />
          <van-cell 
            title="步骤2：填写信息" 
            is-link 
            :to="{ name: 'PurchaseStepTwo', query: { id: 1 } }" 
          />
          <van-cell 
            title="步骤3：确认购买" 
            is-link 
            :to="{ name: 'PurchaseStepThree', query: { id: 1 } }" 
          />
          <van-cell 
            title="步骤4：购买完成" 
            is-link 
            :to="{ name: 'PurchaseStepFour', query: { id: 1 } }" 
          />
        </van-cell-group>
      </div>

      <div class="section">
        <h3>Pages组件</h3>
        <van-cell-group>
          <van-cell title="首页组件" is-link to="/pages/home" />
          <van-cell title="产品页面" is-link to="/pages/products" />
          <van-cell title="产品详情页面" is-link to="/pages/product-detail" />
          <van-cell title="购买页面" is-link to="/pages/purchase" />
          <van-cell title="赎回页面" is-link to="/pages/redeem" />
        </van-cell-group>
      </div>

      <div class="section">
        <h3>录制测试说明</h3>
        <div class="test-guide">
          <h4>测试新的录制功能：</h4>
          <ol>
            <li>点击"产品列表"进入主页面</li>
            <li>点击"开始录制"按钮，会弹出录制权限申请弹框</li>
            <li>点击"同意录制"开始录制，会显示录制状态和时间</li>
            <li>点击任意产品的"立即购买"按钮</li>
            <li>选择"分步购买流程"</li>
            <li>按步骤完成购买流程（注意：超过3分钟会提示交易失败）</li>
            <li>在最后一步会自动停止录制并显示录制结果</li>
          </ol>
          
          <h4>功能特点：</h4>
          <ul>
            <li>✅ 录制前需要用户同意</li>
            <li>✅ 实时显示录制时间</li>
            <li>✅ 3分钟录制超时保护</li>
            <li>✅ 分步骤页面间跳转继续录制</li>
            <li>✅ 表单数据在步骤间自动保存</li>
            <li>✅ 购买完成后自动停止录制</li>
            <li>✅ 录制数据压缩和上传</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RouterIndex'
}
</script>

<style scoped>
.router-index {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.content {
  padding: 60px 16px 16px;
}

.section {
  margin-bottom: 20px;
}

.section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #323233;
  padding-left: 4px;
}

.test-guide {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.test-guide h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1989fa;
}

.test-guide ol,
.test-guide ul {
  margin: 0 0 16px 0;
  padding-left: 20px;
}

.test-guide ol:last-child,
.test-guide ul:last-child {
  margin-bottom: 0;
}

.test-guide li {
  margin-bottom: 6px;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
}

.test-guide ul li {
  color: #07c160;
}
</style> 