import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { Organization } from '@prisma/client'

import { createSlug } from '@/utils/create-slug'

function randomDigit() {
  return Math.floor(Math.random() * 10)
}

function calculateCheckDigits(cnpjBase) {
  function mod11(number) {
    let sum = 0
    let factor = 2

    for (let i = number.length - 1; i >= 0; i--) {
      sum += parseInt(number.charAt(i)) * factor
      factor = factor === 9 ? 2 : factor + 1
    }

    const result = 11 - (sum % 11)
    return result < 10 ? result : 0
  }

  const firstCheckDigit = mod11(cnpjBase)
  const secondCheckDigit = mod11(cnpjBase + firstCheckDigit)

  return '' + firstCheckDigit + secondCheckDigit
}

function generateCnpj() {
  let cnpjBase = ''
  for (let i = 0; i < 8; i++) {
    cnpjBase += randomDigit()
  }
  cnpjBase += '0001'

  const checkDigits = calculateCheckDigits(cnpjBase)
  return cnpjBase + checkDigits
}

function formatCnpj(cnpj) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

const cnpj = generateCnpj()
const formattedCnpj = formatCnpj(cnpj)

const name = faker.company.name()

export async function makeOrganization(
  override: Partial<Organization> = {},
  ownerId: string,
  id?: string,
) {
  const user = <Organization>{
    id: randomUUID() ?? id,
    name,
    avatarUrl: faker.image.avatar(),
    document: formattedCnpj,
    ownerId,
    slug: createSlug(name),
    ...override,
  }

  return user
}
