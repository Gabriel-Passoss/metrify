import { z } from 'zod'

export const companySchema = z.object({
  __typename: z.literal('Company').default('Company'),
  id: z.string(),
  ownerId: z.string(),
})

export type Company = z.infer<typeof companySchema>
