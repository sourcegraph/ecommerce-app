import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../api/client'
import { Product } from '../api/types'

export interface UseFilteredProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export const useFilteredProducts = (): UseFilteredProductsResult => {
  const [rawProducts, setRawProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams] = useSearchParams()

  const cat = searchParams.get('cat') || ''
  const deliv = searchParams.get('deliv') || ''
  const sort = searchParams.get('sort') || 'created_desc'

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const params: {
        categoryId?: string
        deliveryOptionId?: string
        sort?: string
      } = {}

      if (cat) params.categoryId = cat
      if (deliv) params.deliveryOptionId = deliv
      if (sort) params.sort = sort

      const productsData = await api.getProducts(params)
      setRawProducts(productsData)
    } catch (err) {
      console.error('Failed to fetch filtered products:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [cat, deliv, sort])

  const products = useMemo(() => {
    if (sort !== 'price_asc' && sort !== 'price_desc') return rawProducts

    const clone = [...rawProducts]

    if (sort === 'price_asc') {
      clone.sort((a: any, b: any) => a.price - b.price)
    } else if (sort === 'price_desc') {
      clone.sort((a: any, b: any) => b.price - a.price)
    }

    return clone
  }, [rawProducts, sort])

  return { products, loading, error, refetch: fetchProducts }
}
