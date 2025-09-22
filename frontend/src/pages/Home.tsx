import { HStack, Tag, Text } from "@chakra-ui/react";
import LoadingProduct from "../components/Loading/LoadingProduct";
import Main from "../components/Main";
import ProductCard from "../components/ProductCard";
import ProductsGrid from "../components/ProductsGrid";
import { useGlobalContext } from "../context/useGlobalContext";
import { searchTags } from "../mockDB/db";
import { useFilteredProducts } from "../hooks/useFilteredProducts";

const Home = () => {
  const { isLoading: globalLoading } = useGlobalContext();
  const { products, loading: filterLoading } = useFilteredProducts();
  
  return (
    <Main>
      <HStack p={3} mb={5} spacing={2} flexWrap="wrap">
        <Text fontWeight="bold" fontSize="sm" mr={3}>
          Related
        </Text>
        {searchTags.map((tag, i) => (
          <Tag key={i} size="sm" bg="blackAlpha.200" rounded="full" m={1}>
            {tag}
          </Tag>
        ))}
      </HStack>
      <ProductsGrid>
        {filterLoading
          ? Array(20)
              .fill("")
              .map((_, i) => <LoadingProduct key={i} />)
          : products.map((product, index) => <ProductCard key={`${product.id}-${index}`} product={product} />)}
      </ProductsGrid>
    </Main>
  );
};

export default Home;
