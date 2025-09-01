import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Text } from 'react-native';
import { useResponsive } from '../../src/utils/responsive';
import { COLORS } from '../../types/constants';

interface ResponsiveCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  width?: 'auto' | 'full' | number;
  title?: string;
  subtitle?: string;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'medium',
  width = 'auto',
  title,
  subtitle,
}) => {
  const { isDesktop, isLargeDesktop, getSpacing, getFontSize } = useResponsive();
  
  const paddingValue = {
    small: getSpacing(12),
    medium: getSpacing(16),
    large: getSpacing(24),
  }[padding];

  const cardStyles: ViewStyle = {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: isLargeDesktop ? 16 : isDesktop ? 12 : 8,
    padding: paddingValue,
    width: typeof width === 'number' ? width : width === 'full' ? '100%' : 'auto',
    ...getVariantStyles(variant, isDesktop, isLargeDesktop),
    ...style,
  };

  const Content = (
    <View style={cardStyles}>
      {(title || subtitle) && (
        <View style={[styles.header, { marginBottom: getSpacing(12) }]}>
          {title && (
            <Text style={[styles.title, { fontSize: getFontSize(18) }]}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text style={[styles.subtitle, { fontSize: getFontSize(14) }]}>
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {Content}
      </TouchableOpacity>
    );
  }

  return Content;
};

const getVariantStyles = (variant: string, isDesktop: boolean, isLargeDesktop: boolean): ViewStyle => {
  const baseElevation = isLargeDesktop ? 8 : isDesktop ? 6 : 4;
  
  switch (variant) {
    case 'elevated':
      return {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: isDesktop ? 4 : 2,
        },
        shadowOpacity: isDesktop ? 0.15 : 0.1,
        shadowRadius: baseElevation,
        elevation: baseElevation,
      };
    case 'outlined':
      return {
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        shadowColor: 'transparent',
      };
    default:
      return {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      };
  }
};

interface ResponsiveCardGridProps {
  children: React.ReactNode;
  spacing?: number;
  minCardWidth?: number;
}

export const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({
  children,
  spacing = 16,
  minCardWidth = 280,
}) => {
  const { width, getSpacing } = useResponsive();
  const actualSpacing = getSpacing(spacing);
  
  // Calculate how many cards can fit based on screen width and minimum card width
  const availableWidth = width - (actualSpacing * 2); // Account for container padding
  const cardsPerRow = Math.floor(availableWidth / (minCardWidth + actualSpacing));
  const adjustedCardsPerRow = Math.max(1, cardsPerRow);
  
  const cardWidth = (availableWidth - (actualSpacing * (adjustedCardsPerRow - 1))) / adjustedCardsPerRow;

  const childrenArray = React.Children.toArray(children);
  const rows = [];

  for (let i = 0; i < childrenArray.length; i += adjustedCardsPerRow) {
    const rowChildren = childrenArray.slice(i, i + adjustedCardsPerRow);
    rows.push(
      <View key={i} style={[styles.gridRow, { marginBottom: actualSpacing }]}>
        {rowChildren.map((child, index) => (
          <View 
            key={index} 
            style={[
              styles.gridItem,
              {
                width: cardWidth,
                marginRight: index < rowChildren.length - 1 ? actualSpacing : 0,
              }
            ]}
          >
            {child}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.grid, { padding: actualSpacing }]}>
      {rows}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.TEXT_SECONDARY,
  },
  grid: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  gridItem: {
    // Width will be set dynamically
  },
});