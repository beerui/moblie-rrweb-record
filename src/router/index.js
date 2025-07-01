import Vue from 'vue'
import VueRouter from 'vue-router'

// 主要页面组件
import SimpleRecord from '../views/SimpleRecord.vue'
import MultiPageRecord from '../views/MultiPageRecord.vue'
import RouterIndex from '../views/RouterIndex.vue'
import Home from '../views/Home.vue'
import ProductList from '../views/ProductList.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Purchase from '../views/Purchase.vue'
import Redeem from '../views/Redeem.vue'
import RecordPlayer from '../views/RecordPlayer.vue'

// pages目录下的组件
import HomePage from '../views/pages/HomePage.vue'
import ProductsPage from '../views/pages/ProductsPage.vue'
import ProductDetailPage from '../views/pages/ProductDetailPage.vue'
import PurchasePage from '../views/pages/PurchasePage.vue'
import RedeemPage from '../views/pages/RedeemPage.vue'

// 购买步骤组件
import PurchaseStepOne from '../views/pages/PurchaseStepOne.vue'
import PurchaseStepTwo from '../views/pages/PurchaseStepTwo.vue'
import PurchaseStepThree from '../views/pages/PurchaseStepThree.vue'
import PurchaseStepFour from '../views/pages/PurchaseStepFour.vue'

Vue.use(VueRouter)

const routes = [
  // 主要功能页面
  // {
  //   path: '/SimpleRecord',
  //   name: 'SimpleRecord',
  //   component: SimpleRecord,
  //   meta: { title: '单页面录制' }
  // },
  // {
  //   path: '/multi-page',
  //   name: 'MultiPageRecord',
  //   component: MultiPageRecord,
  //   meta: { title: '多页面录制' }
  // },
  // {
  //   path: '/routes',
  //   name: 'RouterIndex',
  //   component: RouterIndex,
  //   meta: { title: '路由导航' }
  // },
  
  // 原有的业务页面
  // {
  //   path: '/home',
  //   name: 'Home',
  //   component: Home,
  //   meta: { title: '首页' }
  // },
  {
    path: '/',
    name: 'ProductList',
    component: ProductList,
    meta: { title: '产品列表' }
  },
  // {
  //   path: '/product/:id',
  //   name: 'ProductDetail',
  //   component: ProductDetail,
  //   props: true,
  //   meta: { title: '产品详情' }
  // },
  // {
  //   path: '/purchase/:id',
  //   name: 'Purchase',
  //   component: Purchase,
  //   props: true,
  //   meta: { title: '产品购买' }
  // },
  // {
  //   path: '/redeem/:id',
  //   name: 'Redeem',
  //   component: Redeem,
  //   props: true,
  //   meta: { title: '产品赎回' }
  // },
  // {
  //   path: '/player',
  //   name: 'RecordPlayer',
  //   component: RecordPlayer,
  //   meta: { title: '录制回放' }
  // },
  
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
  
  // pages目录下的独立页面
  // {
  //   path: '/pages/home',
  //   name: 'HomePage',
  //   component: HomePage,
  //   meta: { title: '首页组件' }
  // },
  // {
  //   path: '/pages/products',
  //   name: 'ProductsPage',
  //   component: ProductsPage,
  //   meta: { title: '产品页面' }
  // },
  // {
  //   path: '/pages/product-detail',
  //   name: 'ProductDetailPage',
  //   component: ProductDetailPage,
  //   meta: { title: '产品详情页面' }
  // },
  // {
  //   path: '/pages/purchase',
  //   name: 'PurchasePage',
  //   component: PurchasePage,
  //   meta: { title: '购买页面' }
  // },
  // {
  //   path: '/pages/redeem',
  //   name: 'RedeemPage',
  //   component: RedeemPage,
  //   meta: { title: '赎回页面' }
  // },
  
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