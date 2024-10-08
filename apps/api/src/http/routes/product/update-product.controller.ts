import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/_errors/bad-request-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function updateProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .patch(
      '/organizations/:organizationSlug/stores/:storeSlug/products/:productId',
      {
        schema: {
          tags: ['Product'],
          summary: 'Update a product',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
            storeSlug: z.string(),
            productId: z.string().uuid(),
          }),
          body: z.object({
            name: z.string().optional(),
            platform: z.string().optional(),
            description: z.string().optional(),
            price: z.number().optional(),
            quantity: z.number().optional(),
            costPerUnit: z.number().optional(),
            shippingCost: z.number().optional(),
            taxCost: z.number().optional(),
            pixTax: z.number().optional(),
            bankSlipTax: z.number().optional(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { organizationSlug, storeSlug, productId } = request.params
        const { membership } = await request.getUserMembership(organizationSlug)
        const {
          name,
          platform,
          description,
          price,
          quantity,
          costPerUnit,
          shippingCost,
          taxCost,
          pixTax,
          bankSlipTax,
        } = request.body

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', 'Product')) {
          throw new UnauthorizedError("You're not allowed to update a product.")
        }

        const productOnDatabase = await prisma.product.findFirst({
          where: {
            id: productId,
            store: {
              slug: storeSlug,
            },
          },
        })

        if (!productOnDatabase) {
          throw new BadRequestError('Product not found.')
        }

        await prisma.product.update({
          where: {
            id: productOnDatabase.id,
          },
          data: {
            name,
            description,
            platform,
            price,
            quantity,
            costPerUnit,
            shippingCost,
            taxCost,
            pixTax,
            bankSlipTax,
          },
        })

        reply.status(204).send()
      },
    )
}
