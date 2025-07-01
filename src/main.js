import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 引入 Vant 组件
import { 
  NavBar, 
  Tabbar, 
  TabbarItem, 
  Card,
  Cell,
  CellGroup,
  Button,
  Toast,
  Dialog,
  Loading,
  Sticky,
  Tag,
  Steps,
  Step,
  NoticeBar,
  Icon,
  Grid,
  GridItem,
  Form,
  Field,
  Picker,
  Popup,
  Row,
  Col,
  Checkbox
} from 'vant'
// 引入 Vant 样式
import 'vant/lib/index.css'

Vue.config.productionTip = false

// 注册 Vant 组件
Vue.use(NavBar)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Card)
Vue.use(Cell)
Vue.use(CellGroup)
Vue.use(Button)
Vue.use(Toast)
Vue.use(Dialog)
Vue.use(Loading)
Vue.use(Sticky)
Vue.use(Tag)
Vue.use(Steps)
Vue.use(Step)
Vue.use(NoticeBar)
Vue.use(Icon)
Vue.use(Grid)
Vue.use(GridItem)
Vue.use(Form)
Vue.use(Field)
Vue.use(Picker)
Vue.use(Popup)
Vue.use(Row)
Vue.use(Col)
Vue.use(Checkbox)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app') 