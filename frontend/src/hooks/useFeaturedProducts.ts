import { useState, useEffect } from 'react';
import { Product } from '../api/types';
import { api } from '../api/client';

interface UseFeaturedProductsResult {
  readonly products: Product[];
  readonly loading: boolean;
  readonly error: string | null;
}

export const useFeaturedProducts = (): UseFeaturedProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const data = await api.getFeaturedProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch featured products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return { products, loading, error };
};
