import { Category, DeliveryOption, Product } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

const DEDUPE_INTERVAL_MS = 2000

type InFlightEntry = {
  promise: Promise<unknown>
  start: number
  timer?: ReturnType<typeof globalThis.setTimeout>
}

class ApiClient {
  private inFlight = new Map<string, InFlightEntry>()

  // Normalize endpoint into a stable key: METHOD + normalized URL (sorted query)
  private buildKey(endpoint: string, method: string): string {
    const url = new globalThis.URL(endpoint, API_BASE_URL)
    if (url.search) {
      const sorted = new globalThis.URLSearchParams(
        Array.from(url.searchParams.entries()).sort(([a], [b]) => a.localeCompare(b))
      )
      url.search = sorted.toString()
    }
    const pathAndQuery = url.pathname + (url.search ? `?${url.search}` : '')
    return `${method.toUpperCase()} ${pathAndQuery}`
  }

  // Shared JSON request with GET-deduping
  private async request<T>(endpoint: string, options: globalThis.RequestInit = {}): Promise<T> {
    const method = (options.method || 'GET').toString().toUpperCase()
    const fullUrl = `${API_BASE_URL}${endpoint}`

    // GET-only dedupe
    if (method === 'GET') {
      const key = this.buildKey(endpoint, method)
      const now = Date.now()
      const existing = this.inFlight.get(key)
      if (existing && now - existing.start < DEDUPE_INTERVAL_MS) {
        return existing.promise as Promise<T>
      }

      const promise = (async () => {
        const response = await fetch(fullUrl, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
          method,
        })
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }
        return (await response.json()) as T
      })()

      const entry: InFlightEntry = { promise, start: now }
      // Failsafe cleanup in case finally doesn't run (page nav etc.)
      entry.timer = globalThis.setTimeout(() => {
        const current = this.inFlight.get(key)
        if (current && current.start === entry.start) this.inFlight.delete(key)
      }, DEDUPE_INTERVAL_MS)
      this.inFlight.set(key, entry)

      try {
        return await promise
      } finally {
        const current = this.inFlight.get(key)
        if (current && current.start === entry.start) {
          if (current.timer) globalThis.clearTimeout(current.timer)
          this.inFlight.delete(key)
        }
      }
    }

    // Non-GET: no dedupe
    const response = await fetch(fullUrl, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
      method,
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return response.json()
  }

  // Public, typed JSON getter to allow components to use the client directly
  getJSON<T>(endpoint: string, options: Omit<globalThis.RequestInit, 'method'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async getCategories(): Promise<Category[]> {
    return this.getJSON<Category[]>('/api/categories')
  }

  async getDeliveryOptions(): Promise<DeliveryOption[]> {
    return this.getJSON<DeliveryOption[]>('/api/delivery-options')
  }

  async getProducts(
    params: { categoryId?: string; deliveryOptionId?: string; sort?: string } = {}
  ): Promise<Product[]> {
    const searchParams = new globalThis.URLSearchParams()
    if (params.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params.deliveryOptionId) searchParams.set('deliveryOptionId', params.deliveryOptionId)
    if (params.sort) searchParams.set('sort', params.sort)
    return this.getJSON<Product[]>(`/api/products?${searchParams.toString()}`)
  }
}

export const api = new ApiClient()
