import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../../assets/images/Logo.svg';

const DESKTOP_BREAKPOINT = 768;

export default function StoreScreen() {
  const [activeTab, setActiveTab] = useState<'aibox' | 'giftbox'>('aibox');
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <View style={styles.container}>
      <View style={[styles.header, isDesktop && styles.desktopHeader]}>
        <Logo width={isDesktop ? 160 : 120} height={isDesktop ? 160 : 120} />
      </View>

      <View style={[styles.tabContainer, isDesktop && styles.desktopTabContainer]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'aibox' && styles.activeTab]}
          onPress={() => setActiveTab('aibox')}
        >
          <Text style={[styles.tabText, activeTab === 'aibox' && styles.activeTabText]}>
            AI Box
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'giftbox' && styles.activeTab]}
          onPress={() => setActiveTab('giftbox')}
        >
          <Text style={[styles.tabText, activeTab === 'giftbox' && styles.activeTabText]}>
            Gift Box
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.content, isDesktop && styles.desktopContent]}>
        {activeTab === 'aibox' ? (
          <Text style={styles.contentText}>AI Box Content</Text>
        ) : (
          <Text style={styles.contentText}>Gift Box Content</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  desktopHeader: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  desktopTabContainer: {
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  desktopContent: {
    paddingHorizontal: 40,
  },
  contentText: {
    fontSize: 18,
    color: '#333',
  },
});
