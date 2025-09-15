import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { User, ArtifactsNearResponse, ArtifactWithDistance, Report } from '../types';

// Configure base URL - adjust for your backend
// For development with physical device, use your computer's local IP
const BASE_URL = __DEV__ 
  ? 'http://10.0.0.252:8001/api/v1'  // Your computer's IP for mobile testing
  : 'https://your-production-api.com/api/v1';  // Production URL

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setAuthToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  private async handleResponse<T>(response: AxiosResponse<T>): Promise<T> {
    return response.data;
  }

  private async handleError(error: any): Promise<never> {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.detail || 'An error occurred';
      throw new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

class AuthAPI extends APIClient {
  async login(email: string, password: string): Promise<{ access_token: string; token_type: string }> {
    try {
      const response = await this.client.post('/auth/login/email', {
        email,
        password,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(email: string, password: string, fullName?: string, role: 'explorer' | 'creator' = 'explorer'): Promise<User> {
    try {
      const response = await this.client.post('/auth/register', {
        email,
        password,
        full_name: fullName,
        role,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getCurrentUser(token: string): Promise<User> {
    try {
      this.setAuthToken(token);
      const response = await this.client.get('/auth/me');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async upgradeToCreator(token: string): Promise<User> {
    try {
      this.setAuthToken(token);
      const response = await this.client.post('/users/me/upgrade-to-creator');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

class ArtifactsAPI extends APIClient {
  async getNearbyArtifacts(
    latitude: number,
    longitude: number,
    radius: number = 1000,
    types?: string[],
    skip: number = 0,
    limit: number = 50
  ): Promise<ArtifactsNearResponse> {
    try {
      const params: any = {
        lat: latitude,
        lng: longitude,
        radius,
        skip,
        limit,
      };

      if (types && types.length > 0) {
        params.types = types.join(',');
      }

      const response = await this.client.get('/artifacts/near', { params });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getArtifact(
    id: number,
    userLatitude?: number,
    userLongitude?: number
  ): Promise<ArtifactWithDistance> {
    try {
      const params: any = {};
      if (userLatitude !== undefined && userLongitude !== undefined) {
        params.lat = userLatitude;
        params.lng = userLongitude;
      }

      const response = await this.client.get(`/artifacts/${id}`, { params });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async createArtifact(
    title: string,
    description: string,
    category: string,
    latitude: number,
    longitude: number,
    imageUri: string,
    token: string
  ): Promise<ArtifactWithDistance> {
    try {
      this.setAuthToken(token);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description || '');
      formData.append('category', category || '');
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      
      // Add image file
      const filename = imageUri.split('/').pop() || 'image.jpg';
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      } as any);

      const response = await this.client.post('/artifacts/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateArtifact(id: number, updates: any): Promise<ArtifactWithDistance> {
    try {
      const response = await this.client.patch(`/artifacts/${id}`, updates);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async publishArtifact(id: number): Promise<ArtifactWithDistance> {
    try {
      const response = await this.client.post(`/artifacts/${id}/publish`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMyArtifacts(skip: number = 0, limit: number = 50): Promise<ArtifactWithDistance[]> {
    try {
      const response = await this.client.get('/artifacts/', {
        params: { skip, limit },
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

class ReportsAPI extends APIClient {
  async createReport(artifactId: number, reason: string, description?: string): Promise<Report> {
    try {
      const response = await this.client.post('/reports/', {
        artifact_id: artifactId,
        reason,
        description,
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

// Export API instances
export const authAPI = new AuthAPI();
export const artifactsAPI = new ArtifactsAPI();
export const reportsAPI = new ReportsAPI();
