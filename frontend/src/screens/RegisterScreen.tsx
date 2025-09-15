import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { TextInput, Button, Card, HelperText, RadioButton, Chip } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'explorer' | 'creator'>('explorer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim() || undefined, role);
      // Navigation will happen automatically via AppNavigator
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the AR exploration community</Text>

          <Card style={styles.card}>
            <Card.Content>
              <TextInput
                label="Full Name (Optional)"
                value={fullName}
                onChangeText={setFullName}
                mode="outlined"
                autoCapitalize="words"
                style={styles.input}
              />

              <TextInput
                label="Email *"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                style={styles.input}
                error={email.length > 0 && !validateEmail(email)}
              />
              {email.length > 0 && !validateEmail(email) && (
                <HelperText type="error">
                  Please enter a valid email address
                </HelperText>
              )}

              <TextInput
                label="Password *"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                right={
                  <TextInput.Icon
                    icon={showPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                style={styles.input}
                error={password.length > 0 && !validatePassword(password)}
              />
              {password.length > 0 && !validatePassword(password) && (
                <HelperText type="error">
                  Password must be at least 8 characters long
                </HelperText>
              )}

              <TextInput
                label="Confirm Password *"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                right={
                  <TextInput.Icon
                    icon={showConfirmPassword ? 'eye-off' : 'eye'}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                style={styles.input}
                error={confirmPassword.length > 0 && password !== confirmPassword}
              />
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <HelperText type="error">
                  Passwords do not match
                </HelperText>
              )}

              <View style={styles.roleSection}>
                <Text style={styles.roleSectionTitle}>Choose Your Role</Text>
                <Text style={styles.roleSectionSubtitle}>
                  You can change this later in your profile
                </Text>
                
                <View style={styles.roleOptions}>
                  <Card 
                    style={[
                      styles.roleCard, 
                      role === 'explorer' && styles.roleCardSelected
                    ]}
                    onPress={() => setRole('explorer')}
                  >
                    <Card.Content style={styles.roleCardContent}>
                      <View style={styles.roleHeader}>
                        <RadioButton
                          value="explorer"
                          status={role === 'explorer' ? 'checked' : 'unchecked'}
                          onPress={() => setRole('explorer')}
                        />
                        <Text style={styles.roleTitle}>🗺️ Explorer</Text>
                      </View>
                      <Text style={styles.roleDescription}>
                        Discover and interact with AR experiences around you
                      </Text>
                      <View style={styles.roleFeatures}>
                        <Text style={styles.roleFeature}>• View AR artifacts</Text>
                        <Text style={styles.roleFeature}>• Save favorites</Text>
                        <Text style={styles.roleFeature}>• Leave reviews</Text>
                      </View>
                    </Card.Content>
                  </Card>

                  <Card 
                    style={[
                      styles.roleCard, 
                      role === 'creator' && styles.roleCardSelected
                    ]}
                    onPress={() => setRole('creator')}
                  >
                    <Card.Content style={styles.roleCardContent}>
                      <View style={styles.roleHeader}>
                        <RadioButton
                          value="creator"
                          status={role === 'creator' ? 'checked' : 'unchecked'}
                          onPress={() => setRole('creator')}
                        />
                        <Text style={styles.roleTitle}>🎨 Creator</Text>
                      </View>
                      <Text style={styles.roleDescription}>
                        Create and share amazing AR experiences
                      </Text>
                      <View style={styles.roleFeatures}>
                        <Text style={styles.roleFeature}>• Upload 3D models & media</Text>
                        <Text style={styles.roleFeature}>• Place AR experiences</Text>
                        <Text style={styles.roleFeature}>• Manage content library</Text>
                        <Text style={styles.roleFeature}>• Access analytics</Text>
                      </View>
                    </Card.Content>
                  </Card>
                </View>
              </View>

              <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                style={styles.registerButton}
              >
                Create Account
              </Button>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <Button
                  mode="text"
                  onPress={navigateToLogin}
                  disabled={loading}
                >
                  Sign In
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  card: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    marginBottom: 8,
  },
  registerButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
  },
  roleSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  roleSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  roleSectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  roleOptions: {
    gap: 12,
  },
  roleCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleCardSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  roleCardContent: {
    paddingBottom: 12,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  roleDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 40,
  },
  roleFeatures: {
    marginLeft: 40,
  },
  roleFeature: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
});
