import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { formStyles } from '../styles/formStyles';

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
          <View style={formStyles.form}>
            <ThemedText style={formStyles.formTitle}>
              {initialData ? 'Edit Note' : 'Add Note'}
            </ThemedText>
            
            <TextInput
              style={formStyles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#666"
            />

            <TextInput
              style={[formStyles.input, styles.contentInput]}
              placeholder="Write your note..."
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              placeholderTextColor="#666"
            />

            <View style={formStyles.formButtons}>
              <TouchableOpacity
                style={[formStyles.button, formStyles.cancelButton]}
                onPress={onClose}
              >
                <ThemedText style={formStyles.buttonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  formStyles.button,
                  isButtonDisabled ? formStyles.buttonDisabled : null,
                  formStyles.submitButton
                ]}
                onPress={handleSubmit}
                disabled={isButtonDisabled}
                accessibilityLabel={initialData ? 'Save Changes' : 'Save Note'}
                accessibilityHint={isButtonDisabled ? 'Button is disabled. Please enter a title to enable saving.' : 'Tap to save your note'}
                accessibilityState={{ disabled: isButtonDisabled }}
              >
                <ThemedText style={formStyles.buttonText}>
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
  contentInput: {
    height: 200,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
});
