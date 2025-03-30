import React, { useState } from 'react';
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
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLinks } from '../../hooks/useLinks';
import type { Link as LinkType } from '../../hooks/useLinks';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { CategoryButtons } from '../../components/CategoryButtons';
import { LinkCard } from '../../components/LinkCard';
import { LinkForm } from '../../components/LinkForm';
import { useAuth } from '../../contexts/AuthContext';

export default function TabOneScreen() {
  const { 
    links, 
    loading, 
    addLink,
    editLink,
    deleteLink,
    addCategory,
    searchQuery, 
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    sortOrder,
    setSortOrder,
  } = useLinks();

  const { signOut } = useAuth();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);

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

  const toggleSortOrder = () => {
    setSortOrder(current => current === 'newest' ? 'oldest' : 'newest');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
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
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../../assets/images/icon.png')}
              style={styles.headerIcon}
            />
            <ThemedText style={styles.headerTitle}>Quibit</ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <TextInput
                style={[styles.input, styles.searchInput]}
                placeholder="Search links..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#666"
              />
              <TouchableOpacity
                style={[styles.sortButton]}
                onPress={toggleSortOrder}
              >
                <ThemedText style={styles.sortButtonText}>
                  {sortOrder === 'newest' ? '↓ Latest' : '↑ Oldest'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            <CategoryButtons
              categories={['All', ...categories]}
              selectedCategory={selectedCategory === '' ? 'All' : selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat === 'All' ? '' : cat)}
              style={styles.filterCategories}
            />
          </View>

          {loading ? (
            <ActivityIndicator style={styles.loading} />
          ) : (
            <FlatList
              data={links}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <ThemedText style={styles.emptyText}>
                  No links saved yet. Tap the + button to add your first link!
                </ThemedText>
              }
            />
          )}

          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              setEditingLink(null);
              setShowAddModal(true);
            }}
          >
            <ThemedText style={styles.fabText}>+</ThemedText>
          </TouchableOpacity>
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

              <LinkForm
                onSubmit={handleSubmit}
                onCancel={() => {
                  setShowAddModal(false);
                  setEditingLink(null);
                }}
                initialData={editingLink || undefined}
                categories={categories}
                onNewCategory={() => setShowNewCategoryModal(true)}
                isEditing={!!editingLink}
              />
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
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 4,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    color: '#666',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterCategories: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 0,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginRight: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  logoutText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 60,
    width: 60, // Slightly larger
    height: 60, // Slightly larger
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Increased elevation
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 999,
  },
  fabText: {
    color: '#fff',
    fontSize: 32, // Larger font size
    fontWeight: '500',
    lineHeight: 32, // Add this to help with vertical centering
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
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
});
