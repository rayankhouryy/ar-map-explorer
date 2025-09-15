import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { IconButton, Button, Portal, Modal } from 'react-native-paper';
import { Camera } from 'expo-camera';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useLocation } from '../contexts/LocationContext';
import { geopy } from 'geopy'; // You'll need to implement distance calculation

type ARViewerRouteProp = RouteProp<RootStackParamList, 'ARViewer'>;
type NavigationProp = StackNavigationProp<RootStackParamList, 'ARViewer'>;

export default function ARViewerScreen() {
  const route = useRoute<ARViewerRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { artifact, userLocation } = route.params;
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlaced, setIsPlaced] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  const { location } = useLocation();

  useEffect(() => {
    getCameraPermissions();
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Haversine formula for distance calculation
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const checkDistance = () => {
    if (!location) return { withinRange: false, distance: 0 };

    const distance = calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      artifact.latitude,
      artifact.longitude
    );

    const withinRange = distance >= artifact.min_view_distance && 
                       distance <= artifact.max_view_distance;

    return { withinRange, distance };
  };

  const { withinRange, distance } = checkDistance();

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePlaceArtifact = () => {
    if (!withinRange) {
      Alert.alert(
        'Out of Range',
        `Move to within ${artifact.min_view_distance}-${artifact.max_view_distance}m of the artifact location.`
      );
      return;
    }
    
    setIsPlaced(true);
    // Here you would actually place the 3D model in AR space
    Alert.alert('Success', 'Artifact placed in AR!');
  };

  const handleScreenshot = () => {
    // Implement screenshot functionality
    Alert.alert('Screenshot', 'Screenshot saved to gallery');
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera access is required for AR</Text>
        <Button mode="contained" onPress={getCameraPermissions}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Camera View */}
      <Camera style={styles.camera} facing="back">
        {/* Top Bar */}
        <View style={styles.topBar}>
          <IconButton
            icon="arrow-left"
            iconColor="white"
            size={24}
            onPress={handleBack}
            style={styles.backButton}
          />
          <Text style={styles.artifactTitle} numberOfLines={1}>
            {artifact.title}
          </Text>
          <IconButton
            icon="information"
            iconColor="white"
            size={24}
            onPress={() => setShowInfo(true)}
            style={styles.infoButton}
          />
        </View>

        {/* Distance Indicator */}
        {!withinRange && (
          <View style={styles.distanceIndicator}>
            <Text style={styles.distanceText}>
              Move {distance < artifact.min_view_distance ? 'away' : 'closer'} to place artifact
            </Text>
            <Text style={styles.distanceValue}>
              {Math.round(distance)}m away
            </Text>
          </View>
        )}

        {/* Placement Instructions */}
        {withinRange && !isPlaced && (
          <View style={styles.placementContainer}>
            <View style={styles.crosshair} />
            <Text style={styles.placementText}>
              Point camera at the ground and tap to place
            </Text>
          </View>
        )}

        {/* AR Content Area */}
        {isPlaced && (
          <View style={styles.arContent}>
            {/* Enhanced 3D model display for Space Needle */}
            {artifact.asset_type === 'model_3d' ? (
              <View style={styles.modelContainer}>
                <View style={styles.spaceNeedleModel}>
                  <Text style={styles.modelTitle}>🗼</Text>
                  <Text style={styles.modelSubtitle}>{artifact.title}</Text>
                  <View style={styles.modelStats}>
                    <Text style={styles.statText}>📏 605 feet tall</Text>
                    <Text style={styles.statText}>🏗️ Built in 1962</Text>
                    <Text style={styles.statText}>👁️ 360° views</Text>
                  </View>
                </View>
                <View style={styles.modelPulse} />
              </View>
            ) : (
              <View style={styles.modelPlaceholder}>
                <Text style={styles.modelText}>📱 AR Content</Text>
                <Text style={styles.modelSubtext}>{artifact.title}</Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {withinRange && !isPlaced && (
            <Button
              mode="contained"
              onPress={handlePlaceArtifact}
              style={styles.placeButton}
              buttonColor="#6366f1"
            >
              Tap to Place
            </Button>
          )}
          
          {isPlaced && (
            <View style={styles.arControls}>
              <IconButton
                icon="camera"
                iconColor="white"
                size={24}
                onPress={handleScreenshot}
                style={styles.controlButton}
              />
              <IconButton
                icon="refresh"
                iconColor="white"
                size={24}
                onPress={() => setIsPlaced(false)}
                style={styles.controlButton}
              />
            </View>
          )}
        </View>
      </Camera>

      {/* Onboarding Modal */}
      <Portal>
        <Modal
          visible={showOnboarding}
          onDismiss={dismissOnboarding}
          contentContainerStyle={styles.onboardingModal}
        >
          <Text style={styles.onboardingTitle}>AR Safety Tips</Text>
          <Text style={styles.onboardingText}>
            • Be aware of your surroundings{'\n'}
            • Move slowly and carefully{'\n'}
            • Ensure good lighting{'\n'}
            • Point camera at a flat surface to place objects
          </Text>
          <Button mode="contained" onPress={dismissOnboarding}>
            Got it
          </Button>
        </Modal>
      </Portal>

      {/* Info Modal */}
      <Portal>
        <Modal
          visible={showInfo}
          onDismiss={() => setShowInfo(false)}
          contentContainerStyle={styles.infoModal}
        >
          <Text style={styles.infoTitle}>{artifact.title}</Text>
          {artifact.description && (
            <Text style={styles.infoDescription}>{artifact.description}</Text>
          )}
          <Button mode="contained" onPress={() => setShowInfo(false)}>
            Close
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    margin: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    margin: 0,
  },
  artifactTitle: {
    flex: 1,
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  infoButton: {
    margin: 0,
  },
  distanceIndicator: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    alignItems: 'center',
  },
  distanceText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 4,
  },
  distanceValue: {
    color: '#6366f1',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placementContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshair: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  placementText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 8,
  },
  arContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modelContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  spaceNeedleModel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minWidth: 250,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  modelTitle: {
    fontSize: 48,
    marginBottom: 8,
  },
  modelSubtitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  modelStats: {
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  modelPulse: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    top: -25,
  },
  modelPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  modelText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modelSubtext: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomControls: {
    padding: 20,
    alignItems: 'center',
  },
  placeButton: {
    minWidth: 200,
  },
  arControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  onboardingModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  onboardingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  onboardingText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  infoModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#666',
  },
});
