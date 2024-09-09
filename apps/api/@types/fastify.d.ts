import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentMemberId(): Promise<string>
  }
}
