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
    const API_BASE_URL = "http://localhost:8001";
    // If it's already a full URL, return as is, otherwise prepend the API base URL
    if (product.image_url.startsWith('http')) {
      return product.image_url;
    }
    return `${API_BASE_URL}${product.image_url}`;
  }
  return "";
};

type FilterState = {
  category: string;
  shipping: string;
  delivery: string;
};

type ContextType = {
  products: ProductType[];
  filteredProducts: ProductType[];
  cartItemCount: number;
  totalPrice: number;
  savedItemsCount: number;
  filters: FilterState;
  addToCart: (product: ProductType) => void;
  deleteFromCart: (id: number | string) => void;
  setQuantity: (qty: string, id: number | string) => void;
  decrementQty: (id: number | string) => void;
  incrementQty: (id: number | string) => void;
  toggleSaved: (id: number | string) => void;
  fetchProducts: () => Promise<void>;
  setFilter: (filterType: keyof FilterState, value: string) => void;
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
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [savedItemsCount, setSavedItemsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    shipping: '',
    delivery: ''
  });

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

  // Fetch products
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const API_BASE_URL = "http://localhost:8001";
      const response = await fetch(`${API_BASE_URL}/products`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products: ProductType[] = await response.json();
      
      // Convert backend format to frontend format and apply saved cart state
      const savedCartState = loadCartState();
      const formattedProducts = products.map(product => {
        const cartItem = savedCartState[product.id];
        return {
          ...product,
          // Ensure isSaved is set to false if not provided
          isSaved: product.isSaved || false,
          // Apply saved cart state
          inCart: cartItem?.inCart || false,
          quantity: cartItem?.quantity || undefined,
        };
      });
      
      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      // Fallback to seed data if API is not available
      console.log("Using fallback seed data");
      const savedCartState = loadCartState();
      const products: ProductType[] = seed.map(product => {
        const cartItem = savedCartState[product.id];
        return {
          ...product,
          image_url: product.image, // Convert old format
          isSaved: false,
          // Apply saved cart state
          inCart: cartItem?.inCart || false,
          quantity: cartItem?.quantity || undefined,
        };
      });
      setProducts(products);
      setFilteredProducts(products);
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

  // Filter function
  const applyFilters = (products: ProductType[], filters: FilterState): ProductType[] => {
    return products.filter(product => {
      // Category filter
      if (filters.category && filters.category !== 'all') {
        let categoryName = '';
        if (typeof product.category === 'string') {
          categoryName = product.category;
        } else if (typeof product.category === 'object' && product.category && 'name' in product.category) {
          categoryName = (product.category as { name: string }).name;
        }
        
        if (categoryName && categoryName.toLowerCase() !== filters.category.toLowerCase()) {
          return false;
        }
      }
      
      // For shipping and delivery options, we'll simulate these based on product properties
      // Since the mock data doesn't have these fields, we'll create some logic based on price/category
      
      // Shipping filter (simulated based on price)
      if (filters.shipping && filters.shipping !== 'all') {
        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
        if (filters.shipping === 'free' && price < 50) return false;
        if (filters.shipping === 'express' && price < 100) return false;
        if (filters.shipping === 'standard' && price >= 100) return false;
      }
      
      // Delivery filter (simulated based on category)
      if (filters.delivery && filters.delivery !== 'all') {
        let categoryName = '';
        if (typeof product.category === 'string') {
          categoryName = product.category;
        } else if (typeof product.category === 'object' && product.category && 'name' in product.category) {
          categoryName = (product.category as { name: string }).name;
        }
        
        if (filters.delivery === 'same-day' && !['electronics', 'clothing'].includes(categoryName.toLowerCase())) return false;
        if (filters.delivery === 'next-day' && categoryName.toLowerCase() === 'books') return false;
        if (filters.delivery === '3-5-days' && categoryName.toLowerCase() === 'electronics') return false;
      }
      
      return true;
    });
  };

  // Set filter function
  const setFilter = (filterType: keyof FilterState, value: string) => {
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters, [filterType]: value };
      // Apply filters immediately when they change
      const filtered = applyFilters(products, newFilters);
      setFilteredProducts(filtered);
      return newFilters;
    });
  };

  // Update filtered products when products change
  useEffect(() => {
    const filtered = applyFilters(products, filters);
    setFilteredProducts(filtered);
  }, [products]);

  return (
    <GlobalContext.Provider
      value={{
        products,
        filteredProducts,
        cartItemCount,
        totalPrice,
        savedItemsCount,
        filters,
        addToCart,
        deleteFromCart,
        setQuantity,
        incrementQty,
        decrementQty,
        toggleSaved,
        fetchProducts,
        setFilter,
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
