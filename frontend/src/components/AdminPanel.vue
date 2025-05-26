<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Все заявки</h2>

    <div
      v-for="t in tickets"
      :key="t.id"
      :class="[
        'bg-white p-4 rounded-xl shadow space-y-2 transition-opacity',
        { 'opacity-50 pointer-events-none': t.status === 'Готово' || t.status === 'Отклонен' }
      ]"
    >
      <!-- Статус, категория и от кого -->
      <div class="text-sm text-gray-600">
        [{{ t.status }}] — Категория: {{ getCategoryName(t.category_id) }}
      </div>
      <div class="text-sm text-gray-700">
        <b>От:</b> {{ t.created_by || '—' }}
      </div>

      <!-- Поля тикета -->
      <div class="text-sm text-gray-700 mb-2">
        <div v-for="(value, key) in t.fields" :key="key">
          <b>{{ key }}:</b> {{ value }}
        </div>
      </div>

      <!-- Исполнитель и дата -->
      <div class="text-sm text-gray-500">
        Исполнитель: {{ t.assigned_to || 'не назначен' }}
      </div>
      <div class="text-sm text-gray-500">
        Создано: {{ t.created_at ? formatDate(t.created_at) : '' }}
      </div>

      <!-- Кнопки действий -->
      <div class="flex space-x-2 pt-2">
        <!-- НОВЫЕ заявки: принять в работу или отклонить -->
        <button
          v-if="t.status === 'Новый'"
          class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
          @click="assignTicket(t.id)"
        >
          Принять в работу
        </button>
        <button
          v-if="t.status === 'Новый'"
          class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
          @click="declineTicket(t.id)"
        >
          Отклонить
        </button>

        <!-- В работе: готово или отклонить -->
        <button
          v-if="t.status === 'В работе'"
          class="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition"
          @click="completeTicket(t.id)"
        >
          Готово
        </button>
        <button
          v-if="t.status === 'В работе'"
          class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
          @click="declineTicket(t.id)"
        >
          Отклонить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api.js'

const tickets = ref<any[]>([])
const categories = ref<any[]>([])
const currentUser = ref<string>('')

// Загрузка данных и текущего пользователя
onMounted(async () => {
  currentUser.value = localStorage.getItem('username') || ''
  await fetchCategories()
  await fetchTickets()
})

async function fetchCategories() {
  const res = await api.get('/categories')
  categories.value = res.data
}

async function fetchTickets() {
  const res = await api.get('/tickets')
  tickets.value = res.data
}

function getCategoryName(category_id: number) {
  const cat = categories.value.find((c: any) => c.id === category_id)
  return cat ? cat.name : 'Неизвестная категория'
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('ru-RU')
}

// Шаг 1: назначить исполнителем и перевести в работу
async function assignTicket(id: number) {
  if (!currentUser.value) {
    alert('Сначала войдите в систему')
    return
  }
  await api.patch(`/tickets/${id}`, {
    status: 'В работе',
    assigned_to: currentUser.value
  })
  await fetchTickets()
}

// Шаг 2: отметить готовым
async function completeTicket(id: number) {
  if (!currentUser.value) {
    alert('Сначала войдите в систему')
    return
  }
  await api.patch(`/tickets/${id}`, {
    status: 'Готово',
    assigned_to: currentUser.value
  })
  await fetchTickets()
}

// Отклонение — сразу переводим в отклонено
async function declineTicket(id: number) {
  if (!currentUser.value) {
    alert('Сначала войдите в систему')
    return
  }
  await api.patch(`/tickets/${id}`, {
    status: 'Отклонен',
    assigned_to: currentUser.value
  })
  await fetchTickets()
}
</script>

<style>
body {
  font-family: sans-serif;
}
</style>
