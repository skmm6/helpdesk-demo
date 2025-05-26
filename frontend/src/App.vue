<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Если не авторизован, показываем модалку на весь экран -->
    <LoginDialog v-if="!currentUser" @success="handleLoginSuccess" />

    <!-- Основной контент, видимый только после авторизации -->
    <div v-else>
      <nav class="mb-8 flex justify-between items-center border-b border-gray-200 pb-4 max-w-4xl mx-auto">
        <div class="flex">
          <router-link
            to="/"
            class="text-gray-700 font-semibold px-4 py-2 rounded-md transition-colors duration-300 hover:text-white hover:bg-blue-600 mr-8"
            active-class="bg-blue-600 text-white shadow-lg"
          >
            Создать заявку
          </router-link>
          <router-link
            to="/admin"
            class="text-gray-700 font-semibold px-4 py-2 rounded-md transition-colors duration-300 hover:text-white hover:bg-blue-600"
            active-class="bg-blue-600 text-white shadow-lg"
          >
            Панель администратора
          </router-link>
        </div>
        <span class="font-bold text-blue-700">{{ currentUser }}</span>
        <button
          @click="logout"
          class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Выйти
        </button>
      </nav>
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoginDialog from './components/LoginDialog.vue'

const currentUser = ref<string>('')

// При загрузке проверяем сразу и токен, и описание
onMounted(() => {
  const token = localStorage.getItem('token')
  const desc  = localStorage.getItem('userDescription')
  if (token && desc) {
    currentUser.value = desc
  }
})

// Обработчик успешного логина
function handleLoginSuccess(user: { description?: string }) {
  const desc = user.description || ''
  localStorage.setItem('token', localStorage.getItem('token')!)      // token уже туда записан в LoginDialog
  localStorage.setItem('userDescription', desc)
  currentUser.value = desc
}

// Выход из системы — удаляем всё
function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('userDescription')
  currentUser.value = ''
}
</script>
