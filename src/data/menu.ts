// src/data/menu.ts

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: string;
  weight: string; // Gramaj (Bakanlık şartı)
  calories: number; // Kalori
  badge?: string; // "Taş Fırın & Köz", "Kömür Ateşinde", "Şefin İmzası"
  allergens: string[]; // Kart üzerinde dışarıda açıkça listelenecek
  image: string | null;
  description: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "zirh-kiyma-kebabi",
    name: "Zırh Kıyma Kebabı (Adana/Urfa)",
    price: 460,
    currency: "₺",
    category: "kebaplar",
    weight: "220 gr",
    calories: 780,
    badge: "Taş Fırın & Köz",
    allergens: ["Gluten"],
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop",
    description: "Özel zırhtan çekilmiş erkek kuzu eti, kuyruk yağı, közlenmiş biber, sumaklı soğan ve lavaş ile."
  },
  {
    id: "kuzu-sis-kebap",
    name: "Kuzu Şiş Kebap",
    price: 540,
    currency: "₺",
    category: "kebaplar",
    weight: "200 gr",
    calories: 690,
    badge: "Kömür Ateşinde",
    allergens: ["Süt/Laktoz"],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    description: "Süt kuzusu but etinden terbiye edilmiş lokum parçalar, közlenmiş domates ve biber eşliğinde."
  },
  {
    id: "diyarbakir-sac-tava",
    name: "Diyarbakır Saç Tava",
    price: 580,
    currency: "₺",
    category: "tavalar",
    weight: "250 gr",
    calories: 840,
    badge: "Yöresel Efsane",
    allergens: ["Gluten", "Süt/Laktoz"],
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
    description: "Kuzu eti, taze domates, sivri biber, sarımsak ve özel kuyruk yağı ile bakır tavada harmanlanmış."
  },
  {
    id: "tomahawk-steak",
    name: "Tomahawk Steak (Dry Aged)",
    price: 1850,
    currency: "₺",
    category: "steak",
    weight: "650 gr",
    calories: 1150,
    badge: "28 Gün Dinlendirilmiş",
    allergens: ["Süt/Laktoz"],
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop",
    description: "Kemikli özel antrikot kesimi, taze çekilmiş tane biber, deniz tuzu pulları ve taze biberiye."
  },
  {
    id: "loqum-bonfile",
    name: "Loqum Bonfile Dilimleri",
    price: 920,
    currency: "₺",
    category: "steak",
    weight: "220 gr",
    calories: 720,
    badge: "Şefin İmzası",
    allergens: ["Süt/Laktoz"],
    image: "https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop",
    description: "Özel döküm tavada kızgın tereyağında masada mühürlenen pamuk yumuşaklığında dana bonfile."
  },
  {
    id: "citir-lahmacun",
    name: "Çıtır Diyarbakır Lahmacun",
    price: 140,
    currency: "₺",
    category: "lahmacun",
    weight: "130 gr",
    calories: 290,
    badge: "Taş Fırın",
    allergens: ["Gluten"],
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop",
    description: "Zırh kıyması, sarımsak, maydanoz ve isot ile taş fırında çıtır pişirilen geleneksel lahmacun."
  },
  {
    id: "loqum-burger",
    name: "Loqum Smoke Burger",
    price: 490,
    currency: "₺",
    category: "burger",
    weight: "200 gr",
    calories: 960,
    badge: "Füme Kaburga",
    allergens: ["Gluten", "Süt/Laktoz", "Susam"],
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop",
    description: "200 gr dry aged dana köfte, tütsülenmiş kaburga dilimleri, eritilmiş cheddar ve trüflü mayonez."
  },
  {
    id: "antep-baklavasi",
    name: "Havuç Dilim Antep Baklavası",
    price: 280,
    currency: "₺",
    category: "tatlilar",
    weight: "150 gr",
    calories: 520,
    badge: "Sıcak Servis",
    allergens: ["Gluten", "Süt/Laktoz", "Antep Fıstığı"],
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?q=80&w=800&auto=format&fit=crop",
    description: "Hakiki Antep boz fıstığı, sadeyağ ve çıtır yufka. Hakiki Maraş dövme dondurması ile servis edilir."
  }
];

// Helper interface for backward compatibility
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  portion: string;
  calories?: number;
  prepTime: string;
  allergens: string[];
  isAvailable: boolean;
  image: string;
  department: "steak" | "grill_oven" | "kitchen" | "bar" | "dessert";
  isSignature?: boolean;
  options?: { name: string; choices: string[] }[];
  crossSellIds?: string[];
}

export const CATEGORIES = [
  { id: "all", name: "Tüm Menü", slug: "all", order: 0 },
  { id: "kebaplar", name: "Kebaplar", slug: "kebaplar", order: 1 },
  { id: "tavalar", name: "Tavalar", slug: "tavalar", order: 2 },
  { id: "steak", name: "Steak (Dry-Aged)", slug: "steak", order: 3 },
  { id: "lahmacun", name: "Lahmacun & Pide", slug: "lahmacun", order: 4 },
  { id: "burger", name: "Burgerler", slug: "burger", order: 5 },
  { id: "tatlilar", name: "Tatlılar", slug: "tatlilar", order: 6 }
];

export const MENU_PRODUCTS: Product[] = MENU_ITEMS.map((item) => ({
  id: item.id,
  categoryId: item.category,
  name: item.name,
  description: item.description,
  price: item.price,
  portion: item.weight,
  calories: item.calories,
  prepTime: "15 dk",
  allergens: item.allergens,
  isAvailable: true,
  image: item.image || "",
  department: item.category === "steak" ? "steak" : item.category === "kebaplar" || item.category === "lahmacun" ? "grill_oven" : item.category === "tatlilar" ? "dessert" : "kitchen"
}));
