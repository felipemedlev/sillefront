export interface BasicPerfumeInfo {
  id: string;
  name: string;
  brand: string;
  thumbnail_url: string; // Use snake_case
  full_size_url: string; // Use snake_case
}

export interface Perfume extends BasicPerfumeInfo {
  external_id: string; // Added external ID from backend
  match_percentage?: number | null; // Use snake_case, allow null
  price_per_ml?: number | null; // Use snake_case, allow null from API/parsing
  description?: string; // Keep camelCase if it matches API
  accords?: string[]; // Keep camelCase if it matches API
  top_notes?: string[]; // Use snake_case
  middle_notes?: string[]; // Use snake_case
  base_notes?: string[]; // Use snake_case
  overall_rating?: number; // Use snake_case
  price_value_rating?: number; // Use snake_case
  sillage_rating?: number; // Use snake_case
  longevity_rating?: number; // Use snake_case
  similar_perfume_ids?: string[]; // Already correct
  occasions?: string[]; // Keep camelCase if it matches API
  gender?: string; // Keep camelCase if it matches API
  best_for?: string; // Use snake_case
  season?: string;

  // Add camelCase alternatives for TypeScript flexibility (backend uses these)
  thumbnailUrl?: string;
  fullSizeUrl?: string;
  pricePerML?: number;
}