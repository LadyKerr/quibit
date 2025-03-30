import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Link } from '../hooks/useLinks';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { LinkDetailModal } from './LinkDetailModal';
import { CATEGORY_COLORS } from './CategoryButtons';

// Map of category to emoji icons
const CATEGORY_ICONS: { [key: string]: string } = {
  Video: '🎥',
  Blog: '📝',
  Tutorial: '📚',
  Article: '📰',
  Other: '🔗',
};

// Map of action to emoji icons
const ACTION_ICONS = {
  visit: '🔗',
  edit: '✏️',
  delete: '🗑️',
};

interface LinkCardProps {
  link: Link;
  onEdit: (link: Link) => void;
  onPress: (url: string) => void;
  onDelete: (link: Link) => void;
}

export function LinkCard({ link, onEdit, onPress, onDelete }: LinkCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
  const categoryColors = CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Other;

  return (
    <>
      <TouchableOpacity onPress={() => setShowDetailModal(true)}>
        <ThemedView style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <ThemedText style={styles.title}>
                {categoryIcon} {link.title}
              </ThemedText>
            </View>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryColors.background },
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryText,
                  { color: categoryColors.text },
                ]}
              >
                {link.category}
              </ThemedText>
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
            <>
              <TouchableOpacity
                style={styles.notesButton}
                onPress={() => setShowNotes(!showNotes)}
              >
                <ThemedText style={styles.notesButtonText}>
                  {showNotes ? 'Hide Notes' : 'Show Notes'}
                </ThemedText>
              </TouchableOpacity>
              {showNotes && (
                <View style={styles.notesContainer}>
                  <ThemedText style={styles.notes}>{link.notes}</ThemedText>
                </View>
              )}
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onPress(link.url)}
            >
              <ThemedText style={styles.iconText}>
                {ACTION_ICONS.visit}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onEdit(link)}
            >
              <ThemedText style={styles.iconText}>
                {ACTION_ICONS.edit}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onDelete(link)}
            >
              <ThemedText style={styles.iconText}>
                {ACTION_ICONS.delete}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </TouchableOpacity>

      <LinkDetailModal
        link={link}
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        onEdit={(link) => {
          setShowDetailModal(false);
          onEdit(link);
        }}
        onDelete={(link) => {
          setShowDetailModal(false);
          onDelete(link);
        }}
        onVisit={onPress}
      />
    </>
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  domain: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  notesButton: {
    paddingVertical: 8,
    marginBottom: 0,
  },
  notesButtonText: {
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  notesContainer: {
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 0,
  },
  iconButton: {
    padding: 4,
  },
  iconText: {
    fontSize: 20,
  },
});