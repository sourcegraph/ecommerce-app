import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Image,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { Product } from '../api/types'

interface HeroCarouselProps {
  products: Product[]
  onProductClick: (productId: number) => void
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ products, onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (products.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [products.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!products.length) {
    return (
      <Box
        height="400px"
        bg="gray.100"
        display="flex"
        alignItems="center"
        justifyContent="center"
        borderRadius="lg"
      >
        <Text color="gray.500">No featured products available</Text>
      </Box>
    )
  }

  const currentProduct = products[currentIndex]

  return (
    <Box
      position="relative"
      height={{ base: "300px", md: "400px" }}
      bg="gray.900"
      borderRadius="lg"
      overflow="hidden"
      mb={8}
    >
      {/* Main carousel content */}
      <Box
        position="relative"
        height="100%"
        display="flex"
        alignItems="center"
        transition="all 0.5s ease-in-out"
      >
        {/* Background Image */}
        {currentProduct.image_url && (
          <Image
            src={currentProduct.image_url}
            alt={currentProduct.title}
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="100%"
            objectFit="cover"
            filter="brightness(0.4)"
          />
        )}
        
        {/* Content Overlay */}
        <Box
          position="relative"
          zIndex={2}
          color="white"
          px={{ base: 6, md: 12 }}
          py={8}
          maxW={{ base: "100%", md: "50%" }}
        >
          <VStack align="flex-start" spacing={4}>
            <Text
              fontSize={{ base: "2xl", md: "4xl" }}
              fontWeight="bold"
              lineHeight="shorter"
              textShadow="2px 2px 4px rgba(0,0,0,0.8)"
            >
              {currentProduct.title}
            </Text>
            
            <Text
              fontSize={{ base: "sm", md: "md" }}
              opacity={0.9}
              noOfLines={3}
              textShadow="1px 1px 2px rgba(0,0,0,0.8)"
            >
              {currentProduct.description}
            </Text>
            
            <HStack spacing={4} align="center">
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="bold"
                color="yellow.400"
                textShadow="1px 1px 2px rgba(0,0,0,0.8)"
              >
                ${currentProduct.price.toFixed(2)}
              </Text>
              
              <Button
                colorScheme="blue"
                size={{ base: "md", md: "lg" }}
                onClick={() => onProductClick(currentProduct.id)}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                Shop Now
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Navigation Arrows */}
      {products.length > 1 && (
        <>
          <IconButton
            aria-label="Previous slide"
            icon={<ChevronLeftIcon />}
            position="absolute"
            left="4"
            top="50%"
            transform="translateY(-50%)"
            zIndex={3}
            colorScheme="whiteAlpha"
            variant="solid"
            onClick={goToPrevious}
            size={isMobile ? "sm" : "md"}
            _hover={{ bg: "whiteAlpha.300" }}
          />
          
          <IconButton
            aria-label="Next slide"
            icon={<ChevronRightIcon />}
            position="absolute"
            right="4"
            top="50%"
            transform="translateY(-50%)"
            zIndex={3}
            colorScheme="whiteAlpha"
            variant="solid"
            onClick={goToNext}
            size={isMobile ? "sm" : "md"}
            _hover={{ bg: "whiteAlpha.300" }}
          />
        </>
      )}

      {/* Dots indicator */}
      {products.length > 1 && (
        <HStack
          position="absolute"
          bottom="4"
          left="50%"
          transform="translateX(-50%)"
          zIndex={3}
          spacing={2}
        >
          {products.map((_, index) => (
            <Box
              key={index}
              w="3"
              h="3"
              bg={index === currentIndex ? "white" : "whiteAlpha.500"}
              borderRadius="full"
              cursor="pointer"
              onClick={() => goToSlide(index)}
              transition="all 0.2s"
              _hover={{ bg: "white" }}
            />
          ))}
        </HStack>
      )}
    </Box>
  )
}

export default HeroCarousel
