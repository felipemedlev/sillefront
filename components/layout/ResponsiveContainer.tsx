import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive } from '../../src/utils/responsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  maxWidth?: number;
  centerContent?: boolean;
  padding?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  maxWidth,
  centerContent = true,
  padding = true,
}) => {
  const { containerWidth, padding: responsivePadding, isDesktop } = useResponsive();

  const containerStyles: ViewStyle = {
    width: '100%',
    maxWidth: maxWidth || containerWidth,
    ...(centerContent && { alignSelf: 'center' }),
    ...(padding && {
      paddingHorizontal: responsivePadding.horizontal,
      paddingVertical: isDesktop ? responsivePadding.vertical : responsivePadding.vertical * 0.5,
    }),
    ...style,
  };

  return (
    <View style={containerStyles}>
      {children}
    </View>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: number;
  spacing?: number;
  style?: ViewStyle;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns,
  spacing = 16,
  style,
}) => {
  const { gridColumns, getSpacing } = useResponsive();
  const actualColumns = columns || gridColumns;
  const actualSpacing = getSpacing(spacing);

  const childrenArray = React.Children.toArray(children);
  const rows = [];

  for (let i = 0; i < childrenArray.length; i += actualColumns) {
    const rowChildren = childrenArray.slice(i, i + actualColumns);
    rows.push(
      <View key={i} style={[styles.row, { marginBottom: actualSpacing }]}>
        {rowChildren.map((child, index) => (
          <View 
            key={index} 
            style={[
              styles.column, 
              { 
                flex: 1 / actualColumns,
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
    <View style={[styles.grid, style]}>
      {rows}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  column: {
    // flex: 1, // This will be set dynamically
  },
});