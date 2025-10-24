import React, { useState, useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { CategoryButtons } from './CategoryButtons';
import { Link } from '../hooks/useLinks';
import { validateUrl, processUrl, UrlValidationResult } from '../utils/urlValidation';
import { formStyles } from '../styles/formStyles';

interface LinkFormProps {
  onSubmit: (data: {
    title: string;
    url: string;
    category: string;
    notes: string | null;
    created_at?: string;
  }) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<Link>;
  categories: string[];
  categoryColors?: { [key: string]: string };
  onNewCategory: () => void;
  isEditing?: boolean;
}

export function LinkForm({
  onSubmit,
  onCancel,
  initialData,
  categories,
  categoryColors = {},
  onNewCategory,
  isEditing = false,
}: LinkFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [urlError, setUrlError] = useState('');

  const urlValidation = useMemo(() => validateUrl(url), [url]);

  const handleUrlChange = (text: string) => {
    setUrl(text);
    const validation = validateUrl(text);
    setUrlError(validation.error || '');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !urlValidation.isValid) return;

    const processedUrl = processUrl(url);

    try {
      // Add timestamp at submission time
      const now = new Date().toISOString();
      
      await onSubmit({
        title: title.trim(),
        url: processedUrl,
        category: category.trim() || 'Other',
        notes: notes.trim() || null,
        created_at: now // Add this
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('rate limit')) {
        setUrlError('Too many submissions. Please try again later.');
      } else {
        setUrlError('Failed to save link');
      }
    }
  };

  const isButtonDisabled = !title.trim() || !urlValidation.isValid;

  return (
    <View style={formStyles.form}>
      <ThemedText style={formStyles.formTitle}>
        {isEditing ? 'Edit Link' : 'Add Link'}
      </ThemedText>
      
      <TextInput
        style={formStyles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor="#666"
      />

      <View>
        <TextInput
          style={[formStyles.input, urlError ? formStyles.inputError : null]}
          placeholder="URL (e.g., google.com)"
          value={url}
          onChangeText={handleUrlChange}
          placeholderTextColor="#666"
          keyboardType="url"
          autoCapitalize="none"
        />
        {urlError ? (
          <ThemedText style={formStyles.errorText}>{urlError}</ThemedText>
        ) : null}
      </View>

      <TextInput
        style={[formStyles.input, styles.notesInput]}
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
          categoryColors={categoryColors}
          showNewButton={true}
        />
      </View>

      <View style={formStyles.formButtons}>
        {isEditing && onCancel && (
          <TouchableOpacity
            style={[formStyles.button, formStyles.cancelButton]}
            onPress={onCancel}
          >
            <ThemedText style={formStyles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            formStyles.button,
            isButtonDisabled ? formStyles.buttonDisabled : null,
            isEditing ? formStyles.submitButton : formStyles.fullWidthButton
          ]}
          onPress={handleSubmit}
          disabled={isButtonDisabled}
        >
          <ThemedText style={formStyles.buttonText}>
            {isEditing ? 'Save Changes' : 'Save Link'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  notesInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
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
});