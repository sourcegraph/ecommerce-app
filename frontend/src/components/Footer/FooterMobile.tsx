import {
  Box,
  Flex,
  Heading,
  Link,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'

import ContactDetails from '../ContactDetails'

const FooterMobile = () => {
  return (
    <Flex
      as="footer"
      display={{ base: 'flex', smallTablet: 'none' }}
      bg="bg.footer"
      color="text.footer"
      pb={8}
      direction="column"
      borderTop="1px solid"
      borderColor="border.footer"
    >
      <Accordion allowToggle mb={8}>
        <AccordionItem borderTop="none" py={2}>
          <AccordionButton color="text.footerMuted" _expanded={{ color: 'text.footer' }}>
            <Box flex="1" textAlign="left">
              <Heading
                as="h6"
                fontSize="md"
                textTransform="uppercase"
                letterSpacing="0.05em"
                color="inherit"
              >
                Pages
              </Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
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
          </AccordionPanel>
        </AccordionItem>
        <AccordionItem borderColor="border.footer" py={2}>
          <AccordionButton color="text.footerMuted" _expanded={{ color: 'text.footer' }}>
            <Box flex="1" textAlign="left">
              <Heading
                as="h6"
                fontSize="md"
                textTransform="uppercase"
                letterSpacing="0.05em"
                color="inherit"
              >
                Top Designer Brands
              </Heading>
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            <VStack spacing={3} fontSize="sm" align="initial">
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
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <ContactDetails />
    </Flex>
  )
}

export default FooterMobile
