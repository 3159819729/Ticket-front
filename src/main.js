import { createApp } from 'vue'
// import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import store from "@/stores/index.js";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {zhCn} from "element-plus/es/locale/index"

//引入图标库
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for(const [key, component] of Object.entries(ElementPlusIconsVue)){
    app.component(key, component)
}
// app.use(createPinia())
app.use(router)
app.use(store)
app.use(ElementPlus,{
    locale: zhCn
})

app.mount('#app')
