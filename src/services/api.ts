import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// --- Type Definitions ---
// (Mirroring types from AuthContext for consistency)
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  // Add other fields if your UserCreateSerializer requires them
}

// --- Configuration ---
// TODO: Replace with your actual backend URL from environment variables or config
// IMPORTANT: Replace 'YOUR_MACHINE_IP' with your computer's local network IP address
// if running Expo Go on a physical device. Find it using 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux).
// Example: 'http://192.168.1.100:8000/api'
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://127.0.0.1:8000/api';

const AUTH_TOKEN_KEY = 'authToken';

// --- Helper Functions ---

/**
 * Retrieves the stored authentication token.
 */
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Stores the authentication token.
 */
const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

/**
 * Removes the authentication token.
 */
const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

/**
 * Creates standard headers for API requests, including Authorization if token exists.
 */
const createHeaders = async (includeAuth = true): Promise<HeadersInit> => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (includeAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
  }
  return headers;
};

/**
 * Handles API response, parsing JSON or throwing errors.
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON
      errorData = { detail: response.statusText || 'Network response was not ok' };
    }
    console.error('API Error:', response.status, errorData);
    // Throw an error that includes status and detail if possible
    const error = new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
  // Handle cases with no content (e.g., 204 No Content)
  if (response.status === 204) {
    return null;
  }
  try {
    return await response.json();
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    throw new Error('Failed to parse JSON response');
  }
};

// --- API Service Functions ---

/**
 * Logs in a user using email and password.
 * Stores the token on success.
 */
export const login = async ({ email, password }: LoginCredentials) => { // Add types
  const response = await fetch(`${API_BASE_URL}/auth/token/login/`, {
    method: 'POST',
    headers: await createHeaders(false), // Don't send auth token for login
    body: JSON.stringify({ email, password }), // Use destructured values
  });
  const data = await handleResponse(response);
  if (data?.auth_token) {
    await setToken(data.auth_token);
  }
  return data; // Contains the auth_token
};

/**
 * Logs out the current user.
 * Removes the token.
 */
export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/logout/`, {
      method: 'POST',
      headers: await createHeaders(true), // Send auth token for logout
    });
    // Djoser logout returns 204 No Content on success, handleResponse handles this
    await handleResponse(response);
  } catch (error) {
    console.error('Logout failed:', error);
    // Decide if you want to remove the token even if the API call fails
    // For example, if the token is invalid, the API call might fail,
    // but we still want to log the user out locally.
  } finally {
    await removeToken(); // Always remove token locally on logout attempt
  }
};

/**
 * Registers a new user.
 * Djoser might automatically log in the user upon successful registration
 * depending on settings, but we don't store the token here explicitly.
 * The login function should be called separately if needed.
 */
export const register = async (userData: RegisterData) => { // Add type
    // Note: Djoser's USER_CREATE_PASSWORD_RETYPE defaults to False.
    // If you enable it in Django settings, add a re_password field here and in the frontend form.
    const url = `${API_BASE_URL}/auth/users/`;
    console.log(`Attempting to register user at: ${url}`); // Log URL
    console.log(`Registration data: ${JSON.stringify(userData)}`); // Log data being sent
    const response = await fetch(`${API_BASE_URL}/auth/users/`, {
        method: 'POST',
        headers: await createHeaders(false),
        body: JSON.stringify(userData),
    });
    return handleResponse(response);
};


/**
 * Makes a GET request to an API endpoint.
 */
export const get = async (endpoint: string, params?: Record<string, string>) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: await createHeaders(),
  });
  return handleResponse(response);
};

/**
 * Makes a POST request to an API endpoint.
 */
export const post = async (endpoint: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

/**
 * Makes a PUT request to an API endpoint.
 */
export const put = async (endpoint: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: await createHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

/**
 * Makes a PATCH request to an API endpoint.
 */
export const patch = async (endpoint: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: await createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  };


/**
 * Makes a DELETE request to an API endpoint.
 */
export const del = async (endpoint: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: await createHeaders(),
  });
  return handleResponse(response);
};

// --- Export Auth Helpers ---
export const authUtils = {
  getToken,
  setToken,
  removeToken,
};

// Example usage for fetching perfumes:
// import { get } from './services/api';
// const perfumes = await get('/perfumes/');

// Example usage for login:
// import { login } from './services/api';
// try {
//   const loginResponse = await login('user@example.com', 'password123');
//   console.log('Login successful, token:', loginResponse.auth_token);
// } catch (error) {
//   console.error('Login failed:', error);
// }