import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

export interface VoiceNote {
  id: string;
  title: string;
  uri: string; // Local file path to the audio recording
  duration: number; // Duration in seconds
  transcript?: string; // AI-generated transcript
  createdAt: string;
}

export function useVoiceNotes() {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  useEffect(() => {
    loadVoiceNotes();
  }, []);

  const loadVoiceNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem('voiceNotes');
      setVoiceNotes(storedNotes ? JSON.parse(storedNotes) : []);
    } catch (error) {
      console.error('Error loading voice notes:', error);
    }
  };

  const saveVoiceNotes = async (updatedNotes: VoiceNote[]) => {
    try {
      await AsyncStorage.setItem('voiceNotes', JSON.stringify(updatedNotes));
      setVoiceNotes(updatedNotes);
    } catch (error) {
      console.error('Error saving voice notes:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        const permission = await requestPermission();
        if (!permission.granted) {
          throw new Error('Permission to access microphone denied');
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Update duration every second
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Store interval ID to clear it later
      (recording as any).intervalId = interval;

      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      throw err;
    }
  };

  const stopRecording = async () => {
    console.log('Stopping recording..');
    if (!recording) return null;

    try {
      setIsRecording(false);
      
      // Clear the interval
      if ((recording as any).intervalId) {
        clearInterval((recording as any).intervalId);
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      setRecording(null);
      // Don't reset recordingDuration here - preserve it for saveRecording

      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecording(null);
      setIsRecording(false);
      setRecordingDuration(0);
      return null;
    }
  };

  const saveRecording = async (uri: string, title?: string) => {
    if (!uri) return;

    try {
      // Generate a default title if not provided
      const defaultTitle = title || `Voice Note ${new Date().toLocaleDateString()}`;
      
      const newVoiceNote: VoiceNote = {
        id: Date.now().toString(),
        title: defaultTitle,
        uri,
        duration: recordingDuration,
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [newVoiceNote, ...voiceNotes];
      await saveVoiceNotes(updatedNotes);
      
      // Reset recording duration after successful save
      setRecordingDuration(0);
      
      return newVoiceNote;
    } catch (error) {
      console.error('Error saving voice note:', error);
      throw error;
    }
  };

  const deleteVoiceNote = async (id: string) => {
    const updatedNotes = voiceNotes.filter(note => note.id !== id);
    await saveVoiceNotes(updatedNotes);
  };

  const addTranscript = async (id: string, transcript: string) => {
    const updatedNotes = voiceNotes.map(note =>
      note.id === id ? { ...note, transcript } : note
    );
    await saveVoiceNotes(updatedNotes);
  };

  const discardRecording = () => {
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    voiceNotes,
    recording,
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
  };
}