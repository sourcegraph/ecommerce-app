import { useCallback, useEffect, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  Button,
  usePrefersReducedMotion,
} from '@chakra-ui/react'
import { ArrowBackIcon, ArrowForwardIcon } from '@chakra-ui/icons'
import { Product } from '../api/types'
import { Link as RouterLink } from 'react-router-dom'

interface FeaturedCarouselProps {
  readonly products: Product[]
  readonly intervalMs?: number
}

const FeaturedCarousel = ({ products, intervalMs = 6000 }: FeaturedCarouselProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()

  const autoplayRef = useRef(
    Autoplay({
      delay: intervalMs,
      stopOnMouseEnter: true,
      stopOnInteraction: true,
    })
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: true, duration: 20 },
    prefersReducedMotion ? [] : [autoplayRef.current]
  )

  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  const scrollTo = (i: number) => emblaApi?.scrollTo(i)
  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  return (
    <Box
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products carousel"
      aria-live="polite"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.default"
      rounded="lg"
      p={3}
      mb={6}
    >
      {/* Header with navigation */}
      <Flex align="center" justify="space-between" mb={2}>
        <Text fontWeight="bold" color="text.primary">
          Featured
        </Text>
        <HStack spacing={1}>
          <IconButton
            aria-label="Previous featured product"
            icon={<ArrowBackIcon />}
            onClick={scrollPrev}
            size="sm"
            variant="ghost"
            colorScheme="blue"
          />
          <IconButton
            aria-label="Next featured product"
            icon={<ArrowForwardIcon />}
            onClick={scrollNext}
            size="sm"
            variant="ghost"
            colorScheme="blue"
          />
        </HStack>
      </Flex>

      {/* Carousel viewport */}
      <Box ref={emblaRef} tabIndex={0} aria-label="Carousel viewport" outline="none">
        <HStack spacing={3} align="stretch">
          {products.map((product, idx) => (
            <Box
              key={product.id}
              flex="0 0 100%"
              sx={{
                '@media (min-width: 480px)': { flex: '0 0 80%' },
                '@media (min-width: 768px)': { flex: '0 0 50%' },
                '@media (min-width: 1024px)': { flex: '0 0 33.3333%' },
              }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${products.length}`}
              aria-hidden={selectedIndex !== idx ? 'true' : 'false'}
              borderWidth="1px"
              borderColor="border.default"
              rounded="md"
              overflow="hidden"
              bg="bg.default"
            >
              <Flex direction="column" h="100%">
                <Image
                  src={product.image_url || '/placeholder.jpg'}
                  alt={product.title}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  objectFit="cover"
                  h={{ base: '160px', md: '200px' }}
                  w="100%"
                  bg="sand.100"
                />
                <Box p={3} flex="1">
                  <Text noOfLines={1} color="text.primary" fontWeight="semibold">
                    {product.title}
                  </Text>
                  <Text noOfLines={2} color="text.secondary" fontSize="sm" mt={1}>
                    {product.description}
                  </Text>
                  <Text color="text.primary" mt={2}>
                    ${product.price.toFixed(2)}
                  </Text>
                  {product.delivery_summary?.has_free && (
                    <Text color="text.secondary" fontSize="xs" mt={1}>
                      Free delivery available
                    </Text>
                  )}
                  <HStack mt={3} spacing={3}>
                    <Button
                      as={RouterLink}
                      to={`/products/${product.id}`}
                      size="sm"
                      colorScheme="blue"
                      variant="solid"
                    >
                      View
                    </Button>
                    <Button
                      as={RouterLink}
                      to={`/products/${product.id}`}
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                    >
                      Add to Cart
                    </Button>
                  </HStack>
                </Box>
              </Flex>
            </Box>
          ))}
        </HStack>
      </Box>

      {/* Pagination dots */}
      <HStack justify="center" mt={3}>
        {products.map((_, i) => (
          <Button
            key={i}
            onClick={() => scrollTo(i)}
            size="xs"
            variant={selectedIndex === i ? 'solid' : 'ghost'}
            colorScheme="blue"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={selectedIndex === i ? 'true' : 'false'}
            rounded="full"
            px={2}
          />
        ))}
      </HStack>
    </Box>
  )
}

export default FeaturedCarousel
