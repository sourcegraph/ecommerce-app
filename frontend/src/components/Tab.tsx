import { Tab } from "@chakra-ui/react";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  mediaQuery: boolean;
  children: ReactNode;
  navigatePath: string;
  testId?: string;
};
export default function TabComponent({ mediaQuery, children, navigatePath, testId }: Props) {
  const navigate = useNavigate();
  return (
    <Tab
      _selected={{
        color: "focus.ring",
        bg: "white",
        rounded: "base",
        boxShadow: "base",
      }}
      fontSize={mediaQuery ? "sm" : "xs"}
      onClick={() => {
        navigate(navigatePath);
      }}
      data-testid={testId}
    >
      {children}
    </Tab>
  );
}
