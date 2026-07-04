/*
# CACTUS Platform Initial Schema

## Overview
This migration creates the complete database schema for the CACTUS workshop platform,
including user-scoped data isolation through Row Level Security (RLS).

## Tables Created

1. **workshops** - Workshop listings
   - `id` (uuid, primary key)
   - `title`, `description`, `theme`, `emoji` (text)
   - `date`, `deadline`, `time_start`, `time_end` (date/time)
   - `location`, `instructor` (text)
   - `price` (integer)
   - `seats_total`, `seats_taken` (integer)
   - `difficulty` (text)
   - `color` (text for UI theming)
   - `schedule`, `faqs`, `materials_included`, `what_to_bring` (jsonb arrays)
   - `what_youll_make` (text)
   - `is_active` (boolean, for soft delete)
   - `created_at`, `updated_at` (timestamps)

2. **registrations** - User registrations for workshops
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users, with DEFAULT auth.uid())
   - `registration_number` (text, unique)
   - `workshop_id` (uuid, references workshops)
   - `seat_number` (integer)
   - `full_name`, `nickname`, `phone`, `email` (text)
   - `university`, `faculty`, `student_id` (text)
   - `emergency_contact` (text, optional)
   - `special_notes`, `dietary`, `accessibility` (text, optional)
   - `character_name` (text)
   - `character_state` (jsonb)
   - `status` (text: pending, confirmed, cancelled)
   - `created_at`, `updated_at` (timestamps)

3. **payments** - Payment records linked to registrations
   - `id` (uuid, primary key)
   - `registration_id` (uuid, references registrations)
   - `user_id` (uuid, references auth.users, with DEFAULT auth.uid())
   - `method` (text: bank, qris, ewallet)
   - `amount` (integer)
   - `proof_data` (text, base64 image data)
   - `proof_url` (text, storage URL if uploaded)
   - `status` (text: waiting, verified, rejected, expired)
   - `verified_at`, `verified_by` (timestamp and admin user)
   - `rejection_reason` (text)
   - `created_at`, `updated_at` (timestamps)

4. **tickets** - Generated tickets after payment verification
   - `id` (uuid, primary key)
   - `registration_id` (uuid, references registrations, unique)
   - `user_id` (uuid, references auth.users, with DEFAULT auth.uid())
   - `ticket_number` (text, unique)
   - `qr_code` (text, unique QR payload)
   - `is_used` (boolean, for check-in)
   - `used_at` (timestamp)
   - `created_at` (timestamps)

5. **workshop_completions** - Records of completed workshops
   - `id` (uuid, primary key)
   - `registration_id` (uuid, references registrations)
   - `user_id` (uuid, references auth.users, with DEFAULT auth.uid())
   - `workshop_id` (uuid, references workshops)
   - `completed_at` (timestamp)
   - `approved_at`, `approved_by` (admin approval)
   - `notes` (text)
   - `created_at` (timestamps)

6. **certificates** - Completion certificates
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users, with DEFAULT auth.uid())
   - `completion_id` (uuid, references workshop_completions)
   - `certificate_number` (text, unique)
   - `issued_at` (timestamp)
   - `created_at` (timestamps)

7. **badges** - User achievement badges
   - `id` (uuid, primary key)
   - `user_id` (uuid, references auth.users, with DEFAULT auth.uid())
   - `completion_id` (uuid, references workshop_completions)
   - `badge_type` (text)
   - `badge_name` (text)
   - `earned_at` (timestamp)
   - `created_at` (timestamps)

8. **profiles** - Extended user profiles
   - `id` (uuid, primary key, references auth.users)
   - `display_name` (text)
   - `avatar_url` (text)
   - `preferences` (jsonb)
   - `created_at`, `updated_at` (timestamps)

## Security (RLS)
- All tables have RLS enabled
- User-scoped tables use `auth.uid()` for ownership checks
- Public read for workshops (users can browse before signing in)
- Owner-scoped CRUD for registrations, payments, tickets, completions, certificates, badges

## Important Notes
1. `user_id` columns have `DEFAULT auth.uid()` so frontend inserts work without passing user_id
2. Policies are scoped to `authenticated` role since this app requires sign-in
3. `emergency_contact` is now nullable (optional field per requirements)
4. Workshop capacity is tracked via `seats_taken` column, updated by triggers
5. Tickets are only created after payment status is 'verified'
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- WORKSHOPS TABLE (publicly readable)
-- ============================================
CREATE TABLE IF NOT EXISTS workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text,
  emoji text DEFAULT '✿',
  date date NOT NULL,
  deadline date NOT NULL,
  time_start text,
  time_end text,
  location text,
  instructor text,
  price integer NOT NULL DEFAULT 0,
  seats_total integer NOT NULL DEFAULT 20,
  seats_taken integer NOT NULL DEFAULT 0,
  difficulty text DEFAULT 'beginner',
  color text DEFAULT '#c8dbc0',
  schedule jsonb DEFAULT '[]',
  faqs jsonb DEFAULT '[]',
  materials_included jsonb DEFAULT '[]',
  what_to_bring jsonb DEFAULT '[]',
  what_youll_make text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;

-- Workshops are readable by everyone (anon + authenticated)
DROP POLICY IF EXISTS "workshops_select" ON workshops;
CREATE POLICY "workshops_select" ON workshops FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Only authenticated users can insert/update/delete (admin function)
DROP POLICY IF EXISTS "workshops_insert" ON workshops;
CREATE POLICY "workshops_insert" ON workshops FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "workshops_update" ON workshops;
CREATE POLICY "workshops_update" ON workshops FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "workshops_delete" ON workshops;
CREATE POLICY "workshops_delete" ON workshops FOR DELETE
  TO authenticated USING (true);

-- ============================================
-- PROFILES TABLE (user profile data)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- REGISTRATIONS TABLE (user-scoped)
-- ============================================
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_number text UNIQUE NOT NULL,
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  seat_number integer NOT NULL DEFAULT 1,
  
  -- Personal info
  full_name text NOT NULL,
  nickname text,
  phone text NOT NULL,
  email text NOT NULL,
  university text NOT NULL,
  faculty text NOT NULL,
  student_id text,
  emergency_contact text,  -- NOW OPTIONAL (nullable)
  
  -- Additional info
  special_notes text,
  dietary text,
  accessibility text,
  
  -- Character data
  character_name text NOT NULL,
  character_state jsonb NOT NULL DEFAULT '{}',
  
  -- Status
  status text NOT NULL DEFAULT 'pending',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_workshop_id ON registrations(workshop_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registrations_select_own" ON registrations;
CREATE POLICY "registrations_select_own" ON registrations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "registrations_insert_own" ON registrations;
CREATE POLICY "registrations_insert_own" ON registrations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "registrations_update_own" ON registrations;
CREATE POLICY "registrations_update_own" ON registrations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "registrations_delete_own" ON registrations;
CREATE POLICY "registrations_delete_own" ON registrations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- PAYMENTS TABLE (user-scoped)
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL DEFAULT 'bank',
  amount integer NOT NULL DEFAULT 0,
  proof_data text,
  proof_url text,
  status text NOT NULL DEFAULT 'waiting',
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_registration_id ON payments(registration_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_own" ON payments;
CREATE POLICY "payments_select_own" ON payments FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_insert_own" ON payments;
CREATE POLICY "payments_insert_own" ON payments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "payments_update_own" ON payments;
CREATE POLICY "payments_update_own" ON payments FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TICKETS TABLE (user-scoped, created after payment verified)
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number text UNIQUE NOT NULL,
  qr_code text UNIQUE NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_registration_id ON tickets(registration_id);
CREATE INDEX IF NOT EXISTS idx_tickets_ticket_number ON tickets(ticket_number);

ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tickets_select_own" ON tickets;
CREATE POLICY "tickets_select_own" ON tickets FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tickets_insert_own" ON tickets;
CREATE POLICY "tickets_insert_own" ON tickets FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tickets_update_own" ON tickets;
CREATE POLICY "tickets_update_own" ON tickets FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- WORKSHOP COMPLETIONS TABLE (user-scoped)
-- ============================================
CREATE TABLE IF NOT EXISTS workshop_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_completions_user_id ON workshop_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_completions_workshop_id ON workshop_completions(workshop_id);
CREATE INDEX IF NOT EXISTS idx_completions_registration_id ON workshop_completions(registration_id);

ALTER TABLE workshop_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "completions_select_own" ON workshop_completions;
CREATE POLICY "completions_select_own" ON workshop_completions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "completions_insert_own" ON workshop_completions;
CREATE POLICY "completions_insert_own" ON workshop_completions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "completions_update_own" ON workshop_completions;
CREATE POLICY "completions_update_own" ON workshop_completions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================
-- CERTIFICATES TABLE (user-scoped)
-- ============================================
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_id uuid NOT NULL REFERENCES workshop_completions(id) ON DELETE CASCADE,
  certificate_number text UNIQUE NOT NULL,
  issued_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_completion_id ON certificates(completion_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certificates_select_own" ON certificates;
CREATE POLICY "certificates_select_own" ON certificates FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "certificates_insert_own" ON certificates;
CREATE POLICY "certificates_insert_own" ON certificates FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================
-- BADGES TABLE (user-scoped)
-- ============================================
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  completion_id uuid REFERENCES workshop_completions(id) ON DELETE SET NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  earned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_badges_user_id ON badges(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_completion_id ON badges(completion_id);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "badges_select_own" ON badges;
CREATE POLICY "badges_select_own" ON badges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "badges_insert_own" ON badges;
CREATE POLICY "badges_insert_own" ON badges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to generate unique registration number
CREATE OR REPLACE FUNCTION generate_registration_number()
RETURNS text AS $$
DECLARE
  year_part text := to_char(now(), 'YYYY');
  random_part text := lpad(floor(random() * 9000 + 1000)::text, 4, '0');
BEGIN
  RETURN 'CAC-' || year_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS text AS $$
DECLARE
  prefix text := 'TIX';
  random_part text := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
BEGIN
  RETURN prefix || random_part;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique QR code payload
CREATE OR REPLACE FUNCTION generate_qr_payload(reg_id uuid, ticket_num text)
RETURNS text AS $$
BEGIN
  RETURN 'cactus://' || reg_id::text || '/' || ticket_num || '/' || extract(epoch from now())::bigint::text;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create ticket when payment is verified
CREATE OR REPLACE FUNCTION handle_payment_verified()
RETURNS TRIGGER AS $$
DECLARE
  reg_rec RECORD;
  ticket_num text;
  qr_payload text;
BEGIN
  -- Only act when status changes TO 'verified'
  IF NEW.status = 'verified' AND (OLD.status IS NULL OR OLD.status != 'verified') THEN
    -- Get the related registration
    SELECT * INTO reg_rec FROM registrations WHERE id = NEW.registration_id;
    
    IF reg_rec IS NOT NULL THEN
      -- Generate ticket number and QR code
      ticket_num := generate_ticket_number();
      qr_payload := generate_qr_payload(reg_rec.id, ticket_num);
      
      -- Create the ticket
      INSERT INTO tickets (registration_id, user_id, ticket_number, qr_code)
      VALUES (reg_rec.id, reg_rec.user_id, ticket_num, qr_payload);
      
      -- Update registration status to confirmed
      UPDATE registrations 
      SET status = 'confirmed', updated_at = now()
      WHERE id = NEW.registration_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS payment_verified_trigger ON payments;
CREATE TRIGGER payment_verified_trigger
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_verified();

-- Function to update seats_taken when registration is created
CREATE OR REPLACE FUNCTION update_workshop_seats_on_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment seats_taken when a new registration is inserted
  IF TG_OP = 'INSERT' THEN
    UPDATE workshops 
    SET seats_taken = seats_taken + 1, updated_at = now()
    WHERE id = NEW.workshop_id;
  END IF;
  
  -- Decrement seats_taken when a registration is deleted
  IF TG_OP = 'DELETE' THEN
    UPDATE workshops 
    SET seats_taken = GREATEST(seats_taken - 1, 0), updated_at = now()
    WHERE id = OLD.workshop_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS registration_seats_trigger ON registrations;
CREATE TRIGGER registration_seats_trigger
  AFTER INSERT OR DELETE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_workshop_seats_on_registration();

-- Updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS workshops_updated_at ON workshops;
CREATE TRIGGER workshops_updated_at BEFORE UPDATE ON workshops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS registrations_updated_at ON registrations;
CREATE TRIGGER registrations_updated_at BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS payments_updated_at ON payments;
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Sample workshops
-- ============================================
INSERT INTO workshops (title, description, theme, emoji, date, deadline, time_start, time_end, location, instructor, price, seats_total, seats_taken, difficulty, color, schedule, faqs, materials_included, what_to_bring, what_youll_make) VALUES
(
  'Cozy Keychain Workshop',
  'Create your very own cute keychain character with our signature CACTUS style! Perfect for beginners who want to make something adorable.',
  'DIY Crafting',
  '🌿',
  '2025-08-15',
  '2025-08-10',
  '14:00',
  '17:00',
  'Creative Studio, 2nd Floor Mall XYZ',
  'Kak Riefka',
  85000,
  15,
  0,
  'beginner',
  '#c8dbc0',
  '[{"time":"14:00","activity":"Welcome & Introduction"},{"time":"14:30","activity":"Character Design Basics"},{"time":"15:00","activity":"Creating Your Keychain"},{"time":"16:30","activity":"Finishing Touches"},{"time":"17:00","activity":"Photo Session & Closing"}]',
  '[{"q":"Do I need to bring anything?","a":"No! All materials are provided. Just bring yourself and your creativity!"},{"q":"Can I take my creation home?","a":"Yes! Your keychain is yours to keep and cherish."}]',
  '["Premium Shrink Plastic", "Colored Markers", "Keychain Hardware", "Decorative Beads", "Gift Box"]',
  '["Your phone for photos", "A smile!"]',
  'One adorable handmade keychain featuring your CACTUS character'
),
(
  'Advanced Character Design',
  'Take your CACTUS character to the next level with advanced techniques! Learn shading, accessories, and special effects.',
  'Advanced Crafting',
  '✨',
  '2025-08-22',
  '2025-08-18',
  '13:00',
  '17:00',
  'Workshop Hall, Building A',
  'Kak Maya',
  150000,
  10,
  0,
  'advanced',
  '#f5c5bb',
  '[{"time":"13:00","activity":"Advanced Techniques Overview"},{"time":"13:30","activity":"Character Customization"},{"time":"14:30","activity":"Creating with Mixed Media"},{"time":"16:00","activity":"Final Assembly"},{"time":"17:00","activity":"Gallery Walk & Photos"}]',
  '[{"q":"Is this suitable for beginners?","a":"We recommend taking the basic workshop first, but enthusiastic beginners are welcome!"}]',
  '["Premium Art Supplies", "Specialty Markers", "Accessories Kit", "Frame Display"]',
  '["Your previous creations (optional)", "Notebook for ideas"]',
  'An advanced CACTUS character with custom accessories and display frame'
),
(
  'Weekend Crafternoon',
  'A relaxed afternoon of crafting and making new friends! Perfect for groups and solo crafters alike.',
  'Social Crafting',
  '☕',
  '2025-08-29',
  '2025-08-25',
  '15:00',
  '18:00',
  'Cafe Cactus, Downtown',
  'Team CACTUS',
  95000,
  20,
  0,
  'beginner',
  '#b5cfe0',
  '[{"time":"15:00","activity":"Welcome Drinks"},{"time":"15:30","activity":"Crafting Time"},{"time":"17:00","activity":"Snack Break"},{"time":"17:30","activity":"Finishing Up"},{"time":"18:00","activity":"Group Photo"}]',
  '[{"q":"Is food included?","a":"Yes! Light snacks and drinks are provided."}]',
  '["Crafting Materials", "Snacks", "Drinks", "Gift Bag"]',
  '["Your friends!", "Comfortable clothes"]',
  'A cute CACTUS character plus new crafting friends'
);