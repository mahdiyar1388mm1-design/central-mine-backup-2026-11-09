// Wraps Central-Mine-BackEnd's `/auth` endpoints (src/modules/auth). The
// backend has no separate "register" endpoint or password field — sending
// an OTP and then confirming it *is* the whole account flow: `login` below
// creates the user on first confirm and logs them in on every one after.

import { api } from '../lib/apiClient'
import { clearSession, saveSession, type Session } from '../lib/authStorage'

export async function sendOtp(phoneNumber: string, referralCode?: string): Promise<void> {
  await api.post<{ boolean: boolean }>('/auth/send_otp', { phoneNumber, referralCode: referralCode || undefined }, { auth: false })
}

export async function login(phoneNumber: string, otpCode: string): Promise<Session> {
  const session = await api.post<Session>('/auth/login', { phoneNumber, OTPCode: otpCode }, { auth: false })
  saveSession(session)
  return session
}

export function logout(): void {
  clearSession()
}
