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

  /**
   * Создание заявки на доставку и получение офферов
   */
  async createOffer(request: CreateOfferRequest): Promise<CreateOfferResponse> {
    return this.makeRequest<CreateOfferResponse>('/offers/create', request);
  }

  /**
   * Вспомогательный метод для создания заявки из данных корзины
   */
  async createOfferFromCart(cartData: {
    items: Array<{
      id: string;
      name: string;
      article: string;
      price: number;
      quantity: number;
      weight?: number;
      dimensions?: { dx?: number; dy?: number; dz?: number };
    }>;
    deliveryAddress: string;
    recipientName: string;
    recipientPhone: string;
    paymentMethod: 'already_paid' | 'card_on_receipt';
    deliveryType: 'courier' | 'pickup';
    pickupPointId?: string;
  }): Promise<CreateOfferResponse> {
    // Генерируем уникальный ID заявки
    const operatorRequestId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Конвертируем товары в формат API
    const items: RequestResourceItem[] = cartData.items.map((item, index) => ({
      article: item.article,
      billing_details: {
        assessed_unit_price: Math.round(item.price * 100), // В копейках
        unit_price: Math.round(item.price * 100), // В копейках
        nds: 20, // НДС 20%
      },
      count: item.quantity,
      name: item.name,
      place_barcode: `place_${index + 1}`, // Штрихкод коробки
      physical_dims: item.dimensions ? {
        dx: item.dimensions.dx || 10,
        dy: item.dimensions.dy || 10,
        dz: item.dimensions.dz || 10,
      } : {
        predefined_volume: 1000, // 1000 см³ по умолчанию
      },
    }));

    // Создаем грузоместа (коробки)
    const places: ResourcePlace[] = [{
      barcode: 'package_001',
      physical_dims: {
        dx: 30, // 30 см
        dy: 20, // 20 см
        dz: 15, // 15 см
        weight_gross: cartData.items.reduce((total, item) => 
          total + (item.weight || 500) * item.quantity, 0
        ), // Вес в граммах
      },
      description: 'Посылка с автозапчастями',
    }];

    // Настройка места отправления (наш склад)
    const source: SourceRequestNode = {
      platform_station: {
        platform_id: process.env.YANDEX_DELIVERY_SOURCE_STATION_ID || 'default_warehouse',
      },
    };

    // Настройка места назначения
    let destination: DestinationRequestNode;
    
    if (cartData.deliveryType === 'pickup' && cartData.pickupPointId) {
      // Доставка до ПВЗ
      destination = {
        type: 'platform_station',
        platform_station: {
          platform_id: cartData.pickupPointId,
        },
      };
    } else {
      // Курьерская доставка
      destination = {
        type: 'custom_location',
        custom_location: {
          details: {
            full_address: cartData.deliveryAddress,
            country: 'Россия',
          },
        },
        // Интервал доставки: завтра с 10:00 до 18:00
        interval: {
          from: Math.floor(Date.now() / 1000) + 24 * 60 * 60 + 10 * 60 * 60, // Завтра в 10:00
          to: Math.floor(Date.now() / 1000) + 24 * 60 * 60 + 18 * 60 * 60, // Завтра в 18:00
        },
      };
    }

    // Информация о получателе
    const nameParts = cartData.recipientName.split(' ');
    const recipientInfo: Contact = {
      first_name: nameParts[0] || 'Клиент',
      last_name: nameParts[1] || '',
      phone: cartData.recipientPhone,
    };

    // Создаем заявку
    const request: CreateOfferRequest = {
      billing_info: {
        payment_method: cartData.paymentMethod,
      },
      destination,
      info: {
        operator_request_id: operatorRequestId,
        comment: 'Заказ автозапчастей',
      },
      items,
      last_mile_policy: cartData.deliveryType === 'pickup' ? 'self_pickup' : 'time_interval',
      places,
      recipient_info: recipientInfo,
      source,
      particular_items_refuse: false, // Частичный выкуп не разрешен
    };

    return this.createOffer(request);
  }
}

// Интерфейсы для создания заявки на доставку
interface BillingInfo {
  payment_method: 'already_paid' | 'card_on_receipt';
  delivery_cost?: number;
}

interface CustomLocation {
  details?: LocationDetails;
  latitude?: number;
  longitude?: number;
}

interface LocationDetails {
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
}

interface PlatformStation {
  platform_id?: string;
}

interface TimeInterval {
  from: number;
  to: number;
}

interface DestinationRequestNode {
  type: 'platform_station' | 'custom_location';
  custom_location?: CustomLocation;
  interval?: TimeInterval;
  platform_station?: PlatformStation;
}

interface SourceRequestNode {
  platform_station: PlatformStation;
  interval?: TimeInterval;
}

interface RequestInfo {
  operator_request_id: string;
  comment?: string;
}

interface ItemBillingDetails {
  assessed_unit_price: number;
  unit_price: number;
  inn?: string;
  nds?: number;
}

interface ItemPhysicalDimensions {
  dx?: number;
  dy?: number;
  dz?: number;
  predefined_volume?: number;
}

interface RequestResourceItem {
  article: string;
  billing_details: ItemBillingDetails;
  count: number;
  name: string;
  place_barcode: string;
  marking_code?: string;
  physical_dims?: ItemPhysicalDimensions;
  uin?: string;
}

interface PlacePhysicalDimensions {
  dx: number;
  dy: number;
  dz: number;
  weight_gross: number;
  predefined_volume?: number;
}

interface ResourcePlace {
  barcode: string;
  physical_dims: PlacePhysicalDimensions;
  description?: string;
}

interface Contact {
  first_name: string;
  phone: string;
  email?: string;
  last_name?: string;
  partonymic?: string;
}

interface CreateOfferRequest {
  billing_info: BillingInfo;
  destination: DestinationRequestNode;
  info: RequestInfo;
  items: RequestResourceItem[];
  last_mile_policy: 'time_interval' | 'self_pickup';
  places: ResourcePlace[];
  recipient_info: Contact;
  source: SourceRequestNode;
  particular_items_refuse?: boolean;
}

interface DeliveryInterval {
  max: number;
  min: number;
  policy: 'time_interval' | 'self_pickup';
}

interface PickupInterval {
  max: number;
  min: number;
}

interface OfferDetails {
  delivery_interval?: DeliveryInterval;
  pickup_interval?: PickupInterval;
  pricing?: string;
  pricing_commission_on_delivery_payment?: string;
  pricing_commission_on_delivery_payment_amount?: string;
  pricing_total?: string;
}

interface Offer {
  expires_at?: string | number;
  offer_details?: OfferDetails;
  offer_id?: string;
}

interface CreateOfferResponse {
  offers: Offer[];
}

export const yandexDeliveryService = new YandexDeliveryService();
export type { YandexPickupPoint, CreateOfferRequest, CreateOfferResponse, Offer };

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