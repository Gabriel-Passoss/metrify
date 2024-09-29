import { z } from 'zod'

export const roleSchema = z.union([
  z.literal('ADMIN'),
  z.literal('MANAGER'),
  z.literal('SELLER'),
])

export type Role = z.infer<typeof roleSchema>
