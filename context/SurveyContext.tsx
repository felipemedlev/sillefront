import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSurveyQuestions, ApiSurveyQuestion, submitSurveyResponse, authUtils } from '../src/services/api';
import Constants from 'expo-constants';

// Define API_BASE_URL
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://127.0.0.1:8000/api';
const AUTH_STATE_EVENT = 'auth.changed';
const SURVEY_ANSWERS_KEY = 'survey.answers';

export type Accord = {
  id: string;
  name: string;
  description: string;
};

export type SurveyAnswers = {
  [key: string]: number | string; // Key is question ID or accord name, value is rating 1-5 or gender string
};

type SurveyContextType = {
  answers: SurveyAnswers;
  setAnswer: (questionId: string, rating: number | string) => void;
  resetSurvey: () => void;
  saveAllAnswers: () => Promise<void>;
  submitSurveyIfAuthenticated: () => Promise<boolean>;
  progress: number;
  isComplete: boolean;
  questions: ApiSurveyQuestion[];
  isLoadingQuestions: boolean;
  questionError: string | null;
};

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [questions, setQuestions] = useState<ApiSurveyQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  // Add a submission lock to prevent multiple submissions
  const isSubmitting = useRef<boolean>(false);

  // Calculate progress based on the number of questions answered vs total questions
  const progress = questions.length > 0 ? Object.keys(answers).length / questions.length : 0;
  const isComplete = questions.length > 0 && progress === 1;

  // Set a survey answer
  const setAnswer = (questionId: string, rating: number | string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: rating }));
  };

  // Reset the survey
  const resetSurvey = async () => {
    setAnswers({});
    await AsyncStorage.removeItem(SURVEY_ANSWERS_KEY);
  };

  // Listen for standard auth events
  useEffect(() => {
    // Function to check auth status and handle accordingly
    const checkAuthState = async () => {
      try {
        console.log('Checking auth state in SurveyContext');
        const token = await authUtils.getToken();
        const isValid = !!(token && token.trim() !== '');

        // If auth state changed, update and take appropriate actions
        if (isValid !== isAuthenticated || !authInitialized) {
          console.log(`Auth state changed: ${isAuthenticated} → ${isValid}`);
          setIsAuthenticated(isValid);
          setAuthInitialized(true);

          // Handle transition to authenticated state
          if (isValid && !isAuthenticated && Object.keys(answers).length > 0) {
            console.log('User authenticated with pending survey data - attempting submission');
            // Use setTimeout to ensure state updates are processed first
            setTimeout(() => {
              // Only attempt submission if not already submitting
              if (!isSubmitting.current) {
                submitSurveyIfAuthenticated();
              }
            }, 300);
            setPendingUpload(false);
          }

          // Handle transition to unauthenticated state
          if (!isValid && isAuthenticated && Object.keys(answers).length > 0) {
            console.log('User logged out with survey data - marking as pending');
            setPendingUpload(true);
          }
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      }
    };

    // Initial check
    checkAuthState();

    // Listen for the standardized auth event
    const handleAuthEvent = () => {
      checkAuthState();
    };

    window.addEventListener(AUTH_STATE_EVENT, handleAuthEvent);

    return () => {
      window.removeEventListener(AUTH_STATE_EVENT, handleAuthEvent);
    };
  }, [isAuthenticated, answers]);

  // Fetch questions from API on mount
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      setQuestionError(null);

      try {
        const questionsData = await fetchSurveyQuestions();
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching survey questions:', error);
        setQuestionError('Error loading survey questions. Please try again later.');
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  // Load answers from storage when mounting
  useEffect(() => {
    const loadSurveyAnswers = async () => {
      try {
        // Try localStorage first (for web)
        const storedAnswersWeb = localStorage.getItem(SURVEY_ANSWERS_KEY);

        if (storedAnswersWeb) {
          setAnswers(JSON.parse(storedAnswersWeb));
          return;
        }

        // Fall back to AsyncStorage if needed
        const storedAnswers = await AsyncStorage.getItem(SURVEY_ANSWERS_KEY);
        if (storedAnswers) {
          const parsedAnswers = JSON.parse(storedAnswers);
          setAnswers(parsedAnswers);

          // Also save to localStorage for future use
          localStorage.setItem(SURVEY_ANSWERS_KEY, storedAnswers);
        }
      } catch (error) {
        console.error('Error loading survey answers:', error);
      }
    };

    loadSurveyAnswers();
  }, []);

  // Save survey answers locally
  const saveAllAnswers = async () => {
    try {
      // Save to AsyncStorage for React Native compatibility
      await AsyncStorage.setItem(SURVEY_ANSWERS_KEY, JSON.stringify(answers));

      // Also save to localStorage for web
      localStorage.setItem(SURVEY_ANSWERS_KEY, JSON.stringify(answers));

      // Mark as pending if not authenticated
      if (Object.keys(answers).length > 0 && !isAuthenticated) {
        setPendingUpload(true);
      }
    } catch (error) {
      console.error('Error saving survey answers:', error);
    }
  };

  // Process changes to answers
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;

    // Always save locally
    saveAllAnswers();

    // If authenticated and initialized, try to submit after a delay
    if (isAuthenticated && authInitialized) {
      const debounceTimer = setTimeout(() => {
        console.log('Authenticated user changed answers - attempting to submit');
        // Only attempt submission if not already submitting
        if (!isSubmitting.current) {
          submitSurveyIfAuthenticated();
        }
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [answers, isAuthenticated, authInitialized]);

  // Check if user is authenticated and submit survey if they are
  const submitSurveyIfAuthenticated = async (): Promise<boolean> => {
    // Prevent duplicate submissions
    if (isSubmitting.current) {
      console.log('Submission already in progress, skipping');
      return false;
    }

    isSubmitting.current = true;

    try {
      // Check auth status
      if (!isAuthenticated) {
        console.log('Not authenticated, storing answers locally only');
        isSubmitting.current = false;
        return false;
      }

      if (Object.keys(answers).length === 0) {
        console.log('No answers to submit');
        isSubmitting.current = false;
        return false;
      }

      // Additional validation - verify the token is still valid
      const token = await authUtils.getToken();
      if (!token || token.trim() === '') {
        console.log('Token missing or invalid');
        setIsAuthenticated(false);
        isSubmitting.current = false;
        return false;
      }

      // Log submission attempt with timestamp
      console.log(`Attempting to submit survey at ${new Date().toISOString()}`);

      try {
        const result = await submitSurveyResponse(answers);

        // Check if the response indicates actual server-side saving
        if (result && result.user) {
          console.log('Survey successfully saved to server');
          isSubmitting.current = false;
          return true;
        } else {
          console.log('Survey API returned success but data may not have been saved');
          isSubmitting.current = false;
          return false;
        }
      } catch (error: any) {
        // Handle auth-related errors
        if (error.status === 401 || error.status === 403) {
          console.error('Authentication error during survey submission');
          setIsAuthenticated(false);
          isSubmitting.current = false;
          return false;
        }

        // Other errors
        console.error('Error submitting survey:', error);
        isSubmitting.current = false;
        return false;
      }
    } catch (error) {
      console.error('Error in submitSurveyIfAuthenticated:', error);
      isSubmitting.current = false;
      return false;
    }
  };

  return (
    <SurveyContext.Provider
      value={{
        answers,
        setAnswer,
        resetSurvey,
        saveAllAnswers,
        submitSurveyIfAuthenticated,
        progress,
        isComplete,
        questions,
        isLoadingQuestions,
        questionError,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

// **Export the hook**
export const useSurveyContext = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurveyContext must be used within a SurveyProvider');
  }
  return context;
};
