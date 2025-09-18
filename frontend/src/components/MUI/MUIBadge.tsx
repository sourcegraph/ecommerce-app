import Badge from "@mui/material/Badge";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ReactNode } from "react";

type Props = {
  badgeContent?: number;
  children: ReactNode;
  testId?: string;
};

const theme = createTheme();

const MUIBadge = ({ badgeContent, children, testId = "cart-count" }: Props) => {
  return (
    <ThemeProvider theme={theme}>
      <Badge badgeContent={badgeContent} color="secondary" data-testid={testId}>
        {children}
      </Badge>
    </ThemeProvider>
  );
};

export default MUIBadge;
