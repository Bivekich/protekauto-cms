interface YandexLocationDetectRequest {
  location: string;
}

interface YandexLocationDetectResponse {
  variants: {
    address: string;
    geo_id: number;
  }[];
}

interface YandexPickupPointsRequest {
  available_for_dropoff?: boolean;
  geo_id?: number;
  is_not_branded_partner_station?: boolean;
  is_post_office?: boolean;
  is_yandex_branded?: boolean;
  latitude?: {
    from: number;
    to: number;
  };
  longitude?: {
    from: number;
    to: number;
  };
  payment_method?: 'already_paid' | 'card_on_receipt';
  payment_methods?: ('already_paid' | 'card_on_receipt')[];
  pickup_point_ids?: string[];
  type?: 'pickup_point' | 'terminal' | 'post_office' | 'sorting_center';
}

interface YandexPickupPoint {
  id: string;
  address: {
    apartment?: string;
    building?: string;
    comment?: string;
    country?: string;
    full_address: string;
    geoId?: number;
    house?: string;
    housing?: string;
    locality?: string;
    postal_code?: string;
    region?: string;
    street?: string;
    subRegion?: string;
  };
  contact: {
    phone: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    partonymic?: string;
  };
  name: string;
  payment_methods: ('already_paid' | 'card_on_receipt')[];
  position: {
    latitude: number;
    longitude: number;
  };
  schedule: {
    restrictions: {
      days: number[];
      time_from: {
        hours: number;
        minutes: number;
      };
      time_to: {
        hours: number;
        minutes: number;
      };
    }[];
    time_zone: number;
  };
  type: 'pickup_point' | 'terminal' | 'post_office' | 'sorting_center';
  dayoffs?: {
    date: number;
    date_utc: number;
  }[];
  instruction?: string;
  is_dark_store?: boolean;
  is_market_partner?: boolean;
  is_post_office?: boolean;
  is_yandex_branded?: boolean;
  operator_station_id?: string;
}

interface YandexPickupPointsResponse {
  points: YandexPickupPoint[];
}

const BASE_URL = 'https://b2b-authproxy.taxi.yandex.net/api/b2b/platform';

class YandexDeliveryService {
  private token: string;

  constructor() {
    this.token = process.env.YANDEX_DELIVERY_TOKEN || '';
    if (!this.token) {
      throw new Error('YANDEX_DELIVERY_TOKEN не установлен в переменных окружения');
    }
  }

  private async makeRequest<T>(endpoint: string, data?: any): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка API Яндекс доставки: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Получение идентификатора населённого пункта по адресу
   */
  async detectLocation(location: string): Promise<YandexLocationDetectResponse> {
    return this.makeRequest<YandexLocationDetectResponse>('/location/detect', {
      location,
    });
  }

  /**
   * Получение списка точек самопривоза и ПВЗ
   */
  async getPickupPoints(request: YandexPickupPointsRequest = {}): Promise<YandexPickupPointsResponse> {
    return this.makeRequest<YandexPickupPointsResponse>('/pickup-points/list', request);
  }

  /**
   * Получение ПВЗ для конкретного города
   */
  async getPickupPointsByCity(cityName: string): Promise<YandexPickupPoint[]> {
    try {
      // Сначала получаем geo_id города
      const locationResponse = await this.detectLocation(cityName);
      
      if (locationResponse.variants.length === 0) {
        return [];
      }

      const geoId = locationResponse.variants[0].geo_id;

      // Получаем все ПВЗ для этого города
      const pickupResponse = await this.getPickupPoints({
        geo_id: geoId,
        is_yandex_branded: true, // Только брендированные ПВЗ Яндекса
      });

      return pickupResponse.points;
    } catch (error) {
      console.error('Ошибка получения ПВЗ для города:', error);
      return [];
    }
  }

  /**
   * Получение ПВЗ в заданном радиусе от координат
   */
  async getPickupPointsByCoordinates(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<YandexPickupPoint[]> {
    try {
      // Конвертируем радиус в градусы (приблизительно)
      const radiusDegrees = radiusKm / 111; // 1 градус ≈ 111 км

      const pickupResponse = await this.getPickupPoints({
        latitude: {
          from: latitude - radiusDegrees,
          to: latitude + radiusDegrees,
        },
        longitude: {
          from: longitude - radiusDegrees,
          to: longitude + radiusDegrees,
        },
        is_yandex_branded: true,
      });

      return pickupResponse.points;
    } catch (error) {
      console.error('Ошибка получения ПВЗ по координатам:', error);
      return [];
    }
  }

  /**
   * Форматирование расписания работы ПВЗ
   */
  formatSchedule(schedule: YandexPickupPoint['schedule']): string {
    if (!schedule.restrictions || schedule.restrictions.length === 0) {
      return 'Расписание не указано';
    }

    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    return schedule.restrictions.map(restriction => {
      const days = restriction.days.map(day => dayNames[day - 1]).join(', ');
      const timeFrom = `${restriction.time_from.hours.toString().padStart(2, '0')}:${restriction.time_from.minutes.toString().padStart(2, '0')}`;
      const timeTo = `${restriction.time_to.hours.toString().padStart(2, '0')}:${restriction.time_to.minutes.toString().padStart(2, '0')}`;
      
      return `${days}: ${timeFrom}-${timeTo}`;
    }).join('; ');
  }

  /**
   * Получение типа ПВЗ на русском языке
   */
  getTypeLabel(type: string): string {
    const labels = {
      pickup_point: 'Пункт выдачи',
      terminal: 'Постомат',
      post_office: 'Почтовое отделение',
      sorting_center: 'Сортировочный центр',
    };
    return labels[type as keyof typeof labels] || type;
  }
}

export const yandexDeliveryService = new YandexDeliveryService();
export type { YandexPickupPoint };

// Функция для автокомплита адресов
export const getAddressSuggestions = async (query: string): Promise<string[]> => {
  // Используем API ключ Яндекс карт для геокодирования
  const apiKey = process.env.YANDEX_MAPS_API_KEY;
  
  if (!apiKey) {
    console.error('YANDEX_MAPS_API_KEY не настроен');
    return [];
  }

  if (!query || query.length < 3) {
    return [];
  }

  try {
    // Используем Yandex Geocoder API для поиска адресов
    const response = await fetch(
      `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(query)}&format=json&results=5&kind=house&lang=ru_RU`
    );

    if (!response.ok) {
      console.error('Ошибка API Геокодера:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (data?.response?.GeoObjectCollection?.featureMember) {
      const features = data.response.GeoObjectCollection.featureMember;
      
      return features.map((feature: any) => {
        const geoObject = feature.GeoObject;
        // Возвращаем полный адрес
        return geoObject.metaDataProperty?.GeocoderMetaData?.text || geoObject.name || '';
      }).filter(Boolean);
    }

    return [];
  } catch (error) {
    console.error('Ошибка получения подсказок адресов:', error);
    return [];
  }
}; 