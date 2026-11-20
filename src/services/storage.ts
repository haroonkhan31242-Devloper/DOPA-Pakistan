import type {
  Article,
  AuthSession,
  CartItem,
  CommunityPost,
  ContactMessage,
  DopaMembership,
  FaqItem,
  Job,
  LifePartnerProfile,
  LifePartnerRequest,
  MedicineRequest,
  NewsSlide,
  NotificationItem,
  Order,
  Pharmacy,
  Product,
  RawMaterial,
  RmOrder,
  RmSeller,
  SiteSettings,
  University,
  User,
  VideoItem,
} from '../types';
import {
  SEED_ARTICLES,
  SEED_CONTACT_MESSAGES,
  SEED_FAQS,
  SEED_JOBS,
  SEED_LP_PROFILES,
  SEED_LP_REQUESTS,
  SEED_MED_REQUESTS,
  SEED_MEMBERSHIPS,
  SEED_NOTIFICATIONS,
  SEED_ORDERS,
  SEED_PHARMACIES,
  SEED_POSTS,
  SEED_PRODUCTS,
  SEED_RAW_MATERIALS,
  SEED_RM_ORDERS,
  SEED_SELLERS,
  SEED_SETTINGS,
  SEED_SLIDES,
  SEED_UNIVERSITIES,
  SEED_USERS,
  SEED_VIDEOS,
} from '../data/seedData';

const STORAGE_VERSION = 'v1';
const prefix = `dopa.${STORAGE_VERSION}.`;

export const KEYS = {
  users: `${prefix}users`,
  memberships: `${prefix}memberships`,
  pharmacies: `${prefix}pharmacies`,
  products: `${prefix}products`,
  cart: `${prefix}cart`,
  orders: `${prefix}orders`,
  medRequests: `${prefix}medRequests`,
  sellers: `${prefix}sellers`,
  rawMaterials: `${prefix}rawMaterials`,
  rmOrders: `${prefix}rmOrders`,
  jobs: `${prefix}jobs`,
  lpProfiles: `${prefix}lpProfiles`,
  lpRequests: `${prefix}lpRequests`,
  posts: `${prefix}posts`,
  videos: `${prefix}videos`,
  articles: `${prefix}articles`,
  universities: `${prefix}universities`,
  faqs: `${prefix}faqs`,
  slides: `${prefix}slides`,
  messages: `${prefix}messages`,
  notifications: `${prefix}notifications`,
  settings: `${prefix}settings`,
  session: `${prefix}session`,
  theme: 'dopa.theme',
} as const;

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Handle storage quota gracefully without crashing UI
  }
}

export interface DopaStoreSnapshot {
  users: User[];
  memberships: DopaMembership[];
  pharmacies: Pharmacy[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  medRequests: MedicineRequest[];
  sellers: RmSeller[];
  rawMaterials: RawMaterial[];
  rmOrders: RmOrder[];
  jobs: Job[];
  lpProfiles: LifePartnerProfile[];
  lpRequests: LifePartnerRequest[];
  posts: CommunityPost[];
  videos: VideoItem[];
  articles: Article[];
  universities: University[];
  faqs: FaqItem[];
  slides: NewsSlide[];
  messages: ContactMessage[];
  notifications: NotificationItem[];
  settings: SiteSettings;
  session: AuthSession | null;
}

export function initializeStore(): DopaStoreSnapshot {
  const ensure = <T>(key: string, seed: T): T => {
    const existing = localStorage.getItem(key);
    if (existing !== null) {
      return safeRead<T>(key, seed);
    }
    safeWrite(key, seed);
    return seed;
  };

  return {
    users: ensure(KEYS.users, SEED_USERS),
    memberships: ensure(KEYS.memberships, SEED_MEMBERSHIPS),
    pharmacies: ensure(KEYS.pharmacies, SEED_PHARMACIES),
    products: ensure(KEYS.products, SEED_PRODUCTS),
    cart: ensure<CartItem[]>(KEYS.cart, []),
    orders: ensure(KEYS.orders, SEED_ORDERS),
    medRequests: ensure(KEYS.medRequests, SEED_MED_REQUESTS),
    sellers: ensure(KEYS.sellers, SEED_SELLERS),
    rawMaterials: ensure(KEYS.rawMaterials, SEED_RAW_MATERIALS),
    rmOrders: ensure(KEYS.rmOrders, SEED_RM_ORDERS),
    jobs: ensure(KEYS.jobs, SEED_JOBS),
    lpProfiles: ensure(KEYS.lpProfiles, SEED_LP_PROFILES),
    lpRequests: ensure(KEYS.lpRequests, SEED_LP_REQUESTS),
    posts: ensure(KEYS.posts, SEED_POSTS),
    videos: ensure(KEYS.videos, SEED_VIDEOS),
    articles: ensure(KEYS.articles, SEED_ARTICLES),
    universities: ensure(KEYS.universities, SEED_UNIVERSITIES),
    faqs: ensure(KEYS.faqs, SEED_FAQS),
    slides: ensure(KEYS.slides, SEED_SLIDES),
    messages: ensure(KEYS.messages, SEED_CONTACT_MESSAGES),
    notifications: ensure(KEYS.notifications, SEED_NOTIFICATIONS),
    settings: ensure(KEYS.settings, SEED_SETTINGS),
    session: safeRead<AuthSession | null>(KEYS.session, null),
  };
}

export const storageService = {
  getTheme(): 'light' | 'dark' {
    try {
      const t = localStorage.getItem(KEYS.theme);
      if (t === 'dark' || t === 'light') return t;
    } catch {
      // ignore
    }
    return 'light';
  },
  setTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(KEYS.theme, theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch {
      // ignore
    }
  },
  saveCollection<K extends keyof typeof KEYS>(keyName: K, value: unknown): void {
    safeWrite(KEYS[keyName], value);
  },
  resetDemoData(): DopaStoreSnapshot {
    Object.values(KEYS).forEach((k) => {
      if (k !== KEYS.theme) {
        try {
          localStorage.removeItem(k);
        } catch {
          // ignore
        }
      }
    });
    return initializeStore();
  },
};
