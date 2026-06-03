/* ─── App Constants ──────────────────────────────────────────────────────── */

export const DEFAULT_SITE_SETTINGS = {
  site_name: 'Moniluck',
  site_tagline: 'Care For Every Corner of Your Life',
  footer_description: 'Premium care products for every corner of your life. From home to personal care — we\'ve got you covered.',
  contact_email: 'info@moniluck.com',
  contact_phone: '0123-456-7890',
  contact_address: '123 Care Street, City, Country',
  contact_hours: 'Mon – Sat: 9AM – 7PM',
  free_shipping_enabled: 'true',
  free_shipping_min: '50',
  shipping_cost: '5.99',
  express_shipping_cost: '12.99',
  same_day_shipping_cost: '19.99',
  standard_shipping_time: '5–7 Business Days',
  express_shipping_time: '2–3 Business Days',
  same_day_shipping_time: 'Dhaka Only',
  currency_symbol: 'Tk',
  social_facebook: '#',
  social_instagram: '#',
  social_twitter: '#',
  social_youtube: '#',
  privacy_policy_url: '#',
  terms_of_service_url: '#',
  refund_policy_url: '#',
  maintenance_mode: 'false',
  meta_title: 'Moniluck | Care For Every Corner of Your Life',
  meta_description: 'Premium care products for home, kitchen, personal and clothing needs.',
};

export const APP_NAME = DEFAULT_SITE_SETTINGS.site_name;
export const APP_TAGLINE = DEFAULT_SITE_SETTINGS.site_tagline;

export const STORAGE_KEYS = {
  TOKEN   : 'moniluck_token',
  CART    : 'moniluck_cart',
  WISHLIST: 'moniluck_wishlist',
};

export const CATEGORIES = [
  { slug: 'home-care',     name: 'Home Care',     icon: '🏠', color: '#667eea' },
  { slug: 'kitchen-care',  name: 'Kitchen Care',  icon: '🍳', color: '#f093fb' },
  { slug: 'personal-care', name: 'Personal Care', icon: '🌸', color: '#fa709a' },
  { slug: 'clothing-care', name: 'Clothing Care', icon: '👗', color: '#4facfe' },
  { slug: 'toilet-care',   name: 'Toilet Care',   icon: '🚿', color: '#43e97b' },
];

export const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Newest First' },
  { value: 'created_at-ASC',  label: 'Oldest First' },
  { value: 'price-ASC',       label: 'Price: Low to High' },
  { value: 'price-DESC',      label: 'Price: High to Low' },
  { value: 'rating-DESC',     label: 'Top Rated' },
  { value: 'name-ASC',        label: 'A – Z' },
  { value: 'name-DESC',       label: 'Z – A' },
];

export const NAV_LINKS = [
  { to: '/',        label: 'Home',    exact: true },
  { to: '/about',   label: 'About'   },
  { to: '/products',label: 'Shop'    },
  { to: '/media',   label: 'Media'   },
  { to: '/contact', label: 'Contact' },
];

export const FOOTER_LINKS = {
  quickLinks: [
    { to: '/',         label: 'Home' },
    { to: '/about',    label: 'About Us' },
    { to: '/products', label: 'Shop' },
    { to: '/media',    label: 'Media' },
    { to: '/contact',  label: 'Contact' },
  ],
  categories: [
    { to: '/category/home-care',     label: 'Home Care' },
    { to: '/category/kitchen-care',  label: 'Kitchen Care' },
    { to: '/category/personal-care', label: 'Personal Care' },
    { to: '/category/clothing-care', label: 'Clothing Care' },
    { to: '/category/toilet-care',   label: 'Toilet Care' },
  ],
};

export const CONTACT_INFO = {
  address : DEFAULT_SITE_SETTINGS.contact_address,
  email   : DEFAULT_SITE_SETTINGS.contact_email,
  phone   : DEFAULT_SITE_SETTINGS.contact_phone,
  hours   : DEFAULT_SITE_SETTINGS.contact_hours,
};

export const SOCIAL_LINKS = [
  { platform: 'facebook',  url: DEFAULT_SITE_SETTINGS.social_facebook, label: 'F' },
  { platform: 'instagram', url: DEFAULT_SITE_SETTINGS.social_instagram, label: 'I' },
  { platform: 'twitter',   url: DEFAULT_SITE_SETTINGS.social_twitter, label: 'T' },
  { platform: 'youtube',   url: DEFAULT_SITE_SETTINGS.social_youtube, label: 'Y' },
];

export const FREE_SHIPPING_THRESHOLD = Number(DEFAULT_SITE_SETTINGS.free_shipping_min);
export const SHIPPING_COST = Number(DEFAULT_SITE_SETTINGS.shipping_cost);

export const SHIPPING_OPTIONS = {
  standard: {
    cost: Number(DEFAULT_SITE_SETTINGS.shipping_cost),
    time: DEFAULT_SITE_SETTINGS.standard_shipping_time,
  },
  express: {
    cost: Number(DEFAULT_SITE_SETTINGS.express_shipping_cost),
    time: DEFAULT_SITE_SETTINGS.express_shipping_time,
  },
  same_day: {
    cost: Number(DEFAULT_SITE_SETTINGS.same_day_shipping_cost),
    time: DEFAULT_SITE_SETTINGS.same_day_shipping_time,
  },
};

export const POLICY_LINKS = {
  privacy: DEFAULT_SITE_SETTINGS.privacy_policy_url,
  terms: DEFAULT_SITE_SETTINGS.terms_of_service_url,
  refund: DEFAULT_SITE_SETTINGS.refund_policy_url,
};

export const PASSWORD_RULES = [
  { regex: /.{8,}/,    label: 'At least 8 characters' },
  { regex: /[A-Z]/,    label: 'One uppercase letter' },
  { regex: /[a-z]/,    label: 'One lowercase letter' },
  { regex: /\d/,       label: 'One number' },
];

export const PRODUCTS_PER_PAGE = 12;

export const BRAND_PLACEHOLDERS = [
  { id: 1, name: 'Brand One',   code: 'B1' },
  { id: 2, name: 'Brand Two',   code: 'B2' },
  { id: 3, name: 'Brand Three', code: 'B3' },
  { id: 4, name: 'Brand Four',  code: 'B4' },
];