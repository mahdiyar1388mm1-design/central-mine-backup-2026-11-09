// Thin fetch wrapper for the Central Mine backend (NestJS, global prefix
// "v1" — see Central-Mine-BackEnd/src/main.ts). Attaches the stored bearer
// token automatically and normalizes Nest's error response shape
// (`{ statusCode, message, error }`, where `message` is a string for
// business errors and a string[] for class-validator failures) into a
// single readable message.

import { getAccessToken } from './authStorage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/v1'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean // send the Authorization header — defaults to true
}

async function request<T>(path: string, { method = 'GET', body, auth = true }: RequestOptions = {}): Promise<T> {
  const isFormData = body instanceof FormData
  const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getAccessToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      // FormData sets its own multipart Content-Type (with boundary) — fetch
      // does this automatically as long as we don't set the header ourselves.
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'اتصال به سرور برقرار نشد. اتصال اینترنت را بررسی کنید.')
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : undefined

  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join('، ') : data?.message
    throw new ApiError(response.status, message || 'خطای ناشناخته‌ای رخ داد.')
  }

  return data as T
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) => request<T>(path, { ...options, method: 'DELETE' }),
}
