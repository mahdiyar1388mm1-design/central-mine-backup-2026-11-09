import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/apiClient'
import AppShell from '../../components/AppShell'
import Button from '../../components/Button'
import Header from '../../components/Header'
import Stepper from '../../components/Stepper'
import TextField from '../../components/TextField'
import { useRegister } from '../../context/RegisterContext'

const STEPS = ['ثبت نام', 'کد فعال‌سازی']

// Confirming the code both creates the account (on a first-time phone
// number) and logs the user in — the backend has no separate register or
// password step, so a successful confirm goes straight to /home.
//
// Full page here, plus reused as-is (no AppShell/Header) inside AuthSheet's
// bottom sheet — see App.tsx's backgroundLocation trick and LoginPage's note.
export default function VerifyCodePage() {
  return (
    <AppShell>
      <Header />
      <VerifyCodeForm />
    </AppShell>
  )
}

export function VerifyCodeForm() {
  const navigate = useNavigate()
  const { phone, verificationCode, setVerificationCode, confirmOtp } = useRegister()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

  const canSubmit = verificationCode.trim().length === 5 && !submitting

  async function handleSubmit() {
    if (!canSubmit) return

    setSubmitting(true)
    setSubmitError(undefined)
    try {
      await confirmOtp()
      navigate('/home')
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'تایید کد با خطا مواجه شد.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <main className="flex-1 px-6 pt-6 pb-10">
        <Stepper steps={STEPS} currentStep={1} />

        <h1 className="mt-8 text-2xl font-extrabold text-gray-900">کد فعال‌سازی</h1>
        <p className="mt-2 text-sm text-gray-500">
          کد تایید ارسال‌شده به شماره {phone || '—'} را وارد کنید.
        </p>
        {/* Kavenegar isn't wired up with a real API key yet — the backend
            pins every OTP to this code for now. Remove once it is. */}
        {import.meta.env.DEV && <p className="mt-1 text-xs text-gray-400">کد تست (تا اتصال کاوه‌نگار): ۱۲۳۴۵</p>}

        <div className="mt-6">
          <TextField
            type="tel"
            inputMode="numeric"
            maxLength={5}
            autoFocus
            placeholder="کد تایید"
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
          />
        </div>

        {submitError && <p className="mt-4 text-center text-sm text-red-500">{submitError}</p>}

        <div className="mt-6">
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? 'در حال بررسی...' : 'تایید و ادامه'}
          </Button>
        </div>
      </main>
    </>
  )
}
