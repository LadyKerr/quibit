import { StyleSheet, TouchableOpacity, View, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsScreen() {
  const { session, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      Alert.alert('Success', 'You have been logged out successfully.');
      console.log('Logout successful');
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Error',
        'Failed to log out. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/images/quibit-logo-transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>Settings</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Customization</ThemedText>
        <TouchableOpacity
          style={styles.settingButton}
          onPress={() => router.push('/manage-categories')}
        >
          <ThemedText style={styles.settingButtonText}>Manage Categories</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutButtonText}>Log Out</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  header: {
    paddingTop: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingTop: 12,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  settingButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});