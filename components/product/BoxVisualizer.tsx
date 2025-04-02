import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { SPACING } from '../../types/constants';

type DecantCount = 4 | 8;
type DecantSize = 3 | 5 | 10;

interface BoxVisualizerProps {
  decantCount: DecantCount;
  decantSize: DecantSize;
}

// Define a type for the image map keys
type ImageMapKey = `${DecantCount}-${DecantSize}`;

// Define the image map with explicit types
const imageMap: Record<ImageMapKey, ImageSourcePropType> = {
  '4-3': require('../../assets/images/3mlx4.png'),
  '8-3': require('../../assets/images/3mlx8.png'),
  '4-5': require('../../assets/images/5mlx4.png'),
  '8-5': require('../../assets/images/5mlx8.png'),
  '4-10': require('../../assets/images/10mlx4.png'),
  '8-10': require('../../assets/images/10mlx8.png'),
};

const BoxVisualizer: React.FC<BoxVisualizerProps> = ({ decantCount, decantSize }) => {
  // Construct the key for the image map
  const imageKey: ImageMapKey = `${decantCount}-${decantSize}`;
  const imageSource = imageMap[imageKey];

  // Fallback in case an unexpected combination occurs (though types should prevent this)
  if (!imageSource) {
    console.warn(`BoxVisualizer: No image found for count ${decantCount} and size ${decantSize}`);
    return null; // Or render a placeholder
  }

  return (
    <View style={styles.container}>
      <Image
        source={imageSource}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center', // Center the image horizontally
    marginVertical: SPACING.MEDIUM, // Add some vertical space
    paddingHorizontal: SPACING.LARGE, // Add horizontal padding to constrain width if needed
  },
  image: {
    width: 150, // Adjust width as needed
    height: 100, // Adjust height as needed
    // Add any other styling like borders, background color if desired
  },
});

// Memoize the component for performance optimization
export default React.memo(BoxVisualizer);