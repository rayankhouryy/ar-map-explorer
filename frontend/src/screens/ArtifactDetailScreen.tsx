import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Button, Card, Chip, IconButton } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';

type ArtifactDetailRouteProp = RouteProp<RootStackParamList, 'ArtifactDetail'>;

export default function ArtifactDetailScreen() {
  const route = useRoute<ArtifactDetailRouteProp>();
  const { artifact } = route.params;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
    <ScrollView style={styles.container}>
      {/* Hero Image */}
      {artifact.thumbnail_url && (
        <Image
          source={{ uri: artifact.thumbnail_url }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{artifact.title}</Text>
          <View style={styles.metaRow}>
            <Chip mode="outlined" style={styles.typeChip}>
              {getArtifactTypeLabel(artifact.artifact_type)}
            </Chip>
          </View>
        </View>

        {/* Description */}
        {artifact.description && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{artifact.description}</Text>
            </Card.Content>
          </Card>
        )}

        {/* Details */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>
                {artifact.address || `${artifact.latitude.toFixed(6)}, ${artifact.longitude.toFixed(6)}`}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>View Distance:</Text>
              <Text style={styles.detailValue}>
                {artifact.min_view_distance}m - {artifact.max_view_distance}m
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Created:</Text>
              <Text style={styles.detailValue}>
                {formatDate(artifact.created_at)}
              </Text>
            </View>

            {artifact.published_at && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Published:</Text>
                <Text style={styles.detailValue}>
                  {formatDate(artifact.published_at)}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Tags */}
        {artifact.tags && artifact.tags.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagsContainer}>
                {artifact.tags.map((tag, index) => (
                  <Chip key={index} mode="outlined" style={styles.tag}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Button
              mode="contained"
              icon="eye"
              style={styles.actionButton}
            >
              View in AR
            </Button>
            
            <Button
              mode="outlined"
              icon="directions"
              style={styles.actionButton}
            >
              Get Directions
            </Button>
            
            <Button
              mode="text"
              icon="flag"
              style={styles.actionButton}
              textColor="#EF4444"
            >
              Report Content
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChip: {
    borderColor: '#6366f1',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#374151',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#6B7280',
    flex: 2,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
});
