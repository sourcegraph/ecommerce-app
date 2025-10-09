import { Category, DeliveryOption, Product } from './types'
import { 
  ApiError, 
  ProblemDetails, 
  isRetryable, 
  calculateBackoff 
} from '../utils/apiError'
import { 
  getTraceparent, 
  updateTraceparent, 
  updateLastRequestId 
} from '../utils/tracing'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'
const MAX_RETRY_ATTEMPTS = 3

class ApiClient {
  private async requestWithRetry<T>(
    endpoint: string,
    options: globalThis.RequestInit = {},
    attempt: number = 0
  ): Promise<T> {
    const traceparent = getTraceparent()
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'traceparent': traceparent,
        ...options.headers,
      },
      ...options,
    })

    const responseTraceparent = response.headers.get('traceparent')
    const responseRequestId = response.headers.get('X-Request-ID')
    
    if (responseTraceparent) {
      updateTraceparent(responseTraceparent)
    }
    if (responseRequestId) {
      updateLastRequestId(responseRequestId)
    }

    if (!response.ok) {
      let problemDetails: ProblemDetails
      
      try {
        const contentType = response.headers.get('content-type')
        if (contentType?.includes('application/problem+json') || contentType?.includes('application/json')) {
          problemDetails = await response.json()
        } else {
          throw new Error('Not JSON')
        }
      } catch {
        const statusCodeMap: Record<number, string> = {
          400: 'VALIDATION.INVALID_FIELDS',
          401: 'AUTH.INVALID_TOKEN',
          403: 'AUTH.INSUFFICIENT_PERMISSIONS',
          404: 'RESOURCE.NOT_FOUND',
          500: 'SERVER.INTERNAL_ERROR',
        }
        
        problemDetails = {
          type: `https://docs.lineasupply.com/errors/unknown`,
          title: response.statusText || 'Error',
          status: response.status,
          detail: `Request failed with status ${response.status}`,
          instance: endpoint,
          code: statusCodeMap[response.status] || 'SERVER.INTERNAL_ERROR',
          request_id: responseRequestId || 'unknown',
          trace_id: responseRequestId || 'unknown',
        }
      }

      if (isRetryable(problemDetails.code) && attempt < MAX_RETRY_ATTEMPTS) {
        const delay = calculateBackoff(attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.requestWithRetry<T>(endpoint, options, attempt + 1)
      }

      if (response.status === 401) {
        window.location.href = '/login'
      }

      throw new ApiError(problemDetails, responseRequestId || 'unknown')
    }

    return response.json()
  }

  private async request<T>(
    endpoint: string,
    options: globalThis.RequestInit = {}
  ): Promise<T> {
    return this.requestWithRetry<T>(endpoint, options, 0)
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
}

export const api = new ApiClient()
export { getLastRequestId } from '../utils/tracing'
