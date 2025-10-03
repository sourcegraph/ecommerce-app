import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Image,
  Link,
  VStack,
  Text,
  Skeleton,
  IconButton,
} from "@chakra-ui/react";
import { useState } from "react";
import { BiTrash } from "react-icons/bi";
import { Link as RouterLink } from "react-router-dom";
import { ProductInCart, getImageUrl } from "../../context/GlobalState";
import { useGlobalContext } from "../../context/useGlobalContext";
import MotionBox from "../MotionBox";

type Props = {
  product: ProductInCart;
};

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const CartItemMobile = ({ product }: Props) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const subTotal = +product.price * +product.quantity;

  const { deleteFromCart, incrementQty, decrementQty, toggleSaved } = useGlobalContext();

  return (
    <MotionBox
      display={{ base: "block", bigTablet: "none" }}
      opacity={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      mb={4}
    >
      <Box
        bg="white"
        border="1px solid"
        borderColor="charcoal.200"
        rounded="md"
        p={4}
        data-testid="cart-item"
      >
        <HStack align="flex-start" spacing={4} mb={4}>
          <Box
            w="96px"
            h="96px"
            bg="sand.100"
            border="1px solid"
            borderColor="sand.300"
            rounded="lg"
            overflow="hidden"
            flexShrink={0}
          >
            <Skeleton
              isLoaded={imgLoaded}
              fadeDuration={0.2}
              w="100%"
              h="100%"
              startColor="sand.200"
              endColor="charcoal.100"
            >
              <Image
                src={getImageUrl(product)}
                alt={product.title}
                w="100%"
                h="100%"
                objectFit="contain"
                onLoad={() => setImgLoaded(true)}
              />
            </Skeleton>
          </Box>

          <VStack align="flex-start" spacing={2} flex={1} minW={0}>
            <Link
              as={RouterLink}
              to={`/products/${product.id}`}
              color="ink.900"
              fontWeight="semibold"
              fontSize="md"
              _hover={{ textDecoration: "underline" }}
              noOfLines={2}
            >
              {product.title}
            </Link>

            <Text color="ink.900" fontWeight="medium" fontSize="md">
              {formatUSD(subTotal)}
            </Text>

            <Text fontSize="xs" color="charcoal.600">
              {formatUSD(+product.price)} each
            </Text>
          </VStack>
        </HStack>

        <HStack justify="space-between" align="center" pt={3} borderTop="1px solid" borderColor="charcoal.200">
          <HStack spacing={3}>
            <IconButton
              icon={<MinusIcon />}
              aria-label="Decrease quantity"
              size="sm"
              variant="outline"
              borderColor="sand.300"
              isDisabled={+product.quantity === 1}
              onClick={() => decrementQty(product.id)}
              _hover={{ bg: "sand.100" }}
              _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
              data-testid="decrement-qty"
            />
            <Text fontSize="md" minW="24px" textAlign="center" fontWeight="medium" data-testid="quantity-display">
              {product.quantity}
            </Text>
            <IconButton
              icon={<AddIcon />}
              aria-label="Increase quantity"
              size="sm"
              variant="outline"
              borderColor="sand.300"
              isDisabled={+product.quantity === 10}
              onClick={() => incrementQty(product.id)}
              _hover={{ bg: "sand.100" }}
              _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
              data-testid="increment-qty"
            />
          </HStack>

          <HStack spacing={2}>
            <Button
              variant="link"
              size="sm"
              color="charcoal.700"
              fontWeight="normal"
              _hover={{ color: "ink.900" }}
              onClick={() => {
                toggleSaved(product.id);
              }}
            >
              {product.isSaved ? "Unsave" : "Save"}
            </Button>
            <Button
              variant="link"
              size="sm"
              color="charcoal.700"
              fontWeight="normal"
              leftIcon={<BiTrash />}
              _hover={{ color: "ink.900" }}
              onClick={() => deleteFromCart(product.id)}
              data-testid="remove-item"
            >
              Remove
            </Button>
          </HStack>
        </HStack>
      </Box>
    </MotionBox>
  );
};

export default CartItemMobile;
