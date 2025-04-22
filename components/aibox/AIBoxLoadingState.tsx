import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

type AIBoxLoadingStateProps = {
  loadingMessage: string;
};

const AIBoxLoadingState: React.FC<AIBoxLoadingStateProps> = ({ loadingMessage }) => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#809CAC" />
      <Text style={{ marginTop: 10, color: '#555' }}>{loadingMessage}</Text>
      <Text style={{ marginTop: 5, color: '#888', fontSize: 12 }}>
        Estamos preparando recomendaciones personalizadas basadas en tus respuestas.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
  },
});

export default AIBoxLoadingState;