<template>
  <div
    class="fixed inset-0 flex items-center justify-center bg-sky-400 bg-opacity-50 z-50"
  >
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h3 class="text-xl font-semibold mb-4">Вход в систему</h3>
      <form @submit.prevent="handleLogin" class="flex flex-col space-y-4">
        <input
          v-model="username"
          placeholder="Логин"
          required
          class="border p-2 rounded"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Пароль"
          required
          class="border p-2 rounded"
        />
        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Войти
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import api from '../api.js' // или '../api.js' по твоему пути
const emits = defineEmits(['success'])

const username = ref('')
const password = ref('')

async function handleLogin() {
  try {
    const res = await api.post('/auth/ldap', {
      username: username.value,
      password: password.value
    })
    if (res.data.token) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('username', res.data.username)
      emits('success', res.data.user)
    } else {
      alert('Ошибка авторизации')
    }
  } catch (e) {
    alert(e.response?.data?.error || 'Ошибка входа')
  }
}
</script>
