import { FC, ReactNode, createContext, useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'

export type Currency = 'USD' | 'GBP' | 'EUR' | 'AUD' | 'MXN' | 'JPY'

export const SUPPORTED_CURRENCIES: readonly Currency[] = ['USD', 'GBP', 'EUR', 'AUD', 'MXN', 'JPY'] as const

const CACHE_TTL_MS = 6 * 60 * 60 * 1000
const CURRENCY_STORAGE_KEY = 'linea-currency'
const RATES_STORAGE_KEY = 'linea-fx-rates'
const RATES_TIMESTAMP_KEY = 'linea-fx-timestamp'

interface CurrencyContextType {
  readonly currency: Currency
  readonly setCurrency: (currency: Currency) => void
  readonly rates: Record<Currency, number>
  readonly fetchedAt: Date | null
  readonly stale: boolean
  readonly convert: (amountUSD: number) => number
  readonly format: (amountUSD: number) => string
}

interface Props {
  readonly children: ReactNode
}

interface FxRatesResponse {
  readonly base: string
  readonly rates: Record<string, number>
  readonly timestamp: string
}

export const CurrencyContext = createContext<CurrencyContextType | null>(null)

const detectCurrencyFromLocale = (): Currency => {
  const locale = typeof navigator !== 'undefined' ? navigator.language : 'en-US' // eslint-disable-line no-undef
  
  if (locale.startsWith('en-GB')) return 'GBP'
  if (locale.startsWith('en-AU')) return 'AUD'
  if (locale.startsWith('es-MX')) return 'MXN'
  if (locale.startsWith('ja')) return 'JPY'
  if (locale.startsWith('de-') || locale.startsWith('fr-') || locale.startsWith('es-ES')) return 'EUR'
  
  return 'USD'
}

const loadCachedCurrency = (): Currency => {
  try {
    const cached = localStorage.getItem(CURRENCY_STORAGE_KEY)
    if (cached && SUPPORTED_CURRENCIES.includes(cached as Currency)) {
      return cached as Currency
    }
  } catch (error) {
    console.error('Failed to load cached currency:', error)
  }
  return detectCurrencyFromLocale()
}

const loadCachedRates = (): { rates: Record<Currency, number>; timestamp: Date } | null => {
  try {
    const ratesStr = localStorage.getItem(RATES_STORAGE_KEY)
    const timestampStr = localStorage.getItem(RATES_TIMESTAMP_KEY)
    
    if (ratesStr && timestampStr) {
      const rates = JSON.parse(ratesStr) as Record<Currency, number>
      const timestamp = new Date(timestampStr)
      return { rates, timestamp }
    }
  } catch (error) {
    console.error('Failed to load cached rates:', error)
  }
  return null
}

const saveCachedRates = (rates: Record<Currency, number>, timestamp: Date): void => {
  try {
    localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(rates))
    localStorage.setItem(RATES_TIMESTAMP_KEY, timestamp.toISOString())
  } catch (error) {
    console.error('Failed to save cached rates:', error)
  }
}

const getDefaultRates = (): Record<Currency, number> => ({
  USD: 1,
  GBP: 1,
  EUR: 1,
  AUD: 1,
  MXN: 1,
  JPY: 1,
})

export const CurrencyProvider: FC<Props> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(loadCachedCurrency)
  const [rates, setRates] = useState<Record<Currency, number>>(getDefaultRates)
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)
  const [stale, setStale] = useState(true)

  const fetchRates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/fx/rates`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: FxRatesResponse = await response.json()
      const timestamp = new Date(data.timestamp)
      
      const fetchedRates: Record<Currency, number> = {
        USD: 1,
        GBP: data.rates.GBP || 1,
        EUR: data.rates.EUR || 1,
        AUD: data.rates.AUD || 1,
        MXN: data.rates.MXN || 1,
        JPY: data.rates.JPY || 1,
      }
      
      setRates(fetchedRates)
      setFetchedAt(timestamp)
      setStale(false)
      saveCachedRates(fetchedRates, timestamp)
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error)
    }
  }

  useEffect(() => {
    const cached = loadCachedRates()
    
    if (cached) {
      const age = Date.now() - cached.timestamp.getTime()
      if (age < CACHE_TTL_MS) {
        setRates(cached.rates)
        setFetchedAt(cached.timestamp)
        setStale(false)
        return
      }
    }
    
    fetchRates()
  }, [])

  useEffect(() => {
    if (!stale || !fetchedAt) return

    const age = Date.now() - fetchedAt.getTime()
    if (age >= CACHE_TTL_MS) {
      fetchRates()
    }
  }, [stale, fetchedAt])

  useEffect(() => {
    if (!fetchedAt) return

    const checkStale = () => {
      const age = Date.now() - fetchedAt.getTime()
      if (age >= CACHE_TTL_MS) {
        setStale(true)
      }
    }

    const interval = window.setInterval(checkStale, 60000)
    return () => window.clearInterval(interval)
  }, [fetchedAt])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency)
    } catch (error) {
      console.error('Failed to save currency preference:', error)
    }
  }

  const convert = (amountUSD: number): number => {
    return amountUSD * rates[currency]
  }

  const format = (amountUSD: number): string => {
    const converted = convert(amountUSD)
    
    const formatOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: currency === 'JPY' ? 0 : 2,
      maximumFractionDigits: currency === 'JPY' ? 0 : 2,
    }
    
    return new Intl.NumberFormat('en-US', formatOptions).format(converted)
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        rates,
        fetchedAt,
        stale,
        convert,
        format,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
