import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
  View,
  SafeAreaView,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLinks } from '../../hooks/useLinks';
import { useSearch } from '../../hooks/useSearch';
import type { Link as LinkType } from '../../hooks/useLinks';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { CategoryButtons } from '../../components/CategoryButtons';
import { LinkCard } from '../../components/LinkCard';
import { LinkForm } from '../../components/LinkForm';
import { SearchBar } from '../../components/SearchBar';
import { AppHeader } from '../../components/AppHeader';
import { useAuth } from '../../contexts/AuthContext';

export default function TabOneScreen() {
  const { 
    links: allLinks, 
    loading, 
    addLink,
    editLink,
    deleteLink,
    addCategory,
    categories,
    categoryColors,
  } = useLinks();
  
  // Use the search hook
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filters,
    setFilters,
    updateFilter,
    items: filteredLinks,
    totalCount,
    filteredCount,
    availableCategories,
    hasActiveFilters,
    clearAll,
  } = useSearch(allLinks, ['title', 'url', 'notes']);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);

  const { session } = useAuth();

  useEffect(() => {
    console.log('Session state:', {
      hasSession: !!session,
      userId: session?.user?.id,
      loading,
      linksCount: allLinks.length
    });
  }, [session, loading, allLinks]);

  const handleCreateCategory = async () => {
    const trimmedCategory = newCategoryName.trim();
    if (!trimmedCategory) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    const success = await addCategory(trimmedCategory);
    if (success) {
      setNewCategoryName('');
      setShowNewCategoryModal(false);
    } else {
      Alert.alert('Error', 'This category already exists');
    }
  };

  const handleDelete = (link: LinkType) => {
    Alert.alert(
      'Delete Link',
      `Are you sure you want to delete "${link.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteLink(link.id);
            if (!success) {
              Alert.alert('Error', 'Failed to delete link. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleSubmit = async (data: {
    title: string;
    url: string;
    category: string;
    notes: string | null;
  }) => {
    let success;
    if (editingLink) {
      success = await editLink(editingLink.id, data);
    } else {
      success = await addLink(data.title, data.url, data.category, data.notes);
    }
    if (success) {
      setShowAddModal(false);
      setEditingLink(null);
    }
  };

  const handleEdit = (link: LinkType) => {
    setEditingLink(link);
    setShowAddModal(true);
  };

  const renderItem = ({ item }: { item: LinkType }) => (
    <LinkCard
      link={item}
      onEdit={handleEdit}
      onPress={(url) => Linking.openURL(url)}
      onDelete={handleDelete}
      categoryColors={categoryColors}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <AppHeader 
          onAddPress={() => {
            setEditingLink(null);
            setShowAddModal(true);
          }}
        />

        <View style={styles.content}>
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
            filters={filters}
            onFiltersChange={setFilters}
            availableCategories={availableCategories}
            placeholder="Search your brain..."
            showCategoryFilter={true}
            showNotesFilter={true}
            hasActiveFilters={hasActiveFilters}
            onClearAll={clearAll}
            filteredCount={filteredCount}
            totalCount={totalCount}
          />

          {loading || !session ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <ThemedText style={styles.loadingText}>
                {!session ? 'Connecting...' : 'Loading your links...'}
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={filteredLinks}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText style={styles.emptyText}>
                    {hasActiveFilters 
                      ? "No links match your search criteria. Try adjusting your filters."
                      : "No links saved yet. Tap the + button to add your first link!"
                    }
                  </ThemedText>
                </View>
              }
            />
          )}
        </View>

        <Modal
          visible={showAddModal}
          animationType="slide"
          onRequestClose={() => {
            setShowAddModal(false);
            setEditingLink(null);
          }}
        >
          <SafeAreaView style={styles.modalContainer}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.keyboardView}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddModal(false);
                    setEditingLink(null);
                  }}
                  style={styles.closeButton}
                >
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <LinkForm
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowAddModal(false);
                    setEditingLink(null);
                  }}
                  initialData={editingLink || undefined}
                  categories={categories}
                  categoryColors={categoryColors}
                  onNewCategory={() => setShowNewCategoryModal(true)}
                  isEditing={!!editingLink}
                />
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>

        <Modal
          visible={showNewCategoryModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNewCategoryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>Create New Category</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholderTextColor="#666"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setNewCategoryName('');
                    setShowNewCategoryModal(false);
                  }}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, !newCategoryName.trim() && styles.buttonDisabled]}
                  onPress={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                >
                  <ThemedText style={styles.buttonText}>Create</ThemedText>
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
    backgroundColor: '#f8f6f3', // Warm off-white background (matches notes)
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8f6f3', // Warm off-white background (matches notes)
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f6f3', // Warm off-white background (matches notes)
    paddingHorizontal: 20, // Match notes page
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#6b5b4d', // Brown text (matches notes)
    lineHeight: 28,
    fontWeight: '300',
    letterSpacing: -0.2,
  },
  keyboardView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f6f3', // Match notes modal bg
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 2,
    padding: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 1,
  },
  toggleButtonActive: {
    backgroundColor: '#8b6914', // Golden brown (matches notes)
  },
  toggleButtonText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#6b5b4d', // Brown text (matches notes)
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
});
