import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: '/api/graphql',
})

// Добавление JWT токена к запросам
const authLink = setContext((_, { headers }) => {
  // Получаем токен из cookies (как в AuthProvider)
  let token: string | null = null
  if (typeof window !== 'undefined') {
    // Простой способ получить cookie
    const cookies = document.cookie.split(';')
    console.log('Apollo Client: все cookies:', cookies)
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
    console.log('Apollo Client: найден auth-token cookie:', authCookie)
    if (authCookie) {
      token = authCookie.split('=')[1] || null
      console.log('Apollo Client: извлеченный токен:', token)
    }
  }
  
  const finalHeaders = {
    ...headers,
    authorization: token ? `Bearer ${token}` : "",
  }
  console.log('Apollo Client: итоговые заголовки:', finalHeaders)
  
  return {
    headers: finalHeaders
  }
})

// Обработка ошибок
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    )
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
}) 