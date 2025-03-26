import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable, Image, Modal, ScrollView, FlatList, ViewStyle } from 'react-native'; // Import ViewStyle
import { Feather } from '@expo/vector-icons';
import { ImageSourcePropType } from 'react-native';

// --- Placeholder Components (Ideally, these would be separate files) ---

// Placeholder for a simple Perfume Card used in the "Similar Perfumes" section
const PerfumeCardPlaceholder = ({ perfume }: { perfume: BasicPerfumeInfo }) => (
  <View style={styles.similarPerfumeCard}>
    <Image source={perfume.image} style={styles.similarPerfumeImage} />
    <Text style={styles.similarPerfumeName} numberOfLines={1}>{perfume.name}</Text>
    <Text style={styles.similarPerfumeBrand} numberOfLines={1}>{perfume.brand}</Text>
  </View>
);

// Generic Rating Bar
interface RatingBarProps {
  rating: number; // Expecting a value between 0 and 1
  labels: string[];
  style?: ViewStyle;
}

const RatingBar = ({ rating, labels, style }: RatingBarProps) => {
  const indicatorPosition = `${Math.max(0, Math.min(1, rating)) * 100}%`;
  // const labelCount = labels.length;
  // const labelWidth = 100 / labelCount; // Percentage width for each label section

  return (
    <View style={[styles.ratingBarContainer, style]}>
      <View style={styles.ratingBarBackground} />
      {/* Add 'as ViewStyle' for the left property */}
      <View style={[styles.ratingBarIndicator, { left: indicatorPosition } as ViewStyle]} />
      <View style={styles.ratingLabels}>
        {labels.map((label) => (
          <Text
            key={label}
            style={[
              styles.ratingLabelText,
              // Adjust label positioning if needed, e.g., center within its section
              // { width: `${labelWidth}%`, textAlign: 'center' }
            ]}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};


// --- Interfaces ---

// Simplified info for similar perfumes list
interface BasicPerfumeInfo {
  id: string;
  name: string;
  brand: string;
  image: ImageSourcePropType;
}

interface Perfume {
  id: string;
  name: string;
  brand: string;
  matchPercentage: number; // Kept for now
  pricePerML: number;
  image: ImageSourcePropType;
  description?: string;

  // New fields
  accords?: string[];
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
  overallRating?: number; // e.g., 0-5
  dayNightRating?: number; // 0 (Night) to 1 (Day), 0.5 (Both)
  seasonRating?: number; // Numerical value 0 (Winter) to 1 (Summer) for the bar logic
  priceValueRating?: number; // e.g., 0-5
  sillageRating?: number; // 0 (Intimate) to 1 (Enormous) - mapped from 0, 1, 2, 3
  longevityRating?: number; // 0 (Weak) to 1 (Eternal) - mapped from 0, 1, 2, 3
  similarPerfumes?: BasicPerfumeInfo[];
}

interface PerfumeModalProps {
  perfume: Perfume | null;
  onClose?: () => void;
}

export interface PerfumeModalRef {
  show: (perfumeData: Perfume) => void; // Allow passing perfume data on show
  hide: () => void;
}

// --- Component ---

const PerfumeModal = forwardRef<PerfumeModalRef, PerfumeModalProps>((props, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPerfume, setCurrentPerfume] = useState<Perfume | null>(props.perfume);
  const { width } = Dimensions.get('window');

  useImperativeHandle(ref, () => ({
    show: (perfumeData: Perfume) => {
      setCurrentPerfume(perfumeData);
      setIsVisible(true);
    },
    hide: () => {
      setIsVisible(false);
      // Optional: Delay clearing perfume data until animation finishes
      setTimeout(() => setCurrentPerfume(null), 300);
      props.onClose?.();
    }
  }));

  const handleClose = () => {
    setIsVisible(false);
    props.onClose?.();
  };

  // Helper to render note tags
  const renderNoteTags = (notes?: string[]) => {
    if (!notes || notes.length === 0) {
      return <Text style={styles.detailText}>N/A</Text>;
    }
    return (
      <View style={styles.notesGroupContainer}>
        {notes.map((note, index) => (
          <View key={index} style={styles.noteTag}>
            <Text style={styles.noteText}>{note}</Text>
          </View>
        ))}
      </View>
    );
  };

  // --- Rating Mappings ---
  const longevityLabels = ['Weak', 'Moderate', 'Long', 'Eternal'];
  const sillageLabels = ['Intimate', 'Moderate', 'Strong', 'Enormous'];
  const dayNightLabels = ['Night', 'Both', 'Day']; // Use 3 labels for 0, 0.5, 1
  const seasonLabels = ['Winter', 'Spring', 'Summer', 'Autumn'];

  // Helper to map discrete ratings (0, 1, 2, 3) to a 0-1 scale for the bar
  const mapDiscreteRatingToScale = (rating: number | undefined, maxRating: number): number => {
    if (rating === undefined || maxRating <= 0) return 0.5; // Default to middle if undefined
    return rating / maxRating;
  };


  if (!isVisible || !currentPerfume) {
    return null;
  }

  const {
    name, brand, image, matchPercentage, pricePerML, description,
    accords, topNotes, middleNotes, baseNotes, overallRating,
    dayNightRating, seasonRating, priceValueRating, sillageRating,
    longevityRating, similarPerfumes
  } = currentPerfume;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Feather name="chevron-down" size={28} color="#333" />
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image Header */}
            <View style={styles.imageContainer}>
              <Image source={image} style={[styles.perfumeImage, { width: width * 0.6, height: width * 0.6 }]} />
              {matchPercentage !== undefined && (
                 <View style={styles.matchBadge}>
                   <Text style={styles.matchText}>{matchPercentage}% Match</Text>
                 </View>
              )}
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.perfumeName}>{name}</Text>
              <Text style={styles.perfumeBrand}>{brand}</Text>
              <Text style={styles.perfumePrice}>${pricePerML?.toLocaleString()}/mL</Text>
            </View>

            {/* Ratings Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ratings</Text>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Overall:</Text>
                <Text style={styles.ratingLabel}>{overallRating}/5</Text>
              </View>
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Price/Value:</Text>
                <Text style={styles.ratingLabel}>{priceValueRating}/5</Text>
              </View>
              {/* Longevity Rating Bar */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Longevity:</Text>
                {longevityRating !== undefined ? (
                  <RatingBar
                    rating={mapDiscreteRatingToScale(longevityRating, longevityLabels.length - 1)}
                    labels={longevityLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>
              {/* Sillage Rating Bar */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Sillage:</Text>
                {sillageRating !== undefined ? (
                  <RatingBar
                    rating={mapDiscreteRatingToScale(sillageRating, sillageLabels.length - 1)}
                    labels={sillageLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>
              {/* Day/Night Rating Bar */}
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Best For:</Text>
                {dayNightRating !== undefined ? (
                  <RatingBar
                    rating={dayNightRating} // Already 0-1 scale
                    labels={dayNightLabels}
                  />
                ) : (
                  <Text style={styles.ratingValue}>N/A</Text>
                )}
              </View>
              {/* Season Rating Bar */}
              <View style={styles.ratingItem}>
                 <Text style={styles.ratingLabel}>Season:</Text>
                 {seasonRating !== undefined ? <RatingBar rating={seasonRating} labels={seasonLabels} /> : <Text style={styles.ratingValue}>N/A</Text>}
              </View>
            </View>

            {/* Description */}
            {description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{description}</Text>
              </View>
            )}

            {/* Accords */}
            {accords && accords.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Main Accords</Text>
                {renderNoteTags(accords)}
              </View>
            )}

            {/* Notes Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Perfume Pyramid</Text>
              <View style={styles.notesSection}>
                <Text style={styles.notesCategoryTitle}>Top Notes</Text>
                {renderNoteTags(topNotes)}
              </View>
              <View style={styles.notesSection}>
                <Text style={styles.notesCategoryTitle}>Middle Notes</Text>
                {renderNoteTags(middleNotes)}
              </View>
              <View style={styles.notesSection}>
                <Text style={styles.notesCategoryTitle}>Base Notes</Text>
                {renderNoteTags(baseNotes)}
              </View>
            </View>

             {/* Similar Perfumes */}
             {similarPerfumes && similarPerfumes.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Similar Perfumes</Text>
                    <FlatList
                        data={similarPerfumes}
                        renderItem={({ item }) => <PerfumeCardPlaceholder perfume={item} />}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.similarPerfumesList}
                    />
                </View>
             )}

            {/* Spacer at the bottom */}
            <View style={{ height: 80 }} />

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

PerfumeModal.displayName = 'PerfumeModal';

// --- Styles ---

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end', // Aligns modal to bottom
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%', // Adjust height as needed
    paddingTop: 15, // Space for close button handle area
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'center',
    padding: 10,
    marginBottom: 5,
    // Make the hit area larger if needed
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative', // For badge positioning
  },
  perfumeImage: {
    resizeMode: 'contain',
  },
  matchBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#809CAC', // Existing color
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  matchText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA', // Lighter divider
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  perfumeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  perfumeBrand: {
    fontSize: 18,
    color: '#555',
    marginBottom: 12,
  },
  perfumePrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#809CAC', // Existing color
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    minHeight: 30, // Ensure consistent height for items with/without bars
  },
  ratingLabel: {
    fontSize: 15,
    color: '#444',
    width: 100, // Align labels
    fontWeight: '500',
  },
  ratingValue: { // Keep for N/A text
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  ratingStarsContainer: {
    flexDirection: 'row',
  },
  descriptionText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  notesGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteTag: {
    backgroundColor: '#F0F4F6', // Light background for tags
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  noteText: {
    color: '#555', // Darker text for better readability
    fontSize: 13,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 12,
  },
  notesCategoryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30, // Add safe area padding if needed
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  addToCartButton: {
    backgroundColor: '#809CAC', // Existing color
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#809CAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles for Similar Perfumes (Placeholder)
  similarPerfumesList: {
    paddingVertical: 10,
  },
  similarPerfumeCard: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
  },
  similarPerfumeImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
    borderRadius: 8, // Optional: round corners
    backgroundColor: '#F8F8F8', // Placeholder background
  },
  similarPerfumeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  similarPerfumeBrand: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  // Generic Rating Bar Styles
  ratingBarContainer: {
    flex: 1, // Take remaining space
    height: 20, // Bar height + label space
    marginLeft: 10,
    justifyContent: 'center',
  },
  ratingBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  ratingBarIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#555',
    borderWidth: 2,
    borderColor: 'white',
    top: -8, // Center vertically
    transform: [{ translateX: -8 }], // Center the indicator
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1, // Ensure indicator is above background
  } as ViewStyle,
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2, // Align roughly with bar ends
  },
  ratingLabelText: {
    fontSize: 10,
    color: '#888',
  },
  detailText: { // Used for N/A values in notes
      fontSize: 14,
      color: '#999',
      fontStyle: 'italic',
  },
});

export default PerfumeModal;