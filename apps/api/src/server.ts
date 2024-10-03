import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import { env } from '@metrify/env'
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
import { acceptInvite } from './http/routes/invites/accept-invite.controller'
import { createInvite } from './http/routes/invites/create-invite.controller'
import { getInvite } from './http/routes/invites/get-invite.controller'
import { getInvites } from './http/routes/invites/get-invites.controller'
import { getPendingInvites } from './http/routes/invites/get-pending-invites.controller'
import { rejectInvite } from './http/routes/invites/reject-invite.controller'
import { revokeInvite } from './http/routes/invites/revoke-invite.controller'
import { getMembers } from './http/routes/members/get-members.controller'
import { removeMember } from './http/routes/members/remove-member.controller'
import { updateMember } from './http/routes/members/update-member.controller'
import { createOrganization } from './http/routes/orgs/create-organization.controller'
import { getMembership } from './http/routes/orgs/get-membership.controller'
import { getOrganization } from './http/routes/orgs/get-organization.controller'
import { getOrganizations } from './http/routes/orgs/get-organizations.controller'
import { shutdownOrganization } from './http/routes/orgs/shutdown-organization.controller'
import { updateOrganization } from './http/routes/orgs/update-organization.controller'
import { createProduct } from './http/routes/product/create-product.controller'
import { getProducts } from './http/routes/product/get-products.controller'
import { createStore } from './http/routes/store/create-store.controller'
import { deleteStore } from './http/routes/store/delete-store.controller'
import { getStores } from './http/routes/store/get-stores.controller'
import { updateStore } from './http/routes/store/update-store.controller'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Metrify API',
      description: 'Documentação para utilização da API Metrify',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
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
app.register(shutdownOrganization)

// Member controllers
app.register(getMembers)
app.register(updateMember)
app.register(removeMember)

// Invite controllers
app.register(createInvite)
app.register(getInvite)
app.register(getInvites)
app.register(acceptInvite)
app.register(rejectInvite)
app.register(revokeInvite)
app.register(getPendingInvites)

// Store controllers
app.register(createStore)
app.register(deleteStore)
app.register(getStores)
app.register(updateStore)

// Product controllers
app.register(createProduct)
app.register(getProducts)

if (env.NODE_ENV !== 'test') {
  app.listen({ port: env.PORT }).then(() => {
    console.log('Server running!')
  })
}
