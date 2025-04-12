import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface RatingBarProps {
  rating: number; // Expecting a value between 0 and 1
  labels: string[];
  style?: ViewStyle;
}

const RatingBar = ({ rating, labels, style }: RatingBarProps) => {
  const indicatorPosition = `${Math.max(0, Math.min(1, rating)) * 100}%`;

  return (
    <View style={[styles.ratingBarContainer, style]}>
      <View style={styles.ratingBarBackground} />
      <View style={[styles.ratingBarIndicator, { left: indicatorPosition } as ViewStyle]} />
      <View style={styles.ratingLabels}>
        {labels.map((label) => (
          <Text
            key={label}
            style={styles.ratingLabelText}
          >
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ratingBarContainer: {
    flex: 1,
    height: 20,
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
    top: -8,
    transform: [{ translateX: -8 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1,
  } as ViewStyle,
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  ratingLabelText: {
    fontSize: 10,
    color: '#888',
  },
});

export default RatingBar;