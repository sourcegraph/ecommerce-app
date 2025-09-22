import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Select,
  TabList,
  Tabs,
  useMediaQuery,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useGlobalContext } from "../context/useGlobalContext";
import MUIBadge from "./MUI/MUIBadge";
import Tab from "./Tab";

type Props = {
  children: ReactNode;
};

const Main = ({ children }: Props) => {
  const { savedItemsCount, filters, setFilter } = useGlobalContext();
  const [isLargerThan567] = useMediaQuery("(min-width: 567px)");
  const location = useLocation();

  return (
    <Box
      as="main"
      boxShadow="base"
      mx={{ base: 0, sm: 4 }}
      h="100%"
      rounded="md"
      border="1px solid"
      borderColor="gray.200"
    >
      <Flex p={3} pb={0} align="flex-end" justify="space-between" flexWrap="wrap">
        <HStack align="flex-end" mr={5} mb={5}>
          <FormControl w="fit-content">
            <FormLabel textTransform="uppercase" fontSize="x-small" w="fit-content">
              Sort by
            </FormLabel>
            <Select
              minW="fit-content"
              size={isLargerThan567 ? "sm" : "xs"}
              rounded="base"
              borderColor="gray.500"
              cursor="pointer"
              value={filters.category}
              onChange={(e) => setFilter('category', e.target.value)}
              data-testid="category-filter"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="home">Home</option>
            </Select>
          </FormControl>
          <FormControl w="fit-content">
            <Select
              minW="fit-content"
              size={isLargerThan567 ? "sm" : "xs"}
              rounded="base"
              borderColor="gray.400"
              cursor="pointer"
              value={filters.shipping}
              onChange={(e) => setFilter('shipping', e.target.value)}
              data-testid="shipping-filter"
            >
              <option value="">All Shipping</option>
              <option value="free">Free Shipping ($50+)</option>
              <option value="express">Express ($100+)</option>
              <option value="standard">Standard (Under $100)</option>
            </Select>
          </FormControl>
          <FormControl w="fit-content">
            <Select
              minW="fit-content"
              size={isLargerThan567 ? "sm" : "xs"}
              rounded="base"
              borderColor="gray.400"
              cursor="pointer"
              value={filters.delivery}
              onChange={(e) => setFilter('delivery', e.target.value)}
              data-testid="delivery-filter"
            >
              <option value="">All Delivery</option>
              <option value="same-day">Same Day</option>
              <option value="next-day">Next Day</option>
              <option value="3-5-days">3-5 Days</option>
            </Select>
          </FormControl>
        </HStack>
        <Flex align="center">
          <Tabs
            variant="unstyled"
            size="sm"
            mb={5}
            defaultIndex={
              location.pathname === "/"
                ? 0
                : location.pathname === "/saved"
                ? 1
                : undefined
            }
          >
            <TabList bg="appBlue.50" rounded="md">
              <Tab mediaQuery={isLargerThan567} navigatePath="/">
                Show All
              </Tab>
              <Tab mediaQuery={isLargerThan567} navigatePath="/saved">
                <MUIBadge badgeContent={savedItemsCount} testId="saved-count">Saved</MUIBadge>
              </Tab>
              <Tab mediaQuery={isLargerThan567} navigatePath="/cart">
                Buy now
              </Tab>
            </TabList>
          </Tabs>
        </Flex>
      </Flex>
      {children}
    </Box>
  );
};

export default Main;
