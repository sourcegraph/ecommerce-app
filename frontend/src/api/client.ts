import { Category, DeliveryOption, Product, CurrencyCode } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

class ApiClient {
  private currentCurrency: CurrencyCode = 'USD'

  setCurrency(currency: CurrencyCode) {
    this.currentCurrency = currency
  }
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

  async getDeliveryOptions(currency?: CurrencyCode): Promise<DeliveryOption[]> {
    const searchParams = new globalThis.URLSearchParams()
    const targetCurrency = currency || this.currentCurrency
    searchParams.set('currency', targetCurrency)
    
    return this.request<DeliveryOption[]>(`/api/delivery-options?${searchParams.toString()}`)
  }

  async getProducts(params: { 
    categoryId?: string
    deliveryOptionId?: string
    sort?: string 
    currency?: CurrencyCode
  } = {}): Promise<Product[]> {
    const searchParams = new globalThis.URLSearchParams()
    if (params.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params.deliveryOptionId) searchParams.set('deliveryOptionId', params.deliveryOptionId)
    if (params.sort) searchParams.set('sort', params.sort)
    
    // Always include currency parameter
    const currency = params.currency || this.currentCurrency
    searchParams.set('currency', currency)
    
    return this.request<Product[]>(`/api/products?${searchParams.toString()}`)
  }
}

export const api = new ApiClient()
