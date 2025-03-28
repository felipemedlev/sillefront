import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rating, RatingsContextType } from '../types/rating';
import { STORAGE_KEYS } from '../types/constants';
import { AppError, handleError } from '../types/error';

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function RatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load ratings from AsyncStorage on mount
  useEffect(() => {
    const loadRatings = async () => {
      try {
        setIsLoading(true);
        const savedRatings = await AsyncStorage.getItem(STORAGE_KEYS.RATINGS);
        if (savedRatings) {
          setRatings(JSON.parse(savedRatings));
        }
      } catch (err) {
        const appError = handleError(err);
        setError(appError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRatings();
  }, []);

  // Save to AsyncStorage whenever ratings change
  useEffect(() => {
    const saveRatings = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
      } catch (err) {
        const appError = handleError(err);
        setError(appError.message);
      }
    };

    if (!isLoading) {
      saveRatings();
    }
  }, [ratings, isLoading]);

  const addRating = useCallback(async (perfumeId: number, rating: number, aiMatch?: number) => {
    try {
      setRatings(prevRatings => {
        const existingRatingIndex = prevRatings.findIndex(r => r.perfumeId === perfumeId);
        const newRating: Rating = {
          perfumeId,
          rating,
          aiMatch,
          timestamp: Date.now()
        };

        if (existingRatingIndex !== -1) {
          const newRatings = [...prevRatings];
          newRatings[existingRatingIndex] = newRating;
          return newRatings;
        }
        return [...prevRatings, newRating];
      });
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      throw err;
    }
  }, []);

  const getRating = useCallback((perfumeId: number): Rating | undefined => {
    return ratings.find(rating => rating.perfumeId === perfumeId);
  }, [ratings]);

  const clearRatings = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RATINGS);
      setRatings([]);
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      throw err;
    }
  }, []);

  const value = {
    ratings,
    isLoading,
    error,
    addRating,
    getRating,
    clearRatings,
  };

  return (
    <RatingsContext.Provider value={value}>
      {children}
    </RatingsContext.Provider>
  );
}

export function useRatings(): RatingsContextType {
  const context = useContext(RatingsContext);
  if (context === undefined) {
    throw new Error('useRatings must be used within a RatingsProvider');
  }
  return context;
}