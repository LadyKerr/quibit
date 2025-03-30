import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

export default function WelcomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <Image 
        source={require('../../assets/images/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <ThemedText style={styles.title}>Welcome to Quibit</ThemedText>
      
      <ThemedText style={styles.description}>
        Your personal space for saving and organizing content from around the web.
      </ThemedText>
      
      <ThemedView style={styles.features}>
        <ThemedText style={styles.featureText}>• Save and categorize links</ThemedText>
        <ThemedText style={styles.featureText}>• Record voice notes</ThemedText>
        <ThemedText style={styles.featureText}>• Get searchable transcripts</ThemedText>
        <ThemedText style={styles.featureText}>• Access everything offline</ThemedText>
      </ThemedView>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/(onboarding)/categories')}
      >
        <ThemedText style={styles.buttonText}>Get Started</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 48,
  },
  featureText: {
    fontSize: 18,
    marginBottom: 12,
    color: '#444',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});