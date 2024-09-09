import { z } from 'zod'

export const sellerSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('read'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.literal('Seller'),
])

export type SellerSubject = z.infer<typeof sellerSubject>
