-- ============================================================
-- MONILUCK E-COMMERCE DATABASE SCHEMA
-- ============================================================

CREATE DATABASE IF NOT EXISTS moniluck_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE moniluck_db;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  first_name    VARCHAR(100)    NOT NULL,
  last_name     VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    NOT NULL UNIQUE,
  password_hash VARCHAR(255)    NOT NULL,
  phone         VARCHAR(20)     DEFAULT NULL,
  avatar_url    VARCHAR(500)    DEFAULT NULL,
  role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  is_verified   TINYINT(1)      NOT NULL DEFAULT 0,
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email),
  INDEX idx_role  (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PASSWORD RESET TOKENS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    INT UNSIGNED NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  used       TINYINT(1)   NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_token   (token),
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_prt_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)  NOT NULL UNIQUE,
  slug        VARCHAR(150)  NOT NULL UNIQUE,
  description TEXT          DEFAULT NULL,
  icon        VARCHAR(100)  DEFAULT NULL,
  image_url   VARCHAR(500)  DEFAULT NULL,
  sort_order  INT           NOT NULL DEFAULT 0,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_slug      (slug),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id            INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  category_id   INT UNSIGNED     NOT NULL,
  name          VARCHAR(255)     NOT NULL,
  slug          VARCHAR(255)     NOT NULL UNIQUE,
  description   TEXT             DEFAULT NULL,
  short_desc    VARCHAR(500)     DEFAULT NULL,
  price         DECIMAL(10,2)   NOT NULL,
  compare_price DECIMAL(10,2)   DEFAULT NULL,
  sku           VARCHAR(100)     NOT NULL UNIQUE,
  stock         INT              NOT NULL DEFAULT 0,
  images        JSON             DEFAULT NULL,
  thumbnail     VARCHAR(500)     DEFAULT NULL,
  brand         VARCHAR(150)     DEFAULT NULL,
  tags          JSON             DEFAULT NULL,
  is_featured   TINYINT(1)      NOT NULL DEFAULT 0,
  is_active     TINYINT(1)      NOT NULL DEFAULT 1,
  rating        DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
  review_count  INT              NOT NULL DEFAULT 0,
  created_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_category_id (category_id),
  INDEX idx_slug        (slug),
  INDEX idx_is_featured (is_featured),
  INDEX idx_is_active   (is_active),
  INDEX idx_price       (price),
  FULLTEXT idx_search   (name, description, short_desc),
  CONSTRAINT fk_product_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
  product_id  INT UNSIGNED NOT NULL,
  user_id     INT UNSIGNED NOT NULL,
  rating      TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(255) DEFAULT NULL,
  body        TEXT         DEFAULT NULL,
  is_approved TINYINT(1)   NOT NULL DEFAULT 0,
  admin_reply TEXT         DEFAULT NULL,
  admin_reply_at DATETIME  DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_product (user_id, product_id),
  INDEX idx_product_id (product_id),
  INDEX idx_user_id    (user_id),
  CONSTRAINT fk_review_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_review_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email        VARCHAR(255) NOT NULL UNIQUE,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  subscribed_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED: CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, description, icon, image_url, sort_order)
VALUES
  ('Home Care',     'home-care',     'Products to keep your home clean and fresh',           'home',          '/images/categories/home-care.jpg',     1),
  ('Kitchen Care',  'kitchen-care',  'Everything you need for a clean and organized kitchen', 'kitchen',       '/images/categories/kitchen-care.jpg',  2),
  ('Personal Care', 'personal-care', 'Take care of yourself with our premium products',       'person',        '/images/categories/personal-care.jpg', 3),
  ('Clothing Care', 'clothing-care', 'Keep your clothes fresh, clean, and looking great',     'local_laundry', '/images/categories/clothing-care.jpg', 4),
  ('Toilet Care',   'toilet-care',   'Premium toiletries for a hygienic bathroom',            'bathroom',      '/images/categories/toilet-care.jpg',   5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ============================================================
-- SEED: SAMPLE PRODUCTS
-- ============================================================
INSERT INTO products
  (category_id, name, slug, description, short_desc, price, compare_price, sku, stock, thumbnail, brand, is_featured, rating, review_count)
VALUES
  (1,'All-Purpose Surface Cleaner','all-purpose-surface-cleaner','Powerful multi-surface cleaner that removes grease, dirt and grime with ease. Leaves surfaces sparkling clean with a refreshing scent.','Powerful multi-surface cleaner',12.99,16.99,'HC-001',150,'/images/products/surface-cleaner.jpg','MoniLuck',1,4.5,128),
  (1,'Premium Floor Mopping Liquid','premium-floor-mopping-liquid','Advanced formula floor cleaner that not only cleans but also protects and shines your floors. Safe for all floor types.','Advanced floor cleaning formula',9.99,13.99,'HC-002',200,'/images/products/floor-liquid.jpg','MoniLuck',1,4.3,95),
  (2,'Dish Wash Gel Ultra','dish-wash-gel-ultra','Concentrated dish washing gel with grease-cutting power. Gentle on hands but tough on food residue. One drop goes a long way.','Ultra concentrated dish gel',7.49,9.99,'KC-001',300,'/images/products/dish-gel.jpg','MoniLuck',1,4.7,214),
  (2,'Kitchen Degreaser Spray','kitchen-degreaser-spray','Heavy-duty kitchen degreaser that effortlessly removes grease from ovens, stoves, and kitchen surfaces. Professional grade formula.','Heavy-duty kitchen degreaser',11.99,15.99,'KC-002',120,'/images/products/degreaser.jpg','MoniLuck',0,4.2,67),
  (3,'Moisturizing Body Lotion','moisturizing-body-lotion','Luxurious body lotion enriched with natural ingredients. Keeps skin hydrated, soft, and glowing all day long.','Luxurious hydrating body lotion',14.99,19.99,'PC-001',180,'/images/products/body-lotion.jpg','MoniLuck',1,4.8,342),
  (3,'Refreshing Hand Sanitizer','refreshing-hand-sanitizer','99.9% germ-killing hand sanitizer with moisturizing aloe vera. Leaves hands clean and soft without drying.','99.9% germ-killing sanitizer',4.99,6.99,'PC-002',500,'/images/products/sanitizer.jpg','MoniLuck',1,4.6,189),
  (4,'Premium Laundry Detergent','premium-laundry-detergent','High-efficiency laundry detergent that removes tough stains while protecting fabric colors. Suitable for all washing machines.','High-efficiency laundry detergent',18.99,24.99,'CC-001',140,'/images/products/laundry-det.jpg','MoniLuck',1,4.4,156),
  (4,'Fabric Softener & Conditioner','fabric-softener-conditioner','Luxurious fabric softener that leaves clothes incredibly soft, fresh, and static-free. Long-lasting floral fragrance.','Luxurious fabric softener',11.49,14.99,'CC-002',160,'/images/products/fabric-soft.jpg','MoniLuck',0,4.3,88),
  (5,'Toilet Bowl Cleaner','toilet-bowl-cleaner','Powerful toilet bowl cleaner with angled nozzle for complete coverage. Kills 99.9% of germs and leaves a long-lasting fresh scent.','Powerful toilet bowl cleaner',6.99,9.99,'TC-001',250,'/images/products/toilet-cleaner.jpg','MoniLuck',1,4.5,203),
  (5,'Bathroom Disinfectant Spray','bathroom-disinfectant-spray','Hospital-grade disinfectant spray for complete bathroom hygiene. Kills bacteria, viruses, and mold on contact.','Hospital-grade disinfectant',8.99,12.99,'TC-002',190,'/images/products/disinfectant.jpg','MoniLuck',1,4.6,147)
ON DUPLICATE KEY UPDATE name=VALUES(name);