import { z } from 'zod'

export const companySchema = z.object({
  __typename: z.literal('Company').default('Company'),
  id: z.string(),
  sellerId: z.string(),
})

export type Company = z.infer<typeof companySchema>
