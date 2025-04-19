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
        } else {
          console.log('No ratings found from API, using local storage');
        }
      } catch (apiError) {
        console.error('Error fetching ratings from API:', apiError);
        // Continue to fallback to local storage
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

  // Submit all locally stored ratings to the backend
  const submitRatingsToBackend = useCallback(async (): Promise<boolean> => {
    try {
      if (!isAuthenticated || !user) {
        console.log('User not authenticated, ratings saved locally only');
        return false;
      }

      if (ratings.length === 0) {
        console.log('No ratings to submit');
        return false;
      }

      console.log('Attempting to submit local ratings to backend');
      let successCount = 0;

      // Create a list to track successfully submitted ratings
      const successfulRatings: Rating[] = [];

      // Submit each rating one by one to the backend
      const submissionPromises = ratings.map(async (rating) => {
        try {
          await api.submitRating(rating.perfumeId, rating.rating);
          successCount++;
          successfulRatings.push(rating);
          return true;
        } catch (err: any) {
          // Check if it's a 404 (endpoint not found) error
          if (err.status === 404 || (err.message && err.message.includes('404'))) {
            console.warn(`API endpoint for rating perfume ${rating.perfumeId} not found. This feature may not be implemented yet on the backend.`);
          } else {
            console.error(`Error submitting rating for perfume ${rating.perfumeId}:`, err);
          }
          return false;
        }
      });

      try {
        // Wait for all submissions to complete
        await Promise.all(submissionPromises);

        console.log(`Successfully submitted ${successCount}/${ratings.length} ratings to backend`);

        // Instead of fetching again (which can cause loops), just update our state
        // to reflect what we know was successfully uploaded
        if (successCount > 0) {
          // Don't trigger fetchUserRatings() as it can cause an infinite loop
          // Just mark these ratings as having timestamps from the server
          const now = new Date().getTime();

          setRatings(prevRatings =>
            prevRatings.map(rating => {
              // If this rating was successfully submitted, update its timestamp
              const wasSubmitted = successfulRatings.some(r => r.perfumeId === rating.perfumeId);
              if (wasSubmitted) {
                return { ...rating, timestamp: now };
              }
              return rating;
            })
          );
        }

        return successCount > 0;
      } catch (promiseError) {
        console.error('Error processing rating submissions:', promiseError);
        return successCount > 0; // Still return true if any succeeded
      }
    } catch (err) {
      const appError = handleError(err);
      console.error('Error submitting ratings to backend:', appError);
      setError(`Error submitting ratings: ${appError.message}`);
      return false;
    }
  }, [isAuthenticated, user, ratings]);

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
    submitRatingsToBackend, // Add new function to submit ratings to backend
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