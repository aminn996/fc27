-- ============================================================
-- FC27.TN – Supabase Schema
-- Run this in the Supabase SQL editor (https://app.supabase.com)
-- ============================================================

-- 1. Products table (reference catalog, optional – prices live in code)
CREATE TABLE IF NOT EXISTS products (
  slug       TEXT PRIMARY KEY,
  label      TEXT NOT NULL,
  name       TEXT NOT NULL,
  price      INTEGER NOT NULL,          -- in millimes (270000 = 270.000 DT)
  format     TEXT NOT NULL,
  image      TEXT NOT NULL,
  accent     TEXT,
  active     BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the 8 products
INSERT INTO products (slug, label, name, price, format, image, accent) VALUES
  ('fc27-ps5',                'PS5',                 'EA SPORTS FC 27 PS5',                        270000, 'Disque physique',    '/ps5.jpg',     'PS5'),
  ('fc27-ps5-arabe',          'PS5 Arabe',           'EA SPORTS FC 27 PS5 Arabe',                  279000, 'Disque physique',    '/ps5.jpg',     'AR'),
  ('fc27-ps4',                'PS4',                 'EA SPORTS FC 27 PS4',                        270000, 'Disque physique',    '/ps4.jpg',     'PS4'),
  ('fc27-ps4-arabe',          'PS4 Arabe',           'EA SPORTS FC 27 PS4 Arabe',                  279000, 'Disque physique',    '/ps4.jpg',     'AR'),
  ('fc27-xbox-one-series-x',  'Xbox One / Series X', 'EA SPORTS FC 27 Xbox One / Xbox Series X',   260000, 'Disque physique',    '/xbox.jpg',    'XBOX'),
  ('fc27-switch',             'Nintendo Switch',     'EA SPORTS FC 27 Nintendo Switch',            249000, 'Cartouche physique', '/switch1.jpg', 'SWITCH'),
  ('fc27-switch-2',           'Nintendo Switch 2',   'EA SPORTS FC 27 Nintendo Switch 2',          270000, 'Cartouche physique', '/switvh2.jpg', 'SWITCH 2'),
  ('fc27-pc-ea-app',          'PC — Code EA app',    'EA SPORTS FC 27 PC — EA app',                260000, 'Code numérique',     '/pc.jpg',      'PC')
ON CONFLICT (slug) DO NOTHING;

-- 2. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL PRIMARY KEY,
  reference     TEXT UNIQUE NOT NULL,     -- e.g. "FC27-123456"
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  governorate   TEXT NOT NULL,
  address       TEXT NOT NULL,
  note          TEXT DEFAULT '',
  status        TEXT DEFAULT 'pending',   -- pending | confirmed | shipped | delivered | cancelled
  total         INTEGER NOT NULL,         -- in millimes
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Order items (supports multi-product orders in the future)
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_slug TEXT REFERENCES products(slug),
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  INTEGER NOT NULL,           -- snapshot of price at order time
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order history (status change audit trail)
CREATE TABLE IF NOT EXISTS order_history (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security
ALTER TABLE products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_history ENABLE ROW LEVEL SECURITY;

-- Public can only read active products
CREATE POLICY "public_read_products" ON products
  FOR SELECT USING (active = TRUE);

-- All other tables: no public access (only service_role key can read/write)
-- This means the browser can NEVER read orders directly
CREATE POLICY "service_only_orders" ON orders
  FOR ALL USING (FALSE);

CREATE POLICY "service_only_order_items" ON order_items
  FOR ALL USING (FALSE);

CREATE POLICY "service_only_order_history" ON order_history
  FOR ALL USING (FALSE);

-- Index for faster dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
