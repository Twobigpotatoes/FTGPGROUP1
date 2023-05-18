import { createApp } from 'vue'
import App from '@/App.vue'
import store from '@/store'
import 'element-plus/dist/index.css'
import '@/style/index.css'

createApp(App)
    .use(store)
    .mount('#app')