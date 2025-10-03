import { Icon, IconProps } from "@chakra-ui/react";

interface BookmarkIconProps extends IconProps {
  readonly filled?: boolean;
}

export const BookmarkIcon = ({ filled = false, ...props }: BookmarkIconProps) => {
  return (
    <Icon viewBox="0 0 24 24" {...props}>
      {filled ? (
        <path
          fill="currentColor"
          d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"
        />
      ) : (
        <path
          fill="currentColor"
          d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"
        />
      )}
    </Icon>
  );
};
