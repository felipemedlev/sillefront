import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fetchPerfumes } from '../../src/services/api';
import { Perfume } from '../../types/perfume';

interface PerfumeSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (perfume: Perfume) => void;
  excludeIds?: string[]; // IDs to exclude from results (already selected)
}

const PerfumeSearchModal: React.FC<PerfumeSearchModalProps> = ({ visible, onClose, onSelect, excludeIds = [] }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setError(null);
      setLoading(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || query.trim().length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPerfumes(1, 25, query)
      .then((data: any) => {
        let perfumes: Perfume[] = Array.isArray(data.results) ? data.results : data;
        if (!Array.isArray(perfumes)) perfumes = [];
        // Exclude already selected
        perfumes = perfumes.filter(p => !excludeIds.includes(String(p.id)));
        if (!cancelled) setResults(perfumes);
      })
      .catch(() => {
        if (!cancelled) setError('Error buscando perfumes');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [query, visible, excludeIds]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Buscar Perfume</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color="#333" />
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Buscar por nombre o marca..."
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholderTextColor="#aaa"
          />
          {loading && <ActivityIndicator style={{ marginVertical: 16 }} color="#809CAC" />}
          {error && <Text style={styles.error}>{error}</Text>}
          <FlatList
            data={results}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <Pressable style={styles.resultItem} onPress={() => onSelect(item)}>
                <Image source={{ uri: item.thumbnail_url || item.thumbnail_url }} style={styles.resultImage} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.resultName}>{item.name}</Text>
                  <Text style={styles.resultBrand}>{item.brand}</Text>
                </View>
              </Pressable>
            )}
            ListEmptyComponent={query.length >= 2 && !loading && !error ? (
              <Text style={styles.empty}>No se encontraron perfumes.</Text>
            ) : null}
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 400,
    maxHeight: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  closeButton: {
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    color: '#222',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  resultBrand: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    marginTop: 24,
    fontSize: 16,
  },
});

export default PerfumeSearchModal;