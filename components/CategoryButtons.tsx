import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

interface CategoryButtonsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onNewCategory?: () => void;
  showNewButton?: boolean;
  style?: object;
}

export function CategoryButtons({
  categories,
  selectedCategory,
  onSelectCategory,
  onNewCategory,
  showNewButton = false,
  style
}: CategoryButtonsProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={[styles.categoryList, style]}
      contentContainerStyle={styles.contentContainer}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[
            styles.categoryButton,
            selectedCategory === cat && styles.categoryButtonActive
          ]}
          onPress={() => onSelectCategory(cat)}
        >
          <ThemedText style={[
            styles.categoryButtonText,
            selectedCategory === cat && styles.categoryButtonTextActive
          ]}>{cat}</ThemedText>
        </TouchableOpacity>
      ))}
      {showNewButton && (
        <TouchableOpacity
          style={[styles.categoryButton, styles.newCategoryButton]}
          onPress={onNewCategory}
        >
          <ThemedText style={styles.categoryButtonText}>+ New Category</ThemedText>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryList: {
    flexGrow: 0,
    marginBottom: 12,
  },
  contentContainer: {
    paddingRight: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    color: '#666',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  newCategoryButton: {
    backgroundColor: '#e3f2fd',
  },
});