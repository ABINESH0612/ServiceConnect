import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react'
import { toast } from 'sonner'

import { authApi } from '@/api/auth'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/utils/validators'

export default function AdminForgotPassword() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await authApi.forgotPassword({ email: values.email })
      setSubmitted(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="sc-card p-8">
      {submitted ? (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center">
              <MailCheck className="h-6 w-6 text-[#16A34A]" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
            Check Your Email
          </h1>
          <p className="text-sm text-[#64748B] mb-6">
            Check your email for reset instructions. If you have an admin
            account, you&apos;ll receive a password reset link shortly.
          </p>
          <Link to="/admin/login" className="sc-btn-outline inline-flex">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-[#0F172A] text-center mb-2">
            Forgot Password
          </h1>
          <p className="text-sm text-[#64748B] text-center mb-6">
            Enter your admin email and we&apos;ll send you instructions to reset
            your password.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@serviceconnect.com"
                className="sc-input"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="form-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="sc-btn-primary w-full"
              aria-label="Send password reset email"
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {isSubmitting ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#64748B]">
            <Link
              to="/admin/login"
              className="text-[#2563EB] hover:text-[#1D4ED8] font-medium inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              Back to Login
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
