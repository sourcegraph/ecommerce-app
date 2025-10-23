import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

import colors from './foundations/colors'
import semanticTokens from './foundations/semantic-tokens'
import { fonts, textStyles } from './foundations/typography'
import breakpoints from './foundations/breakpoints'
import { radii, shadows } from './foundations/spacing'

import { Button } from './components/button'
import { Input } from './components/input'
import { Select, Textarea, Checkbox, Radio, Switch } from './components/form'
import { Heading, Text, Link } from './components/typography'
import { Container } from './components/layout'
import { Badge, Tag, Alert, Skeleton, Tooltip } from './components/feedback'
import { Modal, Drawer, Popover, Menu } from './components/overlay'
import { Tabs } from './components/tabs'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  breakpoints,
  fonts,
  colors,
  semanticTokens,
  radii,
  shadows,
  textStyles,
  styles: {
    global: {
      body: {
        bg: 'bg.page',
        color: 'text.primary',
        letterSpacing: '0.01em',
      },
      '@media (prefers-reduced-motion: reduce)': {
        '*': {
          animationDuration: '0.01ms !important',
          animationIterationCount: '1 !important',
          transitionDuration: '0.01ms !important',
        },
      },
    },
  },
  components: {
    Alert,
    Badge,
    Button,
    Checkbox,
    Container,
    Drawer,
    Heading,
    Input,
    Link,
    Menu,
    Modal,
    Popover,
    Radio,
    Select,
    Skeleton,
    Switch,
    Tabs,
    Tag,
    Text,
    Textarea,
    Tooltip,
  },
})

export default theme
