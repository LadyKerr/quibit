import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { SortOption, SearchFilters, getSortDisplayName } from '../hooks/useSearch';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableCategories: string[];
  placeholder?: string;
  showCategoryFilter?: boolean;
  showNotesFilter?: boolean;
  showDateFilter?: boolean;
  hasActiveFilters: boolean;
  onClearAll: () => void;
  filteredCount: number;
  totalCount: number;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filters,
  onFiltersChange,
  availableCategories,
  placeholder = "Search...",
  showCategoryFilter = true,
  showNotesFilter = false,
  showDateFilter = false,
  hasActiveFilters,
  onClearAll,
  filteredCount,
  totalCount,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions: SortOption[] = ['newest', 'oldest', 'title-asc', 'title-desc', 'category'];

  const handleFilterChange = <K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <ThemedText style={styles.searchIcon}>🔍</ThemedText>
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <ThemedText style={styles.clearIcon}>✕</ThemedText>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <ThemedText style={[styles.filterButtonText, hasActiveFilters && styles.filterButtonTextActive]}>
            {hasActiveFilters ? '●' : '○'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Results Summary */}
      <View style={styles.resultsSummary}>
        <ThemedText style={styles.resultsText}>
          {filteredCount === totalCount 
            ? `${totalCount} item${totalCount !== 1 ? 's' : ''}`
            : `${filteredCount} of ${totalCount} item${totalCount !== 1 ? 's' : ''}`
          }
        </ThemedText>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowFilters(true)}
        >
          <ThemedText style={styles.sortButtonText}>
            {getSortDisplayName(sortBy)} ⌄
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal visible={showFilters} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Search & Sort</ThemedText>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <ThemedText style={styles.closeButton}>✕</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sort Options */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Sort By</ThemedText>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, sortBy === option && styles.optionSelected]}
                  onPress={() => onSortChange(option)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    sortBy === option && styles.optionTextSelected
                  ]}>
                    {getSortDisplayName(option)}
                  </ThemedText>
                  {sortBy === option && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Filter */}
            {showCategoryFilter && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Category</ThemedText>
                {availableCategories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[styles.option, filters.category === category && styles.optionSelected]}
                    onPress={() => handleFilterChange('category', category)}
                  >
                    <ThemedText style={[
                      styles.optionText,
                      filters.category === category && styles.optionTextSelected
                    ]}>
                      {category}
                    </ThemedText>
                    {filters.category === category && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Notes Filter */}
            {showNotesFilter && (
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
                <TouchableOpacity
                  style={[styles.option, filters.hasNotes === true && styles.optionSelected]}
                  onPress={() => handleFilterChange('hasNotes', filters.hasNotes === true ? undefined : true)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    filters.hasNotes === true && styles.optionTextSelected
                  ]}>
                    With Notes Only
                  </ThemedText>
                  {filters.hasNotes === true && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.option, filters.hasNotes === false && styles.optionSelected]}
                  onPress={() => handleFilterChange('hasNotes', filters.hasNotes === false ? undefined : false)}
                >
                  <ThemedText style={[
                    styles.optionText,
                    filters.hasNotes === false && styles.optionTextSelected
                  ]}>
                    Without Notes Only
                  </ThemedText>
                  {filters.hasNotes === false && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => {
                  onClearAll();
                  setShowFilters(false);
                }}
              >
                <ThemedText style={styles.clearAllButtonText}>Clear All Filters</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBarContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchIcon: {
    fontSize: 16,
    color: '#868e96',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: '#868e96',
    padding: 4,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f3f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#868e96',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 18,
    color: '#666',
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  optionSelected: {
    backgroundColor: '#e3f2fd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  clearAllButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
