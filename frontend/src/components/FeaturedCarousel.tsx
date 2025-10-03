import { useState, useEffect, useMemo, KeyboardEvent } from 'react'
import { Box, Button, Flex, HStack, Image, Text, AspectRatio } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { ProductType, getImageUrl } from '../context/GlobalState'
import MotionBox from './MotionBox'

type Props = {
  products: ProductType[]
  autoIntervalMs?: number
}

const FeaturedCarousel = ({ products, autoIntervalMs = 6000 }: Props) => {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useMemo(
    () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  )

  const length = products.length
  const isAuto = !reduced && !paused && length > 1

  useEffect(() => {
    if (!isAuto) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % length), autoIntervalMs)
    return () => window.clearInterval(id)
  }, [isAuto, autoIntervalMs, length])

  const goPrev = () => setIndex((i) => (i - 1 + length) % length)
  const goNext = () => setIndex((i) => (i + 1) % length)

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goPrev()
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      goNext()
    }
  }

  if (products.length === 0) return null

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      bg="bg.card"
      border="1px solid"
      borderColor="border.subtle"
      rounded="lg"
      boxShadow="card"
      p={{ base: 4, md: 6 }}
      mb={{ base: 6, md: 10 }}
      data-testid="featured-carousel"
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'accent.500',
        outlineOffset: '2px',
      }}
    >
      {/* Slides Container */}
      <Box position="relative" overflow="hidden" minH={{ base: '300px', md: '350px' }}>
        {products.map((product, i) => (
          <MotionBox
            key={product.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${length}`}
            aria-hidden={i !== index}
            initial={{ opacity: 0, x: 20 }}
            animate={{
              opacity: i === index ? 1 : 0,
              x: i === index ? 0 : -20,
            }}
            transition={{ duration: reduced ? 0 : 0.3 }}
            position={i === index ? 'relative' : 'absolute'}
            inset={0}
            display={i === index ? 'block' : 'none'}
          >
            <Flex
              align="center"
              gap={{ base: 4, md: 8 }}
              direction={{ base: 'column', md: 'row' }}
              h="100%"
            >
              {/* Left: Content */}
              <Box flex="1">
                <Text
                  fontSize="sm"
                  color="text.secondary"
                  fontWeight="semibold"
                  letterSpacing="wide"
                  mb={2}
                >
                  FEATURED PRODUCT
                </Text>
                <Text
                  fontSize={{ base: '2xl', md: '3xl' }}
                  fontWeight="bold"
                  color="text.primary"
                  mb={3}
                  data-testid={`carousel-slide-title-${i}`}
                >
                  {product.title}
                </Text>
                <Text
                  fontSize="md"
                  color="text.secondary"
                  mb={4}
                  noOfLines={2}
                >
                  {product.description}
                </Text>
                <Flex align="baseline" gap={3} mb={4}>
                  <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                    ${product.price}
                  </Text>
                </Flex>
                <Button as={RouterLink} to={`/products/${product.id}`} variant="accent" size="lg">
                  Shop Now
                </Button>
              </Box>

              {/* Right: Image */}
              <Box flex="1" w="100%" maxW={{ base: '300px', md: '400px' }}>
                <AspectRatio ratio={1}>
                  <Box bg="bg.image" rounded="md" p={6}>
                    <Image
                      src={getImageUrl(product)}
                      alt={product.title}
                      objectFit="contain"
                      w="100%"
                      h="100%"
                    />
                  </Box>
                </AspectRatio>
              </Box>
            </Flex>
          </MotionBox>
        ))}
      </Box>

      {/* Controls */}
      {length > 1 && (
        <Flex mt={4} align="center" justify="space-between" gap={4}>
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            aria-label="Previous slide"
            data-testid="carousel-prev"
          >
            Previous
          </Button>

          <HStack spacing={2}>
            {products.map((_, i) => (
              <Button
                key={i}
                size="xs"
                variant={i === index ? 'solid' : 'ghost'}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setIndex(i)}
                data-testid={`carousel-dot-${i}`}
                minW="32px"
              >
                {i + 1}
              </Button>
            ))}
          </HStack>

          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            aria-label="Next slide"
            data-testid="carousel-next"
          >
            Next
          </Button>
        </Flex>
      )}
    </Box>
  )
}

export default FeaturedCarousel
