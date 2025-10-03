import { Box, Button, Grid, GridItem, Heading, VStack, Text, Link, Divider } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import CartItem from "../components/CartItem/CartItem";
import CartItemMobile from "../components/CartItem/CartItemMobile";
import MotionBox from "../components/MotionBox";
import { useGlobalContext } from "../context/useGlobalContext";

const formatUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const Cart = () => {
  const { products, totalPrice } = useGlobalContext();
  const productsInCart = products.flatMap(product =>
    product.inCart === true ? product : []
  );

  return (
    <Box as="main" bg="sand.50" minH="100vh">
      {productsInCart.length > 0 ? (
        <Box maxW="container.xl" mx="auto" px={{ base: 4, md: 8 }} py={{ base: 6, md: 10 }}>
          <Heading 
            size="lg" 
            color="ink.900" 
            mb={{ base: 6, md: 8 }}
            fontSize={{ base: "2xl", md: "3xl" }}
            letterSpacing="-0.02em"
          >
            Your Cart
          </Heading>

          <Grid 
            templateColumns={{ base: "1fr", md: "2fr 1fr" }} 
            gap={{ base: 6, md: 12 }}
          >
            <GridItem>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                {/* Desktop items */}
                <Box display={{ base: "none", bigTablet: "block" }}>
                  <AnimatePresence>
                    {productsInCart.map((product, index) => (
                      <Box key={product.id}>
                        <CartItem product={product} />
                        {index < productsInCart.length - 1 && (
                          <Divider my={6} borderColor="charcoal.200" opacity={0.3} />
                        )}
                      </Box>
                    ))}
                  </AnimatePresence>
                </Box>

                {/* Mobile items */}
                <Box display={{ base: "block", bigTablet: "none" }}>
                  <AnimatePresence>
                    {productsInCart.map(product => (
                      <CartItemMobile key={product.id} product={product} />
                    ))}
                  </AnimatePresence>
                </Box>
              </VStack>
            </GridItem>

            <GridItem 
              position={{ md: "sticky" }} 
              top={{ md: "120px" }} 
              alignSelf="start"
              h="fit-content"
            >
              <Box
                bg="white"
                border="1px solid"
                borderColor="charcoal.200"
                rounded="md"
                p={{ base: 5, md: 6 }}
                shadow="sm"
              >
                <Heading 
                  size="md" 
                  color="ink.900" 
                  mb={5}
                  fontSize="xl"
                  fontWeight="semibold"
                >
                  Order Summary
                </Heading>

                <VStack spacing={3} mb={4} align="stretch">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Text color="charcoal.700" fontSize="sm">Subtotal</Text>
                    <Text color="ink.900" fontWeight="medium">{formatUSD(totalPrice)}</Text>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Text color="charcoal.700" fontSize="sm">Shipping</Text>
                    <Text color="charcoal.600" fontSize="sm">Calculated at checkout</Text>
                  </Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Text color="charcoal.700" fontSize="sm">Tax</Text>
                    <Text color="charcoal.600" fontSize="sm">—</Text>
                  </Box>
                </VStack>

                <Divider borderColor="charcoal.200" my={4} />

                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center"
                  py={2} 
                  mb={5}
                >
                  <Text color="ink.900" fontSize="lg" fontWeight="semibold">
                    Total
                  </Text>
                  <Text 
                    color="ink.900" 
                    fontSize="xl" 
                    fontWeight="semibold"
                    data-testid="cart-total"
                  >
                    {formatUSD(totalPrice)}
                  </Text>
                </Box>

                <VStack spacing={3} align="stretch">
                  <Button
                    w="full"
                    minH="48px"
                    bg="ink.900"
                    color="sand.50"
                    fontSize="md"
                    fontWeight="medium"
                    _hover={{ bg: "ink.800" }}
                    _active={{ bg: "ink.700" }}
                    _focus={{ 
                      boxShadow: "0 0 0 3px rgba(100, 116, 139, 0.4)",
                      outline: "none"
                    }}
                  >
                    Checkout
                  </Button>
                  <Link
                    as={RouterLink}
                    to="/"
                    _hover={{ textDecoration: "none" }}
                    w="full"
                  >
                    <Button
                      variant="ghost"
                      w="full"
                      minH="44px"
                      color="charcoal.700"
                      fontSize="md"
                      fontWeight="medium"
                      _hover={{ 
                        bg: "sand.100",
                        color: "ink.900"
                      }}
                      _focus={{ 
                        boxShadow: "0 0 0 3px rgba(100, 116, 139, 0.4)",
                        outline: "none"
                      }}
                    >
                      Continue Shopping
                    </Button>
                  </Link>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        </Box>
      ) : (
        <Box 
          maxW="container.xl" 
          mx="auto" 
          px={{ base: 4, md: 8 }} 
          py={{ base: 6, md: 10 }}
        >
          <MotionBox
            opacity={0}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            data-testid="empty-cart"
            textAlign="center"
            py={12}
          >
            <Heading size="md" color="ink.900" mb={3}>
              Your cart is empty
            </Heading>
            <Text color="charcoal.700" mb={6}>
              Discover our collection and find something you love
            </Text>
            <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
              <Button 
                variant="solid"
                bg="ink.900"
                color="sand.50"
                _hover={{ bg: "ink.800" }}
                minH="44px"
                px={8}
              >
                Continue Shopping
              </Button>
            </Link>
          </MotionBox>
        </Box>
      )}
    </Box>
  );
};

export default Cart;
