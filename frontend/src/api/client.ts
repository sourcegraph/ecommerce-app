import { Category, DeliveryOption, Product } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: globalThis.RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>('/api/categories')
  }

  async getDeliveryOptions(): Promise<DeliveryOption[]> {
    return this.request<DeliveryOption[]>('/api/delivery-options')
  }

  async getProducts(params: { 
    categoryId?: string
    deliveryOptionId?: string
    sort?: string 
  } = {}): Promise<Product[]> {
    const searchParams = new globalThis.URLSearchParams()
    if (params.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params.deliveryOptionId) searchParams.set('deliveryOptionId', params.deliveryOptionId)
    if (params.sort) searchParams.set('sort', params.sort)
    
    return this.request<Product[]>(`/api/products?${searchParams.toString()}`)
  }

  async getFeaturedProducts(limit: number = 5): Promise<Product[]> {
    return this.request<Product[]>(`/api/products/featured?limit=${limit}`)
  }

  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    return this.request<Product[]>(`/api/products/popular?limit=${limit}`)
  }
}

export const api = new ApiClient()
