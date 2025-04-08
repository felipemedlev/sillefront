import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types/constants';
import * as apiService from '../src/services/api';
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
  register: (email: string, pass: string) => Promise<void>;
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

  // Updated register: calls backend API, then logs in user
  const register = async (email: string, pass: string): Promise<void> => {
    console.log("register (API) called with:", email);
    try {
      // Call backend registration endpoint
      await apiService.register({ email, password: pass });
    } catch (error: any) {
      console.error("Backend registration failed:", error);
      // If backend returns 400 with existing email error, customize message
      if (error?.data?.email) {
        throw new Error(error.data.email.join(' ') || 'Error en el registro.');
      }
      throw error;
    }

    try {
      // After successful registration, immediately login to get token
      await apiService.login({ email, password: pass });
      // Save logged-in user email locally
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER_EMAIL, email);
      // Set user state (basic info, can be expanded later)
      setUser({ email });
    } catch (error: any) {
      console.error("Auto-login after registration failed:", error);
      throw new Error('Registro exitoso, pero error al iniciar sesión automáticamente.');
    }
  };

  const login = async (email: string, pass: string): Promise<void> => {
    console.log("login (API) called with:", email);
    try {
      await apiService.login({ email, password: pass });
      // Save logged-in user email locally
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER_EMAIL, email);
      // Optionally fetch user profile from backend
      try {
        const profile = await apiService.get('/auth/users/me/');
        setUser({
          email: profile.email,
          name: profile.name ?? null,
          phone: profile.phone ?? null,
          address: profile.address ?? null,
        });
      } catch (profileErr) {
        console.warn('Failed to fetch user profile after login:', profileErr);
        setUser({ email });
      }
    } catch (error: any) {
      console.error("Backend login failed:", error);
      throw new Error("Email o contraseña incorrectos");
    }
  };

  const logout = async (): Promise<void> => {
    console.log("logout (API) called");
    try {
      await apiService.logout();
    } catch (error) {
      console.warn("Backend logout failed, proceeding to clear local state anyway:", error);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER_EMAIL);
    setUser(null);
  };

  // --- Profile Update Functions ---

  const updateProfile = async (updates: Omit<User, 'email'>): Promise<void> => {
    if (!user) {
      throw new Error("Usuario no autenticado.");
    }
    console.log("updateProfile (API) called with:", updates);
    try {
      const response = await apiService.patch('/auth/users/me/', updates);
      setUser({
        email: response.email,
        name: response.name ?? null,
        phone: response.phone ?? null,
        address: response.address ?? null,
      });
    } catch (error) {
      console.error("Error actualizando perfil en backend:", error);
      throw new Error("No se pudo actualizar el perfil.");
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    if (!user) {
      throw new Error("Usuario no autenticado.");
    }
    console.log("updatePassword (API) called");
    try {
      await apiService.post('/auth/users/set_password/', {
        current_password: '', // TODO: Provide current password if required by backend
        new_password: newPassword,
      });
    } catch (error) {
      console.error("Error actualizando contraseña en backend:", error);
      throw new Error("No se pudo actualizar la contraseña.");
    }
  };

  // --- End Update Functions ---

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      register,
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