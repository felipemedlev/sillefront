export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string; // Unique ID for the coupon
  code: string; // User-facing code (e.g., "SUMMER10") - Make this uppercase for easier comparison
  discountType: DiscountType;
  value: number; // Percentage (e.g., 10 for 10%) or fixed amount (e.g., 5000 for $5000 CLP)
  description?: string; // Optional description
  minPurchaseAmount?: number; // Minimum cart total required to apply
  expiryDate?: number; // Optional expiry timestamp (milliseconds since epoch)
  // Add other potential restrictions later (e.g., specific products, usage limits)
}