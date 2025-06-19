import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '@/lib/graphql/typeDefs'
import { resolvers } from '@/lib/graphql/resolvers'
import { extractTokenFromHeaders, getUserFromToken } from '@/lib/auth'
import jwt from 'jsonwebtoken'

interface Context {
  userId?: string
  clientId?: string
  userRole?: string
  userEmail?: string
  headers?: Headers
}

// Функция для создания контекста
async function createContext(req: any): Promise<Context> {
  const requestHeaders = req.headers
  const token = extractTokenFromHeaders(requestHeaders)
  console.log('GraphQL: получен токен:', token ? 'есть' : 'нет')
  
  if (!token) {
    return { headers: requestHeaders }
  }

  try {
    // Это JWT токен пользователя (админ/модератор)
    const payload = getUserFromToken(token)
    console.log('GraphQL: JWT payload:', payload ? 'найден' : 'не найден')
    if (payload) {
      console.log('GraphQL: пользователь авторизован:', payload.userId, 'роль:', payload.role)
      return {
        userId: payload.userId,
        userRole: payload.role,
        userEmail: payload.email,
        headers: requestHeaders
      }
    }
  } catch (error) {
    console.error('GraphQL: ошибка при парсинге токена:', error)
  }

  // Если это не админский токен, проверяем, не клиентский ли это токен
  if (token.startsWith('client_')) {
    console.log('GraphQL: найден клиентский токен:', token)
    
    // Различаем два типа токенов:
    // 1. client_${cuid} - для зарегистрированных клиентов
    // 2. client_${cuid}_${timestamp} - для зарегистрированных клиентов с timestamp
    // 3. client_cmbzedr1k0000rqz5phpvgpxc - временные клиенты (длинные ID)
    
    const tokenParts = token.split('_')
    let clientId = token  // по умолчанию весь токен для временных клиентов
    
    if (tokenParts.length >= 3) {
      // Это токен формата client_${clientId}_${timestamp} - извлекаем реальный ID
      clientId = tokenParts[1]
      console.log('GraphQL: извлечен реальный clientId из токена с timestamp:', clientId)
    } else if (tokenParts.length === 2) {
      // Это токен формата client_${clientId} - извлекаем реальный ID
      clientId = tokenParts[1]
      console.log('GraphQL: извлечен реальный clientId:', clientId)
    } else {
      // Временный клиент
      console.log('GraphQL: используем временный clientId:', clientId)
    }
    
    const context = {
      clientId: clientId,
      headers: requestHeaders
    }
    console.log('GraphQL: возвращаем клиентский контекст:', context)
    return context
  }

  // Попробуем декодировать как JWT клиентский токен
  try {
    const decoded = jwt.decode(token) as any
    if (decoded && decoded.clientId) {
      console.log('GraphQL: клиент авторизован через JWT:', decoded.clientId)
      return {
        clientId: decoded.clientId,
        headers: requestHeaders
      }
    }
  } catch (error) {
    console.error('GraphQL: ошибка при парсинге клиентского токена:', error)
  }

  return { headers: requestHeaders }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => {
    const context = await createContext(req)
    // Устанавливаем контекст глобально для резолверов
    ;(global as any).__graphqlContext = context
    return context
  }
})

export async function GET(request: Request) {
  return handler(request)
}

export async function POST(request: Request) {
  return handler(request)
} 