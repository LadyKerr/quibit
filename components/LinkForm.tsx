import React, { useState, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { CategoryButtons } from './CategoryButtons';
import { Link } from '../hooks/useLinks';

interface LinkFormProps {
  onSubmit: (data: {
    title: string;
    url: string;
    category: string;
    notes: string | null;
  }) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<Link>;
  categories: string[];
  onNewCategory: () => void;
  isEditing?: boolean;
}

export function LinkForm({
  onSubmit,
  onCancel,
  initialData,
  categories,
  onNewCategory,
  isEditing = false,
}: LinkFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [urlError, setUrlError] = useState('');

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

  const handleSubmit = async () => {
    if (!title.trim() || !isValidUrl) return;

    let processedUrl = url.trim();
    if (!processedUrl.toLowerCase().startsWith('http')) {
      processedUrl = `https://${processedUrl}`;
    }

    try {
      new URL(processedUrl);
      await onSubmit({
        title: title.trim(),
        url: processedUrl,
        category: category.trim() || 'Other',
        notes: notes.trim() || null,
      });
    } catch {
      setUrlError('Please enter a valid URL');
    }
  };

  const isButtonDisabled = !title.trim() || !isValidUrl;

  return (
    <View style={styles.form}>
      <ThemedText style={styles.formTitle}>
        {isEditing ? 'Edit Link' : 'Add Link'}
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

      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        placeholderTextColor="#666"
      />

      <View style={styles.categorySection}>
        <ThemedText style={styles.sectionTitle}>Category</ThemedText>
        <CategoryButtons
          categories={categories}
          selectedCategory={category}
          onSelectCategory={setCategory}
          onNewCategory={onNewCategory}
          showNewButton={true}
        />
      </View>

      <View style={styles.formButtons}>
        {isEditing && onCancel && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
          >
            <ThemedText style={styles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            isButtonDisabled ? styles.buttonDisabled : null,
            isEditing ? styles.editSubmitButton : styles.fullWidthButton
          ]}
          onPress={handleSubmit}
          disabled={isButtonDisabled}
        >
          <ThemedText style={styles.buttonText}>
            {isEditing ? 'Save Changes' : 'Save Link'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
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
  formButtons: {
    flexDirection: 'row',
    gap: 8,
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
});