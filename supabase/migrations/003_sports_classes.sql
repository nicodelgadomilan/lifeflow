-- ============================================================
-- LIFEHUB — Módulo Deportes: Clases Fijas (Fase 2)
-- ============================================================

CREATE TABLE IF NOT EXISTS sport_classes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Dom, 1=Lun, ..., 6=Sab
  start_time  TIME NOT NULL,
  end_time    TIME,
  location    TEXT,
  color       TEXT DEFAULT '#3b82f6',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sport_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own sport classes" 
  ON sport_classes 
  FOR ALL 
  USING (auth.uid() = user_id);
