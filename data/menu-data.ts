// data/menu-data.ts
import { RESTAURANT_CONFIG } from "@/src/config/restaurant.config";
import { CATEGORIES as LOQUM_CATEGORIES, MENU_PRODUCTS as LOQUM_PRODUCTS, Product } from "@/src/data/menu";

export interface MenuItem {
  id: string;
  sourceVariantId: string;
  categoryId: string;
  categoryName: string;
  name: string;
  price: number;
  currency: string;
  image: string | null;
  imageStatus: "verified" | "missing";
  description?: string;
  isFeatured?: boolean;
  calories?: number;
  prepTime?: string;
  allergens?: string[];
  portion?: string;
  department?: string;
  category?: string;
  localImage?: string | null;
  options?: {
    name: string;
    choices: string[];
  }[];
  crossSellIds?: string[];
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  label?: string;
  productCount?: number;
}

export const RESTAURANT_METADATA = {
  name: RESTAURANT_CONFIG.fullName,
  tagline: RESTAURANT_CONFIG.slogan,
  address: RESTAURANT_CONFIG.address,
  phone: RESTAURANT_CONFIG.phone,
  phoneRaw: RESTAURANT_CONFIG.phoneRaw,
  workingHours: RESTAURANT_CONFIG.workingHours,
  instagram: RESTAURANT_CONFIG.social.instagramHandle,
  instagramUrl: RESTAURANT_CONFIG.social.instagram,
  facebookUrl: RESTAURANT_CONFIG.social.facebook,
  youtubeUrl: RESTAURANT_CONFIG.social.youtube,
  googleReviewUrl: RESTAURANT_CONFIG.social.googleReviewUrl,
  brandColor: RESTAURANT_CONFIG.theme.colors.goldAccent,
  accentColor: RESTAURANT_CONFIG.theme.colors.emberRed,
  wifiName: "LOQUM-ET-GUEST",
  wifiPass: "loqum2026"
};

export const BEROS_CATEGORIES: MenuCategory[] = LOQUM_CATEGORIES.map(c => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  label: c.name,
  productCount: LOQUM_PRODUCTS.filter(p => p.categoryId === c.id).length
}));

export const BEROS_MENU_ITEMS: MenuItem[] = LOQUM_PRODUCTS.map(p => {
  const cat = LOQUM_CATEGORIES.find(c => c.id === p.categoryId);
  return {
    id: p.id,
    sourceVariantId: p.id,
    categoryId: p.categoryId,
    categoryName: cat ? cat.name : "Genel",
    category: cat ? cat.name : "Genel",
    name: p.name,
    price: p.price,
    currency: "₺",
    image: p.image,
    imageStatus: "verified",
    description: p.description,
    isFeatured: p.isSignature,
    calories: p.calories,
    prepTime: p.prepTime,
    portion: p.portion,
    allergens: p.allergens,
    department: p.department,
    options: p.options,
    crossSellIds: p.crossSellIds
  };
});

export const CROSS_SELL_ITEMS: MenuItem[] = BEROS_MENU_ITEMS.filter(it =>
  it.id === "cs-01" || it.id === "cs-02" || it.id === "cs-03" || it.id === "bev-01" || it.id === "bev-02" || it.id === "bev-04" || it.id === "ds-01"
);
