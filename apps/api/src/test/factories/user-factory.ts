import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { User } from '@prisma/client'
import { hash } from 'bcryptjs'

export async function makeUser(override: Partial<User> = {}, id?: string) {
  const user = <User>{
    id: randomUUID() ?? id,
    name: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    email: faker.internet.email(),
    passwordHash: await hash(faker.internet.password(), 6),
    ...override,
  }

  return user
}
