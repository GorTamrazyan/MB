import { Role, OrderStatus, PaymentStatus, PaymentMethod, PriceType, ItemType, ItemStatus } from '../enums/roles.enum';

export interface User {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
}

export interface Company {
  id: string;
  userId: string;
  companyName: string;
  legalName: string;
  taxId: string | null;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parentId: string | null;
  children?: Category[];
}

export interface Service {
  id: string;
  companyId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  priceType: PriceType;
  duration: string | null;
  isActive: boolean;
  viewsCount: number;
  images: ServiceImage[];
  company?: Company;
  category?: Category;
  createdAt: string;
}

export interface ServiceImage {
  id: string;
  serviceId: string;
  imageUrl: string;
  altText: string | null;
  order: number;
  isPrimary: boolean;
}

export interface Package {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  description: string | null;
  totalPrice: number;
  discountPercent: number;
  finalPrice: number;
  services?: PackageService[];
  company?: Company;
}

export interface PackageService {
  id: string;
  packageId: string;
  serviceId: string;
  quantity: number;
  priceOverride: number | null;
  service?: Service;
}

export interface CartItem {
  id: string;
  type: ItemType;
  companyId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  companyId: string;
  itemType: ItemType;
  itemId: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  itemStatus: ItemStatus;
}

export interface Review {
  id: string;
  companyId: string;
  userId: string;
  orderId: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: string;
  user?: Pick<User, 'id' | 'email'>;
  userProfile?: Pick<UserProfile, 'firstName' | 'lastName' | 'avatarUrl'>;
}

export interface PortfolioItem {
  id: string;
  companyId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  projectUrl: string | null;
  clientName: string | null;
  completionDate: string | null;
  tags: string[];
  order: number;
  isFeatured: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  code?: string;
  fields?: Record<string, string[]>;
}
