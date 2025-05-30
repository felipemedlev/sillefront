import { BasicPerfumeInfo } from './perfume';
import { Coupon } from './coupon'; // Import Coupon type

// Define the types of products that can be added to the cart
export type ProductType = 'PERFUME' | 'AI_BOX' | 'BOX_PERSONALIZADO' | 'GIFT_BOX' | 'OCCASION_BOX' | 'PREDEFINED_BOX'; // Added PERFUME and PREDEFINED_BOX

// Define the possible sizes for decants
export type DecantSize = 3 | 5 | 10; // This can represent individual decant size or box decant size

// Define the details specific to box-type products
export interface BoxDetails {
  decantCount: number;
  decantSize: DecantSize;
  perfumes: BasicPerfumeInfo[]; // Use BasicPerfumeInfo to avoid storing excessive data
}

// Define the structure for an item in the shopping cart
export interface CartItem {
  id: string; // Unique identifier for this specific cart entry (e.g., UUID)
  productType: ProductType;
  name: string; // Display name (e.g., "AI Discovery Box", "Manual Box", "Chanel No. 5 Decant")
  details?: BoxDetails; // Optional: Used for box types
  price: number; // The calculated price for this specific item configuration
  thumbnail_url?: string; // Optional image for the cart item

  // Fields for individual perfume decants
  perfume_id_backend?: number; // Backend ID of the perfume
  quantity?: number; // Quantity, typically 1 for decants unless stacking same decant
  decantSize?: DecantSize; // Size of the decant if productType is 'PERFUME'
}

// Define the shape of the Cart Context state and actions
export interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null; // General cart errors
  // Update addItemToCart to accept the modified CartItem structure
  addItemToCart: (itemData: Omit<CartItem, 'id'> & { perfume_id_backend?: number }) => Promise<void>;
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