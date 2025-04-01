import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, Modal, StyleSheet, Text } from 'react-native';
import { useNotes } from '../../hooks/useNotes';
import { NoteForm } from '../../components/NoteForm';

export default function NotesScreen() {
  const { notes, addNote, editNote, deleteNote } = useNotes();
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

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

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingNote(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <Modal visible={isModalVisible} animationType="slide">
        <NoteForm
          onSubmit={editingNote ? handleEditNote : handleAddNote}
          initialData={editingNote || undefined}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  addButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
  },
});