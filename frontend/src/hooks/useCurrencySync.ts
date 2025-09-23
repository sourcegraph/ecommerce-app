import { useEffect } from 'react'
import { useCurrency } from '../context/CurrencyContext'
import { api } from '../api/client'

/**
 * Hook to sync currency changes with the API client
 * This ensures all API calls include the current currency parameter
 */
export const useCurrencySync = () => {
  const { currency } = useCurrency()

  useEffect(() => {
    // Update the API client's currency whenever it changes
    api.setCurrency(currency)
  }, [currency])

  return { currency }
}

export default useCurrencySync
