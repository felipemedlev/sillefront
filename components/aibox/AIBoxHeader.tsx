import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

const AIBoxHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Feather name="chevron-left" size={24} color="#333" />
      </Pressable>
      <Text style={styles.headerTitle}>Selecciona tu Box AI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    backgroundColor: '#FFFFFF', // Ensure header has background
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  }
});

export default AIBoxHeader;