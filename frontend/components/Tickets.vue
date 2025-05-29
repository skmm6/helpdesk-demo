<template>
  <div class="max-w-2xl mx-auto p-4">
    <!-- Форма создания заявки -->
    <form
      @submit.prevent="createTicket"
      class="flex flex-col bg-white p-6 rounded-2xl shadow max-w-xl w-full mx-auto space-y-4"
    >
      <h2 class="text-xl font-semibold text-gray-800">Создать заявку</h2>

      <!-- Выбор категории -->
      <div class="flex flex-col bg-gray-100 rounded-full px-6 py-4">
        <label class="text-gray-700 mb-2">Категория заявки</label>
        <select
          v-model="selectedCategoryId"
          @change="onCategoryChange"
          required
          class="w-full border p-2 rounded-xl"
        >
          <option disabled value="">Выберите категорию</option>
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >{{ cat.name }}</option>
        </select>
      </div>

      <!-- Динамические поля по выбранной категории -->
      <div v-if="selectedCategory">
        <div
          v-for="field in selectedCategory.fields"
          :key="field.name"
          class="flex flex-col bg-gray-100 rounded-full px-6 py-4 mb-2"
        >
          <label class="text-gray-700 mb-2">
            {{ field.name }}
            <span v-if="field.required" class="text-red-500">*</span>
          </label>
          <input
            v-model="formFields[field.name]"
            :type="field.type === 'number' ? 'number' : 'text'"
            :required="field.required"
            class="w-full border p-2 rounded-xl"
            :placeholder="field.name"
          />
        </div>
      </div>

      <!-- Кнопка отправки -->
      <button
        type="submit"
        class="bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition"
        :disabled="!isFormValid"
      >
        Отправить заявку
      </button>
    </form>

    <!-- Список заявок -->
    <ul class="mt-6 space-y-4">
      <li
        v-for="t in tickets"
        :key="t.id"
        class="bg-white p-4 shadow rounded-xl"
      >
        <div class="text-sm text-gray-600">
          [{{ t.status }}] — Категория: {{ getCategoryName(t.category_id) }}
        </div>
        <div class="text-sm text-gray-700 mb-2">
          <div v-for="(value, key) in t.fields" :key="key">
            <b>{{ key }}:</b> {{ value }}
          </div>
        </div>
        <div class="text-sm text-gray-500">
          Исполнитель: {{ t.assigned_to || 'не назначен' }}
        </div>
        <div class="text-sm text-gray-500">
          Создано: {{ t.created_at ? formatDate(t.created_at) : '' }}
          <span v-if="t.created_by"> | От: {{ t.created_by }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()  

interface CategoryField {
  name: string
  type: 'string' | 'number'
  required: boolean
}

interface Category {
  id: number
  name: string
  fields: CategoryField[]
}

// реактивные данные
const categories = ref<Category[]>([])
const selectedCategoryId = ref<number | ''>('')
const formFields = reactive<Record<string, string>>({})
const tickets = ref<any[]>([])

// вычисляемая текущая категория
const selectedCategory = computed(() =>
  categories.value.find(c => c.id === Number(selectedCategoryId.value))
)

// сброс и инициализация полей при смене категории
function onCategoryChange() {
  Object.keys(formFields).forEach(k => delete formFields[k])
  selectedCategory.value?.fields.forEach(f => {
    formFields[f.name] = ''
  })
}

// валидация формы
const isFormValid = computed(() => {
  if (!selectedCategory.value) return false
  return selectedCategory.value.fields.every(
    f => !f.required || (formFields[f.name]?.trim() !== '')
  )
})

// загрузка категорий и существующих тикетов
async function fetchData() {
  const { $api } = useNuxtApp()
  const catRes = await $api.get('/categories')
  categories.value = catRes.data
  const ticketRes = await $api.get('/tickets')
  tickets.value = ticketRes.data
}

onMounted(fetchData)

// отправка новой заявки
async function createTicket() {
  if (!userStore.isAuth) {
    alert('Сначала войдите в систему')
    return
  }
  const created_by = userStore.username || userStore.email || '' // или другое поле
  if (!created_by) {
    alert('Ошибка авторизации')
    return
  }

  for (const f of selectedCategory.value!.fields) {
    if (f.required && !formFields[f.name]) {
      alert(`Поле "${f.name}" обязательно!`)
      return
    }
  }

  const payload = {
    category_id: Number(selectedCategoryId.value),
    fields: { ...formFields },
    created_by
  }

  try {
    const { $api } = useNuxtApp()
    await $api.post('/tickets', payload)
    alert('Заявка отправлена!')
    Object.keys(formFields).forEach(k => (formFields[k] = ''))
    selectedCategoryId.value = ''
    await fetchData()
  } catch (err: any) {
    console.error(err)
    alert(err.response?.data?.error || 'Ошибка при отправке заявки!')
  }
}

// утилиты для отображения
function getCategoryName(id: number) {
  const cat = categories.value.find(c => c.id === id)
  return cat ? cat.name : 'Неизвестная категория'
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleString('ru-RU')
}
</script>