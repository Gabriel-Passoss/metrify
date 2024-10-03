import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function getStores(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/organizations/:slug/stores',
      {
        schema: {
          tags: ['Store'],
          summary: 'Get the organization stores',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              stores: z.array(
                z.object({
                  id: z.string().uuid(),
                  name: z.string(),
                  description: z.string().nullable(),
                  logoUrl: z.string().nullable(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { slug } = request.params
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('read', 'Store')) {
          throw new UnauthorizedError("You're not allowed to get stores.")
        }

        const stores = await prisma.store.findMany({
          where: {
            organizationId: organization.id,
          },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            logoUrl: true,
          },
        })

        return reply.status(200).send({ stores })
      },
    )
}
