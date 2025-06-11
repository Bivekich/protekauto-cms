interface BeeSMSConfig {
  user: string
  pass: string
  sender?: string
  baseUrl?: string
}

interface SMSOptions {
  message: string
  target: string
  sender?: string
  period?: number
  time_period?: string
  time_local?: 0 | 1
  autotrimtext?: boolean
  sms_type?: '' | 'W' | 'F'
  wap_url?: string
  wap_expires?: string
  post_id?: string
}

interface SMSResponse {
  success: boolean
  messageId?: string
  error?: string
  balance?: number
  raw?: string
}

class BeeSMSService {
  private config: BeeSMSConfig
  private baseUrl: string

  constructor(config: BeeSMSConfig) {
    this.config = config
    this.baseUrl = config.baseUrl || 'https://a2p-sms-https.beeline.ru/proto/http/'
  }

  /**
   * Отправка SMS сообщения
   */
  async sendSMS(options: SMSOptions): Promise<SMSResponse> {
    try {
      const params = new URLSearchParams({
        user: this.config.user,
        pass: this.config.pass,
        action: 'post_sms',
        message: options.message,
        target: options.target,
        gzip: 'none', // Отключаем gzip для простоты
        sender: options.sender || this.config.sender || '',
      })

      // Добавляем опциональные параметры
      if (options.period) params.append('period', options.period.toString())
      if (options.time_period) params.append('time_period', options.time_period)
      if (options.time_local !== undefined) params.append('time_local', options.time_local.toString())
      if (options.autotrimtext) params.append('autotrimtext', 'on')
      if (options.sms_type) params.append('sms_type', options.sms_type)
      if (options.wap_url) params.append('wap_url', options.wap_url)
      if (options.wap_expires) params.append('wap_expires', options.wap_expires)
      if (options.post_id) params.append('post_id', options.post_id)

      console.log('Отправка SMS через Билайн API:', {
        target: options.target,
        message: options.message.substring(0, 50) + '...',
        sender: options.sender || this.config.sender
      })

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: params.toString()
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      console.log('Ответ от Билайн API:', responseText)

      return this.parseResponse(responseText)
    } catch (error) {
      console.error('Ошибка отправки SMS:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      }
    }
  }

  /**
   * Отправка кода подтверждения
   */
  async sendVerificationCode(phone: string, code: string): Promise<SMSResponse> {
    const message = `Код подтверждения для Protek Auto: ${code}. Никому не сообщайте этот код.`
    
    // Нормализуем номер телефона
    const normalizedPhone = this.normalizePhone(phone)
    
    return this.sendSMS({
      message,
      target: normalizedPhone,
      period: 300, // 5 минут время жизни
      autotrimtext: true,
      post_id: `auth_${Date.now()}_${Math.random().toString(36).substring(7)}`
    })
  }

  /**
   * Нормализация номера телефона
   */
  private normalizePhone(phone: string): string {
    // Удаляем все нецифровые символы
    const digits = phone.replace(/\D/g, '')
    
    // Если начинается с 8, заменяем на 7
    if (digits.startsWith('8')) {
      return '+7' + digits.substring(1)
    }
    
    // Если начинается с 7, добавляем +
    if (digits.startsWith('7')) {
      return '+' + digits
    }
    
    // Если начинается с 9, добавляем +7
    if (digits.startsWith('9') && digits.length === 10) {
      return '+7' + digits
    }
    
    // Иначе возвращаем как есть с +
    return '+' + digits
  }

  /**
   * Парсинг ответа от API
   */
  private parseResponse(responseText: string): SMSResponse {
    try {
      // Билайн возвращает XML, но для простоты будем парсить как текст
      // В идеале стоит использовать XML парсер
      
      if (responseText.includes('<status>successfully</status>')) {
        // Успешная отправка
        const messageIdMatch = responseText.match(/<message_id>(\d+)<\/message_id>/)
        const balanceMatch = responseText.match(/<balance>([\d.]+)<\/balance>/)
        
        return {
          success: true,
          messageId: messageIdMatch ? messageIdMatch[1] : undefined,
          balance: balanceMatch ? parseFloat(balanceMatch[1]) : undefined,
          raw: responseText
        }
      } else {
        // Ошибка отправки
        const errorMatch = responseText.match(/<error>(.*?)<\/error>/) || 
                          responseText.match(/<comment>(.*?)<\/comment>/)
        
        return {
          success: false,
          error: errorMatch ? errorMatch[1] : 'Неизвестная ошибка от SMS API',
          raw: responseText
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'Ошибка парсинга ответа SMS API',
        raw: responseText
      }
    }
  }

  /**
   * Проверка баланса
   */
  async getBalance(): Promise<{ balance?: number; error?: string }> {
    try {
      const params = new URLSearchParams({
        user: this.config.user,
        pass: this.config.pass,
        action: 'balance',
        gzip: 'none'
      })

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: params.toString()
      })

      const responseText = await response.text()
      const parsed = this.parseResponse(responseText)
      
      if (parsed.success) {
        return { balance: parsed.balance }
      } else {
        return { error: parsed.error }
      }
    } catch (error) {
      return { 
        error: error instanceof Error ? error.message : 'Ошибка получения баланса' 
      }
    }
  }
}

// Инициализация сервиса с конфигурацией из переменных окружения
const smsService = new BeeSMSService({
  user: process.env.BEELINE_SMS_USER || '',
  pass: process.env.BEELINE_SMS_PASS || '',
  sender: process.env.BEELINE_SMS_SENDER || 'ProtekAuto',
})

export { BeeSMSService, smsService }
export type { SMSOptions, SMSResponse } 