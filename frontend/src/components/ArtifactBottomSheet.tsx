import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { Modal, Portal, Button, Card, Chip, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ArtifactWithDistance } from '../types';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useLocation } from '../contexts/LocationContext';

const { height } = Dimensions.get('window');

interface Props {
  artifact: ArtifactWithDistance;
  visible: boolean;
  onDismiss: () => void;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function ArtifactBottomSheet({ 
  artifact, 
  visible, 
  onDismiss,
  userLocation 
}: Props) {
  const navigation = useNavigation<NavigationProp>();
  const { location, requestLocation } = useLocation();
  
  // Use location from context as fallback if userLocation prop is not provided
  const effectiveUserLocation = userLocation || (location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  } : null);

  const formatDistance = (meters?: number) => {
    if (!meters) return 'Distance unknown';
    if (meters < 1000) {
      return `${Math.round(meters)}m away`;
    }
    return `${(meters / 1000).toFixed(1)}km away`;
  };

  const getStatusText = () => {
    if (!artifact.is_in_range) {
      return `Move within ${artifact.max_view_distance}m to view`;
    }
    if (artifact.is_locked) {
      return `Move ≥ ${artifact.min_view_distance}m away to unlock`;
    }
    return 'Ready to view in AR';
  };

  const getStatusColor = () => {
    if (!artifact.is_in_range) return '#9CA3AF';
    if (artifact.is_locked) return '#EF4444';
    return '#10B981';
  };

  const canViewAR = artifact.is_in_range && !artifact.is_locked;

  const handleViewAR = async () => {
    console.log('🚀 handleViewAR called');
    console.log('📍 effectiveUserLocation:', effectiveUserLocation);
    console.log('🎯 canViewAR:', canViewAR);
    console.log('🗼 artifact:', artifact.title);
    
    if (!effectiveUserLocation) {
      // Try to request location first
      console.log('📍 No location available, requesting...');
      try {
        await requestLocation();
        // Check again after requesting
        const newLocation = location ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        } : null;
        
        if (!newLocation) {
          Alert.alert(
            'Location Required', 
            'Please enable location services to use AR features. You can also use the demo from Seattle coordinates.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Use Seattle Demo', 
                onPress: () => {
                  // Use Space Needle coordinates as fallback
                  const seattleLocation = {
                    latitude: 47.6205,
                    longitude: -122.3493,
                  };
                  navigateToAR(seattleLocation);
                }
              }
            ]
          );
          return;
        }
        navigateToAR(newLocation);
      } catch (error) {
        console.error('❌ Location request failed:', error);
        Alert.alert('Error', 'Could not get location. Please check your location settings.');
        return;
      }
    } else {
      navigateToAR(effectiveUserLocation);
    }
  };

  const navigateToAR = (userLoc: { latitude: number; longitude: number }) => {
    if (!canViewAR) {
      Alert.alert('Not Available', getStatusText());
      return;
    }

    try {
      console.log('🎪 Navigating to ARViewer...');
      onDismiss();
      navigation.navigate('ARViewer', {
        artifact,
        userLocation: userLoc,
      });
      console.log('✅ Navigation called successfully');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Error', 'Failed to open AR view');
    }
  };

  const handleViewDetails = () => {
    onDismiss();
    navigation.navigate('ArtifactDetail', { artifact });
  };

  const getArtifactTypeLabel = (type: string) => {
    switch (type) {
      case 'art': return 'Art';
      case 'menu': return 'Menu';
      case 'wayfinding': return 'Wayfinding';
      case 'object_scan': return 'Scan';
      case 'info_card': return 'Info';
      default: return type;
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.container}>
          {/* Handle bar */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title} numberOfLines={2}>
                {artifact.title}
              </Text>
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
                style={styles.closeButton}
              />
            </View>
            
            <View style={styles.metaRow}>
              <Chip mode="outlined" compact style={styles.typeChip}>
                {getArtifactTypeLabel(artifact.artifact_type)}
              </Chip>
              <Text style={styles.distance}>
                {formatDistance(artifact.distance_meters)}
              </Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Thumbnail */}
            {artifact.thumbnail_url && (
              <Image
                source={{ uri: artifact.thumbnail_url }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            )}

            {/* Description */}
            {artifact.description && (
              <Text style={styles.description}>
                {artifact.description}
              </Text>
            )}

            {/* Tags */}
            {artifact.tags && artifact.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={styles.tagsLabel}>Tags:</Text>
                <View style={styles.tags}>
                  {artifact.tags.map((tag, index) => (
                    <Chip key={index} mode="outlined" compact style={styles.tag}>
                      {tag}
                    </Chip>
                  ))}
                </View>
              </View>
            )}

            {/* Status */}
            <View style={styles.statusContainer}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
              <Text style={styles.statusText}>
                {getStatusText()}
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleViewDetails}
              style={[styles.button, styles.detailsButton]}
            >
              Details
            </Button>
            
            <Button
              mode="contained"
              onPress={handleViewAR}
              disabled={!canViewAR}
              style={[styles.button, styles.arButton]}
              buttonColor={canViewAR ? '#6366f1' : '#9CA3AF'}
            >
              View in AR
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
    minHeight: height * 0.3,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    margin: 0,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeChip: {
    borderColor: '#6366f1',
  },
  distance: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 16,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  detailsButton: {
    borderColor: '#6366f1',
  },
  arButton: {
    // Styling handled by buttonColor prop
  },
});
