import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

type AIBoxErrorStateProps = {
  error: string;
  onRetry: () => void;
};

const AIBoxErrorState: React.FC<AIBoxErrorStateProps> = ({ error, onRetry }) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <Pressable style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F7',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#809CAC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIBoxErrorState;