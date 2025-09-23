import { FC } from 'react'
import { Text, TextProps } from '@chakra-ui/react'
import { Money, CurrencyCode } from '../api/types'
import { useCurrency } from '../context/CurrencyContext'

interface MoneyDisplayProps extends Omit<TextProps, 'children'> {
  readonly money?: Money
  readonly fallbackAmount?: number // for backward compatibility with price field
}

// Currency display configurations
const CURRENCY_CONFIGS: Record<CurrencyCode, { locale: string; options: Intl.NumberFormatOptions }> = {
  USD: {
    locale: 'en-US',
    options: { style: 'currency', currency: 'USD' }
  },
  EUR: {
    locale: 'de-DE',
    options: { style: 'currency', currency: 'EUR' }
  },
  GBP: {
    locale: 'en-GB', 
    options: { style: 'currency', currency: 'GBP' }
  },
  CAD: {
    locale: 'en-CA',
    options: { style: 'currency', currency: 'CAD' }
  },
  AUD: {
    locale: 'en-AU',
    options: { style: 'currency', currency: 'AUD' }
  },
  JPY: {
    locale: 'ja-JP',
    options: { style: 'currency', currency: 'JPY' }
  }
}

// Helper function to get divisor for currency (most currencies use 100, JPY uses 1)
const getCurrencyDivisor = (currency: CurrencyCode): number => {
  return currency === 'JPY' ? 1 : 100
}

// Helper function to convert amount from one currency to another (mock conversion for demo)
const convertCurrency = (amountMinor: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
  if (fromCurrency === toCurrency) {
    return amountMinor
  }

  // Mock exchange rates (in a real app, these would come from an API)
  const exchangeRates: Record<CurrencyCode, Record<CurrencyCode, number>> = {
    USD: { USD: 1, EUR: 0.85, GBP: 0.73, CAD: 1.25, AUD: 1.35, JPY: 110 },
    EUR: { USD: 1.18, EUR: 1, GBP: 0.86, CAD: 1.47, AUD: 1.59, JPY: 129 },
    GBP: { USD: 1.37, EUR: 1.16, GBP: 1, CAD: 1.71, AUD: 1.85, JPY: 150 },
    CAD: { USD: 0.80, EUR: 0.68, GBP: 0.58, CAD: 1, AUD: 1.08, JPY: 88 },
    AUD: { USD: 0.74, EUR: 0.63, GBP: 0.54, CAD: 0.93, AUD: 1, JPY: 81 },
    JPY: { USD: 0.0091, EUR: 0.0078, GBP: 0.0067, CAD: 0.011, AUD: 0.012, JPY: 1 }
  }

  const rate = exchangeRates[fromCurrency]?.[toCurrency] ?? 1
  return Math.round(amountMinor * rate)
}

export const MoneyDisplay: FC<MoneyDisplayProps> = ({ 
  money, 
  fallbackAmount,
  ...textProps 
}) => {
  const { currency: displayCurrency } = useCurrency()

  // Handle backwards compatibility with price field
  let displayMoney: Money
  if (money) {
    displayMoney = {
      amountMinor: convertCurrency(money.amountMinor, money.currency, displayCurrency),
      currency: displayCurrency
    }
  } else if (fallbackAmount !== undefined) {
    // Convert legacy price field to Money format (assuming USD)
    displayMoney = {
      amountMinor: Math.round(fallbackAmount * 100), // convert dollars to cents
      currency: displayCurrency
    }
    
    // Convert from USD if display currency is different
    if (displayCurrency !== 'USD') {
      displayMoney = {
        amountMinor: convertCurrency(displayMoney.amountMinor, 'USD', displayCurrency),
        currency: displayCurrency
      }
    }
  } else {
    return <Text {...textProps}>Price unavailable</Text>
  }

  const config = CURRENCY_CONFIGS[displayMoney.currency]
  const divisor = getCurrencyDivisor(displayMoney.currency)
  const amount = displayMoney.amountMinor / divisor

  try {
    const formatter = new Intl.NumberFormat(config.locale, config.options)
    const formattedPrice = formatter.format(amount)
    
    return <Text {...textProps}>{formattedPrice}</Text>
  } catch (error) {
    console.error('Failed to format currency:', error)
    return <Text {...textProps}>{`${displayMoney.currency} ${amount.toFixed(2)}`}</Text>
  }
}

export default MoneyDisplay
