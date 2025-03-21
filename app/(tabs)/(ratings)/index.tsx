import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RatingsScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="star" size={40} color="#FFD700" />
      <Text style={styles.text}>Ratings</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFEFC',
  },
  text: {
    fontSize: 20,
    color: '#333',
  },
});