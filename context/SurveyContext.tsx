import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSurveyQuestions, ApiSurveyQuestion, submitSurveyResponse, authUtils } from '../src/services/api';

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
    await AsyncStorage.removeItem('surveyAnswers');
  };

  // Save survey answers locally
  const saveAllAnswers = async () => {
    try {
      await AsyncStorage.setItem('surveyAnswers', JSON.stringify(answers));
      // Note: This no longer automatically submits to the backend
      // Use submitSurveyIfAuthenticated() for that functionality
    } catch (error) {
      console.error('Error saving survey answers:', error);
    }
  };

  // Check if user is authenticated and submit survey if they are
  const submitSurveyIfAuthenticated = async (): Promise<boolean> => {
    try {
      // Check if user has an auth token (is logged in)
      const token = await authUtils.getToken();

      if (token && Object.keys(answers).length > 0) {
        // User is authenticated and has answers to submit
        await submitSurveyResponse(answers);
        console.log('Survey responses uploaded to backend successfully');
        return true;
      } else if (!token) {
        console.log('User not authenticated, survey responses saved locally only');
        return false;
      } else {
        console.log('No survey answers to submit');
        return false;
      }
    } catch (error) {
      console.error('Error submitting survey responses:', error);
      return false;
    }
  };

  // Check authentication status whenever answers change and submit if authenticated
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      // Only attempt to save answers if there are any
      saveAllAnswers();

      // Also try to submit if user is authenticated
      const attemptSubmission = async () => {
        await submitSurveyIfAuthenticated();
      };

      attemptSubmission();
    }
  }, [answers]);

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
        const storedAnswers = await AsyncStorage.getItem('surveyAnswers');
        if (storedAnswers) {
          setAnswers(JSON.parse(storedAnswers));
        }
      } catch (error) {
        console.error('Error loading survey answers:', error);
      }
    };

    loadSurveyAnswers();
  }, []);

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
