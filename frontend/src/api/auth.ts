import { API } from '../services/api'

export type LoginPayload = { email: string; password: string }
export type SignupPayload = { name: string; email: string; password: string }
export type SocialLoginPayload = {
  provider: 'google' | 'discord'
  email: string
  name?: string
  avatar_url?: string
}

export async function login(payload: LoginPayload) {
  return API.post('/auth/login', payload)
}

export async function loginStep1(payload: LoginPayload) {
  return API.post('/auth/login-step1', payload)
}

export async function signup(payload: SignupPayload) {
  return API.post('/auth/signup', payload)
}

export async function socialLogin(payload: SocialLoginPayload) {
  return API.post('/auth/social-login', payload)
}

export async function sendOtp(email: string) {
  return API.post('/auth/otp/send', { email })
}

export async function verifyOtp(email: string, otp: string) {
  return API.post('/auth/otp/verify', { email, otp })
}

export async function getGoogleAuthStart() {
  return API.get('/auth/google/start')
}

export async function getDiscordAuthStart() {
  return API.get('/auth/discord/start')
}

export async function handleGoogleCallback(code: string, state?: string | null) {
  return API.get('/auth/google/callback', { params: { code, state } })
}

export async function handleDiscordCallback(code: string, state?: string | null) {
  return API.get('/auth/discord/callback', { params: { code, state } })
}
