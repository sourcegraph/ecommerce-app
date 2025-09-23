import React, { useState, useEffect, useMemo } from 'react';
import {
  VStack,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Box,
  Button,
  HStack,
  Tag,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useGlobalContext } from '../context/useGlobalContext';
import { ProductType } from '../context/GlobalState';
import { Product, Category } from '../api/types';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import ProductsGrid from '../components/ProductsGrid';
import LoadingProduct from '../components/Loading/LoadingProduct';
import Main from '../components/Main';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

interface CategoryTile {
  id: number;
  name: string;
  productCount: number;
}

const LandingPage: React.FC = () => {
  const { products: globalProducts } = useGlobalContext();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryTile[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Fetch featured products for carousel
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/featured`);
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setIsLoadingFeatured(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Fetch popular products
  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/popular`);
        if (response.ok) {
          const data = await response.json();
          setPopularProducts(data.slice(0, 6)); // Limit to 6 products for grid
        }
      } catch (error) {
        console.error('Failed to fetch popular products:', error);
      } finally {
        setIsLoadingPopular(false);
      }
    };

    fetchPopularProducts();
  }, []);

  // Fetch categories with product counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        if (response.ok) {
          const data: Category[] = await response.json();
          // Transform to include product counts (simplified for demo)
          const categoryTiles: CategoryTile[] = data.map(category => ({
            id: category.id,
            name: category.name,
            productCount: Math.floor(Math.random() * 20) + 5, // Mock count for demo
          }));
          setCategories(categoryTiles);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Transform products to include cart/saved state
  const transformProducts = (products: Product[]): ProductType[] => {
    return products.map((product: Product) => {
      const globalProduct = globalProducts.find(gp => gp.id === product.id);
      
      const baseProduct = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        category: product.category?.name || '',
        isSaved: globalProduct?.isSaved || false,
        delivery_summary: product.delivery_summary,
      };
      
      if (globalProduct?.inCart) {
        return {
          ...baseProduct,
          inCart: true as true,
          quantity: globalProduct.quantity || 1,
        };
      } else {
        return {
          ...baseProduct,
          inCart: false,
        };
      }
    });
  };

  const featuredProductsWithState = useMemo(
    () => transformProducts(featuredProducts),
    [featuredProducts, globalProducts]
  );

  const popularProductsWithState = useMemo(
    () => transformProducts(popularProducts),
    [popularProducts, globalProducts]
  );

  return (
    <Main>
      <VStack spacing={12} align="stretch">
        {/* Hero Carousel Section */}
        <Box>
          <HeroCarousel
            products={featuredProductsWithState}
            isLoading={isLoadingFeatured}
            autoAdvanceInterval={6000}
          />
        </Box>

        {/* Category Navigation */}
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center">
              Shop by Category
            </Heading>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
              {isLoadingCategories
                ? Array(8)
                    .fill("")
                    .map((_, i) => (
                      <Box
                        key={i}
                        height="120px"
                        bg="gray.100"
                        borderRadius="lg"
                      />
                    ))
                : categories.map((category) => (
                    <Button
                      key={category.id}
                      as={RouterLink}
                      to={`/products?category=${category.id}`}
                      variant="outline"
                      height="120px"
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                      borderWidth={2}
                      borderRadius="lg"
                      _hover={{
                        borderColor: 'red.500',
                        transform: 'translateY(-2px)',
                        shadow: 'md',
                      }}
                      transition="all 0.2s"
                    >
                      <Text fontWeight="bold" fontSize="lg">
                        {category.name}
                      </Text>
                      <Badge colorScheme="blue" fontSize="xs">
                        {category.productCount} items
                      </Badge>
                    </Button>
                  ))}
            </SimpleGrid>
          </VStack>
        </Container>

        {/* Popular Products Section */}
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between" align="center">
              <Heading size="lg">Popular Items</Heading>
              <Button
                as={RouterLink}
                to="/products"
                variant="outline"
                colorScheme="red"
                size="sm"
              >
                View All Products
              </Button>
            </HStack>

            <ProductsGrid>
              {isLoadingPopular
                ? Array(6)
                    .fill("")
                    .map((_, i) => <LoadingProduct key={i} />)
                : popularProductsWithState.map((product, index) => (
                    <ProductCard
                      key={`${product.id}-${index}`}
                      product={product}
                    />
                  ))}
            </ProductsGrid>
          </VStack>
        </Container>

        {/* Featured Tags Section */}
        <Container maxW="container.xl">
          <VStack spacing={4} align="center">
            <Text color="gray.600" fontSize="sm">
              Trending Searches
            </Text>
            <HStack spacing={2} flexWrap="wrap" justify="center">
              {['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books'].map((tag, i) => (
                <Tag
                  key={i}
                  size="md"
                  variant="outline"
                  colorScheme="red"
                  cursor="pointer"
                  _hover={{ bg: 'red.50' }}
                  as={RouterLink}
                  to={`/products?search=${tag}`}
                >
                  {tag}
                </Tag>
              ))}
            </HStack>
          </VStack>
        </Container>
      </VStack>
    </Main>
  );
};

export default LandingPage;
