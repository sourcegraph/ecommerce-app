import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Product } from '../api/types'

export interface UseFeaturedProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
}

export const useFeaturedProducts = (limit = 5): UseFeaturedProductsResult => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true)
        const res = await api.getFeaturedProducts(limit)
        if (mounted) {
          setProducts(res)
          setError(null)
        }
      } catch (e) {
        if (mounted) {
          setError(e instanceof Error ? e.message : 'Failed to load featured products')
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchFeaturedProducts()
    return () => {
      mounted = false
    }
  }, [limit])

  return { products, loading, error }
}
