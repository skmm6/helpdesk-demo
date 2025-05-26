// main.ts или main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './main.css'

const app = createApp(App);

app.use(router); // ВАЖНО: Подключить роутер до mount()

app.mount('#app');
