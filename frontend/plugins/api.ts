import { defineNuxtPlugin } from '#app'
import axios from 'axios'

export default defineNuxtPlugin(() => {
  const api = axios.create({ baseURL: 'http://localhost:3001' })
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })
  // Доступно через useNuxtApp().$api
  return {
    provide: {
      api
    }
  }
})