// Wraps Central-Mine-BackEnd's `/products` endpoints (src/modules/products).
// Mirrors the backend's *.ro.ts shapes — only the fields that exist there;
// there's no MOQ/"verified seller"/"reorder rate" in this schema, that kind
// of trust-signal data belongs to the basket/order side, not the product
// catalog.

import { api } from '../lib/apiClient'

export type ProductImage = { id: string; url: string; createdAt: string }

export type ProductSku = {
  id: string
  code: string
  name: string
  price: number
  stock: number
  images: ProductImage[]
}

export type ProductAttribute = { id: string; key: string; value: string }

export type Product = {
  id: string
  name: string
  sellerDescription?: string
  visible: boolean
  rating: number
  seen: number
  skus: ProductSku[]
  attributes: ProductAttribute[]
  createdAt: string
  updatedAt: string
}

export type ProductsPage = { products: Product[]; count: number }

export type FindProductsParams = {
  name?: string
  categoryId?: string
  page?: number
  size?: number
}

export function findProducts(params: FindProductsParams = {}): Promise<ProductsPage> {
  const query = new URLSearchParams({ visible: 'true', page: String(params.page ?? 1), size: String(params.size ?? 20) })
  if (params.name) query.set('name', params.name)
  if (params.categoryId) query.set('categoryId', params.categoryId)

  return api.get<ProductsPage>(`/products?${query.toString()}`, { auth: false })
}

export function getProductById(id: string): Promise<Product> {
  return api.get<Product>(`/products/by-id/${id}`, { auth: false })
}
