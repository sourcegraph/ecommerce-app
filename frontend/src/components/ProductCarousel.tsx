import { Box, Button, Text, Flex, AspectRatio, Image, Skeleton } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Product } from "../api/types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProductCarouselProps {
  readonly products: Product[];
  readonly isLoading?: boolean;
}

const ProductCarousel = ({ products, isLoading = false }: ProductCarouselProps) => {
  if (isLoading) {
    return (
      <Box
        mb={{ base: 6, md: 10 }}
        p={{ base: 6, md: 8 }}
        bg="bg.card"
        rounded="lg"
        border="1px solid"
        borderColor="border.subtle"
        boxShadow="card"
      >
        <Skeleton height="400px" />
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <Box
      mb={{ base: 6, md: 10 }}
      data-testid="product-carousel"
      sx={{
        ".swiper-button-next, .swiper-button-prev": {
          color: "text.primary",
          "&:after": {
            fontSize: "24px",
          },
        },
        ".swiper-pagination-bullet": {
          bg: "border.subtle",
        },
        ".swiper-pagination-bullet-active": {
          bg: "text.primary",
        },
      }}
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        loop={products.length > 1}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <Flex
              p={{ base: 6, md: 8 }}
              bg="bg.card"
              rounded="lg"
              border="1px solid"
              borderColor="border.subtle"
              align="center"
              gap={{ base: 4, md: 8 }}
              direction={{ base: "column", md: "row" }}
              boxShadow="card"
              minH="400px"
            >
              <Box flex="1">
                <Text fontSize="sm" color="text.secondary" fontWeight="semibold" letterSpacing="wide" mb={2}>
                  FEATURED PRODUCT
                </Text>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="text.primary" mb={3}>
                  {product.title}
                </Text>
                <Text fontSize="md" color="text.secondary" mb={4} noOfLines={3}>
                  {product.description}
                </Text>
                <Flex align="baseline" gap={3} mb={4}>
                  <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                    ${product.price.toFixed(2)}
                  </Text>
                </Flex>
                <Button
                  as={RouterLink}
                  to={`/products/${product.id}`}
                  variant="accent"
                  size="lg"
                  data-testid={`carousel-cta-${product.id}`}
                >
                  Shop Now
                </Button>
              </Box>

              <Box flex="1" w="100%" maxW={{ base: "300px", md: "400px" }}>
                <AspectRatio ratio={1}>
                  <Box bg="bg.image" rounded="md" p={6}>
                    <Image
                      src={product.image_url ? (product.image_url.startsWith('http') ? product.image_url : `http://localhost:8001${product.image_url}`) : ''}
                      alt={product.title}
                      objectFit="contain"
                      w="100%"
                      h="100%"
                    />
                  </Box>
                </AspectRatio>
              </Box>
            </Flex>
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default ProductCarousel;
