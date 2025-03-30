import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Link } from '../hooks/useLinks';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Map of category to emoji icons
const CATEGORY_ICONS: { [key: string]: string } = {
  Video: '🎥',
  Blog: '📝',
  Tutorial: '📚',
  Article: '📰',
  Other: '🔗',
};

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onPress: (url: string) => void;
  onDelete: (link: Link) => void;
}

export function LinkCard({ link, onEdit, onPress, onDelete }: LinkCardProps) {
  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  const categoryIcon = CATEGORY_ICONS[link.category] || CATEGORY_ICONS.Other;

  return (
    <ThemedView style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title}>
            {categoryIcon} {link.title}
          </ThemedText>
        </View>
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryText}>{link.category}</ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.domain}>{getDomain(link.url)}</ThemedText>
        <ThemedText style={styles.date}>
          {new Date(link.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </ThemedText>
      </View>

      {link.notes && (
        <View style={styles.notesContainer}>
          <ThemedText style={styles.notes}>{link.notes}</ThemedText>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.visitButton]}
          onPress={() => onPress(link.url)}
        >
          <ThemedText style={styles.buttonText}>Visit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => onEdit(link)}
        >
          <ThemedText style={styles.buttonText}>Edit</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => onDelete(link)}
        >
          <ThemedText style={styles.buttonText}>Delete</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  categoryBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  domain: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitButton: {
    backgroundColor: '#007AFF',
    flex: 1,
  },
  editButton: {
    backgroundColor: '#6c757d',
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 8,
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});