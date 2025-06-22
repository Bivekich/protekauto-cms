import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function createTestClient() {
  try {
    console.log('Создание тестового клиента...')

    // Создаем тестового клиента
    const client = await prisma.client.create({
      data: {
        clientNumber: 'TEST001',
        type: 'LEGAL_ENTITY',
        name: 'Тестовый Клиент ООО',
        email: 'test@example.com',
        phone: '+79999999999',
        city: 'Москва',
        balance: 0,
        isConfirmed: true,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: false,
        comment: 'Тестовый клиент для проверки функционала балансов'
      }
    })

    console.log('Клиент создан:', client.id)

    // Создаем юридическое лицо
    const legalEntity = await prisma.clientLegalEntity.create({
      data: {
        clientId: client.id,
        shortName: 'ООО "Тест"',
        fullName: 'Общество с ограниченной ответственностью "Тест"',
        form: 'ООО',
        legalAddress: '123456, г. Москва, ул. Тестовая, д. 1',
        actualAddress: '123456, г. Москва, ул. Тестовая, д. 1',
        taxSystem: 'УСН',
        responsiblePhone: '+79999999999',
        responsiblePosition: 'Директор',
        responsibleName: 'Иванов Иван Иванович',
        inn: '1234567890',
        ogrn: '1234567890123',
        vatPercent: 20
      }
    })

    console.log('Юридическое лицо создано:', legalEntity.id)

    // Создаем банковские реквизиты
    const bankDetails = await prisma.clientBankDetails.create({
      data: {
        clientId: client.id,
        legalEntityId: legalEntity.id,
        name: 'Основной счет',
        accountNumber: '40702810000000000001',
        bankName: 'ПАО "Тестовый Банк"',
        bik: '044525225',
        correspondentAccount: '30101810400000000225'
      }
    })

    console.log('Банковские реквизиты созданы:', bankDetails.id)

    // Создаем договор с балансом
    const contract1 = await prisma.clientContract.create({
      data: {
        clientId: client.id,
        contractNumber: '001/2024',
        contractDate: new Date('2024-01-15'),
        name: 'Договор поставки автозапчастей',
        ourLegalEntity: 'ООО "ПротекАвто"',
        clientLegalEntity: legalEntity.shortName,
        balance: -50000, // Отрицательный баланс - долг клиента
        currency: 'RUB',
        isActive: true,
        isDefault: true,
        contractType: 'STANDARD',
        relationship: 'DIRECT',
        paymentDelay: true,
        creditLimit: 100000, // Кредитный лимит 100,000 рублей
        delayDays: 30 // 30 дней отсрочки
      }
    })

    console.log('Договор 1 создан:', contract1.id)

    // Создаем второй договор
    const contract2 = await prisma.clientContract.create({
      data: {
        clientId: client.id,
        contractNumber: '002/2024',
        contractDate: new Date('2024-02-01'),
        name: 'Дополнительный договор',
        ourLegalEntity: 'ООО "ПротекАвто"',
        clientLegalEntity: legalEntity.shortName,
        balance: 25000, // Положительный баланс - предоплата
        currency: 'RUB',
        isActive: true,
        isDefault: false,
        contractType: 'ADDITIONAL',
        relationship: 'DIRECT',
        paymentDelay: true,
        creditLimit: 50000, // Кредитный лимит 50,000 рублей
        delayDays: 15 // 15 дней отсрочки
      }
    })

    console.log('Договор 2 создан:', contract2.id)

    // Создаем третий договор (неактивный)
    const contract3 = await prisma.clientContract.create({
      data: {
        clientId: client.id,
        contractNumber: '003/2023',
        contractDate: new Date('2023-12-01'),
        name: 'Старый договор',
        ourLegalEntity: 'ООО "ПротекАвто"',
        clientLegalEntity: legalEntity.shortName,
        balance: 0,
        currency: 'RUB',
        isActive: false, // Неактивный договор
        isDefault: false,
        contractType: 'STANDARD',
        relationship: 'DIRECT',
        paymentDelay: false,
        creditLimit: 25000,
        delayDays: 10
      }
    })

    console.log('Договор 3 создан (неактивный):', contract3.id)

    // Создаем историю изменений баланса
    await prisma.clientBalanceHistory.create({
      data: {
        clientId: client.id,
        userId: null, // Системное изменение
        oldValue: 0,
        newValue: -50000,
        comment: 'Начальная задолженность по договору'
      }
    })

    console.log('История баланса создана')

    console.log('\n=== ТЕСТОВЫЙ КЛИЕНТ СОЗДАН ===')
    console.log(`ID клиента: ${client.id}`)
    console.log(`Номер клиента: ${client.clientNumber}`)
    console.log(`Телефон: ${client.phone}`)
    console.log(`Email: ${client.email}`)
    console.log(`Юридическое лицо: ${legalEntity.shortName}`)
    console.log(`ИНН: ${legalEntity.inn}`)
    console.log(`Договоры:`)
    console.log(`  1. ${contract1.contractNumber} - баланс: ${contract1.balance} ₽, лимит: ${contract1.creditLimit} ₽`)
    console.log(`  2. ${contract2.contractNumber} - баланс: ${contract2.balance} ₽, лимит: ${contract2.creditLimit} ₽`)
    console.log(`  3. ${contract3.contractNumber} - неактивный`)
    console.log('\nДля авторизации используйте телефон: +79999999999')

  } catch (error) {
    console.error('Ошибка создания тестового клиента:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestClient() 