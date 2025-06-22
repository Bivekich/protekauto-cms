import QRCode from 'qrcode'
import { v4 as uuidv4 } from 'uuid'
import puppeteer from 'puppeteer'

interface InvoiceData {
  invoiceNumber: string
  amount: number
  clientName: string
  clientInn?: string
  clientAddress?: string
  contractNumber?: string
  description: string
  dueDate: Date
}

interface CompanyRequisites {
  name: string
  inn: string
  kpp: string
  ogrn: string
  address: string
  bankName: string
  bik: string
  accountNumber: string
  correspondentAccount: string
}

export class InvoiceService {
  private static companyRequisites: CompanyRequisites = {
    name: 'ООО "Протек Авто"',
    inn: '7701234567',
    kpp: '770101001',
    ogrn: '1137746123456',
    address: '123456, г. Москва, ул. Примерная, д. 1, оф. 100',
    bankName: 'ПАО СБЕРБАНК',
    bik: '044525225',
    accountNumber: '40702810140000000001',
    correspondentAccount: '30101810400000000225'
  }

  static generateInvoiceNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    
    return `СЧ-${year}${month}${day}-${random}`
  }

  static async generateQRCode(amount: number, purpose: string, invoiceNumber: string): Promise<string> {
    // Формат СБП для QR-кода
    const sbpData = [
      'ST00012',
      `Name=${this.companyRequisites.name}`,
      `PersonalAcc=${this.companyRequisites.accountNumber}`,
      `BankName=${this.companyRequisites.bankName}`,
      `BIC=${this.companyRequisites.bik}`,
      `CorrespAcc=${this.companyRequisites.correspondentAccount}`,
      `Sum=${amount * 100}`, // в копейках
      `Purpose=${purpose} ${invoiceNumber}`,
      `PayeeINN=${this.companyRequisites.inn}`,
      `KPP=${this.companyRequisites.kpp}`
    ].join('|')

    try {
      const qrCodeDataURL = await QRCode.toDataURL(sbpData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      return qrCodeDataURL
    } catch (error) {
      console.error('Ошибка генерации QR-кода:', error)
      throw new Error('Не удалось сгенерировать QR-код')
    }
  }

  static generateInvoiceHTML(data: InvoiceData, qrCodeDataURL: string): string {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB'
      }).format(amount)
    }

    return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Счет ${data.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            padding: 20px;
            background: white;
        }
        
        .invoice-header {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .invoice-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .invoice-number {
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .invoice-date {
            font-size: 12px;
            color: #666;
        }
        
        .company-info {
            margin-bottom: 25px;
            border: 1px solid #000;
            padding: 15px;
        }
        
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .requisites-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        
        .requisites-table td {
            padding: 5px 10px;
            border: 1px solid #000;
            vertical-align: top;
        }
        
        .requisites-table .label {
            font-weight: bold;
            width: 200px;
            background-color: #f5f5f5;
        }
        
        .client-info {
            margin-bottom: 25px;
            border: 1px solid #000;
            padding: 15px;
        }
        
        .client-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .invoice-details {
            margin-bottom: 25px;
        }
        
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        
        .details-table th,
        .details-table td {
            padding: 10px;
            border: 1px solid #000;
            text-align: left;
        }
        
        .details-table th {
            background-color: #f5f5f5;
            font-weight: bold;
        }
        
        .details-table .amount {
            text-align: right;
        }
        
        .total-section {
            margin-bottom: 25px;
            text-align: right;
        }
        
        .total-row {
            margin-bottom: 5px;
        }
        
        .total-amount {
            font-size: 16px;
            font-weight: bold;
        }
        
        .payment-info {
            margin-bottom: 25px;
            border: 1px solid #000;
            padding: 15px;
        }
        
        .payment-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .qr-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 30px;
        }
        
        .qr-code {
            text-align: center;
        }
        
        .qr-code img {
            width: 150px;
            height: 150px;
            border: 1px solid #ccc;
        }
        
        .qr-description {
            font-size: 10px;
            margin-top: 10px;
            color: #666;
        }
        
        .signatures {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        
        .signature-block {
            width: 45%;
        }
        
        .signature-line {
            border-bottom: 1px solid #000;
            height: 40px;
            margin-bottom: 5px;
        }
        
        .signature-label {
            font-size: 10px;
            color: #666;
        }
        
        @media print {
            body {
                padding: 0;
            }
            
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-header">
        <div class="invoice-title">СЧЕТ НА ОПЛАТУ</div>
        <div class="invoice-number">№ ${data.invoiceNumber}</div>
        <div class="invoice-date">от ${formatDate(new Date())}</div>
    </div>

    <div class="company-info">
        <div class="company-name">Поставщик: ${InvoiceService.companyRequisites.name}</div>
        <div>Адрес: ${InvoiceService.companyRequisites.address}</div>
        <div>ИНН: ${InvoiceService.companyRequisites.inn}, КПП: ${InvoiceService.companyRequisites.kpp}</div>
        <div>ОГРН: ${InvoiceService.companyRequisites.ogrn}</div>
    </div>

    <table class="requisites-table">
        <tr>
            <td class="label">Банк получателя:</td>
            <td>${InvoiceService.companyRequisites.bankName}</td>
        </tr>
        <tr>
            <td class="label">БИК:</td>
            <td>${InvoiceService.companyRequisites.bik}</td>
        </tr>
        <tr>
            <td class="label">Расчетный счет:</td>
            <td>${InvoiceService.companyRequisites.accountNumber}</td>
        </tr>
        <tr>
            <td class="label">Корреспондентский счет:</td>
            <td>${InvoiceService.companyRequisites.correspondentAccount}</td>
        </tr>
    </table>

    <div class="client-info">
        <div class="client-title">Плательщик: ${data.clientName}</div>
        ${data.clientInn ? `<div>ИНН: ${data.clientInn}</div>` : ''}
        ${data.clientAddress ? `<div>Адрес: ${data.clientAddress}</div>` : ''}
        ${data.contractNumber ? `<div>Договор: ${data.contractNumber}</div>` : ''}
    </div>

    <div class="invoice-details">
        <table class="details-table">
            <thead>
                <tr>
                    <th>№</th>
                    <th>Наименование товара, работ, услуг</th>
                    <th>Единица измерения</th>
                    <th>Количество</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>1</td>
                    <td>${data.description}</td>
                    <td>услуга</td>
                    <td>1</td>
                    <td class="amount">${formatCurrency(data.amount)}</td>
                    <td class="amount">${formatCurrency(data.amount)}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="total-section">
        <div class="total-row">Итого без НДС: ${formatCurrency(data.amount)}</div>
        <div class="total-row">НДС не облагается</div>
        <div class="total-row total-amount">Всего к оплате: ${formatCurrency(data.amount)}</div>
    </div>

    <div class="payment-info">
        <div class="payment-title">Условия оплаты:</div>
        <div>Срок оплаты: до ${formatDate(data.dueDate)}</div>
        <div>Счет действителен к оплате в течение 3 банковских дней</div>
    </div>

    <div class="qr-section">
        <div style="flex: 1;">
            <div style="font-weight: bold; margin-bottom: 10px;">Для быстрой оплаты:</div>
            <div>1. Откройте приложение вашего банка</div>
            <div>2. Выберите "Оплата по QR-коду"</div>
            <div>3. Наведите камеру на QR-код</div>
            <div>4. Проверьте данные и подтвердите платеж</div>
        </div>
        <div class="qr-code">
            <img src="${qrCodeDataURL}" alt="QR код для оплаты" />
            <div class="qr-description">QR-код для оплаты через СБП</div>
        </div>
    </div>

    <div class="signatures">
        <div class="signature-block">
            <div style="font-weight: bold; margin-bottom: 20px;">Поставщик:</div>
            <div class="signature-line"></div>
            <div class="signature-label">Подпись / М.П.</div>
        </div>
        <div class="signature-block">
            <div style="font-weight: bold; margin-bottom: 20px;">Покупатель:</div>
            <div class="signature-line"></div>
            <div class="signature-label">Подпись / М.П.</div>
        </div>
    </div>
</body>
</html>
    `
  }

  static async generatePDF(invoiceData: InvoiceData): Promise<Buffer> {
    const qrCodeDataURL = await this.generateQRCode(
      invoiceData.amount,
      invoiceData.description,
      invoiceData.invoiceNumber
    )

    const htmlContent = this.generateInvoiceHTML(invoiceData, qrCodeDataURL)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })

    try {
      const page = await browser.newPage()
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
      
             const pdfBuffer = await page.pdf({
         format: 'A4',
         printBackground: true,
         margin: {
           top: '20mm',
           right: '15mm',
           bottom: '20mm',
           left: '15mm'
         }
       })

       return Buffer.from(pdfBuffer)
    } finally {
      await browser.close()
    }
  }
} 