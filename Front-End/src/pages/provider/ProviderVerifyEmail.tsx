import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { toast } from 'sonner'

import { authApi } from '@/api/auth'
import { otpSchema, type OtpFormValues } from '@/utils/validators'

export default function ProviderVerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  const onSubmit = async (values: OtpFormValues) => {
    if (!email) {
      toast.error('Email address is missing. Please register again.')
      return
    }

    try {
      await authApi.verifyEmail({ email, otp: values.otp })
      toast.success('Email verified! You can now sign in.')
      navigate('/provider/login', { replace: true })
    } catch {
      toast.error('Invalid or expired code. Please try again.')
    }
  }

  const handleResend = async () => {
    if (!email || cooldown > 0) return
    setResending(true)

    try {
      await authApi.requestEmailVerification({ email })
      toast.success('Verification code resent.')

      setCooldown(60)
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch {
      toast.error('Could not resend code. Please try again later.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="sc-card p-8">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center">
          <Mail className="h-6 w-6 text-[#2563EB]" aria-hidden="true" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-[#0F172A] text-center mb-2">
        Verify Your Email
      </h1>

      <p className="text-sm text-[#64748B] text-center mb-6">
        We sent a 6-digit code to{' '}
        <span className="font-medium text-[#0F172A]">{email || 'your email'}</span>.
        Enter it below to verify your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="otp" className="form-label">
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            className="sc-input text-center text-lg tracking-[0.3em]"
            aria-invalid={!!errors.otp}
            aria-describedby={errors.otp ? 'otp-error' : undefined}
            {...register('otp')}
          />
          {errors.otp && (
            <p id="otp-error" className="form-error">
              {errors.otp.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="sc-btn-primary w-full"
          aria-label="Verify your email address"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {isSubmitting ? 'Verifying…' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          disabled={resending || cooldown > 0}
          onClick={handleResend}
          className="text-sm text-[#2563EB] hover:text-[#1D4ED8] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Resend verification code"
        >
          {resending
            ? 'Sending…'
            : cooldown > 0
              ? `Resend code in ${cooldown}s`
              : 'Resend code'}
        </button>
      </div>
    </div>
  )
}
