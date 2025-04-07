export interface BasicPerfumeInfo {
  id: string;
  name: string;
  brand: string;
  thumbnailUrl: string;
  fullSizeUrl: string;
}

export interface Perfume extends BasicPerfumeInfo {
  matchPercentage?: number;
  pricePerML?: number;
  description?: string;
  accords?: string[];
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
  overallRating?: number;
  dayNightRating?: number;
  seasonRating?: number;
  priceValueRating?: number;
  sillageRating?: number;
  longevityRating?: number;
  similarPerfumes?: string[];
  occasions?: string[];
  gender: 'masculino' | 'femenino' | 'unisex';
}