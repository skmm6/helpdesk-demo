<template>
  <div class="max-w-3xl mx-auto space-y-4">
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">Все заявки</h2>

    <div
      v-for="t in tickets"
      :key="t.id"
      class="bg-white p-4 rounded-xl shadow space-y-2"
    >
      <div class="text-sm text-gray-600">[{{ t.status }}] — {{ t.category }}</div>
      <div class="text-lg font-semibold text-gray-800">{{ t.full_name }}</div>
      <div class="text-gray-700">{{ t.description }}</div>
      <div class="text-sm text-gray-500">Email: {{ t.email }} | Телефон: {{ t.phone }}</div>
      <div class="text-sm text-gray-500">Исполнитель: {{ t.assigned_to || 'не назначен' }}</div>

      <div class="flex space-x-2 pt-2">
        <button
          class="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 transition"
          @click="updateStatus(t.id, 'Принят')"
        >
          Принять
        </button>
        <button
          class="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition"
          @click="updateStatus(t.id, 'Отклонен')"
        >
          Отклонить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const tickets = ref([]);
const currentUser = 'Иванов И.И.'; // можно заменить на авторизованного

const fetchTickets = async () => {
  const res = await axios.get('http://localhost:3001/tickets');
  tickets.value = res.data;
};

const updateStatus = async (id: number, status: string) => {
  await axios.patch(`http://localhost:3001/tickets/${id}`, {
    status,
    assigned_to: currentUser
  });
  await fetchTickets();
};

onMounted(fetchTickets);
</script>
