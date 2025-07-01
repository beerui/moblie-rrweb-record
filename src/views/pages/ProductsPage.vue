<template>
  <div class="products-page">
    <div class="page-header">
      <h3>理财产品列表</h3>
      <p>为您精选优质理财产品</p>
    </div>

    <div class="filter-section">
      <van-field v-model="searchText" placeholder="搜索产品名称" />
      <div class="filter-buttons">
        <van-button 
          v-for="type in productTypes" 
          :key="type"
          size="small"
          :type="selectedType === type ? 'primary' : 'default'"
          @click="filterByType(type)"
        >
          {{ type }}
        </van-button>
      </div>
    </div>

    <div class="products-list">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="product-card"
        @click="selectProduct(product)"
      >
        <div class="product-header">
          <h4>{{ product.name }}</h4>
          <span class="product-rate">{{ product.rate }}%</span>
        </div>
        <div class="product-info">
          <div class="info-item">
            <span class="label">起购金额:</span>
            <span class="value">{{ product.minAmount }}万</span>
          </div>
          <div class="info-item">
            <span class="label">期限:</span>
            <span class="value">{{ product.period }}</span>
          </div>
          <div class="info-item">
            <span class="label">风险等级:</span>
            <span class="value">{{ product.riskLevel }}</span>
          </div>
        </div>
        <div class="product-actions">
          <van-button size="small" type="info" @click.stop="viewDetail(product)">查看详情</van-button>
          <van-button size="small" type="primary" @click.stop="buyProduct(product)">立即购买</van-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductsPage',
  data() {
    return {
      searchText: '',
      selectedType: '全部',
      productTypes: ['全部', '稳健型', '平衡型', '进取型'],
      products: [
        {
          id: 1,
          name: '稳健增利1号',
          rate: 4.2,
          minAmount: 1,
          period: '90天',
          riskLevel: 'R2',
          type: '稳健型'
        },
        {
          id: 2,
          name: '平衡收益2号',
          rate: 5.8,
          minAmount: 5,
          period: '180天',
          riskLevel: 'R3',
          type: '平衡型'
        },
        {
          id: 3,
          name: '进取成长3号',
          rate: 7.5,
          minAmount: 10,
          period: '365天',
          riskLevel: 'R4',
          type: '进取型'
        },
        {
          id: 4,
          name: '稳健保本4号',
          rate: 3.8,
          minAmount: 1,
          period: '60天',
          riskLevel: 'R1',
          type: '稳健型'
        }
      ]
    }
  },
  computed: {
    filteredProducts() {
      let filtered = this.products
      
      // 按类型筛选
      if (this.selectedType !== '全部') {
        filtered = filtered.filter(p => p.type === this.selectedType)
      }
      
      // 按搜索文本筛选
      if (this.searchText) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(this.searchText.toLowerCase())
        )
      }
      
      return filtered
    }
  },
  methods: {
    filterByType(type) {
      this.selectedType = type
      this.$toast(`筛选: ${type}`)
    },
    selectProduct(product) {
      this.$toast(`选择了 ${product.name}`)
    },
    viewDetail(product) {
      this.$toast(`查看 ${product.name} 详情`)
    },
    buyProduct(product) {
      this.$toast(`购买 ${product.name}`)
    }
  }
}
</script>

<style scoped>
.products-page {
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0 0 5px 0;
  color: #323233;
}

.page-header p {
  margin: 0;
  color: #969799;
  font-size: 14px;
}

.filter-section {
  background: white;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.product-header h4 {
  margin: 0;
  color: #323233;
  font-size: 16px;
}

.product-rate {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
}

.product-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.label {
  color: #969799;
  font-size: 14px;
}

.value {
  color: #323233;
  font-size: 14px;
  font-weight: 500;
}

.product-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style> 