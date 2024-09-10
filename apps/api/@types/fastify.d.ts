import 'fastify'

import { Company, Member } from '@prisma/client'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentMemberId(): Promise<string>
    getUserMembership(
      slug: string,
    ): Promise<{ company: Company; membership: Member }>
  }
}
