import { BasicPerfumeInfo } from './perfume';

// Define the types of products that can be added to the cart
export type ProductType = 'AI_BOX' | 'BOX_PERSONALIZADO' | 'GIFT_BOX' | 'OCCASION_BOX' | 'PREDEFINED_BOX'; // Added PREDEFINED_BOX

// Define the possible sizes for decants
export type DecantSize = 3 | 5 | 10;

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
  name: string; // Display name (e.g., "AI Discovery Box", "Manual Box")
  details: BoxDetails; // Using BoxDetails for now, could be a union type later if non-box items are added
  price: number; // The calculated price for this specific item configuration
  thumbnailUrl?: string; // Optional image for the cart item (e.g., a generic box image or first perfume)
}

// Define the shape of the Cart Context state and actions
export interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  addItemToCart: (itemData: Omit<CartItem, 'id'>) => Promise<void>;
  removeItemFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  totalCartPrice: number;
  totalCartItems: number;
  // updateItemInCart: (itemId: string, updates: Partial<CartItem>) => Promise<void>; // Optional future enhancement
}