import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { typeDefs } from '@/lib/graphql/typeDefs'
import { resolvers } from '@/lib/graphql/resolvers'
import { extractTokenFromHeaders, getUserFromToken } from '@/lib/auth'

interface Context {
  userId?: string
  userRole?: string
  userEmail?: string
  headers: Headers
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
    // Это JWT токен пользователя
    const payload = getUserFromToken(token)
    console.log('GraphQL: JWT payload:', payload ? 'найден' : 'не найден')
    if (payload) {
      console.log('GraphQL: пользователь авторизован:', payload.userId)
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

  return { headers: requestHeaders }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
})

const handler = startServerAndCreateNextHandler(server, {
  context: async (req) => createContext(req),
})

export { handler as GET, handler as POST } 