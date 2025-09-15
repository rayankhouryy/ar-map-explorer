export interface User {
  id: number;
  email: string;
  full_name?: string;
  role: 'explorer' | 'creator' | 'tenant_admin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface DistanceSettings {
  min_view_distance: number;
  max_view_distance: number;
}

export interface Artifact {
  id: number;
  title: string;
  description?: string;
  creator_id: number;
  artifact_type: 'art' | 'menu' | 'wayfinding' | 'object_scan' | 'info_card';
  asset_type: 'image' | 'video' | 'model_3d' | 'pdf';
  category?: string;
  tags: string[];
  latitude: number;
  longitude: number;
  address?: string;
  min_view_distance: number;
  max_view_distance: number;
  anchor_mode: 'gps' | 'image_target' | 'geoanchor';
  scale_factor: number;
  asset_url?: string;
  thumbnail_url?: string;
  preview_url?: string;
  file_size_bytes?: number;
  triangle_count?: number;
  texture_resolution?: number;
  menu_data?: any;
  pdf_fallback_url?: string;
  availability_start?: string;
  availability_end?: string;
  is_open_now: boolean;
  status: 'draft' | 'published' | 'reported' | 'hidden';
  is_featured: boolean;
  report_count: number;
  created_at: string;
  updated_at?: string;
  published_at?: string;
}

export interface ArtifactWithDistance extends Artifact {
  distance_meters?: number;
  is_in_range: boolean;
  is_locked: boolean;
}

export interface ArtifactsNearResponse {
  artifacts: ArtifactWithDistance[];
  total_count: number;
  has_more: boolean;
}

export interface Report {
  id: number;
  artifact_id: number;
  reporter_id: number;
  reason: 'inappropriate_content' | 'spam' | 'wrong_location' | 'copyright' | 'harassment' | 'other';
  description?: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  created_at: string;
  resolved_at?: string;
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
