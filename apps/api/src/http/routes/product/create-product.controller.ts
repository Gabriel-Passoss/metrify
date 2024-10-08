import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/_errors/bad-request-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

export async function createProduct(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/organizations/:organizationSlug/stores/:storeSlug/products',
      {
        schema: {
          tags: ['Product'],
          summary: 'Create a new product',
          security: [{ bearerAuth: [] }],
          params: z.object({
            organizationSlug: z.string(),
            storeSlug: z.string(),
          }),
          body: z.object({
            name: z.string(),
            platform: z.string(),
            description: z.string().optional(),
            price: z.number(),
            quantity: z.number(),
            costPerUnit: z.number().optional(),
            shippingCost: z.number().optional(),
            taxCost: z.number().optional(),
            pixTax: z.number().optional(),
            bankSlipTax: z.number().optional(),
            installmentPrice: z
              .array(
                z.object({
                  installmentNumber: z.number(),
                  price: z.number(),
                }),
              )
              .optional(),
            installmentTax: z
              .array(
                z.object({
                  installmentNumber: z.number(),
                  tax: z.number(),
                }),
              )
              .optional(),
            extraTaxes: z
              .array(
                z.object({
                  name: z.string(),
                  tax: z.number(),
                }),
              )
              .optional(),
          }),
          response: {
            201: z.null(),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { organizationSlug, storeSlug } = request.params
        const { membership, organization } =
          await request.getUserMembership(organizationSlug)
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
          installmentPrice,
          installmentTax,
          extraTaxes,
        } = request.body

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('create', 'Product')) {
          throw new UnauthorizedError("You're not allowed to create a product.")
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

        await prisma.product.create({
          data: {
            storeId: storeOnDatabase.id,
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
            ...(installmentPrice && {
              installmentPrice: {
                createMany: {
                  data: installmentPrice,
                },
              },
            }),
            ...(installmentTax && {
              installmentTax: {
                createMany: {
                  data: installmentTax,
                },
              },
            }),
            ...(extraTaxes && {
              extraTaxes: {
                createMany: {
                  data: extraTaxes,
                },
              },
            }),
          },
        })

        reply.status(201).send()
      },
    )
}
