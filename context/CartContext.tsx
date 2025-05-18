import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { CartItem, CartContextType } from '../types/cart';
import { Coupon } from '../types/coupon'; // Import Coupon type
// import { MOCK_COUPONS } from '../data/MOCK_COUPONS'; // Mock coupons removed
import { STORAGE_KEYS } from '../types/constants';
import { API_BASE_URL } from '../src/services/api'; // Import API_BASE_URL
import { handleError } from '../types/error';

// Create the context with an undefined initial value
// Note: The CartContextType definition needs to be updated in types/cart.ts separately
const CartContext = createContext<CartContextType | undefined>(undefined);

// Define the props for the provider component
interface CartProviderProps {
  children: ReactNode;
}

// Create the CartProvider component
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // General cart errors
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null); // State for applied coupon
  const [couponError, setCouponError] = useState<string | null>(null); // State for coupon-specific errors

  // Load cart items from AsyncStorage on component mount
  useEffect(() => {
    const loadCartItems = async () => {
      setIsLoading(true);
      setError(null);
      setCouponError(null); // Also clear coupon error on load
      try {
        const savedCart = await AsyncStorage.getItem(STORAGE_KEYS.CART);
        if (savedCart) {
          // TODO: Consider also loading/saving appliedCoupon if persistence is needed across sessions
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
          // TODO: Consider saving appliedCoupon here if needed
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
    setCouponError(null); // Clear coupon error when cart changes
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
    setCouponError(null); // Clear coupon error when cart changes
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
    setCouponError(null); // Clear coupon error when cart changes
    setAppliedCoupon(null); // Also remove applied coupon when clearing cart
    try {
      setCartItems([]);
      // AsyncStorage will be updated by the useEffect hook watching cartItems
    } catch (err) {
      const appError = handleError(err);
      setError(`Error clearing cart: ${appError.message}`);
    }
  }, []);

  // Calculate total price (before discount) and item count
  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  }, [cartItems]);

  const totalCartItems = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);

  // --- Coupon Logic ---

  const applyCoupon = useCallback(async (couponCode: string) => {
    setCouponError(null);
    setIsLoading(true); // Indicate loading state during API call
    const codeUpper = couponCode.toUpperCase();

    try {
      const response = await fetch(`${API_BASE_URL}/coupons/validate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: codeUpper, cart_total: totalCartPrice }),
      });

      const data = await response.json();

      if (!response.ok) {
        // API returned an error (e.g., 400, 404)
        setCouponError(data.detail || "Error al validar el cupón.");
        setAppliedCoupon(null);
        return;
      }

      // Coupon is valid, data is the coupon object from backend
      // Ensure the backend response matches the Coupon type structure
      const validatedCoupon: Coupon = {
        id: data.id, // Assuming backend sends id
        code: data.code,
        discountType: data.discount_type, // Map backend field name
        value: parseFloat(data.value), // Ensure value is a number
        description: data.description,
        minPurchaseAmount: data.min_purchase_amount ? parseFloat(data.min_purchase_amount) : undefined,
        expiryDate: data.expiry_date ? new Date(data.expiry_date).getTime() : undefined,
        // Map other fields if necessary
      };
      setAppliedCoupon(validatedCoupon);
      console.log('Coupon applied:', validatedCoupon);

    } catch (err) {
      const appError = handleError(err);
      console.error('Error applying coupon:', appError);
      setCouponError(`Error al aplicar cupón: ${appError.message}`);
      setAppliedCoupon(null);
    } finally {
      setIsLoading(false);
    }
  }, [totalCartPrice]);

  const removeCoupon = useCallback(async () => {
    setAppliedCoupon(null);
    setCouponError(null);
  }, []);

  // Calculate discount amount and final price
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discountType === 'percentage') {
      return (totalCartPrice * appliedCoupon.value) / 100;
    } else if (appliedCoupon.discountType === 'fixed') {
      // Ensure fixed discount doesn't exceed total price
      return Math.min(appliedCoupon.value, totalCartPrice);
    }
    return 0;
  }, [appliedCoupon, totalCartPrice]);

  const finalPrice = useMemo(() => {
    const priceAfterDiscount = totalCartPrice - discountAmount;
    return Math.max(0, priceAfterDiscount); // Ensure price doesn't go below zero
  }, [totalCartPrice, discountAmount]);

  // --- End Coupon Logic ---


  // The value provided by the context
  // Remember to update CartContextType in types/cart.ts
  const value: CartContextType = {
    cartItems,
    isLoading,
    error,
    addItemToCart,
    removeItemFromCart,
    clearCart,
    totalCartPrice,
    totalCartItems,
    // Coupon related values
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalPrice,
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