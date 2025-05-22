<template>
  <div class="max-w-2xl mx-auto p-4">
    <form @submit.prevent="createTicket" class="flex flex-col bg-white p-6 rounded-2xl shadow max-w-xl w-full mx-auto space-y-4">
  <h2 class="text-xl font-semibold text-gray-800">Создать заявку</h2>

  <div class="flex flex-col bg-gray-100 rounded-full px-6 py-4">
    <label class="text-gray-700 mb-2">ФИО</label>
    <input
      v-model="full_name"
      placeholder="Фамилия Имя Отчество"
      required
      class="w-full border p-2 rounded-xl"
    />
  </div>

  <div class="flex flex-col bg-gray-100 rounded-full px-6 py-4">
    <label class="text-gray-700 mb-2">Телефон</label>
    <input
      v-model="phone"
      placeholder="+7 (___) ___-__-__"
      required
      class="w-full border p-2 rounded-xl"
    />
  </div>

  <div class="flex flex-col bg-gray-100 rounded-full px-6 py-4">
    <label class="text-gray-700 mb-2">Email</label>
    <input
      v-model="email"
      type="email"
      placeholder="example@domain.com"
      required
      class="w-full border p-2 rounded-xl"
    />
  </div>

  <div class="flex flex-col bg-gray-100 rounded-full px-6 py-4">
    <label class="text-gray-700 mb-2">Категория заявки</label>
    <select v-model="category" required class="w-full border p-2 rounded-xl">
      <option disabled value="">Выберите категорию</option>
      <option>Техническая поддержка</option>
      <option>Сетевая проблема</option>
      <option>ПО / Программы</option>
      <option>Другое</option>
    </select>
  </div>

  <div class="flex flex-col bg-gray-100 rounded-2xl px-6 py-4">
    <label class="text-gray-700 mb-2">Описание проблемы</label>
    <textarea
      v-model="description"
      placeholder="Опишите проблему максимально подробно"
      required
      rows="6"
      class="w-full border p-2 rounded-xl resize-none h-40"
    ></textarea>
  </div>

  <div class="flex flex-col bg-gray-100 rounded-full px-6 py-4">
    <label class="text-gray-700 mb-2">Скриншот (необязательно)</label>
    <input type="file" @change="handleFile" accept="image/png, image/jpeg" class="block" />
  </div>

  <button
    type="submit"
    class="bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
    :disabled="!isFormValid"
  >
    Отправить заявку
  </button>
</form>



    <ul class="mt-6 space-y-4">
      <li
        v-for="t in tickets"
        :key="t.id"
        class="bg-white p-4 shadow rounded-xl"
      >
        <div class="text-sm text-gray-600">[{{ t.status }}] — {{ t.category }}</div>
        <div class="text-lg font-semibold text-gray-800">{{ t.full_name }}</div>
        <div class="text-gray-700">{{ t.description }}</div>
        <div class="text-sm text-gray-500">Email: {{ t.email }} | Телефон: {{ t.phone }}</div>
        <div class="text-sm text-gray-500">Исполнитель: {{ t.assigned_to || 'не назначен' }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const tickets = ref([]);
const full_name = ref('');
const phone = ref('');
const email = ref('');
const category = ref('');
const description = ref('');
const screenshotFile = ref<File | null>(null);

const fetchTickets = async () => {
  const res = await axios.get('http://localhost:3001/tickets');
  tickets.value = res.data;
};

const handleFile = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    screenshotFile.value = target.files[0];
  }
};

const isFormValid = computed(() => {
  return full_name.value && phone.value && email.value && category.value && description.value;
});

const createTicket = async () => {
  await axios.post('http://localhost:3001/tickets', {
  full_name: full_name.value,
  phone: phone.value,
  email: email.value,
  category: category.value,
  description: description.value,
  screenshot_url: screenshotFile.value ? screenshotFile.value.name : null, // или просто null, если файл не нужен
});

  full_name.value = '';
  phone.value = '';
  email.value = '';
  category.value = '';
  description.value = '';
  screenshotFile.value = null;
  await fetchTickets();
};

onMounted(fetchTickets);
</script>

<style>
body {
  font-family: sans-serif;
}
</style>
