import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/apiClient'
import AppShell from '../../components/AppShell'
import Button from '../../components/Button'
import Checkbox from '../../components/Checkbox'
import Header from '../../components/Header'
import InviteCodeField from '../../components/InviteCodeField'
import Stepper from '../../components/Stepper'
import TextField from '../../components/TextField'
import { useRegister } from '../../context/RegisterContext'
import { validatePhone } from '../../lib/validation'

const STEPS = ['ثبت نام', 'کد فعال‌سازی']

// Full page here, plus reused as-is (no AppShell/Header) inside AuthSheet's
// bottom sheet — see App.tsx's backgroundLocation trick and LoginPage's note.
export default function RegisterPage() {
  return (
    <AppShell>
      <Header />
      <RegisterForm />
    </AppShell>
  )
}

export function RegisterForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { phone, setPhone, inviteCode, setInviteCode, acceptedTerms, setAcceptedTerms, requestOtp } = useRegister()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

  const phoneError = validatePhone(phone)
  const canSubmit = !phoneError && acceptedTerms && !submitting

  async function handleSubmit() {
    if (!canSubmit) return

    setSubmitting(true)
    setSubmitError(undefined)
    try {
      await requestOtp()
      navigate('/register/verify', { state: location.state })
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : 'ارسال کد با خطا مواجه شد.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <main className="flex-1 px-6 pt-6 pb-10">
        <Stepper steps={STEPS} currentStep={0} />

        {/* TODO: temporary Enamad domain-ownership verification code —
            remove this line once Enamad's check passes. */}
        <p className="mt-8 text-sm text-gray-400">57886671</p>

        <h1 className="mt-2 text-2xl font-extrabold text-gray-900">ایجاد حساب کاربری</h1>
        <p className="mt-2 text-sm text-gray-500">کد تایید به این شماره ارسال خواهد شد.</p>

        <div className="mt-6">
          <TextField
            type="tel"
            inputMode="numeric"
            autoFocus
            placeholder="شماره تلفن"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            error={phoneError}
          />
        </div>

        <div className="mt-6 flex justify-center">
          <InviteCodeField value={inviteCode} onChange={setInviteCode} />
        </div>

        <div className="mt-10 flex items-start justify-end gap-3">
          <p className="text-sm leading-7 text-gray-600">
            <Link to="/terms" className="text-blue-600 underline underline-offset-2">
              قوانین و شرایط
            </Link>{' '}
            را خوانده‌ام و با آن موافقم.
          </p>
          <Checkbox
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
          />
        </div>

        {submitError && <p className="mt-4 text-center text-sm text-red-500">{submitError}</p>}

        <div className="mt-6">
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            {submitting ? 'در حال ارسال...' : 'تایید و ادامه'}
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          حساب کاربری دارید؟{' '}
          <Link to="/login" state={location.state} className="font-semibold text-blue-600">
            ورود
          </Link>
        </p>
      </main>
    </>
  )
}
