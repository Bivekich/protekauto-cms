import { prisma } from '../prisma'
import { createToken, comparePasswords, hashPassword } from '../auth'
import { createAuditLog, AuditAction, getClientInfo } from '../audit'
import { uploadBuffer, generateFileKey } from '../s3'
import { smsService } from '../sms-service'
import { smsCodeStore } from '../sms-code-store'
import { laximoService, laximoDocService, laximoUnitService } from '../laximo-service'
import { autoEuroService } from '../autoeuro-service'
import { yooKassaService } from '../yookassa-service'
import * as csvWriter from 'csv-writer'
import * as XLSX from 'xlsx'

interface CreateUserInput {
  firstName: string
  lastName: string
  email: string
  password: string
  avatar?: string
  role?: 'ADMIN' | 'MODERATOR' | 'USER'
}

interface LoginInput {
  email: string
  password: string
}

interface UpdateProfileInput {
  firstName?: string
  lastName?: string
  email?: string
  avatar?: string
}

interface UpdateUserInput {
  firstName?: string
  lastName?: string
  email?: string
  avatar?: string
  role?: 'ADMIN' | 'MODERATOR' | 'USER'
}

interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

interface AdminChangePasswordInput {
  userId: string
  newPassword: string
}

interface Context {
  userId?: string
  clientId?: string
  userRole?: string
  userEmail?: string
  headers?: Headers
}

// Интерфейсы для каталога
interface CategoryInput {
  name: string
  slug?: string
  description?: string
  seoTitle?: string
  seoDescription?: string
  image?: string
  isHidden?: boolean
  includeSubcategoryProducts?: boolean
  parentId?: string
}

interface ProductInput {
  name: string
  slug?: string
  article?: string
  description?: string
  videoUrl?: string
  wholesalePrice?: number
  retailPrice?: number
  weight?: number
  dimensions?: string
  unit?: string
  isVisible?: boolean
  applyDiscounts?: boolean
  stock?: number
  categoryIds?: string[]
}

interface ProductImageInput {
  url: string
  alt?: string
  order?: number
}

interface CharacteristicInput {
  name: string
  value: string
}

interface ProductOptionInput {
  name: string
  type: 'SINGLE' | 'MULTIPLE'
  values: OptionValueInput[]
}

interface OptionInput {
  name: string
  type: 'SINGLE' | 'MULTIPLE'
  values: OptionValueInput[]
}

interface OptionValueInput {
  value: string
  price?: number
}

// Интерфейсы для клиентов
interface ClientInput {
  clientNumber?: string
  type: 'INDIVIDUAL' | 'LEGAL_ENTITY'
  name: string
  email?: string
  phone: string
  city?: string
  markup?: number
  isConfirmed?: boolean
  profileId?: string
  legalEntityType?: string
  inn?: string
  kpp?: string
  ogrn?: string
  okpo?: string
  legalAddress?: string
  actualAddress?: string
  bankAccount?: string
  bankName?: string
  bankBik?: string
  correspondentAccount?: string
}

interface ClientProfileInput {
  code?: string
  name: string
  description?: string
  baseMarkup: number
  autoSendInvoice?: boolean
  vinRequestModule?: boolean
  priceRangeMarkups?: ProfilePriceRangeMarkupInput[]
  orderDiscounts?: ProfileOrderDiscountInput[]
  supplierMarkups?: ProfileSupplierMarkupInput[]
  brandMarkups?: ProfileBrandMarkupInput[]
  categoryMarkups?: ProfileCategoryMarkupInput[]
  excludedBrands?: string[]
  excludedCategories?: string[]
  paymentTypes?: ProfilePaymentTypeInput[]
}

interface ProfilePriceRangeMarkupInput {
  priceFrom: number
  priceTo: number
  markupType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  markupValue: number
}

interface ProfileOrderDiscountInput {
  minOrderSum: number
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
}

interface ProfileSupplierMarkupInput {
  supplierName: string
  markupType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  markupValue: number
}

interface ProfileBrandMarkupInput {
  brandName: string
  markupType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  markupValue: number
}

interface ProfileCategoryMarkupInput {
  categoryName: string
  markupType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  markupValue: number
}

interface ProfilePaymentTypeInput {
  paymentType: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'ONLINE' | 'CREDIT'
  isEnabled: boolean
}

interface ClientVehicleInput {
  name: string
  vin?: string
  frame?: string
  licensePlate?: string
  brand?: string
  model?: string
  modification?: string
  year?: number
  mileage?: number
  comment?: string
}

interface ClientDeliveryAddressInput {
  name: string
  address: string
  deliveryType: 'COURIER' | 'PICKUP' | 'POST' | 'TRANSPORT'
  comment?: string
}

interface ClientContactInput {
  phone?: string
  email?: string
  comment?: string
}

interface ClientContractInput {
  contractNumber: string
  contractDate?: Date
  name: string
  ourLegalEntity?: string
  clientLegalEntity?: string
  balance?: number
  currency?: string
  isActive?: boolean
  isDefault?: boolean
  contractType?: string
  relationship?: string
  paymentDelay?: boolean
  creditLimit?: number
  delayDays?: number
  fileUrl?: string
}

interface ClientLegalEntityInput {
  shortName: string
  fullName?: string
  form?: string
  legalAddress?: string
  actualAddress?: string
  taxSystem?: string
  responsiblePhone?: string
  responsiblePosition?: string
  responsibleName?: string
  accountant?: string
  signatory?: string
  registrationReasonCode?: string
  ogrn?: string
  inn: string
  vatPercent?: number
}

interface ClientBankDetailsInput {
  name: string
  accountNumber: string
  bankName: string
  bik: string
  correspondentAccount: string
}

interface ClientDiscountInput {
  name: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  isActive?: boolean
  validFrom?: Date
  validTo?: Date
}

interface ClientStatusInput {
  name: string
  color?: string
  description?: string
}

interface DiscountInput {
  name: string
  type: 'DISCOUNT' | 'PROMOCODE'
  code?: string
  minOrderAmount?: number
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
  discountValue: number
  isActive?: boolean
  validFrom?: Date
  validTo?: Date
  profileIds?: string[]
}

interface ClientFilterInput {
  type?: 'INDIVIDUAL' | 'LEGAL_ENTITY'
  registeredFrom?: Date
  registeredTo?: Date
  unconfirmed?: boolean
  vehicleSearch?: string
  profileId?: string
}

// Интерфейсы для заказов и платежей
interface CreateOrderInput {
  clientId?: string
  clientEmail?: string
  clientPhone?: string
  clientName?: string
  items: OrderItemInput[]
  deliveryAddress?: string
  comment?: string
}

interface OrderItemInput {
  productId?: string
  externalId?: string
  name: string
  article?: string
  brand?: string
  price: number
  quantity: number
}

interface CreatePaymentInput {
  orderId: string
  returnUrl: string
  description?: string
}

// Утилиты
const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[а-я]/g, (char) => {
      const map: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      }
      return map[char] || char
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const getCategoryLevel = async (categoryId: string, level = 0): Promise<number> => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { parentId: true }
  })
  
  if (!category || !category.parentId) {
    return level
  }
  
  return getCategoryLevel(category.parentId, level + 1)
}

// Функция для расчета дней доставки из строки даты
const calculateDeliveryDays = (deliveryDateStr: string): number => {
  if (!deliveryDateStr) return 0;
  
  try {
    const deliveryDate = new Date(deliveryDateStr);
    const today = new Date();
    const diffTime = deliveryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  } catch (error) {
    return 0;
  }
};

// Функция для получения контекста из глобальной переменной (больше не используется)
function getContext(): Context {
  const context = (global as unknown as { __graphqlContext?: Context }).__graphqlContext || {}
  return context
}

export const resolvers = {
  DateTime: {
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: { value: string }) => new Date(ast.value),
  },

  Category: {
    level: async (parent: { id: string }) => {
      return await getCategoryLevel(parent.id)
    },
    children: async (parent: { id: string }) => {
      return await prisma.category.findMany({
        where: { parentId: parent.id },
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { products: true } }
        }
      })
    },
    products: async (parent: { id: string }) => {
      return await prisma.product.findMany({
        where: {
          categories: {
            some: { id: parent.id }
          }
        },
        include: {
          images: { orderBy: { order: 'asc' } },
          categories: true
        },
        orderBy: { name: 'asc' }
      })
    }
  },

  Product: {
    categories: async (parent: { id: string }) => {
      const product = await prisma.product.findUnique({
        where: { id: parent.id },
        include: { categories: true }
      })
      return product?.categories || []
    },
    images: async (parent: { id: string }) => {
      return await prisma.productImage.findMany({
        where: { productId: parent.id },
        orderBy: { order: 'asc' }
      })
    },
    options: async (parent: { id: string }) => {
      return await prisma.productOption.findMany({
        where: { productId: parent.id },
        include: {
          option: { include: { values: true } },
          optionValue: true
        }
      })
    },
    characteristics: async (parent: { id: string }) => {
      return await prisma.productCharacteristic.findMany({
        where: { productId: parent.id },
        include: { characteristic: true }
      })
    },
    relatedProducts: async (parent: { id: string }) => {
      const product = await prisma.product.findUnique({
        where: { id: parent.id },
        include: { relatedProducts: { include: { images: { orderBy: { order: 'asc' } } } } }
      })
      return product?.relatedProducts || []
    },
    accessoryProducts: async (parent: { id: string }) => {
      const product = await prisma.product.findUnique({
        where: { id: parent.id },
        include: { accessoryProducts: { include: { images: { orderBy: { order: 'asc' } } } } }
      })
      return product?.accessoryProducts || []
    }
  },

  Query: {
    users: async () => {
      try {
        return await prisma.user.findMany({
          orderBy: { createdAt: 'desc' }
        })
      } catch (error) {
        console.error('Ошибка получения пользователей:', error)
        throw new Error('Не удалось получить список пользователей')
      }
    },

    user: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.user.findUnique({
          where: { id }
        })
      } catch (error) {
        console.error('Ошибка получения пользователя:', error)
        throw new Error('Не удалось получить пользователя')
      }
    },

    hasUsers: async () => {
      try {
        const count = await prisma.user.count()
        return count > 0
      } catch (error) {
        console.error('Ошибка проверки пользователей:', error)
        throw new Error('Не удалось проверить наличие пользователей')
      }
    },

    me: async (_: unknown, __: unknown, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        return await prisma.user.findUnique({
          where: { id: context.userId }
        })
      } catch (error) {
        console.error('Ошибка получения профиля:', error)
        throw new Error('Не удалось получить профиль пользователя')
      }
    },

    auditLogs: async (_: unknown, { limit = 50, offset = 0 }: { limit?: number; offset?: number }, context: Context) => {
      try {
        if (!context.userId || context.userRole !== 'ADMIN') {
          throw new Error('Недостаточно прав для просмотра логов аудита')
        }

        return await prisma.auditLog.findMany({
          include: {
            user: true
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        })
      } catch (error) {
        console.error('Ошибка получения логов аудита:', error)
        throw new Error('Не удалось получить логи аудита')
      }
    },

    auditLogsCount: async (_: unknown, __: unknown, context: Context) => {
      try {
        if (!context.userId || context.userRole !== 'ADMIN') {
          throw new Error('Недостаточно прав для просмотра логов аудита')
        }

        return await prisma.auditLog.count()
      } catch (error) {
        console.error('Ошибка подсчета логов аудита:', error)
        throw new Error('Не удалось подсчитать логи аудита')
      }
    },

    // Каталог
    categories: async () => {
      try {
        return await prisma.category.findMany({
          orderBy: { name: 'asc' },
          include: {
            children: true,
            _count: { select: { products: true } }
          }
        })
      } catch (error) {
        console.error('Ошибка получения категорий:', error)
        throw new Error('Не удалось получить категории')
      }
    },

    category: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.category.findUnique({
          where: { id },
          include: {
            parent: true,
            children: true,
            products: {
              include: {
                images: { orderBy: { order: 'asc' } },
                categories: true
              }
            },
            _count: { select: { products: true } }
          }
        })
      } catch (error) {
        console.error('Ошибка получения категории:', error)
        throw new Error('Не удалось получить категорию')
      }
    },

    categoryBySlug: async (_: unknown, { slug }: { slug: string }) => {
      try {
        return await prisma.category.findUnique({
          where: { slug },
          include: {
            parent: true,
            children: true,
            products: {
              include: {
                images: { orderBy: { order: 'asc' } },
                categories: true
              }
            },
            _count: { select: { products: true } }
          }
        })
      } catch (error) {
        console.error('Ошибка получения категории по slug:', error)
        throw new Error('Не удалось получить категорию')
      }
    },

    products: async (_: unknown, { categoryId, search, limit = 50, offset = 0 }: { 
      categoryId?: string; search?: string; limit?: number; offset?: number 
    }) => {
      try {
        const where: Record<string, unknown> = {}
        
        if (categoryId) {
          where.categories = { some: { id: categoryId } }
        }
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { article: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }

        return await prisma.product.findMany({
          where,
          include: {
            images: { orderBy: { order: 'asc' } },
            categories: true,
            characteristics: { include: { characteristic: true } }
          },
          orderBy: { name: 'asc' },
          take: limit,
          skip: offset
        })
      } catch (error) {
        console.error('Ошибка получения товаров:', error)
        throw new Error('Не удалось получить товары')
      }
    },

    product: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.product.findUnique({
          where: { id },
          include: {
            categories: true,
            images: { orderBy: { order: 'asc' } },
            options: {
              include: {
                option: { include: { values: true } },
                optionValue: true
              }
            },
            characteristics: { include: { characteristic: true } },
            relatedProducts: { include: { images: { orderBy: { order: 'asc' } } } },
            accessoryProducts: { include: { images: { orderBy: { order: 'asc' } } } }
          }
        })
      } catch (error) {
        console.error('Ошибка получения товара:', error)
        throw new Error('Не удалось получить товар')
      }
    },

    productBySlug: async (_: unknown, { slug }: { slug: string }) => {
      try {
        return await prisma.product.findUnique({
          where: { slug },
          include: {
            categories: true,
            images: { orderBy: { order: 'asc' } },
            options: {
              include: {
                option: { include: { values: true } },
                optionValue: true
              }
            },
            characteristics: { include: { characteristic: true } },
            relatedProducts: { include: { images: { orderBy: { order: 'asc' } } } },
            accessoryProducts: { include: { images: { orderBy: { order: 'asc' } } } }
          }
        })
      } catch (error) {
        console.error('Ошибка получения товара по slug:', error)
        throw new Error('Не удалось получить товар')
      }
    },

    productHistory: async (_: unknown, { productId }: { productId: string }) => {
      try {
        return await prisma.productHistory.findMany({
          where: { productId },
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        })
      } catch (error) {
        console.error('Ошибка получения истории товара:', error)
        throw new Error('Не удалось получить историю товара')
      }
    },

    options: async () => {
      try {
        return await prisma.option.findMany({
          include: { values: true },
          orderBy: { name: 'asc' }
        })
      } catch (error) {
        console.error('Ошибка получения опций:', error)
        throw new Error('Не удалось получить опции')
      }
    },

    characteristics: async () => {
      try {
        return await prisma.characteristic.findMany({
          orderBy: { name: 'asc' }
        })
      } catch (error) {
        console.error('Ошибка получения характеристик:', error)
        throw new Error('Не удалось получить характеристики')
      }
    },

    // Клиенты
    clients: async (_: unknown, { 
      filter, search, limit = 50, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' 
    }: { 
      filter?: ClientFilterInput; search?: string; limit?: number; offset?: number; 
      sortBy?: string; sortOrder?: string 
    }) => {
      try {
        const where: Record<string, unknown> = {}
        
        if (filter) {
          if (filter.type) {
            where.type = filter.type
          }
          if (filter.registeredFrom || filter.registeredTo) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where.createdAt = {} as any
            if (filter.registeredFrom) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (where.createdAt as any).gte = filter.registeredFrom
            }
            if (filter.registeredTo) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (where.createdAt as any).lte = filter.registeredTo
            }
          }
          if (filter.unconfirmed) {
            where.isConfirmed = false
          }
          if (filter.profileId) {
            where.profileId = filter.profileId
          }
          if (filter.vehicleSearch) {
            where.vehicles = {
              some: {
                OR: [
                  { vin: { contains: filter.vehicleSearch, mode: 'insensitive' } },
                  { frame: { contains: filter.vehicleSearch, mode: 'insensitive' } },
                  { licensePlate: { contains: filter.vehicleSearch, mode: 'insensitive' } }
                ]
              }
            }
          }
        }
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { clientNumber: { contains: search, mode: 'insensitive' } }
          ]
        }

        const orderBy: Record<string, string> = {}
        orderBy[sortBy] = sortOrder

        return await prisma.client.findMany({
          where,
          include: {
            profile: true,
            vehicles: true,
            discounts: true
          },
          orderBy,
          take: limit,
          skip: offset
        })
      } catch (error) {
        console.error('Ошибка получения клиентов:', error)
        throw new Error('Не удалось получить клиентов')
      }
    },

    client: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.client.findUnique({
          where: { id },
          include: {
            profile: true,
            manager: true,
            vehicles: true,
            discounts: true,
            deliveryAddresses: true,
            contacts: true,
            contracts: true,
            legalEntities: {
              include: {
                bankDetails: true
              }
            },
            bankDetails: {
              include: {
                legalEntity: true
              }
            },
            balanceHistory: {
              include: {
                user: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        })
      } catch (error) {
        console.error('Ошибка получения клиента:', error)
        throw new Error('Не удалось получить клиента')
      }
    },

    clientsCount: async (_: unknown, { filter, search }: { filter?: ClientFilterInput; search?: string }) => {
      try {
        const where: Record<string, unknown> = {}
        
        if (filter) {
          if (filter.type) {
            where.type = filter.type
          }
          if (filter.registeredFrom || filter.registeredTo) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            where.createdAt = {} as any
            if (filter.registeredFrom) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (where.createdAt as any).gte = filter.registeredFrom
            }
            if (filter.registeredTo) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (where.createdAt as any).lte = filter.registeredTo
            }
          }
          if (filter.unconfirmed) {
            where.isConfirmed = false
          }
          if (filter.profileId) {
            where.profileId = filter.profileId
          }
          if (filter.vehicleSearch) {
            where.vehicles = {
              some: {
                OR: [
                  { vin: { contains: filter.vehicleSearch, mode: 'insensitive' } },
                  { frame: { contains: filter.vehicleSearch, mode: 'insensitive' } },
                  { licensePlate: { contains: filter.vehicleSearch, mode: 'insensitive' } }
                ]
              }
            }
          }
        }
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { clientNumber: { contains: search, mode: 'insensitive' } }
          ]
        }

        return await prisma.client.count({ where })
      } catch (error) {
        console.error('Ошибка подсчета клиентов:', error)
        throw new Error('Не удалось подсчитать клиентов')
      }
    },

    // Запросы для гаража клиентов
    userVehicles: async () => {
      try {
        const context = getContext()
        if (!context.clientId) {
          throw new Error('Клиент не авторизован')
        }

        return await prisma.clientVehicle.findMany({
          where: { clientId: context.clientId },
          orderBy: { createdAt: 'desc' }
        })
      } catch (error) {
        console.error('Ошибка получения автомобилей:', error)
        throw new Error('Не удалось получить автомобили')
      }
    },

    // Получение данных авторизованного клиента
    clientMe: async () => {
      try {
        const context = getContext()
        console.log('clientMe резолвер: контекст:', context)
        if (!context.clientId) {
          console.log('clientMe резолвер: clientId отсутствует')
          throw new Error('Клиент не авторизован')
        }

        console.log('clientMe резолвер: получаем данные для clientId:', context.clientId)
        const client = await prisma.client.findUnique({
          where: { id: context.clientId },
          include: {
            legalEntities: {
              include: {
                bankDetails: true
              }
            },
            profile: true,
            vehicles: true,
            deliveryAddresses: true,
            contacts: true,
            contracts: true,
            bankDetails: true,
            discounts: true
          }
        })
        console.log('clientMe резолвер: найден клиент:', client ? client.id : 'null')
        
        // Принудительно заменяем null bankDetails на пустые массивы
        if (client && client.legalEntities) {
          client.legalEntities = client.legalEntities.map(entity => ({
            ...entity,
            bankDetails: entity.bankDetails || []
          }))
        }
        
        return client
      } catch (error) {
        console.error('Ошибка получения данных клиента:', error)
        throw new Error('Не удалось получить данные клиента')
      }
    },

    vehicleSearchHistory: async () => {
      try {
        // Временная заглушка - возвращаем пустой массив
        // В будущем здесь будет реальная логика поиска истории
        return []
      } catch (error) {
        console.error('Ошибка получения истории поиска:', error)
        throw new Error('Не удалось получить историю поиска')
      }
    },

    searchVehicleByVin: async (_: unknown, { vin }: { vin: string }) => {
      try {
        // Временная заглушка - возвращаем объект с переданным VIN
        // В будущем здесь будет реальная логика поиска по VIN
        return {
          vin,
          brand: null,
          model: null,
          modification: null,
          year: null,
          bodyType: null,
          engine: null,
          transmission: null,
          drive: null,
          fuel: null
        }
      } catch (error) {
        console.error('Ошибка поиска по VIN:', error)
        throw new Error('Не удалось найти автомобиль по VIN')
      }
    },

    clientProfiles: async () => {
      try {
        return await prisma.clientProfile.findMany({
          orderBy: { name: 'asc' },
          include: {
            priceRangeMarkups: true,
            orderDiscounts: true,
            supplierMarkups: true,
            brandMarkups: true,
            categoryMarkups: true,
            excludedBrands: true,
            excludedCategories: true,
            paymentTypes: true,
            _count: { select: { clients: true } }
          }
        })
      } catch (error) {
        console.error('Ошибка получения профилей клиентов:', error)
        throw new Error('Не удалось получить профили клиентов')
      }
    },

    clientProfile: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.clientProfile.findUnique({
          where: { id },
          include: {
            clients: true,
            priceRangeMarkups: true,
            orderDiscounts: true,
            supplierMarkups: true,
            brandMarkups: true,
            categoryMarkups: true,
            excludedBrands: true,
            excludedCategories: true,
            paymentTypes: true,
            _count: { select: { clients: true } }
          }
        })
      } catch (error) {
        console.error('Ошибка получения профиля клиента:', error)
        throw new Error('Не удалось получить профиль клиента')
      }
    },

    clientStatuses: async () => {
      try {
        return await prisma.clientStatus.findMany({
          orderBy: { name: 'asc' }
        })
      } catch (error) {
        console.error('Ошибка получения статусов клиентов:', error)
        throw new Error('Не удалось получить статусы клиентов')
      }
    },

    clientStatus: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.clientStatus.findUnique({
          where: { id }
        })
      } catch (error) {
        console.error('Ошибка получения статуса клиента:', error)
        throw new Error('Не удалось получить статус клиента')
      }
    },

    // Скидки и промокоды
    discounts: async () => {
      try {
        return await prisma.discount.findMany({
          orderBy: { name: 'asc' },
          include: {
            profiles: {
              include: {
                profile: true
              }
            }
          }
        })
      } catch (error) {
        console.error('Ошибка получения скидок:', error)
        throw new Error('Не удалось получить скидки')
      }
    },

    discount: async (_: unknown, { id }: { id: string }) => {
      try {
        return await prisma.discount.findUnique({
          where: { id },
          include: {
            profiles: {
              include: {
                profile: true
              }
            }
          }
        })
      } catch (error) {
        console.error('Ошибка получения скидки:', error)
        throw new Error('Не удалось получить скидку')
      }
    },

    // Laximo интеграция
    laximoBrands: async () => {
      return await laximoService.getListCatalogs()
    },

    laximoCatalogInfo: async (_: unknown, { catalogCode }: { catalogCode: string }) => {
      try {
        console.log('🔍 Запрос информации о каталоге:', catalogCode)
        const result = await laximoService.getCatalogInfo(catalogCode)
        console.log('📋 Результат getCatalogInfo:', result ? 'найден' : 'не найден')
        return result
      } catch (error) {
        console.error('❌ Ошибка получения информации о каталоге:', error)
        return null
      }
    },

    laximoWizard2: async (_: unknown, { catalogCode, ssd }: { catalogCode: string; ssd?: string }) => {
      try {
        return await laximoService.getWizard2(catalogCode, ssd || '')
      } catch (error) {
        console.error('Ошибка получения параметров wizard:', error)
        return []
      }
    },

    laximoFindVehicle: async (_: unknown, { catalogCode, vin }: { catalogCode: string; vin: string }) => {
      try {
        // Если catalogCode пустой, делаем глобальный поиск
        if (!catalogCode || catalogCode.trim() === '') {
          console.log('🌍 Глобальный поиск автомобиля по VIN/Frame:', vin)
          return await laximoService.findVehicleGlobal(vin)
        }
        
        return await laximoService.findVehicle(catalogCode, vin)
      } catch (error) {
        console.error('Ошибка поиска автомобиля по VIN:', error)
        return []
      }
    },

    laximoFindVehicleByWizard: async (_: unknown, { catalogCode, ssd }: { catalogCode: string; ssd: string }) => {
      try {
        return await laximoService.findVehicleByWizard(catalogCode, ssd)
      } catch (error) {
        console.error('Ошибка поиска автомобиля по wizard:', error)
        return []
      }
    },

    laximoFindVehicleByPlate: async (_: unknown, { catalogCode, plateNumber }: { catalogCode: string; plateNumber: string }) => {
      try {
        return await laximoService.findVehicleByPlateNumber(catalogCode, plateNumber)
      } catch (error) {
        console.error('Ошибка поиска автомобиля по госномеру:', error)
        return []
      }
    },

    laximoFindVehicleByPlateGlobal: async (_: unknown, { plateNumber }: { plateNumber: string }) => {
      try {
        console.log('🔍 GraphQL Resolver - Глобальный поиск автомобиля по госномеру:', plateNumber)
        const result = await laximoService.findVehicleByPlateNumberGlobal(plateNumber)
        console.log('📋 Результат глобального поиска по госномеру:', result ? `найдено ${result.length} автомобилей` : 'результат пустой')
        return result
      } catch (error) {
        console.error('❌ Ошибка глобального поиска автомобиля по госномеру:', error)
        return []
      }
    },

    laximoFindPartReferences: async (_: unknown, { partNumber }: { partNumber: string }) => {
      try {
        return await laximoService.findPartReferences(partNumber)
      } catch (error) {
        console.error('Ошибка поиска каталогов по артикулу:', error)
        return []
      }
    },

    laximoFindApplicableVehicles: async (_: unknown, { catalogCode, partNumber }: { catalogCode: string; partNumber: string }) => {
      try {
        return await laximoService.findApplicableVehicles(catalogCode, partNumber)
      } catch (error) {
        console.error('Ошибка поиска автомобилей по артикулу:', error)
        return []
      }
    },

    laximoFindVehiclesByPartNumber: async (_: unknown, { partNumber }: { partNumber: string }) => {
      try {
        console.log('🔍 GraphQL Resolver - Комплексный поиск автомобилей по артикулу:', partNumber)
        const result = await laximoService.findVehiclesByPartNumber(partNumber)
        console.log('📋 Результат комплексного поиска:', result ? `найдено ${result.totalVehicles} автомобилей в ${result.catalogs.length} каталогах` : 'результат null')
        return result
      } catch (error) {
        console.error('❌ Ошибка комплексного поиска автомобилей по артикулу:', error)
        return {
          partNumber,
          catalogs: [],
          totalVehicles: 0
        }
      }
    },

    laximoVehicleInfo: async (_: unknown, { catalogCode, vehicleId, ssd, localized }: { catalogCode: string; vehicleId: string; ssd?: string; localized: boolean }) => {
      try {
        return await laximoService.getVehicleInfo(catalogCode, vehicleId, ssd, localized)
      } catch (error) {
        console.error('Ошибка получения информации об автомобиле:', error)
        return null
      }
    },

    laximoQuickGroups: async (_: unknown, { catalogCode, vehicleId, ssd }: { catalogCode: string; vehicleId: string; ssd?: string }) => {
      try {
        return await laximoService.getListQuickGroup(catalogCode, vehicleId, ssd)
      } catch (error) {
        console.error('Ошибка получения групп быстрого поиска:', error)
        return []
      }
    },

    laximoCategories: async (_: unknown, { catalogCode, vehicleId, ssd }: { catalogCode: string; vehicleId?: string; ssd?: string }) => {
      try {
        console.log('🔍 Запрос категорий каталога:', catalogCode, 'vehicleId:', vehicleId, 'ssd:', ssd ? `${ssd.substring(0, 30)}...` : 'отсутствует')
        return await laximoService.getListCategories(catalogCode, vehicleId, ssd)
      } catch (error) {
        console.error('Ошибка получения категорий каталога:', error)
        return []
      }
    },

    laximoUnits: async (_: unknown, { catalogCode, vehicleId, ssd, categoryId }: { catalogCode: string; vehicleId?: string; ssd?: string; categoryId?: string }) => {
      try {
        console.log('🔍 Запрос узлов каталога:', catalogCode, 'vehicleId:', vehicleId, 'categoryId:', categoryId)
        return await laximoService.getListUnits(catalogCode, vehicleId, ssd, categoryId)
      } catch (error) {
        console.error('Ошибка получения узлов каталога:', error)
        return []
      }
    },

    laximoQuickDetail: async (_: unknown, { catalogCode, vehicleId, quickGroupId, ssd }: { catalogCode: string; vehicleId: string; quickGroupId: string; ssd: string }) => {
      try {
        console.log('🔍 Запрос деталей группы быстрого поиска:', { 
          catalogCode, 
          vehicleId, 
          quickGroupId, 
          quickGroupIdType: typeof quickGroupId,
          quickGroupIdLength: quickGroupId?.length,
          ssd: ssd ? `${ssd.substring(0, 30)}...` : 'отсутствует'
        })
        
        // Валидация параметров
        if (!quickGroupId || quickGroupId.trim() === '') {
          console.error('❌ Пустой quickGroupId:', quickGroupId)
          throw new Error(`Пустой ID группы: "${quickGroupId}"`)
        }
        
        return await laximoService.getListQuickDetail(catalogCode, vehicleId, quickGroupId, ssd)
      } catch (error) {
        console.error('Ошибка получения деталей группы быстрого поиска:', error)
        throw error // Пробрасываем ошибку наверх
      }
    },

    laximoOEMSearch: async (_: unknown, { catalogCode, vehicleId, oemNumber, ssd }: { catalogCode: string; vehicleId: string; oemNumber: string; ssd: string }) => {
      try {
        console.log('🔍 Поиск детали по OEM номеру:', { catalogCode, vehicleId, oemNumber })
        return await laximoService.getOEMPartApplicability(catalogCode, vehicleId, oemNumber, ssd)
      } catch (err) {
        console.error('Ошибка поиска детали по OEM номеру:', err)
        return null
      }
    },

    laximoFulltextSearch: async (_: unknown, { catalogCode, vehicleId, searchQuery, ssd }: { catalogCode: string; vehicleId: string; searchQuery: string; ssd: string }) => {
      try {
        console.log('🔍 GraphQL Resolver - Поиск деталей по названию:', { catalogCode, vehicleId, searchQuery, ssd: ssd ? `${ssd.substring(0, 30)}...` : 'отсутствует' })
        
        // Сначала проверим поддержку полнотекстового поиска каталогом
        const catalogInfo = await laximoService.getCatalogInfo(catalogCode)
        if (catalogInfo) {
          const hasFulltextSearch = catalogInfo.features.some(f => f.name === 'fulltextsearch')
          console.log(`📋 Каталог ${catalogCode} поддерживает полнотекстовый поиск:`, hasFulltextSearch)
          
          if (!hasFulltextSearch) {
            console.log('⚠️ Каталог не поддерживает полнотекстовый поиск')
            return {
              searchQuery: searchQuery,
              details: []
            }
          }
        } else {
          console.log('⚠️ Не удалось получить информацию о каталоге')
        }
        
        const result = await laximoService.searchVehicleDetails(catalogCode, vehicleId, searchQuery, ssd)
        console.log('📋 Результат от LaximoService:', result ? `найдено ${result.details.length} деталей` : 'результат null')
        
        return result
      } catch (err) {
        console.error('❌ Ошибка в GraphQL resolver поиска деталей по названию:', err)
        return null
      }
    },

    laximoDocFindOEM: async (_: unknown, { oemNumber, brand, replacementTypes }: { oemNumber: string; brand?: string; replacementTypes?: string }) => {
      try {
        console.log('🔍 GraphQL Resolver - Doc FindOEM поиск по артикулу:', { oemNumber, brand, replacementTypes })
        
        const result = await laximoDocService.findOEM(oemNumber, brand, replacementTypes)
        console.log('📋 Результат от LaximoDocService:', result ? `найдено ${result.details.length} деталей` : 'результат null')
        
        return result
      } catch (err) {
        console.error('❌ Ошибка в GraphQL resolver Doc FindOEM:', err)
        return null
      }
    },

    // Резолверы для работы с деталями узлов
    laximoUnitInfo: async (_: unknown, { catalogCode, vehicleId, unitId, ssd }: { catalogCode: string; vehicleId: string; unitId: string; ssd: string }) => {
      try {
        console.log('🔍 GraphQL Resolver - получение информации об узле:', { catalogCode, vehicleId, unitId })
        
        const result = await laximoUnitService.getUnitInfo(catalogCode, vehicleId, unitId, ssd)
        console.log('📋 Результат от LaximoUnitService:', result ? `найден узел ${result.name}` : 'узел не найден')
        
        return result
      } catch (err) {
        console.error('❌ Ошибка в GraphQL resolver UnitInfo:', err)
        return null
      }
    },

    laximoUnitDetails: async (_: unknown, { catalogCode, vehicleId, unitId, ssd }: { catalogCode: string; vehicleId: string; unitId: string; ssd: string }) => {
      try {
        console.log('🔍 GraphQL Resolver - получение деталей узла:', { catalogCode, vehicleId, unitId })
        
        const result = await laximoUnitService.getUnitDetails(catalogCode, vehicleId, unitId, ssd)
        console.log('📋 Результат от LaximoUnitService:', result ? `найдено ${result.length} деталей` : 'детали не найдены')
        
        return result || []
      } catch (err) {
        console.error('❌ Ошибка в GraphQL resolver UnitDetails:', err)
        return []
      }
    },

    laximoUnitImageMap: async (_: unknown, { catalogCode, vehicleId, unitId, ssd }: { catalogCode: string; vehicleId: string; unitId: string; ssd: string }) => {
      try {
        console.log('🔍 GraphQL Resolver - получение карты изображений узла:', { catalogCode, vehicleId, unitId })
        
        const result = await laximoUnitService.getUnitImageMap(catalogCode, vehicleId, unitId, ssd)
        console.log('📋 Результат от LaximoUnitService:', result ? `найдена карта с ${result.coordinates.length} координатами` : 'карта не найдена')
        
        return result
      } catch (err) {
        console.error('❌ Ошибка в GraphQL resolver UnitImageMap:', err)
        return null
      }
    },

    // Поиск товаров и предложений
    searchProductOffers: async (_: unknown, { articleNumber, brand }: { articleNumber: string; brand: string }) => {
      try {
        console.log('🔍 GraphQL Resolver - поиск предложений для товара:', { articleNumber, brand })

        // 1. Поиск в нашей базе данных
        const internalProducts = await prisma.product.findMany({
          where: {
            article: {
              equals: articleNumber,
              mode: 'insensitive'
            }
          },
          include: {
            categories: true,
            images: { orderBy: { order: 'asc' } }
          }
        })

        console.log(`📦 Найдено ${internalProducts.length} товаров в нашей базе`)

        // 2. Поиск в AutoEuro
        let externalOffers: any[] = []
        try {
          console.log('🔍 GraphQL Resolver - начинаем поиск в AutoEuro:', { articleNumber, brand })
          
          const autoEuroResult = await autoEuroService.searchItems({
            code: articleNumber,
            brand: brand,
            with_crosses: false,
            with_offers: true
          })

          console.log('📊 GraphQL Resolver - результат AutoEuro:', {
            success: autoEuroResult.success,
            dataLength: autoEuroResult.data?.length || 0,
            error: autoEuroResult.error
          })

          if (autoEuroResult.success && autoEuroResult.data) {
            console.log('✅ GraphQL Resolver - обрабатываем данные AutoEuro, количество:', autoEuroResult.data.length)
            
            externalOffers = autoEuroResult.data.map(offer => ({
              offerKey: offer.offer_key,
              brand: offer.brand,
              code: offer.code,
              name: offer.name,
              price: parseFloat(offer.price.toString()),
              currency: offer.currency || 'RUB',
              deliveryTime: calculateDeliveryDays(offer.delivery_time || ''),
              deliveryTimeMax: calculateDeliveryDays(offer.delivery_time_max || ''),
              quantity: offer.amount || 0,
              warehouse: offer.warehouse_name || 'Внешний склад',
              supplier: 'AutoEuro',
              canPurchase: true
            }))
            
            console.log('🎯 GraphQL Resolver - создано внешних предложений:', externalOffers.length)
          } else {
            console.log('❌ GraphQL Resolver - AutoEuro не вернул данные:', autoEuroResult)
          }
        } catch (error) {
          console.error('❌ Ошибка поиска в AutoEuro:', error)
        }

        console.log(`🌐 Найдено ${externalOffers.length} предложений в AutoEuro`)
        console.log('📦 Первые 3 внешних предложения:', externalOffers.slice(0, 3))

        // 3. Поиск аналогов через Laximo
        const analogs: any[] = []
        try {
          const laximoResult = await laximoDocService.findOEM(articleNumber, brand)
          if (laximoResult && laximoResult.details) {
            for (const detail of laximoResult.details) {
              if (detail.replacements && detail.replacements.length > 0) {
                for (const replacement of detail.replacements) {
                  // Поиск каждого аналога в нашей базе и AutoEuro
                  const analogArticle = replacement.detail.formattedoem || replacement.detail.oem
                  const analogBrand = replacement.detail.manufacturer

                  // Поиск в нашей базе
                  const analogInternalProducts = await prisma.product.findMany({
                    where: {
                      article: {
                        equals: analogArticle,
                        mode: 'insensitive'
                      }
                    }
                  })

                  // Поиск в AutoEuro
                  let analogExternalOffers: any[] = []
                  try {
                    const analogAutoEuroResult = await autoEuroService.searchItems({
                      code: analogArticle,
                      brand: analogBrand,
                      with_crosses: false,
                      with_offers: true
                    })

                    if (analogAutoEuroResult.success && analogAutoEuroResult.data) {
                      analogExternalOffers = analogAutoEuroResult.data.map(offer => ({
                        offerKey: offer.offer_key,
                        brand: offer.brand,
                        code: offer.code,
                        name: offer.name,
                        price: parseFloat(offer.price.toString()),
                        currency: offer.currency || 'RUB',
                        deliveryTime: calculateDeliveryDays(offer.delivery_time || ''),
                        deliveryTimeMax: calculateDeliveryDays(offer.delivery_time_max || ''),
                        quantity: offer.amount || 0,
                        warehouse: offer.warehouse_name || 'Внешний склад',
                        supplier: 'AutoEuro',
                        canPurchase: true
                      }))
                    }
                  } catch (error) {
                    console.error(`❌ Ошибка поиска аналога ${analogArticle} в AutoEuro:`, error)
                  }

                  if (analogInternalProducts.length > 0 || analogExternalOffers.length > 0) {
                    analogs.push({
                      brand: analogBrand,
                      articleNumber: analogArticle,
                      name: replacement.detail.name,
                      type: replacement.type,
                      internalOffers: analogInternalProducts.map(product => ({
                        id: product.id,
                        productId: product.id,
                        price: product.retailPrice || 0,
                        quantity: product.stock || 0,
                        warehouse: 'Основной склад',
                        deliveryDays: 1,
                        available: (product.stock || 0) > 0,
                        rating: 4.8,
                        supplier: 'Protek'
                      })),
                      externalOffers: analogExternalOffers
                    })
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Ошибка поиска аналогов через Laximo:', error)
        }

        console.log(`🔄 Найдено ${analogs.length} аналогов`)

        // 4. Формируем внутренние предложения
        const internalOffers = internalProducts.map(product => ({
          id: product.id,
          productId: product.id,
          price: product.retailPrice || 0,
          quantity: product.stock || 0,
          warehouse: 'Основной склад',
          deliveryDays: 1,
          available: (product.stock || 0) > 0,
          rating: 4.8,
          supplier: 'Protek'
        }))

        // 5. Определяем название товара
        let productName = ''
        if (internalProducts.length > 0) {
          productName = internalProducts[0].name
        } else if (externalOffers.length > 0) {
          productName = externalOffers[0].name
        } else {
          productName = `${brand} ${articleNumber}`
        }

        const result = {
          articleNumber,
          brand,
          name: productName,
          internalOffers,
          externalOffers,
          analogs,
          hasInternalStock: internalOffers.some(offer => offer.available),
          totalOffers: internalOffers.length + externalOffers.length
        }

        console.log('✅ Результат поиска предложений:', {
          articleNumber,
          brand,
          internalOffers: result.internalOffers.length,
          externalOffers: result.externalOffers.length,
          analogs: result.analogs.length,
          hasInternalStock: result.hasInternalStock
        })

        console.log('🔍 Детали результата:')
        console.log('- Внутренние предложения:', result.internalOffers)
        console.log('- Внешние предложения:', result.externalOffers.slice(0, 3))
        console.log('- Аналоги:', result.analogs.length)

        return result
      } catch (error) {
        console.error('❌ Ошибка в GraphQL resolver searchProductOffers:', error)
        throw new Error('Не удалось найти предложения для товара')
      }
    },

    // Заказы и платежи
    orders: async (_: unknown, { clientId, status, limit = 50, offset = 0 }: { 
      clientId?: string; 
      status?: string; 
      limit?: number; 
      offset?: number 
    }, context: Context) => {
      try {
        const where: any = {}
        
        if (clientId) {
          where.clientId = clientId
        }
        
        if (status) {
          where.status = status
        }

        const orders = await prisma.order.findMany({
          where,
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            },
            payments: true
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        })

        return orders
      } catch (error) {
        console.error('Ошибка получения заказов:', error)
        throw new Error('Не удалось получить заказы')
      }
    },

    order: async (_: unknown, { id }: { id: string }) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id },
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            },
            payments: true
          }
        })

        return order
      } catch (error) {
        console.error('Ошибка получения заказа:', error)
        throw new Error('Не удалось получить заказ')
      }
    },

    orderByNumber: async (_: unknown, { orderNumber }: { orderNumber: string }) => {
      try {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            },
            payments: true
          }
        })

        return order
      } catch (error) {
        console.error('Ошибка получения заказа по номеру:', error)
        throw new Error('Не удалось получить заказ')
      }
    },

    payments: async (_: unknown, { orderId, status }: { orderId?: string; status?: string }) => {
      try {
        const where: any = {}
        
        if (orderId) {
          where.orderId = orderId
        }
        
        if (status) {
          where.status = status
        }

        const payments = await prisma.payment.findMany({
          where,
          include: {
            order: {
              include: {
                client: true,
                items: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        return payments
      } catch (error) {
        console.error('Ошибка получения платежей:', error)
        throw new Error('Не удалось получить платежи')
      }
    },

    payment: async (_: unknown, { id }: { id: string }) => {
      try {
        const payment = await prisma.payment.findUnique({
          where: { id },
          include: {
            order: {
              include: {
                client: true,
                items: true
              }
            }
          }
        })

        return payment
      } catch (error) {
        console.error('Ошибка получения платежа:', error)
        throw new Error('Не удалось получить платеж')
      }
    }
  },

  ClientProfile: {
    _count: (parent: { _count?: { clients: number } }) => {
      return parent._count || { clients: 0 }
    }
  },

  ClientLegalEntity: {
    bankDetails: async (parent: { id: string; bankDetails?: unknown[] }) => {
      // Если bankDetails не загружены, загружаем их из базы данных
      if (!parent.bankDetails) {
        const bankDetails = await prisma.clientBankDetails.findMany({
          where: { legalEntityId: parent.id }
        })
        return bankDetails || []
      }
      return parent.bankDetails || []
    }
  },

  Mutation: {
    createUser: async (_: unknown, { input }: { input: CreateUserInput }, context: Context) => {
      try {
        const { firstName, lastName, email, password, avatar, role } = input

        // Проверяем, существует ли пользователь с таким email
        const existingUser = await prisma.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          throw new Error('Пользователь с таким email уже существует')
        }

        // Хешируем пароль
        const hashedPassword = await hashPassword(password)

        // Создаем пользователя
        const user = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            avatar,
            role: role || 'USER'
          }
        })

        // Логируем действие
        if (context.userId && context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.USER_CREATE,
            details: `${firstName} ${lastName} (${email})`,
            ipAddress,
            userAgent
          })
        }

        return user
      } catch (error) {
        console.error('Ошибка создания пользователя:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать пользователя')
      }
    },

    login: async (_: unknown, { input }: { input: LoginInput }, context: Context) => {
      try {
        const { email, password } = input

        // Находим пользователя по email
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) {
          throw new Error('Неверный email или пароль')
        }

        // Проверяем пароль
        const isValidPassword = await comparePasswords(password, user.password)
        if (!isValidPassword) {
          throw new Error('Неверный email или пароль')
        }

        // Создаем JWT токен
        const token = createToken({
          userId: user.id,
          email: user.email,
          role: user.role
        })

        // Логируем вход
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: user.id,
            action: AuditAction.USER_LOGIN,
            ipAddress,
            userAgent
          })
        }

        return {
          token,
          user
        }
      } catch (error) {
        console.error('Ошибка входа:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось войти в систему')
      }
    },

    logout: async (_: unknown, __: unknown, context: Context) => {
      // Логируем выход
      if (context.userId && context.headers) {
        const { ipAddress, userAgent } = getClientInfo(context.headers)
        await createAuditLog({
          userId: context.userId,
          action: AuditAction.USER_LOGOUT,
          ipAddress,
          userAgent
        })
      }
      
      return true
    },

    updateProfile: async (_: unknown, { input }: { input: UpdateProfileInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Проверяем, если изменяется email, что он уникален
        if (input.email) {
          const existingUser = await prisma.user.findFirst({
            where: {
              email: input.email,
              id: { not: context.userId }
            }
          })

          if (existingUser) {
            throw new Error('Пользователь с таким email уже существует')
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id: context.userId },
          data: {
            ...(input.firstName && { firstName: input.firstName }),
            ...(input.lastName && { lastName: input.lastName }),
            ...(input.email && { email: input.email }),
            ...(input.avatar && { avatar: input.avatar }),
          }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PROFILE_UPDATE,
            ipAddress,
            userAgent
          })
        }

        return updatedUser
      } catch (error) {
        console.error('Ошибка обновления профиля:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить профиль')
      }
    },

    changePassword: async (_: unknown, { input }: { input: ChangePasswordInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const user = await prisma.user.findUnique({
          where: { id: context.userId }
        })

        if (!user) {
          throw new Error('Пользователь не найден')
        }

        // Проверяем текущий пароль
        const isValidPassword = await comparePasswords(input.currentPassword, user.password)
        if (!isValidPassword) {
          throw new Error('Неверный текущий пароль')
        }

        // Хешируем новый пароль
        const hashedNewPassword = await hashPassword(input.newPassword)

        // Обновляем пароль
        await prisma.user.update({
          where: { id: context.userId },
          data: { password: hashedNewPassword }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PASSWORD_CHANGE,
            details: 'Собственный пароль',
            ipAddress,
            userAgent
          })
        }

        return true
      } catch (error) {
        console.error('Ошибка смены пароля:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось сменить пароль')
      }
    },

    uploadAvatar: async (_: unknown, { file }: { file: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const updatedUser = await prisma.user.update({
          where: { id: context.userId },
          data: { avatar: file }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.AVATAR_UPLOAD,
            ipAddress,
            userAgent
          })
        }

        return updatedUser
      } catch (error) {
        console.error('Ошибка загрузки аватара:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось загрузить аватар')
      }
    },

    // Админские мутации для управления пользователями
    updateUser: async (_: unknown, { id, input }: { id: string; input: UpdateUserInput }, context: Context) => {
      try {
        if (!context.userId || context.userRole !== 'ADMIN') {
          throw new Error('Недостаточно прав для выполнения операции')
        }

        // Получаем данные пользователя до изменения
        const oldUser = await prisma.user.findUnique({ where: { id } })
        if (!oldUser) {
          throw new Error('Пользователь не найден')
        }

        // Проверяем, если изменяется email, что он уникален
        if (input.email) {
          const existingUser = await prisma.user.findFirst({
            where: {
              email: input.email,
              id: { not: id }
            }
          })

          if (existingUser) {
            throw new Error('Пользователь с таким email уже существует')
          }
        }

        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            ...(input.firstName && { firstName: input.firstName }),
            ...(input.lastName && { lastName: input.lastName }),
            ...(input.email && { email: input.email }),
            ...(input.avatar !== undefined && { avatar: input.avatar }),
            ...(input.role && { role: input.role }),
          }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.USER_UPDATE,
            details: `${oldUser.firstName} ${oldUser.lastName} (${oldUser.email})`,
            ipAddress,
            userAgent
          })
        }

        return updatedUser
      } catch (error) {
        console.error('Ошибка обновления пользователя:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить пользователя')
      }
    },

    deleteUser: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId || context.userRole !== 'ADMIN') {
          throw new Error('Недостаточно прав для выполнения операции')
        }

        // Нельзя удалить самого себя
        if (context.userId === id) {
          throw new Error('Нельзя удалить собственный аккаунт')
        }

        // Получаем данные пользователя перед удалением
        const userToDelete = await prisma.user.findUnique({ where: { id } })
        if (!userToDelete) {
          throw new Error('Пользователь не найден')
        }

        // Проверяем и обрабатываем связанные записи
        // 1. Обнуляем userId в client_balance_history (вместо удаления истории)
        await prisma.clientBalanceHistory.updateMany({
          where: { userId: id },
          data: { userId: null }
        })

        // 2. Обнуляем managerId в таблице clients (переназначаем менеджера)
        await prisma.client.updateMany({
          where: { managerId: id },
          data: { managerId: null }
        })

        // 3. Удаляем записи в audit_log связанные с пользователем
        await prisma.auditLog.deleteMany({
          where: { userId: id }
        })

        // Теперь можно безопасно удалить пользователя
        await prisma.user.delete({
          where: { id }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.USER_DELETE,
            details: `${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.email})`,
            ipAddress,
            userAgent
          })
        }

        return true
      } catch (error) {
        console.error('Ошибка удаления пользователя:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить пользователя')
      }
    },

    adminChangePassword: async (_: unknown, { input }: { input: AdminChangePasswordInput }, context: Context) => {
      try {
        if (!context.userId || context.userRole !== 'ADMIN') {
          throw new Error('Недостаточно прав для выполнения операции')
        }

        // Получаем данные пользователя
        const targetUser = await prisma.user.findUnique({ where: { id: input.userId } })
        if (!targetUser) {
          throw new Error('Пользователь не найден')
        }

        // Хешируем новый пароль
        const hashedNewPassword = await hashPassword(input.newPassword)

        // Обновляем пароль пользователя
        await prisma.user.update({
          where: { id: input.userId },
          data: { password: hashedNewPassword }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PASSWORD_CHANGE,
            details: `Пароль пользователя ${targetUser.firstName} ${targetUser.lastName} (${targetUser.email})`,
            ipAddress,
            userAgent
          })
        }

        return true
      } catch (error) {
        console.error('Ошибка смены пароля пользователя:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось сменить пароль пользователя')
      }
    },

    // Категории
    createCategory: async (_: unknown, { input }: { input: CategoryInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const slug = input.slug || createSlug(input.name)
        
        // Проверяем уникальность slug
        const existingCategory = await prisma.category.findUnique({
          where: { slug }
        })
        
        if (existingCategory) {
          throw new Error('Категория с таким адресом уже существует')
        }

        const category = await prisma.category.create({
          data: {
            ...input,
            slug
          },
          include: {
            parent: true,
            children: true
          }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.CATEGORY_CREATE,
            details: `Категория "${input.name}"`,
            ipAddress,
            userAgent
          })
        }

        return category
      } catch (error) {
        console.error('Ошибка создания категории:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать категорию')
      }
    },

    updateCategory: async (_: unknown, { id, input }: { id: string; input: CategoryInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const updateData: Record<string, unknown> = { ...input }
        
        if (input.name && !input.slug) {
          updateData.slug = createSlug(input.name)
        }

        const category = await prisma.category.update({
          where: { id },
          data: updateData,
          include: {
            parent: true,
            children: true
          }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.CATEGORY_UPDATE,
            details: `Категория "${category.name}"`,
            ipAddress,
            userAgent
          })
        }

        return category
      } catch (error) {
        console.error('Ошибка обновления категории:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить категорию')
      }
    },

    deleteCategory: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const category = await prisma.category.findUnique({
          where: { id },
          include: { children: true, products: true }
        })

        if (!category) {
          throw new Error('Категория не найдена')
        }

        if (category.children.length > 0) {
          throw new Error('Нельзя удалить категорию с подкатегориями')
        }

        if (category.products.length > 0) {
          throw new Error('Нельзя удалить категорию с товарами')
        }

        await prisma.category.delete({
          where: { id }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.CATEGORY_DELETE,
            details: `Категория "${category.name}"`,
            ipAddress,
            userAgent
          })
        }

        return true
      } catch (error) {
        console.error('Ошибка удаления категории:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить категорию')
      }
    },

    // Товары
    createProduct: async (_: unknown, { 
      input, 
      images = [], 
      characteristics = [],
      options = []
    }: { 
      input: ProductInput; 
      images?: ProductImageInput[]; 
      characteristics?: CharacteristicInput[];
      options?: ProductOptionInput[]
    }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const slug = input.slug || createSlug(input.name)
        
        // Проверяем уникальность slug
        const existingProduct = await prisma.product.findUnique({
          where: { slug }
        })
        
        if (existingProduct) {
          throw new Error('Товар с таким адресом уже существует')
        }

        // Проверяем уникальность артикула
        if (input.article) {
          const existingByArticle = await prisma.product.findUnique({
            where: { article: input.article }
          })
          
          if (existingByArticle) {
            throw new Error('Товар с таким артикулом уже существует')
          }
        }

        const { categoryIds, ...productData } = input

        // Создаем товар
        const product = await prisma.product.create({
          data: {
            ...productData,
            slug,
            categories: categoryIds ? {
              connect: categoryIds.map(id => ({ id }))
            } : undefined,
            images: {
              create: images.map((img, index) => ({
                ...img,
                order: img.order ?? index
              }))
            }
          }
        })

        // Добавляем характеристики
        for (const char of characteristics) {
          let characteristic = await prisma.characteristic.findUnique({
            where: { name: char.name }
          })

          if (!characteristic) {
            characteristic = await prisma.characteristic.create({
              data: { name: char.name }
            })
          }

          await prisma.productCharacteristic.create({
            data: {
              productId: product.id,
              characteristicId: characteristic.id,
              value: char.value
            }
          })
        }

        // Добавляем опции
        for (const optionInput of options) {
          // Создаём или находим опцию
          let option = await prisma.option.findUnique({
            where: { name: optionInput.name }
          })

          if (!option) {
            option = await prisma.option.create({
              data: {
                name: optionInput.name,
                type: optionInput.type
              }
            })
          }

          // Создаём значения опции и связываем с товаром
          for (const valueInput of optionInput.values) {
            // Создаём или находим значение опции
            let optionValue = await prisma.optionValue.findFirst({
              where: {
                optionId: option.id,
                value: valueInput.value
              }
            })

            if (!optionValue) {
              optionValue = await prisma.optionValue.create({
                data: {
                  optionId: option.id,
                  value: valueInput.value,
                  price: valueInput.price || 0
                }
              })
            }

            // Связываем товар с опцией и значением
            await prisma.productOption.create({
              data: {
                productId: product.id,
                optionId: option.id,
                optionValueId: optionValue.id
              }
            })
          }
        }

        // Получаем созданный товар со всеми связанными данными
        const createdProduct = await prisma.product.findUnique({
          where: { id: product.id },
          include: {
            categories: true,
            images: { orderBy: { order: 'asc' } },
            options: {
              include: {
                option: { include: { values: true } },
                optionValue: true
              }
            },
            characteristics: { include: { characteristic: true } },
            relatedProducts: { include: { images: { orderBy: { order: 'asc' } } } },
            accessoryProducts: { include: { images: { orderBy: { order: 'asc' } } } }
          }
        })

        // Создаем запись в истории товара
        if (context.userId) {
          await prisma.productHistory.create({
            data: {
              productId: product.id,
              action: 'CREATE',
              changes: JSON.stringify({
                name: input.name,
                article: input.article,
                description: input.description,
                wholesalePrice: input.wholesalePrice,
                retailPrice: input.retailPrice,
                stock: input.stock,
                isVisible: input.isVisible,
                categories: categoryIds,
                images: images.length,
                characteristics: characteristics.length,
                options: options.length
              }),
              userId: context.userId
            }
          })
        }

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PRODUCT_CREATE,
            details: `Товар "${input.name}"`,
            ipAddress,
            userAgent
          })
        }

        return createdProduct
      } catch (error) {
        console.error('Ошибка создания товара:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать товар')
      }
    },

    updateProduct: async (_: unknown, { 
      id, 
      input, 
      images = [], 
      characteristics = [],
      options = []
    }: { 
      id: string; 
      input: ProductInput; 
      images?: ProductImageInput[]; 
      characteristics?: CharacteristicInput[];
      options?: ProductOptionInput[]
    }, context: Context) => {
      try {
        console.log('updateProduct вызван с опциями:', JSON.stringify(options, null, 2))
        
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const { categoryIds, ...productData } = input

        // Удаляем старые изображения, характеристики и опции
        await prisma.productImage.deleteMany({
          where: { productId: id }
        })
        
        await prisma.productCharacteristic.deleteMany({
          where: { productId: id }
        })

        await prisma.productOption.deleteMany({
          where: { productId: id }
        })

        // Обновляем основные данные товара
        const finalData = { ...productData }
        if (input.name && !input.slug) {
          finalData.slug = createSlug(input.name)
        }
        
        await prisma.product.update({
          where: { id },
          data: {
            ...finalData,
            categories: categoryIds ? {
              set: categoryIds.map((catId: string) => ({ id: catId }))
            } : undefined,
            images: {
              create: images.map((img, index) => ({
                ...img,
                order: img.order ?? index
              }))
            }
          }
        })

        // Добавляем новые характеристики
        for (const char of characteristics) {
          let characteristic = await prisma.characteristic.findUnique({
            where: { name: char.name }
          })

          if (!characteristic) {
            characteristic = await prisma.characteristic.create({
              data: { name: char.name }
            })
          }

          await prisma.productCharacteristic.create({
            data: {
              productId: id,
              characteristicId: characteristic.id,
              value: char.value
            }
          })
        }

        // Добавляем новые опции
        console.log(`Обрабатываем ${options.length} опций для товара ${id}`)
        for (const optionInput of options) {
          console.log('Обрабатываем опцию:', optionInput)
          
          // Создаём или находим опцию
          let option = await prisma.option.findUnique({
            where: { name: optionInput.name }
          })

          if (!option) {
            console.log('Создаем новую опцию:', optionInput.name)
            option = await prisma.option.create({
              data: {
                name: optionInput.name,
                type: optionInput.type
              }
            })
          } else {
            console.log('Найдена существующая опция:', option.id)
          }

          // Создаём значения опции и связываем с товаром
          for (const valueInput of optionInput.values) {
            console.log('Обрабатываем значение опции:', valueInput)
            
            // Создаём или находим значение опции
            let optionValue = await prisma.optionValue.findFirst({
              where: {
                optionId: option.id,
                value: valueInput.value
              }
            })

            if (!optionValue) {
              console.log('Создаем новое значение опции')
              optionValue = await prisma.optionValue.create({
                data: {
                  optionId: option.id,
                  value: valueInput.value,
                  price: valueInput.price || 0
                }
              })
            } else {
              console.log('Найдено существующее значение опции:', optionValue.id)
            }

            // Связываем товар с опцией и значением
            console.log('Создаем связь товар-опция-значение')
            await prisma.productOption.create({
              data: {
                productId: id,
                optionId: option.id,
                optionValueId: optionValue.id
              }
            })
          }
        }
        console.log('Все опции обработаны')

        // Получаем обновленный товар со всеми связанными данными
        const product = await prisma.product.findUnique({
          where: { id },
          include: {
            categories: true,
            images: { orderBy: { order: 'asc' } },
            options: {
              include: {
                option: { include: { values: true } },
                optionValue: true
              }
            },
            characteristics: { include: { characteristic: true } },
            relatedProducts: { include: { images: { orderBy: { order: 'asc' } } } },
            accessoryProducts: { include: { images: { orderBy: { order: 'asc' } } } }
          }
        })

        // Создаем запись в истории товара
        if (context.userId && product) {
          await prisma.productHistory.create({
            data: {
              productId: id,
              action: 'UPDATE',
              changes: JSON.stringify({
                name: input.name,
                article: input.article,
                description: input.description,
                wholesalePrice: input.wholesalePrice,
                retailPrice: input.retailPrice,
                stock: input.stock,
                isVisible: input.isVisible,
                categories: categoryIds,
                images: images.length,
                characteristics: characteristics.length,
                options: options.length
              }),
              userId: context.userId
            }
          })
        }

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PRODUCT_UPDATE,
            details: `Товар "${product?.name}"`,
            ipAddress,
            userAgent
          })
        }

        return product
      } catch (error) {
        console.error('Ошибка обновления товара:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить товар')
      }
    },

    deleteProduct: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const product = await prisma.product.findUnique({
          where: { id }
        })

        if (!product) {
          throw new Error('Товар не найден')
        }

        await prisma.product.delete({
          where: { id }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PRODUCT_DELETE,
            details: `Товар "${product.name}"`,
            ipAddress,
            userAgent
          })
        }

        return true
      } catch (error) {
        console.error('Ошибка удаления товара:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить товар')
      }
    },

    updateProductVisibility: async (_: unknown, { id, isVisible }: { id: string; isVisible: boolean }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const product = await prisma.product.update({
          where: { id },
          data: { isVisible },
          include: {
            categories: true,
            images: { orderBy: { order: 'asc' } },
            options: {
              include: {
                option: { include: { values: true } },
                optionValue: true
              }
            },
            characteristics: { include: { characteristic: true } },
            relatedProducts: { include: { images: { orderBy: { order: 'asc' } } } },
            accessoryProducts: { include: { images: { orderBy: { order: 'asc' } } } }
          }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PRODUCT_UPDATE,
            details: `Изменена видимость товара "${product.name}" на ${isVisible ? 'видимый' : 'скрытый'}`,
            ipAddress,
            userAgent
          })
        }

        return product
      } catch (error) {
        console.error('Ошибка изменения видимости товара:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось изменить видимость товара')
      }
    },

    // Массовые операции с товарами
    deleteProducts: async (_: unknown, { ids }: { ids: string[] }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        if (!ids || ids.length === 0) {
          throw new Error('Не указаны товары для удаления')
        }

        // Получаем информацию о товарах для логирования
        const products = await prisma.product.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true }
        })

        // Удаляем товары
        const result = await prisma.product.deleteMany({
          where: { id: { in: ids } }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PRODUCT_DELETE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            details: `Массовое удаление товаров: ${products.map((p: any) => p.name).join(', ')} (${result.count} шт.)`,
            ipAddress,
            userAgent
          })
        }

        return { count: result.count }
      } catch (error) {
        console.error('Ошибка массового удаления товаров:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить товары')
      }
    },

    updateProductsVisibility: async (_: unknown, { ids, isVisible }: { ids: string[]; isVisible: boolean }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        if (!ids || ids.length === 0) {
          throw new Error('Не указаны товары для изменения видимости')
        }

        // Получаем информацию о товарах для логирования
        const products = await prisma.product.findMany({
          where: { id: { in: ids } },
          select: { id: true, name: true }
        })

        // Обновляем видимость товаров
        const result = await prisma.product.updateMany({
          where: { id: { in: ids } },
          data: { isVisible }
        })

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PRODUCT_UPDATE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            details: `Массовое изменение видимости товаров на ${isVisible ? 'видимые' : 'скрытые'}: ${products.map((p: any) => p.name).join(', ')} (${result.count} шт.)`,
            ipAddress,
            userAgent
          })
        }

        return { count: result.count }
      } catch (error) {
        console.error('Ошибка массового изменения видимости товаров:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось изменить видимость товаров')
      }
    },

    exportProducts: async (_: unknown, { categoryId, search }: { 
      categoryId?: string; search?: string; format?: string 
    }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Получаем товары с теми же фильтрами, что и в списке
        const where: Record<string, unknown> = {}
        
        if (categoryId) {
          where.categories = { some: { id: categoryId } }
        }
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { article: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
          ]
        }

        const products = await prisma.product.findMany({
          where,
          include: {
            categories: true,
            images: { orderBy: { order: 'asc' } },
            characteristics: { include: { characteristic: true } },
            options: {
              include: {
                option: true,
                optionValue: true
              }
            }
          },
          orderBy: { name: 'asc' }
        })

        // Создаем CSV данные
        const csvData = products.map(product => ({
          id: product.id,
          name: product.name,
          article: product.article || '',
          description: product.description || '',
          wholesalePrice: product.wholesalePrice || 0,
          retailPrice: product.retailPrice || 0,
          stock: product.stock,
          isVisible: product.isVisible ? 'Да' : 'Нет',
          weight: product.weight || 0,
          dimensions: product.dimensions || '',
          unit: product.unit,
          categories: product.categories.map(cat => cat.name).join(', '),
          images: product.images.map(img => img.url).join(', '),
          characteristics: product.characteristics.map(char => 
            `${char.characteristic.name}: ${char.value}`
          ).join('; '),
          options: product.options.map(opt => 
            `${opt.option.name}: ${opt.optionValue.value} (+${opt.optionValue.price}₽)`
          ).join('; '),
          videoUrl: product.videoUrl || '',
          createdAt: product.createdAt.toISOString(),
          updatedAt: product.updatedAt.toISOString()
        }))

        // Создаем CSV строку
        const createCsvWriter = csvWriter.createObjectCsvStringifier({
          header: [
            { id: 'id', title: 'ID' },
            { id: 'name', title: 'Название' },
            { id: 'article', title: 'Артикул' },
            { id: 'description', title: 'Описание' },
            { id: 'wholesalePrice', title: 'Цена опт' },
            { id: 'retailPrice', title: 'Цена розница' },
            { id: 'stock', title: 'Остаток' },
            { id: 'isVisible', title: 'Видимый' },
            { id: 'weight', title: 'Вес' },
            { id: 'dimensions', title: 'Размеры' },
            { id: 'unit', title: 'Единица' },
            { id: 'categories', title: 'Категории' },
            { id: 'images', title: 'Изображения' },
            { id: 'characteristics', title: 'Характеристики' },
            { id: 'options', title: 'Опции' },
            { id: 'videoUrl', title: 'Видео' },
            { id: 'createdAt', title: 'Создан' },
            { id: 'updatedAt', title: 'Обновлен' }
          ]
        })

        const csvString = createCsvWriter.getHeaderString() + createCsvWriter.stringifyRecords(csvData)
        const csvBuffer = Buffer.from(csvString, 'utf8')

        // Генерируем имя файла
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
        const filename = `products-export-${timestamp}.csv`
        const key = generateFileKey(filename, 'exports')

        // Загружаем в S3
        const uploadResult = await uploadBuffer(csvBuffer, key, 'text/csv')

        // Логируем действие
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PRODUCT_UPDATE, // Можно добавить новый тип EXPORT
            details: `Экспорт товаров: ${products.length} шт. (${categoryId ? 'категория' : 'все'})`,
            ipAddress,
            userAgent
          })
        }

        return {
          url: uploadResult.url,
          filename,
          count: products.length
        }
      } catch (error) {
        console.error('Ошибка экспорта товаров:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось экспортировать товары')
      }
    },

    importProducts: async (_: unknown, { input }: { 
      input: { file: string; categoryId?: string; replaceExisting?: boolean } 
    }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Декодируем base64 файл
        console.log('Начало импорта товаров, пользователь:', context.userId)
        const fileData = Buffer.from(input.file, 'base64')
        console.log('Размер файла:', fileData.length, 'байт')
        
        let headers: string[] = []
        let dataRows: string[][] = []
        
        // Определяем тип файла по содержимому и размеру
        const hasExcelSignature = (fileData[0] === 0x50 && fileData[1] === 0x4B) || // PK (Excel/ZIP signature)
                                 (fileData[0] === 0xD0 && fileData[1] === 0xCF) // OLE signature (старые Excel файлы)
        
        // Дополнительно проверяем размер файла (Excel файлы обычно больше 1KB)
        const isExcel = hasExcelSignature && fileData.length > 1024
        
        if (isExcel) {
          try {
            // Парсим Excel файл
            console.log('Парсим Excel файл, размер:', fileData.length, 'байт')
            const workbook = XLSX.read(fileData, { type: 'buffer' })
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
              throw new Error('Excel файл не содержит листов с данными')
            }
            
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]
            
            console.log('Обработано строк из Excel:', jsonData.length)
            
            if (jsonData.length < 2) {
              throw new Error('Файл должен содержать заголовки и хотя бы одну строку данных')
            }
            
            headers = jsonData[0].map(h => String(h || '').trim())
            dataRows = jsonData.slice(1).filter(row => row.some(cell => String(cell || '').trim()))
            
            console.log('Заголовки:', headers)
            console.log('Строк данных:', dataRows.length)
          } catch (excelError) {
            console.error('Ошибка парсинга Excel файла:', excelError)
            throw new Error('Не удалось прочитать Excel файл. Убедитесь, что файл не поврежден.')
          }
        } else {
          try {
            // Парсим как CSV файл
            console.log('Парсим как CSV файл, размер:', fileData.length, 'байт')
            const fileContent = fileData.toString('utf-8')
            const lines = fileContent.split('\n').filter(line => line.trim())
            
            console.log('Строк в CSV:', lines.length)
            
            if (lines.length < 2) {
              throw new Error('Файл должен содержать заголовки и хотя бы одну строку данных')
            }

            headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
            dataRows = lines.slice(1).map(line => 
              line.split(',').map(v => v.replace(/"/g, '').trim())
            )
            
            console.log('Заголовки CSV:', headers)
            console.log('Строк данных CSV:', dataRows.length)
          } catch (csvError) {
            console.error('Ошибка парсинга CSV файла:', csvError)
            throw new Error('Не удалось прочитать файл. Поддерживаются только форматы .xlsx и .csv')
          }
        }

        const result = {
          success: 0,
          errors: [] as string[],
          total: dataRows.length,
          warnings: [] as string[]
        }

        // Обрабатываем каждую строку
        for (let i = 0; i < dataRows.length; i++) {
          const lineNumber = i + 2
          
          try {
            const values = dataRows[i].map(v => String(v || '').trim())
            
            // Если строка содержит меньше колонок, дополняем пустыми значениями
            // Если больше - обрезаем до нужного количества
            while (values.length < headers.length) {
              values.push('')
            }
            if (values.length > headers.length) {
              values.splice(headers.length)
            }

            // Создаем объект из заголовков и значений
            const rowData: Record<string, string> = {}
            headers.forEach((header, index) => {
              rowData[header] = values[index]
            })

            // Валидация обязательных полей
            const name = rowData['Название'] || rowData['Наименование'] || rowData['name'] || ''
            if (!name) {
              result.errors.push(`Строка ${lineNumber}: отсутствует название товара`)
              continue
            }

            // Проверяем существование товара по артикулу
            const article = rowData['Артикул'] || rowData['article'] || ''
            let existingProduct: any = null
            
            if (article) {
              existingProduct = await prisma.product.findFirst({
                where: { article }
              })
            }

            // Если товар существует и не включен режим замещения
            if (existingProduct && !input.replaceExisting) {
              result.warnings.push(`Строка ${lineNumber}: товар с артикулом "${article}" уже существует`)
              continue
            }

            // Подготовка данных для создания/обновления товара
            const manufacturer = rowData['Производитель'] || rowData['manufacturer'] || ''
            const description = rowData['Описание'] || rowData['description'] || 
              (manufacturer ? `Производитель: ${manufacturer}` : undefined)
            
            const productData = {
              name: name,
              article: article || undefined,
              description: description,
              wholesalePrice: parseFloat(rowData['Цена опт'] || rowData['wholesalePrice'] || rowData['Цена АвтоЕвро ООО НДС'] || '0') || undefined,
              retailPrice: parseFloat(rowData['Цена розница'] || rowData['retailPrice'] || rowData['Цена АвтоЕвро ООО НДС'] || '0') || undefined,
              stock: parseInt(rowData['Остаток'] || rowData['Доступно'] || rowData['stock'] || '0') || 0,
              unit: rowData['Единица'] || rowData['unit'] || 'шт',
              weight: parseFloat(rowData['Вес'] || rowData['weight'] || '0') || undefined,
              dimensions: rowData['Размеры'] || rowData['dimensions'] || undefined,
              isVisible: true
            }

            // Генерируем slug
            const slug = createSlug(productData.name)

            if (existingProduct && input.replaceExisting) {
              // Обновляем существующий товар
              await prisma.product.update({
                where: { id: existingProduct.id },
                data: {
                  ...productData,
                  slug,
                  updatedAt: new Date()
                }
              })
            } else {
              // Создаем новый товар
              const createData: any = {
                ...productData,
                slug
              }

              // Добавляем категорию если указана
              if (input.categoryId) {
                createData.categories = {
                  connect: [{ id: input.categoryId }]
                }
              }

              await prisma.product.create({
                data: createData
              })
            }

            result.success++
          } catch (error) {
            console.error(`Ошибка обработки строки ${lineNumber}:`, error)
            result.errors.push(`Строка ${lineNumber}: ошибка создания товара`)
          }
        }

        // Логируем действие
        console.log('Результат импорта:', {
          total: result.total,
          success: result.success,
          errors: result.errors.length,
          warnings: result.warnings.length
        })
        
        if (context.headers) {
          const { ipAddress, userAgent } = getClientInfo(context.headers)
          await createAuditLog({
            userId: context.userId,
            action: AuditAction.PRODUCT_UPDATE,
            details: `Импорт товаров: ${result.success} успешно, ${result.errors.length} ошибок`,
            ipAddress,
            userAgent
          })
        }

        return result
      } catch (error) {
        console.error('Ошибка импорта товаров:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось импортировать товары')
      }
    },

    // Опции
    createOption: async (_: unknown, { input }: { input: OptionInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const option = await prisma.option.create({
          data: {
            name: input.name,
            type: input.type,
            values: {
              create: input.values.map(value => ({
                value: value.value,
                price: value.price || 0
              }))
            }
          },
          include: { values: true }
        })

        return option
      } catch (error) {
        console.error('Ошибка создания опции:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать опцию')
      }
    },

    updateOption: async (_: unknown, { id, input }: { id: string; input: OptionInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Удаляем старые значения
        await prisma.optionValue.deleteMany({
          where: { optionId: id }
        })

        const option = await prisma.option.update({
          where: { id },
          data: {
            name: input.name,
            type: input.type,
            values: {
              create: input.values.map(value => ({
                value: value.value,
                price: value.price || 0
              }))
            }
          },
          include: { values: true }
        })

        return option
      } catch (error) {
        console.error('Ошибка обновления опции:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить опцию')
      }
    },

    deleteOption: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.option.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления опции:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить опцию')
      }
    },

    // Клиенты
    createClient: async (_: unknown, { input, vehicles = [], discounts = [] }: { 
      input: ClientInput; vehicles?: ClientVehicleInput[]; discounts?: ClientDiscountInput[] 
    }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Генерируем номер клиента, если не указан
        let clientNumber = input.clientNumber
        if (!clientNumber) {
          const lastClient = await prisma.client.findFirst({
            orderBy: { clientNumber: 'desc' }
          })
          const lastNumber = lastClient ? parseInt(lastClient.clientNumber) : 100000
          clientNumber = (lastNumber + 1).toString()
        }

        const client = await prisma.client.create({
          data: {
            clientNumber,
            type: input.type,
            name: input.name,
            email: input.email,
            phone: input.phone,
            city: input.city,
            markup: input.markup,
            isConfirmed: input.isConfirmed ?? false,
            profileId: input.profileId,
            legalEntityType: input.legalEntityType,
            inn: input.inn,
            kpp: input.kpp,
            ogrn: input.ogrn,
            okpo: input.okpo,
            legalAddress: input.legalAddress,
            actualAddress: input.actualAddress,
            bankAccount: input.bankAccount,
            bankName: input.bankName,
            bankBik: input.bankBik,
            correspondentAccount: input.correspondentAccount,
            vehicles: {
              create: vehicles
            },
            discounts: {
              create: discounts
            }
          },
          include: {
            profile: true,
            vehicles: true,
            discounts: true
          }
        })

        return client
      } catch (error) {
        console.error('Ошибка создания клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать клиента')
      }
    },

    updateClient: async (_: unknown, { id, input, vehicles = [], discounts = [] }: { 
      id: string; input: ClientInput; vehicles?: ClientVehicleInput[]; discounts?: ClientDiscountInput[] 
    }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Удаляем старые связанные данные
        await prisma.clientVehicle.deleteMany({ where: { clientId: id } })
        await prisma.clientDiscount.deleteMany({ where: { clientId: id } })

        const client = await prisma.client.update({
          where: { id },
          data: {
            type: input.type,
            name: input.name,
            email: input.email,
            phone: input.phone,
            city: input.city,
            markup: input.markup,
            isConfirmed: input.isConfirmed,
            profileId: input.profileId,
            legalEntityType: input.legalEntityType,
            inn: input.inn,
            kpp: input.kpp,
            ogrn: input.ogrn,
            okpo: input.okpo,
            legalAddress: input.legalAddress,
            actualAddress: input.actualAddress,
            bankAccount: input.bankAccount,
            bankName: input.bankName,
            bankBik: input.bankBik,
            correspondentAccount: input.correspondentAccount,
            vehicles: {
              create: vehicles
            },
            discounts: {
              create: discounts
            }
          },
          include: {
            profile: true,
            vehicles: true,
            discounts: true
          }
        })

        return client
      } catch (error) {
        console.error('Ошибка обновления клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить клиента')
      }
    },

    deleteClient: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.client.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить клиента')
      }
    },

    confirmClient: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const client = await prisma.client.update({
          where: { id },
          data: { isConfirmed: true },
          include: {
            profile: true,
            vehicles: true,
            discounts: true
          }
        })

        return client
      } catch (error) {
        console.error('Ошибка подтверждения клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось подтвердить клиента')
      }
    },

    exportClients: async (_: unknown, { filter, search }: { 
      filter?: ClientFilterInput; search?: string 
    }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const where: Record<string, unknown> = {}
        
        if (filter) {
          if (filter.type) {
            where.type = filter.type
          }
          if (filter.registeredFrom || filter.registeredTo) {
            where.createdAt = {}
            if (filter.registeredFrom) {
              (where.createdAt as Record<string, unknown>).gte = filter.registeredFrom
            }
            if (filter.registeredTo) {
              (where.createdAt as Record<string, unknown>).lte = filter.registeredTo
            }
          }
          if (filter.unconfirmed) {
            where.isConfirmed = false
          }
          if (filter.profileId) {
            where.profileId = filter.profileId
          }
        }
        
        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { clientNumber: { contains: search, mode: 'insensitive' } }
          ]
        }

        const clients = await prisma.client.findMany({
          where,
          include: {
            profile: true,
            vehicles: true,
            discounts: true
          },
          orderBy: { createdAt: 'desc' }
        })

        // Создаем CSV данные
        const csvData = clients.map(client => ({
          id: client.id,
          clientNumber: client.clientNumber,
          type: client.type === 'INDIVIDUAL' ? 'Физ. лицо' : 'Юр. лицо',
          name: client.name,
          email: client.email || '',
          phone: client.phone,
          city: client.city || '',
          markup: client.markup || 0,
          isConfirmed: client.isConfirmed ? 'Да' : 'Нет',
          profile: client.profile?.name || '',
          legalEntityType: client.legalEntityType || '',
          inn: client.inn || '',
          kpp: client.kpp || '',
          ogrn: client.ogrn || '',
          okpo: client.okpo || '',
          legalAddress: client.legalAddress || '',
          actualAddress: client.actualAddress || '',
          bankAccount: client.bankAccount || '',
          bankName: client.bankName || '',
          bankBik: client.bankBik || '',
          correspondentAccount: client.correspondentAccount || '',
          vehicles: client.vehicles.map(v => 
            `${v.brand || ''} ${v.model || ''} (${v.licensePlate || v.vin || v.frame || ''})`
          ).join('; '),
          createdAt: client.createdAt.toISOString()
        }))

        // Создаем CSV строку
        const createCsvWriter = csvWriter.createObjectCsvStringifier({
          header: [
            { id: 'clientNumber', title: 'Номер клиента' },
            { id: 'type', title: 'Тип' },
            { id: 'name', title: 'Имя' },
            { id: 'email', title: 'Email' },
            { id: 'phone', title: 'Телефон' },
            { id: 'city', title: 'Город' },
            { id: 'markup', title: 'Наценка' },
            { id: 'isConfirmed', title: 'Подтвержден' },
            { id: 'profile', title: 'Профиль' },
            { id: 'legalEntityType', title: 'Тип юр. лица' },
            { id: 'inn', title: 'ИНН' },
            { id: 'kpp', title: 'КПП' },
            { id: 'ogrn', title: 'ОГРН' },
            { id: 'okpo', title: 'ОКПО' },
            { id: 'legalAddress', title: 'Юридический адрес' },
            { id: 'actualAddress', title: 'Фактический адрес' },
            { id: 'bankAccount', title: 'Расчетный счет' },
            { id: 'bankName', title: 'Банк' },
            { id: 'bankBik', title: 'БИК' },
            { id: 'correspondentAccount', title: 'Корр. счет' },
            { id: 'vehicles', title: 'Автомобили' },
            { id: 'createdAt', title: 'Дата регистрации' }
          ]
        })

        const csvString = createCsvWriter.getHeaderString() + createCsvWriter.stringifyRecords(csvData)
        const csvBuffer = Buffer.from(csvString, 'utf8')

        // Генерируем имя файла
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
        const filename = `clients-export-${timestamp}.csv`
        const key = generateFileKey(filename, 'exports')

        // Загружаем в S3
        const uploadResult = await uploadBuffer(csvBuffer, key, 'text/csv')

        return {
          url: uploadResult.url,
          filename,
          count: clients.length
        }
      } catch (error) {
        console.error('Ошибка экспорта клиентов:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось экспортировать клиентов')
      }
    },

    // Профили клиентов
    createClientProfile: async (_: unknown, { input }: { input: ClientProfileInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Генерируем код профиля, если не указан
        let code = input.code
        if (!code) {
          const lastProfile = await prisma.clientProfile.findFirst({
            orderBy: { code: 'desc' }
          })
          const lastNumber = lastProfile ? parseInt(lastProfile.code) : 1000000
          code = (lastNumber + 1).toString()
        }

        const profile = await prisma.clientProfile.create({
          data: {
            code,
            name: input.name,
            description: input.description,
            baseMarkup: input.baseMarkup,
            autoSendInvoice: input.autoSendInvoice ?? true,
            vinRequestModule: input.vinRequestModule ?? false,
            priceRangeMarkups: {
              create: input.priceRangeMarkups || []
            },
            orderDiscounts: {
              create: input.orderDiscounts || []
            },
            supplierMarkups: {
              create: input.supplierMarkups || []
            },
            brandMarkups: {
              create: input.brandMarkups || []
            },
            categoryMarkups: {
              create: input.categoryMarkups || []
            },
            excludedBrands: {
              create: (input.excludedBrands || []).map(brandName => ({ brandName }))
            },
            excludedCategories: {
              create: (input.excludedCategories || []).map(categoryName => ({ categoryName }))
            },
            paymentTypes: {
              create: input.paymentTypes || []
            }
          },
          include: {
            priceRangeMarkups: true,
            orderDiscounts: true,
            supplierMarkups: true,
            brandMarkups: true,
            categoryMarkups: true,
            excludedBrands: true,
            excludedCategories: true,
            paymentTypes: true
          }
        })

        return profile
      } catch (error) {
        console.error('Ошибка создания профиля клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать профиль клиента')
      }
    },

    updateClientProfile: async (_: unknown, { id, input }: { id: string; input: ClientProfileInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Удаляем старые связанные данные
        await prisma.profilePriceRangeMarkup.deleteMany({ where: { profileId: id } })
        await prisma.profileOrderDiscount.deleteMany({ where: { profileId: id } })
        await prisma.profileSupplierMarkup.deleteMany({ where: { profileId: id } })
        await prisma.profileBrandMarkup.deleteMany({ where: { profileId: id } })
        await prisma.profileCategoryMarkup.deleteMany({ where: { profileId: id } })
        await prisma.profileExcludedBrand.deleteMany({ where: { profileId: id } })
        await prisma.profileExcludedCategory.deleteMany({ where: { profileId: id } })
        await prisma.profilePaymentType.deleteMany({ where: { profileId: id } })

        const profile = await prisma.clientProfile.update({
          where: { id },
          data: {
            name: input.name,
            description: input.description,
            baseMarkup: input.baseMarkup,
            autoSendInvoice: input.autoSendInvoice,
            vinRequestModule: input.vinRequestModule,
            priceRangeMarkups: {
              create: input.priceRangeMarkups || []
            },
            orderDiscounts: {
              create: input.orderDiscounts || []
            },
            supplierMarkups: {
              create: input.supplierMarkups || []
            },
            brandMarkups: {
              create: input.brandMarkups || []
            },
            categoryMarkups: {
              create: input.categoryMarkups || []
            },
            excludedBrands: {
              create: (input.excludedBrands || []).map(brandName => ({ brandName }))
            },
            excludedCategories: {
              create: (input.excludedCategories || []).map(categoryName => ({ categoryName }))
            },
            paymentTypes: {
              create: input.paymentTypes || []
            }
          },
          include: {
            priceRangeMarkups: true,
            orderDiscounts: true,
            supplierMarkups: true,
            brandMarkups: true,
            categoryMarkups: true,
            excludedBrands: true,
            excludedCategories: true,
            paymentTypes: true
          }
        })

        return profile
      } catch (error) {
        console.error('Ошибка обновления профиля клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить профиль клиента')
      }
    },

    deleteClientProfile: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.clientProfile.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления профиля клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить профиль клиента')
      }
    },

    // Статусы клиентов
    createClientStatus: async (_: unknown, { input }: { input: ClientStatusInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const status = await prisma.clientStatus.create({
          data: {
            name: input.name,
            color: input.color || '#6B7280',
            description: input.description
          }
        })

        return status
      } catch (error) {
        console.error('Ошибка создания статуса клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать статус клиента')
      }
    },

    updateClientStatus: async (_: unknown, { id, input }: { id: string; input: ClientStatusInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const status = await prisma.clientStatus.update({
          where: { id },
          data: {
            name: input.name,
            color: input.color,
            description: input.description
          }
        })

        return status
      } catch (error) {
        console.error('Ошибка обновления статуса клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить статус клиента')
      }
    },

    deleteClientStatus: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.clientStatus.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления статуса клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить статус клиента')
      }
    },

    // Скидки и промокоды
    createDiscount: async (_: unknown, { input }: { input: DiscountInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const discount = await prisma.discount.create({
          data: {
            name: input.name,
            type: input.type,
            code: input.code,
            minOrderAmount: input.minOrderAmount || 0,
            discountType: input.discountType,
            discountValue: input.discountValue,
            isActive: input.isActive ?? true,
            validFrom: input.validFrom,
            validTo: input.validTo,
            profiles: {
              create: (input.profileIds || []).map(profileId => ({ profileId }))
            }
          },
          include: {
            profiles: {
              include: {
                profile: true
              }
            }
          }
        })

        return discount
      } catch (error) {
        console.error('Ошибка создания скидки:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать скидку')
      }
    },

    updateDiscount: async (_: unknown, { id, input }: { id: string; input: DiscountInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        // Удаляем старые связи с профилями
        await prisma.discountProfile.deleteMany({ where: { discountId: id } })

        const discount = await prisma.discount.update({
          where: { id },
          data: {
            name: input.name,
            type: input.type,
            code: input.code,
            minOrderAmount: input.minOrderAmount,
            discountType: input.discountType,
            discountValue: input.discountValue,
            isActive: input.isActive,
            validFrom: input.validFrom,
            validTo: input.validTo,
            profiles: {
              create: (input.profileIds || []).map(profileId => ({ profileId }))
            }
          },
          include: {
            profiles: {
              include: {
                profile: true
              }
            }
          }
        })

        return discount
      } catch (error) {
        console.error('Ошибка обновления скидки:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить скидку')
      }
    },

    deleteDiscount: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.discount.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления скидки:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить скидку')
      }
    },

    // Обновление баланса клиента
    updateClientBalance: async (_: unknown, { id, newBalance, comment }: { id: string; newBalance: number; comment?: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const client = await prisma.client.findUnique({ where: { id } })
        if (!client) {
          throw new Error('Клиент не найден')
        }

        // Создаем запись в истории изменений баланса
        await prisma.clientBalanceHistory.create({
          data: {
            clientId: id,
            userId: context.userId,
            oldValue: client.balance,
            newValue: newBalance,
            comment
          }
        })

        // Обновляем баланс клиента
        const updatedClient = await prisma.client.update({
          where: { id },
          data: { balance: newBalance },
          include: {
            profile: true,
            manager: true,
            vehicles: true,
            discounts: true,
            deliveryAddresses: true,
            contacts: true,
            contracts: true,
            legalEntities: {
              include: {
                bankDetails: true
              }
            },
            bankDetails: {
              include: {
                legalEntity: true
              }
            },
            balanceHistory: {
              include: {
                user: true
              },
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        })

        return updatedClient
      } catch (error) {
        console.error('Ошибка обновления баланса клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить баланс клиента')
      }
    },

    // Транспорт клиента
    createClientVehicle: async (_: unknown, { clientId, input }: { clientId: string; input: ClientVehicleInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const vehicle = await prisma.clientVehicle.create({
          data: {
            clientId,
            name: input.name,
            vin: input.vin,
            frame: input.frame,
            licensePlate: input.licensePlate,
            brand: input.brand,
            model: input.model,
            modification: input.modification,
            year: input.year,
            mileage: input.mileage,
            comment: input.comment
          }
        })

        return vehicle
      } catch (error) {
        console.error('Ошибка создания транспорта:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать транспорт')
      }
    },

    updateClientVehicle: async (_: unknown, { id, input }: { id: string; input: ClientVehicleInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const vehicle = await prisma.clientVehicle.update({
          where: { id },
          data: {
            name: input.name,
            vin: input.vin,
            frame: input.frame,
            licensePlate: input.licensePlate,
            brand: input.brand,
            model: input.model,
            modification: input.modification,
            year: input.year,
            mileage: input.mileage,
            comment: input.comment
          }
        })

        return vehicle
      } catch (error) {
        console.error('Ошибка обновления транспорта:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить транспорт')
      }
    },

    deleteClientVehicle: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.clientVehicle.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления транспорта:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить транспорт')
      }
    },

    // Адреса доставки
    createClientDeliveryAddress: async (_: unknown, { clientId, input }: { clientId: string; input: ClientDeliveryAddressInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const address = await prisma.clientDeliveryAddress.create({
          data: {
            clientId,
            name: input.name,
            address: input.address,
            deliveryType: input.deliveryType,
            comment: input.comment
          }
        })

        return address
      } catch (error) {
        console.error('Ошибка создания адреса доставки:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать адрес доставки')
      }
    },

    updateClientDeliveryAddress: async (_: unknown, { id, input }: { id: string; input: ClientDeliveryAddressInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const address = await prisma.clientDeliveryAddress.update({
          where: { id },
          data: {
            name: input.name,
            address: input.address,
            deliveryType: input.deliveryType,
            comment: input.comment
          }
        })

        return address
      } catch (error) {
        console.error('Ошибка обновления адреса доставки:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить адрес доставки')
      }
    },

    deleteClientDeliveryAddress: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.clientDeliveryAddress.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления адреса доставки:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить адрес доставки')
      }
    },

    // Контакты клиента
    createClientContact: async (_: unknown, { clientId, input }: { clientId: string; input: ClientContactInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const contact = await prisma.clientContact.create({
          data: {
            clientId,
            phone: input.phone,
            email: input.email,
            comment: input.comment
          }
        })

        return contact
      } catch (error) {
        console.error('Ошибка создания контакта:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать контакт')
      }
    },

    updateClientContact: async (_: unknown, { id, input }: { id: string; input: ClientContactInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const contact = await prisma.clientContact.update({
          where: { id },
          data: {
            phone: input.phone,
            email: input.email,
            comment: input.comment
          }
        })

        return contact
      } catch (error) {
        console.error('Ошибка обновления контакта:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить контакт')
      }
    },

    deleteClientContact: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.clientContact.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления контакта:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить контакт')
      }
    },

    // Договоры
    createClientContract: async (_: unknown, { clientId, input }: { clientId: string; input: ClientContractInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const contract = await prisma.clientContract.create({
          data: {
            clientId,
            contractNumber: input.contractNumber,
            contractDate: input.contractDate || new Date(),
            name: input.name,
            ourLegalEntity: input.ourLegalEntity || '',
            clientLegalEntity: input.clientLegalEntity || '',
            balance: input.balance || 0,
            currency: input.currency || 'RUB',
            isActive: input.isActive ?? true,
            isDefault: input.isDefault ?? false,
            contractType: input.contractType || 'STANDARD',
            relationship: input.relationship || 'DIRECT',
            paymentDelay: input.paymentDelay ?? false,
            creditLimit: input.creditLimit,
            delayDays: input.delayDays,
            fileUrl: input.fileUrl
          }
        })

        return contract
      } catch (error) {
        console.error('Ошибка создания договора:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать договор')
      }
    },

    updateClientContract: async (_: unknown, { id, input }: { id: string; input: ClientContractInput }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const contract = await prisma.clientContract.update({
          where: { id },
          data: {
            contractNumber: input.contractNumber,
            contractDate: input.contractDate,
            name: input.name,
            ourLegalEntity: input.ourLegalEntity,
            clientLegalEntity: input.clientLegalEntity,
            balance: input.balance,
            currency: input.currency,
            isActive: input.isActive,
            isDefault: input.isDefault,
            contractType: input.contractType,
            relationship: input.relationship,
            paymentDelay: input.paymentDelay,
            creditLimit: input.creditLimit,
            delayDays: input.delayDays,
            fileUrl: input.fileUrl
          }
        })

        return contract
      } catch (error) {
        console.error('Ошибка обновления договора:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить договор')
      }
    },

    deleteClientContract: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        if (!context.userId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.clientContract.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления договора:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить договор')
      }
    },

    // Юридические лица
    createClientLegalEntity: async (_: unknown, { clientId, input }: { clientId: string; input: ClientLegalEntityInput }, context: Context) => {
      try {
        const actualContext = context || getContext()
        // Проверяем авторизацию - либо админ CMS, либо клиент
        if (!actualContext.userId && !actualContext.clientId) {
          throw new Error('Пользователь не авторизован')
        }

        // Если это клиент, он может создавать только свои юр. лица
        if (actualContext.clientId && clientId !== actualContext.clientId) {
          throw new Error('Недостаточно прав')
        }

        const legalEntity = await prisma.clientLegalEntity.create({
          data: {
            clientId,
            shortName: input.shortName,
            fullName: input.fullName || input.shortName,
            form: input.form || 'ООО',
            legalAddress: input.legalAddress || '',
            actualAddress: input.actualAddress,
            taxSystem: input.taxSystem || 'УСН',
            responsiblePhone: input.responsiblePhone,
            responsiblePosition: input.responsiblePosition,
            responsibleName: input.responsibleName,
            accountant: input.accountant,
            signatory: input.signatory,
            registrationReasonCode: input.registrationReasonCode,
            ogrn: input.ogrn,
            inn: input.inn,
            vatPercent: input.vatPercent || 20
          },
          include: {
            bankDetails: true
          }
        })

        return legalEntity
      } catch (error) {
        console.error('Ошибка создания юридического лица:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать юридическое лицо')
      }
    },

    updateClientLegalEntity: async (_: unknown, { id, input }: { id: string; input: ClientLegalEntityInput }, context: Context) => {
      try {
        // Если контекст не передан как параметр, получаем из глобальной переменной
        const actualContext = context || getContext()
        // Проверяем авторизацию - либо админ CMS, либо клиент
        if (!actualContext.userId && !actualContext.clientId) {
          throw new Error('Пользователь не авторизован')
        }

        // Если это клиент, проверяем что юр. лицо принадлежит ему
        if (actualContext.clientId) {
          const existingEntity = await prisma.clientLegalEntity.findUnique({
            where: { id }
          })
          if (!existingEntity || existingEntity.clientId !== actualContext.clientId) {
            throw new Error('Недостаточно прав')
          }
        }

        const legalEntity = await prisma.clientLegalEntity.update({
          where: { id },
          data: {
            shortName: input.shortName,
            fullName: input.fullName,
            form: input.form,
            legalAddress: input.legalAddress,
            actualAddress: input.actualAddress,
            taxSystem: input.taxSystem,
            responsiblePhone: input.responsiblePhone,
            responsiblePosition: input.responsiblePosition,
            responsibleName: input.responsibleName,
            accountant: input.accountant,
            signatory: input.signatory,
            registrationReasonCode: input.registrationReasonCode,
            ogrn: input.ogrn,
            inn: input.inn,
            vatPercent: input.vatPercent
          },
          include: {
            bankDetails: true
          }
        })

        return legalEntity
      } catch (error) {
        console.error('Ошибка обновления юридического лица:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить юридическое лицо')
      }
    },

    deleteClientLegalEntity: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        const actualContext = context || getContext()
        // Проверяем авторизацию - либо админ CMS, либо клиент
        if (!actualContext.userId && !actualContext.clientId) {
          throw new Error('Пользователь не авторизован')
        }

        // Если это клиент, проверяем что юр. лицо принадлежит ему
        if (actualContext.clientId) {
          const existingEntity = await prisma.clientLegalEntity.findUnique({
            where: { id }
          })
          if (!existingEntity || existingEntity.clientId !== actualContext.clientId) {
            throw new Error('Недостаточно прав')
          }
        }

        await prisma.clientLegalEntity.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления юридического лица:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить юридическое лицо')
      }
    },

    // Банковские реквизиты
    createClientBankDetails: async (_: unknown, { legalEntityId, input }: { legalEntityId: string; input: ClientBankDetailsInput }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.userId && !actualContext.clientId) {
          throw new Error('Пользователь не авторизован')
        }

        // Получаем clientId из legalEntity
        const legalEntity = await prisma.clientLegalEntity.findUnique({
          where: { id: legalEntityId }
        })

        if (!legalEntity) {
          throw new Error('Юридическое лицо не найдено')
        }

        const bankDetails = await prisma.clientBankDetails.create({
          data: {
            clientId: legalEntity.clientId,
            legalEntityId: legalEntityId,
            name: input.name,
            accountNumber: input.accountNumber,
            bankName: input.bankName,
            bik: input.bik,
            correspondentAccount: input.correspondentAccount
          },
          include: {
            legalEntity: true
          }
        })

        return bankDetails
      } catch (error) {
        console.error('Ошибка создания банковских реквизитов:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать банковские реквизиты')
      }
    },

    updateClientBankDetails: async (_: unknown, { id, input }: { id: string; input: ClientBankDetailsInput }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.userId && !actualContext.clientId) {
          throw new Error('Пользователь не авторизован')
        }

        const bankDetails = await prisma.clientBankDetails.update({
          where: { id },
          data: {
            name: input.name,
            accountNumber: input.accountNumber,
            bankName: input.bankName,
            bik: input.bik,
            correspondentAccount: input.correspondentAccount
          },
          include: {
            legalEntity: true
          }
        })

        return bankDetails
      } catch (error) {
        console.error('Ошибка обновления банковских реквизитов:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить банковские реквизиты')
      }
    },

    deleteClientBankDetails: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.userId && !actualContext.clientId) {
          throw new Error('Пользователь не авторизован')
        }

        await prisma.clientBankDetails.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления банковских реквизитов:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить банковские реквизиты')
      }
    },

    // Авторизация клиентов
    checkClientByPhone: async (_: unknown, { phone }: { phone: string }) => {
      try {
        const client = await prisma.client.findFirst({
          where: { phone },
          include: {
            profile: true
          }
        })

        const sessionId = Math.random().toString(36).substring(7)

        return {
          exists: !!client,
          client,
          sessionId
        }
      } catch (error) {
        console.error('Ошибка проверки клиента по телефону:', error)
        throw new Error('Не удалось проверить клиента')
      }
    },

    sendSMSCode: async (_: unknown, { phone, sessionId }: { phone: string; sessionId?: string }) => {
      try {
        // Используем импортированные сервисы
        
        const finalSessionId = sessionId || Math.random().toString(36).substring(7)
        
        // Проверяем, есть ли уже активный код для этого номера и сессии
        if (smsCodeStore.hasActiveCode(phone, finalSessionId)) {
          const ttl = smsCodeStore.getCodeTTL(phone, finalSessionId)
          console.log(`У номера ${phone} уже есть активный код, осталось ${ttl} секунд`)
          
          return {
            success: true,
            sessionId: finalSessionId,
            message: `Код уже отправлен. Попробуйте через ${ttl} секунд.`
          }
        }

        // Генерируем 5-значный код
        const code = Math.floor(10000 + Math.random() * 90000).toString()
        
        // Сохраняем код в хранилище
        smsCodeStore.saveCode(phone, code, finalSessionId)
        
        // Отправляем SMS через Билайн API
        const smsResult = await smsService.sendVerificationCode(phone, code)
        
        if (smsResult.success) {
          return {
            success: true,
            sessionId: finalSessionId,
            messageId: smsResult.messageId,
            message: 'SMS код отправлен'
          }
        } else {
          // Если SMS не отправилось в production - бросаем ошибку
          if (process.env.NODE_ENV !== 'development') {
            throw new Error(`Не удалось отправить SMS: ${smsResult.error}`)
          }
          
          // В development режиме возвращаем успех и показываем код
          return {
            success: true,
            sessionId: finalSessionId,
            message: 'SMS отправлен (dev mode)',
            code // Только в dev режиме!
          }
        }
      } catch (error) {
        console.error('Ошибка отправки SMS:', error)
        throw new Error('Не удалось отправить SMS код')
      }
    },

    verifyCode: async (_: unknown, { phone, code, sessionId }: { phone: string; code: string; sessionId: string }) => {
      try {
        console.log(`Верификация кода для ${phone}, код: ${code}, sessionId: ${sessionId}`)
        
        // Проверяем код через наше хранилище
        const verification = smsCodeStore.verifyCode(phone, code, sessionId)
        
        if (!verification.valid) {
          console.log(`Код неверный: ${verification.error}`)
          throw new Error(verification.error || 'Неверный код')
        }

        console.log('Код верифицирован успешно')

        // Ищем клиента в базе
        const client = await prisma.client.findFirst({
          where: { phone },
          include: {
            profile: true
          }
        })

        console.log(`Клиент найден: ${!!client}`)

        if (client) {
          // Если клиент существует - авторизуем его
          console.log(`Авторизуем существующего клиента: ${client.id}`)
          const token = `client_${client.id}_${Date.now()}`
          
          return {
            success: true,
            client,
            token
          }
        } else {
          // Если клиент не существует - возвращаем успех без клиента
          // Это означает что нужно будет перейти к регистрации
          console.log('Клиент не найден, возвращаем success с client: null для регистрации')
          return {
            success: true,
            client: null,
            token: null
          }
        }
      } catch (error) {
        console.error('Ошибка верификации кода:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось верифицировать код')
      }
    },

    registerNewClient: async (_: unknown, { phone, name }: { phone: string; name: string; sessionId: string }) => {
      try {
        // Проверяем, что клиент еще не существует
        const existingClient = await prisma.client.findFirst({
          where: { phone }
        })

        if (existingClient) {
          throw new Error('Клиент с таким номером уже существует')
        }

        // Разбиваем имя на имя и фамилию
        const nameParts = name.trim().split(' ')
        const firstName = nameParts[0] || name
        const lastName = nameParts.slice(1).join(' ') || ''
        const fullName = lastName ? `${firstName} ${lastName}` : firstName

        // Создаем нового клиента
        const client = await prisma.client.create({
          data: {
            clientNumber: `CL${Date.now()}`,
            type: 'INDIVIDUAL',
            name: fullName,
            phone,
            isConfirmed: true,
            balance: 0,
            emailNotifications: false,
            smsNotifications: false,
            pushNotifications: false
          },
          include: {
            profile: true
          }
        })

        // Создаем простой токен
        const token = `client_${client.id}_${Date.now()}`

        return {
          success: true,
          client,
          token
        }
      } catch (error) {
        console.error('Ошибка регистрации клиента:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось зарегистрировать клиента')
      }
    },

    // Мутации для гаража клиентов
    createUserVehicle: async (_: unknown, { input }: { input: ClientVehicleInput }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.clientId) {
          throw new Error('Клиент не авторизован')
        }

        const vehicle = await prisma.clientVehicle.create({
          data: {
            clientId: actualContext.clientId,
            name: input.name,
            vin: input.vin,
            frame: input.frame,
            licensePlate: input.licensePlate,
            brand: input.brand,
            model: input.model,
            modification: input.modification,
            year: input.year,
            mileage: input.mileage,
            comment: input.comment
          }
        })

        return vehicle
      } catch (error) {
        console.error('Ошибка создания автомобиля:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось создать автомобиль')
      }
    },

    updateUserVehicle: async (_: unknown, { id, input }: { id: string; input: ClientVehicleInput }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.clientId) {
          throw new Error('Клиент не авторизован')
        }

        // Проверяем, что автомобиль принадлежит клиенту
        const existingVehicle = await prisma.clientVehicle.findFirst({
          where: { id, clientId: actualContext.clientId }
        })

        if (!existingVehicle) {
          throw new Error('Автомобиль не найден')
        }

        const vehicle = await prisma.clientVehicle.update({
          where: { id },
          data: {
            name: input.name,
            vin: input.vin,
            frame: input.frame,
            licensePlate: input.licensePlate,
            brand: input.brand,
            model: input.model,
            modification: input.modification,
            year: input.year,
            mileage: input.mileage,
            comment: input.comment
          }
        })

        return vehicle
      } catch (error) {
        console.error('Ошибка обновления автомобиля:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось обновить автомобиль')
      }
    },

    deleteUserVehicle: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.clientId) {
          throw new Error('Клиент не авторизован')
        }

        // Проверяем, что автомобиль принадлежит клиенту
        const existingVehicle = await prisma.clientVehicle.findFirst({
          where: { id, clientId: actualContext.clientId }
        })

        if (!existingVehicle) {
          throw new Error('Автомобиль не найден')
        }

        await prisma.clientVehicle.delete({
          where: { id }
        })

        return true
      } catch (error) {
        console.error('Ошибка удаления автомобиля:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось удалить автомобиль')
      }
    },

    addVehicleFromSearch: async (_: unknown, { vin, comment }: { vin: string; comment?: string }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.clientId) {
          throw new Error('Клиент не авторизован')
        }

        // Создаем автомобиль из результата поиска
        const vehicle = await prisma.clientVehicle.create({
          data: {
            clientId: actualContext.clientId,
            name: `Автомобиль ${vin}`,
            vin,
            comment: comment || ''
          }
        })

        return vehicle
      } catch (error) {
        console.error('Ошибка добавления автомобиля из поиска:', error)
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Не удалось добавить автомобиль из поиска')
      }
    },

    deleteSearchHistoryItem: async () => {
      try {
        // Временная заглушка - возвращаем true
        // В будущем здесь будет реальная логика удаления из истории
        return true
      } catch (error) {
        console.error('Ошибка удаления из истории поиска:', error)
        throw new Error('Не удалось удалить элемент из истории поиска')
      }
    },

    // Обновление данных авторизованного клиента
    updateClientMe: async (_: unknown, { input }: { input: ClientInput }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.clientId) {
          throw new Error('Клиент не авторизован')
        }

        const updatedClient = await prisma.client.update({
          where: { id: actualContext.clientId },
          data: input,
          include: {
            legalEntities: true,
            profile: true,
            vehicles: true,
            deliveryAddresses: true,
            contacts: true,
            contracts: true,
            bankDetails: true,
            discounts: true
          }
        })

        return updatedClient
      } catch (error) {
        console.error('Ошибка обновления данных клиента:', error)
        throw new Error('Не удалось обновить данные клиента')
      }
    },

    // Создание юр. лица для авторизованного клиента
    createClientLegalEntityMe: async (_: unknown, { input }: { input: ClientLegalEntityInput }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.clientId) {
          throw new Error('Клиент не авторизован')
        }

        const legalEntity = await prisma.clientLegalEntity.create({
          data: {
            clientId: actualContext.clientId,
            shortName: input.shortName,
            fullName: input.fullName || input.shortName,
            form: input.form || 'ООО',
            legalAddress: input.legalAddress || '',
            actualAddress: input.actualAddress,
            taxSystem: input.taxSystem || 'УСН',
            responsiblePhone: input.responsiblePhone,
            responsiblePosition: input.responsiblePosition,
            responsibleName: input.responsibleName,
            accountant: input.accountant,
            signatory: input.signatory,
            registrationReasonCode: input.registrationReasonCode,
            ogrn: input.ogrn,
            inn: input.inn,
            vatPercent: input.vatPercent || 20
          },
          include: {
            bankDetails: true
          }
        })

        return legalEntity
      } catch (error) {
        console.error('Ошибка создания юридического лица:', error)
        throw new Error('Не удалось создать юридическое лицо')
      }
    },

    // Заказы и платежи
    createOrder: async (_: unknown, { input }: { input: CreateOrderInput }, context: Context) => {
      try {
        const actualContext = context || getContext()
        
        // Генерируем номер заказа
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        
        // Вычисляем общую сумму
        const totalAmount = input.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        
        const order = await prisma.order.create({
          data: {
            orderNumber,
            clientId: input.clientId,
            clientEmail: input.clientEmail,
            clientPhone: input.clientPhone,
            clientName: input.clientName,
            totalAmount,
            finalAmount: totalAmount, // Пока без скидок
            deliveryAddress: input.deliveryAddress,
            comment: input.comment,
            items: {
              create: input.items.map(item => ({
                productId: item.productId,
                externalId: item.externalId,
                name: item.name,
                article: item.article,
                brand: item.brand,
                price: item.price,
                quantity: item.quantity,
                totalPrice: item.price * item.quantity
              }))
            }
          },
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            },
            payments: true
          }
        })

        return order
      } catch (error) {
        console.error('Ошибка создания заказа:', error)
        throw new Error('Не удалось создать заказ')
      }
    },

    updateOrderStatus: async (_: unknown, { id, status }: { id: string; status: string }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const order = await prisma.order.update({
          where: { id },
          data: { status: status as any },
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            },
            payments: true
          }
        })

        return order
      } catch (error) {
        console.error('Ошибка обновления статуса заказа:', error)
        throw new Error('Не удалось обновить статус заказа')
      }
    },

    cancelOrder: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const order = await prisma.order.update({
          where: { id },
          data: { status: 'CANCELED' },
          include: {
            client: true,
            items: {
              include: {
                product: true
              }
            },
            payments: true
          }
        })

        return order
      } catch (error) {
        console.error('Ошибка отмены заказа:', error)
        throw new Error('Не удалось отменить заказ')
      }
    },

    createPayment: async (_: unknown, { input }: { input: CreatePaymentInput }, context: Context) => {
      try {
        // Получаем заказ
        const order = await prisma.order.findUnique({
          where: { id: input.orderId },
          include: {
            client: true,
            items: true
          }
        })

        if (!order) {
          throw new Error('Заказ не найден')
        }

        // Создаем платеж в YooKassa
        const yooKassaPayment = await yooKassaService.createPayment({
          amount: order.finalAmount,
          description: input.description || `Оплата заказа ${order.orderNumber}`,
          returnUrl: input.returnUrl,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber
          }
        })

        // Сохраняем платеж в базе данных
        const payment = await prisma.payment.create({
          data: {
            orderId: order.id,
            yookassaPaymentId: yooKassaPayment.id,
            amount: order.finalAmount,
            description: input.description || `Оплата заказа ${order.orderNumber}`,
            confirmationUrl: yooKassaPayment.confirmation?.confirmation_url,
            status: yooKassaPayment.status === 'pending' ? 'PENDING' : 
                   yooKassaPayment.status === 'waiting_for_capture' ? 'WAITING_FOR_CAPTURE' :
                   yooKassaPayment.status === 'succeeded' ? 'SUCCEEDED' : 'CANCELED'
          },
          include: {
            order: {
              include: {
                client: true,
                items: true
              }
            }
          }
        })

        return {
          payment,
          confirmationUrl: yooKassaPayment.confirmation?.confirmation_url || ''
        }
      } catch (error) {
        console.error('Ошибка создания платежа:', error)
        throw new Error('Не удалось создать платеж')
      }
    },

    cancelPayment: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        const actualContext = context || getContext()
        if (!actualContext.userId) {
          throw new Error('Пользователь не авторизован')
        }

        const payment = await prisma.payment.findUnique({
          where: { id },
          include: {
            order: true
          }
        })

        if (!payment) {
          throw new Error('Платеж не найден')
        }

        // Отменяем платеж в YooKassa
        await yooKassaService.cancelPayment(payment.yookassaPaymentId)

        // Обновляем статус в базе данных
        const updatedPayment = await prisma.payment.update({
          where: { id },
          data: { 
            status: 'CANCELED',
            canceledAt: new Date()
          },
          include: {
            order: {
              include: {
                client: true,
                items: true
              }
            }
          }
        })

        return updatedPayment
      } catch (error) {
        console.error('Ошибка отмены платежа:', error)
        throw new Error('Не удалось отменить платеж')
      }
    }
  }
} 