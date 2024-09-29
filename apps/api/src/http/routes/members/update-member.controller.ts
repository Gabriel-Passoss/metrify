import { roleSchema } from '@metrify/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .patch(
      '/organizations/:slug/members/:memberId',
      {
        schema: {
          tags: ['Member'],
          summary: 'Update a member',
          security: [{ bearerAuth: [] }],
          body: z.object({
            role: roleSchema,
          }),
          params: z.object({
            slug: z.string(),
            memberId: z.string(),
          }),
          response: {
            204: z.null(),
            409: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { role } = request.body

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', 'Seller')) {
          throw new UnauthorizedError(
            "You're not allowed to update this member.",
          )
        }

        await prisma.member.update({
          where: {
            id: memberId,
            organizationId: organization.id,
          },
          data: {
            role,
          },
        })

        reply.status(204).send()
      },
    )
}
