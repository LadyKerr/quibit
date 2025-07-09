import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

// Map of category to pastel colors
export const CATEGORY_COLORS: { [key: string]: { background: string; text: string } } = {
  Video: { background: '#FFE2E2', text: '#D35D6E' },  // Pastel red
  Blog: { background: '#E2F0CB', text: '#7BA05B' },   // Pastel green
  Tutorial: { background: '#FFE5B4', text: '#CC8B3C' }, // Pastel orange
  Article: { background: '#CBE2F0', text: '#3B7B9A' }, // Pastel blue
  Other: { background: '#E2D5F0', text: '#8860B9' },   // Pastel purple
  All: { background: '#F0F0F0', text: '#666666' },     // Gray for "All" category
};

interface CategoryButtonsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onNewCategory?: () => void;
  showNewButton?: boolean;
  style?: object;
  categoryColors?: { [key: string]: string };
}

export function CategoryButtons({
  categories,
  selectedCategory,
  onSelectCategory,
  onNewCategory,
  showNewButton = false,
  style,
  categoryColors = {}
}: CategoryButtonsProps) {
  const getCategoryColors = (category: string) => {
    const trimmedCategory = category.trim().replace(/[<>]/g, '');
    
    // If there's a custom color for this category, use it
    if (categoryColors[trimmedCategory]) {
      const customColor = categoryColors[trimmedCategory];
      return { 
        background: customColor + '30', // Add transparency
        text: customColor 
      };
    }
    
    // Otherwise use default colors
    return CATEGORY_COLORS[trimmedCategory] || { background: '#F0F0F0', text: '#666666' };
  };

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={[styles.categoryList, style]}
      contentContainerStyle={styles.contentContainer}
    >
      {categories.map((cat) => {
        const colors = getCategoryColors(cat);
        const isSelected = selectedCategory === cat;
        return (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              { backgroundColor: colors.background },
              isSelected && styles.categoryButtonActive,
              isSelected && { backgroundColor: colors.background }
            ]}
            onPress={() => onSelectCategory(cat)}
          >
            <ThemedText style={[
              styles.categoryButtonText,
              { color: colors.text },
              isSelected && styles.categoryButtonTextActive,
              isSelected && { color: colors.text }
            ]}>{cat}</ThemedText>
          </TouchableOpacity>
        )
      })}
      {showNewButton && (
        <TouchableOpacity
          style={[styles.categoryButton, styles.newCategoryButton]}
          onPress={onNewCategory}
        >
          <ThemedText style={styles.newCategoryButtonText}>+ New Category</ThemedText>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoryList: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingRight: 32,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  categoryButtonTextActive: {
    fontWeight: '700',
  },
  newCategoryButton: {
    backgroundColor: '#e7f5ff',
    borderColor: '#4263eb',
    borderWidth: 1,
  },
  newCategoryButtonText: {
    color: '#4263eb',
    fontSize: 14,
    fontWeight: '600',
  },
});