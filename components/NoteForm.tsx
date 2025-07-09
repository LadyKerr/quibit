import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from './ThemedText';

interface NoteFormProps {
  onSubmit: (data: { title: string; content: string }) => void;
  onClose: () => void;
  initialData?: { title: string; content: string };
}

export function NoteForm({ onSubmit, onClose, initialData }: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');

  const handleSubmit = () => {
    if (title.trim()) {
      onSubmit({ title: title.trim(), content: content.trim() });
    }
  };

  const isButtonDisabled = !title.trim();

  return (
    <SafeAreaView style={styles.modalContainer}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
          >
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.form}>
            <ThemedText style={styles.formTitle}>
              {initialData ? 'Edit Note' : 'Add Note'}
            </ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#666"
            />

            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="Write your note..."
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#666"
            />

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <ThemedText style={styles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  isButtonDisabled ? styles.buttonDisabled : null,
                  styles.submitButton
                ]}
                onPress={handleSubmit}
                disabled={isButtonDisabled}
              >
                <ThemedText style={styles.buttonText}>
                  {initialData ? 'Save Changes' : 'Save Note'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  formContainer: {
    flex: 1,
    padding: 16,
  },
  form: {
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
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  button: {
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
    flex: 1,
    backgroundColor: '#6c757d',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#007AFF',
  },
});
