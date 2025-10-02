import { Box, Text, HStack } from "@chakra-ui/react";

const Logo = () => {
  return (
    <HStack spacing={2} align="center">
      <Box
        width="24px"
        height="24px"
        position="relative"
        display={{ base: "none", sm: "block" }}
      >
        <Box
          position="absolute"
          bottom={0}
          left={0}
          width="16px"
          height="2px"
          bg="ink.900"
        />
        <Box
          position="absolute"
          bottom={0}
          left={0}
          width="2px"
          height="16px"
          bg="ink.900"
        />
      </Box>

      <Box>
        <Text
          fontSize={{ base: "lg", sm: "xl" }}
          fontWeight="700"
          letterSpacing="0.1em"
          color="ink.900"
          lineHeight="1"
        >
          LINEA
        </Text>
        <Text
          fontSize={{ base: "2xs", sm: "xs" }}
          fontWeight="400"
          letterSpacing="0.05em"
          color="ink.600"
          lineHeight="1"
          mt="2px"
        >
          Supply
        </Text>
      </Box>
    </HStack>
  );
};

export default Logo;
