import { createRouter, createWebHistory } from 'vue-router';
import CreateTicket from '../components/Tickets.vue';
import AdminPanel from '../components/AdminPanel.vue';

const routes = [
  { path: '/', component: CreateTicket },
  { path: '/admin', component: AdminPanel }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;