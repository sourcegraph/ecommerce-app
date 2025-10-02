import { Stack } from "@chakra-ui/react";
import MUISkeleton from "../MUI/MUISkeleton";

const LoadingProduct = () => {
  return (
    <Stack h="420px" w="100%" maxW="280px" data-testid="loading">
      <MUISkeleton height="140px" style={{ transform: "none" }} animation={false} />
      <MUISkeleton height="80px" style={{ transform: "none" }} animation={false} />
      <MUISkeleton
        variant="text"
        width="60%"
        style={{ transform: "none" }}
        animation={false}
      />
    </Stack>
  );
};

export default LoadingProduct;
