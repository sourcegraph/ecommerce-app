import { FC, ReactNode, createContext, useContext, useState } from 'react'
import { CurrencyCode } from '../api/types'

interface CurrencyContextType {
  readonly currency: CurrencyCode
  readonly setCurrency: (currency: CurrencyCode) => void
  readonly supportedCurrencies: readonly CurrencyCode[]
}

const SUPPORTED_CURRENCIES: readonly CurrencyCode[] = [
  'USD',
  'EUR', 
  'GBP',
  'CAD',
  'AUD',
  'JPY'
] as const

const STORAGE_KEY = 'ecommerce-currency'
const DEFAULT_CURRENCY: CurrencyCode = 'USD'

const CurrencyContext = createContext<CurrencyContextType | null>(null)

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}

interface CurrencyProviderProps {
  readonly children: ReactNode
}

export const CurrencyProvider: FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && SUPPORTED_CURRENCIES.includes(stored as CurrencyCode)) {
        return stored as CurrencyCode
      }
    } catch (error) {
      console.error('Failed to load currency from localStorage:', error)
    }
    return DEFAULT_CURRENCY
  })

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency)
    try {
      localStorage.setItem(STORAGE_KEY, newCurrency)
    } catch (error) {
      console.error('Failed to save currency to localStorage:', error)
    }
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        supportedCurrencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
