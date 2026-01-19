import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSurveyQuestions, ApiSurveyQuestion, submitSurveyResponse, authUtils } from '../src/services/api';
import { useAuth } from '../src/context/AuthContext';
import Constants from 'expo-constants';

// Define API_BASE_URL
const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl || 'http://127.0.0.1:8000/api';
const AUTH_STATE_EVENT = 'auth.changed';
const SURVEY_ANSWERS_KEY = 'survey.answers';
const SURVEY_PROGRESS_KEY = 'survey.progress';
// Minimum time between survey submissions (in milliseconds)
const MIN_SUBMISSION_INTERVAL = 5000; // 5 seconds

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
  getCurrentQuestionIndex: () => number;
  saveProgress: (currentQuestionId: string) => Promise<void>;
  getLastQuestionId: () => Promise<string | null>;
};

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [questions, setQuestions] = useState<ApiSurveyQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState<boolean>(false);
  const [wasAuthenticated, setWasAuthenticated] = useState<boolean>(false);
  // Add a submission lock to prevent multiple submissions
  const isSubmitting = useRef<boolean>(false);

  // Track the last time a submission was attempted
  const lastSubmissionTime = useRef<number>(0);

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
    await AsyncStorage.removeItem(SURVEY_PROGRESS_KEY);
    // Also clear from localStorage for web
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SURVEY_ANSWERS_KEY);
      localStorage.removeItem(SURVEY_PROGRESS_KEY);
    }
  };

  // Listen for authentication state changes from AuthContext
  useEffect(() => {
    console.log('SurveyContext: Auth state check -', { isAuthenticated, user: !!user, wasAuthenticated, pendingUpload });

    // Handle transition to authenticated state OR if we have pending uploads
    if (isAuthenticated && Object.keys(answers).length > 0) {
      if (!wasAuthenticated || pendingUpload) {
        // Check if we've recently submitted
        const now = Date.now();
        const timeSinceLastSubmission = now - lastSubmissionTime.current;

        if (timeSinceLastSubmission > MIN_SUBMISSION_INTERVAL) {
          console.log('User authenticated with pending survey data - attempting submission');
          setTimeout(() => {
            if (!isSubmitting.current) {
              submitSurveyIfAuthenticated();
            }
          }, 300);
        } else {
          console.log(`Skipping auth-triggered submission (last submission was ${Math.round(timeSinceLastSubmission / 1000)}s ago)`);
        }
      }
    }

    // Handle transition to unauthenticated state
    if (!isAuthenticated && wasAuthenticated && Object.keys(answers).length > 0) {
      console.log('User logged out with survey data - marking as pending');
      setPendingUpload(true);
    }

    // Update the previous auth state
    setWasAuthenticated(isAuthenticated);
  }, [isAuthenticated, user, answers, pendingUpload]);

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
          setPendingUpload(true); // Assume pending until verified/synced
          return;
        }

        // Fall back to AsyncStorage if needed
        const storedAnswers = await AsyncStorage.getItem(SURVEY_ANSWERS_KEY);
        if (storedAnswers) {
          const parsedAnswers = JSON.parse(storedAnswers);
          setAnswers(parsedAnswers);
          setPendingUpload(true); // Assume pending until verified/synced

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

  // Process changes to answers - Save locally whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length === 0) return;

    // Always save locally
    saveAllAnswers();

    // Note: Automatic submission on answer change is removed.
    // Submission now primarily happens on authentication state change (if pending)
    // or when explicitly called (e.g., by AIBoxProvider if needed, though we aim to remove that).

  }, [answers]); // Only depends on answers for saving locally

  // Check if user is authenticated and submit survey if they are
  const submitSurveyIfAuthenticated = async (): Promise<boolean> => {
    console.log('[SurveyContext] submitSurveyIfAuthenticated called');
    console.log('[SurveyContext] Current state:', {
      isAuthenticated,
      user: user ? { id: user.id, email: user.email } : null,
      answersCount: Object.keys(answers).length,
      isSubmitting: isSubmitting.current
    });

    // Prevent duplicate submissions
    if (isSubmitting.current) {
      console.log('[SurveyContext] Submission already in progress, skipping');
      return false;
    }

    // Mark as submitting immediately to prevent race conditions
    isSubmitting.current = true;

    try {
      // Check auth status
      if (!isAuthenticated) {
        console.log('[SurveyContext] Not authenticated, storing answers locally only');
        isSubmitting.current = false;
        return false;
      }

      if (Object.keys(answers).length === 0) {
        console.log('[SurveyContext] No answers to submit');
        isSubmitting.current = false;
        return false;
      }

      // Additional validation - verify the token is still valid
      const token = await authUtils.getToken();
      console.log('[SurveyContext] Token from storage:', token ? 'Present' : 'Missing');

      if (!token || token.trim() === '') {
        console.log('[SurveyContext] Token missing or invalid');
        logout(); // Use logout() instead of invalid setIsAuthenticated
        isSubmitting.current = false;
        return false;
      }

      // Update last submission time ONLY when we are actually proceeding with an authenticated submission
      lastSubmissionTime.current = Date.now();

      // Log submission attempt with timestamp
      console.log(`[SurveyContext] Attempting to submit survey at ${new Date().toISOString()}`);

      try {
        const result = await submitSurveyResponse(answers);

        // Check if the response indicates actual server-side saving
        if (result) {
          console.log('[SurveyContext] Survey successfully saved to server');
          setPendingUpload(false); // Mark as synced
          isSubmitting.current = false;
          return true;
        } else {
          console.log('[SurveyContext] Survey API returned success but data may not have been saved');
          isSubmitting.current = false;
          return false;
        }
      } catch (error: any) {
        // Handle auth-related errors
        if (error.status === 401 || error.status === 403) {
          console.error('[SurveyContext] Authentication error during survey submission');
          logout(); // Use logout() instead of invalid setIsAuthenticated
          isSubmitting.current = false;
          return false;
        }

        // Other errors
        console.error('[SurveyContext] Error submitting survey:', error);
        isSubmitting.current = false;
        return false;
      }
    } catch (error) {
      console.error('[SurveyContext] Error in submitSurveyIfAuthenticated:', error);
      isSubmitting.current = false;
      return false;
    }
  };

  // Progress persistence functions
  const getCurrentQuestionIndex = () => {
    if (!questions || questions.length === 0) return 0;
    const answeredCount = Object.keys(answers).length;
    return Math.min(answeredCount, questions.length - 1);
  };

  const saveProgress = async (currentQuestionId: string) => {
    try {
      const progressData = {
        currentQuestionId,
        timestamp: Date.now(),
        totalQuestions: questions.length,
        answeredCount: Object.keys(answers).length
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(SURVEY_PROGRESS_KEY, JSON.stringify(progressData));

      // Save to localStorage for web
      if (typeof window !== 'undefined') {
        localStorage.setItem(SURVEY_PROGRESS_KEY, JSON.stringify(progressData));
      }
    } catch (error) {
      console.error('Error saving survey progress:', error);
    }
  };

  const getLastQuestionId = async (): Promise<string | null> => {
    try {
      // Try localStorage first (for web)
      let storedProgress = null;
      if (typeof window !== 'undefined') {
        storedProgress = localStorage.getItem(SURVEY_PROGRESS_KEY);
      }

      // Fall back to AsyncStorage
      if (!storedProgress) {
        storedProgress = await AsyncStorage.getItem(SURVEY_PROGRESS_KEY);
      }

      if (storedProgress) {
        const progressData = JSON.parse(storedProgress);
        // Check if progress is recent (within 7 days)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (progressData.timestamp > sevenDaysAgo) {
          return progressData.currentQuestionId;
        }
      }
    } catch (error) {
      console.error('Error loading survey progress:', error);
    }
    return null;
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
        getCurrentQuestionIndex,
        saveProgress,
        getLastQuestionId,
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
