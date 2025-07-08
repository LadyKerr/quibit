import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { useSupabaseTest } from '../hooks/useSupabaseTest';
import { useRouter } from 'expo-router';

interface AppHeaderProps {
  onAddPress?: () => void;
  showAddButton?: boolean;
  showBackButton?: boolean;
  title?: string;
  style?: ViewStyle;
}

export function AppHeader({
  onAddPress,
  showAddButton = true,
  showBackButton = false,
  title,
  style
}: AppHeaderProps) {
  const { isConnected } = useSupabaseTest();
  const router = useRouter();

  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerLeft}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backButtonText}>←</ThemedText>
          </TouchableOpacity>
        ) : (
          <Image 
            source={require('../assets/images/icon.png')}
            style={styles.headerIcon}
          />
        )}
        <View>
          <ThemedText style={styles.headerTitle}>
            {title || 'Quibit'}
          </ThemedText>
          {!showBackButton && (
            <ThemedText style={[
              styles.connectionStatus,
              { color: isConnected ? '#4CAF50' : '#f44336' }
            ]}>
              {isConnected ? '● Connected' : '● Offline'}
            </ThemedText>
          )}
        </View>
      </View>
      
      {showAddButton && onAddPress && (
        <TouchableOpacity
          style={styles.headerFab}
          onPress={onAddPress}
        >
          <ThemedText style={styles.fabText}>+</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    marginRight: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  connectionStatus: {
    fontSize: 12,
    marginTop: -4,
    marginLeft: 2,
  },
  headerFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4B7BEC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
