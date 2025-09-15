import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  SafeAreaView,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Button, IconButton, Card, TextInput, Chip, ActivityIndicator } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { artifactsAPI } from '../services/api';

const { width, height } = Dimensions.get('window');
const scale = (size: number) => (width / 375) * size;

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Camera'>;
type CameraScreenRouteProp = RouteProp<RootStackParamList, 'Camera'>;

interface Props {
  navigation: CameraScreenNavigationProp;
  route: CameraScreenRouteProp;
}

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const { user, token } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      setLocationLoading(true);
      const locationPermission = await Location.requestForegroundPermissionsAsync();
      if (locationPermission.status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(currentLocation);
      } else {
        Alert.alert('Permission needed', 'Location permission is required to anchor AR content');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setLocationLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to create AR content');
      return false;
    }
    return true;
  };

  const takePicture = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedMedia(result.assets[0].uri);
        setShowForm(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickFromLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedMedia(result.assets[0].uri);
        setShowForm(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const createArtifact = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!location) {
      Alert.alert('Error', 'Location is required to anchor your AR content');
      return;
    }

    if (!capturedMedia) {
      Alert.alert('Error', 'Please select an image');
      return;
    }

    setIsUploading(true);

    try {
      if (!token) {
        throw new Error('Authentication required');
      }

      // Upload to backend
      const artifact = await artifactsAPI.createArtifact(
        title,
        description,
        category,
        location.coords.latitude,
        location.coords.longitude,
        capturedMedia,
        token
      );

      Alert.alert(
        'Success! 🎉',
        `AR artifact "${title}" created!\n\n📍 Location: ${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}\n\n🎨 Category: ${category || 'General'}\n\nYour AR content is now anchored to this location and will be visible to other users when they visit this spot!\n\nArtifact ID: ${artifact.id}`,
        [
          {
            text: 'Create Another',
            onPress: () => {
              setCapturedMedia(null);
              setShowForm(false);
              setTitle('');
              setDescription('');
              setCategory('');
            }
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error creating artifact:', error);
      
      let errorMessage = 'Failed to create artifact. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = `Server Error: ${error.response.status}\n${error.response.data?.detail || error.response.data?.message || 'Unknown server error'}`;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.request) {
        errorMessage = 'Network error: Unable to connect to server. Please check if the backend is running.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (showForm && capturedMedia) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={scale(24)}
            onPress={() => {
              setCapturedMedia(null);
              setShowForm(false);
            }}
          />
          <Text style={styles.headerTitle}>Create AR Artifact</Text>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Preview Image */}
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: capturedMedia }} style={styles.imagePreview} />
          </View>

          {/* Location Info */}
          {location && (
            <Card style={styles.locationCard}>
              <Card.Content>
                <Text style={styles.locationTitle}>📍 Anchor Location</Text>
                <Text style={styles.locationText}>
                  Lat: {location.coords.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  Lng: {location.coords.longitude.toFixed(6)}
                </Text>
                <Text style={styles.locationAccuracy}>
                  Accuracy: ±{location.coords.accuracy?.toFixed(0)}m
                </Text>
                <Text style={styles.locationNote}>
                  Your AR content will be visible at this exact location
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Form */}
          <Card style={styles.formCard}>
            <Card.Content>
              <TextInput
                label="Title *"
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
                placeholder="Describe what people will see and experience..."
              />

              <TextInput
                label="Category"
                value={category}
                onChangeText={setCategory}
                style={styles.input}
                mode="outlined"
                placeholder="Art, Menu, Info, etc."
              />

              <View style={styles.chipContainer}>
                <Text style={styles.chipLabel}>Quick Categories:</Text>
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
                    style={[styles.chip, category === 'Info' && styles.chipSelected]} 
                    onPress={() => setCategory('Info')}
                    selected={category === 'Info'}
                  >
                    ℹ️ Info
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

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => {
                setCapturedMedia(null);
                setShowForm(false);
              }}
              style={styles.button}
              disabled={isUploading}
            >
              Choose Different Image
            </Button>
            <Button
              mode="contained"
              onPress={createArtifact}
              style={styles.button}
              loading={isUploading}
              disabled={isUploading}
              icon="plus"
            >
              {isUploading ? 'Creating...' : 'Create AR Artifact'}
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor="white"
          size={scale(24)}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Create AR Content</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionTitle}>📸 Create AR Experience</Text>
        <Text style={styles.instructionText}>
          Capture or select an image to create an amazing AR experience anchored to your current location
        </Text>

        {/* Location Status */}
        <Card style={styles.locationPreview}>
          <Card.Content>
            <View style={styles.locationHeader}>
              <Text style={styles.locationPreviewTitle}>📍 Current Location</Text>
              {locationLoading && <ActivityIndicator size="small" />}
            </View>
            {location ? (
              <>
                <Text style={styles.locationPreviewText}>
                  {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
                </Text>
                <Text style={styles.locationAccuracy}>
                  Accuracy: ±{location.coords.accuracy?.toFixed(0)}m
                </Text>
              </>
            ) : (
              <Text style={styles.locationError}>
                {locationLoading ? 'Getting location...' : 'Location not available'}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Capture Options */}
        <View style={styles.captureButtons}>
          <Button
            mode="contained"
            icon="camera"
            onPress={takePicture}
            style={[styles.captureButton, { backgroundColor: '#4CAF50' }]}
            disabled={!location}
          >
            Take Photo
          </Button>

          <Button
            mode="contained"
            icon="image"
            onPress={pickFromLibrary}
            style={[styles.captureButton, { backgroundColor: '#2196F3' }]}
            disabled={!location}
          >
            Choose from Library
          </Button>
        </View>

        <Text style={styles.tipText}>
          💡 Tip: Stand where you want others to discover your AR content
        </Text>

        {!location && !locationLoading && (
          <Button
            mode="outlined"
            icon="refresh"
            onPress={initializeLocation}
            style={styles.retryButton}
          >
            Retry Location
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    backgroundColor: '#333',
  },
  headerTitle: {
    color: 'white',
    fontSize: scale(18),
    fontWeight: 'bold',
    marginLeft: scale(8),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingVertical: scale(20),
    justifyContent: 'center',
  },
  instructionTitle: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: scale(16),
  },
  instructionText: {
    fontSize: scale(16),
    color: '#ccc',
    textAlign: 'center',
    marginBottom: scale(32),
    lineHeight: scale(24),
  },
  locationPreview: {
    marginBottom: scale(32),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationPreviewTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: scale(8),
  },
  locationPreviewText: {
    fontSize: scale(14),
    color: '#ccc',
  },
  locationAccuracy: {
    fontSize: scale(12),
    color: '#888',
    marginTop: scale(4),
  },
  locationError: {
    fontSize: scale(14),
    color: '#ff6b6b',
  },
  captureButtons: {
    gap: scale(16),
    marginBottom: scale(32),
  },
  captureButton: {
    paddingVertical: scale(8),
  },
  retryButton: {
    marginTop: scale(16),
  },
  tipText: {
    fontSize: scale(14),
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  imagePreviewContainer: {
    margin: scale(16),
    borderRadius: scale(12),
    overflow: 'hidden',
    elevation: 4,
  },
  imagePreview: {
    width: '100%',
    height: scale(250),
    backgroundColor: '#333',
  },
  locationCard: {
    marginHorizontal: scale(16),
    marginBottom: scale(16),
    elevation: 4,
  },
  locationTitle: {
    fontSize: scale(16),
    fontWeight: 'bold',
    marginBottom: scale(8),
    color: '#4CAF50',
  },
  locationText: {
    fontSize: scale(14),
    color: '#333',
    marginBottom: scale(2),
  },
  locationNote: {
    fontSize: scale(12),
    color: '#666',
    marginTop: scale(8),
    fontStyle: 'italic',
  },
  formCard: {
    marginHorizontal: scale(16),
    marginBottom: scale(16),
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
  buttonContainer: {
    flexDirection: 'row',
    gap: scale(12),
    paddingHorizontal: scale(16),
    paddingBottom: scale(20),
  },
  button: {
    flex: 1,
    paddingVertical: scale(4),
  },
});

export default CameraScreen;