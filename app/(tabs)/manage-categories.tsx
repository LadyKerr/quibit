import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, TextInput, Alert, ScrollView, SafeAreaView, Modal } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { AppHeader } from '../../components/AppHeader';
import { useLinks } from '../../hooks/useLinks';
import { CATEGORY_COLORS } from '../../components/CategoryButtons';

export default function ManageCategoriesScreen() {
  const { categories, addCategory, deleteCategory, editCategory, updateCategoryColor, categoryColors } = useLinks();
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalCategoryName, setModalCategoryName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');
  const [showColorModal, setShowColorModal] = useState(false);
  const [editingColorCategory, setEditingColorCategory] = useState<string | null>(null);

  // Available colors for new categories
  const availableColors = [
    '#FF6B6B', // Red
    '#FF9F43', // Orange
    '#54A0FF', // Blue
    '#5F27CD', // Purple
    '#00D2D3', // Cyan
    '#FF9FF3', // Pink
    '#4834D4', // Dark Blue
    '#26DE81', // Green
  ];

  const handleAddCategoryModal = async () => {
    const trimmedCategory = modalCategoryName.trim();
    if (!trimmedCategory) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    setIsAdding(true);
    const success = await addCategory(trimmedCategory);
    
    if (success) {
      // Save the selected color for the new category
      await updateCategoryColor(trimmedCategory, selectedColor);
      
      setModalCategoryName('');
      setSelectedColor('#FF6B6B');
      setShowAddModal(false);
      Alert.alert('Success', 'Category added successfully');
    } else {
      Alert.alert('Error', 'This category already exists');
    }
    
    setIsAdding(false);
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

  const handleColorEdit = (category: string) => {
    setEditingColorCategory(category);
    setSelectedColor(categoryColors[category] || '#FF6B6B');
    setShowColorModal(true);
  };

  const handleColorSave = async () => {
    if (!editingColorCategory) return;

    const result = await updateCategoryColor(editingColorCategory, selectedColor);
    if (result.success) {
      setShowColorModal(false);
      setEditingColorCategory(null);
      Alert.alert('Success', 'Category color updated successfully');
    } else {
      Alert.alert('Error', result.error || 'Failed to update category color');
    }
  };

  const DEFAULT_CATEGORIES = ['Blog', 'Tutorial', 'Video', 'Article', 'Other'];

  const isOriginallyDefaultCategory = (category: string) => {
    // Check if this category is one of the original default category names
    // This will properly categorize both original defaults and custom categories
    return DEFAULT_CATEGORIES.includes(category);
  };

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // For simplicity, we'll determine default vs custom by the original names
  // In a real app, you'd want to store category metadata including original type
  const defaultCategories = filteredCategories.filter(category => isOriginallyDefaultCategory(category));
  const customCategories = filteredCategories.filter(category => !isOriginallyDefaultCategory(category));

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
          showAddButton={true}
          title="Manage Categories"
          onAddPress={() => setShowAddModal(true)}
        />

        <View style={styles.content}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <ThemedText style={styles.searchIcon}>🔍</ThemedText>
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Default Categories Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Default Categories</ThemedText>
                <ThemedText style={styles.sectionSubtitle}>Can be renamed</ThemedText>
              </View>
              
              {defaultCategories.map((category) => {
                const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
                const customColor = categoryColors[category];
                const displayColor = customColor ? { 
                  background: customColor + '30', // Add transparency
                  text: customColor 
                } : colors;
                const isEditing = editingCategory === category;

                return (
                  <View key={category} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <View style={[
                        styles.categoryBadge,
                        { backgroundColor: displayColor.background }
                      ]} />
                      <View>
                        {isEditing ? (
                          <TextInput
                            style={styles.editInput}
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
                          <>
                            <ThemedText style={styles.categoryName}>{category}</ThemedText>
                            <ThemedText style={styles.categoryType}>Default</ThemedText>
                          </>
                        )}
                      </View>
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleColorEdit(category)}
                      >
                        <ThemedText style={styles.editIcon}>🎨</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleEditCategory(category)}
                      >
                        <ThemedText style={styles.editIcon}>
                          {isEditing ? '✓' : '✏️'}
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Custom Categories Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Custom Categories</ThemedText>
                <ThemedText style={styles.sectionSubtitle}>Tap + to add new</ThemedText>
              </View>
              
              {customCategories.map((category) => {
                const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.Other;
                const customColor = categoryColors[category];
                const displayColor = customColor ? { 
                  background: customColor + '30', // Add transparency
                  text: customColor 
                } : colors;
                const isEditing = editingCategory === category;
                const wasOriginallyDefault = isOriginallyDefaultCategory(category);

                return (
                  <View key={category} style={styles.categoryItem}>
                    <View style={styles.categoryInfo}>
                      <View style={[
                        styles.categoryBadge,
                        { backgroundColor: colors.background }
                      ]} />
                      <View>
                        {isEditing ? (
                          <TextInput
                            style={styles.editInput}
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
                          <>
                            <ThemedText style={styles.categoryName}>{category}</ThemedText>
                            <ThemedText style={styles.categoryType}>Custom</ThemedText>
                          </>
                        )}
                      </View>
                    </View>
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleColorEdit(category)}
                        disabled={isDeleting === category}
                      >
                        <ThemedText style={styles.editIcon}>🎨</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEditCategory(category)}
                        disabled={isDeleting === category}
                      >
                        <ThemedText style={styles.editIcon}>
                          {isEditing ? '✓' : '✏️'}
                        </ThemedText>
                      </TouchableOpacity>
                      {!wasOriginallyDefault && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteCategory(category)}
                          disabled={isDeleting === category || isEditing}
                        >
                          <ThemedText style={[
                            styles.deleteIcon,
                            isDeleting === category && styles.deleteIconDisabled
                          ]}>
                            {isDeleting === category ? '...' : '🗑️'}
                          </ThemedText>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Add Category Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ThemedText style={styles.modalTitle}>Add New Category</ThemedText>
              
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalLabel}>Category Name</ThemedText>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter category name"
                  value={modalCategoryName}
                  onChangeText={setModalCategoryName}
                  placeholderTextColor="#999"
                  autoFocus
                />
              </View>

              <View style={styles.modalSection}>
                <ThemedText style={styles.modalLabel}>Category Color</ThemedText>
                <View style={styles.colorGrid}>
                  {availableColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColorOption
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setModalCategoryName('');
                    setSelectedColor('#FF6B6B');
                  }}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    (!modalCategoryName.trim() || isAdding) && styles.saveButtonDisabled
                  ]}
                  onPress={handleAddCategoryModal}
                  disabled={!modalCategoryName.trim() || isAdding}
                >
                  <ThemedText style={styles.saveButtonText}>
                    {isAdding ? 'Saving...' : 'Save'}
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Color Edit Modal */}
        <Modal
          visible={showColorModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowColorModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <ThemedText style={styles.modalTitle}>
                Edit Color for "{editingColorCategory}"
              </ThemedText>
              
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalLabel}>Choose Color</ThemedText>
                <View style={styles.colorGrid}>
                  {availableColors.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        selectedColor === color && styles.selectedColorOption
                      ]}
                      onPress={() => setSelectedColor(color)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowColorModal(false);
                    setEditingColorCategory(null);
                  }}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleColorSave}
                >
                  <ThemedText style={styles.saveButtonText}>Save Color</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  categoryType: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
  deleteIconDisabled: {
    opacity: 0.5,
  },
  editInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    padding: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    minWidth: 120,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#333',
    borderWidth: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});