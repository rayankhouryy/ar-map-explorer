import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { ArtifactWithDistance } from '../types';

interface Props {
  artifact: ArtifactWithDistance;
  onPress: () => void;
}

export default function ArtifactMarker({ artifact, onPress }: Props) {
  const getMarkerColor = () => {
    if (!artifact.is_in_range) return '#9CA3AF'; // gray for hidden/out of max range
    if (artifact.is_locked) return '#EF4444'; // red for locked (too close)
    return '#10B981'; // green for viewable
  };

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (artifact.artifact_type) {
      case 'art':
        return 'color-palette';
      case 'menu':
        return 'restaurant';
      case 'wayfinding':
        return 'navigate';
      case 'object_scan':
        return 'scan';
      case 'info_card':
        return 'information-circle';
      default:
        return 'location';
    }
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <Marker
      coordinate={{
        latitude: artifact.latitude,
        longitude: artifact.longitude,
      }}
      onPress={onPress}
      style={styles.marker}
    >
      <View style={[styles.markerContainer, { backgroundColor: getMarkerColor() }]}>
        <Ionicons
          name={getIconName()}
          size={20}
          color="white"
        />
        {artifact.is_locked && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={10} color="white" />
          </View>
        )}
      </View>
      
      {artifact.distance_meters !== undefined && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>
            {formatDistance(artifact.distance_meters)}
          </Text>
        </View>
      )}
    </Marker>
  );
}

const styles = StyleSheet.create({
  marker: {
    alignItems: 'center',
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  lockBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  distanceContainer: {
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  distanceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
});
