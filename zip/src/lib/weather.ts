import { WeatherLocation } from '../types';

export interface WeatherForecastDay {
  date: string;
  min: number;
  max: number;
  weatherCode: number;
}

export interface WeatherForecast {
  currentTemperature: number;
  currentWeatherCode: number;
  days: WeatherForecastDay[];
}

interface GeocodingResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: GeocodingResult[];
}

interface ForecastResponse {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
  };
  daily?: {
    time?: string[];
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
    weather_code?: number[];
  };
}

export async function geocodeCity(query: string): Promise<WeatherLocation> {
  const trimmed = query.trim();
  if (!trimmed) throw new Error('请输入城市名称');

  const params = new URLSearchParams({
    name: trimmed,
    count: '1',
    language: 'zh',
    format: 'json',
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
  if (!response.ok) throw new Error('城市搜索失败，请稍后再试');

  const body = (await response.json()) as GeocodingResponse;
  const result = body.results?.[0];
  if (!result) throw new Error('没有找到这个城市');

  return {
    city: result.admin1 ? `${result.name}, ${result.admin1}` : result.name,
    country: result.country ?? null,
    latitude: result.latitude,
    longitude: result.longitude,
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchWeatherForecast(location: WeatherLocation): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: 'temperature_2m,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code',
    forecast_days: '3',
    timezone: 'auto',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) throw new Error('天气加载失败');

  const body = (await response.json()) as ForecastResponse;
  const times = body.daily?.time ?? [];
  const mins = body.daily?.temperature_2m_min ?? [];
  const maxes = body.daily?.temperature_2m_max ?? [];
  const codes = body.daily?.weather_code ?? [];

  return {
    currentTemperature: Math.round(body.current?.temperature_2m ?? maxes[0] ?? 0),
    currentWeatherCode: body.current?.weather_code ?? codes[0] ?? 0,
    days: times.map((date, index) => ({
      date,
      min: Math.round(mins[index] ?? 0),
      max: Math.round(maxes[index] ?? 0),
      weatherCode: codes[index] ?? 0,
    })),
  };
}

export function describeWeatherCode(code: number) {
  if (code === 0) return '晴';
  if ([1, 2, 3].includes(code)) return '多云';
  if ([45, 48].includes(code)) return '雾';
  if ([51, 53, 55, 56, 57].includes(code)) return '毛毛雨';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '雨';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '雪';
  if ([95, 96, 99].includes(code)) return '雷雨';
  return '天气';
}
