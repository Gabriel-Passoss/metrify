import type { AbilityBuilder } from '@casl/ability'

import type { AppAbility } from '.'
import type { User } from './models/user'
import type { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN: (user, { can, cannot }) => {
    can('manage', 'all')

    cannot(['transfer_ownership'], 'Organization')
    can(['transfer_ownership'], 'Organization', {
      ownerId: { $eq: user.id },
    })
  },
  MANAGER: (_, { can, cannot }) => {
    can('manage', 'all')

    cannot('delete', 'Organization')
    cannot('transfer_ownership', 'Organization')
  },
  SELLER: (user, { can }) => {
    can('manage', 'Sale', { sellerId: { $eq: user.id } })
  },
  BILLING: (_, { can }) => {
    can('manage', 'Billing')
  },
}
