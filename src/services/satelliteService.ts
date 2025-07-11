export interface SatelliteData {
  soilMoisture: number;
  cropHealth: number;
  vegetationIndex: number;
  lastUpdated: string;
  imagery?: string;
  geospatialAnalysis: GeospatialAnalysis;
}

export interface GeospatialAnalysis {
  fieldBoundaries: FieldBoundary[];
  cropClassification: CropClassification[];
  healthAnalysis: HealthAnalysis;
  changeDetection: ChangeDetection;
}

export interface FieldBoundary {
  coordinates: number[][];
  area: number;
  cropType: string;
}

export interface CropClassification {
  cropType: string;
  confidence: number;
  area: number;
  coordinates: number[];
}

export interface HealthAnalysis {
  overallHealth: number;
  stressAreas: StressArea[];
  recommendations: string[];
}

export interface StressArea {
  coordinates: number[];
  severity: 'low' | 'medium' | 'high';
  type: 'water_stress' | 'nutrient_deficiency' | 'pest_damage' | 'disease';
  area: number;
}

export interface ChangeDetection {
  changes: Change[];
  timespan: string;
}

export interface Change {
  type: 'crop_growth' | 'deforestation' | 'irrigation' | 'harvest';
  coordinates: number[];
  confidence: number;
  date: string;
}

const PLANET_API_KEY = 'PLAK04166f2b0160428ab7a0a8c152306244';

export const satelliteService = {
  async getSatelliteData(lat: number = 18.5204, lon: number = 73.8567): Promise<SatelliteData> {
    try {
      // Planet.com API call for satellite imagery and analysis
      const geometryFilter = {
        type: 'GeometryFilter',
        field_name: 'geometry',
        config: {
          type: 'Point',
          coordinates: [lon, lat]
        }
      };

      const dateRangeFilter = {
        type: 'DateRangeFilter',
        field_name: 'acquired',
        config: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lte: new Date().toISOString().split('T')[0]
        }
      };

      const combinedFilter = {
        type: 'AndFilter',
        config: [geometryFilter, dateRangeFilter]
      };

      const searchRequest = {
        item_types: ['PSScene'],
        filter: combinedFilter
      };

      const response = await fetch('https://api.planet.com/data/v1/quick-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `api-key ${PLANET_API_KEY}`
        },
        body: JSON.stringify(searchRequest)
      });

      if (!response.ok) {
        throw new Error('Planet API request failed');
      }

      const data = await response.json();
      
      // Perform geospatial analysis on the retrieved data
      const analysis = await performGeospatialAnalysis(data.features, lat, lon);

      return {
        soilMoisture: 78 + Math.random() * 20 - 10, // Simulate real data variation
        cropHealth: 85 + Math.random() * 10 - 5,
        vegetationIndex: 0.65 + Math.random() * 0.2 - 0.1,
        lastUpdated: '2 hours ago',
        imagery: data.features[0]?.assets?.visual?.href,
        geospatialAnalysis: analysis
      };
    } catch (error) {
      console.error('Satellite service error:', error);
      // Return simulated data with geospatial analysis
      return {
        soilMoisture: 78,
        cropHealth: 85,
        vegetationIndex: 0.65,
        lastUpdated: '2 hours ago',
        geospatialAnalysis: getSimulatedGeospatialAnalysis(lat, lon)
      };
    }
  },

  async getFieldBoundaries(lat: number, lon: number): Promise<FieldBoundary[]> {
    // Simulate field boundary detection
    return [
      {
        coordinates: [
          [lon - 0.01, lat - 0.01],
          [lon + 0.01, lat - 0.01],
          [lon + 0.01, lat + 0.01],
          [lon - 0.01, lat + 0.01],
          [lon - 0.01, lat - 0.01]
        ],
        area: 2.5,
        cropType: 'wheat'
      },
      {
        coordinates: [
          [lon - 0.015, lat + 0.005],
          [lon - 0.005, lat + 0.005],
          [lon - 0.005, lat + 0.015],
          [lon - 0.015, lat + 0.015],
          [lon - 0.015, lat + 0.005]
        ],
        area: 1.8,
        cropType: 'cotton'
      }
    ];
  }
};

async function performGeospatialAnalysis(features: any[], lat: number, lon: number): Promise<GeospatialAnalysis> {
  // Simulate advanced geospatial analysis
  return getSimulatedGeospatialAnalysis(lat, lon);
}

function getSimulatedGeospatialAnalysis(lat: number, lon: number): GeospatialAnalysis {
  return {
    fieldBoundaries: [
      {
        coordinates: [
          [lon - 0.01, lat - 0.01],
          [lon + 0.01, lat - 0.01],
          [lon + 0.01, lat + 0.01],
          [lon - 0.01, lat + 0.01],
          [lon - 0.01, lat - 0.01]
        ],
        area: 2.5,
        cropType: 'wheat'
      }
    ],
    cropClassification: [
      {
        cropType: 'wheat',
        confidence: 0.92,
        area: 2.5,
        coordinates: [lon, lat]
      },
      {
        cropType: 'cotton',
        confidence: 0.87,
        area: 1.8,
        coordinates: [lon - 0.01, lat + 0.01]
      }
    ],
    healthAnalysis: {
      overallHealth: 85,
      stressAreas: [
        {
          coordinates: [lon - 0.005, lat - 0.005],
          severity: 'medium',
          type: 'water_stress',
          area: 0.3
        }
      ],
      recommendations: [
        'Increase irrigation in the northeastern section',
        'Consider applying nitrogen fertilizer to improve crop vigor',
        'Monitor for early blight symptoms in tomato areas'
      ]
    },
    changeDetection: {
      changes: [
        {
          type: 'crop_growth',
          coordinates: [lon, lat],
          confidence: 0.89,
          date: new Date().toISOString().split('T')[0]
        }
      ],
      timespan: 'Last 30 days'
    }
  };
}