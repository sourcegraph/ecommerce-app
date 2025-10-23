import { HamburgerIcon } from '@chakra-ui/icons'
import { Avatar, Box, Button, Flex, HStack, Icon, Link, useDisclosure } from '@chakra-ui/react'
import { useRef } from 'react'
import { FaShoppingCart } from 'react-icons/fa'
import { Route, Link as RouterLink, Routes, useLocation } from 'react-router-dom'
import { useGlobalContext } from '../context/useGlobalContext'
import Logo from './Logo'
import MUIBadge from './MUI/MUIBadge'
import SearchBar from './SearchBar'
import SidebarMobile from './Sidebar/SidebarMobile'

const Header = () => {
  const { cartItemCount } = useGlobalContext()

  const location = useLocation()
  const hamburgerRef = useRef<SVGSVGElement>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Flex
      as="header"
      direction="column"
      height={{ base: '100px', sm: 'fit-content' }}
      px={{ base: 4, md: 6 }}
      position="fixed"
      top={0}
      zIndex={10}
      w="100%"
      bg="bg.page"
      backdropFilter="saturate(180%) blur(8px)"
      borderBottom="1px solid"
      borderColor="border.subtle"
      boxShadow="header"
      sx={{
        '@supports (backdrop-filter: blur(8px))': {
          bg: 'rgba(250, 250, 249, 0.85)',
        },
      }}
    >
      <Flex
        height="65px"
        align="center"
        px={{ sm: 2 }}
        py={{ base: 3, sm: 4 }}
        justify="space-between"
      >
        <Flex align="center">
          <HamburgerIcon
            display={{ base: 'inline-block', sm: 'none' }}
            color="ink.800"
            w="1.5rem"
            h="1.5rem"
            mr={2}
            cursor="pointer"
            ref={hamburgerRef}
            onClick={onOpen}
            _hover={{ color: 'ink.600' }}
          />
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
        </Flex>
        <SearchBar display={{ base: 'none', sm: 'block' }} />
        <Flex justify="space-between" align="center">
          <HStack spacing={{ base: 3, sm: 5 }}>
            <Link
              as={RouterLink}
              to={location.pathname === '/login' ? '/register' : '/login'}
              _hover={{ textDecoration: 'none' }}
            >
              <Button
                height={{ base: 8, sm: 9 }}
                minW={{ base: 8, sm: 9 }}
                fontSize={{ base: 'sm', sm: 'md' }}
                variant="ghost"
              >
                {location.pathname === '/login' ? 'Sign Up' : 'Sign In'}
              </Button>
            </Link>
            <Box
              mr={
                location.pathname === '/login' || location.pathname === '/register' ? 2 : undefined
              }
            >
              <Link
                as={RouterLink}
                to="/cart"
                _hover={{ textDecoration: 'none' }}
                data-testid="cart-link"
              >
                <MUIBadge badgeContent={cartItemCount}>
                  <Icon
                    as={FaShoppingCart}
                    height={{ base: 25, smallTablet: 27, sm: 30 }}
                    width={{ base: 25, smallTablet: 27, sm: 30 }}
                    color="ink.500"
                    cursor="pointer"
                    _hover={{ color: 'ink.600' }}
                    _active={{ color: 'ink.700' }}
                  />
                </MUIBadge>
              </Link>
            </Box>
          </HStack>
          <Routes>
            {/* Show the avatar on every route except "/login" and "/register" */}
            <Route path="/login" element={null} />
            <Route path="/register" element={null} />
            <Route
              path="*"
              element={
                <Avatar
                  ml={cartItemCount > 0 ? { base: 5, sm: 7 } : { base: 3, sm: 5 }}
                  width={{ base: 7, sm: 8 }}
                  height={{ base: 7, sm: 8 }}
                  cursor="pointer"
                  border="1px solid"
                  borderColor="border.subtle"
                />
              }
            />
          </Routes>
        </Flex>
      </Flex>
      <SearchBar display={{ base: 'block', sm: 'none' }} />
      <SidebarMobile isOpen={isOpen} onClose={onClose} hamburgerRef={hamburgerRef} />
    </Flex>
  )
}

export default Header
