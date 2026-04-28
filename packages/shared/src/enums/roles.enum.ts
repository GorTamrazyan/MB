export enum Role {
  CLIENT = 'CLIENT',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  INVOICE = 'INVOICE',
  CASH = 'CASH',
}

export enum PriceType {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  CUSTOM = 'CUSTOM',
}

export enum AddressType {
  MAIN = 'MAIN',
  BRANCH = 'BRANCH',
  BILLING = 'BILLING',
}

export enum ItemType {
  SERVICE = 'SERVICE',
  PACKAGE = 'PACKAGE',
}

export enum ItemStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
