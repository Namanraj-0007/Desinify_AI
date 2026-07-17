import { API } from '../services/api'

export type LoginPayload = { email: string; password: string }
export type SignupPayload = { name: string; email: string; password: string }

export async function login(payload: LoginPayload) {
  return API.post('/auth/login', payload)
}

export async function signup(payload: SignupPayload) {
  return API.post('/auth/signup', payload)
}

