import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Registration successful! Please log in to continue.',
          [{ 
            text: 'OK', 
            onPress: () => router.replace('/login') // Changed from /(tabs)
          }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Image 
        source={require('../../assets/images/quibit-logo-transparent.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <ThemedText style={styles.title}>Create Account</ThemedText>
      <ThemedText style={styles.subtitle}>Join Quibit and start organizing your digital life ✨</ThemedText>

      <ThemedView style={styles.formContainer}>
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
        
        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <ThemedText style={styles.buttonText}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </ThemedText>
        </TouchableOpacity>

        <Link href="/login" style={styles.loginLink}>
          <ThemedText style={styles.loginText}>
            Already have an account? <ThemedText style={styles.loginHighlight}>Log In</ThemedText>
          </ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,  // Increased from 80
    height: 120, // Increased from 80
    marginBottom: 16, // Increased from 16
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 10,
    marginBottom: 8,
    textAlign: 'center', // Added for consistency
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 48,
    textAlign: 'center', // Added to center the subtitle
    paddingHorizontal: 20, // Added to control line length
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
    width: '100%',
  },
  button: {
    backgroundColor: '#4B7BEC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A5B1C2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  loginHighlight: {
    color: '#4B7BEC',
    fontWeight: '600',
  },
});