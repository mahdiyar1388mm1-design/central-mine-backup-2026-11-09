import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import type { Session } from '../lib/authStorage'

type RegisterContextValue = {
  phone: string
  setPhone: (phone: string) => void
  inviteCode: string
  setInviteCode: (inviteCode: string) => void
  acceptedTerms: boolean
  setAcceptedTerms: (accepted: boolean) => void
  verificationCode: string
  setVerificationCode: (code: string) => void
  /** Sends the OTP to `phone` (with `inviteCode` as the referral code). Throws ApiError on failure. */
  requestOtp: () => Promise<void>
  /** Confirms `verificationCode` — this both creates the account (first time) and logs the user in. Throws ApiError on failure. */
  confirmOtp: () => Promise<Session>
}

const RegisterContext = createContext<RegisterContextValue | null>(null)

export function RegisterProvider({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')

  const value = useMemo<RegisterContextValue>(
    () => ({
      phone,
      setPhone,
      inviteCode,
      setInviteCode,
      acceptedTerms,
      setAcceptedTerms,
      verificationCode,
      setVerificationCode,
      requestOtp: () => authApi.sendOtp(phone, inviteCode),
      confirmOtp: () => authApi.login(phone, verificationCode),
    }),
    [phone, inviteCode, acceptedTerms, verificationCode],
  )

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>
}

export function useRegister() {
  const ctx = useContext(RegisterContext)
  if (!ctx) {
    throw new Error('useRegister must be used within a RegisterProvider')
  }
  return ctx
}
