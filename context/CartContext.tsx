import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { CartItem, CartContextType } from '../types/cart';
import { STORAGE_KEYS } from '../types/constants';
import { handleError } from '../types/error';

// Create the context with an undefined initial value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Define the props for the provider component
interface CartProviderProps {
  children: ReactNode;
}

// Create the CartProvider component
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart items from AsyncStorage on component mount
  useEffect(() => {
    const loadCartItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const savedCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (err) {
        const appError = handleError(err);
        console.error('Error loading cart items:', appError);
        setError(`Error loading cart: ${appError.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, []);

  // Save cart items to AsyncStorage whenever they change
  useEffect(() => {
    const saveCartItems = async () => {
      // Only save if not currently loading to prevent overwriting initial load
      if (!isLoading) {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
        } catch (err) {
          const appError = handleError(err);
          console.error('Error saving cart items:', appError);
          setError(`Error saving cart: ${appError.message}`);
          // Optionally notify the user about the saving error
        }
      }
    };

    saveCartItems();
  }, [cartItems, isLoading]);

  // Function to add an item to the cart
  const addItemToCart = useCallback(async (itemData: Omit<CartItem, 'id'>) => {
    setError(null); // Clear previous errors
    try {
      const newItem: CartItem = {
        ...itemData,
        id: uuidv4(), // Generate a unique ID for the new item
      };
      setCartItems((prevItems) => [...prevItems, newItem]);
      // Optionally add success feedback here (e.g., toast message)
    } catch (err) {
      const appError = handleError(err);
      setError(`Error adding item to cart: ${appError.message}`);
      // Re-throw or handle the error appropriately
    }
  }, []);

  // Function to remove an item from the cart by its ID
  const removeItemFromCart = useCallback(async (itemId: string) => {
    setError(null);
    try {
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (err) {
      const appError = handleError(err);
      setError(`Error removing item from cart: ${appError.message}`);
    }
  }, []);

  // Function to clear all items from the cart
  const clearCart = useCallback(async () => {
    setError(null);
    try {
      setCartItems([]);
      // AsyncStorage will be updated by the useEffect hook watching cartItems
      // Alternatively, you could explicitly remove the item here:
      // await AsyncStorage.removeItem(STORAGE_KEYS.CART);
    } catch (err) {
      const appError = handleError(err);
      setError(`Error clearing cart: ${appError.message}`);
    }
  }, []);

  // Calculate total price and item count using useMemo for optimization
  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  }, [cartItems]);

  const totalCartItems = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  // The value provided by the context
  const value: CartContextType = {
    cartItems,
    isLoading,
    error,
    addItemToCart,
    removeItemFromCart,
    clearCart,
    totalCartPrice,
    totalCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use the CartContext
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};