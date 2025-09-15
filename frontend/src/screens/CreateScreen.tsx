import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Dimensions, SafeAreaView } from 'react-native';
import { Button, TextInput, Card, Chip } from 'react-native-paper';

const { width, height } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, TabParamList } from '../types/navigation';

type CreateScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Create'>,
  StackNavigationProp<RootStackParamList>
>;

interface Props {
  navigation: CreateScreenNavigationProp;
}

export default function CreateScreen({ navigation }: Props) {
  const { user, isAuthenticated, token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleCreateArtifact = () => {
    navigation.navigate('Camera');
  };

  const handleQuickCreate = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your artifact');
      return;
    }
    
    Alert.alert('Coming Soon!', 'Text-based artifacts and file uploads will be available in the next update!');
  };

  const handleUpgradeAccount = async () => {
    if (!token) {
      Alert.alert('Error', 'Please sign in to upgrade your account');
      return;
    }

    Alert.alert(
      'Upgrade to Creator',
      'To unlock full creation features:\n\n• Upload 3D models, images, and videos\n• Place AR experiences on the map\n• Manage your content library\n• Access analytics\n\nWould you like to upgrade to Creator now?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade Now', 
          onPress: async () => {
            setIsUpgrading(true);
            try {
              await authAPI.upgradeToCreator(token);
              Alert.alert('Success!', 'You are now a Creator! Restart the app to see your new features.');
            } catch (error) {
              Alert.alert('Error', 'Failed to upgrade account. Please try again.');
            } finally {
              setIsUpgrading(false);
            }
          }
        }
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Sign In Required</Text>
        <Text style={styles.subtitle}>Please sign in to create AR experiences</Text>
      </View>
    );
  }

  if (user?.role === 'explorer') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Text style={styles.text}>🎨 Become a Creator</Text>
            <Text style={styles.subtitle}>
              Unlock the power to create and share amazing AR experiences
            </Text>
            
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Creator Features:</Text>
                <View style={styles.featureList}>
                  <Text style={styles.feature}>📸 Upload photos & videos</Text>
                  <Text style={styles.feature}>📍 Place AR experiences anywhere</Text>
                  <Text style={styles.feature}>🍽️ Create interactive menus</Text>
                  <Text style={styles.feature}>🎨 Build digital art galleries</Text>
                  <Text style={styles.feature}>🧭 Design wayfinding experiences</Text>
                  <Text style={styles.feature}>📊 Access detailed analytics</Text>
                </View>
              </Card.Content>
            </Card>

            <Button 
              mode="contained" 
              style={styles.button}
              onPress={handleUpgradeAccount}
              loading={isUpgrading}
              disabled={isUpgrading}
              icon="account-arrow-up"
            >
              {isUpgrading ? 'Upgrading...' : 'Upgrade to Creator'}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.text}>🚀 Create AR Experience</Text>
          <Text style={styles.subtitle}>
            Design and place your AR content on the map
          </Text>

          {/* Quick Actions */}
          <Card style={styles.quickActionsCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Quick Actions</Text>
              <View style={styles.quickActions}>
                <Button 
                  mode="contained" 
                  style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleCreateArtifact}
                  icon="camera"
                  labelStyle={styles.quickActionLabel}
                >
                  📸 Capture & Create
                </Button>

                <Button 
                  mode="outlined" 
                  style={styles.quickActionButton}
                  onPress={handleQuickCreate}
                  icon="text"
                  labelStyle={styles.quickActionLabel}
                >
                  ✏️ Text-based (Soon)
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Form for planning */}
          <Card style={styles.formCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>Plan Your Creation</Text>
              
              <TextInput
                label="Artifact Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                mode="outlined"
                placeholder="My Amazing AR Experience"
              />

              <TextInput
                label="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.input}
                mode="outlined"
                multiline
                numberOfLines={3}
                placeholder="Describe what users will see and experience..."
              />

              <TextInput
                label="Category"
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                mode="outlined"
                placeholder="Art, Menu, Wayfinding, etc."
              />

              <View style={styles.chipContainer}>
                <Text style={styles.chipLabel}>Popular Categories:</Text>
                <View style={styles.chips}>
                  <Chip 
                    style={[styles.chip, category === 'Art' && styles.chipSelected]} 
                    onPress={() => setCategory('Art')}
                    selected={category === 'Art'}
                  >
                    🎨 Art
                  </Chip>
                  <Chip 
                    style={[styles.chip, category === 'Menu' && styles.chipSelected]} 
                    onPress={() => setCategory('Menu')}
                    selected={category === 'Menu'}
                  >
                    🍽️ Menu
                  </Chip>
                  <Chip 
                    style={[styles.chip, category === 'Wayfinding' && styles.chipSelected]} 
                    onPress={() => setCategory('Wayfinding')}
                    selected={category === 'Wayfinding'}
                  >
                    🧭 Wayfinding
                  </Chip>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Tips */}
          <Card style={styles.tipsCard}>
            <Card.Content>
              <Text style={styles.cardTitle}>💡 Creator Tips</Text>
              <Text style={styles.tip}>• Stand where you want users to discover your content</Text>
              <Text style={styles.tip}>• Use clear, descriptive titles for better discovery</Text>
              <Text style={styles.tip}>• High-quality images create better AR experiences</Text>
              <Text style={styles.tip}>• Consider lighting and background when capturing</Text>
            </Card.Content>
          </Card>
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
  content: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(20),
  },
  text: {
    fontSize: scale(24),
    fontWeight: 'bold',
    marginBottom: scale(8),
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: scale(16),
    textAlign: 'center',
    color: '#666',
    marginBottom: scale(24),
    lineHeight: scale(22),
    paddingHorizontal: scale(10),
  },
  card: {
    width: '100%',
    marginBottom: scale(16),
    elevation: 4,
  },
  quickActionsCard: {
    marginBottom: scale(20),
    elevation: 4,
  },
  quickActions: {
    gap: scale(12),
  },
  quickActionButton: {
    paddingVertical: scale(8),
  },
  quickActionLabel: {
    fontSize: scale(16),
  },
  cardTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    marginBottom: scale(12),
    color: '#333',
  },
  featureList: {
    gap: scale(4),
  },
  feature: {
    fontSize: scale(14),
    color: '#555',
    lineHeight: scale(20),
  },
  formCard: {
    width: '100%',
    marginBottom: scale(20),
    elevation: 4,
  },
  input: {
    marginBottom: scale(12),
  },
  chipContainer: {
    marginTop: scale(8),
  },
  chipLabel: {
    fontSize: scale(14),
    color: '#666',
    marginBottom: scale(8),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(8),
  },
  chip: {
    marginBottom: scale(8),
  },
  chipSelected: {
    backgroundColor: '#6366f1',
  },
  tipsCard: {
    marginBottom: scale(20),
    elevation: 2,
  },
  tip: {
    fontSize: scale(14),
    color: '#555',
    marginBottom: scale(6),
    lineHeight: scale(20),
  },
  button: {
    minWidth: scale(200),
    marginBottom: scale(12),
    paddingVertical: scale(4),
  },
  secondaryButton: {
    minWidth: scale(200),
    paddingVertical: scale(4),
  },
});
