import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Rating, RatingsContextType } from '../types/rating';
import { STORAGE_KEYS } from '../types/constants';
import { handleError } from '../types/error';
import { useAuth } from '../src/context/AuthContext';
import * as api from '../src/services/api';

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function RatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // State for favorite perfume IDs
  const [isLoadingRatings, setIsLoadingRatings] = useState(true); // Renamed
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true); // Added
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Fetch all user ratings from the backend
  const fetchUserRatings = useCallback(async () => {
    try {
      setIsLoadingRatings(true);

      // Use the new API function to get all user ratings
      try {
        const userRatings = await api.getAllUserRatings();
        if (userRatings && userRatings.length > 0) {
          // Convert API ratings to our internal format
          const formattedRatings: Rating[] = userRatings.map(apiRating => ({
            perfumeId: apiRating.perfume.toString(), // Convert to string if it's a number
            rating: apiRating.rating,
            timestamp: new Date(apiRating.timestamp).getTime(),
          }));

          setRatings(formattedRatings);

          // Also update local storage for offline access
          await AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(formattedRatings));
          return;
        }
      } catch (apiError) {
        console.error('Error fetching ratings from API:', apiError);
      }

      // Fallback to local storage if API fails or returns no ratings
      const savedRatings = await AsyncStorage.getItem(STORAGE_KEYS.RATINGS);
      if (savedRatings) {
        console.log('Loading ratings from storage:', savedRatings);
        setRatings(JSON.parse(savedRatings));
      }

    } catch (err) {
      const appError = handleError(err);
      console.error('Error fetching user ratings:', appError);
      setError(`Error fetching ratings: ${appError.message}`);

      // Fallback to local storage if overall process fails
      try {
        const savedRatings = await AsyncStorage.getItem(STORAGE_KEYS.RATINGS);
        if (savedRatings) {
          setRatings(JSON.parse(savedRatings));
        }
      } catch (storageErr) {
        console.error('Error loading ratings from storage:', storageErr);
      }
    } finally {
      setIsLoadingRatings(false);
    }
  }, []);

  // Load ratings based on authentication status
  useEffect(() => {
    const loadRatings = async () => {
      try {
        setIsLoadingRatings(true);

        // If authenticated, try to fetch ratings from API
        if (isAuthenticated && user) {
          await fetchUserRatings();
        } else {
          // Not authenticated, load from local storage
          const savedRatings = await AsyncStorage.getItem(STORAGE_KEYS.RATINGS);
          console.log('Loading ratings from storage:', savedRatings);
          if (savedRatings) {
            setRatings(JSON.parse(savedRatings));
          }
        }
      } catch (err) {
        const appError = handleError(err);
        console.error('Error loading ratings:', appError);
        setError(`Error loading ratings: ${appError.message}`);
      } finally {
        setIsLoadingRatings(false);
      }
    };

    loadRatings();
  }, [isAuthenticated, user, fetchUserRatings]);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoadingFavorites(true);
        const savedFavorites = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (err) {
        const appError = handleError(err);
        setError(`Error loading favorites: ${appError.message}`);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    loadFavorites();
  }, []);

  // Save ratings to AsyncStorage whenever ratings change
  useEffect(() => {
    const saveRatings = async () => {
      try {
        console.log('Saving ratings to storage:', ratings);
        await AsyncStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
      } catch (err) {
        const appError = handleError(err);
        console.error('Error saving ratings:', appError);
        setError(`Error saving ratings: ${appError.message}`);
      }
    };

    if (!isLoadingRatings) {
      saveRatings();
    }
  }, [ratings, isLoadingRatings]);

  // Save favorites to AsyncStorage whenever favorites change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
      } catch (err) {
        const appError = handleError(err);
        setError(`Error saving favorites: ${appError.message}`);
      }
    };

    if (!isLoadingFavorites) {
      saveFavorites();
    }
  }, [favorites, isLoadingFavorites]);

  const addRating = useCallback(async (perfumeId: string, rating: number, aiMatch?: number) => { // Updated perfumeId type
    try {
      // Update local state
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
      throw err; // Re-throw error for potential handling upstream
    }
  }, []);

  const getRating = useCallback((perfumeId: string): Rating | undefined => { // Updated perfumeId type
    return ratings.find(rating => rating.perfumeId === perfumeId);
  }, [ratings]);

  const clearRatings = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.RATINGS);
      setRatings([]);

      // If authenticated, also clear in backend (implement when API is available)
      if (isAuthenticated) {
        // TODO: API call to clear ratings in backend
      }
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      throw err;
    }
  }, [isAuthenticated]);

  // --- Favorite Management ---

  const addFavorite = useCallback(async (perfumeId: string) => {
    try {
      setFavorites(prevFavorites => {
        if (prevFavorites.includes(perfumeId)) {
          return prevFavorites; // Already a favorite
        }
        return [...prevFavorites, perfumeId];
      });
    } catch (err) {
      const appError = handleError(err);
      setError(`Error adding favorite: ${appError.message}`);
      throw err;
    }
  }, []);

  const removeFavorite = useCallback(async (perfumeId: string) => {
    try {
      setFavorites(prevFavorites => prevFavorites.filter(id => id !== perfumeId));
    } catch (err) {
      const appError = handleError(err);
      setError(`Error removing favorite: ${appError.message}`);
      throw err;
    }
  }, []);

  const isFavorite = useCallback((perfumeId: string): boolean => {
    return favorites.includes(perfumeId);
  }, [favorites]);

  const clearFavorites = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.FAVORITES);
      setFavorites([]);
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      throw err;
    }
  }, []);

  // --- Context Value ---

  const value = {
    ratings,
    favorites, // Added
    isLoadingRatings, // Renamed
    isLoadingFavorites, // Added
    error,
    addRating,
    getRating,
    clearRatings,
    fetchUserRatings, // Add this to allow manual refresh
    addFavorite, // Added
    removeFavorite, // Added
    isFavorite, // Added
    clearFavorites, // Added
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