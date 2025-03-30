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
      Capture what matters — ideas, links, voice notes—all in one place. ✨
      </ThemedText>
      
      <ThemedView style={styles.features}>
        <ThemedText style={styles.featureText}>📎 Save links & thoughts you love </ThemedText>
        <ThemedText style={styles.featureText}>🎤 Add notes or record voice memos </ThemedText>
        <ThemedText style={styles.featureText}>🧠 Search your transcripts instantly</ThemedText>
        <ThemedText style={styles.featureText}>📶 Access everything offline</ThemedText>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 10,
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