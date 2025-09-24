import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { HeroCarousel } from '../components/HeroCarousel'

interface Product {
  readonly id: number
  readonly title: string
  readonly description: string
  readonly price: number
  readonly image_url: string | null
  readonly category?: {
    readonly id: number
    readonly name: string
  }
  readonly is_featured?: boolean
}

interface Category {
  readonly id: number
  readonly name: string
}

const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)
  const [isLoadingPopular, setIsLoadingPopular] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Fetch featured products for carousel
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/products/featured?limit=5')
        if (!response.ok) {
          throw new Error('Failed to fetch featured products')
        }
        const data = await response.json()
        setFeaturedProducts(data)
      } catch (err) {
        console.error('Error fetching featured products:', err)
        setError('Failed to load featured products')
      } finally {
        setIsLoadingFeatured(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  // Fetch popular products
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await fetch('http://localhost:8001/api/products/popular?limit=8')
        if (!response.ok) {
          throw new Error('Failed to fetch popular products')
        }
        const data = await response.json()
        setPopularProducts(data)
      } catch (err) {
        console.error('Error fetching popular products:', err)
        setError('Failed to load popular products')
      } finally {
        setIsLoadingPopular(false)
      }
    }

    fetchPopularProducts()
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8001/categories')
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        setCategories(data.slice(0, 6)) // Show max 6 categories
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to load categories')
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/search?category=${categoryId}`)
  }

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`)
  }

  const handleViewAllProducts = () => {
    navigate('/search')
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={12} align="stretch">
        {/* Hero Carousel Section */}
        <Box>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading size="xl" color="gray.800" mb={4}>
                Featured Products
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Discover our handpicked selection of amazing products
              </Text>
            </Box>
            
            <HeroCarousel products={featuredProducts} isLoading={isLoadingFeatured} />
          </VStack>
        </Box>

        {/* Categories Section */}
        <Box>
          <VStack spacing={6} align="stretch">
            <Box textAlign="center">
              <Heading size="lg" color="gray.800" mb={2}>
                Shop by Category
              </Heading>
              <Text color="gray.600">
                Browse our wide selection of categories
              </Text>
            </Box>
            
            {isLoadingCategories ? (
              <Center py={8}>
                <Spinner size="lg" color="blue.500" />
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    colorScheme="blue"
                    size="lg"
                    height="auto"
                    py={6}
                    px={4}
                    onClick={() => handleCategoryClick(category.id)}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'md',
                      bg: 'blue.50',
                    }}
                    transition="all 0.2s"
                  >
                    <Text fontWeight="semibold" fontSize="sm" textAlign="center">
                      {category.name}
                    </Text>
                  </Button>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </Box>

        {/* Popular Products Section */}
        <Box>
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="center">
              <Box>
                <Heading size="lg" color="gray.800" mb={2}>
                  Popular Products
                </Heading>
                <Text color="gray.600">
                  Trending items our customers love
                </Text>
              </Box>
              <Button
                variant="outline"
                colorScheme="blue"
                onClick={handleViewAllProducts}
              >
                View All
              </Button>
            </HStack>
            
            {isLoadingPopular ? (
              <Center py={8}>
                <Spinner size="lg" color="blue.500" />
              </Center>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
                {popularProducts.map((product) => (
                  <Box
                    key={product.id}
                    data-testid="product-card"
                    bg="white"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="md"
                    cursor="pointer"
                    onClick={() => handleProductClick(product.id)}
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'lg',
                    }}
                    transition="all 0.2s"
                  >
                    <Box position="relative">
                      {product.image_url ? (
                        <Box
                          bgImage={`url(http://localhost:8001${product.image_url})`}
                          bgSize="cover"
                          bgPosition="center"
                          height="200px"
                        />
                      ) : (
                        <Box
                          height="200px"
                          bg="gray.200"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text color="gray.500" fontSize="sm">
                            No image
                          </Text>
                        </Box>
                      )}
                      
                      {product.is_featured && (
                        <Badge
                          position="absolute"
                          top="2"
                          right="2"
                          colorScheme="orange"
                          variant="solid"
                        >
                          Featured
                        </Badge>
                      )}
                    </Box>
                    
                    <VStack p={4} spacing={2} align="start">
                      <Heading size="sm" color="gray.800" noOfLines={2} data-testid="product-title">
                        {product.title}
                      </Heading>
                      
                      {product.category && (
                        <Text fontSize="xs" color="blue.500" fontWeight="semibold">
                          {product.category.name}
                        </Text>
                      )}
                      
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        noOfLines={2}
                        minHeight="40px"
                      >
                        {product.description}
                      </Text>
                      
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="blue.600"
                        mt={2}
                        data-testid="product-price"
                      >
                        ${product.price.toFixed(2)}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </Box>

        {/* Call to Action Section */}
        <Box
          bg="blue.50"
          borderRadius="lg"
          p={8}
          textAlign="center"
        >
          <VStack spacing={4}>
            <Heading size="lg" color="gray.800">
              Ready to Start Shopping?
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="600px">
              Explore our full catalog of amazing products with fast delivery options
              and great prices.
            </Text>
            <Button
              size="lg"
              colorScheme="blue"
              px={8}
              onClick={handleViewAllProducts}
            >
              Browse All Products
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default LandingPage
