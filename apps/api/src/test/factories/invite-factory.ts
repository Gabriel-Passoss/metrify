import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { type Invite } from '@prisma/client'

export function makeInvite(
  override: Partial<Invite> = {},
  authorId: string,
  organizationId: string,
  id?: string,
) {
  const user = <Invite>{
    id: randomUUID() ?? id,
    email: faker.internet.email(),
    role: 'SELLER',
    authorId,
    createdAt: faker.date.recent(),
    organizationId,
    ...override,
  }

  return user
}
