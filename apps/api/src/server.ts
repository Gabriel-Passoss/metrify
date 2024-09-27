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
import { createOrganization } from './http/routes/orgs/create-organization.controller'
import { getMembership } from './http/routes/orgs/get-membership.controller'
import { getOrganization } from './http/routes/orgs/get-organization.controller'
import { getOrganizations } from './http/routes/orgs/get-organizations.controller'
import { updateOrganization } from './http/routes/orgs/update-organization.controller'

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

// Organization controllers
app.register(createOrganization)
app.register(getMembership)
app.register(getOrganization)
app.register(getOrganizations)
app.register(updateOrganization)

app.listen().then(() => {
  // console.log('Server running!')
})
