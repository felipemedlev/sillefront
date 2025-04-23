import { fetchRecommendations } from './api'; // Import the function to test
import Constants from 'expo-constants';

// Mock the global fetch function
global.fetch = jest.fn();

// Mock AsyncStorage (needed by createHeaders -> getToken)
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue('fake-token'), // Mock token retrieval
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Constants if necessary (adjust the path based on your project structure)
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      apiBaseUrl: 'http://mock-api.com/api', // Use a mock base URL for tests
    },
  },
}));

const MOCK_API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

describe('fetchRecommendations API function', () => {
  beforeEach(() => {
    // Reset the fetch mock before each test
    (fetch as jest.Mock).mockClear();
    // Mock a successful response for fetch to avoid errors during URL checking
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }), // Mock a basic paginated response
    });
  });

  it('should call fetch with the correct URL when no filters are provided', async () => {
    await fetchRecommendations();
    expect(fetch).toHaveBeenCalledTimes(1);
    // Check the URL called - should only have base URL + endpoint path
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_API_BASE_URL}/recommendations/?`, // Base URL + endpoint + empty query
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Authorization': 'Token fake-token', // Verify auth header
        }),
      })
    );
  });

  it('should call fetch with correct URL including price filters', async () => {
    const filters = { priceRange: { min: 50, max: 150 } };
    await fetchRecommendations(filters);
    expect(fetch).toHaveBeenCalledTimes(1);
    // Check the URL called - should include price_min and price_max
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_API_BASE_URL}/recommendations/?price_min=50&price_max=150`,
      expect.anything() // Headers/method checked in other tests if needed
    );
  });

  it('should call fetch with correct URL including only price_min filter', async () => {
    const filters = { priceRange: { min: 50, max: null } }; // Max is null
    await fetchRecommendations(filters);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_API_BASE_URL}/recommendations/?price_min=50`,
      expect.anything()
    );
  });

   it('should call fetch with correct URL including only price_max filter', async () => {
    const filters = { priceRange: { min: null, max: 150 } }; // Min is null
    await fetchRecommendations(filters);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_API_BASE_URL}/recommendations/?price_max=150`,
      expect.anything()
    );
  });

  it('should call fetch with correct URL including occasions filter', async () => {
    const filters = { occasions: [1, 5, 10] };
    await fetchRecommendations(filters);
    expect(fetch).toHaveBeenCalledTimes(1);
    // Check the URL called - should include occasions=1,5,10
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_API_BASE_URL}/recommendations/?occasions=1%2C5%2C10`, // Note: Comma is URL-encoded as %2C
      expect.anything()
    );
  });

  it('should call fetch with correct URL including both price and occasions filters', async () => {
    const filters = {
      priceRange: { min: 25, max: 125 },
      occasions: [2, 8],
    };
    await fetchRecommendations(filters);
    expect(fetch).toHaveBeenCalledTimes(1);
    // Check the URL called - order of params might vary but both should be present
    const expectedUrlPattern = /recommendations\/\?(?=.*price_min=25)(?=.*price_max=125)(?=.*occasions=2%2C8).*/;
    const actualUrl = (fetch as jest.Mock).mock.calls[0][0];
    expect(actualUrl).toMatch(expectedUrlPattern);
    expect(actualUrl).toContain(`${MOCK_API_BASE_URL}/`); // Ensure base URL is correct
  });

   it('should handle empty occasions array gracefully', async () => {
    const filters = { occasions: [] };
    await fetchRecommendations(filters);
    expect(fetch).toHaveBeenCalledTimes(1);
    // URL should not contain the 'occasions' parameter
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_API_BASE_URL}/recommendations/?`,
      expect.anything()
    );
  });

  it('should handle empty filters object gracefully', async () => {
    const filters = {};
    await fetchRecommendations(filters);
    expect(fetch).toHaveBeenCalledTimes(1);
    // URL should be the base recommendations URL without extra params
    expect(fetch).toHaveBeenCalledWith(
      `${MOCK_API_BASE_URL}/recommendations/?`,
      expect.anything()
    );
  });
});