import React from 'react';
import { Pressable, Image, Text, StyleSheet } from 'react-native';
import { BasicPerfumeInfo } from '../../types/perfume';

interface PerfumeCardProps {
  perfume: BasicPerfumeInfo;
  onPress: () => void;
}

const PerfumeCard = ({ perfume, onPress }: PerfumeCardProps) => (
  <Pressable onPress={onPress} style={styles.similarPerfumeCard}>
    <Image source={{ uri: perfume.thumbnail_url }} style={styles.similarPerfumeImage} />
    <Text style={styles.similarPerfumeName} numberOfLines={1}>{perfume.name}</Text>
    <Text style={styles.similarPerfumeBrand} numberOfLines={1}>{perfume.brand}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  similarPerfumeCard: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
  },
  similarPerfumeImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 8,
    borderRadius: 8,
  },
  similarPerfumeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  similarPerfumeBrand: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
});

export default PerfumeCard;