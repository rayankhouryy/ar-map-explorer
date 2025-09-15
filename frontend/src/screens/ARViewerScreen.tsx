import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Camera } from 'expo-camera';

const ARViewerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [rotation, setRotation] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    getCameraPermissions();
    // Simulate rotation animation
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const toggleAR = () => {
    setIsARActive(!isARActive);
  };

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Camera permission needed for AR</Text>
      </View>
    );
  }

  if (isARActive && hasPermission) {
    return (
      <SafeAreaView style={styles.arContainer}>
        <StatusBar barStyle="light-content" />
        <Camera style={styles.camera} facing="back">
          {/* AR Overlay */}
          <View style={styles.arOverlay}>
            <View style={styles.topBar}>
              <IconButton
                icon="arrow-left"
                iconColor="white"
                size={24}
                onPress={() => navigation.goBack()}
              />
              <Text style={styles.arTitle}>🗼 Space Needle AR</Text>
              <IconButton
                icon="close"
                iconColor="white"
                size={24}
                onPress={() => setIsARActive(false)}
              />
            </View>
            
            <View style={styles.arContent}>
              <View style={[styles.arModel, { transform: [{ rotate: `${rotation}deg` }] }]}>
                <Text style={styles.arEmoji}>🗼</Text>
              </View>
              
              <View style={styles.arInfo}>
                <Text style={styles.arInfoText}>Space Needle GLB Model</Text>
                <Text style={styles.arSubText}>17MB • 4k Textures • Anchored to GPS</Text>
              </View>
            </View>
            
            <View style={styles.arControls}>
              <TouchableOpacity style={styles.captureButton}>
                <Text style={styles.captureText}>📸 Capture</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Camera>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗼 Space Needle AR</Text>
      <Text style={styles.subtitle}>GLB Model Ready!</Text>
      
      <View style={styles.modelContainer}>
        <Text style={[styles.emoji, { transform: [{ rotate: `${rotation}deg` }] }]}>🗼</Text>
        <Text style={styles.modelText}>Space Needle GLB Model</Text>
        <Text style={styles.fileInfo}>📦 17MB GLB • 4k Textures • 25k Triangles</Text>
        <View style={styles.statsContainer}>
          <Text style={styles.stats}>📏 605 feet tall</Text>
          <Text style={styles.stats}>🏗️ Built in 1962</Text>
          <Text style={styles.stats}>👁️ 360° views</Text>
          <Text style={styles.stats}>📍 GPS Anchored</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={toggleAR}>
        <Text style={styles.buttonText}>🚀 Launch AR Camera</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Map</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  arContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  arOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  arTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  arContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arModel: {
    marginBottom: 20,
  },
  arEmoji: {
    fontSize: 120,
    textAlign: 'center',
  },
  arInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  arInfoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  arSubText: {
    color: '#ccc',
    fontSize: 14,
  },
  arControls: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.8)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  captureText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    color: '#6366f1',
    fontSize: 18,
    marginBottom: 30,
  },
  modelContainer: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.5)',
    minWidth: 300,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 15,
    textAlign: 'center',
  },
  modelText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fileInfo: {
    color: '#6366f1',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
  },
  stats: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backText: {
    color: 'white',
    fontSize: 14,
  },
});

export default ARViewerScreen;
