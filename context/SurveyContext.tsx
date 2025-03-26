import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Accord = {
  id: string;
  name: string;
  description: string;
};

export type SurveyAnswers = {
  [key: string]: number | string; // Key is accord ID, value is rating 1-5 or gender string
};

type SurveyContextType = {
  answers: SurveyAnswers;
  setAnswer: (accordId: string, rating: number | string) => void;
  resetSurvey: () => void;
  saveAllAnswers: () => Promise<void>;
  progress: number;
  isComplete: boolean;
};

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [answers, setAnswers] = useState<SurveyAnswers>({});

  // Calculate progress
  const progress = Object.keys(answers).length / 13; // Updated to 13 questions (1 gender + 12 accords)
  const isComplete = progress === 1;

  // Set a survey answer
  const setAnswer = (accordId: string, rating: number | string) => {
    setAnswers((prev) => ({ ...prev, [accordId]: rating }));
  };

  // Reset the survey
  const resetSurvey = async () => {
    setAnswers({});
    await AsyncStorage.removeItem('surveyAnswers');
  };

  // Save survey answers
  const saveAllAnswers = async () => {
    try {
      await AsyncStorage.setItem('surveyAnswers', JSON.stringify(answers));
    } catch (error) {
      console.error('Error saving survey answers:', error);
    }
  };

  // Load answers from storage when mounting
  useEffect(() => {
    console.log("context/SurveyContext.tsx: useEffect - Loading survey answers");
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
        progress,
        isComplete,
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
