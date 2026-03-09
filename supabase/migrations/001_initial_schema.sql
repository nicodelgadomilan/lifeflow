-- ============================================================
-- LIFEHUB — Esquema inicial (Fase 1)
-- ============================================================

-- ============================================================
-- PROFILES (extiende auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  plan        TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  role        TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  currency    TEXT DEFAULT 'ARS',
  timezone    TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FINANZAS — CATEGORÍAS
-- ============================================================
CREATE TABLE IF NOT EXISTS transaction_categories (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name     TEXT NOT NULL,
  type     TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color    TEXT DEFAULT '#6366f1',
  icon     TEXT DEFAULT 'circle'
);

ALTER TABLE transaction_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own categories" ON transaction_categories FOR ALL USING (auth.uid() = user_id);

-- Categorías por defecto (se insertan por usuario al registrarse)
-- Se manejan desde el frontend

-- ============================================================
-- FINANZAS — TRANSACCIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category    TEXT NOT NULL,
  amount      DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  date        DATE NOT NULL,
  description TEXT,
  is_fixed    BOOLEAN DEFAULT FALSE,
  recurrence  TEXT CHECK (recurrence IN ('daily', 'weekly', 'monthly', 'yearly', NULL)),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own transactions" ON transactions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FINANZAS — SUSCRIPCIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  amount      DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency    TEXT DEFAULT 'ARS',
  cycle       TEXT NOT NULL CHECK (cycle IN ('weekly', 'monthly', 'yearly')),
  next_date   DATE NOT NULL,
  category    TEXT DEFAULT 'Entretenimiento',
  is_active   BOOLEAN DEFAULT TRUE,
  logo_url    TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FINANZAS — SERVICIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  amount      DECIMAL(10,2),
  due_date    DATE,
  paid_date   DATE,
  is_paid     BOOLEAN DEFAULT FALSE,
  category    TEXT DEFAULT 'Servicio',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own services" ON services FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FINANZAS — TARJETAS DE CRÉDITO
-- ============================================================
CREATE TABLE IF NOT EXISTS credit_cards (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  bank         TEXT,
  limit_amount DECIMAL(12,2) NOT NULL,
  used_amount  DECIMAL(12,2) DEFAULT 0,
  due_date     DATE,
  min_payment  DECIMAL(10,2),
  color        TEXT DEFAULT '#1a56db',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own cards" ON credit_cards FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS card_expenses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id      UUID REFERENCES credit_cards(id) ON DELETE CASCADE NOT NULL,
  description  TEXT NOT NULL,
  amount       DECIMAL(10,2) NOT NULL,
  date         DATE NOT NULL,
  installments INT DEFAULT 1,
  category     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE card_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own card expenses" ON card_expenses FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FINANZAS — AHORROS
-- ============================================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name           TEXT NOT NULL,
  goal_amount    DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0,
  location       TEXT,
  color          TEXT DEFAULT '#10b981',
  icon           TEXT DEFAULT 'piggy-bank',
  target_date    DATE,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own savings" ON savings_goals FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS savings_movements (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id  UUID REFERENCES savings_goals(id) ON DELETE CASCADE NOT NULL,
  amount   DECIMAL(10,2) NOT NULL,
  type     TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  date     DATE NOT NULL,
  notes    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE savings_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own savings movements" ON savings_movements FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FINANZAS — ACTIVOS / INVERSIONES
-- ============================================================
CREATE TABLE IF NOT EXISTS assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('Cripto', 'Acciones', 'Inmueble', 'Bien', 'Otro')),
  invested_amount DECIMAL(12,2) NOT NULL,
  current_value   DECIMAL(12,2),
  purchase_date   DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own assets" ON assets FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- ORGANIZACIÓN — EVENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS calendar_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  TIMESTAMPTZ NOT NULL,
  end_date    TIMESTAMPTZ,
  all_day     BOOLEAN DEFAULT FALSE,
  type        TEXT DEFAULT 'event' CHECK (type IN ('event', 'birthday', 'meeting', 'reminder')),
  color       TEXT DEFAULT '#6366f1',
  recurrence  TEXT CHECK (recurrence IN ('yearly', 'monthly', NULL)),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own events" ON calendar_events FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- ORGANIZACIÓN — TAREAS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  category      TEXT DEFAULT 'personal' CHECK (category IN ('personal', 'work', 'home')),
  priority      TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done')),
  due_date      DATE,
  completed_at  TIMESTAMPTZ,
  total_time_sec INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS task_time_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id      UUID REFERENCES tasks(id) ON DELETE CASCADE NOT NULL,
  started_at   TIMESTAMPTZ NOT NULL,
  ended_at     TIMESTAMPTZ,
  duration_sec INT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE task_time_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own task sessions" ON task_time_sessions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- ORGANIZACIÓN — NOTAS
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title      TEXT NOT NULL,
  content    TEXT,
  tags       TEXT[],
  color      TEXT DEFAULT '#fbbf24',
  is_pinned  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own notes" ON notes FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- DEPORTES
-- ============================================================
CREATE TABLE IF NOT EXISTS gym_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date         DATE NOT NULL,
  duration_min INT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gym_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own gym sessions" ON gym_sessions FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS workout_routines (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  days_per_week INT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own routines" ON workout_routines FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id   UUID REFERENCES workout_routines(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,
  sets         INT,
  reps         TEXT,
  weight_kg    DECIMAL(5,2),
  duration_min INT,
  notes        TEXT,
  order_index  INT DEFAULT 0
);

ALTER TABLE routine_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own routine exercises" ON routine_exercises FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS workout_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES workout_routines(id),
  date       DATE NOT NULL,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own workout logs" ON workout_logs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS workout_log_sets (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  log_id            UUID REFERENCES workout_logs(id) ON DELETE CASCADE NOT NULL,
  exercise_name     TEXT NOT NULL,
  set_number        INT,
  reps              INT,
  weight_kg         DECIMAL(5,2),
  duration_min      INT,
  rest_time_sec     INT,
  exercise_time_sec INT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workout_log_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own log sets" ON workout_log_sets FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS sport_activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sport        TEXT NOT NULL,
  date         DATE NOT NULL,
  duration_min INT,
  location     TEXT,
  started_at   TIMESTAMPTZ,
  ended_at     TIMESTAMPTZ,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sport_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own activities" ON sport_activities FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS tabata_presets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            TEXT NOT NULL,
  work_seconds    INT NOT NULL DEFAULT 20,
  rest_seconds    INT NOT NULL DEFAULT 10,
  rounds          INT NOT NULL DEFAULT 8,
  series          INT NOT NULL DEFAULT 1,
  series_rest_sec INT DEFAULT 60,
  warmup_seconds  INT DEFAULT 10,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tabata_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own tabata presets" ON tabata_presets FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS tabata_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preset_id        UUID REFERENCES tabata_presets(id),
  preset_name      TEXT,
  total_time_sec   INT NOT NULL,
  rounds_completed INT NOT NULL,
  date             DATE NOT NULL,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tabata_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own tabata sessions" ON tabata_sessions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- SALUD
-- ============================================================
CREATE TABLE IF NOT EXISTS health_appointments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type          TEXT NOT NULL,
  date          TIMESTAMPTZ NOT NULL,
  doctor        TEXT,
  location      TEXT,
  notes         TEXT,
  reminder_days INT DEFAULT 3,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE health_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own appointments" ON health_appointments FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS health_documents (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name      TEXT NOT NULL,
  type      TEXT,
  file_url  TEXT,
  file_name TEXT,
  date      DATE,
  notes     TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE health_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own health docs" ON health_documents FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- VEHÍCULO
-- ============================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name       TEXT NOT NULL,
  brand      TEXT,
  model      TEXT,
  year       INT,
  plate      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own vehicles" ON vehicles FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS vehicle_maintenances (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  type       TEXT NOT NULL,
  date       DATE NOT NULL,
  mileage_km INT,
  cost       DECIMAL(10,2),
  next_date  DATE,
  next_km    INT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_maintenances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own maintenances" ON vehicle_maintenances FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS vehicle_repairs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id     UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  description    TEXT NOT NULL,
  priority       TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'urgent')),
  estimated_cost DECIMAL(10,2),
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_repairs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own repairs" ON vehicle_repairs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS vehicle_documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id  UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  file_url    TEXT,
  file_name   TEXT,
  expiry_date DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vehicle_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own vehicle docs" ON vehicle_documents FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- DOCUMENTOS GENERALES
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  category    TEXT CHECK (category IN ('Personal', 'Laboral', 'Médico', 'Legal', 'Otro')),
  file_url    TEXT NOT NULL,
  file_name   TEXT,
  file_size   INT,
  mime_type   TEXT,
  expiry_date DATE,
  tags        TEXT[],
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own documents" ON documents FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- METAS
-- ============================================================
CREATE TABLE IF NOT EXISTS goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  type        TEXT DEFAULT 'goal' CHECK (type IN ('goal', 'project', 'idea')),
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  target_date DATE,
  progress    INT DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  color       TEXT DEFAULT '#6366f1',
  icon        TEXT DEFAULT 'target',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own goals" ON goals FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS goal_milestones (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id  UUID REFERENCES goals(id) ON DELETE CASCADE NOT NULL,
  title    TEXT NOT NULL,
  is_done  BOOLEAN DEFAULT FALSE,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own milestones" ON goal_milestones FOR ALL USING (auth.uid() = user_id);
