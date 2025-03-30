import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  TextInput,
  FlatList,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
  View,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useLinks, Link, SortOrder } from '../../hooks/useLinks';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { CategoryButtons } from '../../components/CategoryButtons';
import { LinkCard } from '../../components/LinkCard';
import { useAuth } from '../../contexts/AuthContext';

export default function TabOneScreen() {
  const { 
    links, 
    loading, 
    addLink,
    editLink,
    addCategory,
    searchQuery, 
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    getRelativeTime,
    sortOrder,
    setSortOrder,
  } = useLinks();

  const { signOut } = useAuth();
  
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [urlError, setUrlError] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  const isValidUrl = useMemo(() => {
    try {
      if (!url) return false;
      new URL(url.toLowerCase().startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  }, [url]);

  const handleUrlChange = (text: string) => {
    setUrl(text);
    setUrlError('');
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setCategory('');
    setUrlError('');
    setEditingLinkId(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    let processedUrl = url.trim();
    if (!processedUrl.toLowerCase().startsWith('http')) {
      processedUrl = `https://${processedUrl}`;
    }

    try {
      new URL(processedUrl);
      const finalCategory = category.trim() || 'Other';
      
      let success;
      if (editingLinkId) {
        success = await editLink(editingLinkId, {
          title: title.trim(),
          url: processedUrl,
          category: finalCategory,
        });
      } else {
        success = await addLink(title.trim(), processedUrl, finalCategory);
      }

      if (success) {
        resetForm();
      }
    } catch {
      setUrlError('Please enter a valid URL');
    }
  };

  const handleEdit = (link: Link) => {
    setTitle(link.title);
    setUrl(link.url);
    setCategory(link.category);
    setEditingLinkId(link.id);
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleCreateCategory = async () => {
    const trimmedCategory = newCategoryName.trim();
    if (!trimmedCategory) {
      Alert.alert('Error', 'Category name cannot be empty');
      return;
    }

    const success = await addCategory(trimmedCategory);
    if (success) {
      setCategory(trimmedCategory);
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
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const renderItem = ({ item }: { item: Link }) => (
    <LinkCard
      link={item}
      onEdit={handleEdit}
      onPress={(url) => Linking.openURL(url)}
    />
  );

  const isButtonDisabled = !title.trim() || !isValidUrl;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Quibit</ThemedText>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <View style={styles.form}>
            <ThemedText style={styles.formTitle}>
              {editingLinkId ? 'Edit Link' : 'Add Link'}
            </ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#666"
            />

            <View>
              <TextInput
                style={[styles.input, urlError ? styles.inputError : null]}
                placeholder="URL (e.g., google.com)"
                value={url}
                onChangeText={handleUrlChange}
                placeholderTextColor="#666"
                keyboardType="url"
                autoCapitalize="none"
              />
              {urlError ? (
                <ThemedText style={styles.errorText}>{urlError}</ThemedText>
              ) : null}
            </View>

            <View style={styles.categorySection}>
              <ThemedText style={styles.sectionTitle}>Category</ThemedText>
              <CategoryButtons
                categories={categories}
                selectedCategory={category}
                onSelectCategory={setCategory}
                onNewCategory={() => setShowNewCategoryModal(true)}
                showNewButton={true}
              />
            </View>

            <View style={styles.formButtons}>
              {editingLinkId && (
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <ThemedText style={styles.buttonText}>Cancel</ThemedText>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.button,
                  isButtonDisabled ? styles.buttonDisabled : null,
                  editingLinkId ? styles.editSubmitButton : styles.fullWidthButton
                ]}
                onPress={handleSubmit}
                disabled={isButtonDisabled}
              >
                <ThemedText style={styles.buttonText}>
                  {editingLinkId ? 'Save Changes' : 'Save Link'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

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
                  No links saved yet. Add your first link above!
                </ThemedText>
              }
            />
          )}

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
        </View>
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
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    marginTop: 40,
  },
  form: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  button: {
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: 4, // Add slight padding to account for card shadows
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
  categoryList: {
    flexGrow: 0,
    marginBottom: 12,
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
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 12,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  fullWidthButton: {
    flex: 1,
  },
  editSubmitButton: {
    flex: 2,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6c757d',
  },
  categorySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  newCategoryButton: {
    backgroundColor: '#e3f2fd',
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
});
