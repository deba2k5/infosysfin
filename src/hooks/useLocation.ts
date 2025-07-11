import { useState, useEffect } from 'react';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  accuracy?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<LocationError | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError({
        code: -1,
        message: 'Geolocation is not supported by this browser'
      });
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;
          
          // Reverse geocoding to get location details
          const locationDetails = await reverseGeocode(latitude, longitude);
          
          setLocation({
            latitude,
            longitude,
            accuracy,
            ...locationDetails
          });
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          // Set location with coordinates only
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            city: 'Unknown',
            state: 'Unknown',
            country: 'India'
          });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError({
          code: err.code,
          message: getLocationErrorMessage(err.code)
        });
        setLoading(false);
        
        // Set default location (Pune, Maharashtra) as fallback
        setLocation({
          latitude: 18.5204,
          longitude: 73.8567,
          city: 'Pune',
          state: 'Maharashtra',
          country: 'India'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<Omit<LocationData, 'latitude' | 'longitude' | 'accuracy'>> => {
    try {
      // Using Nominatim (OpenStreetMap) reverse geocoding - free service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }
      
      const data = await response.json();
      
      return {
        city: data.address?.city || data.address?.town || data.address?.village || 'Unknown',
        state: data.address?.state || 'Unknown',
        country: data.address?.country || 'India'
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        city: 'Unknown',
        state: 'Unknown', 
        country: 'India'
      };
    }
  };

  const refreshLocation = () => {
    getCurrentLocation();
  };

  return {
    location,
    loading,
    error,
    refreshLocation
  };
};

function getLocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location access denied by user';
    case 2:
      return 'Location information unavailable';
    case 3:
      return 'Location request timed out';
    default:
      return 'An unknown error occurred while getting location';
  }
}