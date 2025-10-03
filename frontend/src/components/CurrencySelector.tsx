import { CheckIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react'
import { useContext } from 'react'
import { Currency, CurrencyContext, SUPPORTED_CURRENCIES } from '../context/CurrencyContext'

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  AUD: 'A$',
  MXN: 'Mex$',
  JPY: '¥',
}

const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  GBP: 'British Pound',
  EUR: 'Euro',
  AUD: 'Australian Dollar',
  MXN: 'Mexican Peso',
  JPY: 'Japanese Yen',
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}

export const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency()

  return (
    <Menu>
      <MenuButton
        as={Button}
        variant="ghost"
        fontSize={{ base: 'sm', sm: 'md' }}
        height={{ base: 8, sm: 9 }}
        minW={{ base: 12, sm: 14 }}
        px={{ base: 2, sm: 3 }}
        color="text.secondary"
        _hover={{ color: 'text.primary', bg: 'bg.subtle' }}
        _active={{ color: 'text.primary', bg: 'bg.card' }}
        data-testid="currency-selector-button"
      >
        <Text fontFamily="Inter" fontWeight={500}>
          {CURRENCY_SYMBOLS[currency]}
        </Text>
      </MenuButton>
      <MenuList
        bg="bg.surface"
        borderColor="border.subtle"
        boxShadow="dropdown"
        minW="200px"
        data-testid="currency-selector-menu"
      >
        {SUPPORTED_CURRENCIES.map((curr) => (
          <MenuItem
            key={curr}
            onClick={() => setCurrency(curr)}
            bg="bg.surface"
            _hover={{ bg: 'bg.subtle' }}
            _active={{ bg: 'bg.card' }}
            data-testid={`currency-option-${curr}`}
          >
            <HStack justify="space-between" width="100%">
              <HStack spacing={3}>
                <Text
                  fontFamily="Inter"
                  fontSize="md"
                  fontWeight={currency === curr ? 600 : 400}
                  color={currency === curr ? 'text.primary' : 'text.secondary'}
                >
                  {CURRENCY_SYMBOLS[curr]}
                </Text>
                <Text
                  fontSize="sm"
                  color={currency === curr ? 'text.primary' : 'text.muted'}
                  fontWeight={currency === curr ? 500 : 400}
                >
                  {CURRENCY_NAMES[curr]}
                </Text>
              </HStack>
              {currency === curr && (
                <Box>
                  <CheckIcon color="text.primary" boxSize={3} />
                </Box>
              )}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  )
}
