import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

interface TopShapeProps {
  backgroundColor?: string;
  height?: number;
}

const TopShape = ({ backgroundColor = '#E9E3DB', height = 24 }: TopShapeProps) => {
  const screenHeight = Dimensions.get('window').height;
  const shapeHeight = (screenHeight * height) / 100;

  return (
    <View
      style={[
        styles.shape,
        {
          backgroundColor,
          height: shapeHeight,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  shape: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
});

export default TopShape;