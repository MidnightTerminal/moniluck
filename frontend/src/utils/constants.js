/* ─── App Constants ──────────────────────────────────────────────────────── */

export const APP_NAME = 'Moniluck';
export const APP_TAGLINE = 'Care For Every Corner of Your Life';

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
  address : '123 Care Street, City, Country',
  email   : 'info@moniluck.com',
  phone   : '+1 (234) 567-890',
  hours   : 'Mon – Sat: 9AM – 7PM',
};

export const SOCIAL_LINKS = [
  { platform: 'facebook',  url: '#', label: 'F' },
  { platform: 'instagram', url: '#', label: 'I' },
  { platform: 'twitter',   url: '#', label: 'T' },
  { platform: 'youtube',   url: '#', label: 'Y' },
];

export const FREE_SHIPPING_THRESHOLD = 50;
export const SHIPPING_COST = 5.99;

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