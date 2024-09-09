import { z } from 'zod'

export const companySubject = z.tuple([
  z.union([
    z.literal('manage'),
    z.literal('read'),
    z.literal('update'),
    z.literal('delete'),
    z.literal('transfer_ownership'),
  ]),
  z.literal('Company'),
])

export type CompanySubject = z.infer<typeof companySubject>
