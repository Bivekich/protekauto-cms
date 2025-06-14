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
    contractDate: DateTime
    name: String!
    ourLegalEntity: String
    clientLegalEntity: String
    balance: Float
    currency: String
    isActive: Boolean
    isDefault: Boolean
    contractType: String
    relationship: String
    paymentDelay: Boolean
    creditLimit: Float
    delayDays: Int
    fileUrl: String
  }

  input ClientLegalEntityInput {
    shortName: String!
    fullName: String
    form: String
    legalAddress: String
    actualAddress: String
    taxSystem: String
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
    
    # Laximo интеграция
    laximoBrands: [LaximoBrand!]!
    laximoCatalogInfo(catalogCode: String!): LaximoCatalogInfo
    laximoWizard2(catalogCode: String!, ssd: String): [LaximoWizardStep!]!
    laximoFindVehicle(catalogCode: String!, vin: String!): [LaximoVehicleSearchResult!]!
    laximoFindVehicleByWizard(catalogCode: String!, ssd: String!): [LaximoVehicleSearchResult!]!
    laximoFindVehicleByPlate(catalogCode: String!, plateNumber: String!): [LaximoVehicleSearchResult!]!
    laximoFindVehicleByPlateGlobal(plateNumber: String!): [LaximoVehicleSearchResult!]!
    laximoFindPartReferences(partNumber: String!): [String!]!
    laximoFindApplicableVehicles(catalogCode: String!, partNumber: String!): [LaximoVehicleSearchResult!]!
    laximoFindVehiclesByPartNumber(partNumber: String!): LaximoVehiclesByPartResult!
    laximoVehicleInfo(catalogCode: String!, vehicleId: String!, ssd: String, localized: Boolean!): LaximoVehicleInfo
    laximoQuickGroups(catalogCode: String!, vehicleId: String, ssd: String): [LaximoQuickGroup!]!
    laximoCategories(catalogCode: String!, vehicleId: String, ssd: String): [LaximoQuickGroup!]!
    laximoUnits(catalogCode: String!, vehicleId: String, ssd: String, categoryId: String): [LaximoQuickGroup!]!
    laximoQuickDetail(catalogCode: String!, vehicleId: String!, quickGroupId: String!, ssd: String!): LaximoQuickDetail
    laximoOEMSearch(catalogCode: String!, vehicleId: String!, oemNumber: String!, ssd: String!): LaximoOEMResult
    laximoFulltextSearch(catalogCode: String!, vehicleId: String!, searchQuery: String!, ssd: String!): LaximoFulltextSearchResult
    laximoDocFindOEM(oemNumber: String!, brand: String, replacementTypes: String): LaximoDocFindOEMResult
    
    # Запросы для работы с деталями узлов
    laximoUnitInfo(catalogCode: String!, vehicleId: String!, unitId: String!, ssd: String!): LaximoUnitInfo
    laximoUnitDetails(catalogCode: String!, vehicleId: String!, unitId: String!, ssd: String!): [LaximoUnitDetail!]!
    laximoUnitImageMap(catalogCode: String!, vehicleId: String!, unitId: String!, ssd: String!): LaximoUnitImageMap
    
    # Поиск товаров и предложений
    searchProductOffers(articleNumber: String!, brand: String): ProductOffersResult!
    
    # Заказы и платежи
    orders(clientId: String, status: OrderStatus, search: String, limit: Int, offset: Int): OrdersResponse!
    order(id: ID!): Order
    orderByNumber(orderNumber: String!): Order
    payments(orderId: String, status: PaymentStatus): [Payment!]!
    payment(id: ID!): Payment
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
    code: String # Только для разработки
    messageId: String # ID сообщения от SMS API
    message: String # Дополнительная информация
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
    importProducts(input: ImportProductsInput!): ImportResult!
    
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
    
    # Заказы и платежи
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    confirmPayment(orderId: ID!): Order!
    updateOrderClient(id: ID!, clientId: String!): Order!
    cancelOrder(id: ID!): Order!
    deleteOrder(id: ID!): Boolean!
    createPayment(input: CreatePaymentInput!): CreatePaymentResult!
    cancelPayment(id: ID!): Payment!
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

  # Laximo интеграция
  type LaximoBrand {
    brand: String!
    code: String!
    icon: String!
    name: String!
    supportdetailapplicability: Boolean!
    supportparameteridentification2: Boolean!
    supportquickgroups: Boolean!
    supportvinsearch: Boolean!
    supportframesearch: Boolean
    vinexample: String
    frameexample: String
    features: [LaximoFeature!]!
    extensions: LaximoExtensions
  }

  type LaximoFeature {
    name: String!
    example: String
  }

  type LaximoExtensions {
    operations: [LaximoOperation!]
  }

  type LaximoOperation {
    description: String!
    kind: String!
    name: String!
    fields: [LaximoField!]!
  }

  type LaximoField {
    description: String!
    example: String
    name: String!
    pattern: String
  }

  # Новые типы для поиска автомобилей
  type LaximoCatalogInfo {
    brand: String!
    code: String!
    icon: String!
    name: String!
    supportdetailapplicability: Boolean!
    supportparameteridentification2: Boolean!
    supportquickgroups: Boolean!
    supportvinsearch: Boolean!
    vinexample: String
    features: [LaximoFeature!]!
    permissions: [String!]!
  }

  type LaximoWizardStep {
    allowlistvehicles: Boolean!
    automatic: Boolean!
    conditionid: String!
    determined: Boolean!
    name: String!
    type: String!
    ssd: String
    value: String
    valueid: String
    options: [LaximoWizardOption!]!
  }

  type LaximoWizardOption {
    key: String!
    value: String!
  }

  type LaximoVehicleSearchResult {
    vehicleid: String!
    name: String
    brand: String!
    catalog: String
    model: String!
    modification: String!
    year: String!
    bodytype: String!
    engine: String!
    notes: String
    ssd: String
  }

  type LaximoVehicleInfo {
    vehicleid: String!
    name: String!
    ssd: String!
    brand: String!
    catalog: String!
    attributes: [LaximoVehicleAttribute!]!
  }

  type LaximoVehicleAttribute {
    key: String!
    name: String!
    value: String!
  }

  type LaximoQuickGroup {
    quickgroupid: String!
    name: String!
    link: Boolean!
    children: [LaximoQuickGroup!]
  }

  type LaximoQuickDetail {
    quickgroupid: String!
    name: String!
    units: [LaximoUnit!]
  }

  type LaximoUnit {
    unitid: String!
    name: String!
    code: String
    description: String
    details: [LaximoDetail!]
  }

  type LaximoDetail {
    detailid: String!
    name: String!
    oem: String!
    brand: String
    description: String
    applicablemodels: String
    note: String
    attributes: [LaximoDetailAttribute!]
  }

  type LaximoDetailAttribute {
    key: String!
    name: String
    value: String!
  }

  type LaximoOEMResult {
    oemNumber: String!
    categories: [LaximoOEMCategory!]!
  }

  type LaximoOEMCategory {
    categoryid: String!
    name: String!
    units: [LaximoOEMUnit!]!
  }

  type LaximoOEMUnit {
    unitid: String!
    name: String!
    code: String
    imageurl: String
    details: [LaximoOEMDetail!]!
  }

  type LaximoOEMDetail {
    detailid: String!
    name: String!
    oem: String!
    brand: String
    amount: String
    range: String
    attributes: [LaximoDetailAttribute!]
  }

  # Новые типы для поиска деталей по названию
  type LaximoFulltextSearchResult {
    searchQuery: String!
    details: [LaximoFulltextDetail!]!
  }

  type LaximoFulltextDetail {
    oem: String!
    name: String!
    brand: String
    description: String
  }

  # Типы для Doc FindOEM
  type LaximoDocFindOEMResult {
    details: [LaximoDocDetail!]!
  }

  type LaximoDocDetail {
    detailid: String!
    formattedoem: String!
    manufacturer: String!
    manufacturerid: String!
    name: String!
    oem: String!
    volume: String
    weight: String
    replacements: [LaximoDocReplacement!]!
  }

  type LaximoDocReplacement {
    type: String!
    way: String!
    replacementid: String!
    rate: String
    detail: LaximoDocReplacementDetail!
  }

  type LaximoDocReplacementDetail {
    detailid: String!
    formattedoem: String!
    manufacturer: String!
    manufacturerid: String!
    name: String!
    oem: String!
    weight: String
    icon: String
  }

  type LaximoCatalogVehicleResult {
    catalogCode: String!
    catalogName: String!
    brand: String!
    vehicles: [LaximoVehicleSearchResult!]!
    vehicleCount: Int!
  }

  type LaximoVehiclesByPartResult {
    partNumber: String!
    catalogs: [LaximoCatalogVehicleResult!]!
    totalVehicles: Int!
  }

  # Типы для работы с деталями узлов
  type LaximoUnitInfo {
    unitid: String!
    name: String!
    code: String
    description: String
    imageurl: String
    largeimageurl: String
    attributes: [LaximoVehicleAttribute!]
  }

  type LaximoUnitDetail {
    detailid: String!
    name: String!
    oem: String
    brand: String
    codeonimage: String
    code: String
    note: String
    filter: String
    price: String
    availability: String
    description: String
    applicablemodels: String
    attributes: [LaximoVehicleAttribute!]
  }

  type LaximoUnitImageMap {
    unitid: String!
    imageurl: String
    largeimageurl: String
    coordinates: [LaximoImageCoordinate!]!
  }

  type LaximoImageCoordinate {
    detailid: String!
    codeonimage: String
    x: Int!
    y: Int!
    width: Int!
    height: Int!
    shape: String!
  }

  # Типы для импорта товаров
  input ImportProductsInput {
    file: String!
    categoryId: String
    replaceExisting: Boolean
  }

  type ImportResult {
    success: Int!
    errors: [String!]!
    total: Int!
    warnings: [String!]!
  }

  type ImportPreview {
    headers: [String!]!
    sampleData: [[String!]!]!
    totalRows: Int!
    mapping: ImportMapping!
  }

  type ImportMapping {
    name: String
    article: String
    description: String
    wholesalePrice: String
    retailPrice: String
    stock: String
    unit: String
    weight: String
    dimensions: String
    category: String
  }

  # Типы для поиска товаров и предложений
  type ProductOffersResult {
    articleNumber: String!
    brand: String!
    name: String!
    internalOffers: [InternalOffer!]!
    externalOffers: [ExternalOffer!]!
    analogs: [AnalogProduct!]!
    hasInternalStock: Boolean!
    totalOffers: Int!
  }

  type InternalOffer {
    id: ID!
    productId: ID!
    price: Float!
    quantity: Int!
    warehouse: String!
    deliveryDays: Int!
    available: Boolean!
    rating: Float
    supplier: String!
  }

  type ExternalOffer {
    offerKey: String!
    brand: String!
    code: String!
    name: String!
    price: Float!
    currency: String!
    deliveryTime: Int!
    deliveryTimeMax: Int!
    quantity: Int!
    warehouse: String!
    supplier: String!
    comment: String
    weight: Float
    volume: Float
    canPurchase: Boolean!
  }

  type AnalogProduct {
    brand: String!
    articleNumber: String!
    name: String!
    type: String
    internalOffers: [InternalOffer!]!
    externalOffers: [ExternalOffer!]!
  }

  # Типы для заказов и платежей
  enum OrderStatus {
    PENDING
    PAID
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELED
    REFUNDED
  }

  enum PaymentStatus {
    PENDING
    WAITING_FOR_CAPTURE
    SUCCEEDED
    CANCELED
    REFUNDED
  }

  type Order {
    id: ID!
    orderNumber: String!
    clientId: String
    client: Client
    clientEmail: String
    clientPhone: String
    clientName: String
    status: OrderStatus!
    totalAmount: Float!
    discountAmount: Float!
    finalAmount: Float!
    currency: String!
    items: [OrderItem!]!
    payments: [Payment!]!
    deliveryAddress: String
    comment: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type OrdersResponse {
    orders: [Order!]!
    total: Int!
    hasMore: Boolean!
  }

  type OrderItem {
    id: ID!
    orderId: String!
    productId: String
    product: Product
    externalId: String
    name: String!
    article: String
    brand: String
    price: Float!
    quantity: Int!
    totalPrice: Float!
    createdAt: DateTime!
  }

  type Payment {
    id: ID!
    orderId: String!
    order: Order!
    yookassaPaymentId: String!
    status: PaymentStatus!
    amount: Float!
    currency: String!
    paymentMethod: String
    description: String
    confirmationUrl: String
    createdAt: DateTime!
    updatedAt: DateTime!
    paidAt: DateTime
    canceledAt: DateTime
  }

  # Входные типы для создания заказа
  input CreateOrderInput {
    clientId: String
    clientEmail: String
    clientPhone: String
    clientName: String
    items: [OrderItemInput!]!
    deliveryAddress: String
    comment: String
  }

  input OrderItemInput {
    productId: String
    externalId: String
    name: String!
    article: String
    brand: String
    price: Float!
    quantity: Int!
  }

  # Входные типы для создания платежа
  input CreatePaymentInput {
    orderId: String!
    returnUrl: String!
    description: String
  }

  # Результат создания платежа
  type CreatePaymentResult {
    payment: Payment!
    confirmationUrl: String!
  }
` 