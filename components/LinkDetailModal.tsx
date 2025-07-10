import React from 'react';
import { StyleSheet, Modal, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';
import { Link } from '../hooks/useLinks';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { CATEGORY_COLORS } from './CategoryButtons';

interface LinkDetailModalProps {
  link: Link;
  visible: boolean;
  onClose: () => void;
  onEdit: (link: Link) => void;
  onDelete: (link: Link) => void;
  onVisit: (url: string) => void;
}

export function LinkDetailModal({ 
  link, 
  visible, 
  onClose, 
  onEdit, 
  onDelete,
  onVisit 
}: LinkDetailModalProps) {
  const formattedDate = new Date(link.created_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const categoryColors = CATEGORY_COLORS[link.category] || CATEGORY_COLORS.Other;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Link Details</ThemedText>
          <View style={styles.headerRight} />
        </ThemedView>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Title</ThemedText>
            <ThemedText style={styles.title}>{link.title}</ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>URL</ThemedText>
            <TouchableOpacity onPress={() => onVisit(link.url)}>
              <ThemedText style={styles.url}>{getDomain(link.url)}</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Category</ThemedText>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: categoryColors.background }
            ]}>
              <ThemedText style={[
                styles.categoryText,
                { color: categoryColors.text }
              ]}>{link.category}</ThemedText>
            </View>
          </View>

          {link.notes && (
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
              <ThemedText style={styles.notes}>{link.notes}</ThemedText>
            </View>
          )}

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Added On</ThemedText>
            <ThemedText style={styles.date}>{formattedDate}</ThemedText>
          </View>
        </ScrollView>

        <ThemedView style={styles.footer}>
          <TouchableOpacity 
            style={[styles.button, styles.editButton]} 
            onPress={() => onEdit(link)}
          >
            <ThemedText style={styles.buttonText}>Edit Link</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.deleteButton]}
            onPress={() => onDelete(link)}
          >
            <ThemedText style={styles.buttonText}>Delete Link</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 17,
    color: '#666',
  },
  headerRight: {
    width: 30,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  url: {
    fontSize: 17,
    color: '#0A7EA4',
    textDecorationLine: 'underline',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
  },
  notes: {
    fontSize: 17,
    lineHeight: 24,
    color: '#333',
  },
  date: {
    fontSize: 17,
    color: '#666',
  },
  footer: {
    padding: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});