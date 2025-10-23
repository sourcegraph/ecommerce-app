import { Box, Text, VStack, HStack, Radio, RadioGroup } from '@chakra-ui/react'
import { DeliveryOption } from '../../context/GlobalState'
import { DeliverySpeedIcon } from './DeliverySpeedIcon'

interface DeliveryOptionsSelectorProps {
  options: DeliveryOption[]
  productPrice: number
  value?: string
  onChange: (id: string) => void
}

const formatPrice = (price: number): string => {
  return price === 0 ? 'Free' : `$${price.toFixed(2)}`
}

const formatEta = (min: number, max: number): string => {
  if (min === max) {
    return min === 0 ? 'Same day' : min === 1 ? '1 business day' : `${min} business days`
  }
  return `${min}–${max} business days`
}

export const DeliveryOptionsSelector = ({
  options,
  productPrice: _productPrice, // eslint-disable-line @typescript-eslint/no-unused-vars
  value,
  onChange,
}: DeliveryOptionsSelectorProps) => {
  // Filter and sort options
  const activeOptions = options.filter((o) => o.is_active)
  const speedOrder = { standard: 0, express: 1, next_day: 2, same_day: 3 }
  const sortedOptions = activeOptions.sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price
    return speedOrder[a.speed] - speedOrder[b.speed]
  })

  if (sortedOptions.length === 0) {
    return (
      <Box p={4} textAlign="center" color="text.secondary">
        <Text>No delivery options available</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={3}>
        Delivery Options
      </Text>
      <RadioGroup value={value} onChange={onChange}>
        <VStack spacing={2} align="stretch">
          {sortedOptions.map((option) => {
            return (
              <Box
                key={option.id}
                p={3}
                borderWidth="1px"
                borderRadius="md"
                borderColor="border.subtle"
                bg="bg.surface"
                cursor="pointer"
                _hover={{ borderColor: 'border.default', shadow: 'sm' }}
                onClick={() => onChange(option.id.toString())}
              >
                <HStack spacing={3} align="flex-start">
                  <Radio value={option.id.toString()} mt={1} />
                  <DeliverySpeedIcon speed={option.speed} size="20px" />
                  <Box flex={1}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="medium">{option.name}</Text>
                      <Text fontWeight="semibold" color="text.primary">
                        {formatPrice(option.price)}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="text.secondary" mb={1}>
                      {formatEta(option.estimated_days_min, option.estimated_days_max)}
                    </Text>
                  </Box>
                </HStack>
              </Box>
            )
          })}
        </VStack>
      </RadioGroup>
    </Box>
  )
}
