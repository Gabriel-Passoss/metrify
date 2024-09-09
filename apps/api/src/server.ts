import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { createCompany } from '@/http/companies/create-company.controller'

import { errorHandler } from './http/error-handler'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.register(fastifyJwt, {
  secret: 'develop',
})

app.setErrorHandler(errorHandler)

app.register(fastifyCors)

app.register(createCompany)

app.listen({ port: 3333 }).then()
