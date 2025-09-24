export interface Category {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface DeliveryOption {
  id: number
  name: string
  description: string
  speed: "standard" | "express" | "next_day" | "same_day"
  price: number
  min_order_amount?: number
  estimated_days_min: number
  estimated_days_max: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  title: string
  description: string
  price: number
  category_id: number
  is_saved: boolean
  created_at: string
  updated_at: string
  image_url?: string
  category?: Category
  delivery_summary?: DeliverySummary
  cart_popularity_count?: number
}

export interface DeliverySummary {
  has_free: boolean
  cheapest_price: number
  fastest_days_min: number
  fastest_days_max: number
  options_count: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  code: string
}
