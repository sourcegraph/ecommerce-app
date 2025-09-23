export interface Money {
  readonly amount: string
  readonly currency: string
  readonly originalAmount?: string
  readonly originalCurrency?: string
}

export interface CurrencyInfo {
  readonly code: string
  readonly name: string
  readonly symbol: string
  readonly decimalPlaces: number
}

export interface ExchangeRates {
  readonly [currencyPair: string]: string
}

export interface CurrencyConversion {
  readonly originalAmount: string
  readonly originalCurrency: string
  readonly convertedAmount: string
  readonly convertedCurrency: string
  readonly exchangeRate: string
  readonly timestamp: string
}

export interface CurrencyContextType {
  readonly currency: string
  readonly setCurrency: (currency: string) => void
  readonly supportedCurrencies: readonly CurrencyInfo[]
  readonly rates: ExchangeRates
  readonly loading: boolean
  readonly error: string | null
  readonly convertMoney: (money: Money, targetCurrency: string) => Money
  readonly refreshRates: () => Promise<void>
  readonly lastUpdated: string | null
}

export interface ApiCurrencyResponse {
  readonly currencies: readonly string[]
}

export interface ApiExchangeRatesResponse {
  readonly rates: ExchangeRates
  readonly updated_at: string
}

export interface ApiConversionResponse {
  readonly original_amount: string
  readonly original_currency: string
  readonly converted_amount: string
  readonly converted_currency: string
  readonly exchange_rate: string
  readonly timestamp: string
}

// Product types with currency support
export interface ProductPrice extends Money {
  readonly originalAmount?: string
  readonly originalCurrency?: string
}

export interface Product {
  readonly id: string
  readonly title: string
  readonly description: string
  readonly price: ProductPrice
  readonly category: string
  readonly imageUrl?: string
  readonly inStock: boolean
}

// Cart types with currency support
export interface CartItem {
  readonly id: string
  readonly productId: string
  readonly product: Product
  readonly quantity: number
  readonly price: Money
  readonly subtotal: Money
}

export interface Cart {
  readonly items: readonly CartItem[]
  readonly subtotal: Money
  readonly tax: Money
  readonly shipping: Money
  readonly total: Money
  readonly currency: string
  readonly itemCount: number
}

// Order types with currency support
export interface Order {
  readonly id: string
  readonly status: string
  readonly items: readonly CartItem[]
  readonly subtotal: Money
  readonly tax: Money
  readonly shipping: Money
  readonly total: Money
  readonly currency: string
  readonly exchangeRateSnapshot: ExchangeRates
  readonly createdAt: string
  readonly shippingAddress: ShippingAddress
}

export interface ShippingAddress {
  readonly street: string
  readonly city: string
  readonly state?: string
  readonly postalCode: string
  readonly country: string
}

// Delivery option types with currency support
export interface DeliveryOption {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly price: Money
  readonly estimatedDays: string
  readonly minOrderAmount?: Money
}

// Currency validation types
export type SupportedCurrency = 'USD' | 'EUR' | 'GBP' | 'AUD' | 'MXN' | 'JPY'

export interface CurrencyValidationResult {
  readonly isValid: boolean
  readonly currency: SupportedCurrency
  readonly error?: string
}

// Currency formatting options
export interface CurrencyFormatOptions {
  readonly showOriginal?: boolean
  readonly showSymbol?: boolean
  readonly compact?: boolean
  readonly className?: string
}

// Error types
export class CurrencyError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly currency?: string
  ) {
    super(message)
    this.name = 'CurrencyError'
  }
}

export class UnsupportedCurrencyError extends CurrencyError {
  constructor(currency: string) {
    super(
      `Unsupported currency: ${currency}`,
      'UNSUPPORTED_CURRENCY',
      currency
    )
  }
}

export class ExchangeRateNotAvailableError extends CurrencyError {
  constructor(fromCurrency: string, toCurrency: string) {
    super(
      `Exchange rate not available for ${fromCurrency} to ${toCurrency}`,
      'RATE_NOT_AVAILABLE'
    )
  }
}

export class InvalidAmountError extends CurrencyError {
  constructor(amount: string) {
    super(
      `Invalid amount: ${amount}`,
      'INVALID_AMOUNT'
    )
  }
}

// Utility types
export type CurrencyPair = `${SupportedCurrency}_${SupportedCurrency}`

export interface CurrencyRateUpdate {
  readonly pair: CurrencyPair
  readonly rate: string
  readonly timestamp: string
}
