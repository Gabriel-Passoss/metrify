import type { AbilityBuilder } from '@casl/ability'

import type { AppAbility } from '.'
import type { User } from './models/user'
import type { Role } from './roles'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  OWNER: (user, { can, cannot }) => {
    can('manage', 'all')

    cannot('manage', 'Company')
    can('manage', 'Company', { ownerId: { $eq: user.id } })
  },
  ADMIN: (_, { can, cannot }) => {
    can('manage', 'all')

    cannot('delete', 'Company')
    cannot('transfer_ownership', 'Company')
  },
  SELLER: (user, { can }) => {
    can('manage', 'Sale', { sellerId: { $eq: user.id } })
  },
}
