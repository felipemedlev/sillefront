import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Perfume {
  id: number;
  name: string;
  brand: string;
  image: string;
}

interface Rating {
  perfumeId: number;
  rating: number;
  aiMatch?: number;
}

interface RatingsContextType {
  ratings: Rating[];
  addRating: (perfumeId: number, rating: number, aiMatch?: number) => void;
  getRating: (perfumeId: number) => Rating | undefined;
}

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

const STORAGE_KEY = 'perfume_ratings';

export function RatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<Rating[]>(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const savedRatings = localStorage.getItem(STORAGE_KEY);
      return savedRatings ? JSON.parse(savedRatings) : [];
    }
    return [];
  });

  // Save to localStorage whenever ratings change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
    }
  }, [ratings]);

  const addRating = (perfumeId: number, rating: number, aiMatch?: number) => {
    setRatings(prevRatings => {
      const existingRatingIndex = prevRatings.findIndex(r => r.perfumeId === perfumeId);
      if (existingRatingIndex !== -1) {
        const newRatings = [...prevRatings];
        newRatings[existingRatingIndex] = { perfumeId, rating, aiMatch };
        return newRatings;
      }
      return [...prevRatings, { perfumeId, rating, aiMatch }];
    });
  };

  const getRating = (perfumeId: number) => {
    return ratings.find(rating => rating.perfumeId === perfumeId);
  };

  return (
    <RatingsContext.Provider value={{ ratings, addRating, getRating }}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings() {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
}