import React, { useState, useEffect, useMemo } from 'react'
import {
  VStack,
  Text,
  HStack,
  Tag,
  Grid,
  GridItem,
  Box,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import HeroCarousel from '../components/HeroCarousel'
import ProductCard from '../components/ProductCard'
import ProductsGrid from '../components/ProductsGrid'
import LoadingProduct from '../components/Loading/LoadingProduct'
import Main from '../components/Main'
import { api } from '../api/client'
import { Product } from '../api/types'
import { ProductType } from '../context/GlobalState'
import { useGlobalContext } from '../context/useGlobalContext'
import { searchTags } from '../mockDB/db'

const Landing: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [popularProducts, setPopularProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const { products: globalProducts } = useGlobalContext()

  const gridColumns = useBreakpointValue({ base: 2, md: 3, lg: 4 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [featured, popular] = await Promise.all([
          api.getFeaturedProducts(5),
          api.getPopularProducts(8),
        ])
        setFeaturedProducts(featured)
        setPopularProducts(popular)
      } catch (error) {
        console.error('Error fetching landing page data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Transform API Product objects to ProductType and merge with global state
  const transformedPopularProducts: ProductType[] = useMemo(() => {
    return popularProducts.map((product: Product) => {
      const globalProduct = globalProducts.find(gp => gp.id === product.id)
      
      const baseProduct = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category: product.category?.name || '',
        isSaved: globalProduct?.isSaved || false,
        delivery_summary: product.delivery_summary,
      }
      
      if (globalProduct?.inCart) {
        return {
          ...baseProduct,
          inCart: true as true,
          quantity: globalProduct.quantity || 1,
        }
      } else {
        return {
          ...baseProduct,
          inCart: false,
        }
      }
    })
  }, [popularProducts, globalProducts])

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`)
  }

  return (
    <Main>
      <VStack spacing={8} align="stretch">
        {/* Hero Carousel Section */}
        {isLoading ? (
          <Box
            height="400px"
            bg="gray.100"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="lg"
            animation="pulse 2s infinite"
          >
            <Text color="gray.500">Loading featured products...</Text>
          </Box>
        ) : (
          <HeroCarousel
            products={featuredProducts}
            onProductClick={handleProductClick}
          />
        )}

        {/* Category Navigation Tiles */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Browse Categories
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            {searchTags.map((tag, i) => (
              <Tag
                key={i}
                size="lg"
                bg="blue.50"
                color="blue.600"
                rounded="full"
                px={4}
                py={2}
                cursor="pointer"
                _hover={{ bg: "blue.100", transform: "translateY(-1px)" }}
                transition="all 0.2s"
                onClick={() => navigate(`/search/${tag}`)}
              >
                {tag}
              </Tag>
            ))}
          </HStack>
        </Box>

        {/* Popular Products Section */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Text fontSize="2xl" fontWeight="bold">
              Popular Items
            </Text>
            <Button
              variant="outline"
              colorScheme="blue"
              onClick={() => navigate('/search/popular')}
            >
              View All
            </Button>
          </HStack>
          
          <ProductsGrid>
            {isLoading
              ? Array(8)
                  .fill("")
                  .map((_, i) => <LoadingProduct key={i} />)
              : transformedPopularProducts.map((product, index) => (
                  <ProductCard 
                    key={`${product.id}-${index}`} 
                    product={product} 
                  />
                ))
            }
          </ProductsGrid>
        </Box>

        {/* New Arrivals Section */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Text fontSize="2xl" fontWeight="bold">
              New Arrivals
            </Text>
            <Button
              variant="outline"
              colorScheme="blue"
              onClick={() => navigate('/browse')}
            >
              View All
            </Button>
          </HStack>
          
          <Grid templateColumns={`repeat(${gridColumns}, 1fr)`} gap={4}>
            {isLoading
              ? Array(4)
                  .fill("")
                  .map((_, i) => (
                    <GridItem key={i}>
                      <LoadingProduct />
                    </GridItem>
                  ))
              : transformedPopularProducts.slice(0, 4).map((product, index) => (
                  <GridItem key={`new-${product.id}-${index}`}>
                    <ProductCard product={product} />
                  </GridItem>
                ))
            }
          </Grid>
        </Box>
      </VStack>
    </Main>
  )
}

export default Landing
