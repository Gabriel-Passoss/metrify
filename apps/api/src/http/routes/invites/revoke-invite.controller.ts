import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/_errors/bad-request-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .delete(
      '/organizations/:slug/invites/:inviteId',
      {
        schema: {
          tags: ['Invite'],
          summary: 'Revoke an organization invite',
          params: z.object({
            slug: z.string(),
            inviteId: z.string().uuid(),
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, inviteId } = request.params
        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('revoke', 'Invite')) {
          throw new UnauthorizedError("You're not allowed to revoke invites.")
        }

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
            organizationId: organization.id,
          },
        })

        if (!invite) {
          throw new BadRequestError('Invite not found.')
        }

        await prisma.invite.delete({
          where: {
            id: inviteId,
          },
        })

        return reply.status(204).send()
      },
    )
}
