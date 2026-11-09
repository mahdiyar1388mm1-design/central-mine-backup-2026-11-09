// Wraps Central-Mine-BackEnd's POST /uploads (src/modules/uploads) — sends
// an image as multipart/form-data and gets back a public, downloadable URL
// to use as a product image's `url` field.

import { api } from '../lib/apiClient'

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { url } = await api.post<{ url: string }>('/uploads', formData, { auth: false })
  return url
}
