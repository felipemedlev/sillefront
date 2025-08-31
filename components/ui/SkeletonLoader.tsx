import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING } from '../../types/constants';
import { shouldUseNativeDriver } from '../../src/utils/animation';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonItem: React.FC<SkeletonLoaderProps> = ({ 
  width: itemWidth = '100%', 
  height = 16, 
  borderRadius = 4,
  style 
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateLoop = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: shouldUseNativeDriver,
        }),
      ]).start(() => animateLoop());
    };
    
    animateLoop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeletonItem,
        {
          width: itemWidth,
          height,
          borderRadius,
          opacity,
        },
        style
      ]}
    />
  );
};

export const SkeletonPerfumeCard = () => (
  <View style={styles.perfumeCardSkeleton}>
    <SkeletonItem width={100} height={100} borderRadius={8} style={styles.perfumeImageSkeleton} />
    <SkeletonItem width="80%" height={14} style={{ marginTop: SPACING.SMALL }} />
    <SkeletonItem width="60%" height={12} style={{ marginTop: SPACING.XSMALL }} />
  </View>
);

export const SkeletonSurveyQuestion = () => (
  <View style={styles.surveyQuestionSkeleton}>
    {/* Progress bar skeleton */}
    <View style={styles.progressBarSkeleton}>
      <SkeletonItem width="30%" height={4} borderRadius={2} />
    </View>
    
    {/* Question image skeleton */}
    <SkeletonItem 
      width={width * 0.4} 
      height={width * 0.4} 
      borderRadius={20} 
      style={styles.questionImageSkeleton} 
    />
    
    {/* Question text skeleton */}
    <View style={styles.questionTextSkeleton}>
      <SkeletonItem width="80%" height={24} style={{ marginBottom: SPACING.SMALL }} />
      <SkeletonItem width="90%" height={16} style={{ marginBottom: SPACING.XSMALL }} />
      <SkeletonItem width="70%" height={16} />
    </View>
    
    {/* Rating buttons skeleton */}
    <View style={styles.ratingButtonsSkeleton}>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonItem
          key={index}
          width={50}
          height={50}
          borderRadius={25}
          style={{ marginHorizontal: SPACING.SMALL }}
        />
      ))}
    </View>
  </View>
);

export const SkeletonRecommendationsList = () => (
  <View style={styles.recommendationsListSkeleton}>
    {Array.from({ length: 4 }).map((_, index) => (
      <View key={index} style={styles.recommendationItemSkeleton}>
        <SkeletonItem width={80} height={80} borderRadius={8} />
        <View style={styles.recommendationTextSkeleton}>
          <SkeletonItem width="80%" height={16} style={{ marginBottom: SPACING.XSMALL }} />
          <SkeletonItem width="60%" height={14} style={{ marginBottom: SPACING.XSMALL }} />
          <SkeletonItem width="40%" height={12} />
        </View>
        <SkeletonItem width={60} height={32} borderRadius={16} />
      </View>
    ))}
  </View>
);

export const SkeletonBoxVisualizer = () => (
  <View style={styles.boxVisualizerSkeleton}>
    <SkeletonItem 
      width={width * 0.8} 
      height={200} 
      borderRadius={12}
      style={{ alignSelf: 'center', marginBottom: SPACING.LARGE }}
    />
    
    {/* Decant selector skeleton */}
    <View style={styles.decantSelectorSkeleton}>
      <SkeletonItem width="40%" height={20} style={{ marginBottom: SPACING.MEDIUM }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonItem key={index} width={80} height={40} borderRadius={20} />
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeletonItem: {
    backgroundColor: COLORS.BORDER,
  },
  perfumeCardSkeleton: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
  },
  perfumeImageSkeleton: {
    marginBottom: SPACING.SMALL,
  },
  surveyQuestionSkeleton: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING.LARGE,
  },
  progressBarSkeleton: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  questionImageSkeleton: {
    marginBottom: SPACING.XLARGE,
  },
  questionTextSkeleton: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.XLARGE,
  },
  ratingButtonsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationsListSkeleton: {
    padding: SPACING.MEDIUM,
  },
  recommendationItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.MEDIUM,
    marginBottom: SPACING.MEDIUM,
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 12,
  },
  recommendationTextSkeleton: {
    flex: 1,
    marginLeft: SPACING.MEDIUM,
    marginRight: SPACING.MEDIUM,
  },
  boxVisualizerSkeleton: {
    padding: SPACING.LARGE,
  },
  decantSelectorSkeleton: {
    alignItems: 'center',
  },
});