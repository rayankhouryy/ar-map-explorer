import React from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { Chip } from 'react-native-paper';

interface Props {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  style?: ViewStyle;
}

const FILTER_OPTIONS = [
  { key: 'art', label: 'Art', icon: 'palette' },
  { key: 'menu', label: 'Menu', icon: 'restaurant' },
  { key: 'wayfinding', label: 'Wayfinding', icon: 'navigation' },
  { key: 'object_scan', label: 'Scan', icon: 'qr-code-scanner' },
  { key: 'info_card', label: 'Info', icon: 'information' },
];

export default function FilterChips({ activeFilters, onFilterChange, style }: Props) {
  const toggleFilter = (filterKey: string) => {
    let newFilters: string[];
    
    if (activeFilters.includes(filterKey)) {
      // Remove filter
      newFilters = activeFilters.filter(f => f !== filterKey);
    } else {
      // Add filter
      newFilters = [...activeFilters, filterKey];
    }
    
    onFilterChange(newFilters);
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {FILTER_OPTIONS.map((option) => (
          <Chip
            key={option.key}
            mode={activeFilters.includes(option.key) ? 'flat' : 'outlined'}
            selected={activeFilters.includes(option.key)}
            onPress={() => toggleFilter(option.key)}
            style={[
              styles.chip,
              activeFilters.includes(option.key) && styles.selectedChip
            ]}
            textStyle={[
              styles.chipText,
              activeFilters.includes(option.key) && styles.selectedChipText
            ]}
          >
            {option.label}
          </Chip>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
  },
  scrollContainer: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  chip: {
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  selectedChip: {
    backgroundColor: '#6366f1',
  },
  chipText: {
    fontSize: 12,
  },
  selectedChipText: {
    color: 'white',
  },
});
