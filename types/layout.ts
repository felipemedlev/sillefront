export interface FontLoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface LayoutStyles {
  webContainer?: import('react-native').ViewStyle;
  container: {
    flex: number;
  };
  stackContent: {
    flex: number;
    backgroundColor: string;
  };
  loadingContainer: {
    flex: number;
    justifyContent: 'center';
    alignItems: 'center';
    backgroundColor: string;
  };
  loadingText: {
    marginTop: number;
    fontSize: number;
    color: string;
  };
  errorContainer: {
    flex: number;
    justifyContent: 'center';
    alignItems: 'center';
    backgroundColor: string;
    padding: number;
  };
  errorText: {
    fontSize: number;
    color: string;
    textAlign: 'center';
    marginBottom: number;
  };
  fallbackText: {
    fontSize: number;
    color: string;
    textAlign: 'center';
  };
}