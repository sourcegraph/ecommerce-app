import { Box, Text } from "@chakra-ui/react";
import { DeliverySummary } from "../../context/GlobalState";

interface DeliveryOptionsSummaryProps {
  summary?: DeliverySummary | null;
}

const formatPrice = (price: number): string => {
  return price === 0 ? "Free" : `$${price.toFixed(2)}`;
};

const formatEta = (min: number, max: number): string => {
  if (min === max) {
    return min === 0 ? "Same day" : min === 1 ? "1 day" : `${min} days`;
  }
  return `${min}–${max} days`;
};

export const DeliveryOptionsSummary = ({ summary }: DeliveryOptionsSummaryProps) => {
  if (!summary) return null;

  if (summary.has_free) {
    return (
      <Box fontSize="sm" mt={1} data-testid="delivery-summary">
        <Text 
          as="span" 
          fontSize="sm" 
          color="text.secondary" 
          fontWeight="500"
          mr={2}
        >
          Free delivery
        </Text>
        {summary.options_count > 1 && (
          <Text as="span" color="text.secondary">
            • {formatEta(summary.fastest_days_min, summary.fastest_days_max)}
          </Text>
        )}
      </Box>
    );
  }

  return (
    <Box fontSize="sm" mt={1} color="text.secondary" data-testid="delivery-summary">
      <Text as="span">
        Delivery from {formatPrice(summary.cheapest_price)}
      </Text>
      {summary.fastest_days_min > 0 && (
        <Text as="span">
          {" "}• {formatEta(summary.fastest_days_min, summary.fastest_days_max)}
        </Text>
      )}
    </Box>
  );
};
