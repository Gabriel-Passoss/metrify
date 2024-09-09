import { z } from 'zod'

export const storeSubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('create'),
    z.literal('read'),
    z.literal('update'),
    z.literal('delete'),
  ]),
  z.literal('Store'),
])

export type StoreSubject = z.infer<typeof storeSubject>
