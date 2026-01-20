import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Perfume, BasicPerfumeInfo } from '../../types/perfume';
import PerfumeModal, { PerfumeModalRef } from '../product/PerfumeModal';
import { useCart } from '../../context/CartContext';
import { useSnackbar } from '../../context/SnackbarContext'; // Import Snackbar context

type AIBoxInteractionsProps = {
  children: (props: {
    handlePerfumePress: (perfumeId: string) => void;
    handleSwapPress: (perfumeId: string) => void;
    handleAddToCart: () => Promise<void>;
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
  const { showSnackbar } = useSnackbar(); // Use Snackbar context
  const [swappingPerfumeId, setSwappingPerfumeId] = useState<string | null>(null);
  const modalRef = useRef<PerfumeModalRef>(null);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Rename ref for clarity

  // Clear redirect timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
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
      thumbnail_url: perfumesInBox[0]?.thumbnail_url,
      quantity: 1 as const,
    };

    try {
      await addItemToCart(itemData);
      console.log('AI Box added to cart:', itemData);
      showSnackbar("¡Añadido al carro! Redirigiendo..."); // Show snackbar on success

      // Clear previous redirect timeout if any
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);

      // Set timeout only for redirect
      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/(tabs)/(cart)');
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      console.error("Error adding AI Box to cart:", error);
      showSnackbar("Error al añadir."); // Show snackbar on error
    }
  }, [decantCount, decantSize, selectedPerfumeIds, calculateTotalPrice, addItemToCart, findPerfumeById]);

  return (
    <>
      {children({
        handlePerfumePress,
        handleSwapPress,
        handleAddToCart,
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