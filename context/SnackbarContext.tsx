import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

type SnackbarPosition = 'top' | 'bottom';

// Define the snackbar context type
interface SnackbarContextType {
  showSnackbar: (
    message: string,
    severity?: 'success' | 'error' | 'warning' | 'info',
    redirectAfter?: number,
    redirectPath?: string,
    position?: SnackbarPosition
  ) => void;
  hideSnackbar: () => void;
}

// Create the context
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Define the props for the provider component
interface SnackbarProviderProps {
  children: ReactNode;
}

// Create the SnackbarProvider component
export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [position, setPosition] = useState<SnackbarPosition>('top');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  const showSnackbar = useCallback((
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'success',
    redirectAfter?: number,
    redirectPath?: string,
    position: SnackbarPosition = 'top'
  ) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    // Set the message, severity, and position
    setMessage(message);
    setSeverity(severity);
    setPosition(position);
    setOpen(true);

    // If redirect is requested, store path and set timeout
    if (redirectAfter && redirectAfter > 0 && redirectPath) {
      setRedirectPath(redirectPath);
      const id = setTimeout(() => {
        router.push(redirectPath as any);
        setOpen(false);
      }, redirectAfter);

      setTimeoutId(id);
    }
  }, [timeoutId]);

  const hideSnackbar = useCallback(() => {
    setOpen(false);

    // Clear timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }

    // Clear redirect path
    setRedirectPath(null);
  }, [timeoutId]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    hideSnackbar();
  };

  // Calculate position based on 'top' or 'bottom' and insets
  const snackbarPosition = position === 'top'
    ? { top: insets.top + 20 }
    : { bottom: insets.bottom + 20 };

  return (
    <SnackbarContext.Provider value={{ showSnackbar, hideSnackbar }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: position, horizontal: 'center' }}
        sx={{
          ...snackbarPosition
        }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              whiteSpace: 'pre-line', // Allow line breaks
            }
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

// Custom hook to use the SnackbarContext
export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};