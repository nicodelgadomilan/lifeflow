-- ============================================================
-- LIFEHUB — Configuración de usuario (tasas de cambio, etc.)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_settings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  -- Tasas de cambio vs ARS (peso argentino como base)
  usd_rate         DECIMAL(12,4) DEFAULT 1000,  -- 1 USD = X ARS
  eur_rate         DECIMAL(12,4) DEFAULT 1100,  -- 1 EUR = X ARS
  usd_blue_rate    DECIMAL(12,4) DEFAULT 1200,  -- Dólar blue
  -- Moneda principal de visualización
  display_currency TEXT DEFAULT 'ARS',
  -- Última actualización manual
  rates_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Agregar columna currency a transactions (si no existe)
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ARS';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_ars DECIMAL(12,2);

-- Función para crear settings por defecto al crear usuario
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para nuevos usuarios (puede fallar si ya existe, usar ON CONFLICT)
DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();
