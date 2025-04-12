import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
  showText?: boolean;
}

const StarRating = ({ rating, size = 20, color = '#FFD700', showText = true }: StarRatingProps) => {
  const stars = Array(5).fill(0);

  return (
    <View style={styles.container}>
      {stars.map((_, index) => {
        const filled = index < Math.floor(rating);
        const halfFilled = !filled && index < Math.ceil(rating) && rating % 1 !== 0;

        return (
          <FontAwesome
            key={index}
            name={filled ? 'star' : halfFilled ? 'star-half-o' : 'star-o'}
            size={size}
            color={color}
            style={styles.star}
          />
        );
      })}
      {showText && (
        <Text style={styles.ratingText}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  }
});

export default StarRating;