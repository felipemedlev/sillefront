import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // Import uuid
import { CartItem, CartContextType, ProductType } from '../types/cart'; // Added ProductType import
import { Coupon } from '../types/coupon'; // Import Coupon type
// import { MOCK_COUPONS } from '../data/MOCK_COUPONS'; // Mock coupons removed
import { STORAGE_KEYS } from '../types/constants';
import { API_BASE_URL, addItemToBackendCart, ApiCartItemAddPayload, ApiCart, fetchPerfumesByExternalIds, ApiPerfumeSummary, removeItemFromBackendCart, clearBackendCart, ApiCartItem, fetchUserCart } from '../src/services/api'; // Import API_BASE_URL and cart functions/types
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

  // Helper function to map API cart items to local CartItem structure
  // This needs to be robust for all cart update scenarios (load, add, remove)
  const mapApiItemsToLocalState = useCallback((apiItems: ApiCartItem[], existingLocalItems: CartItem[] = []): CartItem[] => {
    return apiItems.map(apiItem => {
      // Try to find an existing local item by backendId to preserve its local UUID if possible
      const existingItem = existingLocalItems.find(local => local.backendId === apiItem.id);
      const localId = existingItem?.id || uuidv4();

      // Determine productType: This is tricky as apiItem.product_type is 'perfume' | 'box'.
      // We need one of the specific box ProductTypes.
      // If existingItem is found, use its type. Otherwise, default.
      // This assumes that if it's a box, it's one of the valid box ProductTypes.
      let productType: ProductType = 'AI_BOX'; // Default box type

      if (existingItem?.productType) {
        productType = existingItem.productType;
      } else if (apiItem.product_type === 'box') {
        // If apiItem.name gives a clue, we could try to map it to a more specific ProductType.
        // For example, if apiItem.name is "AI Discovery Box", productType = 'AI_BOX';
        // This requires a predefined mapping or naming convention.
        // For now, if it's a 'box' from backend and no existing specific type, keep default 'AI_BOX'.
        // This part is crucial if different box types need different handling/display on frontend.
        // If all boxes are treated the same on frontend once in cart, 'AI_BOX' as a generic
        // placeholder for "any box" might be acceptable, but ideally, it should be accurate.
        // The `itemData.productType` used during `addItemToCart` is the most accurate source
        // for newly added items. For items loaded from `fetchUserCart`, this inference is needed.
        if ((apiItem as any).name?.startsWith("AI Discovery")) productType = 'AI_BOX';
        else if ((apiItem as any).name?.startsWith("Box Personalizado")) productType = 'BOX_PERSONALIZADO';
        else if ((apiItem as any).name?.startsWith("Gift Box")) productType = 'GIFT_BOX';
        // Add other mappings if names are predictable.
      }
      // If apiItem.product_type was 'perfume', this logic would be wrong, but we've
      // enforced boxes only, so backend should always send 'box'.

      return {
        id: localId,
        backendId: apiItem.id,
        productType: productType, // Use the determined (potentially more specific) ProductType
        name: apiItem.name || existingItem?.name || 'Scent Box', // Prefer API name, then existing, then default
        price: parseFloat(apiItem.price_at_addition),
        quantity: 1, // Always 1
        details: {
          perfumes: apiItem.box_configuration?.perfumes?.map((p: any) => ({
            id: p.external_id || p.perfume_id_backend?.toString() || uuidv4(),
            name: p.name || 'Unknown Perfume',
            brand: p.brand || 'Unknown Brand',
            thumbnail_url: p.thumbnail_url || undefined,
          })) || [],
          decantSize: apiItem.box_configuration?.decant_size || 5, // Default if not in config
          decantCount: apiItem.box_configuration?.decant_count || 0, // Default if not in config
        },
        thumbnail_url: apiItem.perfume?.thumbnail_url || existingItem?.thumbnail_url || undefined,
      };
    });
  }, []);


  // Load cart items from Backend on component mount
  useEffect(() => {
    const loadCartFromBackend = async () => {
      setIsLoading(true);
      setError(null);
      setCouponError(null);
      try {
        console.log("Attempting to fetch user cart from backend...");
        const backendCartData = await fetchUserCart();
        if (backendCartData && backendCartData.items) {
          console.log("Cart fetched from backend:", backendCartData);
          setCartItems(mapApiItemsToLocalState(backendCartData.items));
        } else {
          console.log("No cart data received from backend or cart is empty.");
          setCartItems([]); // Set to empty if no cart or empty cart
        }
      } catch (err) {
        const appError = handleError(err);
        console.error('Error loading cart from backend:', appError);
        // Don't set generic error if it's a 404 (cart not found), which is fine
        if ((err as any).status !== 404) {
            setError(`Error loading cart: ${appError.message}`);
        } else {
            setCartItems([]); // Cart doesn't exist on backend, so local should be empty
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCartFromBackend();
  }, [mapApiItemsToLocalState]); // mapApiItemsToLocalState is a dependency

  // Save cart items to AsyncStorage whenever they change (optional, as backend is source of truth)
  // Consider if AsyncStorage persistence is still desired or if all reads should go to backend.
  // For now, keeping it, but it might lead to inconsistencies if not managed carefully with backend sync.
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
  const addItemToCart = useCallback(async (
    // itemData now represents a box. If a single perfume is added, it should be pre-formatted as a box.
    // The 'details' field in CartItem should conform to the expected box_configuration structure.
    itemData: Omit<CartItem, 'id'>
  ) => {
    setError(null);
    setCouponError(null);
    setIsLoading(true);

    // All items are now treated as 'box'. The `itemData` parameter is expected to be a fully formed box.
    // The `productType` on `itemData` will be one of the BoxTypes.

    // Ensure itemData.details is structured correctly for box_configuration
    // The frontend CartItem 'details' (BoxDetails type) uses camelCase: decantCount, decantSize
    // The backend API (ApiCartItemAddPayload) expects snake_case within box_configuration: decant_count, decant_size

    const frontendBoxDetails = itemData.details; // This is of type BoxDetails

    if (!frontendBoxDetails || !frontendBoxDetails.perfumes || !frontendBoxDetails.decantSize || !frontendBoxDetails.decantCount) {
        console.error('addItemToCart: Invalid BoxDetails in itemData.details. Missing perfumes, decantSize, or decantCount.', itemData);
        setError('Item details are incomplete for adding to cart.');
        setIsLoading(false);
        return;
    }

    // Construct the backend-compatible box_configuration
    const backendBoxConfiguration = {
        perfumes: frontendBoxDetails.perfumes.map(p => {
            const perfumePayload: any = {
                external_id: p.id, // from BasicPerfumeInfo.id
                name: p.name,      // from BasicPerfumeInfo.name
                brand: p.brand,    // from BasicPerfumeInfo.brand
                thumbnail_url: p.thumbnail_url // from BasicPerfumeInfo.thumbnail_url
            };
            return perfumePayload;
        }),
        decant_size: frontendBoxDetails.decantSize, // snake_case for backend
        decant_count: frontendBoxDetails.decantCount, // snake_case for backend
    };

    const payload: ApiCartItemAddPayload = {
        product_type: 'box', // Always 'box'
        name: itemData.name,
        price: itemData.price,
        quantity: 1, // Quantity is always 1 for a new unique box
        box_configuration: backendBoxConfiguration,
    };

    try {
        console.log(`Attempting to add ${itemData.productType} (as BOX) to backend cart:`, payload);
        const backendCartResponse: ApiCart = await addItemToBackendCart(payload);
        console.log(`${itemData.productType} (as BOX) added to backend cart successfully, response:`, backendCartResponse);

        // Instead of just adding the local item, we should update the entire cart
        // based on the backend response to ensure backendIds are captured.
        // This assumes backendCartResponse.items contains all cart items with their backend IDs.

        // Helper function to map API cart items to local CartItem structure
        // This needs to handle the mapping of backend item ID to local `backendId`
        // and potentially reconcile with existing local UUIDs if needed, though for add,
        // replacing the cart state with the backend's version is often simpler.
        if (backendCartResponse && backendCartResponse.items) {
          // Pass current cartItems to preserve local UUIDs if possible
          setCartItems(mapApiItemsToLocalState(backendCartResponse.items, cartItems));
        } else {
          // Fallback or error: if backend response isn't as expected,
          // This case should ideally not happen if backend always returns the full cart.
          // If it does, adding locally without backendId is problematic for future deletions.
          console.error("addItemToCart: Backend did not return updated cart items as expected.");
          setError("Failed to confirm item addition with the server. Please try again.");
          // Avoid adding the item locally if the backend confirmation failed,
          // as it would lack a backendId and cause issues with deletion.
          // If you must add it locally, ensure the user is clearly informed it's not synced.
          // For a cleaner state, it's better to not add it if the backend sync fails.
          // setCartItems((prevItems) => [...prevItems, newItemWithoutBackendId]); // Removed this potentially problematic local add
        }

    } catch (err) {
        const appError = handleError(err);
        console.error(`Error adding ${itemData.productType} (as BOX) to backend cart:`, appError);
        setError(`Error adding box: ${appError.message}`);
    } finally {
        setIsLoading(false);
    }
  }, []);

  // Function to remove an item from the cart by its ID
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
        // Update local cart based on backend response
        // Update local cart based on backend response
        if (updatedBackendCart && updatedBackendCart.items) {
          // Pass current cartItems to preserve local UUIDs if possible
          setCartItems(mapApiItemsToLocalState(updatedBackendCart.items, cartItems));
        } else if (updatedBackendCart && updatedBackendCart.items && updatedBackendCart.items.length === 0) {
            // This handles the case where the backend returns an empty list of items
            setCartItems([]);
        } else if (!updatedBackendCart) { // Handles null response (e.g. 204 No Content)
             // This means the cart is now empty after deleting the last item
            setCartItems([]);
        } else {
          // Fallback: if response is unexpected, but not an error, remove locally.
          // This might happen if the backend returns something other than the full cart or null.
          console.warn("removeItemFromCart: Backend response was not the full cart or null. Removing item locally.");
          setCartItems((prevItems) => prevItems.filter((item) => item.id !== localItemId));
        }
      } catch (err) {
        const appError = handleError(err);
        console.error(`Error removing item (backendId: ${itemToRemove.backendId}) from backend cart:`, appError);
        setError(`Error removing item: ${appError.message}`);
        // Optionally, decide if local state should still be updated if backend fails
      } finally {
        setIsLoading(false);
      }
    } else {
      // Item does not have a backendId, likely only exists locally (e.g., error during add)
      // Or if cart was loaded from AsyncStorage without backend sync.
      console.warn(`Item with local ID ${localItemId} has no backendId. Removing locally only.`);
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== localItemId));
      setIsLoading(false);
    }
  }, [cartItems]);

  // Function to clear all items from the cart
  const clearCart = useCallback(async () => {
    setError(null);
    setCouponError(null);
    setAppliedCoupon(null);
    setIsLoading(true);
    try {
      console.log('Attempting to clear backend cart.');
      await clearBackendCart(); // API call
      console.log('Backend cart cleared successfully.');
      setCartItems([]); // Clear local cart
    } catch (err) {
      const appError = handleError(err);
      console.error('Error clearing backend cart:', appError);
      setError(`Error clearing cart: ${appError.message}`);
      // Decide if local cart should be cleared even if backend fails
    } finally {
      setIsLoading(false);
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