import Badge from '@mui/material/Badge'
import { ThemeProvider } from '@mui/material/styles'
import { ReactNode } from 'react'
import { muiTheme } from '../../theme/mui-theme'

type Props = {
  badgeContent?: number
  children: ReactNode
  testId?: string
}

const MUIBadge = ({ badgeContent, children, testId = 'cart-count' }: Props) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <Badge badgeContent={badgeContent} color="secondary" data-testid={testId}>
        {children}
      </Badge>
    </ThemeProvider>
  )
}

export default MUIBadge
