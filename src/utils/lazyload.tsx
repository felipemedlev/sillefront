import React, { Suspense } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

// Default loading component for lazy-loaded routes
const DefaultLoadingComponent: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#222222" />
    <Text style={styles.loadingText}>Cargando...</Text>
  </View>
);

// Higher-order component for lazy loading with custom loading component
export const withLazyLoading = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  LoadingComponent: React.ComponentType = DefaultLoadingComponent
) => {
  return (props: P) => (
    <Suspense fallback={<LoadingComponent />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Utility function to create lazy components with default loading
export const createLazyComponent = <P extends object>(
  importFunction: () => Promise<{ default: React.ComponentType<P> }>,
  LoadingComponent?: React.ComponentType
) => {
  const LazyComponent = React.lazy(importFunction);
  return withLazyLoading(LazyComponent, LoadingComponent);
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F7',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'InstrumentSans',
  },
});

export default DefaultLoadingComponent;