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
import { ReactNode, useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useGlobalContext } from "../context/useGlobalContext";
import MUIBadge from "./MUI/MUIBadge";
import Tab from "./Tab";
import { api } from "../api/client";
import { Category, DeliveryOption } from "../api/types";

type Props = {
  children: ReactNode;
};

const Main = ({ children }: Props) => {
  const { savedItemsCount } = useGlobalContext();
  const [isLargerThan567] = useMediaQuery("(min-width: 567px)");
  const location = useLocation();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCat = searchParams.get("cat") || "";
  const selectedDeliv = searchParams.get("deliv") || "";
  const sort = searchParams.get("sort") || "";

  // Load categories and delivery options
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, delivs] = await Promise.all([
          api.getCategories(),
          api.getDeliveryOptions()
        ]);
        if (!mounted) return;
        setCategories(cats);
        setDeliveryOptions(delivs);
      } catch (error) {
        console.error("Failed to load filter options:", error);
      }
    })();
    return () => { mounted = false; };
  }, []);



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
              value={selectedCat}
              onChange={(e) => {
                const next = new globalThis.URLSearchParams(searchParams);
                const v = e.target.value;
                if (v) {
                  next.set("cat", v);
                } else {
                  next.delete("cat");
                }
                setSearchParams(next);
              }}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl w="fit-content">
            <Select
              minW="fit-content"
              size={isLargerThan567 ? "sm" : "xs"}
              rounded="base"
              borderColor="gray.400"
              cursor="pointer"
              value={selectedDeliv}
              onChange={(e) => {
                const next = new globalThis.URLSearchParams(searchParams);
                const v = e.target.value;
                if (v) {
                  next.set("deliv", v);
                } else {
                  next.delete("deliv");
                }
                setSearchParams(next);
              }}
            >
              <option value="">All</option>
              {deliveryOptions.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl w="fit-content">
            <Select
              minW="fit-content"
              size={isLargerThan567 ? "sm" : "xs"}
              rounded="base"
              borderColor="gray.400"
              cursor="pointer"
              value={sort}
              onChange={(e) => {
                const next = new globalThis.URLSearchParams(searchParams);
                const v = e.target.value;
                if (v) {
                  next.set("sort", v);
                } else {
                  next.delete("sort");
                }
                setSearchParams(next);
              }}
            >
              <option value="created_desc">Best selling</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="delivery_fastest">Fastest Delivery</option>
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
