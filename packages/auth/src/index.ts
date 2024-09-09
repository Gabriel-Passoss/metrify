/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'
import { z } from 'zod'

import type { User } from './models/user'
import { permissions } from './permissions'
import { companySubject } from './subjects/company'
import { inviteSubject } from './subjects/invite'
import { productSubject } from './subjects/product'
import { saleSubject } from './subjects/sale'
import { sellerSubject } from './subjects/seller'
import { storeSubject } from './subjects/store'

const appAbilitiesSchema = z.union([
  companySubject,
  inviteSubject,
  productSubject,
  saleSubject,
  sellerSubject,
  storeSubject,
  z.tuple([z.literal('manage'), z.literal('all')]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error(
      `Permissions for role "${permissions[user.role]}" not found.`,
    )
  }

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType(subject) {
      return subject.__typename
    },
  })

  return ability
}
