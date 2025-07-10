import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { AppHeader } from '../../components/AppHeader';
import { AudioPlayer } from '../../components/AudioPlayer';
import { useVoiceNotes } from '../../hooks/useVoiceNotes';
import { Ionicons } from '@expo/vector-icons';

export default function RecordScreen() {
  const {
    voiceNotes,
    isRecording,
    recordingDuration,
    permissionResponse,
    startRecording,
    stopRecording,
    saveRecording,
    deleteVoiceNote,
    addTranscript,
    discardRecording,
    formatDuration,
  } = useVoiceNotes();

  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>(Array.from({ length: 20 }, () => Math.random() * 40 + 10));

  // Update waveform animation during recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setWaveformData(Array.from({ length: 20 }, () => Math.random() * 40 + 10));
      }, 200);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      await startRecording();
    } catch (error) {
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
      console.error('Recording error:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const uri = await stopRecording();
      setRecordingUri(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to stop recording');
      console.error('Stop recording error:', error);
    }
  };

  const handleSaveRecording = async () => {
    if (!recordingUri) return;
    
    try {
      const voiceNote = await saveRecording(recordingUri);
      setRecordingUri(null);
      
      // Add a mock transcription after a short delay to simulate AI processing
      if (voiceNote) {
        setTimeout(async () => {
          const mockTranscript = generateMockTranscript();
          await addTranscript(voiceNote.id, mockTranscript);
        }, 1000);
      }
      
      Alert.alert('Success', 'Voice note saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save recording');
      console.error('Save recording error:', error);
    }
  };

  const generateMockTranscript = () => {
    const transcripts = [
      "This is a sample transcription of your voice note. In a real implementation, this would be generated using AI transcription services.",
      "Meeting notes from today's discussion about project timeline and deliverables.",
      "Reminder to follow up on the quarterly budget planning and resource allocation.",
      "Ideas for the new feature implementation and user experience improvements.",
      "Quick thoughts about the book I'm reading and key takeaways from the chapter."
    ];
    return transcripts[Math.floor(Math.random() * transcripts.length)];
  };

  const handleDiscardRecording = () => {
    setRecordingUri(null);
    discardRecording();
  };

  const handleDeleteNote = async (id: string) => {
    Alert.alert(
      'Delete Voice Note',
      'Are you sure you want to delete this voice note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteVoiceNote(id) }
      ]
    );
  };

  const renderVoiceNote = ({ item }: { item: any }) => (
    <View style={styles.voiceNoteItem}>
      <View style={styles.voiceNoteContent}>
        <View style={styles.voiceNoteHeader}>
          <ThemedText style={styles.voiceNoteTitle}>{item.title}</ThemedText>
          <TouchableOpacity onPress={() => handleDeleteNote(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        <ThemedText style={styles.voiceNoteDuration}>
          {formatDuration(item.duration)} • {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
        {item.transcript && (
          <ThemedText style={styles.transcript} numberOfLines={2}>
            {item.transcript}
          </ThemedText>
        )}
      </View>
      <AudioPlayer uri={item.uri} />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.microphoneIcon}>
        <Ionicons name="mic" size={60} color="#ccc" />
      </View>
      <ThemedText style={styles.emptyTitle}>Start Recording</ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Capture your thoughts with voice notes. They&apos;ll be transcribed automatically for easy searching.
      </ThemedText>
      <TouchableOpacity 
        style={styles.recordButton}
        onPress={handleStartRecording}
        disabled={permissionResponse?.status === 'denied'}
      >
        <Ionicons name="mic" size={24} color="#fff" />
        <ThemedText style={styles.recordButtonText}>Record First Note</ThemedText>
      </TouchableOpacity>
    </View>
  );

  const renderRecordingState = () => (
    <View style={styles.recordingContainer}>
      <ThemedText style={styles.recordingTimer}>
        {formatDuration(recordingDuration)}
      </ThemedText>
      <View style={styles.recordingIndicator}>
        <View style={styles.recordingDot} />
        <ThemedText style={styles.recordingText}>Recording</ThemedText>
      </View>
      
      {/* Dynamic waveform visualization */}
      <View style={styles.waveformContainer}>
        {waveformData.map((height, index) => (
          <View 
            key={index} 
            style={[
              styles.waveformBar,
              { height }
            ]} 
          />
        ))}
      </View>

      <View style={styles.recordingControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleDiscardRecording}
        >
          <Ionicons name="trash" size={24} color="#FF3B30" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.stopButton]}
          onPress={handleStopRecording}
        >
          <Ionicons name="pause" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleStopRecording}
        >
          <Ionicons name="checkmark" size={24} color="#34C759" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecordingPreview = () => (
    <View style={styles.recordingContainer}>
      <ThemedText style={styles.emptyTitle}>Recording Complete</ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Save this recording as a voice note?
      </ThemedText>
      
      <View style={styles.recordingControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleDiscardRecording}
        >
          <Ionicons name="trash" size={24} color="#FF3B30" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.saveButton]}
          onPress={handleSaveRecording}
        >
          <Ionicons name="checkmark" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (recordingUri) {
      return renderRecordingPreview();
    }
    
    if (isRecording) {
      return renderRecordingState();
    }

    if (voiceNotes.length === 0) {
      return renderEmptyState();
    }

    return (
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <ThemedText style={styles.listTitle}>Voice Notes</ThemedText>
          <ThemedText style={styles.noteCount}>{voiceNotes.length} notes</ThemedText>
        </View>
        
        <FlatList
          data={voiceNotes}
          renderItem={renderVoiceNote}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity 
          style={styles.floatingRecordButton}
          onPress={handleStartRecording}
        >
          <Ionicons name="mic" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <AppHeader showAddButton={false} />
        {renderContent()}
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
  emptyStateContainer: {
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
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyDescription: {
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
  recordingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  recordingTimer: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 60,
    marginBottom: 40,
  },
  waveformBar: {
    width: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  recordingControls: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'center',
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  saveButton: {
    backgroundColor: '#34C759',
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  noteCount: {
    fontSize: 14,
    color: '#666',
  },
  list: {
    flex: 1,
  },
  voiceNoteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  voiceNoteContent: {
    flex: 1,
  },
  voiceNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  voiceNoteTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  voiceNoteDuration: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  transcript: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  floatingRecordButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});