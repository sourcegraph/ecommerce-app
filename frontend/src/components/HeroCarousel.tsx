import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  IconButton,
  useBreakpointValue,
  Spinner,
  Center,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface Product {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly price: number
  readonly image_url: string | null
  readonly category?: {
    readonly name: string
  }
}

interface HeroCarouselProps {
  readonly products: Product[]
  readonly isLoading?: boolean
}

const MotionBox = motion(Box)

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ products, isLoading = false }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()
  
  // Responsive configurations
  const slideHeight = useBreakpointValue({ base: '400px', md: '500px', lg: '600px' })
  const imageHeight = useBreakpointValue({ base: '200px', md: '300px', lg: '350px' })
  const padding = useBreakpointValue({ base: 4, md: 8 })
  const fontSize = useBreakpointValue({ base: 'lg', md: 'xl', lg: '2xl' })

  // Auto-advance slides every 6 seconds
  useEffect(() => {
    if (products.length === 0) return
    
    const interval = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length)
    }, 6000)

    return () => window.clearInterval(interval)
  }, [products.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % products.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + products.length) % products.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`)
  }

  if (isLoading) {
    return (
      <Box height={slideHeight} bg="gray.100" borderRadius="lg" overflow="hidden">
        <Center height="100%">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Loading featured products...</Text>
          </VStack>
        </Center>
      </Box>
    )
  }

  if (products.length === 0) {
    return (
      <Box height={slideHeight} bg="gray.100" borderRadius="lg" overflow="hidden">
        <Center height="100%">
          <Text color="gray.500" fontSize={fontSize}>
            No featured products available
          </Text>
        </Center>
      </Box>
    )
  }

  const currentProduct = products[currentSlide]

  return (
    <Box
      position="relative"
      height={slideHeight}
      bg="white"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
      role="region"
      aria-label="Featured products carousel"
    >
      <AnimatePresence mode="wait">
        <MotionBox
          key={currentSlide}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          height="100%"
          display="flex"
          alignItems="center"
        >
          <HStack
            spacing={8}
            height="100%"
            width="100%"
            p={padding}
            align="center"
            direction={{ base: 'column', lg: 'row' }}
          >
            {/* Product Image */}
            <Box flex={1} display="flex" justifyContent="center" alignItems="center">
              {currentProduct.image_url ? (
                <Image
                  src={`http://localhost:8001${currentProduct.image_url}`}
                  alt={currentProduct.title}
                  height={imageHeight}
                  maxW="100%"
                  objectFit="contain"
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => handleProductClick(currentProduct.id)}
                  _hover={{ transform: 'scale(1.05)' }}
                  transition="transform 0.2s"
                />
              ) : (
                <Box
                  height={imageHeight}
                  width="100%"
                  bg="gray.200"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="gray.500">No image available</Text>
                </Box>
              )}
            </Box>

            {/* Product Info */}
            <VStack
              flex={1}
              spacing={4}
              align={{ base: 'center', lg: 'start' }}
              textAlign={{ base: 'center', lg: 'left' }}
              height="100%"
              justify="center"
            >
              {currentProduct.category && (
                <Text
                  fontSize="sm"
                  color="blue.500"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {currentProduct.category.name}
                </Text>
              )}
              
              <Heading
                size={{ base: 'lg', md: 'xl', lg: '2xl' }}
                color="gray.800"
                lineHeight="shorter"
              >
                {currentProduct.title}
              </Heading>
              
              <Text
                fontSize={{ base: 'md', md: 'lg' }}
                color="gray.600"
                maxW="500px"
                noOfLines={3}
              >
                {currentProduct.description}
              </Text>
              
              <Text
                fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                fontWeight="bold"
                color="blue.600"
              >
                ${currentProduct.price.toFixed(2)}
              </Text>
              
              <Button
                size="lg"
                colorScheme="blue"
                onClick={() => handleProductClick(currentProduct.id)}
                px={8}
                py={6}
                fontSize="lg"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                View Product
              </Button>
            </VStack>
          </HStack>
        </MotionBox>
      </AnimatePresence>

      {/* Navigation Controls */}
      {products.length > 1 && (
        <>
          {/* Arrow buttons */}
          <IconButton
            aria-label="Previous product"
            icon={<ChevronLeftIcon />}
            position="absolute"
            left="4"
            top="50%"
            transform="translateY(-50%)"
            bg="whiteAlpha.900"
            _hover={{ bg: 'white' }}
            size="lg"
            onClick={prevSlide}
            zIndex={2}
          />
          
          <IconButton
            aria-label="Next product"
            icon={<ChevronRightIcon />}
            position="absolute"
            right="4"
            top="50%"
            transform="translateY(-50%)"
            bg="whiteAlpha.900"
            _hover={{ bg: 'white' }}
            size="lg"
            onClick={nextSlide}
            zIndex={2}
          />

          {/* Dot indicators */}
          <HStack
            position="absolute"
            bottom="4"
            left="50%"
            transform="translateX(-50%)"
            spacing={2}
            zIndex={2}
          >
            {products.map((_, index) => (
              <Box
                key={index}
                width="12px"
                height="12px"
                borderRadius="full"
                bg={index === currentSlide ? 'blue.500' : 'whiteAlpha.700'}
                cursor="pointer"
                onClick={() => goToSlide(index)}
                transition="all 0.2s"
                _hover={{ transform: 'scale(1.2)' }}
                role="button"
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </HStack>
        </>
      )}
    </Box>
  )
}
