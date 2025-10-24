import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useAuth } from '../../contexts/AuthContext';
import { authStyles } from '../../styles/authStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        router.replace('/(tabs)');
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
      <ThemedText style={authStyles.subtitle}>Your personal digital brain 🧠</ThemedText>

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
        
        <Link href="/reset-password" style={styles.forgotPassword}>
          <ThemedText style={styles.forgotPasswordText}>Forgot password?</ThemedText>
        </Link>

        <TouchableOpacity
          style={[authStyles.button, loading && authStyles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <ThemedText style={authStyles.buttonText}>
            {loading ? 'Signing in...' : 'Log In'}
          </ThemedText>
        </TouchableOpacity>

        <Link href="/signup" style={styles.signupLink}>
          <ThemedText style={styles.signupText}>
            Don't have an account? <ThemedText style={styles.signupHighlight}>Sign Up</ThemedText>
          </ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4B7BEC',
    fontSize: 14,
  },
  signupLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  signupHighlight: {
    color: '#4B7BEC',
    fontWeight: '600',
  },
});