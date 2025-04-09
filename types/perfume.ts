export interface BasicPerfumeInfo {
  id: string;
  name: string;
  brand: string;
  thumbnailUrl: string;
  fullSizeUrl: string;
}

export interface Perfume extends BasicPerfumeInfo {
  external_id: string; // Added external ID from backend
  matchPercentage?: number;
  pricePerML?: number;
  description?: string;
  accords?: string[];
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
  overallRating?: number;
  priceValueRating?: number;
  sillageRating?: number;
  longevityRating?: number;
  similarPerfumes?: string[];
  occasions?: string[];
  gender?: string;
  bestFor?: string;
  season?: string;
}