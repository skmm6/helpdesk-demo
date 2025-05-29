<script setup lang="ts">
import AdminPanel from '~/components/AdminPanel.vue'

definePageMeta({
  middleware: ['admin-only']
})
</script>

<template>
  <AdminPanel/>
</template>