import {
  Box,
  Button,
  HStack,
  Image,
  Link,
  VStack,
  Text,
  Skeleton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ProductInCart, getImageUrl } from '../../context/GlobalState'
import { useGlobalContext } from '../../context/useGlobalContext'
import MotionBox from '../MotionBox'

type Props = {
  product: ProductInCart
}

const formatUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

const CartItem = ({ product }: Props) => {
  const [imgLoaded, setImgLoaded] = useState(false)
  const { setQuantity, deleteFromCart, toggleSaved } = useGlobalContext()
  const subTotal = +product.price * +product.quantity

  const handleQuantityChange = (_: string, valueAsNumber: number) => {
    if (!isNaN(valueAsNumber) && valueAsNumber >= 1 && valueAsNumber <= 10) {
      setQuantity(valueAsNumber.toString(), product.id)
    }
  }

  return (
    <MotionBox
      display={{ base: 'none', bigTablet: 'flex' }}
      alignItems="flex-start"
      gap={6}
      opacity={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
      data-testid="cart-item"
    >
      <Box
        w="112px"
        h="112px"
        bg="sand.100"
        border="1px solid"
        borderColor="sand.300"
        rounded="lg"
        overflow="hidden"
        flexShrink={0}
      >
        <Skeleton
          isLoaded={imgLoaded}
          fadeDuration={0.2}
          w="100%"
          h="100%"
          startColor="sand.200"
          endColor="charcoal.100"
        >
          <Image
            src={getImageUrl(product)}
            alt={product.title}
            w="100%"
            h="100%"
            objectFit="contain"
            onLoad={() => setImgLoaded(true)}
          />
        </Skeleton>
      </Box>

      <HStack w="full" align="flex-start" spacing={6} flex={1}>
        <VStack align="flex-start" spacing={3} flex={1} minW={0}>
          <Link
            as={RouterLink}
            to={`/products/${product.id}`}
            color="ink.900"
            fontWeight="semibold"
            fontSize="md"
            _hover={{ textDecoration: 'underline' }}
            noOfLines={2}
          >
            {product.title}
          </Link>

          <HStack spacing={4} pt={1}>
            <Button
              variant="link"
              size="sm"
              color="charcoal.700"
              fontWeight="normal"
              _hover={{ color: 'ink.900', textDecoration: 'underline' }}
              onClick={() => {
                toggleSaved(product.id)
              }}
            >
              {product.isSaved ? 'Unsave' : 'Save for later'}
            </Button>
            <Button
              variant="link"
              size="sm"
              color="charcoal.700"
              fontWeight="normal"
              _hover={{ color: 'ink.900', textDecoration: 'underline' }}
              onClick={() => deleteFromCart(product.id)}
              data-testid="remove-item"
            >
              Remove
            </Button>
          </HStack>
        </VStack>

        <VStack minW="140px" align="flex-end" spacing={3}>
          <Text color="ink.900" fontWeight="medium" fontSize="md">
            {formatUSD(subTotal)}
          </Text>

          <NumberInput
            size="sm"
            value={product.quantity}
            min={1}
            max={10}
            w="90px"
            onChange={handleQuantityChange}
            focusBorderColor="slate.500"
          >
            <NumberInputField
              borderColor="sand.300"
              _hover={{ borderColor: 'sand.400' }}
              _focus={{
                borderColor: 'slate.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-slate-500)',
              }}
              textAlign="center"
              rounded="md"
              data-testid="quantity-display"
            />
            <NumberInputStepper>
              <NumberIncrementStepper borderColor="sand.300" _hover={{ bg: 'sand.100' }} />
              <NumberDecrementStepper borderColor="sand.300" _hover={{ bg: 'sand.100' }} />
            </NumberInputStepper>
          </NumberInput>

          <Text fontSize="xs" color="charcoal.600">
            {formatUSD(+product.price)} each
          </Text>
        </VStack>
      </HStack>
    </MotionBox>
  )
}

export default CartItem
