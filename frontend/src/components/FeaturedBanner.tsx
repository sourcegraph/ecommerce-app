import { Box, Button, Flex, Image, Text, AspectRatio } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ProductType, getImageUrl } from "../context/GlobalState";

type Props = {
  product: ProductType;
};

const FeaturedBanner = ({ product }: Props) => {

  return (
    <Flex
      mb={{ base: 6, md: 10 }}
      p={{ base: 6, md: 8 }}
      bg="bg.card"
      rounded="lg"
      border="1px solid"
      borderColor="border.subtle"
      align="center"
      gap={{ base: 4, md: 8 }}
      direction={{ base: "column", md: "row" }}
      boxShadow="card"
    >
      {/* Left: Content */}
      <Box flex="1">
        <Text fontSize="sm" color="text.secondary" fontWeight="semibold" letterSpacing="wide" mb={2}>
          FEATURED PRODUCT
        </Text>
        <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold" color="text.primary" mb={3}>
          {product.title}
        </Text>
        <Flex align="baseline" gap={3} mb={4}>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary">
            ${product.price}
          </Text>
        </Flex>
        <Button
          as={RouterLink}
          to={`/products/${product.id}`}
          variant="accent"
          size="lg"
        >
          Shop Now
        </Button>
      </Box>

      {/* Right: Image */}
      <Box flex="1" w="100%" maxW={{ base: "300px", md: "400px" }}>
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
  );
};

export default FeaturedBanner;
