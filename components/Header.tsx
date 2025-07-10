import React from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
  rightElement?: React.ReactNode;
  style?: ViewStyle;
  onRightPress?: () => void;
}

export function Header({
  title,
  showLogo = true,
  rightElement,
  style,
  onRightPress
}: HeaderProps) {
  return (
    <ThemedView style={[styles.header, style]}>
      <View style={styles.headerLeft}>
        {showLogo && (
          <Image 
            source={require('../assets/images/quibit-logo.png')}
            style={styles.headerIcon}
            resizeMode="contain"
          />
        )}
        {title && <ThemedText style={styles.headerTitle}>{title}</ThemedText>}
      </View>
      
      {rightElement && (
        <TouchableOpacity 
          style={styles.headerRight}
          onPress={onRightPress}
        >
          {rightElement}
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    height: 30,
    width: 100,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    marginLeft: 'auto',
  }
});