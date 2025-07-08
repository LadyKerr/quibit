import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, Text, SafeAreaView } from 'react-native';
import { useNotes, Note } from '../../hooks/useNotes';
import { NoteForm } from '../../components/NoteForm';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { AppHeader } from '../../components/AppHeader';

export default function NotesScreen() {
  const { notes, addNote, editNote, deleteNote } = useNotes();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

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

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Add your first note</Text>
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

        <FlatList
        data={notes}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={notes.length === 0 ? styles.emptyList : undefined}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.noteItem}
            onPress={() => {
              setEditingNote(item);
              setModalVisible(true);
            }}
          >
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteContent} numberOfLines={1}>
              {item.content}
            </Text>
            <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  noteItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    color: 'red',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptyList: {
    flex: 1,
  },
});