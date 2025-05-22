<template>
  <div class="min-h-screen bg-gray-50 p-6">
      <nav class="mb-8 flex justify-center border-b border-gray-200 pb-4">
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
      </nav>
    <router-view />
  </div>
</template>



<script setup lang="ts">
</script>