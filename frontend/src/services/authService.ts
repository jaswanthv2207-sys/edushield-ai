import api from './api'
import { User } from '../types'

interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post<LoginResponse>('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  async updateProfile(data: {
    full_name?: string
    email?: string
    phone?: string
  }): Promise<User> {
    const response = await api.put<User>('/auth/me', data)
    return response.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getUsers(role?: string): Promise<User[]> {
    const response = await api.get<User[]>('/auth/users', {
      params: role ? { role } : undefined,
    })
    return response.data
  },
}
