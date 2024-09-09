import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { BadRequestError } from '@/http/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'

export async function createCompany(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/companies',
    {
      schema: {
        tags: ['Company'],
        summary: 'Create a new company',
        body: z.object({
          name: z.string(),
          document: z.string().min(14, { message: 'Insert a valid document' }),
          avatarUrl: z.string().url().optional(),
        }),
        response: {
          201: z.null(),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, document, avatarUrl } = request.body

      const companyWithSameDocument = await prisma.company.findUnique({
        where: {
          document,
        },
      })

      if (companyWithSameDocument) {
        throw new BadRequestError('Company with that document already exists.')
      }

      await prisma.company.create({
        data: {
          name,
          document,
          avatarUrl,
        },
      })

      return reply.status(201).send()
    },
  )
}
