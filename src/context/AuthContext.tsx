import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as api from '../services/api'; // Import your API service
import { authUtils } from '../services/api'; // Import token utilities

// Define interfaces for credentials and user data
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  // Add other fields if your UserCreateSerializer requires them (e.g., username, first_name)
}

interface AuthContextType {
  token: string | null;
  user: any | null; // TODO: Replace 'any' with your actual User type from backend models/serializers
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>; // Use specific type
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>; // Use specific type
  // Add other auth-related functions if needed (e.g., fetchUserProfile)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null); // Replace 'any' with User type
  const [isLoading, setIsLoading] = useState(true); // Start loading until token is checked

  // Check for token on initial load
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await authUtils.getToken();
      if (storedToken) {
        setToken(storedToken);
        // Optionally: Fetch user profile based on the token
        // await fetchUserProfile(storedToken);
      }
      setIsLoading(false);
    };
    loadToken();
  }, []);

  // TODO: Implement fetchUserProfile if needed
  // const fetchUserProfile = async (currentToken) => {
  //   if (!currentToken) return;
  //   try {
  //     // Assuming you have an endpoint like /auth/users/me/
  //     const userData = await api.get('/auth/users/me/');
  //     setUser(userData);
  //   } catch (error) {
  //     console.error("Failed to fetch user profile:", error);
  //     // Token might be invalid, log out
  //     await handleLogout();
  //   }
  // };

  const handleLogin = async ({ email, password }: LoginCredentials) => { // Destructure and type credentials
    try {
      setIsLoading(true);
      const response = await api.login(email, password);
      if (response?.auth_token) {
        setToken(response.auth_token);
        // Optionally fetch user profile after login
        // await fetchUserProfile(response.auth_token);
      } else {
          throw new Error('Login failed: No auth token received');
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error('Login error in context:', error);
      await handleLogout(); // Ensure clean state on login failure
      throw error; // Re-throw error for the component to handle (e.g., show message)
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await api.logout(); // Call API logout
    } catch (error) {
        console.error('API logout error:', error);
        // Continue local logout even if API fails
    } finally {
        setToken(null);
        setUser(null);
        setIsLoading(false);
    }
  };

  const handleRegister = async (userData: RegisterData) => { // Type userData
    try {
        setIsLoading(true);
        // Adjust userData structure if needed based on your UserCreateSerializer
        await api.register(userData);
        // Decide if you want to automatically log in after registration
        // If so, call handleLogin here or prompt the user to log in.
        // For now, registration just creates the user.
        setIsLoading(false);
    } catch (error) {
        setIsLoading(false);
        console.error('Registration error in context:', error);
        throw error; // Re-throw for component handling
    }
  };


  const value = {
    token,
    user,
    isAuthenticated: !!token, // Simple check based on token presence
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};