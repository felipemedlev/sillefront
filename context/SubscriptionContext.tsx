import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionStatus, SubscriptionTier } from '../types/subscription';
import { STORAGE_KEYS } from '../types/constants';
import { handleError } from '../types/error'; // Assuming you have a standard error handler

// Define the shape of the context data and functions
interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  subscribe: (tier: SubscriptionTier) => Promise<void>;
  unsubscribe: () => Promise<void>;
}

// Create the context with an undefined default value
const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Define the props for the provider component
interface SubscriptionProviderProps {
  children: ReactNode;
}

// Create the SubscriptionProvider component
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Effect to load subscription status from storage on mount
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const savedStatus = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);
        if (savedStatus) {
          setSubscriptionStatus(JSON.parse(savedStatus));
        } else {
          setSubscriptionStatus(null); // Explicitly set to null if nothing is found
        }
      } catch (err) {
        const appError = handleError(err);
        console.error("Error loading subscription status:", appError);
        setError(`Error loading subscription: ${appError.message}`);
        setSubscriptionStatus(null); // Ensure status is null on error
      } finally {
        setIsLoading(false);
      }
    };

    loadSubscriptionStatus();
  }, []);

  // Function to subscribe the user to a specific tier
  const subscribe = useCallback(async (tier: SubscriptionTier) => {
    setError(null);
    try {
      const newStatus: SubscriptionStatus = {
        isActive: true,
        tier: tier,
        startDate: Date.now(), // Record the start date as a timestamp
      };
      await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, JSON.stringify(newStatus));
      setSubscriptionStatus(newStatus);
      console.log(`Subscribed to tier: ${tier}`);
      // Placeholder: In a real app, trigger payment flow here before saving/setting state
    } catch (err) {
      const appError = handleError(err);
      console.error("Error subscribing:", appError);
      setError(`Error subscribing: ${appError.message}`);
      // Optionally revert state or notify user more prominently
    }
  }, []);

  // Function to unsubscribe the user
  const unsubscribe = useCallback(async () => {
    setError(null);
    try {
      // Option 1: Mark as inactive
      // const updatedStatus: SubscriptionStatus = {
      //   ...(subscriptionStatus ?? { isActive: false, tier: null, startDate: null }), // Keep existing data if possible
      //   isActive: false,
      // };
      // await AsyncStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_STATUS, JSON.stringify(updatedStatus));
      // setSubscriptionStatus(updatedStatus);

      // Option 2: Remove entirely (simpler for this client-side version)
      await AsyncStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION_STATUS);
      setSubscriptionStatus(null);

      console.log("Unsubscribed");
      // Placeholder: In a real app, communicate with backend/payment provider
    } catch (err) {
      const appError = handleError(err);
      console.error("Error unsubscribing:", appError);
      setError(`Error unsubscribing: ${appError.message}`);
    }
  }, []); // Removed subscriptionStatus dependency for Option 2

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      subscriptionStatus,
      isLoading,
      error,
      subscribe,
      unsubscribe,
    }),
    [subscriptionStatus, isLoading, error, subscribe, unsubscribe]
  );

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
};

// Create the custom hook to use the subscription context
export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};