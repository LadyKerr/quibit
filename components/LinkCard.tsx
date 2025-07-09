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
  categoryColors?: { [key: string]: string };
}

export function LinkCard({ link, onEdit, onPress, onDelete, categoryColors = {} }: LinkCardProps) {
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
  
  // Use custom color if available, otherwise default
  const customColor = categoryColors[link.category];
  const categoryColors_display = customColor ? { 
    background: customColor + '30', // Add transparency
    text: customColor 
  } : (CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Other);

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
                { backgroundColor: categoryColors_display.background },
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryText,
                  { color: categoryColors_display.text },
                ]}
              >
                {link.category}
              </ThemedText>
            </View>
          </View>

          <View style={styles.content}>
            <ThemedText style={styles.domain}>{getDomain(link.url)}</ThemedText>
            <ThemedText style={styles.date}>
              {new Date(link.created_at).toLocaleDateString('en-US', {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    color: '#212529',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  domain: {
    fontSize: 14,
    color: '#868e96',
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#adb5bd',
    fontWeight: '500',
  },
  notesButton: {
    paddingVertical: 8,
    marginBottom: 4,
  },
  notesButtonText: {
    fontSize: 14,
    color: '#4263eb',
    fontWeight: '600',
  },
  notesContainer: {
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  notes: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 4,
  },
  iconButton: {
    padding: 6,
  },
  iconText: {
    fontSize: 18,
  },
});