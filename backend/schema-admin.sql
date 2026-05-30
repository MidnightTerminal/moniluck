-- ============================================================
-- MONILUCK ADMIN PANEL — ADDITIONAL SCHEMA
-- ============================================================

USE moniluck_db;

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  user_id         INT UNSIGNED     DEFAULT NULL,
  order_number    VARCHAR(50)      NOT NULL UNIQUE,
  status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded')
                                   NOT NULL DEFAULT 'pending',
  payment_method  VARCHAR(50)      NOT NULL DEFAULT 'cod',
  payment_status  ENUM('pending','paid','failed','refunded')
                                   NOT NULL DEFAULT 'pending',
  subtotal        DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
  shipping_cost   DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
  discount        DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
  total           DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
  currency        VARCHAR(10)      NOT NULL DEFAULT 'USD',
  -- Shipping Info
  ship_first_name VARCHAR(100)     NOT NULL,
  ship_last_name  VARCHAR(100)     NOT NULL,
  ship_email      VARCHAR(255)     NOT NULL,
  ship_phone      VARCHAR(30)      NOT NULL,
  ship_address    VARCHAR(500)     NOT NULL,
  ship_address2   VARCHAR(500)     DEFAULT NULL,
  ship_city       VARCHAR(100)     NOT NULL,
  ship_state      VARCHAR(100)     DEFAULT NULL,
  ship_zip        VARCHAR(20)      NOT NULL,
  ship_country    VARCHAR(100)     NOT NULL DEFAULT 'Bangladesh',
  notes           TEXT             DEFAULT NULL,
  created_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_user_id      (user_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status       (status),
  INDEX idx_created_at   (created_at),
  CONSTRAINT fk_order_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  order_id     INT UNSIGNED   NOT NULL,
  product_id   INT UNSIGNED   DEFAULT NULL,
  product_name VARCHAR(255)   NOT NULL,
  product_slug VARCHAR(255)   DEFAULT NULL,
  thumbnail    VARCHAR(500)   DEFAULT NULL,
  price        DECIMAL(10,2)  NOT NULL,
  quantity     INT            NOT NULL DEFAULT 1,
  total        DECIMAL(10,2)  NOT NULL,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_order_id   (order_id),
  INDEX idx_product_id (product_id),
  CONSTRAINT fk_oi_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_oi_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SITE SETTINGS TABLE
-- ============================================================
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
-- SITE SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id          INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  setting_key VARCHAR(100)   NOT NULL UNIQUE,
  setting_val TEXT           DEFAULT NULL,
  setting_type ENUM('text','number','boolean','json','html')
                             NOT NULL DEFAULT 'text',
  description VARCHAR(255)   DEFAULT NULL,
  updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED: DEFAULT ADMIN USER  (password: Admin@123)
-- ============================================================
INSERT INTO users (first_name, last_name, email, password_hash, role, is_verified, is_active)
VALUES (
  'Admin', 'User', 'admin@moniluck.com',
  '$2a$12$LJ3h5gR7QxDQYKJP6HVZ8OypQG1bfJ3gJ6RrmqZj6l5p3W9WRqWyC',
  'admin', 1, 1
)
ON DUPLICATE KEY UPDATE role = 'admin';

-- ============================================================
-- SEED: DEFAULT SITE SETTINGS
-- ============================================================
INSERT INTO site_settings (setting_key, setting_val, setting_type, description) VALUES
  ('site_name',          'Moniluck',                                  'text',    'Website name'),
  ('site_tagline',       'Care For Every Corner of Your Life',        'text',    'Website tagline'),
  ('contact_email',      'info@moniluck.com',                        'text',    'Contact email'),
  ('contact_phone',      '+880 1XXX-XXXXXX',                         'text',    'Contact phone'),
  ('contact_address',    'Dhaka, Bangladesh',                        'text',    'Contact address'),
  ('free_shipping_min',  '50',                                       'number',  'Free shipping minimum order'),
  ('shipping_cost',      '5.99',                                     'number',  'Standard shipping cost'),
  ('currency_symbol',    'Tk',                                       'text',    'Currency symbol'),
  ('social_facebook',    '',                                         'text',    'Facebook URL'),
  ('social_instagram',   '',                                         'text',    'Instagram URL'),
  ('social_twitter',     '',                                         'text',    'Twitter URL'),
  ('social_youtube',     '',                                         'text',    'YouTube URL'),
  ('maintenance_mode',   'false',                                    'boolean', 'Maintenance mode on/off')
ON DUPLICATE KEY UPDATE setting_key = VALUES(setting_key);