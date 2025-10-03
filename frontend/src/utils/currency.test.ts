/* eslint-disable no-undef */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { CurrencyProvider } from '../context/CurrencyContext'
import { useCurrency } from '../hooks/useCurrency'
import { ReactNode, createElement } from 'react'

const getMockFxResponse = (overrides?: Partial<{ 
  base: string
  rates: Record<string, number>
  timestamp: string 
}>): { base: string; rates: Record<string, number>; timestamp: string } => ({
  base: 'USD',
  rates: {
    GBP: 0.79,
    EUR: 0.92,
    AUD: 1.52,
    MXN: 17.05,
    JPY: 149.50,
  },
  timestamp: new Date().toISOString(),
  ...overrides,
})

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(CurrencyProvider, null, children)

describe('Currency Context and Utils', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(getMockFxResponse()),
      } as Response)
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('test_convert_with_various_rates', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchedAt).not.toBeNull()
    })

    act(() => {
      result.current.setCurrency('GBP')
    })

    expect(result.current.convert(100)).toBe(79)

    act(() => {
      result.current.setCurrency('EUR')
    })

    expect(result.current.convert(100)).toBe(92)

    act(() => {
      result.current.setCurrency('JPY')
    })

    expect(result.current.convert(100)).toBe(14950)
  })

  it('test_format_usd_shows_dollar_sign', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchedAt).not.toBeNull()
    })

    act(() => {
      result.current.setCurrency('USD')
    })

    const formatted = result.current.format(99.99)
    expect(formatted).toContain('$')
    expect(formatted).toContain('99.99')
  })

  it('test_format_gbp_shows_pound_sign', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchedAt).not.toBeNull()
    })

    act(() => {
      result.current.setCurrency('GBP')
    })

    const formatted = result.current.format(100)
    expect(formatted).toContain('£')
    expect(formatted).toContain('79.00')
  })

  it('test_format_jpy_shows_zero_decimals', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchedAt).not.toBeNull()
    })

    act(() => {
      result.current.setCurrency('JPY')
    })

    const formatted = result.current.format(100)
    expect(formatted).toContain('¥')
    expect(formatted).toContain('14,950')
    expect(formatted).not.toContain('.')
  })

  it('test_format_eur_shows_two_decimals', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchedAt).not.toBeNull()
    })

    act(() => {
      result.current.setCurrency('EUR')
    })

    const formatted = result.current.format(100)
    expect(formatted).toContain('€')
    expect(formatted).toContain('92.00')
  })

  it('test_currency_persists_to_localstorage', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchedAt).not.toBeNull()
    })

    act(() => {
      result.current.setCurrency('EUR')
    })

    expect(localStorage.getItem('linea-currency')).toBe('EUR')

    act(() => {
      result.current.setCurrency('JPY')
    })

    expect(localStorage.getItem('linea-currency')).toBe('JPY')
  })

  it('test_rates_cache_respects_ttl', async () => {
    const { result } = renderHook(() => useCurrency(), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchedAt).not.toBeNull()
    })

    expect(result.current.stale).toBe(false)

    const oldTimestamp = new Date(Date.now() - (6 * 60 * 60 * 1000 + 1000))
    localStorage.setItem('linea-fx-timestamp', oldTimestamp.toISOString())

    const { result: newResult } = renderHook(() => useCurrency(), { wrapper })

    await waitFor(() => {
      expect(newResult.current.stale).toBe(false)
    })
  })

  it('test_fallback_to_usd_when_rates_unavailable', async () => {
    const originalFetch = global.fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response)
    )

    const { result } = renderHook(() => useCurrency(), { wrapper })

    expect(result.current.rates.USD).toBe(1)
    expect(result.current.currency).toBe('USD')
    expect(result.current.convert(100)).toBe(100)

    global.fetch = originalFetch
  })

  it('test_loads_cached_currency_from_localstorage', () => {
    localStorage.setItem('linea-currency', 'EUR')

    const { result } = renderHook(() => useCurrency(), { wrapper })

    expect(result.current.currency).toBe('EUR')
  })

  it('test_loads_cached_rates_from_localstorage', () => {
    const cachedRates = {
      USD: 1,
      GBP: 0.80,
      EUR: 0.95,
      AUD: 1.50,
      MXN: 18.00,
      JPY: 150.00,
    }
    const cachedTimestamp = new Date()

    localStorage.setItem('linea-fx-rates', JSON.stringify(cachedRates))
    localStorage.setItem('linea-fx-timestamp', cachedTimestamp.toISOString())

    const { result } = renderHook(() => useCurrency(), { wrapper })

    expect(result.current.rates.GBP).toBe(0.80)
    expect(result.current.rates.EUR).toBe(0.95)
    expect(result.current.stale).toBe(false)
  })

  it('test_auto_detects_gbp_from_locale', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'en-GB',
      configurable: true,
    })

    localStorage.clear()

    const { result } = renderHook(() => useCurrency(), { wrapper })

    expect(result.current.currency).toBe('GBP')
  })

  it('test_auto_detects_jpy_from_locale', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'ja-JP',
      configurable: true,
    })

    localStorage.clear()

    const { result } = renderHook(() => useCurrency(), { wrapper })

    expect(result.current.currency).toBe('JPY')
  })

  it('test_useCurrency_throws_error_outside_provider', () => {
    expect(() => {
      renderHook(() => useCurrency())
    }).toThrow('useCurrency must be used within CurrencyProvider')
  })
})
