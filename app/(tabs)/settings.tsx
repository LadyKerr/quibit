import { StyleSheet, TouchableOpacity, View, Alert, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';
import { AppHeader } from '../../components/AppHeader';
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
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <AppHeader showAddButton={false} />

        <View style={styles.content}>
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
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
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