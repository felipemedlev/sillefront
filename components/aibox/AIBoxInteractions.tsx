import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Perfume, BasicPerfumeInfo } from '../../types/perfume';
import PerfumeModal, { PerfumeModalRef } from '../product/PerfumeModal';
import { useCart } from '../../context/CartContext';

type AIBoxInteractionsProps = {
  children: (props: {
    handlePerfumePress: (perfumeId: string) => void;
    handleSwapPress: (perfumeId: string) => void;
    handleAddToCart: () => Promise<void>;
    feedbackMessage: string | null;
  }) => React.ReactNode;
  selectedPerfumeIds: string[];
  decantCount: 4 | 8;
  decantSize: 3 | 5 | 10;
  setSelectedPerfumeIds: (ids: string[] | ((prev: string[]) => string[])) => void;
  findPerfumeById: (id: string) => Perfume | undefined;
  calculateTotalPrice: () => number;
  recommendedPerfumes: Perfume[];
};

export const AIBoxInteractions: React.FC<AIBoxInteractionsProps> = ({
  children,
  selectedPerfumeIds,
  decantCount,
  decantSize,
  setSelectedPerfumeIds,
  findPerfumeById,
  calculateTotalPrice,
  recommendedPerfumes
}) => {
  const { addItemToCart } = useCart();
  const [swappingPerfumeId, setSwappingPerfumeId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const modalRef = useRef<PerfumeModalRef>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handlePerfumePress = useCallback((perfumeId: string) => {
    const perfumeToShow = findPerfumeById(perfumeId);
    if (perfumeToShow && modalRef.current) {
      setSwappingPerfumeId(null);
      modalRef.current.show(perfumeToShow);
    } else {
      console.warn(`Perfume with ID ${perfumeId} not found in recommended list.`);
    }
  }, [findPerfumeById]);

  const handleSwapPress = useCallback((perfumeId: string) => {
    const perfumeToSwap = findPerfumeById(perfumeId);
    if (perfumeToSwap && modalRef.current) {
      setSwappingPerfumeId(perfumeId); // Set swap mode using internal ID
      modalRef.current.show(perfumeToSwap);
    } else {
      console.warn(`Perfume with ID ${perfumeId} not found for swapping.`);
    }
  }, [findPerfumeById]);

  const handleSimilarPerfumeSelect = useCallback((newPerfumeId: string) => { // newPerfumeId is internal DB ID
    if (swappingPerfumeId) {
      setSelectedPerfumeIds((prev: string[]) =>
        prev.map((id: string) => id === swappingPerfumeId ? newPerfumeId : id)
      );
      modalRef.current?.hide();
    }
  }, [swappingPerfumeId, setSelectedPerfumeIds]);

  const handleModalDismiss = useCallback(() => {
    setSwappingPerfumeId(null);
  }, []);

  const handleAddToCart = useCallback(async () => {
    const totalPrice = calculateTotalPrice();
    const perfumesInBox: BasicPerfumeInfo[] = selectedPerfumeIds
      .map(id => findPerfumeById(id))
      .filter((p): p is Perfume => !!p)
      .map(p => ({
        id: String(p.id),
        name: p.name,
        brand: p.brand,
        thumbnail_url: p.thumbnail_url || '',
        full_size_url: p.full_size_url || '',
      }));

    if (perfumesInBox.length !== decantCount) {
      Alert.alert("Error", `Could not find details for all selected perfumes. Expected ${decantCount}, found ${perfumesInBox.length}.`);
      return;
    }

    const itemData = {
      productType: 'AI_BOX' as const,
      name: `AI Box (${decantCount} x ${decantSize}ml)`,
      details: {
        decantCount,
        decantSize,
        perfumes: perfumesInBox,
      },
      price: totalPrice,
      thumbnailUrl: perfumesInBox[0]?.thumbnail_url,
    };

    try {
      await addItemToCart(itemData);
      console.log('AI Box added to cart:', itemData);
      setFeedbackMessage("¡Añadido al carro!");

      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackMessage(null);
        router.push('/(tabs)/(cart)');
      }, 2000);

    } catch (error) {
      console.error("Error adding AI Box to cart:", error);
      setFeedbackMessage("Error al añadir.");
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = setTimeout(() => setFeedbackMessage(null), 2000);
    }
  }, [decantCount, decantSize, selectedPerfumeIds, calculateTotalPrice, addItemToCart, findPerfumeById]);

  return (
    <>
      {children({
        handlePerfumePress,
        handleSwapPress,
        handleAddToCart,
        feedbackMessage,
      })}

      <PerfumeModal
        ref={modalRef}
        onClose={handleModalDismiss}
        isSwapping={!!swappingPerfumeId}
        onSimilarPerfumeSelect={handleSimilarPerfumeSelect}
        perfumeList={recommendedPerfumes}
      />
    </>
  );
};

export default AIBoxInteractions;