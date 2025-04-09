import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import * as api from '../services/api'; // Import your API service
import { authUtils } from '../services/api'; // Import token utilities

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
  register: (userData: RegisterData) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'first_name' | 'last_name' | 'phone' | 'address'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for token on initial load
  useEffect(() => {
    const loadTokenAndProfile = async () => {
      const storedToken = await authUtils.getToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          await fetchUserProfile();
        } catch (err) {
          console.error('Failed to fetch user profile on load:', err);
          await handleLogout();
        }
      }
      setIsLoading(false);
    };
    loadTokenAndProfile();
  }, []);

  const fetchUserProfile = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const userData = await api.get('/auth/users/me/');
      setUser(userData);
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      setError(err.message || 'Failed to fetch user profile');
      await handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async ({ email, password }: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.login({ email, password });
      if (response?.auth_token) {
        setToken(response.auth_token);
        await fetchUserProfile();
        await authUtils.setToken(response.auth_token);
      } else {
        throw new Error('Login failed: No auth token received');
      }
    } catch (err: any) {
      console.error('Login error in context:', err);
      setError(err.message || 'Login failed');
      await handleLogout();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await api.logout();
    } catch (error) {
      console.error('API logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      await authUtils.removeToken();
      setIsLoading(false);
    }
  };

  const handleRegister = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.register(userData);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Registration error in context:', err);
      setError(err.message || 'Registration failed');
      setIsLoading(false);
      throw err;
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
       console.error('Error updating password:', err);
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
       console.error('Error updating profile:', err);
       setError(err.message || 'Failed to update profile');
       throw err;
     } finally {
       setIsLoading(false);
     }
   };


  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: !!token,
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