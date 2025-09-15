import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  location: Location.LocationObject | null;
  isLoading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
  hasLocationPermission: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        await getCurrentLocation();
      }
    } catch (err) {
      console.error('Error checking location permission:', err);
      setError('Failed to check location permission');
    }
  };

  const requestLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Location permission denied');
        setHasLocationPermission(false);
        return;
      }

      setHasLocationPermission(true);
      await getCurrentLocation();
    } catch (err) {
      console.error('Error requesting location:', err);
      setError('Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });
      
      setLocation(locationResult);
      setError(null);
    } catch (err) {
      console.error('Error getting current location:', err);
      setError('Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    location,
    isLoading,
    error,
    requestLocation,
    hasLocationPermission,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
