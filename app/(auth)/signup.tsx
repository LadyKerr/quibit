import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useAuth } from '../../contexts/AuthContext';
import { authStyles } from '../../styles/authStyles';

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
    <ThemedView style={authStyles.container}>
      <Image 
        source={require('../../assets/images/quibit-logo-transparent.png')}
        style={authStyles.logo}
        resizeMode="contain"
      />
      
      <ThemedText style={authStyles.title}>Create Account</ThemedText>
      <ThemedText style={authStyles.subtitle}>Join Quibit and start organizing your digital life ✨</ThemedText>

      <ThemedView style={authStyles.formContainer}>
        <ThemedText style={authStyles.label}>Email</ThemedText>
        <TextInput
          style={authStyles.input}
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#999"
        />
        
        <ThemedText style={authStyles.label}>Password</ThemedText>
        <TextInput
          style={authStyles.input}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={[authStyles.button, loading && authStyles.buttonDisabled]}
          onPress={handleSignup}
          disabled={loading}
        >
          <ThemedText style={authStyles.buttonText}>
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