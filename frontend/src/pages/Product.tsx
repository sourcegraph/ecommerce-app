import { ChevronRightIcon } from "@chakra-ui/icons";

import {
  AspectRatio,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Tag,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { Link as RouterLink, useParams } from "react-router-dom";
import ProgressLine from "../components/Loading/ProgressLine";
import MUIRating from "../components/MUI/MUIRating";
import { DeliveryOptionsSelector } from "../components/Delivery";
import { useGlobalContext } from "../context/useGlobalContext";
import { getImageUrl, ProductType, DeliveryOption } from "../context/GlobalState";
import { BookmarkIcon } from "../components/Icons/BookmarkIcon";

interface ProductWithDelivery {
  id: string | number;
  title: string;
  description: string;
  price: string | number;
  image_url?: string;
  category: string;
  isSaved?: boolean;
  inCart?: boolean;
  quantity?: number | string;
  delivery_options: DeliveryOption[];
}

const Product = () => {
  const { fetchProducts, isLoading, products, addToCart, toggleSaved } =
    useGlobalContext();
  const [productWithDelivery, setProductWithDelivery] = useState<ProductWithDelivery | null>(null);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<string>("");
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  
  // Get the url parameter (/:id) value
  const { id } = useParams();
  const toast = useToast();

  // Fetch individual product with delivery options
  const fetchProductWithDelivery = async (productId: string) => {
    try {
      setIsLoadingProduct(true);
      const API_BASE_URL = "http://localhost:8001";
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const product: ProductWithDelivery = await response.json();
      setProductWithDelivery(product);
      
      // Auto-select the cheapest or free option
      if (product.delivery_options && product.delivery_options.length > 0) {
        const freeOptions = product.delivery_options.filter(opt => opt.price === 0);
        if (freeOptions.length > 0) {
          // Select fastest free option
          const fastestFree = freeOptions.reduce((fastest, current) => 
            current.estimated_days_min < fastest.estimated_days_min ? current : fastest
          );
          setSelectedDeliveryOption(fastestFree.id.toString());
        } else {
          // Select cheapest option
          const cheapest = product.delivery_options.reduce((cheapest, current) => 
            current.price < cheapest.price ? current : cheapest
          );
          setSelectedDeliveryOption(cheapest.id.toString());
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductWithDelivery(id);
    }
  }, [id]);

  useEffect(() => {
    isLoading && fetchProducts();
  }, [isLoading, fetchProducts]);
  
  const product = products.find(product => product.id.toString() === id);
  // Use the product with delivery options if available, but merge with cart state from context
  const displayProduct = productWithDelivery 
    ? { ...productWithDelivery, inCart: product?.inCart, quantity: product?.inCart ? product.quantity : undefined }
    : product;



  return isLoading || isLoadingProduct ? (
    <ProgressLine />
  ) : (
    <Box p={{ base: 4, md: 6 }}>
      <Breadcrumb mb={6} fontSize="sm" separator={<ChevronRightIcon color="ink.400" />}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/" color="ink.500" _hover={{ color: "ink.600" }}>
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink color="ink.500">Product</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      {displayProduct ? (
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 6, lg: 10 }}
          maxW="1200px"
          mx="auto"
        >
          {/* Left: Image Gallery (60% on desktop) */}
          <Box flex={{ base: "1", lg: "0 0 58%" }}>
            <AspectRatio ratio={1} w="100%" maxW="600px">
              <Box
                bg="bg.surface"
                rounded="lg"
                p={6}
                border="1px solid"
                borderColor="border.subtle"
                shadow="card"
              >
                <Image
                  src={getImageUrl(displayProduct as ProductType)}
                  w="100%"
                  h="100%"
                  objectFit="contain"
                  data-testid="product-detail-image"
                />
              </Box>
            </AspectRatio>

            {/* Description section below image on desktop */}
            <Box
              mt={6}
              bg="bg.surface"
              rounded="lg"
              border="1px solid"
              borderColor="border.subtle"
              p={6}
              shadow="card"
            >
              <Heading as="h3" fontSize="xl" mb={3} color="text.primary">
                Description
              </Heading>
              <Text color="text.secondary" lineHeight={1.7} data-testid="product-description">
                {displayProduct.description}
              </Text>
            </Box>
          </Box>

          {/* Right: Product Details (40% on desktop, sticky) */}
          <Box flex="1" position={{ lg: "sticky" }} top={{ lg: "120px" }} h="fit-content">
            <Heading fontSize="2xl" mb={3} color="text.primary" data-testid="product-title">
              {displayProduct.title}
            </Heading>

            {/* Rating */}
            <Flex align="center" mb={4}>
              <MUIRating
                name="read-only-stars"
                value={4.1}
                precision={0.1}
                size="small"
                readOnly
              />
              <Text ml={1} fontSize="sm" color="text.secondary">
                256 Ratings
              </Text>
            </Flex>

            {/* Price */}
            <Flex align="center" mb={4}>
              <Text fontSize="3xl" fontWeight="bold" color="text.primary" data-testid="product-price">
                ${displayProduct.price}
              </Text>
            </Flex>

            {/* Size selector */}
            <Flex mb={4} gap={2} align="center">
              <Text color="text.primary" fontWeight="medium">Size:</Text>
              {["S", "M", "L", "XL"].map((size) => (
                <Tag
                  key={size}
                  bg="bg.surface"
                  border="1px solid"
                  borderColor="border.default"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ borderColor: "focus.ring", bg: "bg.subtle" }}
                  transition="all 0.2s"
                >
                  {size}
                </Tag>
              ))}
            </Flex>

            {/* Delivery options */}
            {productWithDelivery?.delivery_options &&
              productWithDelivery.delivery_options.length > 0 && (
                <Box mb={6} data-testid="delivery-section">
                  <DeliveryOptionsSelector
                    options={productWithDelivery.delivery_options}
                    productPrice={+displayProduct.price}
                    value={selectedDeliveryOption}
                    onChange={setSelectedDeliveryOption}
                  />
                </Box>
              )}

            {/* Action buttons */}
            <Flex gap={3} mb={6}>
              <Button
                variant="accent"
                size="lg"
                flex="1"
                onClick={() => {
                  const cartProduct = product || (displayProduct as ProductType);
                  addToCart(cartProduct as ProductType);
                }}
                isDisabled={displayProduct.inCart ? true : false}
                data-testid="add-to-cart"
                leftIcon={<Icon as={FaShoppingCart} />}
              >
                {displayProduct.inCart ? "Added to Cart" : "Add to Cart"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                minW="56px"
                w="56px"
                p={0}
                borderRadius="md"
                borderColor={displayProduct.isSaved ? "ink.600" : "border.default"}
                bg={displayProduct.isSaved ? "ink.600" : "transparent"}
                color={displayProduct.isSaved ? "white" : "text.secondary"}
                _hover={{
                  borderColor: "ink.600",
                  bg: displayProduct.isSaved ? "ink.700" : "bg.subtle",
                }}
                onClick={() => {
                  toast({
                    title: displayProduct.isSaved
                      ? "Product successfully removed from your saved items"
                      : "Product successfully added to your saved items",
                    status: "success",
                    duration: 1500,
                    isClosable: true,
                  });
                  toggleSaved(displayProduct.id);
                }}
                data-testid="save-button"
                aria-pressed={displayProduct.isSaved}
                aria-label={displayProduct.isSaved ? "Unsave" : "Save"}
              >
                <BookmarkIcon filled={displayProduct.isSaved} boxSize={5} />
              </Button>
            </Flex>
          </Box>
        </Flex>
      ) : (
        <Text color="text.secondary">No product found</Text>
      )}
    </Box>
  );
};

export default Product;
