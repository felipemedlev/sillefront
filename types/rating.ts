import { Perfume } from './perfume';

export interface Rating {
  perfumeId: number;
  rating: number;
  aiMatch?: number;
  timestamp?: number;
}

export interface RatingsContextType {
  ratings: Rating[];
  isLoading: boolean;
  error: string | null;
  addRating: (perfumeId: number, rating: number, aiMatch?: number) => Promise<void>;
  getRating: (perfumeId: number) => Rating | undefined;
  clearRatings: () => Promise<void>;
}