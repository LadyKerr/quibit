import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Alert, ScrollView, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { AppHeader } from '../../components/AppHeader';
import { useLinks } from '../../hooks/useLinks';
import { CATEGORY_COLORS } from '../../components/CategoryButtons';

export default function ManageCategoriesScreen() {
  const { categories, addCategory, deleteCategory, editCategory } = useLinks();
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const handleAddCategory = async () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    setIsAdding(true);
    const success = await addCategory(trimmedCategory);
    setIsAdding(false);

    if (success) {
      setNewCategory('');
      Alert.alert('Success', 'Category added successfully');
    } else {
      Alert.alert('Error', 'This category already exists');
    }
  };

  const handleEditCategory = async (oldName: string) => {
    if (editingCategory === oldName) {
      // Save changes
      const trimmedName = editedName.trim();
      if (!trimmedName) {
        Alert.alert('Error', 'Category name cannot be empty');
        return;
      }

      const result = await editCategory(oldName, trimmedName);
      if (result.success) {
        setEditingCategory(null);
        setEditedName('');
        Alert.alert('Success', 'Category updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to update category');
      }
    } else {
      // Start editing
      setEditingCategory(oldName);
      setEditedName(oldName);
    }
  };

  const handleDeleteCategory = async (category: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category}"? Links in this category will be marked as "Other".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(category);
            const result = await deleteCategory(category);
            setIsDeleting(null);
            
            if (result.success) {
              Alert.alert('Success', 'Category deleted successfully');
            } else {
              Alert.alert('Error', result.error || 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const isDefaultCategory = (category: string) => {
    return ['Blog', 'Tutorial', 'Video', 'Article', 'Other'].includes(category);
  };

  const handleEditInputKeyPress = (e: any, category: string) => {
    if (e.nativeEvent.key === 'Enter') {
      handleEditCategory(category);
    } else if (e.nativeEvent.key === 'Escape') {
      setEditingCategory(null);
      setEditedName('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <AppHeader 
          showBackButton={true}
          showAddButton={false}
          title="Manage Categories"
        />

        <View style={styles.content}>
          <View style={styles.addSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="New category name"
            value={newCategory}
            onChangeText={setNewCategory}
            placeholderTextColor="#666"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              (!newCategory.trim() || isAdding) && styles.buttonDisabled
            ]}
            onPress={handleAddCategory}
            disabled={!newCategory.trim() || isAdding}
          >
            <ThemedText style={styles.buttonText}>
              {isAdding ? 'Adding...' : 'Add'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.categoriesList}>
        {categories.map((category) => {
          const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
          const isDefault = isDefaultCategory(category);
          const isEditing = editingCategory === category;

          return (
            <View key={category} style={styles.categoryItem}>
              <View style={[
                styles.categoryBadge,
                { backgroundColor: colors.background }
              ]}>
                {isEditing ? (
                  <TextInput
                    style={[styles.editInput, { color: colors.text }]}
                    value={editedName}
                    onChangeText={setEditedName}
                    autoFocus
                    onKeyPress={(e) => handleEditInputKeyPress(e, category)}
                    onBlur={() => {
                      if (editedName !== category) {
                        handleEditCategory(category);
                      }
                    }}
                  />
                ) : (
                  <ThemedText style={[
                    styles.categoryText,
                    { color: colors.text }
                  ]}>
                    {category}
                    {isDefault && ' (Default)'}
                  </ThemedText>
                )}
              </View>
              {!isDefault && (
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionButton, isEditing && styles.saveButton]}
                    onPress={() => handleEditCategory(category)}
                    disabled={isDeleting === category}
                  >
                    <ThemedText style={styles.actionButtonText}>
                      {isEditing ? '✓' : '✏️'}
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteCategory(category)}
                    disabled={isDeleting === category || isEditing}
                  >
                    <ThemedText style={[
                      styles.actionButtonText,
                      isDeleting === category && styles.actionButtonTextDisabled
                    ]}>
                      {isDeleting === category ? '...' : '🗑️'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
        </ScrollView>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    minWidth: 80,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
  },
  actionButtonTextDisabled: {
    opacity: 0.5,
  },
  editInput: {
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
    minWidth: 120,
  },
});