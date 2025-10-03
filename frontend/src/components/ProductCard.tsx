import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  LinkBox,
  LinkOverlay,
  Skeleton,
  Text,
  AspectRatio,
} from "@chakra-ui/react";
import { FaShoppingCart } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import { useGlobalContext } from "../context/useGlobalContext";
import MUIRating from "./MUI/MUIRating";
import MotionBox from "./MotionBox";
import { DeliveryOptionsSummary } from "./Delivery";
import { useState } from "react";
import { ProductType, getImageUrl } from "../context/GlobalState";
import { BookmarkIcon } from "./Icons/BookmarkIcon";

type Props = {
  product: ProductType;
  className?: string;
};

const ProductCard = ({ product }: Props) => {
  const { addToCart, toggleSaved } = useGlobalContext();
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <MotionBox
      as="article"
      bg="bg.card"
      rounded="lg"
      overflow="hidden"
      border="1px solid"
      borderColor="border.subtle"
      position="relative"
      boxShadow="card"
      shadow="cardHover"
      transition="box-shadow 200ms ease-in-out"
      whileHover={{
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
      }}
      data-testid="product-card"
    >
      <LinkBox>
        <AspectRatio ratio={1}>
          <Box bg="bg.image" p={4} position="relative">
            <Skeleton
              isLoaded={imgLoaded}
              w="100%"
              h="100%"
              startColor="sand.50"
              endColor="sand.100"
            >
              <Image
                src={getImageUrl(product)}
                alt={product.title}
                objectFit="contain"
                w="100%"
                h="100%"
                onLoad={() => setImgLoaded(true)}
              />
            </Skeleton>

            <Button
              position="absolute"
              top={2}
              right={2}
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                toggleSaved(product.id);
              }}
              bg="sand.200"
              _hover={{ bg: "sand.50" }}
              data-testid="save-button"
              aria-pressed={product.isSaved}
              aria-label={product.isSaved ? "Unsave" : "Save"}
              zIndex={1}
            >
              <BookmarkIcon 
                filled={product.isSaved} 
                boxSize={4} 
                color="ink.600" 
              />
            </Button>
          </Box>
        </AspectRatio>

        <Flex direction="column" p={4} gap={2}>
          <LinkOverlay as={RouterLink} to={`/products/${product.id}`}>
            <Text
              fontSize="md"
              fontWeight="600"
              color="ink.900"
              noOfLines={2}
              minH="48px"
              _hover={{ color: "ink.600" }}
              data-testid="product-title"
            >
              {product.title}
            </Text>
          </LinkOverlay>

          <Flex align="center" gap={1}>
            <MUIRating
              name={`rating-${product.id}`}
              value={4.1}
              precision={0.1}
              size="small"
              readOnly
            />
            <Text fontSize="xs" color="ink.500">
              (256)
            </Text>
          </Flex>

          <Flex align="baseline" gap={2}>
            <Text fontSize="xl" fontWeight="bold" color="ink.900" data-testid="product-price">
              ${product.price}
            </Text>
          </Flex>

          {product.delivery_summary && (
            <DeliveryOptionsSummary summary={product.delivery_summary} />
          )}

          <Button
            variant="accent"
            size="md"
            mt={2}
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            isDisabled={product.inCart}
            leftIcon={<Icon as={FaShoppingCart} />}
            data-testid="add-to-cart"
          >
            {product.inCart ? "Added" : "Add to Cart"}
          </Button>
        </Flex>
      </LinkBox>
    </MotionBox>
  );
};

export default ProductCard;
