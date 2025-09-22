import { ChevronRightIcon } from "@chakra-ui/icons";

import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  Image,
  Stack,
  StackDivider,
  Tag,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { BsHeart as HeartIcon, BsHeartFill as HeartIconFill } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { Link as RouterLink, useParams } from "react-router-dom";
import ProgressLine from "../components/Loading/ProgressLine";
import MUIRating from "../components/MUI/MUIRating";
import { DeliveryOptionsSelector } from "../components/Delivery";
import { useGlobalContext } from "../context/useGlobalContext";
import { getImageUrl, ProductType, DeliveryOption } from "../context/GlobalState";

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
  // Use the product with delivery options if available, otherwise fallback to product from context
  const displayProduct = productWithDelivery || product;

  return isLoading || isLoadingProduct ? (
    <ProgressLine />
  ) : (
    <Box p={3}>
      <Breadcrumb
        fontSize="sm"
        spacing="8px"
        mb={6}
        color="gray.500"
        separator={<ChevronRightIcon color="gray.500" />}
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Product</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      {displayProduct ? (
        <Box maxW="640px">
          <Stack
            direction={{ base: "column", smallTablet: "row" }}
            spacing={4}
            m={2}
            mb={8}
            divider={<StackDivider borderColor="blackAlpha.300" borderWidth="2px" />}
          >
            <Flex align="center" justify="center" w="220px" h="220px" m="auto">
              <Image 
                src={getImageUrl(displayProduct as ProductType)} 
                maxW="100%" 
                maxH="100%" 
                objectFit="contain" 
                bg="white" 
                borderRadius="md"
                style={{ backgroundColor: 'white' }} 
              />
            </Flex>
            <Box>
              <Heading fontSize="2xl" mb={4}>
                {displayProduct.title}
              </Heading>
              <Flex align="center" mb={3}>
                <MUIRating
                  name="read-only-stars"
                  value={
                    displayProduct.id === 1 ||
                    displayProduct.id === 4 ||
                    displayProduct.id === 7 ||
                    displayProduct.id === 10 ||
                    displayProduct.id === 12 ||
                    displayProduct.id === 16 ||
                    displayProduct.id === 19
                      ? 4.7
                      : 4.1
                  }
                  precision={0.1}
                  size="small"
                  readOnly
                />
                <Text ml={1} fontSize="sm">
                  256 Ratings
                </Text>
              </Flex>
              <Flex mb={2}>
                <Text mr={2}>Size:</Text>{" "}
                <Tag bg="blackAlpha.200" borderRadius="none" mx={1}>
                  S
                </Tag>
                <Tag bg="blackAlpha.200" borderRadius="none" mx={1}>
                  M
                </Tag>
                <Tag bg="blackAlpha.200" borderRadius="none" mx={1}>
                  L
                </Tag>
                <Tag bg="blackAlpha.200" borderRadius="none" mx={1}>
                  XL
                </Tag>
              </Flex>
              <Flex align="center" mb={3}>
                <Text fontSize="2xl" fontWeight="bold">
                  ${displayProduct.price}{" "}
                  <Box
                    as="span"
                    textDecoration="line-through"
                    color="blackAlpha.500"
                    fontSize="lg"
                  >
                    {displayProduct.id === 1 ||
                    displayProduct.id === 4 ||
                    displayProduct.id === 7 ||
                    displayProduct.id === 10 ||
                    displayProduct.id === 12 ||
                    displayProduct.id === 16 ||
                    displayProduct.id === 19
                      ? +displayProduct.price * 2
                      : null}
                  </Box>
                </Text>
                <Badge
                  ml={4}
                  h="fit-content"
                  textTransform="uppercase"
                  colorScheme="green"
                >
                  {displayProduct.id === 1 ||
                  displayProduct.id === 4 ||
                  displayProduct.id === 7 ||
                  displayProduct.id === 10 ||
                  displayProduct.id === 12 ||
                  displayProduct.id === 16 ||
                  displayProduct.id === 19
                    ? "-50%"
                    : null}
                </Badge>
              </Flex>
              {/* Delivery Options */}
              {productWithDelivery?.delivery_options && productWithDelivery.delivery_options.length > 0 && (
                <Box mb={4}>
                  <DeliveryOptionsSelector
                    options={productWithDelivery.delivery_options}
                    productPrice={+displayProduct.price}
                    value={selectedDeliveryOption}
                    onChange={setSelectedDeliveryOption}
                  />
                </Box>
              )}

              <HStack spacing={3}>
                <Button
                  colorScheme="red"
                  onClick={() => {
                    // Use the fallback product for cart operations since that's what the context expects
                    const cartProduct = product || (displayProduct as ProductType);
                    addToCart(cartProduct as ProductType);
                  }}
                  isDisabled={displayProduct.inCart ? true : false}
                >
                  <Icon as={FaShoppingCart} mr={3} />
                  {displayProduct.inCart ? "Added to Cart" : "Add to Cart"}
                </Button>
                <Button
                  colorScheme="appBlue"
                  variant="outline"
                  height={9}
                  minW={9}
                  w={9}
                  fontSize="2xl"
                  px={2}
                  borderRadius="full"
                  border={displayProduct.isSaved ? "none" : "1px solid"}
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
                >
                  {displayProduct.isSaved ? <HeartIconFill /> : <HeartIcon />}
                </Button>
              </HStack>
            </Box>
          </Stack>
          <Box
            boxShadow="base"
            rounded="md"
            border="1px solid"
            borderColor="gray.200"
            p={3}
          >
            <Heading as="h3" fontSize="2xl" mb={2}>
              Description
            </Heading>
            <Text>{displayProduct.description}</Text>
          </Box>
        </Box>
      ) : (
        <Text>No product found</Text>
      )}
    </Box>
  );
};

export default Product;
