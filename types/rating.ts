export interface Rating {
  perfumeId: string; // Changed to string
  rating: number;
  aiMatch?: number;
  timestamp?: number;
}

export interface RatingsContextType {
  ratings: Rating[];
  favorites: string[]; // Added favorites state (array of perfume IDs)
  isLoadingRatings: boolean; // Renamed for clarity
  isLoadingFavorites: boolean; // Added loading state for favorites
  error: string | null;
  addRating: (perfumeId: string, rating: number, aiMatch?: number) => Promise<void>; // Updated perfumeId type
  getRating: (perfumeId: string) => Rating | undefined; // Updated perfumeId type
  clearRatings: () => Promise<void>;
  fetchUserRatings: () => Promise<void>; // Added method to fetch user ratings from backend
  addFavorite: (perfumeId: string) => Promise<void>; // Added addFavorite
  removeFavorite: (perfumeId: string) => Promise<void>; // Added removeFavorite
  isFavorite: (perfumeId: string) => boolean; // Added isFavorite
  clearFavorites: () => Promise<void>; // Added clearFavorites
}