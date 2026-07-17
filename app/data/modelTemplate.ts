export interface ModelTemplate {
  // ==========================================
  // BASIC
  // ==========================================

  id: string;

  level: "CROWN" | "SSS" | "SS" | "S" | "A";

  number: number;

  displayOrder: number;

  // ==========================================
  // STATUS
  // ==========================================

  status: "ONLINE" | "OFFLINE";

  featured: boolean;

  newArrival: boolean;

  availability: boolean;

  // ==========================================
  // IMAGES
  // ==========================================

  avatar: string;

  gallery: string[];

  video?: string;

  // ==========================================
  // PERSONAL
  // ==========================================

  nationality: string;

  country: string;

  city: string;

  age: number;

  height: number;

  languages: string[];

  about: string;

  // ==========================================
  // CONTACT
  // ==========================================

  whatsapp?: string;

  telegram?: string;

  signal?: string;

  // ==========================================
  // SEO
  // ==========================================

  seoTitle?: string;

  seoDescription?: string;

  seoKeywords?: string;

  // ==========================================
  // STATISTICS
  // ==========================================

  rating?: number;

  viewCount?: number;

  bookingCount?: number;

  favoriteCount?: number;

  // ==========================================
  // SYSTEM
  // ==========================================

  createdAt: string;

  updatedAt: string;
}