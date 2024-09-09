import { z } from 'zod'

import { saleSchema } from '../models/sale'

export const saleSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('read'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.union([z.literal('Sale'), saleSchema]),
])

export type SaleSubject = z.infer<typeof saleSubject>
