import { Grid } from "@chakra-ui/react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const ProductsGrid = ({ children }: Props) => {
  return (
    <Grid
      templateColumns={{
        base: "repeat(1, 1fr)",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
        lg: "repeat(4, 1fr)",
      }}
      gap={{ base: 4, md: 6 }}
      w="100%"
      data-testid="products-grid"
    >
      {children}
    </Grid>
  );
};

export default ProductsGrid;
