import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, SafeAreaView } from 'react-native';
import { Card, Button, Avatar, Divider, IconButton } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const scale = (size: number) => (width / 375) * size;

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    await logout();
    navigation.navigate('Login');
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Welcome to AR Explorer</Text>
          <Text style={styles.subtitle}>
            Sign in to save favorites, create artifacts, and personalize your experience
          </Text>
          
          <View style={styles.authButtons}>
            <Button mode="contained" onPress={handleLogin} style={styles.authButton}>
              Sign In
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => navigation.navigate('Register')}
              style={styles.authButton}
            >
              Create Account
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const getUserInitials = (fullName?: string, email?: string) => {
    if (fullName) {
      return fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email ? email[0].toUpperCase() : 'U';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Avatar.Text
            size={scale(80)}
            label={getUserInitials(user.full_name, user.email)}
            style={styles.avatar}
          />
          <Text style={styles.userName}>
            {user.full_name || 'AR Explorer'}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>
              {user.role === 'creator' ? '🎨' : '🗺️'} {user.role?.toUpperCase() || 'EXPLORER'}
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.content}>
          <Card style={styles.statsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Your Activity</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Artifacts Viewed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Favorites</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>0</Text>
                  <Text style={styles.statLabel}>Created</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Settings Section */}
          <Card style={styles.settingsCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Settings</Text>
              
              <Button
                mode="text"
                icon="account-edit"
                onPress={() => {}}
                style={styles.settingButton}
                contentStyle={styles.settingButtonContent}
              >
                Edit Profile
              </Button>
              
              <Divider style={styles.divider} />
              
              <Button
                mode="text"
                icon="cog"
                onPress={() => {}}
                style={styles.settingButton}
                contentStyle={styles.settingButtonContent}
              >
                Preferences
              </Button>
              
              <Divider style={styles.divider} />
              
              <Button
                mode="text"
                icon="help-circle"
                onPress={() => {}}
                style={styles.settingButton}
                contentStyle={styles.settingButtonContent}
              >
                Help & Support
              </Button>
            </Card.Content>
          </Card>

          {/* Logout */}
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#EF4444"
            icon="logout"
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(40),
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingTop: scale(20),
    paddingBottom: scale(30),
    paddingHorizontal: scale(20),
  },
  avatar: {
    marginBottom: scale(16),
    backgroundColor: '#4f46e5',
  },
  userName: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: scale(8),
    textAlign: 'center',
  },
  userEmail: {
    fontSize: scale(16),
    color: 'white',
    opacity: 0.9,
    marginBottom: scale(8),
    textAlign: 'center',
  },
  roleContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(16),
  },
  roleLabel: {
    fontSize: scale(12),
    color: 'white',
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(20),
  },
  statsCard: {
    marginBottom: scale(16),
    elevation: 2,
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    marginBottom: scale(16),
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: scale(12),
    color: '#666',
    marginTop: scale(4),
    textAlign: 'center',
  },
  settingsCard: {
    marginBottom: scale(24),
    elevation: 2,
  },
  settingButton: {
    justifyContent: 'flex-start',
    paddingVertical: scale(4),
  },
  settingButtonContent: {
    justifyContent: 'flex-start',
    paddingLeft: 0,
  },
  divider: {
    marginVertical: scale(8),
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: scale(16),
    color: '#333',
  },
  subtitle: {
    fontSize: scale(16),
    textAlign: 'center',
    color: '#666',
    marginBottom: scale(32),
    lineHeight: scale(24),
    paddingHorizontal: scale(20),
  },
  authButtons: {
    width: '100%',
    maxWidth: scale(300),
    gap: scale(12),
  },
  authButton: {
    paddingVertical: scale(4),
  },
  logoutButton: {
    paddingVertical: scale(8),
    marginBottom: scale(20),
  },
});