import { Category, DeliveryOption, Product } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

const DEDUP_TTL_MS = 2000
const inFlightRequests = new Map<string, { promise: Promise<unknown>; ts: number }>()

class ApiClient {
  private async request<T>(endpoint: string, options: globalThis.RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    const method = (options.method || 'GET').toString().toUpperCase()

    const doFetch = () =>
      fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      }).then((response) => {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        return response.json() as Promise<T>
      })

    if (method === 'GET') {
      const key = `${method}:${url}`
      const now = Date.now()
      const existing = inFlightRequests.get(key)

      if (existing && now - existing.ts < DEDUP_TTL_MS) {
        return existing.promise as Promise<T>
      }

      const promise = doFetch()
      inFlightRequests.set(key, { promise, ts: now })

      promise
        .catch(() => {
          inFlightRequests.delete(key)
        })
        .finally(() => {
          setTimeout(() => {
            const current = inFlightRequests.get(key)
            if (current && current.promise === promise) {
              inFlightRequests.delete(key)
            }
          }, DEDUP_TTL_MS)
        })

      return promise
    }

    return doFetch()
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories')
  }

  async getDeliveryOptions(): Promise<DeliveryOption[]> {
    return this.request<DeliveryOption[]>('/api/delivery-options')
  }

  async getProducts(
    params: {
      categoryId?: string
      deliveryOptionId?: string
      sort?: string
    } = {}
  ): Promise<Product[]> {
    const searchParams = new globalThis.URLSearchParams()
    if (params.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params.deliveryOptionId) searchParams.set('deliveryOptionId', params.deliveryOptionId)
    if (params.sort) searchParams.set('sort', params.sort)

    return this.request<Product[]>(`/api/products?${searchParams.toString()}`)
  }

  async getProductsWithSummary(): Promise<unknown[]> {
    return this.request<unknown[]>('/products?include_delivery_summary=true')
  }

  async getProductById(id: string | number): Promise<unknown> {
    return this.request<unknown>(`/products/${id}`)
  }
}

export const api = new ApiClient()
