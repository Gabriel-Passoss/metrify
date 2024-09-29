import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { ConflictError } from '@/http/_errors/conflict-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { createSlug } from '@/utils/create-slug'

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .post(
      '/organizations',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Create a new organization',
          security: [{ bearerAuth: [] }],
          body: z.object({
            name: z.string(),
            document: z.string().regex(cnpjRegex, {
              message: 'Invalid CNPJ format, it should be XX.XXX.XXX/XXXX-XX.',
            }),
          }),
          response: {
            201: z.object({
              organizationId: z.string().uuid(),
            }),
            409: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const userId = await request.getCurrentUserId()
        const { name, document } = request.body

        const organizationWithSameDocument =
          await prisma.organization.findUnique({
            where: {
              document,
            },
          })

        if (organizationWithSameDocument) {
          throw new ConflictError(
            'Another organization with same document already exists',
          )
        }

        const slug = createSlug(name)

        const organizationWithSameSlug = await prisma.organization.findUnique({
          where: {
            slug,
          },
        })

        if (organizationWithSameSlug) {
          throw new ConflictError(
            'Another organization with same slug/name already exists',
          )
        }

        const organization = await prisma.organization.create({
          data: {
            name,
            document,
            slug,
            ownerId: userId,
            members: {
              create: {
                userId,
                role: 'ADMIN',
              },
            },
          },
        })

        return reply.status(201).send({
          organizationId: organization.id,
        })
      },
    )
}
