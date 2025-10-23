import { chakra, Flex, HStack, Link, Stack, Text } from '@chakra-ui/react'

import { FaFacebook, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { IoMdPhonePortrait } from 'react-icons/io'
import { VscLocation } from 'react-icons/vsc'

// Give the components chakra props
const LocationIcon = chakra(VscLocation)
const PhoneIcon = chakra(IoMdPhonePortrait)
const TwitterIcon = chakra(FaTwitter)
const FbIcon = chakra(FaFacebook)
const LinkedinIcon = chakra(FaLinkedin)

const ContactDetails = () => {
  return (
    <Flex direction="column" align={{ base: 'center', sm: 'initial' }}>
      <Stack direction={{ base: 'row', sm: 'column' }} spacing={4} mb={{ base: 5, sm: 8 }}>
        <HStack spacing={2}>
          <LocationIcon color="icon.footer" size={24} />
          <Text fontSize="sm" color="text.footer">
            7480 Mockingbird Hill
          </Text>
        </HStack>
        <HStack spacing={2}>
          <PhoneIcon color="icon.footer" size={24} />
          <Text fontSize="sm" color="text.footer">
            (239) 555-0108
          </Text>
        </HStack>
      </Stack>
      <HStack spacing={6}>
        <Link>
          <TwitterIcon
            color="icon.footer"
            _hover={{ color: 'icon.footerHover' }}
            transition="color 150ms ease"
            size={24}
          />
        </Link>
        <Link>
          <FbIcon
            color="icon.footer"
            _hover={{ color: 'icon.footerHover' }}
            transition="color 150ms ease"
            size={24}
          />
        </Link>
        <Link>
          <LinkedinIcon
            color="icon.footer"
            _hover={{ color: 'icon.footerHover' }}
            transition="color 150ms ease"
            size={24}
          />
        </Link>
      </HStack>
    </Flex>
  )
}

export default ContactDetails
