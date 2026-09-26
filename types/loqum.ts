export interface CategoryItem {
  id: number;
  order: number;
  slug: string;
  name: string;
  fileName: string;
  remoteUrl: string;
  localPath: string;
}

export interface MenuItemProduct {
  id: string;
  categoryId: number;
  categorySlug: string;
  name: string;
  tag: string;
  gramaj?: string;
  description: string;
  price: number;
  calories: number;
  prepTime: string;
  stock?: number;
  allergens: string[];
  image: string;
  isPopular?: boolean;
}

export interface CartItem {
  product: MenuItemProduct;
  quantity: number;
  notes?: string;
}

export interface BrandAsset {
  fileName: string;
  remoteUrl: string;
  localPath: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface LoqumMenuData {
  restaurant: {
    name: string;
    location: string;
    baseUrl: string;
  };
  categories: CategoryItem[];
}

export interface LoqumAssetsData {
  logos: {
    headerLogo: BrandAsset;
    sidebarLogo: BrandAsset;
  };
  icons: Array<BrandAsset & { key: string }>;
  socialMedia: SocialLink[];
}

export interface DishItem {
  id: string;
  title: string;
  tag: string;
  description: string;
  price: number;
  image: string;
}

export type ReservationStatus = 'beklemede' | 'onaylandi' | 'iptal';

export interface ReservationRecord {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string | number;
  notes?: string;
  branch: string;
  status: ReservationStatus;
  createdAt: string;
}

