import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CurrencySelector } from './CurrencySelector'
import { Currency, CurrencyContext } from '../context/CurrencyContext'
import { ReactNode } from 'react'

const getMockCurrencyContext = (overrides?: Partial<{
  currency: Currency
  setCurrency: (currency: Currency) => void
}>) => ({
  currency: 'USD' as Currency,
  setCurrency: vi.fn(),
  rates: { USD: 1, GBP: 0.79, EUR: 0.92, AUD: 1.52, MXN: 20.5, JPY: 149.5 },
  fetchedAt: new Date(),
  stale: false,
  convert: vi.fn(),
  format: vi.fn(),
  ...overrides,
})

const renderWithCurrencyContext = (
  component: ReactNode,
  contextValue: ReturnType<typeof getMockCurrencyContext>
) => {
  return render(
    <CurrencyContext.Provider value={contextValue}>
      {component}
    </CurrencyContext.Provider>
  )
}

describe('CurrencySelector', () => {
  it('test_displays_current_currency', () => {
    const contextValue = getMockCurrencyContext({ currency: 'USD' })
    
    renderWithCurrencyContext(<CurrencySelector />, contextValue)

    const button = screen.getByTestId('currency-selector-button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('$')
  })

  it('test_shows_all_six_currencies_in_menu', () => {
    const contextValue = getMockCurrencyContext()
    
    renderWithCurrencyContext(<CurrencySelector />, contextValue)

    const button = screen.getByTestId('currency-selector-button')
    fireEvent.click(button)

    expect(screen.getByTestId('currency-option-USD')).toBeInTheDocument()
    expect(screen.getByTestId('currency-option-GBP')).toBeInTheDocument()
    expect(screen.getByTestId('currency-option-EUR')).toBeInTheDocument()
    expect(screen.getByTestId('currency-option-AUD')).toBeInTheDocument()
    expect(screen.getByTestId('currency-option-MXN')).toBeInTheDocument()
    expect(screen.getByTestId('currency-option-JPY')).toBeInTheDocument()

    expect(screen.getByText('US Dollar')).toBeInTheDocument()
    expect(screen.getByText('British Pound')).toBeInTheDocument()
    expect(screen.getByText('Euro')).toBeInTheDocument()
    expect(screen.getByText('Australian Dollar')).toBeInTheDocument()
    expect(screen.getByText('Mexican Peso')).toBeInTheDocument()
    expect(screen.getByText('Japanese Yen')).toBeInTheDocument()
  })

  it('test_clicking_currency_calls_setCurrency', () => {
    const mockSetCurrency = vi.fn()
    const contextValue = getMockCurrencyContext({ 
      currency: 'USD',
      setCurrency: mockSetCurrency 
    })
    
    renderWithCurrencyContext(<CurrencySelector />, contextValue)

    const button = screen.getByTestId('currency-selector-button')
    fireEvent.click(button)

    const eurOption = screen.getByTestId('currency-option-EUR')
    fireEvent.click(eurOption)

    expect(mockSetCurrency).toHaveBeenCalledWith('EUR')
  })

  it('test_selected_currency_is_highlighted', () => {
    const contextValue = getMockCurrencyContext({ currency: 'GBP' })
    
    renderWithCurrencyContext(<CurrencySelector />, contextValue)

    const button = screen.getByTestId('currency-selector-button')
    expect(button).toHaveTextContent('£')

    fireEvent.click(button)

    const gbpOption = screen.getByTestId('currency-option-GBP')
    expect(gbpOption.querySelector('svg')).toBeInTheDocument()

    const usdOption = screen.getByTestId('currency-option-USD')
    expect(usdOption.querySelector('svg')).toBeNull()
  })

  it('test_displays_correct_symbols_for_each_currency', () => {
    const contextValue = getMockCurrencyContext()
    
    renderWithCurrencyContext(<CurrencySelector />, contextValue)

    const button = screen.getByTestId('currency-selector-button')
    fireEvent.click(button)

    const symbols = ['$', '£', '€', 'A$', 'Mex$', '¥']
    symbols.forEach(symbol => {
      expect(screen.getAllByText(symbol).length).toBeGreaterThan(0)
    })
  })
})
