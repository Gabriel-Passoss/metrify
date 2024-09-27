import { z } from 'zod'

export const billingSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('pay'),
    z.literal('read'),
    z.literal('update_payment_method'),
    z.literal('delete_payment_method'),
  ]),
  z.literal('Billing'),
])

export type BillingSubject = z.infer<typeof billingSubject>
