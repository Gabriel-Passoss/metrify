import { organizationSchema } from '@metrify/auth'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { ConflictError } from '@/http/_errors/conflict-error'
import { UnauthorizedError } from '@/http/_errors/unauthorized-error'
import { authMiddleware } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions } from '@/utils/get-user-permissions'

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(authMiddleware)
    .patch(
      '/organizations/:slug',
      {
        schema: {
          tags: ['Organization'],
          summary: 'Update a organization',
          body: z.object({
            name: z.string().optional(),
            document: z
              .string()
              .regex(cnpjRegex, {
                message:
                  'Invalid CNPJ format, it should be XX.XXX.XXX/XXXX-XX.',
              })
              .optional(),
          }),
          params: z.object({
            slug: z.string(),
          }),
          response: {
            204: z.null,
            409: z.object({
              message: z.string(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params

        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { name, document } = request.body

        const { cannot } = getUserPermissions(userId, membership.role)

        const authOrganization = organizationSchema.parse(organization)

        if (cannot('update', authOrganization)) {
          throw new UnauthorizedError(
            "You're not allowed to update this organization.",
          )
        }

        if (name) {
          const organizationWithSameName = await prisma.organization.findFirst({
            where: {
              name,
            },
          })

          if (organizationWithSameName) {
            throw new ConflictError(
              'Already exists an organization with same name',
            )
          }
        }

        if (document) {
          const organizationWithSameDocument =
            await prisma.organization.findUnique({
              where: {
                document,
              },
            })

          if (organizationWithSameDocument) {
            throw new ConflictError(
              'Already exists an organization with same document',
            )
          }
        }

        await prisma.organization.update({
          where: {
            slug,
          },
          data: {
            name,
            document,
          },
        })

        reply.status(204).send()
      },
    )
}
