import { useToast } from "@chakra-ui/react";
import { FC, ReactNode, createContext, useEffect, useState } from "react";
import { useCurrency } from "./CurrencyContext";
import useCurrencySync from "../hooks/useCurrencySync";
import { Money } from "../api/types";
import seed from "./products.json";

type DeliverySpeed = "standard" | "express" | "next_day" | "same_day";

export interface DeliveryOption {
  id: number;
  name: string;
  description: string;
  speed: DeliverySpeed;
  price: number;
  min_order_amount?: number | null;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeliverySummary {
  has_free: boolean;
  cheapest_price: number;
  fastest_days_min: number;
  fastest_days_max: number;
  options_count: number;
}

type Product = {
  id: string | number;
  title: string;
  description: string;
  price: string | number;
  money?: Money; // Currency-aware pricing
  image_url?: string;  // Changed from 'image' to 'image_url'
  category: string;
  isSaved?: boolean;
  delivery_summary?: DeliverySummary | null;
  delivery_options?: DeliveryOption[];
};

export type ProductInCart = Product & {
  inCart: true;
  quantity: number | string;
};

type ProductNotInCart = Product & {
  inCart?: false;
};

export type ProductType = ProductInCart | ProductNotInCart;

// Helper function to get image URL
export const getImageUrl = (product: ProductType): string => {
  if (product.image_url) {
    const API_BASE_URL = "http://localhost:8001";
    // If it's already a full URL, return as is, otherwise prepend the API base URL
    if (product.image_url.startsWith('http')) {
      return product.image_url;
    }
    return `${API_BASE_URL}${product.image_url}`;
  }
  return "";
};

type ContextType = {
  products: ProductType[];
  cartItemCount: number;
  totalPrice: number;
  savedItemsCount: number;
  addToCart: (product: ProductType) => void;
  deleteFromCart: (id: number | string) => void;
  setQuantity: (qty: string, id: number | string) => void;
  decrementQty: (id: number | string) => void;
  incrementQty: (id: number | string) => void;
  toggleSaved: (id: number | string) => void;
  fetchProducts: () => Promise<void>;
  isLoading: boolean;
};

interface Props {
  children: ReactNode;
}
// Create context
export const GlobalContext = createContext<ContextType | null>(null);

// Provider component
export const Provider: FC<Props> = ({ children }) => {
  const toast = useToast();
  const { currency } = useCurrency();
  useCurrencySync(); // Sync currency with API client
  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart state from localStorage
  const loadCartState = () => {
    try {
      const savedCart = localStorage.getItem('cart-state');
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (error) {
      console.error('Failed to load cart state:', error);
      return {};
    }
  };

  // Load saved state from localStorage
  const loadSavedState = () => {
    try {
      const savedState = localStorage.getItem('saved-state');
      return savedState ? JSON.parse(savedState) : {};
    } catch (error) {
      console.error('Failed to load saved state:', error);
      return {};
    }
  };

  // Save cart state to localStorage
  const saveCartState = (products: ProductType[]) => {
    try {
      const cartState: { [key: string]: { inCart: boolean; quantity: number } } = {};
      products.forEach(product => {
        if (product.inCart) {
          cartState[product.id] = {
            inCart: true,
            quantity: +product.quantity
          };
        }
      });
      localStorage.setItem('cart-state', JSON.stringify(cartState));
    } catch (error) {
      console.error('Failed to save cart state:', error);
    }
  };

  // Save saved state to localStorage
  const saveSavedState = (products: ProductType[]) => {
    try {
      const savedState: { [key: string]: boolean } = {};
      products.forEach(product => {
        if (product.isSaved) {
          savedState[product.id] = true;
        }
      });
      localStorage.setItem('saved-state', JSON.stringify(savedState));
    } catch (error) {
      console.error('Failed to save saved state:', error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = "http://localhost:8001";
      const response = await fetch(`${API_BASE_URL}/products?include_delivery_summary=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products: ProductType[] = await response.json();
      
      // Convert backend format to frontend format and apply saved cart state
      const savedCartState = loadCartState();
      const savedState = loadSavedState();
      const formattedProducts = products.map(product => {
        const cartItem = savedCartState[product.id];
        return {
          ...product,
          // Apply saved state from localStorage
          isSaved: savedState[product.id] || product.isSaved || false,
          // Apply saved cart state
          inCart: cartItem?.inCart || false,
          quantity: cartItem?.quantity || undefined,
        };
      });
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Fallback to seed data if API is not available
      console.log("Using fallback seed data");
      const savedCartState = loadCartState();
      const savedState = loadSavedState();
      const products: ProductType[] = seed.map(product => {
        const cartItem = savedCartState[product.id];
        return {
          ...product,
          image_url: product.image, // Convert old format
          // Apply saved state from localStorage
          isSaved: savedState[product.id] || false,
          // Apply saved cart state
          inCart: cartItem?.inCart || false,
          quantity: cartItem?.quantity || undefined,
        };
      });
      setProducts(products);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  // Refetch products when currency changes
  useEffect(() => {
    if (products.length > 0) {
      fetchProducts();
    }
  }, [currency]);

  useEffect(() => {
    // Get products in cart
    const productsInCart = products.flatMap(product =>
      product.inCart === true ? product : []
    );
    const productPrices = productsInCart.map(
      product => +product.price * +product.quantity
    );
    setTotalPrice(productPrices.reduce((a, b) => a + b, 0));
    setCartItemCount(productsInCart.length);
    // Get saved products
    const savedProducts = products.filter(product => product.isSaved === true);
    setSavedItemsCount(savedProducts.length);
  }, [products]);

  const toggleSaved = (id: string | number) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(prevProduct =>
        prevProduct.id === id
          ? { ...prevProduct, isSaved: !prevProduct.isSaved }
          : prevProduct
      );
      saveSavedState(updatedProducts);
      return updatedProducts;
    });
  };

  const addToCart = (product: ProductType) => {
    toast({
      title: "Product successfully added to your cart",
      status: "success",
      duration: 1500,
      isClosable: true,
    });
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(prevProduct =>
        prevProduct.id === product.id
          ? { ...prevProduct, quantity: 1, inCart: true }
          : prevProduct
      );
      saveCartState(updatedProducts);
      return updatedProducts;
    });
  };

  const deleteFromCart = (id: number | string) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(prevProduct => {
        if (prevProduct.id === id) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { quantity: _, ...productWithoutQuantity } = prevProduct as ProductInCart;
          return { ...productWithoutQuantity, inCart: false } as ProductNotInCart;
        }
        return prevProduct;
      });
      saveCartState(updatedProducts);
      return updatedProducts;
    });
  };

  const setQuantity = (qty: string, id: number | string) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(prevProduct =>
        prevProduct.inCart && prevProduct.id === id
          ? { ...prevProduct, quantity: qty }
          : prevProduct
      );
      saveCartState(updatedProducts);
      return updatedProducts;
    });
  };

  const decrementQty = (id: number | string) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(prevProduct =>
        prevProduct.inCart && prevProduct.id === id
          ? { ...prevProduct, quantity: +prevProduct.quantity - 1 }
          : prevProduct
      );
      saveCartState(updatedProducts);
      return updatedProducts;
    });
  };

  const incrementQty = (id: number | string) => {
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(prevProduct =>
        prevProduct.inCart && prevProduct.id === id
          ? { ...prevProduct, quantity: +prevProduct.quantity + 1 }
          : prevProduct
      );
      saveCartState(updatedProducts);
      return updatedProducts;
    });
  };

  return (
    <GlobalContext.Provider
      value={{
        products,
        cartItemCount,
        totalPrice,
        savedItemsCount,
        addToCart,
        deleteFromCart,
        setQuantity,
        incrementQty,
        decrementQty,
        toggleSaved,
        fetchProducts,
        isLoading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

declare global {
  interface ObjectConstructor {
    filter: (obj: any, predicate: any) => any;
  }
}
// Custom function to filter objects
Object.filter = (obj, predicate) =>
  Object.keys(obj)
    .filter(key => predicate(obj[key]))
    .reduce((res, key) => Object.assign(res, { [key]: obj[key] }), {});
