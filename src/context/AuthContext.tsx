import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as api from '../services/api'; // Import your API service
import { authUtils } from '../services/api'; // Import token utilities
import Constants from 'expo-constants';

// Define API_BASE_URL matching the one in api.ts
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://127.0.0.1:8000/api';
const AUTH_TOKEN_KEY = 'auth.token';
const AUTH_STATE_EVENT = 'auth.changed';

// Define interfaces for credentials and user data

interface User {
 id: number;
 email: string;
 username: string;
 first_name?: string;
 last_name?: string;
 name?: string | null;
 phone?: string | null;
 address?: string | null;
 // Add other fields matching your backend UserSerializer if needed
}
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
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; error?: string; }>; // Updated return type
  fetchUserProfile: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'first_name' | 'last_name' | 'phone' | 'address'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Custom event for auth state changes
const createAuthEvent = () => {
  return new Event(AUTH_STATE_EVENT);
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Token management with SecureStore for native and localStorage for web
  const storeToken = async (newToken: string | null): Promise<void> => {
    try {
      if (newToken) {
        // Web implementation - use localStorage
        localStorage.setItem(AUTH_TOKEN_KEY, newToken);
        // Also update in AsyncStorage for compatibility with other parts of the app
        await authUtils.setToken(newToken);
      } else {
        // Remove token
        localStorage.removeItem(AUTH_TOKEN_KEY);
        await authUtils.removeToken();
      }

      // Update state and notify observers
      setToken(newToken);
      window.dispatchEvent(createAuthEvent());

    } catch (error) {
      console.error('Token storage error:', error);
    }
  };

  // Load token from storage
  const loadToken = async (): Promise<string | null> => {
    try {
      // Web implementation - use localStorage
      let loadedToken = localStorage.getItem(AUTH_TOKEN_KEY);

      // Fall back to AsyncStorage if needed
      if (!loadedToken) {
        loadedToken = await authUtils.getToken();
        // If found in AsyncStorage but not localStorage, migrate it
        if (loadedToken) {
          localStorage.setItem(AUTH_TOKEN_KEY, loadedToken);
        }
      }

      return loadedToken;
    } catch (error) {
      console.error('Token loading error:', error);
      return null;
    }
  };

  // Verify token is valid by making a test request
  const verifyToken = async (tokenToVerify: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/me/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${tokenToVerify}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  // Check for token on initial load and verify it
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const storedToken = await loadToken();

        if (storedToken) {
          // Verify token is valid
          const isValid = await verifyToken(storedToken);

          if (isValid) {
            setToken(storedToken);
            await fetchUserProfile(storedToken);
          } else {
            await storeToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const fetchUserProfile = async (tokenToUse?: string) => {
    const activeToken = tokenToUse || token;
    if (!activeToken) {
      return;
    }

    try {
      setError(null);
      const userData = await api.get('/auth/users/me/');
      setUser(userData);
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to fetch user profile');
      // Clear auth if token is invalid
      if (err.status === 401 || err.status === 403) {
        await storeToken(null);
      }
    }
  };

  const handleLogin = async ({ email, password }: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear existing token first
      await storeToken(null);

      const response = await api.login({ email, password });

      if (response?.auth_token) {
        // Store the new token
        await storeToken(response.auth_token);

        // Fetch user profile with the new token
        await fetchUserProfile(response.auth_token);
      } else {
        throw new Error('Login failed: No auth token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Attempt server logout if we have a token
      if (token) {
        try {
          await api.logout();
        } catch (error) {
          console.error('Server logout error:', error);
          // Continue with client-side logout regardless
        }
      }

      // Clear local auth state
      setUser(null);
      await storeToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: RegisterData): Promise<{ success: boolean; error?: string; }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Register the user
      await api.register(userData);

      // Auto-login after successful registration
      try {
        const loginResponse = await api.login({
          email: userData.email,
          password: userData.password
        });

        if (loginResponse?.auth_token) {
          // Store the token
          await storeToken(loginResponse.auth_token);

          // Create minimal user object for immediate UI feedback
          setUser({
            id: 0, // Will be updated by fetchUserProfile
            email: userData.email,
            username: '' // Will be updated by fetchUserProfile
          });

          // Fetch full profile in background with the new token
          fetchUserProfile(loginResponse.auth_token).catch(err => {
            console.error('Profile fetch after registration failed:', err);
          });

          return { success: true };
        }
      } catch (loginErr) {
        console.error('Auto-login after registration failed:', loginErr);
        // Registration was still successful even if auto-login failed
      }

      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err?.data?.email?.[0] ||
                          err?.data?.password?.[0] ||
                          err?.data?.non_field_errors?.[0] ||
                          err.message ||
                          'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    if (!token) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);
      await api.post('/auth/users/set_password/', {
        current_password: '', // Optionally require current password
        new_password: newPassword,
      });
    } catch (err: any) {
      console.error('Password update error:', err);
      setError(err.message || 'Failed to update password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'phone' | 'address'>>): Promise<void> => {
    if (!token) throw new Error('Not authenticated');

    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await api.patch('/auth/users/me/', updates);
      setUser((prev) => prev ? { ...prev, ...updatedUser } : updatedUser);
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    fetchUserProfile,
    updatePassword,
    updateProfile,
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