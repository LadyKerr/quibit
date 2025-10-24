import { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { supabase } from '../../lib/supabase';
import { authStyles } from '../../styles/authStyles';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'quibit://reset-confirm',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Check your email for password reset instructions',
          [{ text: 'OK', onPress: () => router.back() }]
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
      
      <ThemedText style={authStyles.title}>Reset Password</ThemedText>
      <ThemedText style={[authStyles.subtitle, styles.subtitleAdjusted]}>
        Enter your email address and we'll send you instructions to reset your password.
      </ThemedText>

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

        <TouchableOpacity
          style={[authStyles.button, loading && authStyles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          <ThemedText style={authStyles.buttonText}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </ThemedText>
        </TouchableOpacity>

        <Link href="/login" style={styles.backLink}>
          <ThemedText style={styles.backText}>
            Back to Login
          </ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  subtitleAdjusted: {
    fontSize: 16,
    marginBottom: 32,
  },
  backLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: '#4B7BEC',
    textAlign: 'center',
  },
});