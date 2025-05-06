/**
 * Defines the available subscription tiers.
 */
export type SubscriptionTier = 'basic' | 'medium' | 'pro';

/**
 * Defines the structure for storing the user's current subscription status.
 */
export interface SubscriptionStatus {
  isActive: boolean; // Whether the subscription is currently active
  tier: SubscriptionTier | null; // The active tier, or null if inactive
  startDate: number | null; // Timestamp (ms since epoch) when the subscription started, or null if inactive
}

/**
 * Defines the detailed properties associated with each subscription tier.
 */
export interface SubscriptionTierDetails {
  id: SubscriptionTier; // Matches the SubscriptionTier type
  name: string; // User-friendly name (e.g., "Basic", "Pro")
  priceCLP: number; // Monthly price in Chilean Pesos
  decantSizeML: 3 | 5; // Size of decants included in this tier
  decantCount: 4; // Number of decants (fixed at 4 for all tiers as per requirement)
  maxprice_per_ml?: number; // Optional upper limit for perfume price/mL for this tier
  minprice_per_ml?: number; // Optional lower limit for perfume price/mL for this tier
  description: string; // Short description of the tier's benefits
}