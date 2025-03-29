import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Perfume } from '../types/perfume';
import { STORAGE_KEYS } from '../types/constants';

type DecantCount = 4 | 8;
type DecantSize = 3 | 5 | 10;

interface ManualBoxState {
  selectedPerfumes: Perfume[];
  decantCount: DecantCount;
  decantSize: DecantSize;
  addPerfume: (perfume: Perfume) => void;
  removePerfume: (perfumeId: string) => void;
  setDecantCount: (count: DecantCount) => void;
  setDecantSize: (size: DecantSize) => void;
  isPerfumeSelected: (perfumeId: string) => boolean;
  canAddMorePerfumes: () => boolean;
}

const ManualBoxContext = createContext<ManualBoxState | undefined>(undefined);

interface ManualBoxProviderProps {
  children: ReactNode;
}

export const ManualBoxProvider: React.FC<ManualBoxProviderProps> = ({ children }) => {
  const [selectedPerfumes, setSelectedPerfumes] = useState<Perfume[]>([]);
  const [decantCount, setDecantCount] = useState<DecantCount>(4);
  const [decantSize, setDecantSize] = useState<DecantSize>(5);

  // Load manual box data from AsyncStorage on mount
  useEffect(() => {
    const loadManualBoxData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEYS.MANUAL_BOX);
        if (savedData) {
          const { selectedPerfumes: savedPerfumes, decantCount: savedCount, decantSize: savedSize } = JSON.parse(savedData);
          setSelectedPerfumes(savedPerfumes);
          setDecantCount(savedCount);
          setDecantSize(savedSize);
        }
      } catch (error) {
        console.error('Error loading manual box data:', error);
      }
    };

    loadManualBoxData();
  }, []);

  // Save manual box data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveManualBoxData = async () => {
      try {
        const dataToSave = {
          selectedPerfumes,
          decantCount,
          decantSize,
        };
        await AsyncStorage.setItem(STORAGE_KEYS.MANUAL_BOX, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving manual box data:', error);
      }
    };

    saveManualBoxData();
  }, [selectedPerfumes, decantCount, decantSize]);

  const canAddMorePerfumes = useCallback(() => {
    return selectedPerfumes.length < decantCount;
  }, [selectedPerfumes, decantCount]);

  const addPerfume = useCallback((perfume: Perfume) => {
    setSelectedPerfumes((prevSelected) => {
      if (prevSelected.length < decantCount && !prevSelected.some(p => p.id === perfume.id)) {
        return [...prevSelected, perfume];
      }
      return prevSelected; // Return previous state if limit reached or already added
    });
  }, [decantCount]);

  const removePerfume = useCallback((perfumeId: string) => {
    setSelectedPerfumes((prevSelected) =>
      prevSelected.filter((perfume) => perfume.id !== perfumeId)
    );
  }, []);

  const isPerfumeSelected = useCallback((perfumeId: string) => {
    return selectedPerfumes.some(p => p.id === perfumeId);
  }, [selectedPerfumes]);

  const value: ManualBoxState = {
    selectedPerfumes,
    decantCount,
    decantSize,
    addPerfume,
    removePerfume,
    setDecantCount,
    setDecantSize,
    isPerfumeSelected,
    canAddMorePerfumes,
  };

  return (
    <ManualBoxContext.Provider value={value}>
      {children}
    </ManualBoxContext.Provider>
  );
};

export const useManualBox = (): ManualBoxState => {
  const context = useContext(ManualBoxContext);
  if (context === undefined) {
    throw new Error('useManualBox must be used within a ManualBoxProvider');
  }
  return context;
};