import { randomUUID } from 'node:crypto'

import { faker } from '@faker-js/faker'
import { type Product } from '@prisma/client'

export function makeProduct(
  override: Partial<Product> = {},
  storeId: string,
  id?: string,
) {
  const product = <Product>{
    id: randomUUID() ?? id,
    storeId,
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    platform: faker.company.name(),
    price: Number(faker.commerce.price()),
    bankSlipTax: 3,
    costPerUnit: 3,
    pixTax: 3,
    quantity: 3,
    shippingCost: 3,
    taxCost: 3,
    imageUrl: faker.image.url(),
    ...override,
  }

  return product
}
