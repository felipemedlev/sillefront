import { BasicPerfumeInfo } from './perfume';
import { Coupon } from './coupon'; // Import Coupon type

// Define the types of products that can be added to the cart
// 'PERFUME' is removed as individual perfumes are not added directly, only as part of a box.
export type ProductType = 'AI_BOX' | 'BOX_PERSONALIZADO' | 'GIFT_BOX' | 'OCCASION_BOX' | 'PREDEFINED_BOX';

// Define the possible sizes for decants (used within BoxDetails)
export type DecantSize = 3 | 5 | 10;

// Define the details specific to box-type products
export interface BoxDetails {
  decantCount: number;
  decantSize: DecantSize;
  perfumes: BasicPerfumeInfo[]; // Use BasicPerfumeInfo to avoid storing excessive data
}

// Define the structure for an item in the shopping cart
export interface CartItem {
  id: string; // Unique identifier for this specific cart entry (e.g., UUID for local state)
  backendId?: number; // Optional: Backend-generated ID for the cart item, populated after sync
  productType: ProductType; // Will always be one of the box types
  name: string; // Display name for the box (e.g., "AI Discovery Box (4x5ml)")
  details: BoxDetails; // Mandatory: Used for all box types, contains perfumes, decantSize, decantCount
  price: number; // The price of the box
  thumbnail_url?: string; // Optional image for the cart item (e.g., box image)
  quantity: 1; // Quantity of this specific box configuration is always 1

  // Fields for individual perfume decants are removed from the top-level CartItem.
  // perfume_id_backend is now within BoxDetails.perfumes (as external_id or similar)
  // decantSize is now within BoxDetails
}

// Define the shape of the Cart Context state and actions
export interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null; // General cart errors
  // addItemToCart now only accepts items that are already structured as boxes.
  addItemToCart: (itemData: Omit<CartItem, 'id'>) => Promise<void>;
  removeItemFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalCartPrice: number; // Price before discount
  totalCartItems: number;

  // Coupon related state and actions
  appliedCoupon: Coupon | null;
  couponError: string | null; // Coupon-specific errors
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => Promise<void>;

  // Derived values including discount
  discountAmount: number;
  finalPrice: number; // Price after discount

  // updateItemInCart: (itemId: string, updates: Partial<CartItem>) => Promise<void>; // Optional future enhancement
}