import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import installElementPlus from './plugins/element'
import axios from 'axios'
import { ElLoading } from 'element-plus'

// 引入全局样式
import './assets/css/global.css'

// 引入iconfont的样式
import './assets/font/iconfont.css'

let loadingInstance
// axios.defaults.baseURL = 'http://43.129.200.251:3000'
axios.defaults.baseURL = 'https://netease-cloud-music-api-henrend.vercel.app'
axios.interceptors.request.use((config) => {
    if (loadingInstance) {
        loadingInstance.close()
    }
    loadingInstance = ElLoading.service({
        target: document.querySelector('.mainContent'),
        lock: true,
        text: "载入中...",
        background: 'rgba(0,0,0,0.03)',
        customClass: 'loading'
    })
    if (!config.params) {
        config.params = {
            realIP: '116.25.146.177'
        }
    }
    setTimeout(() => {
        if (loadingInstance) {
            loadingInstance.close()
        }
    }, 10000);
    return config
})
axios.interceptors.response.use((response) => {
    if (loadingInstance) {
        loadingInstance.close()
    }
    return response
})
const app = createApp(App)
app.config.globalProperties.http = axios
installElementPlus(app)
app.use(store).use(router).mount('#app')
