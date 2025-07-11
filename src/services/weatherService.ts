export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  day: string;
  high: number;
  low: number;
  condition: string;
  rain: number;
  icon: string;
}

const TOMORROW_IO_API_KEY = '5jdcRCZ2dYEERqUKqOhbAKEjXxIevKww';

export const weatherService = {
  async getCurrentWeather(lat: number = 18.5204, lon: number = 73.8567): Promise<WeatherData> {
    try {
      const response = await fetch(
        `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${TOMORROW_IO_API_KEY}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      const values = data.data.values;
      
      return {
        temperature: Math.round(values.temperature),
        condition: getWeatherCondition(values.weatherCode),
        humidity: Math.round(values.humidity),
        windSpeed: Math.round(values.windSpeed * 3.6), // Convert m/s to km/h
        visibility: Math.round(values.visibility),
        pressure: Math.round(values.pressureSeaLevel),
        sunrise: '6:15 AM', // Static for now
        sunset: '6:45 PM',  // Static for now
        forecast: [] // Will be filled by forecast API
      };
    } catch (error) {
      console.error('Weather service error:', error);
      // Return fallback data
      return {
        temperature: 28,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        visibility: 10,
        pressure: 1013,
        sunrise: '6:15 AM',
        sunset: '6:45 PM',
        forecast: []
      };
    }
  },

  async getWeatherForecast(lat: number = 18.5204, lon: number = 73.8567): Promise<ForecastDay[]> {
    try {
      const response = await fetch(
        `https://api.tomorrow.io/v4/weather/forecast?location=${lat},${lon}&timesteps=1d&units=metric&apikey=${TOMORROW_IO_API_KEY}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Forecast API request failed');
      }
      
      const data = await response.json();
      const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      
      return data.data.timelines[0].intervals.slice(0, 7).map((interval: any, index: number) => ({
        day: days[index],
        high: Math.round(interval.values.temperatureMax),
        low: Math.round(interval.values.temperatureMin),
        condition: getWeatherCondition(interval.values.weatherCode),
        rain: Math.round(interval.values.precipitationProbability),
        icon: getWeatherIcon(interval.values.weatherCode)
      }));
    } catch (error) {
      console.error('Forecast service error:', error);
      // Return fallback forecast
      return [
        { day: 'Today', high: 32, low: 24, condition: 'Partly Cloudy', rain: 10, icon: '⛅' },
        { day: 'Tomorrow', high: 29, low: 22, condition: 'Rainy', rain: 80, icon: '🌧️' },
        { day: 'Wed', high: 26, low: 20, condition: 'Heavy Rain', rain: 90, icon: '⛈️' },
        { day: 'Thu', high: 30, low: 23, condition: 'Cloudy', rain: 30, icon: '☁️' },
        { day: 'Fri', high: 33, low: 25, condition: 'Sunny', rain: 5, icon: '☀️' },
        { day: 'Sat', high: 31, low: 24, condition: 'Partly Cloudy', rain: 15, icon: '⛅' },
        { day: 'Sun', high: 28, low: 21, condition: 'Thunderstorm', rain: 85, icon: '⛈️' }
      ];
    }
  }
};

function getWeatherCondition(code: number): string {
  const conditions: { [key: number]: string } = {
    0: 'Unknown',
    1000: 'Clear',
    1001: 'Cloudy',
    1100: 'Mostly Clear',
    1101: 'Partly Cloudy',
    1102: 'Mostly Cloudy',
    2000: 'Fog',
    2100: 'Light Fog',
    4000: 'Drizzle',
    4001: 'Rain',
    4200: 'Light Rain',
    4201: 'Heavy Rain',
    5000: 'Snow',
    5001: 'Flurries',
    5100: 'Light Snow',
    5101: 'Heavy Snow',
    6000: 'Freezing Drizzle',
    6001: 'Freezing Rain',
    6200: 'Light Freezing Rain',
    6201: 'Heavy Freezing Rain',
    7000: 'Ice Pellets',
    7101: 'Heavy Ice Pellets',
    7102: 'Light Ice Pellets',
    8000: 'Thunderstorm'
  };
  return conditions[code] || 'Partly Cloudy';
}

function getWeatherIcon(code: number): string {
  const icons: { [key: number]: string } = {
    1000: '☀️',
    1001: '☁️',
    1100: '🌤️',
    1101: '⛅',
    1102: '☁️',
    2000: '🌫️',
    2100: '🌫️',
    4000: '🌦️',
    4001: '🌧️',
    4200: '🌦️',
    4201: '⛈️',
    5000: '❄️',
    5001: '🌨️',
    5100: '🌨️',
    5101: '❄️',
    8000: '⛈️'
  };
  return icons[code] || '⛅';
}