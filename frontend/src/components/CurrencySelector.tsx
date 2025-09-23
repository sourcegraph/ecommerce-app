import { FC, ChangeEvent } from 'react'
import { Select, SelectProps } from '@chakra-ui/react'
import { useCurrency } from '../context/CurrencyContext'
import { CurrencyCode } from '../api/types'

interface CurrencySelectorProps extends Omit<SelectProps, 'value' | 'onChange'> {
  readonly onCurrencyChange?: (currency: CurrencyCode) => void
}

// Currency display names
const CURRENCY_NAMES: Record<CurrencyCode, string> = {
  USD: 'USD ($)',
  EUR: 'EUR (€)',
  GBP: 'GBP (£)',
  CAD: 'CAD ($)',
  AUD: 'AUD ($)',
  JPY: 'JPY (¥)'
}

export const CurrencySelector: FC<CurrencySelectorProps> = ({
  onCurrencyChange,
  ...selectProps
}) => {
  const { currency, setCurrency, supportedCurrencies } = useCurrency()

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = event.target.value as CurrencyCode
    setCurrency(newCurrency)
    onCurrencyChange?.(newCurrency)
  }

  return (
    <Select
      value={currency}
      onChange={handleChange}
      size="sm"
      width="auto"
      minWidth="80px"
      {...selectProps}
    >
      {supportedCurrencies.map(currencyCode => (
        <option key={currencyCode} value={currencyCode}>
          {CURRENCY_NAMES[currencyCode]}
        </option>
      ))}
    </Select>
  )
}

export default CurrencySelector
