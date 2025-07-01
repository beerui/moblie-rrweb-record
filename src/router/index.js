import Vue from 'vue'
import VueRouter from 'vue-router'

// 主要页面组件
import ProductList from '../views/ProductList.vue'

// 购买步骤组件
import PurchaseStepOne from '../views/pages/PurchaseStepOne.vue'
import PurchaseStepTwo from '../views/pages/PurchaseStepTwo.vue'
import PurchaseStepThree from '../views/pages/PurchaseStepThree.vue'
import PurchaseStepFour from '../views/pages/PurchaseStepFour.vue'

Vue.use(VueRouter)

const routes = [
  // 产品列表页面
  {
    path: '/',
    name: 'ProductList',
    component: ProductList,
    meta: { title: '产品列表' }
  },
  
  // 购买步骤页面
  {
    path: '/purchase-step/1',
    name: 'PurchaseStepOne',
    component: PurchaseStepOne,
    meta: { title: '确认产品' }
  },
  {
    path: '/purchase-step/2',
    name: 'PurchaseStepTwo',
    component: PurchaseStepTwo,
    meta: { title: '填写信息' }
  },
  {
    path: '/purchase-step/3',
    name: 'PurchaseStepThree',
    component: PurchaseStepThree,
    meta: { title: '确认购买' }
  },
  {
    path: '/purchase-step/4',
    name: 'PurchaseStepFour',
    component: PurchaseStepFour,
    meta: { title: '购买完成' }
  },
  
  // 重定向和404处理
  {
    path: '/index',
    redirect: '/'
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'hash', // 改为hash模式，适配GitHub Pages
  base: process.env.BASE_URL,
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  if (to.meta && to.meta.title) {
    document.title = to.meta.title + ' - Vue录制系统'
  }
  next()
})

export default router 