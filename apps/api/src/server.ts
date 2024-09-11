import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { fastify } from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { errorHandler } from './http/error-handler'
import { authenticateWithPassword } from './http/routes/auth/authenticate-with-password.controller'
import { createAccount } from './http/routes/auth/create-account.controller'
import { getProfile } from './http/routes/auth/get-profile.controller'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.register(fastifyJwt, {
  secret: 'develop',
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Metrify API',
      description: 'Documentação para utilização da API Metrify',
      version: '1.0.0',
    },
    servers: [],
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUI, {
  routePrefix: '/docs',
})

app.setErrorHandler(errorHandler)

app.register(fastifyCors)

// Auth controllers
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(getProfile)

app.listen().then(() => {
  // console.log('Server running!')
})
