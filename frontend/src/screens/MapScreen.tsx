import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Dimensions,
  Text,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Searchbar, FAB, Button, Chip } from 'react-native-paper';
import { useLocation } from '../contexts/LocationContext';
import { useAuth } from '../contexts/AuthContext';
import { artifactsAPI } from '../services/api';
import { ArtifactWithDistance } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import ArtifactBottomSheet from '../components/ArtifactBottomSheet';
import ArtifactMarker from '../components/ArtifactMarker';
import FilterChips from '../components/FilterChips';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function MapScreen() {
  const [artifacts, setArtifacts] = useState<ArtifactWithDistance[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactWithDistance | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  
  const mapRef = useRef<MapView>(null);
  const { location, requestLocation, hasLocationPermission } = useLocation();
  const { isAuthenticated, token } = useAuth();

  const [region, setRegion] = useState<Region>({
    latitude: 47.6205, // Seattle Space Needle coordinates
    longitude: -122.3493,
    latitudeDelta: 0.02, // Zoomed in to show Seattle area
    longitudeDelta: 0.02 * ASPECT_RATIO,
  });

  // Set up authentication and location on screen focus
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        artifactsAPI.setAuthToken(token);
      }
      
      if (!hasLocationPermission) {
        requestLocation();
      }
    }, [token, hasLocationPermission])
  );

  // Update region when location is available
  useEffect(() => {
    if (location) {
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      setRegion(newRegion);
      loadNearbyArtifacts(location.coords.latitude, location.coords.longitude);
    }
  }, [location]);

  const loadNearbyArtifacts = async (lat: number, lng: number, radius: number = 2000) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await artifactsAPI.getNearbyArtifacts(
        lat,
        lng,
        radius,
        activeFilters.length > 0 ? activeFilters : undefined
      );
      setArtifacts(response.artifacts);
    } catch (error: any) {
      console.error('Failed to load artifacts:', error);
      Alert.alert('Error', 'Failed to load nearby artifacts');
    } finally {
      setLoading(false);
    }
  };

  const onRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    loadNearbyArtifacts(newRegion.latitude, newRegion.longitude);
  };

  const onMarkerPress = (artifact: ArtifactWithDistance) => {
    setSelectedArtifact(artifact);
    setShowBottomSheet(true);
  };

  const onFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
    if (location) {
      loadNearbyArtifacts(location.coords.latitude, location.coords.longitude);
    }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
      mapRef.current.animateToRegion(userRegion, 1000);
    } else if (!hasLocationPermission) {
      requestLocation();
    }
  };

  const centerOnSeattle = () => {
    const seattleRegion = {
      latitude: 47.6205, // Space Needle coordinates
      longitude: -122.3493,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02 * ASPECT_RATIO,
    };
    setRegion(seattleRegion);
    mapRef.current?.animateToRegion(seattleRegion, 1000);
    loadNearbyArtifacts(47.6205, -122.3493, 5000);
  };

  const getMarkerColor = (artifact: ArtifactWithDistance) => {
    if (!artifact.is_in_range) return '#9CA3AF'; // gray for out of range
    if (artifact.is_locked) return '#EF4444'; // red for locked (too close)
    return '#10B981'; // green for viewable
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authText}>Please sign in to explore AR artifacts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search places or venues"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Filter Chips */}
      <FilterChips
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        style={styles.filterContainer}
      />

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={false}
        loadingEnabled={loading}
      >
        {artifacts.map((artifact) => (
          <ArtifactMarker
            key={artifact.id}
            artifact={artifact}
            onPress={() => onMarkerPress(artifact)}
          />
        ))}
      </MapView>

      {/* Location FABs */}
      <FAB
        icon="crosshairs-gps"
        style={styles.locationFab}
        onPress={centerOnUser}
        size="small"
      />
      
      {/* Seattle Demo FAB */}
      <FAB
        icon="city"
        style={styles.seattleFab}
        onPress={centerOnSeattle}
        size="small"
        label="Seattle Demo"
      />

      {/* Bottom Sheet */}
      {selectedArtifact && (
        <ArtifactBottomSheet
          artifact={selectedArtifact}
          visible={showBottomSheet}
          onDismiss={() => {
            setShowBottomSheet(false);
            setSelectedArtifact(null);
          }}
          userLocation={location ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          } : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  authText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
  searchContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  searchBar: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterContainer: {
    position: 'absolute',
    top: 110,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  map: {
    flex: 1,
  },
  locationFab: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    backgroundColor: '#fff',
  },
  seattleFab: {
    position: 'absolute',
    bottom: 170,
    right: 16,
    backgroundColor: '#10B981',
  },
});
