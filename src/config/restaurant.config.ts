// src/config/restaurant.config.ts

export interface RestaurantConfig {
  name: string;
  branch: string;
  fullName: string;
  slogan: string;
  address: string;
  phone: string;
  phoneRaw: string;
  workingHours: string;
  social: {
    instagram: string;
    instagramHandle: string;
    facebook: string;
    youtube: string;
    googleReviewUrl: string;
    googleMapsUrl?: string;
    googleMapsEmbedUrl?: string;
  };
  amenities: string[];
  theme: {
    colors: {
      anthraciteDark: string;
      anthraciteCard: string;
      warmOak: string;
      emberRed: string;
      emberRedHover: string;
      goldAccent: string;
      goldAccentMuted: string;
    };
  };
}

export const RESTAURANT_CONFIG: RestaurantConfig = {
  name: "LOQUM ET-STEAKHOUSE DİYARBAKIR",
  branch: "Diyarbakır Şubesi",
  fullName: "LOQUM ET-STEAKHOUSE DİYARBAKIR",
  slogan: "Diyarbakır'ın En Seçkin Kuru Dinlendirilmiş Steak & Kebap Deneyimi",
  address: "75.Yol üzeri GO Petrol Yanı Mega Arslan Cadde 75 Sitesi C-Blok, Diyarbakır",
  phone: "(0412) 503 04 05",
  phoneRaw: "904125030405",
  workingHours: "10:00 - 22:00 (Haftanın 7 Günü)",
  social: {
    instagram: "https://instagram.com/loqumdiyarbakir",
    instagramHandle: "@loqumdiyarbakir",
    facebook: "https://facebook.com/loqumdiyarbakir",
    youtube: "https://youtube.com/@loqumdiyarbakir",
    googleReviewUrl: "https://www.google.com/maps/search/?api=1&query=LOQUM+ET-STEAKHOUSE+Diyarbak%C4%B1r+75.Yol+Mega+Arslan+Cadde+75",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=LOQUM+ET-STEAKHOUSE+Diyarbak%C4%B1r+75.Yol+Mega+Arslan+Cadde+75",
    googleMapsEmbedUrl: "https://maps.google.com/maps?q=LOQUM+ET-STEAKHOUSE+Diyarbak%C4%B1r+75.Yol+Mega+Arslan+Cadde+75&t=&z=15&ie=UTF8&iwloc=&output=embed",
  },
  amenities: [
    "Açık Hava Bahçe Alanı",
    "Çocuk Oyun & Menü Alanı",
    "VIP Loca Masaları",
    "28 Gün Kuru Dinlendirme (Dry-Aged) Reyonu",
  ],
  theme: {
    colors: {
      anthraciteDark: "#0D0D0D",
      anthraciteCard: "#1A1A1A",
      warmOak: "#2E1C14",
      emberRed: "#8B0000",
      emberRedHover: "#B22222",
      goldAccent: "#D4AF37",
      goldAccentMuted: "#AA8C2C",
    },
  },
};

