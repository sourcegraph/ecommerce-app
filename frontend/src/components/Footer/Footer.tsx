import { Flex, Heading, Link, VStack } from '@chakra-ui/react'

import ContactDetails from '../ContactDetails'

const Footer = () => {
  return (
    <Flex
      as="footer"
      display={{ base: 'none', smallTablet: 'flex' }}
      bg="bg.footer"
      color="text.footer"
      pl={{ base: 16, md: '236px' }}
      pr={{ base: 16, md: 8 }}
      py={5}
      direction={{ base: 'column', sm: 'row' }}
      align={{ base: 'center', sm: 'flex-start' }}
      borderTop="1px solid"
      borderColor="border.footer"
    >
      <Flex mr={{ base: 0, sm: 32, md: 44 }} mb={8}>
        <Flex direction="column" mr={28}>
          <Heading
            as="h6"
            fontSize="md"
            mb={6}
            textTransform="uppercase"
            letterSpacing="0.05em"
            color="text.footer"
          >
            Pages
          </Heading>
          <VStack spacing={3} fontSize="sm" align="initial">
            <Link
              fontWeight={500}
              color="text.footer"
              _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Home
            </Link>
            <Link
              fontWeight={500}
              color="text.footer"
              _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Product
            </Link>
            <Link
              fontWeight={500}
              color="text.footer"
              _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Pricing
            </Link>
            <Link
              fontWeight={500}
              color="text.footer"
              _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              About
            </Link>
            <Link
              fontWeight={500}
              color="text.footer"
              _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
            >
              Contact
            </Link>
          </VStack>
        </Flex>
        <Flex direction="column">
          <Heading
            as="h6"
            fontSize="md"
            mb={6}
            textTransform="uppercase"
            letterSpacing="0.05em"
            color="text.footer"
          >
            Top Designer Brands
          </Heading>
          <Flex>
            <VStack spacing={3} fontSize="sm" align="initial" mr={16}>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Eleanor Edwards
              </Link>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Ted Robertson
              </Link>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Annette Russell
              </Link>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Jennie Mckinney
              </Link>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Gloria Richards
              </Link>
            </VStack>
            <VStack spacing={3} fontSize="sm" align="initial">
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Philip Jones
              </Link>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Product
              </Link>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Colleen Russell
              </Link>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Marvin Hawkins
              </Link>
              <Link
                fontWeight={500}
                color="text.footer"
                _hover={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
              >
                Bruce Simmons
              </Link>
            </VStack>
          </Flex>
        </Flex>
      </Flex>
      <ContactDetails />
    </Flex>
  )
}

export default Footer
