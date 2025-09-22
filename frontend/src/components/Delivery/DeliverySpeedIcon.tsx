import { Icon } from "@chakra-ui/react";
import { 
  TruckIcon, 
  BoltIcon, 
  CalendarDaysIcon, 
  ClockIcon 
} from "@heroicons/react/24/outline";

type DeliverySpeed = "standard" | "express" | "next_day" | "same_day";

interface DeliverySpeedIconProps {
  speed: DeliverySpeed;
  size?: string | number;
}

export const DeliverySpeedIcon = ({ speed, size = "16px" }: DeliverySpeedIconProps) => {
  const iconProps = { boxSize: size };

  switch (speed) {
    case "standard":
      return <Icon as={TruckIcon} {...iconProps} color="gray.500" />;
    case "express":
      return <Icon as={BoltIcon} {...iconProps} color="blue.500" />;
    case "next_day":
      return <Icon as={CalendarDaysIcon} {...iconProps} color="orange.500" />;
    case "same_day":
      return <Icon as={ClockIcon} {...iconProps} color="red.500" />;
    default:
      return <Icon as={TruckIcon} {...iconProps} color="gray.500" />;
  }
};
