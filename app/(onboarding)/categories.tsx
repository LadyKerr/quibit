import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { CategoryButtons } from '../../components/CategoryButtons';
import { useOnboarding } from '../../contexts/OnboardingContext';

const DEFAULT_CATEGORIES = ['Blog', 'Tutorial', 'Video', 'Article', 'Other'];

export default function CategoriesScreen() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const { completeOnboarding, saveCategories } = useOnboarding();

  const handleAddCustomCategory = () => {
    const category = newCategory.trim();
    if (!category) return;
    
    if (customCategories.includes(category) || DEFAULT_CATEGORIES.includes(category)) {
      Alert.alert('Category exists', 'This category already exists');
      return;
    }

    setCustomCategories(prev => [...prev, category]);
    setNewCategory('');
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleComplete = async () => {
    try {
      // Save all selected categories including custom ones
      const allSelectedCategories = [...selectedCategories, ...customCategories];
      await saveCategories(allSelectedCategories);
      await completeOnboarding();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save categories. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Choose Your Categories</ThemedText>
      
      <ThemedText style={styles.description}>
        Select the types of content you plan to save. You can always add more later.
      </ThemedText>

      <ThemedView style={styles.categoriesContainer}>
        <CategoryButtons
          categories={[...DEFAULT_CATEGORIES, ...customCategories]}
          selectedCategory=""
          onSelectCategory={toggleCategory}
          style={styles.categoryButtons}
        />
      </ThemedView>

      <ThemedView style={styles.customCategoryContainer}>
        <ThemedText style={styles.sectionTitle}>Add Custom Category</ThemedText>
        
        <ThemedView style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter category name"
            value={newCategory}
            onChangeText={setNewCategory}
            maxLength={20}
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={[styles.addButton, !newCategory.trim() && styles.buttonDisabled]}
            onPress={handleAddCustomCategory}
            disabled={!newCategory.trim()}
          >
            <ThemedText style={styles.addButtonText}>Add</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <TouchableOpacity
        style={[styles.button]}
        onPress={handleComplete}
      >
        <ThemedText style={styles.buttonText}>Start Using Quibit</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleComplete}
      >
        <ThemedText style={styles.skipButtonText}>Skip for now</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  categoriesContainer: {
    marginBottom: 32,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customCategoryContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  skipButton: {
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});