import { defineStore } from 'pinia'

interface UserADInfo {
  description?: string
  telephoneNumber?: string
  department?: string
  company?: string
  info?: string
  title?: string
}

interface User {
  id?: number | null
  username?: string | null
  name?: string | null
  email?: string | null
  role?: string | null
  token?: string | null
  user?: UserADInfo
}

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null as number | null,
    username: null as string | null,
    name: null as string | null,
    email: null as string | null,
    role: null as string | null,
    token: null as string | null,
    // AD-поля (доп инфа)
    description: '' as string,
    telephoneNumber: '' as string,
    department: '' as string,
    company: '' as string,
    info: '' as string,
    title: '' as string,
    // --- ДОБАВЛЕНО ---
    isLoading: true as boolean, // Флаг загрузки профиля
  }),
  getters: {
    isAuth: (state) => !!state.token,
    isAdmin: (state) => state.role === 'support' || state.role === 'superadmin',
    isSuperAdmin: (state) => state.role === 'superadmin'
  },
  actions: {
    setUser(user: any) {
      this.id = user.id ?? null
      this.username = user.username ?? null
      this.name = user.name ?? null
      this.email = user.email ?? null
      this.role = user.role ?? null
      this.token = user.token ?? null
      this.description = user.user?.description || ''
      this.telephoneNumber = user.user?.telephoneNumber || ''
      this.department = user.user?.department || ''
      this.company = user.user?.company || ''
      this.info = user.user?.info || ''
      this.title = user.user?.title || ''
      // Сохраняем полный профиль:
      localStorage.setItem('user', JSON.stringify({
        id: this.id,
        username: this.username,
        name: this.name,
        email: this.email,
        role: this.role,
        token: this.token,
        description: this.description,
        telephoneNumber: this.telephoneNumber,
        department: this.department,
        company: this.company,
        info: this.info,
        title: this.title
      }))
    },
    loadUserFromStorage() {
      this.isLoading = true; // <--- ВАЖНО!
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        // Восстанавливаем поля стора
        this.id = user.id
        this.username = user.username
        this.name = user.name
        this.email = user.email
        this.role = user.role
        this.token = user.token
        this.description = user.description
        this.telephoneNumber = user.telephoneNumber
        this.department = user.department
        this.company = user.company
        this.info = user.info
        this.title = user.title
      }
      this.isLoading = false; // <--- ВАЖНО!
    },
    logout() {
      this.$reset()
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.isLoading = false // на всякий случай
    }
  }
})
