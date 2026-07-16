-- ============================================================
-- zimmer.club — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- for geo search (optional)

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'owner', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable"
  ON profiles FOR SELECT USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'guest');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE properties (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug              TEXT UNIQUE,
  name              TEXT NOT NULL,
  description       TEXT,
  short_description TEXT,
  category          TEXT[] DEFAULT '{}',
  region            TEXT NOT NULL,
  city              TEXT NOT NULL,
  address           TEXT,
  lat               DECIMAL(9,6),
  lng               DECIMAL(9,6),
  price_per_night   INTEGER NOT NULL CHECK (price_per_night > 0),
  price_weekend     INTEGER,
  min_nights        INTEGER DEFAULT 1,
  max_guests        INTEGER DEFAULT 2,
  bedrooms          INTEGER DEFAULT 1,
  bathrooms         INTEGER DEFAULT 1,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('active','pending','inactive','rejected')),
  instant_book      BOOLEAN DEFAULT FALSE,
  accepts_miluim    BOOLEAN DEFAULT FALSE,
  has_shelter       BOOLEAN DEFAULT FALSE,
  phone_landline    TEXT,
  whatsapp1         TEXT,
  whatsapp2         TEXT,
  contact_via_phone_landline  BOOLEAN DEFAULT FALSE,
  contact_via_whatsapp1       BOOLEAN DEFAULT FALSE,
  contact_via_whatsapp2       BOOLEAN DEFAULT FALSE,
  avg_rating        DECIMAL(3,2) DEFAULT 0,
  total_reviews     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Migration (run once on existing DB):
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS price_weekend INTEGER;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS accepts_miluim BOOLEAN DEFAULT FALSE;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS has_shelter BOOLEAN DEFAULT FALSE;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS phone_landline TEXT;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS whatsapp1 TEXT;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS whatsapp2 TEXT;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_via_phone_landline BOOLEAN DEFAULT FALSE;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_via_whatsapp1 BOOLEAN DEFAULT FALSE;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_via_whatsapp2 BOOLEAN DEFAULT FALSE;

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active properties are public"
  ON properties FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can manage own properties"
  ON properties FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Admins can manage all properties"
  ON properties FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- PROPERTY IMAGES
-- ============================================================
CREATE TABLE property_images (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  is_primary  BOOLEAN DEFAULT FALSE,
  "order"     INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Property images are public" ON property_images FOR SELECT USING (true);
CREATE POLICY "Owners manage their images" ON property_images FOR ALL
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()));

-- ============================================================
-- AMENITIES
-- ============================================================
CREATE TABLE amenities (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key      TEXT UNIQUE NOT NULL,
  label_he TEXT NOT NULL,
  icon     TEXT
);

-- Property <> Amenities junction
CREATE TABLE property_amenities (
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  amenity_id  UUID REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read amenities" ON property_amenities FOR SELECT USING (true);

-- Seed amenities
INSERT INTO amenities (key, label_he, icon) VALUES
  ('jacuzzi',       'ג''קוזי',             '🛁'),
  ('pool',          'בריכה פרטית',          '🏊'),
  ('wifi',          'WiFi מהיר',            '📶'),
  ('ac',            'מיזוג אוויר',           '❄️'),
  ('kitchen',       'מטבח מאובזר',          '🍳'),
  ('bbq',           'ברביקיו',              '🔥'),
  ('parking',       'חניה פרטית',           '🚗'),
  ('fireplace',     'קמין',                 '🪵'),
  ('mountain_view', 'נוף להרים',            '⛰️'),
  ('sea_view',      'נוף לים',             '🌊'),
  ('garden',        'גינה פרטית',           '🌳'),
  ('sauna',         'סאונה',               '🧖');

-- ============================================================
-- BLOCKED DATES (availability calendar)
-- ============================================================
CREATE TABLE blocked_dates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  reason      TEXT,
  UNIQUE(property_id, date)
);

ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blocked dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Owners manage blocked dates" ON blocked_dates FOR ALL
  USING (EXISTS (SELECT 1 FROM properties WHERE id = property_id AND owner_id = auth.uid()));

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id        UUID NOT NULL REFERENCES properties(id),
  guest_id           UUID NOT NULL REFERENCES profiles(id),
  owner_id           UUID NOT NULL REFERENCES profiles(id),
  check_in           DATE NOT NULL,
  check_out          DATE NOT NULL,
  guests_count       INTEGER NOT NULL DEFAULT 1,
  total_nights       INTEGER NOT NULL,
  price_per_night    INTEGER NOT NULL,
  total_price        INTEGER NOT NULL,
  advance_payment    INTEGER NOT NULL,
  status             TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed','rejected')),
  special_requests   TEXT,
  payment_intent_id  TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_dates CHECK (check_out > check_in)
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guests see own bookings"
  ON bookings FOR SELECT USING (auth.uid() = guest_id);

CREATE POLICY "Owners see their property bookings"
  ON bookings FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Guests can create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Owners can update booking status"
  ON bookings FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Admins see all bookings"
  ON bookings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
  guest_id    UUID NOT NULL REFERENCES profiles(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are public" ON reviews FOR SELECT USING (true);
CREATE POLICY "Guests write own reviews" ON reviews FOR INSERT
  WITH CHECK (auth.uid() = guest_id);

-- Auto-update property avg_rating on new review
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties SET
    avg_rating = (SELECT AVG(rating) FROM reviews WHERE property_id = NEW.property_id),
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE property_id = NEW.property_id)
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_property_rating();

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  link       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications"
  ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_properties_region ON properties(region);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price_per_night);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_owner ON bookings(owner_id);
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_blocked_dates_property ON blocked_dates(property_id, date);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
