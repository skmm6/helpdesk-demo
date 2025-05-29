<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Показываем спиннер/заглушку, пока идет загрузка профиля -->
    <div v-if="userStore.isLoading" class="flex items-center justify-center h-screen">
      <span class="text-gray-500 text-lg">Загрузка...</span>
    </div>

    <!-- Если не авторизован, показываем модалку на весь экран -->
    <LoginDialog v-else-if="!userStore.isAuth" @success="onLoginSuccess" />

    <!-- Основной контент, видимый только после авторизации -->
    <div v-else>
      <nav class="mb-8 flex justify-between items-center border-b border-gray-200 pb-4 max-w-4xl mx-auto">
        <div class="flex">
          <NuxtLink
            to="/"
            class="text-gray-700 font-semibold px-4 py-2 rounded-md transition-colors duration-300 hover:text-white hover:bg-blue-600 mr-8"
            active-class="bg-blue-600 text-white shadow-lg"
          >
            Создать заявку
          </NuxtLink>
          <NuxtLink
            v-if="userStore.isAdmin"
            to="/admin"
            class="text-gray-700 font-semibold px-4 py-2 rounded-md transition-colors duration-300 hover:text-white hover:bg-blue-600"
            active-class="bg-blue-600 text-white shadow-lg"
          >
            Панель администратора
          </NuxtLink>
        </div>
        <span class="font-bold text-blue-700">{{ userStore.description || userStore.name || userStore.username }}</span>
        <button
          @click="userStore.logout"
          class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Выйти
        </button>
      </nav>
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import LoginDialog from '~/components/LoginDialog.vue'
import { useUserStore } from '~/stores/user'
import { onMounted } from 'vue'

const userStore = useUserStore()

function onLoginSuccess(data: any) {
  userStore.setUser(data)
}

onMounted(() => {
  userStore.loadUserFromStorage()
})
</script>
