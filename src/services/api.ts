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
}

// --- API Type Definitions (Add new types here) ---
export interface ApiPerfumeSummary {
  id: number;
  name: string;
  brand: string;
  thumbnail_url: string | null;
  price_per_ml: number | null;
  external_id: string;
}

// Rating API Types
export interface ApiRating {
  id: number;
  perfume: number;
  rating: number;
  timestamp: string;
}

export interface ApiPredefinedBox {
    id: number;
    title: string;
    description: string | null;
    icon: string | null;
    gender: 'masculino' | 'femenino' | null;
    perfumes: ApiPerfumeSummary[];
}

// --- Recommendation API Types ---
export interface ApiRecommendation {
  perfume: ApiPerfumeSummary;
  score: number;
  last_updated: string;
}

// --- Survey API Types ---
export type ApiSurveyQuestion = {
    id: string;
    type?: 'gender';
    question?: string;
    options?: {
        id: string;
        label: string;
        emoji: string;
    }[];
    accord?: string;
    description?: string;
};

export type ApiSurveyAnswer = { [key: string]: number | string };
// --- Order API Types ---
export interface ApiOrderItem {
  id: number;
  perfume: ApiPerfumeSummary | null;
  product_type: string;
  quantity: number;
  decant_size: number | null;
  price_at_purchase: string;
  box_configuration: any | null;
  item_name: string | null;
  item_description: string | null;
}

export interface ApiOrder {
  id: number;
  user_email: string | null;
  order_date: string;
  total_price: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string | null;
  items: ApiOrderItem[];
  updated_at: string;
}

export interface ApiOrderCreatePayload {
  shipping_address: string;
}

// --- Cart API Types ---
export interface ApiCartItem {
  id: number;
  product_type: 'perfume' | 'box';
  name?: string;
  perfume: ApiPerfumeSummary | null;
  quantity: 1;
  decant_size: number | null;
  price_at_addition: string;
  box_configuration: any | null;
  added_at: string;
}

export interface ApiCart {
  id: number;
  user: { id: number; email: string; username?: string };
  items: ApiCartItem[];
  created_at: string;
  updated_at: string;
}

export interface ApiCartItemAddPayload {
  product_type: 'box';
  name: string;
  price: number;
  quantity: 1;
  box_configuration: {
    perfumes: {
      external_id?: string;
      perfume_id_backend?: number;
      name?: string;
      brand?: string;
      thumbnail_url?: string;
    }[];
    decant_size: number;
    decant_count: number;
  };
}
// --- Survey API Functions ---

export const fetchSurveyQuestions = async (): Promise<ApiSurveyQuestion[]> => {
    const headers = await createHeaders(false);
    const url = `${API_BASE_URL}/survey/questions/`;
    const response = await fetch(url, {
        method: 'GET',
        headers,
    });
    return handleResponse(response);
};

export const fetchSurveyQuestion = async (questionId: string): Promise<ApiSurveyQuestion> => {
    const headers = await createHeaders(false);
    const url = `${API_BASE_URL}/survey/questions/${questionId}/`;
    const response = await fetch(url, {
        method: 'GET',
        headers,
    });
    return handleResponse(response);
};

export const submitSurveyResponse = async (answers: ApiSurveyAnswer): Promise<any> => {
    const headers = await createHeaders(true);
    const url = `${API_BASE_URL}/survey/`;
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ response_data: answers }),
    });
    return handleResponse(response);
};

export const placeOrder = async (payload: ApiOrderCreatePayload): Promise<ApiOrder> => {
    const headers = await createHeaders(true);
    const url = `${API_BASE_URL}/orders/`;
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};
export const addItemToBackendCart = async (payload: ApiCartItemAddPayload): Promise<ApiCart> => {
    const headers = await createHeaders(true);
    const url = `${API_BASE_URL}/cart/items/`;
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};

export const removeItemFromBackendCart = async (cartItemBackendId: number): Promise<ApiCart> => {
    const headers = await createHeaders(true);
    const url = `${API_BASE_URL}/cart/items/${cartItemBackendId}/`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers,
    });
    
    // Handle the DELETE response - it might return 204 No Content
    if (response.status === 204) {
        // Item was deleted successfully, now fetch the updated cart
        const updatedCart = await fetchUserCart();
        if (updatedCart) {
            return updatedCart;
        } else {
            // Cart is now empty - return a minimal ApiCart structure
            return { 
                id: 0, 
                user: { id: 0, email: '' }, 
                items: [], 
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString() 
            };
        }
    }
    
    return handleResponse(response);
};

export const clearBackendCart = async (): Promise<ApiCart | null> => {
    const headers = await createHeaders(true);
    const url = `${API_BASE_URL}/cart/clear/`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers,
    });
    return handleResponse(response);
};

export const fetchUserCart = async (): Promise<ApiCart | null> => {
    const headers = await createHeaders(true);
    const url = `${API_BASE_URL}/cart/`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });
        if (response.status === 404) {
            return null;
        }
        return handleResponse(response);
    } catch (error) {
        console.error("Error fetching user cart:", error);
        throw error;
    }
};

export const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://127.0.0.1:8000/api';
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

const transformprice_per_ml = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => transformprice_per_ml(item));
  } else if (data !== null && typeof data === 'object') {
    const newData: { [key: string]: any } = {};
    let priceTransformed = false;

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        let priceValue: number | null = null;

        if (key === 'price_per_ml') {
          if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
            priceValue = parseFloat(value as string);
            if (!isNaN(priceValue)) {
              newData['price_per_ml'] = priceValue * 2;
            } else {
              console.warn(`[API WARN] Could not parse price_per_ml value: ${value}`);
              newData['price_per_ml'] = null;
            }
          } else {
             console.warn(`[API WARN] Unexpected type for price_per_ml: ${typeof value}, value: ${value}`);
             newData['price_per_ml'] = null;
          }
          priceTransformed = true;

        } else if (key === 'price_per_ml' && !priceTransformed) {
           if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
             priceValue = parseFloat(value as string);
             if (!isNaN(priceValue)) {
               newData[key] = priceValue * 2;
             } else {
               console.warn(`[API WARN] Could not parse price_per_ml value: ${value}`);
               newData[key] = null;
             }
           } else {
             console.warn(`[API WARN] Unexpected type for price_per_ml: ${typeof value}, value: ${value}`);
             newData[key] = null;
           }

        } else {
          newData[key] = transformprice_per_ml(value);
        }
      }
    }
    return newData;
  }
  return data;
};


const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
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

  let jsonData;
  try {
    const text = await response.text();
    if (!text) {
        return null;
    }
    jsonData = JSON.parse(text);
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    throw new Error('Failed to parse JSON response');
  }

  let transformedData;
  try {
      transformedData = transformprice_per_ml(jsonData);
      return transformedData;
  } catch (transformError) {
      console.error('Error transforming price_per_ml:', transformError);
      throw new Error('Failed to transform API response data');
  }
};

// --- API Functions ---

type PerfumeFilters = {
  brands?: number[];
  occasions?: string[];
  priceRange?: { min?: number | null; max?: number | null } | null;
  genders?: string[];
  dayNights?: string[];
  seasons?: string[];
  ids?: number[];
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
  if (filters.brands?.length) params.append('brand', filters.brands.map(String).join(','));
  if (filters.occasions?.length) params.append('occasions', filters.occasions.map(String).join(','));

  if (filters.genders?.length) params.append('gender', filters.genders.join(','));
  if (filters.seasons?.length) params.append('season', filters.seasons.join(','));
  if (filters.dayNights?.length) params.append('best_for', filters.dayNights.join(','));

  if (filters.priceRange?.min != null) params.append('price_min', String(filters.priceRange.min));
  if (filters.priceRange?.max != null) params.append('price_max', String(filters.priceRange.max));

  if (filters.ids?.length) params.append('id__in', filters.ids.map(String).join(','));

  const url = `${API_BASE_URL}/perfumes/?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  return handleResponse(response);
};

export const fetchBrands = async () => {
  const headers = await createHeaders(false);
  const url = `${API_BASE_URL}/brands/`;
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  const data = await handleResponse(response);
  return data.results ?? data;
};

export const fetchOccasions = async () => {
  const headers = await createHeaders(false);
  const url = `${API_BASE_URL}/occasions/`;
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  const data = await handleResponse(response);
  return data.results ?? data;
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
  } catch {
    // Ignore logout errors - user will be logged out regardless
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
  if (!externalIds || !externalIds.length) {
    console.log("fetchPerfumesByExternalIds: No external IDs provided");
    return [];
  }

  // Filter out any invalid IDs
  const validIds = externalIds.filter(id => id && typeof id === 'string');

  if (validIds.length === 0) {
    console.log("fetchPerfumesByExternalIds: No valid external IDs after filtering");
    return [];
  }

  try {
    const headers = await createHeaders();
    const params = new URLSearchParams();
    params.append('external_ids', validIds.join(','));
    const url = `${API_BASE_URL}/perfumes/by_external_ids/?${params.toString()}`;
    console.log(`fetchPerfumesByExternalIds: Fetching with URL: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`fetchPerfumesByExternalIds: HTTP error ${response.status}`);
      return [];
    }

    const data = await handleResponse(response);

    if (!data || !Array.isArray(data)) {
      console.error("fetchPerfumesByExternalIds: Response is not an array:", data);
      return [];
    }

    console.log(`fetchPerfumesByExternalIds: Successfully fetched ${data.length} perfumes`);
    console.log("fetchPerfumesByExternalIds: Returned perfumes:", data.map(p => ({ external_id: p.external_id, name: p.name, brand: p.brand })));

    // Log which external_ids were requested vs which were found
    const requestedIds = validIds;
    const foundIds = data.map(p => p.external_id);
    const missingIds = requestedIds.filter(id => !foundIds.includes(id));

    if (missingIds.length > 0) {
      console.warn("fetchPerfumesByExternalIds: Missing perfumes with external_ids:", missingIds);
    }

    return data;
  } catch (error) {
    console.error("fetchPerfumesByExternalIds: Error:", error);
    return [];
  }
};

export const getPredefinedBoxes = async (gender?: 'masculino' | 'femenino'): Promise<ApiPredefinedBox[]> => {
  const headers = await createHeaders(false);
  const params = new URLSearchParams();
  if (gender) {
    params.append('gender', gender);
  }
  const url = `${API_BASE_URL}/boxes/predefined/?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  const data = await handleResponse(response);
  if (Array.isArray(data)) {
    return data as ApiPredefinedBox[];
  } else if (data && Array.isArray(data.results)) {
    return data.results as ApiPredefinedBox[];
  }
  console.warn("Unexpected response structure for predefined boxes:", data);
  return [];
};

export const fetchRecommendations = async (filters: PerfumeFilters = {}): Promise<ApiRecommendation[]> => {
  try {
    const headers = await createHeaders(true);
    const params = new URLSearchParams();

    if (filters.priceRange?.min != null) params.append('price_min', String(filters.priceRange.min));
    if (filters.priceRange?.max != null) params.append('price_max', String(filters.priceRange.max));

    if (filters.occasions?.length) params.append('occasions', filters.occasions.join(','));

    const url = `${API_BASE_URL}/recommendations/?${params.toString()}`;
    console.log(`fetchRecommendations: Calling API: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`fetchRecommendations: HTTP error ${response.status}`);
      return [];
    }

    const data = await handleResponse(response);
    console.log(`fetchRecommendations: Response received, type: ${Array.isArray(data) ? 'array' : typeof data}`);

    let results: ApiRecommendation[];

    if (Array.isArray(data)) {
      results = data as ApiRecommendation[];
    } else if (data && Array.isArray(data.results)) {
      results = data.results as ApiRecommendation[];
    } else {
      console.warn("fetchRecommendations: Unexpected response structure:", data);
      return [];
    }

    console.log(`fetchRecommendations: Retrieved ${results.length} recommendations`);

    if (results.length > 0) {
      const sample = results[0];
      console.log('fetchRecommendations: Sample recommendation:', {
        perfumeId: sample.perfume.id,
        perfumeIdType: typeof sample.perfume.id,
        name: sample.perfume.name,
        score: sample.score,
        scoreType: typeof sample.score
      });

      const sortedSample = [...results]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      console.log('fetchRecommendations: Top 3 recommendations by score:');
      sortedSample.forEach((rec, i) => {
      });
    }

    return results;
  } catch (error) {
    console.error("fetchRecommendations: Error:", error);
    return [];
  }
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

// --- Rating API Functions ---

export const getAllUserRatings = async (): Promise<ApiRating[]> => {
  try {
    const headers = await createHeaders(true);
    const url = `${API_BASE_URL}/users/ratings/`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (response.status === 404) {
        console.warn('User ratings endpoint not found. This endpoint may not be implemented yet.');
        return [];
      }

      const data = await handleResponse(response);
      return data.results || data || [];
    } catch (error) {
      console.error('Error fetching user ratings:', error);
      return [];
    }
  } catch (error) {
    console.error('Error in getAllUserRatings:', error);
    return [];
  }
};

export const getRating = async (externalId: string): Promise<ApiRating | null> => {
  try {
    const headers = await createHeaders(true);

    const url = `${API_BASE_URL}/perfumes/by_external_ids/?external_ids=${externalId}`;

    const perfumesResponse = await fetch(url, {
      method: 'GET',
      headers,
    });

    const perfumes = await handleResponse(perfumesResponse);

    if (!perfumes || !Array.isArray(perfumes) || perfumes.length === 0) {
      return null;
    }

    const perfumeId = perfumes[0].id;
    const ratingUrl = `${API_BASE_URL}/perfumes/${perfumeId}/rating/`;

    const ratingResponse = await fetch(ratingUrl, {
      method: 'GET',
      headers,
    });

    if (ratingResponse.status === 404) {
      console.log('API: No rating found (404)');
      return null;
    }

    return handleResponse(ratingResponse);
  } catch (error) {
    console.error('API Error in getRating:', error);
    if ((error as any).status === 404) {
      return null;
    }
    throw error;
  }
};

export const submitRating = async (externalId: string, rating: number): Promise<ApiRating> => {
  try {
    const headers = await createHeaders(true);

    const url = `${API_BASE_URL}/perfumes/by_external_ids/?external_ids=${externalId}`;

    const perfumesResponse = await fetch(url, {
      method: 'GET',
      headers,
    });

    const perfumes = await handleResponse(perfumesResponse);

    if (!perfumes || !Array.isArray(perfumes) || perfumes.length === 0) {
      throw new Error(`No perfume found with external_id: ${externalId}`);
    }

    const perfumeId = perfumes[0].id;
    const ratingUrl = `${API_BASE_URL}/perfumes/${perfumeId}/rating/`;

    const ratingResponse = await fetch(ratingUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rating }),
    });

    if (!ratingResponse.ok) {
      const errorText = await ratingResponse.text();
      console.error(`API Error submitting rating: ${ratingResponse.status} ${errorText}`);
      throw new Error(`Failed to submit rating: ${errorText}`);
    }
    return handleResponse(ratingResponse);
  } catch (error) {
    console.error('API Error in submitRating:', error);
    throw error;
  }
};

// --- Order API Functions ---

export const getUserOrders = async (): Promise<ApiOrder[]> => {
  try {
    const headers = await createHeaders(true);
    const url = `${API_BASE_URL}/orders/`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      console.error(`Error fetching user orders: ${response.status}`);
      return [];
    }

    const data = await handleResponse(response);
    return data.results || data || [];
  } catch (error) {
    console.error('Error in getUserOrders:', error);
    return [];
  }
};

export const getPerfumesFromUserOrders = async (): Promise<string[]> => {
  try {
    const orders = await getUserOrders();
    const perfumeIds = new Set<string>();

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.box_configuration && item.box_configuration.perfumes) {
          item.box_configuration.perfumes.forEach((perfume: any) => {
            if (perfume.external_id) {
              perfumeIds.add(perfume.external_id);
            }
          });
        }
      });
    });

    return Array.from(perfumeIds);
  } catch (error) {
    console.error('Error in getPerfumesFromUserOrders:', error);
    return [];
  }
};