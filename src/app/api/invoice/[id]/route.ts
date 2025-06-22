import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceService } from '@/lib/invoice-service'
import { extractTokenFromHeaders, getUserFromToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // В Next.js 15 params нужно await
    const { id: invoiceId } = await params

    console.log('🔍 Скачивание счета:', invoiceId)

    // Проверяем авторизацию администратора (для админки)
    const adminToken = extractTokenFromHeaders(request.headers)
    if (adminToken) {
      const adminUser = getUserFromToken(adminToken)
      if (adminUser?.role === 'ADMIN') {
        console.log('👑 Администратор авторизован')
        
        // Получаем счет для администратора (без проверки принадлежности)
        const invoice = await prisma.balanceInvoice.findUnique({
          where: { id: invoiceId },
          include: {
            contract: {
              include: {
                client: {
                  include: {
                    legalEntities: true
                  }
                }
              }
            }
          }
        })

        if (!invoice) {
          console.log('❌ Счет не найден:', invoiceId)
          return NextResponse.json({ error: 'Счет не найден' }, { status: 404 })
        }

        // Получаем первое юридическое лицо клиента
        const legalEntity = invoice.contract.client.legalEntities[0]

        // Формируем данные для генерации PDF
        const invoiceData = {
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          clientName: legalEntity?.shortName || invoice.contract.client.name || invoice.contract.client.phone,
          clientInn: legalEntity?.inn,
          clientAddress: legalEntity?.legalAddress,
          contractNumber: invoice.contract.contractNumber,
          description: `Пополнение баланса по договору ${invoice.contract.contractNumber}`,
          dueDate: invoice.expiresAt
        }

        console.log('📄 Генерируем PDF для счета (админ):', invoice.invoiceNumber)

        // Генерируем PDF
        const pdfBuffer = await InvoiceService.generatePDF(invoiceData)

        // Возвращаем PDF файл
        const pdfUint8Array = new Uint8Array(pdfBuffer)
        
        return new NextResponse(pdfUint8Array, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename*=UTF-8''invoice-${encodeURIComponent(invoice.invoiceNumber)}.pdf`,
            'Content-Length': pdfBuffer.length.toString(),
          },
        })
      }
    }

    // Проверяем авторизацию клиента (для фронтенда)
    const token = extractTokenFromHeaders(request.headers)
    console.log('🔑 Токен клиента получен:', token ? 'да' : 'нет')
    
    if (!token) {
      console.log('❌ Нет авторизации (ни админ, ни клиент)')
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    let clientId: string | null = null

    // Извлекаем clientId из токена
    if (token.startsWith('client_')) {
      const tokenParts = token.split('_')
      if (tokenParts.length >= 2) {
        clientId = tokenParts[1]
        console.log('👤 Извлечен clientId:', clientId)
      }
    }

    if (!clientId) {
      console.log('❌ Неверный формат токена клиента')
      return NextResponse.json({ error: 'Неверный токен клиента' }, { status: 401 })
    }

    // Получаем счет и проверяем принадлежность
    const invoice = await prisma.balanceInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        contract: {
          include: {
            client: true
          }
        }
      }
    })

    if (!invoice) {
      console.log('❌ Счет не найден:', invoiceId)
      return NextResponse.json({ error: 'Счет не найден' }, { status: 404 })
    }

    console.log('📋 Счет найден, владелец:', invoice.contract.client.id)
    console.log('🔍 Проверяем доступ для клиента:', clientId)

    // Проверяем, что счет принадлежит клиенту
    if (invoice.contract.client.id !== clientId) {
      console.log('❌ Нет доступа к счету')
      return NextResponse.json({ error: 'Нет доступа к счету' }, { status: 403 })
    }

    // Получаем юридическое лицо для полного названия
    const legalEntity = await prisma.clientLegalEntity.findFirst({
      where: { clientId: clientId }
    })

    console.log('🏢 Юридическое лицо:', legalEntity?.shortName || 'не найдено')

    // Формируем данные для генерации PDF
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      clientName: legalEntity?.shortName || invoice.contract.client.name || invoice.contract.client.phone,
      clientInn: legalEntity?.inn,
      clientAddress: legalEntity?.legalAddress,
      contractNumber: invoice.contract.contractNumber,
      description: `Пополнение баланса по договору ${invoice.contract.contractNumber}`,
      dueDate: invoice.expiresAt
    }

    console.log('📄 Генерируем PDF для счета:', invoice.invoiceNumber)

    // Генерируем PDF
    const pdfBuffer = await InvoiceService.generatePDF(invoiceData)

    console.log('✅ PDF сгенерирован, размер:', pdfBuffer.length, 'байт')

    // Возвращаем PDF файл
    // Конвертируем Buffer в Uint8Array для корректной обработки
    const pdfUint8Array = new Uint8Array(pdfBuffer)
    
    return new NextResponse(pdfUint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename*=UTF-8''invoice-${encodeURIComponent(invoice.invoiceNumber)}.pdf`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('❌ Ошибка при скачивании счета:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
} 