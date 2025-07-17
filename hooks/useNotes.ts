import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('notes');
      setNotes(storedNotes ? JSON.parse(storedNotes) : []);
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addNote = async (title: string, content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      created_at: new Date().toISOString(),
    };
    const updatedNotes = [newNote, ...notes];
    await saveNotes(updatedNotes);
  };

  const editNote = async (id: string, updates: { title: string; content: string }) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, ...updates } : note
    );
    await saveNotes(updatedNotes);
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    await saveNotes(updatedNotes);
  };

  return {
    notes,
    addNote,
    editNote,
    deleteNote,
  };
}
