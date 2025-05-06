import { useState, useCallback, useEffect } from 'react';
import { fetchRecommendations, ApiRecommendation, fetchPerfumesByExternalIds } from '../../src/services/api';
import { Perfume } from '../../types/perfume';
import { useSurveyContext } from '../../context/SurveyContext';

export type AIBoxProviderProps = {
  children: (props: {
    isLoading: boolean;
    error: string | null;
    loadingMessage: string;
    recommendedPerfumes: Perfume[];
    selectedPerfumeIds: string[];
    decantCount: 4 | 8;
    decantSize: 3 | 5 | 10;
    rangoPrecio: [number, number];
    selectedOccasionNames: string[]; // Use state for selected occasion names
    calculateTotalPrice: () => number;
    setDecantCount: (count: 4 | 8) => void;
    setDecantSize: (size: 3 | 5 | 10) => void;
    setRangoPrecio: (range: [number, number]) => void;
    setSelectedPerfumeIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    setSelectedOccasionNames: (names: string[] | ((prev: string[]) => string[])) => void; // Add setter for occasion names
    findPerfumeById: (id: string) => Perfume | undefined;
    handlePriceChangeFinish: (values: number[]) => void; // Renamed: Triggers reload on finish
    loadRecommendations: (filters?: { priceRange?: { min: number; max: number } | null; occasions?: string[] }) => Promise<void>; // Update loadRecommendations signature for occasion names
  }) => React.ReactNode;
};

// Normalization helper for perfume data
const normalizePerfumeData = (perfume: any): Perfume => {
  return {
    id: String(perfume.id),
    name: perfume.name,
    brand: typeof perfume.brand === 'object' ? perfume.brand.name : perfume.brand,
    thumbnail_url: perfume.thumbnail_url || perfume.thumbnailUrl || '',
    full_size_url: perfume.full_size_url || perfume.fullSizeUrl || '',
    match_percentage: perfume.match_percentage ?? null,
    price_per_ml: perfume.pricePerML ?? perfume.price_per_ml ?? null, // Check both camelCase and snake_case
    external_id: perfume.external_id || '',
    description: perfume.description || '',
    accords: perfume.accords || [],
    top_notes: perfume.top_notes || [],
    middle_notes: perfume.middle_notes || [],
    base_notes: perfume.base_notes || [],
    overall_rating: perfume.overall_rating ?? null,
    price_value_rating: perfume.price_value_rating ?? null,
    longevity_rating: perfume.longevity_rating ?? null,
    sillage_rating: perfume.sillage_rating ?? null,
    similar_perfume_ids: perfume.similar_perfume_ids || [],
    gender: perfume.gender || null,
    occasions: perfume.occasions || [],
    season: perfume.season || null,
    best_for: perfume.best_for || null,
  };
};

// Helper function to get price regardless of format
const getPerfumePrice = (perfume: Perfume | undefined): number => {
  if (!perfume) return 0;
  // Handle cases where pricePerML might be a string
  const price = parseFloat(perfume.price_per_ml as any);
  return isNaN(price) ? 0 : price;
};

export const AIBoxProvider: React.FC<AIBoxProviderProps> = ({ children }) => {
  const { submitSurveyIfAuthenticated } = useSurveyContext();
  const [decantCount, setDecantCount] = useState<4 | 8>(4);
  const [decantSize, setDecantSize] = useState<3 | 5 | 10>(5);
  const [rangoPrecio, setRangoPrecio] = useState<[number, number]>([0, 5000]);
  const [selectedOccasionNames, setSelectedOccasionNames] = useState<string[]>([]); // Use state for selected occasion names
  const [selectedPerfumeIds, setSelectedPerfumeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedPerfumes, setRecommendedPerfumes] = useState<Perfume[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("Cargando recomendaciones...");

  // Find perfume data from the recommendedPerfumes state
  const findPerfumeById = useCallback(
    (perfumeId: string): Perfume | undefined => {
      return recommendedPerfumes.find(p => String(p.id) === perfumeId);
    },
    [recommendedPerfumes]
  );

  // Data Fetching Function
  const loadRecommendations = useCallback(async (filters?: { priceRange?: { min: number; max: number } | null; occasions?: string[] }) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('AIBox: Starting recommendation fetch sequence');

      // Survey submission is now handled by SurveyContext upon authentication change.
      // We proceed directly to fetching recommendations.
      // Fetch recommendations (IDs + scores)
      const recommendations: ApiRecommendation[] = await fetchRecommendations(filters);

      if (!recommendations || recommendations.length === 0) {
        console.log('AIBox: No recommendations received');
        throw new Error("No recommendations received from the server.");
      }

      // Log the first few recommendations to inspect their structure
      if (recommendations.length > 0) {
        // console.log(`AIBox: First 3 recommendations:`);
        recommendations.slice(0, 3).forEach((rec: ApiRecommendation, i: number) => {
          // console.log(`  ${i+1}. Perfume ID: ${rec.perfume.id}, Name: ${rec.perfume.name}, Score: ${rec.score}`);
        });
      }

      // Important: Sort recommendations by score (highest first) to ensure correct order
      const sortedRecommendations = [...recommendations].sort((a, b) => b.score - a.score);

      // Extract top 20 perfume data to find external_ids
      const top20Recs = sortedRecommendations.slice(0, 20);

      // Get external_ids from recommendations
      const externalIds = top20Recs
        .map(rec => {
          // Extract external_id from the perfume data
          // In case it's not immediately available in the recommendation API response,
          // we use the perfume API to get detailed information including external_id
          return rec.perfume.external_id;
        })
        .filter(id => id && id.trim() !== ''); // Filter out any empty IDs

      if (externalIds.length === 0) {
        throw new Error("Could not extract external IDs from recommendations.");
      }

      console.log(`AIBox: Fetching full details for ${externalIds.length} perfumes with external IDs`);

      // Fetch full perfume details using external IDs
      const fullPerfumeDetailsData = await fetchPerfumesByExternalIds(externalIds);

      if (!Array.isArray(fullPerfumeDetailsData)) {
        console.error("AIBox: fetchPerfumesByExternalIds did not return an array:", fullPerfumeDetailsData);
        throw new Error("Failed to fetch full perfume details in the expected format.");
      }

      // Normalize the fetched full details
      const normalizedPerfumes = fullPerfumeDetailsData.map(normalizePerfumeData);

      // Add match_percentage from the original recommendations based on external_id matching
      const finalRecommendedPerfumes = normalizedPerfumes.map(normPerf => {
        // Find the corresponding recommendation by matching external_id
        const recommendation = sortedRecommendations.find(rec =>
          rec.perfume.external_id === normPerf.external_id ||
          String(rec.perfume.id) === normPerf.id
        );

        // Convert the score (0-1) to a percentage (0-100)
        const matchPercentage = recommendation ? Math.round(recommendation.score * 100) : null;

        return {
          ...normPerf,
          match_percentage: matchPercentage,
        };
      }).filter(p => p.match_percentage !== null) // Filter out any perfumes without match percentage
        .sort((a, b) => (b.match_percentage ?? 0) - (a.match_percentage ?? 0)); // Re-sort by match percentage DESC

      // console.log(`AIBox: Normalized and merged ${finalRecommendedPerfumes.length} perfume objects with full details`);

      // Log the top 5 perfumes for debugging
      // console.log('AIBox: Top 5 perfumes with full details (after merge & sort):');
      finalRecommendedPerfumes.slice(0, 5).forEach((p: Perfume, i: number) => {
        // console.log(`  ${i+1}. ${p.name} - ${p.match_percentage}% match, ID=${p.id}, ExternalID=${p.external_id}, Similar IDs: ${p.similar_perfume_ids?.length ?? 0}`);
      });

      setRecommendedPerfumes(finalRecommendedPerfumes);

    } catch (err: any) {
      console.error("Error loading recommendations:", err);
      setError(err.message || "Failed to load recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed submitSurveyIfAuthenticated dependency, relies on SurveyContext logic

  // Renamed: This function now handles the *completion* of the price range change
  const handlePriceChangeFinish = useCallback(async (values: number[]) => {
    const newPriceRange = values as [number, number];
    // Note: setRangoPrecio is already called by the slider's onValuesChange prop
    // This function only triggers the data reload
    await loadRecommendations({ priceRange: { min: newPriceRange[0], max: newPriceRange[1] }, occasions: selectedOccasionNames });
  }, [loadRecommendations, selectedOccasionNames]); // Add dependencies

  const calculateTotalPrice = useCallback(() => {
    const finalTotal = selectedPerfumeIds.reduce((total, perfumeId) => {
      const perfume = findPerfumeById(perfumeId);
      const price = getPerfumePrice(perfume);
      return total + (price * decantSize);
    }, 0);
    return Math.round(finalTotal);
  }, [decantSize, selectedPerfumeIds, findPerfumeById, recommendedPerfumes]); // Added recommendedPerfumes dependency


  // --- Initial Selection Effect ---
  useEffect(() => {
    if (recommendedPerfumes.length > 0) {

      // Filter recommendations by price range
      const priceFilteredPerfumes = recommendedPerfumes.filter((perfume: Perfume) => {
        const perfumePrice = getPerfumePrice(perfume);
        const meetsMinPrice = perfumePrice >= rangoPrecio[0];
        const meetsMaxPrice = perfumePrice <= rangoPrecio[1];
        // console.log(`  - Filtering Perfume ID ${perfume.id}: Price ${perfumePrice}, Meets Min: ${meetsMinPrice}, Meets Max: ${meetsMaxPrice}`); // Optional detailed log
        return meetsMinPrice && meetsMaxPrice;
      });

      // Select top N based on decantCount from the price-filtered list
      let initialSelection: string[] = [];

      if (priceFilteredPerfumes.length > 0) {
        // Use price-filtered perfumes
        initialSelection = priceFilteredPerfumes
          .slice(0, decantCount)
          .map(p => String(p.id))
          .filter(id => id && id.trim() !== ''); // Ensure valid IDs only
      } else {
        // Fallback to all perfumes if price filter results in empty list
        initialSelection = recommendedPerfumes
          .sort((a, b) => {
            // Convert to numbers with fallback to 0 for null/undefined values
            const matchA = typeof a.match_percentage === 'number' ? a.match_percentage : 0;
            const matchB = typeof b.match_percentage === 'number' ? b.match_percentage : 0;
            return matchB - matchA; // Sort in descending order
          })
          .slice(0, decantCount)
          .map(p => String(p.id))
          .filter(id => id && id.trim() !== ''); // Ensure valid IDs only
      }

      console.log(`AIBox: Selected top ${decantCount} perfumes: ${initialSelection.join(', ')}`);

      if (initialSelection.length > 0) {
        setSelectedPerfumeIds(initialSelection);
      } else {
        console.error('AIBox: Failed to select any valid perfumes');
      }
    }
  }, [decantCount, recommendedPerfumes]); // Removed rangoPrecio dependency

  // Update loading message based on status
  useEffect(() => {
    // Rotate through loading messages every 3 seconds during loading
    if (!isLoading) return;

    const messages = [
      "Cargando recomendaciones...",
      "Analizando tus preferencias...",
      "Buscando perfumes ideales para ti...",
      "Personalizando tu Box AI...",
    ];

    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingMessage(messages[currentIndex]);
    }, 3000);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Load recommendations on mount
  useEffect(() => {
    // Load recommendations once when the provider mounts.
    // Assumes AuthContext initializes first and SurveyContext handles
    // survey submission based on auth state if needed.
    loadRecommendations({ priceRange: { min: rangoPrecio[0], max: rangoPrecio[1] }, occasions: selectedOccasionNames });
  }, [loadRecommendations]); // Add loadRecommendations as dependency

  return children({
    isLoading,
    error,
    loadingMessage,
    recommendedPerfumes,
    selectedPerfumeIds,
    decantCount,
    decantSize,
    rangoPrecio,
    selectedOccasionNames, // Include selectedOccasionNames
    calculateTotalPrice,
    setDecantCount,
    setDecantSize,
    setRangoPrecio,
    setSelectedPerfumeIds,
    setSelectedOccasionNames, // Include setSelectedOccasionNames
    findPerfumeById,
    handlePriceChangeFinish, // Pass renamed function
    loadRecommendations
  });
};

export default AIBoxProvider;
