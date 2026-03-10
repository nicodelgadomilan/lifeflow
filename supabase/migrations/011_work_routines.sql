-- ============================================================
-- LIFEHUB — Módulo Trabajo (Rutinas y Checklist Diario)
-- ============================================================

CREATE TABLE IF NOT EXISTS work_routines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  time_of_day TEXT DEFAULT 'any' CHECK (time_of_day IN ('morning', 'afternoon', 'evening', 'any')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE work_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own work_routines" ON work_routines FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS work_routine_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id  UUID REFERENCES work_routines(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date        DATE NOT NULL,
  completed   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(routine_id, date)
);

ALTER TABLE work_routine_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own work_routine_logs" ON work_routine_logs FOR ALL USING (auth.uid() = user_id);
