import request from 'supertest'

import { prisma } from '@/lib/prisma'
import { app } from '@/server'
import { makeOrganization } from '@/test/factories/organization-factory'
import { makeUser } from '@/test/factories/user-factory'

describe('(E2E) Create Invite', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to invite a user', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const userToBeInvited = await makeUser()
    await prisma.user.create({
      data: userToBeInvited,
    })

    const organization = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: organization,
    })

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/invites`)
      .send({
        email: userToBeInvited.email,
        role: 'SELLER',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      inviteId: expect.any(String),
    })

    const inviteOnDatabase = await prisma.invite.findFirst({
      where: {
        email: userToBeInvited.email,
      },
    })

    expect(inviteOnDatabase).toBeTruthy()
  })

  it('should not be able to invite a new user without permission', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const userToCreateInvite = await makeUser()
    await prisma.user.create({
      data: userToCreateInvite,
    })

    const userToBeInvited = await makeUser()
    await prisma.user.create({
      data: userToBeInvited,
    })

    const organization = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: organization,
    })

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    })

    await prisma.member.create({
      data: {
        userId: userToCreateInvite.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const token = app.jwt.sign({ sub: userToCreateInvite.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/invites`)
      .send({
        email: userToBeInvited.email,
        role: 'SELLER',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      message: "You're not allowed to create invites.",
    })
  })

  it('should not be able to invite a new user with same email', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const userAlreadyExists = await makeUser({ email: 'testing@email.com' })
    await prisma.user.create({
      data: userAlreadyExists,
    })

    const userToBeInvited = await makeUser()
    await prisma.user.create({
      data: userToBeInvited,
    })

    const organization = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: organization,
    })

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    })

    await prisma.member.create({
      data: {
        userId: userAlreadyExists.id,
        organizationId: organization.id,
        role: 'SELLER',
      },
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/invites`)
      .send({
        email: 'testing@email.com',
        role: 'SELLER',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      message: 'This user is already part of the organization',
    })
  })

  it('should not be able to invite a new user twice', async () => {
    const owner = await makeUser()
    await prisma.user.create({
      data: owner,
    })

    const userToBeInvited = await makeUser()
    await prisma.user.create({
      data: userToBeInvited,
    })

    const organization = await makeOrganization({}, owner.id)
    await prisma.organization.create({
      data: organization,
    })

    await prisma.member.create({
      data: {
        userId: owner.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    })

    await prisma.invite.create({
      data: {
        organizationId: organization.id,
        email: userToBeInvited.email,
        role: 'SELLER',
        authorId: owner.id,
      },
    })

    const token = app.jwt.sign({ sub: owner.id })

    const response = await request(app.server)
      .post(`/organizations/${organization.slug}/invites`)
      .send({
        email: userToBeInvited.email,
        role: 'SELLER',
      })
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      message: 'This user has already been invited to this organization.',
    })
  })
})
