import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../types/constants';

// Define the User type
type User = {
  email: string;
};

// Define the shape of the context data and functions
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
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
        const userEmail = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER_EMAIL);
        if (userEmail) {
          // In a real app, you might fetch full user details here
          setUser({ email: userEmail });
        } else {
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

  // --- Placeholder Functions ---

  const signUp = async (email: string, pass: string): Promise<void> => {
    // TODO: Implement sign up logic (Phase 1, Step 3)
    console.log("signUp called with:", email, pass);
    // Placeholder: Simulate successful signup for now
    const userDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${email}`;
    await AsyncStorage.setItem(userDataKey, JSON.stringify({ password: pass })); // Store plain text password
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER_EMAIL, email);
    setUser({ email });
    // In a real scenario, add error handling for existing email etc.
  };

  const login = async (email: string, pass: string): Promise<void> => {
    // TODO: Implement login logic (Phase 1, Step 3)
    console.log("login called with:", email, pass);
    // Placeholder: Simulate successful login for now
    const userDataKey = `${STORAGE_KEYS.USER_DATA_PREFIX}${email}`;
    const storedData = await AsyncStorage.getItem(userDataKey);
    if (storedData) {
        const userData = JSON.parse(storedData);
        if (userData.password === pass) {
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER_EMAIL, email);
            setUser({ email });
        } else {
            throw new Error("Email o contraseña incorrectos");
        }
    } else {
        throw new Error("Email o contraseña incorrectos");
    }
    // In a real scenario, add error handling for incorrect credentials etc.
  };

  const logout = async (): Promise<void> => {
    // TODO: Implement logout logic (Phase 1, Step 3)
    console.log("logout called");
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER_EMAIL);
    setUser(null);
  };

  // --- End Placeholder Functions ---

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      signUp,
      login,
      logout,
    }),
    [user, isLoading] // Dependencies for memoization
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