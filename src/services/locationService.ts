// Map Indian states to local language codes
const STATE_TO_LANG: Record<string, string> = {
  'West Bengal': 'bn',
  'Maharashtra': 'mr',
  'Gujarat': 'gu',
  'Delhi': 'hi',
  'Uttar Pradesh': 'hi',
  'Madhya Pradesh': 'hi',
  'Bihar': 'hi',
  'Rajasthan': 'hi',
  'Haryana': 'hi',
  'Punjab': 'hi',
  'Chhattisgarh': 'hi',
  'Jharkhand': 'hi',
  'Assam': 'bn',
  'Tripura': 'bn',
  'Meghalaya': 'en', // fallback
  'Manipur': 'en', // fallback
  'Nagaland': 'en', // fallback
  'Arunachal Pradesh': 'en', // fallback
  'Mizoram': 'en', // fallback
  'Sikkim': 'en', // fallback
  'Goa': 'en', // fallback
  'Karnataka': 'en', // fallback
  'Kerala': 'en', // fallback
  'Tamil Nadu': 'en', // fallback
  'Andhra Pradesh': 'en', // fallback
  'Telangana': 'en', // fallback
  'Odisha': 'en', // fallback
  'Uttarakhand': 'hi',
  'Himachal Pradesh': 'hi',
  'Jammu and Kashmir': 'hi',
  'Ladakh': 'hi',
  'Chandigarh': 'hi',
  'Dadra and Nagar Haveli': 'gu',
  'Daman and Diu': 'gu',
  'Lakshadweep': 'en',
  'Puducherry': 'en',
  'Andaman and Nicobar Islands': 'en'
};

export interface LocationInfo {
  latitude: number;
  longitude: number;
  state: string;
  city: string;
  country: string;
  language: string;
}

export interface LocationServiceResponse {
  success: boolean;
  location?: LocationInfo;
  error?: string;
}

class LocationService {
  private userLocation: LocationInfo | null = null;
  private manualLanguage: string | null = null;

  async detectLocation(): Promise<LocationServiceResponse> {
    try {
      // Check if we have a manually set language that should persist
      if (this.manualLanguage) {
        return {
          success: true,
          location: {
            latitude: 0,
            longitude: 0,
            state: 'Manual',
            city: 'Manual',
            country: 'India',
            language: this.manualLanguage
          }
        };
      }

      // Check if we have cached location
      if (this.userLocation) {
        return {
          success: true,
          location: this.userLocation
        };
      }

      // Get current location
      const position = await this.getCurrentPosition();
      const locationInfo = await this.reverseGeocode(position.coords.latitude, position.coords.longitude);
      
      // Cache the location
      this.userLocation = locationInfo;
      
      return {
        success: true,
        location: locationInfo
      };

    } catch (error) {
      console.error('Location detection error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Location detection failed'
      };
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  private async reverseGeocode(lat: number, lng: number): Promise<LocationInfo> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Reverse geocoding failed');
      }

      const data = await response.json();
      const address = data.address || {};
      
      const state = address.state || '';
      const city = address.city || address.town || address.village || '';
      const country = address.country || 'India';
      
      // Determine language based on state
      const language = STATE_TO_LANG[state] || 'en';

      return {
        latitude: lat,
        longitude: lng,
        state,
        city,
        country,
        language
      };

    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Return default location (India center)
      return {
        latitude: 20.5937,
        longitude: 78.9629,
        state: 'Unknown',
        city: 'Unknown',
        country: 'India',
        language: 'en'
      };
    }
  }

  async setManualLocation(locationName: string): Promise<LocationServiceResponse> {
    try {
      // Geocode the location name
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&countrycodes=in&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error('Location not found');
      }

      const result = data[0];
      const locationInfo = await this.reverseGeocode(parseFloat(result.lat), parseFloat(result.lon));
      
      // Cache the location
      this.userLocation = locationInfo;
      
      return {
        success: true,
        location: locationInfo
      };

    } catch (error) {
      console.error('Manual location setting error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to set manual location'
      };
    }
  }

  setManualLanguage(language: string): void {
    this.manualLanguage = language;
    // Clear cached location to force fresh detection when auto mode is enabled
    this.userLocation = null;
  }

  clearManualLanguage(): void {
    this.manualLanguage = null;
  }

  getCurrentLocation(): LocationInfo | null {
    return this.userLocation;
  }

  isManualLanguageSet(): boolean {
    return this.manualLanguage !== null;
  }

  getManualLanguage(): string | null {
    return this.manualLanguage;
  }
}

// Export a singleton instance
export const locationService = new LocationService(); 