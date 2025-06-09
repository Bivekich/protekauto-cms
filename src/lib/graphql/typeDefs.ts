import { gql } from 'graphql-tag'

export const typeDefs = gql`
  enum UserRole {
    ADMIN
    MODERATOR
    USER
  }

  enum AuditAction {
    USER_LOGIN
    USER_LOGOUT
    USER_CREATE
    USER_UPDATE
    USER_DELETE
    PASSWORD_CHANGE
    AVATAR_UPLOAD
    PROFILE_UPDATE
    CATEGORY_CREATE
    CATEGORY_UPDATE
    CATEGORY_DELETE
    PRODUCT_CREATE
    PRODUCT_UPDATE
    PRODUCT_DELETE
  }

  scalar DateTime

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    avatar: String
    role: UserRole!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuditLog {
    id: ID!
    userId: ID!
    user: User!
    action: AuditAction!
    details: String
    ipAddress: String
    userAgent: String
    createdAt: DateTime!
  }

  type CategoryCount {
    products: Int!
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
    description: String
    seoTitle: String
    seoDescription: String
    image: String
    isHidden: Boolean!
    includeSubcategoryProducts: Boolean!
    parentId: String
    parent: Category
    children: [Category!]!
    products: [Product!]!
    _count: CategoryCount
    level: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Product {
    id: ID!
    name: String!
    slug: String!
    article: String
    description: String
    videoUrl: String
    wholesalePrice: Float
    retailPrice: Float
    weight: Float
    dimensions: String
    unit: String!
    isVisible: Boolean!
    applyDiscounts: Boolean!
    stock: Int!
    categories: [Category!]!
    images: [ProductImage!]!
    options: [ProductOption!]!
    characteristics: [ProductCharacteristic!]!
    relatedProducts: [Product!]!
    accessoryProducts: [Product!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductImage {
    id: ID!
    url: String!
    alt: String
    order: Int!
    productId: String!
    createdAt: DateTime!
  }

  type Option {
    id: ID!
    name: String!
    type: OptionType!
    values: [OptionValue!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OptionValue {
    id: ID!
    value: String!
    price: Float!
    optionId: String!
    createdAt: DateTime!
  }

  type ProductOption {
    id: ID!
    productId: String!
    optionId: String!
    option: Option!
    optionValueId: String!
    optionValue: OptionValue!
  }

  type Characteristic {
    id: ID!
    name: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductCharacteristic {
    id: ID!
    value: String!
    productId: String!
    characteristicId: String!
    characteristic: Characteristic!
  }

  enum OptionType {
    SINGLE
    MULTIPLE
  }

  enum ClientType {
    INDIVIDUAL
    LEGAL_ENTITY
  }

  enum DiscountType {
    PERCENTAGE
    FIXED_AMOUNT
  }

  enum MarkupType {
    PERCENTAGE
    FIXED_AMOUNT
  }

  enum PaymentType {
    CASH
    CARD
    BANK_TRANSFER
    ONLINE
    CREDIT
  }

  type Client {
    id: ID!
    clientNumber: String!
    type: ClientType!
    name: String!
    email: String
    phone: String!
    city: String
    markup: Float
    isConfirmed: Boolean!
    profileId: String
    profile: ClientProfile
    managerId: String
    manager: User
    balance: Float!
    comment: String
    emailNotifications: Boolean!
    smsNotifications: Boolean!
    pushNotifications: Boolean!
    legalEntityType: String
    legalEntityName: String
    inn: String
    kpp: String
    ogrn: String
    okpo: String
    legalAddress: String
    actualAddress: String
    bankAccount: String
    bankName: String
    bankBik: String
    correspondentAccount: String
    vehicles: [ClientVehicle!]!
    discounts: [ClientDiscount!]!
    deliveryAddresses: [ClientDeliveryAddress!]!
    contacts: [ClientContact!]!
    contracts: [ClientContract!]!
    legalEntities: [ClientLegalEntity!]!
    bankDetails: [ClientBankDetails!]!
    balanceHistory: [ClientBalanceHistory!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClientProfile {
    id: ID!
    code: String!
    name: String!
    description: String
    baseMarkup: Float!
    autoSendInvoice: Boolean!
    vinRequestModule: Boolean!
    clients: [Client!]!
    priceRangeMarkups: [ProfilePriceRangeMarkup!]!
    orderDiscounts: [ProfileOrderDiscount!]!
    supplierMarkups: [ProfileSupplierMarkup!]!
    brandMarkups: [ProfileBrandMarkup!]!
    categoryMarkups: [ProfileCategoryMarkup!]!
    excludedBrands: [ProfileExcludedBrand!]!
    excludedCategories: [ProfileExcludedCategory!]!
    paymentTypes: [ProfilePaymentType!]!
    _count: ClientProfileCount!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClientProfileCount {
    clients: Int!
  }

  type ProfilePriceRangeMarkup {
    id: ID!
    profileId: String!
    priceFrom: Float!
    priceTo: Float!
    markupType: MarkupType!
    markupValue: Float!
    createdAt: DateTime!
  }

  type ProfileOrderDiscount {
    id: ID!
    profileId: String!
    minOrderSum: Float!
    discountType: DiscountType!
    discountValue: Float!
    createdAt: DateTime!
  }

  type ProfileSupplierMarkup {
    id: ID!
    profileId: String!
    supplierName: String!
    markupType: MarkupType!
    markupValue: Float!
    createdAt: DateTime!
  }

  type ProfileBrandMarkup {
    id: ID!
    profileId: String!
    brandName: String!
    markupType: MarkupType!
    markupValue: Float!
    createdAt: DateTime!
  }

  type ProfileCategoryMarkup {
    id: ID!
    profileId: String!
    categoryName: String!
    markupType: MarkupType!
    markupValue: Float!
    createdAt: DateTime!
  }

  type ProfileExcludedBrand {
    id: ID!
    profileId: String!
    brandName: String!
    createdAt: DateTime!
  }

  type ProfileExcludedCategory {
    id: ID!
    profileId: String!
    categoryName: String!
    createdAt: DateTime!
  }

  type ProfilePaymentType {
    id: ID!
    profileId: String!
    paymentType: PaymentType!
    isEnabled: Boolean!
    createdAt: DateTime!
  }

  type ClientVehicle {
    id: ID!
    clientId: String!
    client: Client!
    name: String!
    vin: String
    frame: String
    licensePlate: String
    brand: String
    model: String
    modification: String
    year: Int
    mileage: Int
    comment: String
    createdAt: DateTime!
    updatedAt: DateTime
  }

  # Типы для гаража клиентов
  type VehicleSearchHistory {
    id: ID!
    vin: String!
    brand: String
    model: String
    searchDate: DateTime!
    searchQuery: String
  }

  type VehicleSearchResult {
    vin: String!
    brand: String
    model: String
    modification: String
    year: Int
    bodyType: String
    engine: String
    transmission: String
    drive: String
    fuel: String
  }

  input UserVehicleInput {
    name: String!
    vin: String
    frame: String
    licensePlate: String
    brand: String
    model: String
    modification: String
    year: Int
    mileage: Int
    comment: String
  }

  type ClientDeliveryAddress {
    id: ID!
    name: String!
    address: String!
    deliveryType: DeliveryType!
    comment: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClientContact {
    id: ID!
    phone: String
    email: String
    comment: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClientContract {
    id: ID!
    contractNumber: String!
    contractDate: DateTime!
    name: String!
    ourLegalEntity: String!
    clientLegalEntity: String!
    balance: Float!
    currency: String!
    isActive: Boolean!
    isDefault: Boolean!
    contractType: String!
    relationship: String!
    paymentDelay: Boolean!
    creditLimit: Float
    delayDays: Int
    fileUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClientLegalEntity {
    id: ID!
    shortName: String!
    fullName: String!
    form: String!
    legalAddress: String!
    actualAddress: String
    taxSystem: String!
    responsiblePhone: String
    responsiblePosition: String
    responsibleName: String
    accountant: String
    signatory: String
    registrationReasonCode: String
    ogrn: String
    inn: String!
    vatPercent: Float!
    bankDetails: [ClientBankDetails!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClientBankDetails {
    id: ID!
    legalEntityId: String
    legalEntity: ClientLegalEntity
    name: String!
    accountNumber: String!
    bankName: String!
    bik: String!
    correspondentAccount: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClientBalanceHistory {
    id: ID!
    userId: String!
    user: User!
    oldValue: Float!
    newValue: Float!
    comment: String
    createdAt: DateTime!
  }

  enum DeliveryType {
    COURIER
    PICKUP
    POST
    TRANSPORT
  }

  type ClientDiscount {
    id: ID!
    clientId: String!
    client: Client!
    name: String!
    type: DiscountType!
    value: Float!
    isActive: Boolean!
    validFrom: DateTime
    validTo: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ClientStatus {
    id: ID!
    name: String!
    color: String!
    description: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input CreateUserInput {
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    avatar: String
    role: UserRole
  }

  input UpdateProfileInput {
    firstName: String
    lastName: String
    email: String
    avatar: String
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    email: String
    avatar: String
    role: UserRole
  }

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input AdminChangePasswordInput {
    userId: ID!
    newPassword: String!
  }

  input CategoryInput {
    name: String!
    slug: String
    description: String
    seoTitle: String
    seoDescription: String
    image: String
    isHidden: Boolean
    includeSubcategoryProducts: Boolean
    parentId: String
  }

  input ProductInput {
    name: String!
    slug: String
    article: String
    description: String
    videoUrl: String
    wholesalePrice: Float
    retailPrice: Float
    weight: Float
    dimensions: String
    unit: String
    isVisible: Boolean
    applyDiscounts: Boolean
    stock: Int
    categoryIds: [String!]
  }

  input ProductImageInput {
    url: String!
    alt: String
    order: Int
  }

  input OptionInput {
    name: String!
    type: OptionType!
    values: [OptionValueInput!]!
  }

  input OptionValueInput {
    value: String!
    price: Float
  }

  input CharacteristicInput {
    name: String!
    value: String!
  }

  input ProductOptionInput {
    name: String!
    type: OptionType!
    values: [OptionValueInput!]!
  }

  input ClientInput {
    clientNumber: String
    type: ClientType!
    name: String!
    email: String
    phone: String!
    city: String
    markup: Float
    isConfirmed: Boolean
    profileId: String
    managerId: String
    balance: Float
    comment: String
    emailNotifications: Boolean
    smsNotifications: Boolean
    pushNotifications: Boolean
    legalEntityType: String
    legalEntityName: String
    inn: String
    kpp: String
    ogrn: String
    okpo: String
    legalAddress: String
    actualAddress: String
    bankAccount: String
    bankName: String
    bankBik: String
    correspondentAccount: String
  }

  input ClientVehicleInput {
    name: String!
    vin: String
    frame: String
    licensePlate: String
    brand: String
    model: String
    modification: String
    year: Int
    mileage: Int
    comment: String
  }

  input ClientDeliveryAddressInput {
    name: String!
    address: String!
    deliveryType: DeliveryType!
    comment: String
  }

  input ClientContactInput {
    phone: String
    email: String
    comment: String
  }

  input ClientContractInput {
    contractNumber: String!
    contractDate: DateTime!
    name: String!
    ourLegalEntity: String!
    clientLegalEntity: String!
    balance: Float
    currency: String
    isActive: Boolean
    isDefault: Boolean
    contractType: String!
    relationship: String!
    paymentDelay: Boolean
    creditLimit: Float
    delayDays: Int
    fileUrl: String
  }

  input ClientLegalEntityInput {
    shortName: String!
    fullName: String!
    form: String!
    legalAddress: String!
    actualAddress: String
    taxSystem: String!
    responsiblePhone: String
    responsiblePosition: String
    responsibleName: String
    accountant: String
    signatory: String
    registrationReasonCode: String
    ogrn: String
    inn: String!
    vatPercent: Float
  }

  input ClientBankDetailsInput {
    name: String!
    accountNumber: String!
    bankName: String!
    bik: String!
    correspondentAccount: String!
  }

  input ClientProfileInput {
    code: String
    name: String!
    description: String
    baseMarkup: Float!
    autoSendInvoice: Boolean
    vinRequestModule: Boolean
    priceRangeMarkups: [ProfilePriceRangeMarkupInput!]
    orderDiscounts: [ProfileOrderDiscountInput!]
    supplierMarkups: [ProfileSupplierMarkupInput!]
    brandMarkups: [ProfileBrandMarkupInput!]
    categoryMarkups: [ProfileCategoryMarkupInput!]
    excludedBrands: [String!]
    excludedCategories: [String!]
    paymentTypes: [ProfilePaymentTypeInput!]
  }

  input ProfilePriceRangeMarkupInput {
    priceFrom: Float!
    priceTo: Float!
    markupType: MarkupType!
    markupValue: Float!
  }

  input ProfileOrderDiscountInput {
    minOrderSum: Float!
    discountType: DiscountType!
    discountValue: Float!
  }

  input ProfileSupplierMarkupInput {
    supplierName: String!
    markupType: MarkupType!
    markupValue: Float!
  }

  input ProfileBrandMarkupInput {
    brandName: String!
    markupType: MarkupType!
    markupValue: Float!
  }

  input ProfileCategoryMarkupInput {
    categoryName: String!
    markupType: MarkupType!
    markupValue: Float!
  }

  input ProfilePaymentTypeInput {
    paymentType: PaymentType!
    isEnabled: Boolean!
  }

  input ClientVehicleInput {
    vin: String
    frame: String
    licensePlate: String
    brand: String
    model: String
    year: Int
  }

  input ClientDiscountInput {
    name: String!
    type: DiscountType!
    value: Float!
    isActive: Boolean
    validFrom: DateTime
    validTo: DateTime
  }

  input ClientStatusInput {
    name: String!
    color: String
    description: String
  }

  input ClientFilterInput {
    type: ClientType
    registeredFrom: DateTime
    registeredTo: DateTime
    unconfirmed: Boolean
    vehicleSearch: String
    profileId: String
  }

  type ProductHistory {
    id: ID!
    action: String!
    changes: String
    userId: ID!
    user: User!
    createdAt: DateTime!
  }

  type Query {
    users: [User!]!
    user(id: ID!): User
    hasUsers: Boolean!
    me: User
    auditLogs(limit: Int, offset: Int): [AuditLog!]!
    auditLogsCount: Int!
    
    # Каталог
    categories: [Category!]!
    category(id: ID!): Category
    categoryBySlug(slug: String!): Category
    products(categoryId: String, search: String, limit: Int, offset: Int): [Product!]!
    product(id: ID!): Product
    productBySlug(slug: String!): Product
    productHistory(productId: ID!): [ProductHistory!]!
    options: [Option!]!
    characteristics: [Characteristic!]!
    
    # Клиенты
    clients(filter: ClientFilterInput, search: String, limit: Int, offset: Int, sortBy: String, sortOrder: String): [Client!]!
    client(id: ID!): Client
    clientsCount(filter: ClientFilterInput, search: String): Int!
    clientProfiles: [ClientProfile!]!
    clientProfile(id: ID!): ClientProfile
    clientStatuses: [ClientStatus!]!
    clientStatus(id: ID!): ClientStatus
    
    # Скидки и промокоды
    discounts: [Discount!]!
    discount(id: ID!): Discount
    
    # Гараж клиентов
    userVehicles: [ClientVehicle!]!
    vehicleSearchHistory: [VehicleSearchHistory!]!
    searchVehicleByVin(vin: String!): VehicleSearchResult
    
    # Данные авторизованного клиента
    clientMe: Client
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type ClientAuthResponse {
    exists: Boolean!
    client: Client
    sessionId: String
  }

  type SMSCodeResponse {
    success: Boolean!
    sessionId: String!
    code: String!
  }

  type VerificationResponse {
    success: Boolean!
    client: Client
    token: String
  }

  type BulkOperationResult {
    count: Int!
  }

  type ExportResult {
    url: String!
    filename: String!
    count: Int!
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    login(input: LoginInput!): AuthPayload!
    logout: Boolean!
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!
    uploadAvatar(file: String!): User!
    
    # Админские мутации для управления пользователями
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
    adminChangePassword(input: AdminChangePasswordInput!): Boolean!
    
    # Категории
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    
    # Товары
    createProduct(input: ProductInput!, images: [ProductImageInput!], characteristics: [CharacteristicInput!], options: [ProductOptionInput!]): Product!
    updateProduct(id: ID!, input: ProductInput!, images: [ProductImageInput!], characteristics: [CharacteristicInput!], options: [ProductOptionInput!]): Product!
    deleteProduct(id: ID!): Boolean!
    updateProductVisibility(id: ID!, isVisible: Boolean!): Product!
    
    # Массовые операции с товарами
    deleteProducts(ids: [ID!]!): BulkOperationResult!
    updateProductsVisibility(ids: [ID!]!, isVisible: Boolean!): BulkOperationResult!
    exportProducts(categoryId: String, search: String, format: String): ExportResult!
    
    # Опции
    createOption(input: OptionInput!): Option!
    updateOption(id: ID!, input: OptionInput!): Option!
    deleteOption(id: ID!): Boolean!
    
    # Клиенты
    createClient(input: ClientInput!, vehicles: [ClientVehicleInput!], discounts: [ClientDiscountInput!]): Client!
    updateClient(id: ID!, input: ClientInput!, vehicles: [ClientVehicleInput!], discounts: [ClientDiscountInput!]): Client!
    deleteClient(id: ID!): Boolean!
    confirmClient(id: ID!): Client!
    exportClients(filter: ClientFilterInput, search: String, format: String): ExportResult!
    updateClientBalance(id: ID!, newBalance: Float!, comment: String): Client!
    
    # Транспорт клиента
    createClientVehicle(clientId: ID!, input: ClientVehicleInput!): ClientVehicle!
    updateClientVehicle(id: ID!, input: ClientVehicleInput!): ClientVehicle!
    deleteClientVehicle(id: ID!): Boolean!
    
    # Адреса доставки
    createClientDeliveryAddress(clientId: ID!, input: ClientDeliveryAddressInput!): ClientDeliveryAddress!
    updateClientDeliveryAddress(id: ID!, input: ClientDeliveryAddressInput!): ClientDeliveryAddress!
    deleteClientDeliveryAddress(id: ID!): Boolean!
    
    # Контакты клиента
    createClientContact(clientId: ID!, input: ClientContactInput!): ClientContact!
    updateClientContact(id: ID!, input: ClientContactInput!): ClientContact!
    deleteClientContact(id: ID!): Boolean!
    
    # Договоры
    createClientContract(clientId: ID!, input: ClientContractInput!): ClientContract!
    updateClientContract(id: ID!, input: ClientContractInput!): ClientContract!
    deleteClientContract(id: ID!): Boolean!
    
    # Юридические лица
    createClientLegalEntity(clientId: ID!, input: ClientLegalEntityInput!): ClientLegalEntity!
    updateClientLegalEntity(id: ID!, input: ClientLegalEntityInput!): ClientLegalEntity!
    deleteClientLegalEntity(id: ID!): Boolean!
    
    # Банковские реквизиты
    createClientBankDetails(legalEntityId: ID!, input: ClientBankDetailsInput!): ClientBankDetails!
    updateClientBankDetails(id: ID!, input: ClientBankDetailsInput!): ClientBankDetails!
    deleteClientBankDetails(id: ID!): Boolean!
    
    # Профили клиентов
    createClientProfile(input: ClientProfileInput!): ClientProfile!
    updateClientProfile(id: ID!, input: ClientProfileInput!): ClientProfile!
    deleteClientProfile(id: ID!): Boolean!
    
    # Статусы клиентов
    createClientStatus(input: ClientStatusInput!): ClientStatus!
    updateClientStatus(id: ID!, input: ClientStatusInput!): ClientStatus!
    deleteClientStatus(id: ID!): Boolean!
    
    # Скидки и промокоды
    createDiscount(input: DiscountInput!): Discount!
    updateDiscount(id: ID!, input: DiscountInput!): Discount!
    deleteDiscount(id: ID!): Boolean!
    
    # Авторизация клиентов
    checkClientByPhone(phone: String!): ClientAuthResponse!
    sendSMSCode(phone: String!, sessionId: String): SMSCodeResponse!
    verifyCode(phone: String!, code: String!, sessionId: String!): VerificationResponse!
    registerNewClient(phone: String!, name: String!, sessionId: String!): VerificationResponse!
    
    # Гараж клиентов
    createUserVehicle(input: UserVehicleInput!): ClientVehicle!
    updateUserVehicle(id: ID!, input: UserVehicleInput!): ClientVehicle!
    deleteUserVehicle(id: ID!): Boolean!
    addVehicleFromSearch(vin: String!, comment: String): ClientVehicle!
    deleteSearchHistoryItem(id: ID!): Boolean!
    
    # Обновление данных авторизованного клиента
    updateClientMe(input: ClientInput!): Client!
    
    # Создание юр. лица для авторизованного клиента
    createClientLegalEntityMe(input: ClientLegalEntityInput!): ClientLegalEntity!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  # Скидки и промокоды
  type Discount {
    id: ID!
    name: String!
    type: DiscountCodeType!
    code: String
    minOrderAmount: Float
    discountType: DiscountType!
    discountValue: Float!
    isActive: Boolean!
    validFrom: DateTime
    validTo: DateTime
    profiles: [DiscountProfile!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type DiscountProfile {
    id: ID!
    discountId: String!
    discount: Discount!
    profileId: String!
    profile: ClientProfile!
    createdAt: DateTime!
  }

  enum DiscountCodeType {
    DISCOUNT
    PROMOCODE
  }

  input DiscountInput {
    name: String!
    type: DiscountCodeType!
    code: String
    minOrderAmount: Float
    discountType: DiscountType!
    discountValue: Float!
    isActive: Boolean
    validFrom: DateTime
    validTo: DateTime
    profileIds: [String!]
  }
` 