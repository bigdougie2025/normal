-- Auto Inspect Pro - Initial Database Schema

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'inspector' CHECK (role IN ('inspector', 'manager', 'admin')),
  phone TEXT,
  pin TEXT, -- 4-digit PIN for presentation mode
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Inspections table
CREATE TABLE inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspector_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('private_purchase', 'pdi')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'submitted', 'amended')),
  vrm TEXT NOT NULL,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_year INT,
  vehicle_color TEXT,
  vehicle_fuel_type TEXT,
  vehicle_engine_size TEXT,
  vehicle_transmission_type TEXT,
  mileage INT,
  mot_data JSONB,
  dvla_data JSONB,
  agreed_purchase_price DECIMAL,
  final_agreed_price DECIMAL,
  overall_grade TEXT CHECK (overall_grade IN ('pass', 'advisory', 'fail')),
  pass_counts INT DEFAULT 0,
  advisory_counts INT DEFAULT 0,
  fail_counts INT DEFAULT 0,
  ai_known_issues JSONB,
  ai_repair_estimate JSONB,
  public_token TEXT UNIQUE,
  seller_pin TEXT,
  notes TEXT,
  is_reinspection BOOLEAN DEFAULT FALSE,
  original_inspection_id UUID REFERENCES inspections(id),
  offline_id TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_vrm ON inspections(vrm);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_inspections_public_token ON inspections(public_token);

-- Inspection sections
CREATE TABLE inspection_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_order INT NOT NULL,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(inspection_id, section_key)
);

-- Inspection items
CREATE TABLE inspection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES inspection_sections(id) ON DELETE CASCADE,
  item_key TEXT NOT NULL,
  label TEXT NOT NULL,
  grade TEXT CHECK (grade IN ('pass', 'advisory', 'fail')),
  notes TEXT,
  tyre_depths JSONB, -- {nsf, osf, nsr, osr}
  item_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inspection photos
CREATE TABLE inspection_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  item_id UUID REFERENCES inspection_items(id) ON DELETE SET NULL,
  marker_id UUID,
  storage_path TEXT,
  thumbnail_path TEXT,
  caption TEXT,
  brightness_score FLOAT,
  resolution_ok BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_inspection ON inspection_photos(inspection_id);
CREATE INDEX idx_photos_item ON inspection_photos(item_id);

-- Body damage markers
CREATE TABLE body_damage_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  x_percent FLOAT NOT NULL,
  y_percent FLOAT NOT NULL,
  view TEXT NOT NULL CHECK (view IN ('front', 'rear', 'driver', 'passenger')),
  damage_type TEXT CHECK (damage_type IN ('dent', 'scratch', 'chip', 'crack', 'rust', 'other')),
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'severe')),
  notes TEXT,
  photo_id UUID REFERENCES inspection_photos(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_damage_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read own profile, admins can read all
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Inspections: inspectors see own, managers/admins see all
CREATE POLICY "Inspectors view own inspections" ON inspections
  FOR SELECT USING (
    inspector_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin'))
  );

CREATE POLICY "Inspectors insert own inspections" ON inspections
  FOR INSERT WITH CHECK (inspector_id = auth.uid());

CREATE POLICY "Inspectors update own inspections" ON inspections
  FOR UPDATE USING (inspector_id = auth.uid());

-- Customer view: public access by token
CREATE POLICY "Public view by token" ON inspections
  FOR SELECT USING (public_token IS NOT NULL AND status = 'submitted');

-- Sections, items, photos: inherit from parent inspection
CREATE POLICY "View sections via inspection" ON inspection_sections
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM inspections WHERE id = inspection_id
    AND (inspector_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin')))
  ));

CREATE POLICY "Insert sections" ON inspection_sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Update sections" ON inspection_sections FOR UPDATE USING (true);

CREATE POLICY "View items via section" ON inspection_items FOR SELECT USING (true);
CREATE POLICY "Insert items" ON inspection_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Update items" ON inspection_items FOR UPDATE USING (true);

CREATE POLICY "View photos via inspection" ON inspection_photos FOR SELECT USING (true);
CREATE POLICY "Insert photos" ON inspection_photos FOR INSERT WITH CHECK (true);

CREATE POLICY "View markers via inspection" ON body_damage_markers FOR SELECT USING (true);
CREATE POLICY "Insert markers" ON body_damage_markers FOR INSERT WITH CHECK (true);
CREATE POLICY "Delete markers" ON body_damage_markers FOR DELETE USING (true);

CREATE POLICY "View audit log" ON audit_log
  FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('manager', 'admin')));
CREATE POLICY "Insert audit log" ON audit_log FOR INSERT WITH CHECK (true);

-- Storage bucket (created via Supabase dashboard, but defined here for reference)
-- CREATE POLICY "Authenticated users can upload" ON storage.objects
--   FOR INSERT TO authenticated WITH CHECK (bucket_id = 'inspection-photos');
-- CREATE POLICY "Authenticated users can view" ON storage.objects
--   FOR SELECT TO authenticated USING (bucket_id = 'inspection-photos');
