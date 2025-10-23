import { Rating, RatingProps } from '@mui/material'
import { ThemeProvider } from '@mui/material/styles'
import { muiTheme } from '../../theme/mui-theme'

const MUIRating = (props: RatingProps) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <Rating {...props} />
    </ThemeProvider>
  )
}

export default MUIRating
