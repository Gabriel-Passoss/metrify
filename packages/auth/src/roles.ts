import { z } from 'zod'

export const roleSchema = z.union([
  z.literal('ADMIN'),
  z.literal('MANAGER'),
  z.literal('SELLER'),
  z.literal('BILLING'),
])

export type Role = z.infer<typeof roleSchema>
