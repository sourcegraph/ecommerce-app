import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react'
import { getLastRequestId } from '../api/client'

interface Props {
  readonly children: ReactNode
}

interface State {
  readonly hasError: boolean
  readonly requestId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, requestId: null }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true, requestId: getLastRequestId() }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const requestId = getLastRequestId()
    console.error('ErrorBoundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      requestId,
      timestamp: new Date().toISOString(),
      userAgent: globalThis.navigator.userAgent,
      url: window.location.href,
    })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  handleGoHome = (): void => {
    window.location.href = '/'
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box 
          minH="100vh" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          bg="sand.50"
        >
          <VStack spacing={6} maxW="md" p={8} textAlign="center">
            <Heading size="lg" color="ink.900">
              Something went wrong
            </Heading>
            <Text color="ink.700">
              We encountered an unexpected error. Please try again or contact support.
            </Text>
            {this.state.requestId && (
              <Text fontSize="sm" color="ink.500" fontFamily="mono">
                Request ID: {this.state.requestId}
              </Text>
            )}
            <VStack spacing={3} w="full">
              <Button 
                onClick={this.handleReload} 
                colorScheme="blue" 
                w="full"
              >
                Reload Page
              </Button>
              <Button 
                onClick={this.handleGoHome} 
                variant="outline" 
                w="full"
              >
                Go to Home
              </Button>
            </VStack>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}
