import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/_errors/bad-request-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function getProducts(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .get(
      '/organizations/:organizationSlug/stores/:storeSlug/products',
      {
        schema: {
          tags: ['Product'],
          summary: 'Get the store products',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
            storeSlug: z.string(),
          }),
          response: {
            200: z.object({
              products: z.array(
                z.object({
                  name: z.string(),
                  platform: z.string(),
                  description: z.string().nullable(),
                  price: z.number(),
                  quantity: z.number(),
                }),
              ),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { organizationSlug, storeSlug } = request.params
        const { membership, organization } =
          await request.getUserMembership(organizationSlug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('read', 'Product')) {
          throw new UnauthorizedError("You're not allowed to get products.")
        }

        const storeOnDatabase = await prisma.store.findFirst({
          where: {
            slug: storeSlug,
            organizationId: organization.id,
          },
        })

        if (!storeOnDatabase) {
          throw new BadRequestError('Store not found.')
        }

        const products = await prisma.product.findMany({
          where: {
            storeId: storeOnDatabase.id,
          },
          select: {
            id: true,
            name: true,
            platform: true,
            description: true,
            price: true,
            quantity: true,
          },
        })

        return reply.status(200).send({ products })
      },
    )
}
