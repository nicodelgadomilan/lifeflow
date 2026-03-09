-- ============================================================
-- LIFEHUB — Módulo de Compras (Fase 2)
-- ============================================================

CREATE TABLE IF NOT EXISTS shopping_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  is_checked  BOOLEAN DEFAULT FALSE,
  category    TEXT DEFAULT 'General',
  price       DECIMAL(10,2),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE shopping_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own shopping items" 
  ON shopping_items 
  FOR ALL 
  USING (auth.uid() = user_id);
