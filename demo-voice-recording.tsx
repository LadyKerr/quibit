import React from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

export default function VoiceRecordingDemo() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText style={styles.headerTitle}>Quibit</ThemedText>
            <View style={styles.connectionStatus}>
              <View style={styles.statusDot} />
              <ThemedText style={styles.statusText}>Connected</ThemedText>
            </View>
          </View>
        </View>

        {/* Empty State */}
        <View style={styles.content}>
          <View style={styles.microphoneIcon}>
            <Ionicons name="mic" size={60} color="#ccc" />
          </View>
          <ThemedText style={styles.title}>Start Recording</ThemedText>
          <ThemedText style={styles.description}>
            Capture your thoughts with voice notes. They'll be transcribed automatically for easy searching.
          </ThemedText>
          <TouchableOpacity style={styles.recordButton}>
            <Ionicons name="mic" size={24} color="#fff" />
            <ThemedText style={styles.recordButtonText}>Record First Note</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.tabBar}>
          <View style={styles.tab}>
            <Ionicons name="home-outline" size={24} color="#999" />
            <ThemedText style={styles.tabText}>Home</ThemedText>
          </View>
          <View style={[styles.tab, styles.activeTab]}>
            <Ionicons name="mic" size={24} color="#007AFF" />
            <ThemedText style={[styles.tabText, styles.activeTabText]}>Record</ThemedText>
          </View>
          <View style={styles.tab}>
            <Ionicons name="document-text-outline" size={24} color="#999" />
            <ThemedText style={styles.tabText}>Notes</ThemedText>
          </View>
          <View style={styles.tab}>
            <Ionicons name="settings-outline" size={24} color="#999" />
            <ThemedText style={styles.tabText}>Settings</ThemedText>
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 14,
    color: '#34C759',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  microphoneIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  recordButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active tab styling
  },
  tabText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  activeTabText: {
    color: '#007AFF',
  },
});