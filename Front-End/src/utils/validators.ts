import { z } from 'zod'

// ---- Common field schemas -----------------------------------

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')

export const phoneSchema = z
  .string()
  .min(10, 'Enter a valid phone number')
  .max(15, 'Phone number is too long')
  .regex(/^[+\d\s\-()]+$/, 'Enter a valid phone number')
  .optional()
  .or(z.literal(''))

export const requiredString = (field: string) =>
  z.string().min(1, `${field} is required`)

// ---- Auth schemas -------------------------------------------

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const registerCustomerSchema = z.object({
  firstName: requiredString('First name'),
  lastName: requiredString('Last name'),
  email: emailSchema,
  phone: z.string().min(10, 'Enter a valid phone number').max(15),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const registerProviderSchema = z.object({
  email: emailSchema,
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit code'),
})

// ---- Profile schemas ----------------------------------------

export const updateProfileSchema = z.object({
  firstName: requiredString('First name'),
  lastName: requiredString('Last name'),
  phone: phoneSchema,
})

// ---- Provider schemas ---------------------------------------

export const createProviderSchema = z.object({
  businessName: requiredString('Business name'),
  description: z.string().max(1000).optional(),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: emailSchema,
  address: requiredString('Address'),
  city: requiredString('City'),
  state: requiredString('State'),
  postalCode: z.string().min(4, 'Enter a valid postal code'),
})

// ---- Catalog schemas ----------------------------------------

export const catalogItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  description: z.string().max(1000).optional(),
  category: requiredString('Category'),
  price: z.number({ invalid_type_error: 'Price must be a number' }).positive('Price must be greater than 0'),
  durationMinutes: z.number().int().positive().optional(),
})

// ---- Booking schema -----------------------------------------

export const createBookingSchema = z.object({
  catalogItemId: z.number({ required_error: 'Please select a service' }),
  description: z.string().max(1000).optional(),
  serviceAddress: requiredString('Service address'),
  requestedStartAt: z.string().min(1, 'Please select a date and time'),
})

// ---- Review schema ------------------------------------------

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Rating is required').max(5),
  comment: z.string().max(1000).optional(),
})

// ---- Ticket schema ------------------------------------------

export const createTicketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  category: z.string().optional(),
})

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(5000),
})

// ---- Help Article schema ------------------------------------

export const helpArticleSchema = z.object({
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  title: requiredString('Title'),
  category: requiredString('Category'),
  content: z.string().min(10, 'Content is required'),
  published: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
})

// ---- Inferred types -----------------------------------------
export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterCustomerFormValues = z.infer<typeof registerCustomerSchema>
export type RegisterProviderFormValues = z.infer<typeof registerProviderSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
export type OtpFormValues = z.infer<typeof otpSchema>
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>
export type CreateProviderFormValues = z.infer<typeof createProviderSchema>
export type CatalogItemFormValues = z.infer<typeof catalogItemSchema>
export type CreateBookingFormValues = z.infer<typeof createBookingSchema>
export type ReviewFormValues = z.infer<typeof reviewSchema>
export type CreateTicketFormValues = z.infer<typeof createTicketSchema>
export type SendMessageFormValues = z.infer<typeof sendMessageSchema>
export type HelpArticleFormValues = z.infer<typeof helpArticleSchema>
