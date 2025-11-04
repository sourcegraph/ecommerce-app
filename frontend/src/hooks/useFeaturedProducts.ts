import { useEffect, useState } from 'react'
import { Product } from '../api/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export function useFeaturedProducts(limit = 5) {
  const [data, setData] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    const ctrl = new window.AbortController()

    setLoading(true)
    fetch(`${API_URL}/api/products/featured?limit=${limit}`, {
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((e) => {
        if (!cancelled && e.name !== 'AbortError') setError(e)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [limit])

  return { data, loading, error }
}
