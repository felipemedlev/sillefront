import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';

interface TagItemProps {
  icon: string;
  label: string;
  value?: string;
  iconFamily?: 'Feather' | 'Ionicons' | 'MaterialCommunityIcons' | 'FontAwesome';
}

const TagItem = ({
  icon,
  label,
  value,
  iconFamily = 'MaterialCommunityIcons'
}: TagItemProps) => {
  // Select the right icon component based on family
  let IconComponent;
  switch (iconFamily) {
    case 'Feather': IconComponent = Feather; break;
    case 'Ionicons': IconComponent = Ionicons; break;
    case 'FontAwesome': IconComponent = FontAwesome; break;
    default: IconComponent = MaterialCommunityIcons;
  }

  return (
    <View style={styles.tagItem}>
      <View style={styles.tagIconContainer}>
        <IconComponent name={icon as any} size={22} color="#809CAC" />
      </View>
      <View style={styles.tagContent}>
        <Text style={styles.tagLabel}>{label}</Text>
        <Text style={styles.tagValue}>{value || 'N/A'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  tagIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tagContent: {
    flex: 1,
  },
  tagLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 4,
  },
  tagValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textTransform: 'capitalize',
  },
});

export default TagItem;