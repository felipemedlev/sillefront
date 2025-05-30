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
  thumbnail_url: string | null; // Note: Frontend type uses thumbnail_url
  price_per_ml: number | null; // Use camelCase to match backend model
  external_id: string; // Add external_id property
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
  score: number; // Assuming score is a number (DecimalField maps to number)
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
  perfume: ApiPerfumeSummary | null; // Perfume can be null if it was a box item not directly linked
  product_type: string; // 'perfume' or 'box'
  quantity: number;
  decant_size: number | null;
  price_at_purchase: string; // Comes as string from backend DecimalField
  box_configuration: any | null; // JSON field
  item_name: string | null;
  item_description: string | null;
}

export interface ApiOrder {
  id: number;
  user_email: string | null;
  order_date: string; // DateTimeField as string
  total_price: string; // DecimalField as string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string | null;
  items: ApiOrderItem[];
  updated_at: string; // DateTimeField as string
}

export interface ApiOrderCreatePayload {
  shipping_address: string;
  // Add other fields if your OrderCreateSerializer requires them (e.g., payment_method_id later)
}

// --- Cart API Types ---
export interface ApiCartItem {
  id: number;
  product_type: 'perfume' | 'box'; // Backend sends this
  name?: string; // Name of the cart item (e.g., box name), should be provided by backend CartItemSerializer
  perfume: ApiPerfumeSummary | null; // perfume_id will be used for adding
  quantity: 1; // Quantity is always 1 for cart items as per new logic
  decant_size: number | null;
  price_at_addition: string; // Decimal as string
  box_configuration: any | null; // JSON
  added_at: string; // DateTime as string
}

export interface ApiCart {
  id: number;
  user: { id: number; email: string; username?: string }; // Simplified user, adjust as needed
  items: ApiCartItem[];
  created_at: string;
  updated_at: string;
  // cart_total might be a method field, check serializer if needed
}

export interface ApiCartItemAddPayload {
  product_type: 'box'; // Now only 'box' is allowed
  name: string; // Name of the box, e.g., "AI Discovery Box (4x5ml)" -  Required
  price: number; // Price of the box - Required
  quantity: 1; // Quantity of this box type is always 1
  box_configuration: { // Required
    perfumes: Array<{
      external_id?: string; // external_id of the perfume from BasicPerfumeInfo.id
      perfume_id_backend?: number; // or backend primary key if available
      name?: string; // Optional: name for display/logging
      brand?: string; // Optional: brand for display/logging
      thumbnail_url?: string; // Optional: thumbnail URL for the perfume
    }>;
    decant_size: number; // snake_case, e.g., 3, 5, 10
    decant_count: number; // snake_case, e.g., 4
  };
  // perfume_id is removed from top level
  // decant_size is removed from top level (it's inside box_configuration)
}
// --- Survey API Functions ---

/**
 * Fetch the list of survey questions (gender + selected accords).
 */
export const fetchSurveyQuestions = async (): Promise<ApiSurveyQuestion[]> => {
    const headers = await createHeaders(false); // Public endpoint
    const url = `${API_BASE_URL}/survey/questions/`;
    const response = await fetch(url, {
        method: 'GET',
        headers,
    });
    return handleResponse(response);
};

/**
 * Fetch a specific survey question by ID.
 * @param questionId The ID of the question to fetch
 */
export const fetchSurveyQuestion = async (questionId: string): Promise<ApiSurveyQuestion> => {
    const headers = await createHeaders(false); // Public endpoint
    const url = `${API_BASE_URL}/survey/questions/${questionId}/`;
    const response = await fetch(url, {
        method: 'GET',
        headers,
    });
    return handleResponse(response);
};

/**
 * Submit or update the user's survey response.
 * @param answers The full answers object (keyed by accord or 'gender')
 */
export const submitSurveyResponse = async (answers: ApiSurveyAnswer): Promise<any> => {
    const headers = await createHeaders(true); // Requires auth
    const url = `${API_BASE_URL}/survey/`;
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ response_data: answers }),
    });
    return handleResponse(response);
};

/**
 * Place an order using the items currently in the user's cart.
 * @param payload The order creation payload (e.g., shipping address)
 */
export const placeOrder = async (payload: ApiOrderCreatePayload): Promise<ApiOrder> => {
    const headers = await createHeaders(true); // Requires auth
    const url = `${API_BASE_URL}/orders/`; // Endpoint for creating orders
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    return handleResponse(response);
};
/**
 * Adds an item to the user's cart on the backend.
 * @param payload The item details to add.
 */
export const addItemToBackendCart = async (payload: ApiCartItemAddPayload): Promise<ApiCart> => {
    const headers = await createHeaders(true); // Requires auth
    const url = `${API_BASE_URL}/cart/items/`; // Endpoint for adding cart items
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
    });
    return handleResponse(response); // Expects the updated cart as response
};

/**
 * Removes a specific item from the user's cart on the backend.
 * @param cartItemBackendId The backend ID of the cart item to remove.
 */
export const removeItemFromBackendCart = async (cartItemBackendId: number): Promise<ApiCart> => {
    const headers = await createHeaders(true); // Requires auth
    // Assuming the endpoint is something like /api/cart/items/{id}/
    const url = `${API_BASE_URL}/cart/items/${cartItemBackendId}/`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers,
    });
    // Typically, a DELETE might return 204 No Content, or the updated cart.
    // Adjust handleResponse or logic here if 204 is expected and returns null.
    // For now, assuming it returns the updated ApiCart.
    return handleResponse(response);
};

/**
 * Clears all items from the user's cart on the backend.
 */
export const clearBackendCart = async (): Promise<ApiCart | null> => { // Can return null if API sends 204
    const headers = await createHeaders(true); // Requires auth
    // Assuming the endpoint is /api/cart/ or /api/cart/clear/
    // A common pattern is DELETE on the main cart resource /api/cart/
    const url = `${API_BASE_URL}/cart/clear/`; // Or just /cart/ with DELETE method
    const response = await fetch(url, {
        method: 'DELETE', // Or 'POST' if it's a custom action like /clear/
        headers,
    });
    // If DELETE returns 204 No Content, handleResponse will return null.
    // If it returns the (now empty) cart, it will be an ApiCart object.
    return handleResponse(response);
};

/**
 * Fetches the current user's cart from the backend.
 */
export const fetchUserCart = async (): Promise<ApiCart | null> => {
    const headers = await createHeaders(true); // Requires auth
    const url = `${API_BASE_URL}/cart/`; // Standard endpoint for fetching the cart
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers,
        });
        if (response.status === 404) { // Handle case where cart might not exist yet
            return null;
        }
        return handleResponse(response);
    } catch (error) {
        console.error("Error fetching user cart:", error);
        // Depending on how you want to handle errors, you might throw or return null
        // For now, let's rethrow to be handled by the caller
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

// Helper function to recursively transform price_per_ml in fetched data
const transformprice_per_ml = (data: any): any => {
  if (Array.isArray(data)) {
    // If it's an array, map over its elements and apply the transformation recursively
    return data.map(item => transformprice_per_ml(item));
  } else if (data !== null && typeof data === 'object') {
    // If it's an object, create a new object to hold the transformed data
    const newData: { [key: string]: any } = {};
    let priceTransformed = false; // Flag to track if price was handled via price_per_ml

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const value = data[key];
        let priceValue: number | null = null;

        // Check if the key is price_per_ml
        if (key === 'price_per_ml') {
          if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
            priceValue = parseFloat(value as string); // Parse potential string
            if (!isNaN(priceValue)) {
              // console.log(`[API DEBUG] Found price_per_ml: ${value}. Transforming to price_per_ml: ${priceValue * 2}`); // Removed Debug Log
              newData['price_per_ml'] = priceValue * 2; // Assign transformed value to price_per_ml
            } else {
              // console.warn(`[API WARN] Could not parse price_per_ml value: ${value}`); // Keep or remove warning? Keeping for now.
              console.warn(`[API WARN] Could not parse price_per_ml value: ${value}`);
              newData['price_per_ml'] = null; // Assign null if parsing failed
            }
          } else {
             console.warn(`[API WARN] Unexpected type for price_per_ml: ${typeof value}, value: ${value}`);
             newData['price_per_ml'] = null; // Assign null for unexpected types
          }
          priceTransformed = true; // Mark price as handled (even if null)
          // Do not copy the original 'price_per_ml' key to newData

        // Check if the key is price_per_ml AND price wasn't already handled by price_per_ml
        } else if (key === 'price_per_ml' && !priceTransformed) {
           if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) {
             priceValue = parseFloat(value as string); // Parse potential string
             if (!isNaN(priceValue)) {
               // console.log(`[API DEBUG] Found price_per_ml: ${value}. Transforming: ${priceValue * 2}`); // Removed Debug Log
               newData[key] = priceValue * 2; // Assign transformed value back to price_per_ml
             } else {
               // console.warn(`[API WARN] Could not parse price_per_ml value: ${value}`); // Keep or remove warning? Keeping for now.
               console.warn(`[API WARN] Could not parse price_per_ml value: ${value}`);
               newData[key] = null; // Assign null if parsing failed
             }
           } else {
             console.warn(`[API WARN] Unexpected type for price_per_ml: ${typeof value}, value: ${value}`);
             newData[key] = null; // Assign null for unexpected types
           }
          // If priceTransformed is true, it means 'price_per_ml' was already processed, so we skip this block.

        } else {
          // For all other keys, apply the transformation recursively
          newData[key] = transformprice_per_ml(value);
        }
      }
    }
    // Return the new object with transformed and standardized data
    return newData;
  }
  // If it's not an array or object (e.g., primitive value), return it as is
  return data;
};


const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorData;
    try {
      // Try to parse error response as JSON
      errorData = await response.json();
    } catch (e) {
      // Fallback if error response is not JSON
      errorData = { detail: response.statusText || 'Network response was not ok' };
    }
    console.error('API Error:', response.status, errorData);
    // Create a structured error object
    const error = new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
    (error as any).status = response.status;
    (error as any).data = errorData; // Attach full error data if available
    throw error;
  }

  if (response.status === 204) { // No Content
    return null; // Return null for 204 responses
  }

  let jsonData;
  try {
    // Read response body as text first to handle potential empty bodies
    const text = await response.text();
    if (!text) {
        // If the response body is empty (and status is OK, e.g., 200), return null or handle as appropriate
        return null;
    }
    jsonData = JSON.parse(text); // Parse the non-empty text as JSON
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    throw new Error('Failed to parse JSON response'); // Throw specific error for parsing failure
  }

  // Apply the price transformation to the parsed JSON data
  let transformedData;
  try {
      transformedData = transformprice_per_ml(jsonData); // Transform the data
      // console.log('[API DEBUG] Data after transformation in handleResponse:', JSON.stringify(transformedData, null, 2)); // Removed Log transformed data
      return transformedData;
  } catch (transformError) {
      console.error('Error transforming price_per_ml:', transformError);
      // Decide how to handle transformation errors:
      // Option 1: Return original data (less safe if transformation is critical)
      // return jsonData;
      // Option 2: Throw an error (safer, signals a problem)
      throw new Error('Failed to transform API response data');
  }
};

// --- API Functions ---

type PerfumeFilters = {
  brands?: number[]; // Expect brand IDs
  occasions?: string[]; // Expect Occasion Names
  priceRange?: { min?: number | null; max?: number | null } | null; // Make min/max optional or nullable within the object
  genders?: string[]; // Expect keys: 'male', 'female', 'unisex'
  dayNights?: string[]; // Expect keys: 'day', 'night'
  seasons?: string[]; // Expect keys: 'winter', 'summer', etc.
  ids?: number[]; // Added for filtering by specific IDs
};

export const fetchPerfumes = async (
  page = 1,
  pageSize = 20,
  searchQuery = '',
  filters: PerfumeFilters = {}
) => {
  const headers = await createHeaders(); // Auth might be needed if recommendations influence results
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });

  if (searchQuery) params.append('search', searchQuery);
  // Send IDs as comma-separated strings
  if (filters.brands?.length) params.append('brand', filters.brands.map(String).join(','));
  if (filters.occasions?.length) params.append('occasions', filters.occasions.map(String).join(',')); // Using 'occasions' (plural) as required by backend

  // Send keys as comma-separated strings
  if (filters.genders?.length) params.append('gender', filters.genders.join(','));
  if (filters.seasons?.length) params.append('season', filters.seasons.join(','));
  if (filters.dayNights?.length) params.append('best_for', filters.dayNights.join(',')); // Use 'best_for' parameter

  // Add price range filters (using explicit filter names from filters.py)
  if (filters.priceRange?.min != null) params.append('price_min', String(filters.priceRange.min));
  if (filters.priceRange?.max != null) params.append('price_max', String(filters.priceRange.max));

  // Add ID filter (assuming backend supports 'id__in')
  if (filters.ids?.length) params.append('id__in', filters.ids.map(String).join(','));

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
    return data;
  } catch (error) {
    console.error("fetchPerfumesByExternalIds: Error:", error);
    return [];
  }
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

/**
 * Fetch personalized recommendations for the authenticated user.
 */
export const fetchRecommendations = async (filters: PerfumeFilters = {}): Promise<ApiRecommendation[]> => {
  try {
    const headers = await createHeaders(true); // Requires auth
    const params = new URLSearchParams();

    // Add price range filters
    if (filters.priceRange?.min != null) params.append('price_min', String(filters.priceRange.min));
    if (filters.priceRange?.max != null) params.append('price_max', String(filters.priceRange.max));

    // Add occasion filters
    if (filters.occasions?.length) params.append('occasions', filters.occasions.join(',')); // Send names directly

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

    // Handle potential pagination wrapper from DRF ViewSets
    let results: ApiRecommendation[];

    if (Array.isArray(data)) {
      results = data as ApiRecommendation[]; // Return data if it's already an array
    } else if (data && Array.isArray(data.results)) {
      results = data.results as ApiRecommendation[]; // Return the results array if paginated
    } else {
      console.warn("fetchRecommendations: Unexpected response structure:", data);
      return [];
    }

    // Log the number of recommendations and a sample
    console.log(`fetchRecommendations: Retrieved ${results.length} recommendations`);

    if (results.length > 0) {
      // Log the first recommendation structure and types
      const sample = results[0];
      console.log('fetchRecommendations: Sample recommendation:', {
        perfumeId: sample.perfume.id,
        perfumeIdType: typeof sample.perfume.id,
        name: sample.perfume.name,
        score: sample.score,
        scoreType: typeof sample.score
      });

      // Log first 3 recommendations sorted by score
      const sortedSample = [...results]
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      console.log('fetchRecommendations: Top 3 recommendations by score:');
      sortedSample.forEach((rec, i) => {
        // console.log(`  ${i+1}. Perfume ID: ${rec.perfume.id}, Name: ${rec.perfume.name}, Score: ${rec.score}`);
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

/**
 * Get all ratings for the current authenticated user
 * @returns Array of rating objects or empty array if none exist
 */
export const getAllUserRatings = async (): Promise<ApiRating[]> => {
  try {
    const headers = await createHeaders(true); // Requires auth
    // The backend doesn't have a dedicated /ratings/ endpoint
    // Instead, we need to use the user-specific ratings endpoint
    const url = `${API_BASE_URL}/users/ratings/`;

    // Handle potential 404s gracefully - backend may not have implemented this yet
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

/**
 * Get the current user's rating for a specific perfume using external_id
 * @param externalId The external_id of the perfume
 * @returns The rating data or null if not found
 */
export const getRating = async (externalId: string): Promise<ApiRating | null> => {
  try {
    const headers = await createHeaders(true); // Requires auth

    // Get perfume by external_id first, then get rating
    const url = `${API_BASE_URL}/perfumes/by_external_ids/?external_ids=${externalId}`;
    // console.log(`API Call to get perfume: GET ${url}`);

    const perfumesResponse = await fetch(url, {
      method: 'GET',
      headers,
    });

    const perfumes = await handleResponse(perfumesResponse);

    if (!perfumes || !Array.isArray(perfumes) || perfumes.length === 0) {
      // console.log(`No perfume found with external_id: ${externalId}`);
      return null;
    }

    // Use the database ID from the first result to get the rating
    const perfumeId = perfumes[0].id;
    const ratingUrl = `${API_BASE_URL}/perfumes/${perfumeId}/rating/`;
    // console.log(`API Call for rating: GET ${ratingUrl}`);

    const ratingResponse = await fetch(ratingUrl, {
      method: 'GET',
      headers,
    });

    // console.log(`API Response status: ${ratingResponse.status}`);
    if (ratingResponse.status === 404) {
      console.log('API: No rating found (404)');
      return null; // No rating found is a normal case
    }

    return handleResponse(ratingResponse);
  } catch (error) {
    console.error('API Error in getRating:', error);
    // Return null rather than throwing for 404s
    if ((error as any).status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Submit or update a rating for a perfume using external_id
 * @param externalId The external_id of the perfume to rate
 * @param rating Rating value (1-5)
 * @returns The saved rating data
 */
export const submitRating = async (externalId: string, rating: number): Promise<ApiRating> => {
  try {
    const headers = await createHeaders(true); // Requires auth

    // Get perfume by external_id first, then submit rating
    const url = `${API_BASE_URL}/perfumes/by_external_ids/?external_ids=${externalId}`;
    // console.log(`API Call to get perfume: GET ${url}`);

    const perfumesResponse = await fetch(url, {
      method: 'GET',
      headers,
    });

    const perfumes = await handleResponse(perfumesResponse);

    if (!perfumes || !Array.isArray(perfumes) || perfumes.length === 0) {
      throw new Error(`No perfume found with external_id: ${externalId}`);
    }

    // Use the database ID from the first result to submit the rating
    const perfumeId = perfumes[0].id;
    const ratingUrl = `${API_BASE_URL}/perfumes/${perfumeId}/rating/`;
    // console.log(`API Call for rating: POST ${ratingUrl}`, { rating });

    const ratingResponse = await fetch(ratingUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ rating }),
    });

    // console.log(`API Response status: ${ratingResponse.status}`);
    if (!ratingResponse.ok) {
      const errorText = await ratingResponse.text();
      console.error(`API Error submitting rating: ${ratingResponse.status} ${errorText}`);
      throw new Error(`Failed to submit rating: ${errorText}`);
    }
    return handleResponse(ratingResponse);
  } catch (error) {
    console.error('API Error in submitRating:', error);
    throw error; // Re-throw the error after logging
  }
};