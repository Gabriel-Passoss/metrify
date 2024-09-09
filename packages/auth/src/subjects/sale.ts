import { z } from 'zod'

export const saleSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('read'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.literal('Sale'),
])

export type SaleSubject = z.infer<typeof saleSubject>
