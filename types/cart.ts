import { BasicPerfumeInfo } from './perfume';
import { Coupon } from './coupon';

export type ProductType = 'AI_BOX' | 'BOX_PERSONALIZADO' | 'GIFT_BOX' | 'OCCASION_BOX' | 'PREDEFINED_BOX';

export type DecantSize = 3 | 5 | 10;

export interface BoxDetails {
  decantCount: number;
  decantSize: DecantSize;
  perfumes: BasicPerfumeInfo[];
}

export interface CartItem {
  id: string;
  backendId?: number;
  productType: ProductType;
  name: string;
  details: BoxDetails;
  price: number;
  thumbnail_url?: string;
  quantity: 1;

}

export interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  addItemToCart: (itemData: Omit<CartItem, 'id'>) => Promise<void>;
  removeItemFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  handleSuccessfulOrder: () => void;
  refreshCart: () => Promise<void>;
  totalCartPrice: number;
  totalCartItems: number;

  appliedCoupon: Coupon | null;
  couponError: string | null;
  applyCoupon: (couponCode: string) => Promise<void>;
  removeCoupon: () => Promise<void>;

  discountAmount: number;
  finalPrice: number;

}