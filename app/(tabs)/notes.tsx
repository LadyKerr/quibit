import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, TextInput, SafeAreaView, Alert, TouchableWithoutFeedback } from 'react-native';
import { useNotes, Note } from '../../hooks/useNotes';
import { NoteForm } from '../../components/NoteForm';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { AppHeader } from '../../components/AppHeader';

export default function NotesScreen() {
  const { notes, addNote, editNote, deleteNote } = useNotes();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNote = async (data: { title: string; content: string }) => {
    await addNote(data.title, data.content);
    setModalVisible(false);
  };

  const handleEditNote = async (data: { title: string; content: string }) => {
    if (editingNote) {
      await editNote(editingNote.id, data);
      setEditingNote(null);
      setModalVisible(false);
    }
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteNote(note.id);
            setShowActionMenu(null);
          },
        },
      ]
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const noteDate = new Date(timestamp);
    const diffInMs = now.getTime() - noteDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return noteDate.toLocaleDateString();
    }
  };

  const renderNoteCard = ({ item }: { item: Note }) => (
    <View style={styles.noteCard}>
      <TouchableOpacity
        style={styles.noteContent}
        onPress={() => {
          setEditingNote(item);
          setModalVisible(true);
        }}
      >
        <ThemedText style={styles.noteTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.notePreview} numberOfLines={3}>
          {item.content}
        </ThemedText>
        <ThemedText style={styles.noteTime}>
          {formatTimeAgo(item.created_at)}
        </ThemedText>
      </TouchableOpacity>

      <View style={styles.noteActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setEditingNote(item);
            setModalVisible(true);
          }}
        >
          <ThemedText style={styles.actionIcon}>✏️</ThemedText>
          <ThemedText style={styles.actionLabel}>Edit</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonDanger]}
          onPress={() => handleDeleteNote(item)}
        >
          <ThemedText style={styles.actionIcon}>🗑️</ThemedText>
          <ThemedText style={[styles.actionLabel, styles.actionLabelDanger]}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNoteList = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteListItem}
      onPress={() => {
        setEditingNote(item);
        setModalVisible(true);
      }}
    >
      <View style={styles.noteListContent}>
        <View style={styles.noteListHeader}>
          <ThemedText style={styles.noteListTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.noteListTime}>
            {formatTimeAgo(item.created_at)}
          </ThemedText>
        </View>
        <ThemedText style={styles.noteListPreview} numberOfLines={2}>
          {item.content}
        </ThemedText>
      </View>
      
      <TouchableOpacity
        style={styles.listActionButton}
        onPress={(e) => {
          e.stopPropagation();
          setShowActionMenu(showActionMenu === item.id ? null : item.id);
        }}
      >
        <ThemedText style={styles.listActionIcon}>⋯</ThemedText>
      </TouchableOpacity>
      
      {showActionMenu === item.id && (
        <View style={styles.actionMenu}>
          <TouchableOpacity
            style={styles.actionMenuItem}
            onPress={() => {
              setEditingNote(item);
              setModalVisible(true);
              setShowActionMenu(null);
            }}
          >
            <ThemedText style={styles.actionMenuIcon}>✏️</ThemedText>
            <ThemedText style={styles.actionMenuText}>Edit</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionMenuItem, styles.actionMenuItemDanger]}
            onPress={() => handleDeleteNote(item)}
          >
            <ThemedText style={styles.actionMenuIcon}>🗑️</ThemedText>
            <ThemedText style={[styles.actionMenuText, styles.actionMenuTextDanger]}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>
        No notes yet. Tap the + button to add your first note!
      </ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <AppHeader 
          onAddPress={() => {
            setEditingNote(null);
            setModalVisible(true);
          }}
        />

        <TouchableWithoutFeedback onPress={() => setShowActionMenu(null)}>
          <View style={styles.content}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <ThemedText style={styles.searchIcon}>🔍</ThemedText>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* Header with count and view toggle */}
            <View style={styles.headerRow}>
              <ThemedText style={styles.notesCount}>
                {filteredNotes.length} Note{filteredNotes.length !== 1 ? 's' : ''}
              </ThemedText>
              <View style={styles.viewToggle}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    viewMode === 'cards' && styles.toggleButtonActive
                  ]}
                  onPress={() => setViewMode('cards')}
                >
                  <ThemedText style={[
                    styles.toggleButtonText,
                    viewMode === 'cards' && styles.toggleButtonTextActive
                  ]}>Cards</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    viewMode === 'list' && styles.toggleButtonActive
                  ]}
                  onPress={() => setViewMode('list')}
                >
                  <ThemedText style={[
                    styles.toggleButtonText,
                    viewMode === 'list' && styles.toggleButtonTextActive
                  ]}>List</ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              data={filteredNotes}
              keyExtractor={item => item.id}
              renderItem={viewMode === 'cards' ? renderNoteCard : renderNoteList}
              ListEmptyComponent={renderEmptyComponent}
              contentContainerStyle={filteredNotes.length === 0 ? styles.emptyList : styles.listContent}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={() => setShowActionMenu(null)}
            />
          </View>
        </TouchableWithoutFeedback>

        <Modal visible={isModalVisible} animationType="slide">
          <NoteForm
            onSubmit={editingNote ? handleEditNote : handleAddNote}
            initialData={editingNote || undefined}
            onClose={() => {
              setModalVisible(false);
              setEditingNote(null);
            }}
          />
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  searchContainer: {
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchBar: {
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  notesCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#4263eb',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 20,
  },
  noteCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f3f5',
  },
  noteContent: {
    marginBottom: 16,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  notePreview: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 12,
  },
  noteTime: {
    fontSize: 12,
    color: '#adb5bd',
    fontWeight: '500',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  actionButtonDanger: {
    backgroundColor: '#ffebee',
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  actionLabelDanger: {
    color: '#d32f2f',
  },
  // List view styles
  noteListItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f3f5',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  noteListContent: {
    flex: 1,
    marginRight: 12,
  },
  noteListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    marginRight: 8,
  },
  noteListTime: {
    fontSize: 11,
    color: '#adb5bd',
    fontWeight: '500',
  },
  noteListPreview: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  listActionButton: {
    padding: 8,
    borderRadius: 6,
  },
  listActionIcon: {
    fontSize: 18,
    color: '#adb5bd',
    fontWeight: 'bold',
  },
  actionMenu: {
    position: 'absolute',
    right: 16,
    top: 50,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f3f5',
    minWidth: 120,
    zIndex: 1000,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  actionMenuItemDanger: {
    // No additional background for danger items in menu
  },
  actionMenuIcon: {
    fontSize: 14,
  },
  actionMenuText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  actionMenuTextDanger: {
    color: '#d32f2f',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#868e96',
    lineHeight: 24,
  },
  emptyList: {
    flex: 1,
  },
});