import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { type Store } from '@prisma/client'

import { createSlug } from '@/utils/create-slug'

export function makeStore(
  override: Partial<Store> = {},
  organizationId: string,
  id?: string,
) {
  const name = faker.commerce.productName()

  const store = <Store>{
    id: randomUUID() ?? id,
    name,
    slug: createSlug(name),
    description: faker.commerce.productDescription(),
    logoUrl: '',
    organizationId,
    ...override,
  }

  return store
}
