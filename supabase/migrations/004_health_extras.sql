-- ============================================================
-- LIFEHUB — Módulo Salud: Extras (Fase 2)
-- ============================================================

CREATE TABLE IF NOT EXISTS habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  frequency   TEXT DEFAULT 'daily', -- daily, weekly
  time_of_day TEXT DEFAULT 'any', -- morning, afternoon, evening, any
  color       TEXT DEFAULT '#10b981',
  icon        TEXT DEFAULT 'leaf',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own habits" ON habits FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS habit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id    UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL,
  completed   BOOLEAN DEFAULT TRUE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS health_metrics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL, -- weight, water, hours_of_sleep, blood_pressure, etc
  value       DECIMAL(10,2) NOT NULL,
  unit        TEXT NOT NULL, -- kg, L, hrs, mmHg
  date        DATE NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own health metrics" ON health_metrics FOR ALL USING (auth.uid() = user_id);
