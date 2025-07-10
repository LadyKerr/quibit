import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface AudioPlayerProps {
  uri: string;
  onPlaybackStatusUpdate?: (status: any) => void;
}

export function AudioPlayer({ uri, onPlaybackStatusUpdate }: AudioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async () => {
    try {
      setIsLoading(true);
      
      if (sound) {
        // If sound is already loaded, just play/pause
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        // Load and play the sound
        console.log('Loading Sound');
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setIsPlaying(status.isPlaying || false);
              if (status.didJustFinish) {
                setIsPlaying(false);
              }
              onPlaybackStatusUpdate?.(status);
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.playButton} 
      onPress={playSound}
      disabled={isLoading}
    >
      <Ionicons 
        name={isLoading ? "hourglass" : isPlaying ? "pause" : "play"} 
        size={20} 
        color="#007AFF" 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});