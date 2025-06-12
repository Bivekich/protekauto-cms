import { gql } from '@apollo/client'

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!, $images: [ProductImageInput!], $characteristics: [CharacteristicInput!], $options: [ProductOptionInput!]) {
    createProduct(input: $input, images: $images, characteristics: $characteristics, options: $options) {
      id
      name
      slug
      article
      description
      videoUrl
      wholesalePrice
      retailPrice
      weight
      dimensions
      unit
      isVisible
      applyDiscounts
      stock
      createdAt
      updatedAt
      categories {
        id
        name
        slug
      }
      images {
        id
        url
        alt
        order
      }
      characteristics {
        id
        value
        characteristic {
          id
          name
        }
      }
      options {
        id
        option {
          id
          name
          type
        }
        optionValue {
          id
          value
          price
        }
      }
    }
  }
`

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!, $images: [ProductImageInput!], $characteristics: [CharacteristicInput!], $options: [ProductOptionInput!]) {
    updateProduct(id: $id, input: $input, images: $images, characteristics: $characteristics, options: $options) {
      id
      name
      slug
      article
      description
      videoUrl
      wholesalePrice
      retailPrice
      weight
      dimensions
      unit
      isVisible
      applyDiscounts
      stock
      createdAt
      updatedAt
      categories {
        id
        name
        slug
      }
      images {
        id
        url
        alt
        order
      }
      characteristics {
        id
        value
        characteristic {
          id
          name
        }
      }
      options {
        id
        option {
          id
          name
          type
        }
        optionValue {
          id
          value
          price
        }
      }
    }
  }
`

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`

export const UPDATE_PRODUCT_VISIBILITY = gql`
  mutation UpdateProductVisibility($id: ID!, $isVisible: Boolean!) {
    updateProductVisibility(id: $id, isVisible: $isVisible) {
      id
      isVisible
    }
  }
`

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
      description
      seoTitle
      seoDescription
      image
      isHidden
      includeSubcategoryProducts
      parentId
      level
      createdAt
      updatedAt
      _count {
        products
      }
    }
  }
`

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: CategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
      description
      seoTitle
      seoDescription
      image
      isHidden
      includeSubcategoryProducts
      parentId
      level
      createdAt
      updatedAt
      _count {
        products
      }
    }
  }
`

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

export const DELETE_PRODUCTS = gql`
  mutation DeleteProducts($ids: [ID!]!) {
    deleteProducts(ids: $ids) {
      count
    }
  }
`

export const UPDATE_PRODUCTS_VISIBILITY = gql`
  mutation UpdateProductsVisibility($ids: [ID!]!, $isVisible: Boolean!) {
    updateProductsVisibility(ids: $ids, isVisible: $isVisible) {
      count
    }
  }
`

export const EXPORT_PRODUCTS = gql`
  mutation ExportProducts($categoryId: String, $search: String, $format: String) {
    exportProducts(categoryId: $categoryId, search: $search, format: $format) {
      url
      filename
      count
    }
  }
`

export const IMPORT_PRODUCTS = gql`
  mutation ImportProducts($input: ImportProductsInput!) {
    importProducts(input: $input) {
      success
      errors
      total
      warnings
    }
  }
`

// Мутации для клиентов
export const CREATE_CLIENT = gql`
  mutation CreateClient($input: ClientInput!, $vehicles: [ClientVehicleInput!], $discounts: [ClientDiscountInput!]) {
    createClient(input: $input, vehicles: $vehicles, discounts: $discounts) {
      id
      clientNumber
      type
      name
      email
      phone
      city
      markup
      isConfirmed
      profileId
      profile {
        id
        name
        baseMarkup
      }
      legalEntityType
      inn
      kpp
      ogrn
      okpo
      legalAddress
      actualAddress
      bankAccount
      bankName
      bankBik
      correspondentAccount
      vehicles {
        id
        vin
        frame
        licensePlate
        brand
        model
        year
      }
      discounts {
        id
        name
        type
        value
        isActive
        validFrom
        validTo
      }
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: ClientInput!, $vehicles: [ClientVehicleInput!], $discounts: [ClientDiscountInput!]) {
    updateClient(id: $id, input: $input, vehicles: $vehicles, discounts: $discounts) {
      id
      clientNumber
      type
      name
      email
      phone
      city
      markup
      isConfirmed
      profileId
      profile {
        id
        name
        baseMarkup
      }
      legalEntityType
      inn
      kpp
      ogrn
      okpo
      legalAddress
      actualAddress
      bankAccount
      bankName
      bankBik
      correspondentAccount
      vehicles {
        id
        vin
        frame
        licensePlate
        brand
        model
        year
      }
      discounts {
        id
        name
        type
        value
        isActive
        validFrom
        validTo
      }
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`

export const CONFIRM_CLIENT = gql`
  mutation ConfirmClient($id: ID!) {
    confirmClient(id: $id) {
      id
      isConfirmed
    }
  }
`

export const EXPORT_CLIENTS = gql`
  mutation ExportClients($filter: ClientFilterInput, $search: String, $format: String) {
    exportClients(filter: $filter, search: $search, format: $format) {
      url
      filename
      count
    }
  }
`

// Мутации для профилей клиентов
export const CREATE_CLIENT_PROFILE = gql`
  mutation CreateClientProfile($input: ClientProfileInput!) {
    createClientProfile(input: $input) {
      id
      code
      name
      description
      baseMarkup
      autoSendInvoice
      vinRequestModule
      priceRangeMarkups {
        id
        priceFrom
        priceTo
        markupType
        markupValue
      }
      orderDiscounts {
        id
        minOrderSum
        discountType
        discountValue
      }
      supplierMarkups {
        id
        supplierName
        markupType
        markupValue
      }
      brandMarkups {
        id
        brandName
        markupType
        markupValue
      }
      categoryMarkups {
        id
        categoryName
        markupType
        markupValue
      }
      excludedBrands {
        id
        brandName
      }
      excludedCategories {
        id
        categoryName
      }
      paymentTypes {
        id
        paymentType
        isEnabled
      }
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CLIENT_PROFILE = gql`
  mutation UpdateClientProfile($id: ID!, $input: ClientProfileInput!) {
    updateClientProfile(id: $id, input: $input) {
      id
      code
      name
      description
      baseMarkup
      autoSendInvoice
      vinRequestModule
      priceRangeMarkups {
        id
        priceFrom
        priceTo
        markupType
        markupValue
      }
      orderDiscounts {
        id
        minOrderSum
        discountType
        discountValue
      }
      supplierMarkups {
        id
        supplierName
        markupType
        markupValue
      }
      brandMarkups {
        id
        brandName
        markupType
        markupValue
      }
      categoryMarkups {
        id
        categoryName
        markupType
        markupValue
      }
      excludedBrands {
        id
        brandName
      }
      excludedCategories {
        id
        categoryName
      }
      paymentTypes {
        id
        paymentType
        isEnabled
      }
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CLIENT_PROFILE = gql`
  mutation DeleteClientProfile($id: ID!) {
    deleteClientProfile(id: $id)
  }
`

// Мутации для статусов клиентов
export const CREATE_CLIENT_STATUS = gql`
  mutation CreateClientStatus($input: ClientStatusInput!) {
    createClientStatus(input: $input) {
      id
      name
      color
      description
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CLIENT_STATUS = gql`
  mutation UpdateClientStatus($id: ID!, $input: ClientStatusInput!) {
    updateClientStatus(id: $id, input: $input) {
      id
      name
      color
      description
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CLIENT_STATUS = gql`
  mutation DeleteClientStatus($id: ID!) {
    deleteClientStatus(id: $id)
  }
`

// Мутации для скидок и промокодов
export const CREATE_DISCOUNT = gql`
  mutation CreateDiscount($input: DiscountInput!) {
    createDiscount(input: $input) {
      id
      name
      type
      code
      minOrderAmount
      discountType
      discountValue
      isActive
      validFrom
      validTo
      profiles {
        id
        profile {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_DISCOUNT = gql`
  mutation UpdateDiscount($id: ID!, $input: DiscountInput!) {
    updateDiscount(id: $id, input: $input) {
      id
      name
      type
      code
      minOrderAmount
      discountType
      discountValue
      isActive
      validFrom
      validTo
      profiles {
        id
        profile {
          id
          name
        }
      }
      createdAt
      updatedAt
    }
  }
`

export const DELETE_DISCOUNT = gql`
  mutation DeleteDiscount($id: ID!) {
    deleteDiscount(id: $id)
  }
`

// Обновление баланса клиента
export const UPDATE_CLIENT_BALANCE = gql`
  mutation UpdateClientBalance($id: ID!, $newBalance: Float!, $comment: String) {
    updateClientBalance(id: $id, newBalance: $newBalance, comment: $comment) {
      id
      balance
      balanceHistory {
        id
        userId
        user {
          id
          firstName
          lastName
          email
        }
        oldValue
        newValue
        comment
        createdAt
      }
    }
  }
`

// Транспорт клиента
export const CREATE_CLIENT_VEHICLE = gql`
  mutation CreateClientVehicle($clientId: ID!, $input: ClientVehicleInput!) {
    createClientVehicle(clientId: $clientId, input: $input) {
      id
      name
      vin
      frame
      licensePlate
      brand
      model
      modification
      year
      mileage
      comment
      createdAt
    }
  }
`

export const UPDATE_CLIENT_VEHICLE = gql`
  mutation UpdateClientVehicle($id: ID!, $input: ClientVehicleInput!) {
    updateClientVehicle(id: $id, input: $input) {
      id
      name
      vin
      frame
      licensePlate
      brand
      model
      modification
      year
      mileage
      comment
      createdAt
    }
  }
`

export const DELETE_CLIENT_VEHICLE = gql`
  mutation DeleteClientVehicle($id: ID!) {
    deleteClientVehicle(id: $id)
  }
`

// Адреса доставки
export const CREATE_CLIENT_DELIVERY_ADDRESS = gql`
  mutation CreateClientDeliveryAddress($clientId: ID!, $input: ClientDeliveryAddressInput!) {
    createClientDeliveryAddress(clientId: $clientId, input: $input) {
      id
      name
      address
      deliveryType
      comment
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CLIENT_DELIVERY_ADDRESS = gql`
  mutation UpdateClientDeliveryAddress($id: ID!, $input: ClientDeliveryAddressInput!) {
    updateClientDeliveryAddress(id: $id, input: $input) {
      id
      name
      address
      deliveryType
      comment
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CLIENT_DELIVERY_ADDRESS = gql`
  mutation DeleteClientDeliveryAddress($id: ID!) {
    deleteClientDeliveryAddress(id: $id)
  }
`

// Контакты клиента
export const CREATE_CLIENT_CONTACT = gql`
  mutation CreateClientContact($clientId: ID!, $input: ClientContactInput!) {
    createClientContact(clientId: $clientId, input: $input) {
      id
      phone
      email
      comment
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CLIENT_CONTACT = gql`
  mutation UpdateClientContact($id: ID!, $input: ClientContactInput!) {
    updateClientContact(id: $id, input: $input) {
      id
      phone
      email
      comment
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CLIENT_CONTACT = gql`
  mutation DeleteClientContact($id: ID!) {
    deleteClientContact(id: $id)
  }
`

// Договоры
export const CREATE_CLIENT_CONTRACT = gql`
  mutation CreateClientContract($clientId: ID!, $input: ClientContractInput!) {
    createClientContract(clientId: $clientId, input: $input) {
      id
      contractNumber
      contractDate
      name
      ourLegalEntity
      clientLegalEntity
      balance
      currency
      isActive
      isDefault
      contractType
      relationship
      paymentDelay
      creditLimit
      delayDays
      fileUrl
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CLIENT_CONTRACT = gql`
  mutation UpdateClientContract($id: ID!, $input: ClientContractInput!) {
    updateClientContract(id: $id, input: $input) {
      id
      contractNumber
      contractDate
      name
      ourLegalEntity
      clientLegalEntity
      balance
      currency
      isActive
      isDefault
      contractType
      relationship
      paymentDelay
      creditLimit
      delayDays
      fileUrl
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CLIENT_CONTRACT = gql`
  mutation DeleteClientContract($id: ID!) {
    deleteClientContract(id: $id)
  }
`

// Юридические лица
export const CREATE_CLIENT_LEGAL_ENTITY = gql`
  mutation CreateClientLegalEntity($clientId: ID!, $input: ClientLegalEntityInput!) {
    createClientLegalEntity(clientId: $clientId, input: $input) {
      id
      shortName
      fullName
      form
      legalAddress
      actualAddress
      taxSystem
      responsiblePhone
      responsiblePosition
      responsibleName
      accountant
      signatory
      registrationReasonCode
      ogrn
      inn
      vatPercent
      bankDetails {
        id
        name
        accountNumber
        bankName
        bik
        correspondentAccount
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CLIENT_LEGAL_ENTITY = gql`
  mutation UpdateClientLegalEntity($id: ID!, $input: ClientLegalEntityInput!) {
    updateClientLegalEntity(id: $id, input: $input) {
      id
      shortName
      fullName
      form
      legalAddress
      actualAddress
      taxSystem
      responsiblePhone
      responsiblePosition
      responsibleName
      accountant
      signatory
      registrationReasonCode
      ogrn
      inn
      vatPercent
      bankDetails {
        id
        name
        accountNumber
        bankName
        bik
        correspondentAccount
        createdAt
        updatedAt
      }
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CLIENT_LEGAL_ENTITY = gql`
  mutation DeleteClientLegalEntity($id: ID!) {
    deleteClientLegalEntity(id: $id)
  }
`

// Банковские реквизиты
export const CREATE_CLIENT_BANK_DETAILS = gql`
  mutation CreateClientBankDetails($legalEntityId: ID!, $input: ClientBankDetailsInput!) {
    createClientBankDetails(legalEntityId: $legalEntityId, input: $input) {
      id
      legalEntityId
      legalEntity {
        id
        shortName
        inn
      }
      name
      accountNumber
      bankName
      bik
      correspondentAccount
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_CLIENT_BANK_DETAILS = gql`
  mutation UpdateClientBankDetails($id: ID!, $input: ClientBankDetailsInput!) {
    updateClientBankDetails(id: $id, input: $input) {
      id
      legalEntityId
      legalEntity {
        id
        shortName
        inn
      }
      name
      accountNumber
      bankName
      bik
      correspondentAccount
      createdAt
      updatedAt
    }
  }
`

export const DELETE_CLIENT_BANK_DETAILS = gql`
  mutation DeleteClientBankDetails($id: ID!) {
    deleteClientBankDetails(id: $id)
  }
`

// Авторизация клиентов
export const CHECK_CLIENT_BY_PHONE = gql`
  mutation CheckClientByPhone($phone: String!) {
    checkClientByPhone(phone: $phone) {
      exists
      client {
        id
        clientNumber
        name
        phone
        email
      }
      sessionId
    }
  }
`

export const SEND_SMS_CODE = gql`
  mutation SendSMSCode($phone: String!, $sessionId: String) {
    sendSMSCode(phone: $phone, sessionId: $sessionId) {
      success
      sessionId
      code
    }
  }
`

export const VERIFY_CODE = gql`
  mutation VerifyCode($phone: String!, $code: String!, $sessionId: String!) {
    verifyCode(phone: $phone, code: $code, sessionId: $sessionId) {
      success
      client {
        id
        clientNumber
        name
        phone
        email
      }
      token
    }
  }
`

export const REGISTER_NEW_CLIENT = gql`
  mutation RegisterNewClient($phone: String!, $name: String!, $sessionId: String!) {
    registerNewClient(phone: $phone, name: $name, sessionId: $sessionId) {
      success
      client {
        id
        clientNumber
        name
        phone
        email
      }
      token
    }
  }
` 