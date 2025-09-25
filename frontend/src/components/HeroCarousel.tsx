import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Image,
  Text,
  Button,
  VStack,
  HStack,
  IconButton,
  Skeleton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { ProductType, getImageUrl } from '../context/GlobalState';

interface HeroCarouselProps {
  products: ProductType[];
  isLoading?: boolean;
  autoAdvanceInterval?: number;
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({
  products,
  isLoading = false,
  autoAdvanceInterval = 6000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});

  // Responsive values
  const carouselHeight = useBreakpointValue({ base: '300px', md: '400px', lg: '500px' });
  const imageSize = useBreakpointValue({ base: '200px', md: '300px', lg: '400px' });

  const nextSlide = useCallback(() => {
    if (products.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }
  }, [products.length]);

  const prevSlide = useCallback(() => {
    if (products.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    }
  }, [products.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-advance carousel
  useEffect(() => {
    if (!isPaused && products.length > 1 && !isLoading) {
      const interval = window.setInterval(nextSlide, autoAdvanceInterval);
      return () => window.clearInterval(interval);
    }
  }, [isPaused, products.length, isLoading, nextSlide, autoAdvanceInterval]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide]);

  if (isLoading) {
    return (
      <Box
        position="relative"
        width="100%"
        height={carouselHeight}
        bg="gray.50"
        borderRadius="lg"
        overflow="hidden"
      >
        <Skeleton width="100%" height="100%" />
      </Box>
    );
  }

  if (!products.length) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        height={carouselHeight}
        bg="gray.50"
        borderRadius="lg"
      >
        <Text color="gray.500">No featured products available</Text>
      </Box>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
      <Box
        position="relative"
        width="100%"
        height={carouselHeight}
        borderRadius="lg"
        overflow="hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="region"
        aria-label="Featured products carousel"
        aria-live="polite"
      >
        {/* Main carousel content */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          height="100%"
          bg="white"
          px={{ base: 4, md: 8 }}
          py={{ base: 4, md: 6 }}
        >
          {/* Product Image */}
          <Box flex="1" display="flex" justifyContent="center" alignItems="center">
            <Skeleton
              isLoaded={imageLoaded[currentIndex]}
              width={imageSize}
              height={imageSize}
            >
              <Image
                src={getImageUrl(currentProduct)}
                alt={currentProduct.title}
                objectFit="contain"
                width={imageSize}
                height={imageSize}
                onLoad={() =>
                  setImageLoaded((prev) => ({ ...prev, [currentIndex]: true }))
                }
              />
            </Skeleton>
          </Box>

          {/* Product Info */}
          <VStack
            flex="1"
            align="flex-start"
            spacing={4}
            pl={{ base: 4, md: 8 }}
            maxW={{ base: "50%", md: "40%" }}
          >
            <Text
              fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
              fontWeight="bold"
              color="gray.800"
              lineHeight="short"
              noOfLines={2}
            >
              {currentProduct.title}
            </Text>
            
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              color="gray.600"
              noOfLines={3}
              display={{ base: 'none', md: 'block' }}
            >
              {currentProduct.description}
            </Text>

            <Text
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              fontWeight="bold"
              color="red.500"
            >
              ${currentProduct.price}
            </Text>

            <Button
              as={RouterLink}
              to={`/products/${currentProduct.id}`}
              colorScheme="red"
              size={{ base: 'sm', md: 'md' }}
              px={{ base: 4, md: 6 }}
            >
              Shop Now
            </Button>
          </VStack>
        </Box>

        {/* Navigation Arrows */}
        {products.length > 1 && (
          <>
            <IconButton
              aria-label="Previous product"
              icon={<ChevronLeftIcon boxSize={6} />}
              position="absolute"
              left={2}
              top="50%"
              transform="translateY(-50%)"
              colorScheme="whiteAlpha"
              bg="blackAlpha.600"
              color="white"
              size="lg"
              borderRadius="full"
              onClick={prevSlide}
              _hover={{ bg: 'blackAlpha.800' }}
            />
            <IconButton
              aria-label="Next product"
              icon={<ChevronRightIcon boxSize={6} />}
              position="absolute"
              right={2}
              top="50%"
              transform="translateY(-50%)"
              colorScheme="whiteAlpha"
              bg="blackAlpha.600"
              color="white"
              size="lg"
              borderRadius="full"
              onClick={nextSlide}
              _hover={{ bg: 'blackAlpha.800' }}
            />
          </>
        )}

        {/* Dots Indicator */}
        {products.length > 1 && (
          <HStack
            position="absolute"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            spacing={2}
          >
            {products.map((_, index) => (
              <Box
                key={index}
                w={3}
                h={3}
                borderRadius="full"
                bg={index === currentIndex ? 'red.500' : 'whiteAlpha.600'}
                cursor="pointer"
                onClick={() => goToSlide(index)}
                transition="all 0.3s"
                _hover={{
                  bg: index === currentIndex ? 'red.600' : 'whiteAlpha.800'
                }}
                role="button"
                aria-label={`Go to slide ${index + 1}`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    goToSlide(index);
                  }
                }}
              />
            ))}
          </HStack>
        )}
      </Box>
    </Container>
  );
};

export default HeroCarousel;
