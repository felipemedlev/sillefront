import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// --- Type Definitions ---
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  // Add other fields if your UserCreateSerializer requires them
}

// --- API Type Definitions (Add new types here) ---
export interface ApiPerfumeSummary {
  id: number;
  name: string;
  brand: string; // Assuming brand is stringified in the serializer
  thumbnailUrl: string | null;
  pricePerML: number | null; // Assuming DecimalField maps to number or null
}

export interface ApiPredefinedBox {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  gender: 'masculino' | 'femenino' | null;
  perfumes: ApiPerfumeSummary[];
}


const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://127.0.0.1:8000/api';
const AUTH_TOKEN_KEY = 'authToken';

// --- Helper Functions ---
const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

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

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { detail: response.statusText || 'Network response was not ok' };
    }
    console.error('API Error:', response.status, errorData);
    const error = new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }
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

// --- API Functions ---

type PerfumeFilters = {
  brands?: number[]; // Expect brand IDs
  occasions?: number[]; // Expect Occasion IDs
  priceRange?: { min: number; max: number } | null;
  genders?: string[]; // Expect keys: 'male', 'female', 'unisex'
  dayNights?: string[]; // Expect keys: 'day', 'night'
  seasons?: string[]; // Expect keys: 'winter', 'summer', etc.
};

export const fetchPerfumes = async (
  page = 1,
  pageSize = 20,
  searchQuery = '',
  filters: PerfumeFilters = {}
) => {
  const headers = await createHeaders();
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (searchQuery) params.append('search', searchQuery);
  // Send IDs as comma-separated strings
  if (filters.brands?.length) params.append('brand', filters.brands.map(String).join(','));
  if (filters.occasions?.length) params.append('occasions', filters.occasions.map(String).join(',')); // Send Occasion IDs

  // Send keys as comma-separated strings
  if (filters.genders?.length) params.append('gender', filters.genders.join(','));
  if (filters.seasons?.length) params.append('season', filters.seasons.join(','));
  if (filters.dayNights?.length) params.append('best_for', filters.dayNights.join(',')); // Use 'best_for' parameter

  // Add price range filters (using explicit filter names from filters.py)
  if (filters.priceRange?.min != null) params.append('price_min', String(filters.priceRange.min));
  if (filters.priceRange?.max != null) params.append('price_max', String(filters.priceRange.max));

  const url = `${API_BASE_URL}/perfumes/?${params.toString()}`;
  // console.log('Fetching perfumes with URL:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  return handleResponse(response);
};

export const fetchBrands = async () => {
  const headers = await createHeaders(false); // No auth needed usually for public list
  const url = `${API_BASE_URL}/brands/`; // Assuming endpoint exists
  // console.log('Fetching brands with URL:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  // Assuming API returns { results: [{ id: number, name: string }] } or just [{ id: number, name: string }]
  const data = await handleResponse(response);
  return data.results ?? data; // Handle potential pagination wrapper
};

export const fetchOccasions = async () => {
  const headers = await createHeaders(false); // No auth needed usually
  const url = `${API_BASE_URL}/occasions/`; // Assuming endpoint exists
  // console.log('Fetching occasions with URL:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  const data = await handleResponse(response);
  return data.results ?? data; // Handle potential pagination wrapper
};

export const login = async ({ email, password }: LoginCredentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/token/login/`, {
    method: 'POST',
    headers: await createHeaders(false),
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(response);
  if (data?.auth_token) {
    await setToken(data.auth_token);
  }
  return data;
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/logout/`, {
      method: 'POST',
      headers: await createHeaders(true),
    });
    await handleResponse(response);
  } catch (error) {
    // console.error('Logout failed:', error);
  } finally {
    await removeToken();
  }
};

export const register = async (userData: RegisterData) => {
  const response = await fetch(`${API_BASE_URL}/auth/users/`, {
    method: 'POST',
    headers: await createHeaders(false),
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
};

export const fetchPerfumesByExternalIds = async (externalIds: string[]): Promise<any[]> => {
  if (!externalIds.length) return [];
  const headers = await createHeaders();
  const params = new URLSearchParams();
  params.append('external_ids', externalIds.join(','));
  const url = `${API_BASE_URL}/perfumes/by_external_ids/?${params.toString()}`;
  // console.log('Fetching similar perfumes with URL:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  return handleResponse(response);
};

export const getPredefinedBoxes = async (gender?: 'masculino' | 'femenino'): Promise<ApiPredefinedBox[]> => {
  const headers = await createHeaders(false); // Assuming public access
  const params = new URLSearchParams();
  if (gender) {
    params.append('gender', gender);
  }
  // Corrected endpoint based on SilleBack/api/urls.py registration
  const url = `${API_BASE_URL}/boxes/predefined/?${params.toString()}`;
  // console.log('Fetching predefined boxes with URL:', url);

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  // Handle potential pagination wrapper from DRF ViewSets
  const data = await handleResponse(response);
  if (Array.isArray(data)) {
    return data as ApiPredefinedBox[]; // Return data if it's already an array
  } else if (data && Array.isArray(data.results)) {
    return data.results as ApiPredefinedBox[]; // Return the results array if paginated
  }
  console.warn("Unexpected response structure for predefined boxes:", data);
  return []; // Return empty array as fallback
};

// --- Utility HTTP Methods ---

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

export const post = async (endpoint: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: await createHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const put = async (endpoint: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: await createHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const patch = async (endpoint: string, data: any) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PATCH',
    headers: await createHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const del = async (endpoint: string) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE',
    headers: await createHeaders(),
  });
  return handleResponse(response);
};

export const authUtils = {
  getToken,
  setToken,
  removeToken,
};