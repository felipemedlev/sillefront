import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types/constants';

// Define the User type
type User = {
  email: string;
  name?: string | null; // Optional & Nullable
  phone?: string | null; // Optional & Nullable
  address?: string | null; // Optional & Nullable
};

// Define the shape of the context data and functions
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Omit<User, 'email'>) => Promise<void>; // Added
  updatePassword: (newPassword: string) => Promise<void>; // Added
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the props for the provider component
type AuthProviderProps = {
  children: ReactNode;
};

// Create the provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Effect to load user from storage on mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true);
      try {
        // 1. Check who is the currently logged-in user (if any)
        const userEmail = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER_EMAIL);

        if (userEmail) {
          // 2. If a user is logged in, load their full data
          const userDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${userEmail}`;
          const storedData = await AsyncStorage.getItem(userDataKey);

          if (storedData) {
            const userData = JSON.parse(storedData);
            // Set state with all stored data (excluding password)
            setUser({
              email: userEmail,
              name: userData.name ?? null,
              phone: userData.phone ?? null,
              address: userData.address ?? null,
            });
          } else {
            // Data inconsistency: email stored but no user data found. Log error and treat as logged out.
            console.error(`Error: No data found for logged-in user ${userEmail}`);
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER_EMAIL); // Clean up inconsistent state
            setUser(null);
          }
        } else {
          // No user logged in
          setUser(null);
        }
      } catch (error) {
        console.error("Error cargando usuario desde AsyncStorage:", error);
        setUser(null); // Ensure user is null on error
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // --- Authentication Functions ---

  // signUp remains unchanged - only stores email and password initially
  const signUp = async (email: string, pass: string): Promise<void> => {
    console.log("signUp called with:", email, pass);
    const userDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${email}`;
    // Check if user already exists (optional but recommended)
    const existingData = await AsyncStorage.getItem(userDataKey);
    if (existingData) {
        throw new Error("El correo electrónico ya está registrado.");
    }
    // Store only password initially
    await AsyncStorage.setItem(userDataKey, JSON.stringify({ password: pass }));
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER_EMAIL, email);
    // Set user state with only email initially
    setUser({ email });
  };

  const login = async (email: string, pass: string): Promise<void> => {
    console.log("login called with:", email, pass);
    const userDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${email}`;
    const storedData = await AsyncStorage.getItem(userDataKey);
    if (storedData) {
        const userData = JSON.parse(storedData);
        if (userData.password === pass) {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER_EMAIL, email);
            // Set state with all stored data (excluding password) on login
            setUser({
              email: email,
              name: userData.name ?? null,
              phone: userData.phone ?? null,
              address: userData.address ?? null,
            });
        } else {
            throw new Error("Email o contraseña incorrectos");
        }
    } else {
        throw new Error("Email o contraseña incorrectos");
    }
  };

  const logout = async (): Promise<void> => {
    console.log("logout called");
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER_EMAIL);
    setUser(null);
  };

  // --- Profile Update Functions ---

  const updateProfile = async (updates: Omit<User, 'email'>): Promise<void> => {
    if (!user) {
      throw new Error("Usuario no autenticado.");
    }
    console.log("updateProfile called with:", updates);
    const userDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.email}`;
    try {
      // Retrieve current data
      const storedData = await AsyncStorage.getItem(userDataKey);
      const currentData = storedData ? JSON.parse(storedData) : {};

      // Merge updates with current data (keeping existing password)
      const updatedData = {
        ...currentData, // Keep existing fields like password
        name: updates.name ?? currentData.name ?? null,
        phone: updates.phone ?? currentData.phone ?? null,
        address: updates.address ?? currentData.address ?? null,
      };

      // Save updated data
      await AsyncStorage.setItem(userDataKey, JSON.stringify(updatedData));

      // Update context state (excluding password)
      setUser({
        email: user.email,
        name: updatedData.name,
        phone: updatedData.phone,
        address: updatedData.address,
      });
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      throw new Error("No se pudo actualizar el perfil.");
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    if (!user) {
      throw new Error("Usuario no autenticado.");
    }
    console.log("updatePassword called");
    const userDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${user.email}`;
    try {
      // Retrieve current data
      const storedData = await AsyncStorage.getItem(userDataKey);
      // Ensure data exists, otherwise something is wrong
      if (!storedData) {
          throw new Error("No se encontraron datos del usuario.");
      }
      const currentData = JSON.parse(storedData);

      // Update only the password field
      const updatedData = {
        ...currentData,
        password: newPassword,
      };

      // Save updated data
      await AsyncStorage.setItem(userDataKey, JSON.stringify(updatedData));
      // No need to update user state in context for password change
    } catch (error) {
      console.error("Error actualizando contraseña:", error);
      throw new Error("No se pudo actualizar la contraseña.");
    }
  };

  // --- End Update Functions ---

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      signUp,
      login,
      logout,
      updateProfile, // Added
      updatePassword, // Added
    }),
    [user, isLoading] // Dependencies for memoization (functions are stable due to useCallback/definition scope)
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create the custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};