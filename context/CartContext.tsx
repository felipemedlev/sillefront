import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { CartItem, CartContextType, ProductType } from '../types/cart';
import { Coupon } from '../types/coupon';
import { STORAGE_KEYS } from '../types/constants';
import { API_BASE_URL, addItemToBackendCart, ApiCartItemAddPayload, ApiCart, fetchPerfumesByExternalIds, ApiPerfumeSummary, removeItemFromBackendCart, clearBackendCart, ApiCartItem, fetchUserCart } from '../src/services/api';
import { handleError } from '../types/error';

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const mapApiItemsToLocalState = useCallback((apiItems: ApiCartItem[], existingLocalItems: CartItem[] = []): CartItem[] => {
    return apiItems.map(apiItem => {
      const existingItem = existingLocalItems.find(local => local.backendId === apiItem.id);
      const localId = existingItem?.id || uuidv4();

      let productType: ProductType = 'AI_BOX';

      if (existingItem?.productType) {
        productType = existingItem.productType;
      } else if (apiItem.product_type === 'box') {
        if ((apiItem as any).name?.startsWith("AI Discovery")) productType = 'AI_BOX';
        else if ((apiItem as any).name?.startsWith("Box Personalizado")) productType = 'BOX_PERSONALIZADO';
        else if ((apiItem as any).name?.startsWith("Gift Box")) productType = 'GIFT_BOX';
      }

      return {
        id: localId,
        backendId: apiItem.id,
        productType: productType,
        name: apiItem.name || existingItem?.name || 'Scent Box',
        price: parseFloat(apiItem.price_at_addition),
        quantity: 1,
        details: {
          perfumes: apiItem.box_configuration?.perfumes?.map((p: any) => ({
            id: p.external_id || p.perfume_id_backend?.toString() || uuidv4(),
            name: p.name || 'Unknown Perfume',
            brand: p.brand || 'Unknown Brand',
            thumbnail_url: p.thumbnail_url || undefined,
          })) || [],
          decantSize: apiItem.box_configuration?.decant_size || 5,
          decantCount: apiItem.box_configuration?.decant_count || 0,
        },
        thumbnail_url: apiItem.perfume?.thumbnail_url || existingItem?.thumbnail_url || undefined,
      };
    });
  }, []);


  const loadCartFromBackend = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCouponError(null);
    try {
      console.log("Attempting to fetch user cart from backend (refreshCart)...");
      const backendCartData = await fetchUserCart();
      if (backendCartData && backendCartData.items) {
        console.log("Cart fetched from backend (refreshCart):", JSON.stringify(backendCartData, null, 2));
        setCartItems(currentCartItems => {
          const newCartItems = mapApiItemsToLocalState(backendCartData.items, currentCartItems);
          console.log("Mapped local cart items (refreshCart):", JSON.stringify(newCartItems, null, 2));
          return newCartItems;
        });
      } else {
        console.log("No cart data (or no items in cart) received from backend (refreshCart). Setting local cart to empty.");
        setCartItems([]);
      }
    } catch (err) {
      const appError = handleError(err);
      console.error('Error loading cart from backend (refreshCart):', appError);
      if ((err as any).status !== 404) {
        setError(`Error loading cart: ${appError.message}`);
      } else {
        setCartItems([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [mapApiItemsToLocalState]);

  useEffect(() => {
    loadCartFromBackend();
  }, [loadCartFromBackend]);

  const refreshCart = useCallback(async () => {
    await loadCartFromBackend();
  }, [loadCartFromBackend]);

  useEffect(() => {
    const saveCartItems = async () => {
      if (!isLoading) {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cartItems));
        } catch (err) {
          const appError = handleError(err);
          console.error('Error saving cart items:', appError);
          setError(`Error saving cart: ${appError.message}`);
        }
      }
    };

    saveCartItems();
  }, [cartItems, isLoading]);

  const addItemToCart = useCallback(async (
    itemData: Omit<CartItem, 'id'>
  ) => {
    setError(null);
    setCouponError(null);
    setIsLoading(true);

    const frontendBoxDetails = itemData.details;

    if (!frontendBoxDetails || !frontendBoxDetails.perfumes || !frontendBoxDetails.decantSize || !frontendBoxDetails.decantCount) {
        console.error('addItemToCart: Invalid BoxDetails in itemData.details. Missing perfumes, decantSize, or decantCount.', itemData);
        setError('Item details are incomplete for adding to cart.');
        setIsLoading(false);
        return;
    }

    const backendBoxConfiguration = {
        perfumes: frontendBoxDetails.perfumes.map(p => {
            const perfumePayload: any = {
                external_id: p.id,
                name: p.name,
                brand: p.brand,
                thumbnail_url: p.thumbnail_url
            };
            return perfumePayload;
        }),
        decant_size: frontendBoxDetails.decantSize,
        decant_count: frontendBoxDetails.decantCount,
    };

    const payload: ApiCartItemAddPayload = {
        product_type: 'box',
        name: itemData.name,
        price: itemData.price,
        quantity: 1,
        box_configuration: backendBoxConfiguration,
    };

    try {
        console.log(`Attempting to add ${itemData.productType} (as BOX) to backend cart:`, payload);
        const backendCartResponse: ApiCart = await addItemToBackendCart(payload);
        console.log(`${itemData.productType} (as BOX) added to backend cart successfully, response:`, backendCartResponse);

        if (backendCartResponse && backendCartResponse.items) {
          setCartItems(currentCartItems => mapApiItemsToLocalState(backendCartResponse.items, currentCartItems));
        } else {
          console.error("addItemToCart: Backend did not return updated cart items as expected.");
          setError("Failed to confirm item addition with the server. Please try again.");
        }

    } catch (err) {
        const appError = handleError(err);
        console.error(`Error adding ${itemData.productType} (as BOX) to backend cart:`, appError);
        setError(`Error adding box: ${appError.message}`);
    } finally {
        setIsLoading(false);
    }
  }, [mapApiItemsToLocalState]);

  const removeItemFromCart = useCallback(async (localItemId: string) => {
    setError(null);
    setCouponError(null);
    setIsLoading(true);

    const itemToRemove = cartItems.find(item => item.id === localItemId);

    if (!itemToRemove) {
      console.warn(`removeItemFromCart: Item with local ID ${localItemId} not found.`);
      setError("Item not found in cart.");
      setIsLoading(false);
      return;
    }

    if (itemToRemove.backendId) {
      try {
        console.log(`Attempting to remove item with backendId ${itemToRemove.backendId} from backend cart.`);
        const updatedBackendCart = await removeItemFromBackendCart(itemToRemove.backendId);
        console.log('Item removed from backend cart successfully. Response:', updatedBackendCart);
        if (updatedBackendCart && updatedBackendCart.items) {
          setCartItems(currentCartItems => mapApiItemsToLocalState(updatedBackendCart.items, currentCartItems));
        } else if (updatedBackendCart && updatedBackendCart.items && updatedBackendCart.items.length === 0) {
            setCartItems([]);
        } else if (!updatedBackendCart) {
            setCartItems([]);
        } else {
          console.warn("removeItemFromCart: Backend response was not the full cart or null. Removing item locally.");
          setCartItems((prevItems) => prevItems.filter((item) => item.id !== localItemId));
        }
      } catch (err) {
        const appError = handleError(err);
        console.error(`Error removing item (backendId: ${itemToRemove.backendId}) from backend cart:`, appError);
        setError(`Error removing item: ${appError.message}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      console.warn(`Item with local ID ${localItemId} has no backendId. Removing locally only.`);
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== localItemId));
      setIsLoading(false);
    }
  }, [cartItems, mapApiItemsToLocalState]);

  const clearCart = useCallback(async () => {
    setError(null);
    setCouponError(null);
    setAppliedCoupon(null);
    setIsLoading(true);
    try {
      console.log('Attempting to clear backend cart.');
      await clearBackendCart();
      console.log('Backend cart cleared successfully.');
      setCartItems([]);
    } catch (err) {
      const appError = handleError(err);
      console.error('Error clearing backend cart:', appError);
      setError(`Error clearing cart: ${appError.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSuccessfulOrder = useCallback(() => {
    console.log("Order successful, clearing local cart state.");
    setCartItems([]);
    setAppliedCoupon(null);
    setError(null);
    setCouponError(null);
  }, []);

  const totalCartPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  }, [cartItems]);

  const totalCartItems = useMemo(() => {
    return cartItems.length;
  }, [cartItems]);


  const applyCoupon = useCallback(async (couponCode: string) => {
    setCouponError(null);
    setIsLoading(true);
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
        setCouponError(data.detail || "Error al validar el cupón.");
        setAppliedCoupon(null);
        return;
      }

      const validatedCoupon: Coupon = {
        id: data.id,
        code: data.code,
        discountType: data.discount_type,
        value: parseFloat(data.value),
        description: data.description,
        minPurchaseAmount: data.min_purchase_amount ? parseFloat(data.min_purchase_amount) : undefined,
        expiryDate: data.expiry_date ? new Date(data.expiry_date).getTime() : undefined,
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

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discountType === 'percentage') {
      return (totalCartPrice * appliedCoupon.value) / 100;
    } else if (appliedCoupon.discountType === 'fixed') {
      return Math.min(appliedCoupon.value, totalCartPrice);
    }
    return 0;
  }, [appliedCoupon, totalCartPrice]);

  const finalPrice = useMemo(() => {
    const priceAfterDiscount = totalCartPrice - discountAmount;
    return Math.max(0, priceAfterDiscount);
  }, [totalCartPrice, discountAmount]);


  const value: CartContextType = {
    cartItems,
    isLoading,
    error,
    addItemToCart,
    removeItemFromCart,
    clearCart,
    handleSuccessfulOrder,
    refreshCart,
    totalCartPrice,
    totalCartItems,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    discountAmount,
    finalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};