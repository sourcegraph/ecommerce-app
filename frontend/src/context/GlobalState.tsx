import { useToast } from "@chakra-ui/react";
import { FC, ReactNode, createContext, useEffect, useState } from "react";
import seed from "./products.json";

type Product = {
  id: string | number;
  title: string;
  description: string;
  price: string | number;
  image_url?: string;  // Changed from 'image' to 'image_url'
  category: string;
  isSaved?: boolean;
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
    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
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
  const [products, setProducts] = useState<ProductType[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8001";
      const response = await fetch(`${API_BASE_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products: ProductType[] = await response.json();
      
      // Convert backend format to frontend format
      const formattedProducts = products.map(product => ({
        ...product,
        // Ensure isSaved is set to false if not provided
        isSaved: product.isSaved || false,
      }));
      
      setProducts(formattedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Fallback to seed data if API is not available
      console.log("Using fallback seed data");
      const products: ProductType[] = seed.map(product => ({
        ...product,
        image_url: product.image, // Convert old format
        isSaved: false
      }));
      setProducts(products);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

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
    setProducts(prevProducts =>
      prevProducts.map(prevProduct =>
        prevProduct.id === id
          ? { ...prevProduct, isSaved: !prevProduct.isSaved }
          : prevProduct
      )
    );
  };

  const addToCart = (product: ProductType) => {
    toast({
      title: "Product successfully added to your cart",
      status: "success",
      duration: 1500,
      isClosable: true,
    });
    setProducts(prevProducts =>
      prevProducts.map(prevProduct =>
        prevProduct.id === product.id
          ? { ...prevProduct, quantity: 1, inCart: true }
          : prevProduct
      )
    );
  };

  const deleteFromCart = (id: number | string) => {
    setProducts(prevProducts =>
      prevProducts.map(prevProduct =>
        prevProduct.id === id
          ? { ...prevProduct, inCart: false, quantity: undefined }
          : prevProduct
      )
    );
  };

  const setQuantity = (qty: string, id: number | string) => {
    setProducts(prevProducts =>
      prevProducts.map(prevProduct =>
        prevProduct.inCart && prevProduct.id === id
          ? { ...prevProduct, quantity: qty }
          : prevProduct
      )
    );
  };

  const decrementQty = (id: number | string) => {
    setProducts(prevProducts =>
      prevProducts.map(prevProduct =>
        prevProduct.inCart && prevProduct.id === id
          ? { ...prevProduct, quantity: +prevProduct.quantity - 1 }
          : prevProduct
      )
    );
  };

  const incrementQty = (id: number | string) => {
    setProducts(prevProducts =>
      prevProducts.map(prevProduct =>
        prevProduct.inCart && prevProduct.id === id
          ? { ...prevProduct, quantity: +prevProduct.quantity + 1 }
          : prevProduct
      )
    );
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
