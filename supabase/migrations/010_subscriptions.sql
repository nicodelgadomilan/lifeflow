-- ============================================================
-- LIFEHUB — Sistema de Suscripciones
-- ============================================================

-- Extendemos profiles con campos de suscripción
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_payment_method TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mp_subscription_id TEXT;

-- Tabla de historial de pagos
CREATE TABLE IF NOT EXISTS subscription_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider        TEXT NOT NULL CHECK (provider IN ('stripe', 'mercadopago')),
  provider_id     TEXT NOT NULL,          -- ID del pago en el proveedor
  amount          DECIMAL(12,2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'ARS',
  status          TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'refunded')),
  plan            TEXT NOT NULL DEFAULT 'pro',
  period_start    TIMESTAMPTZ,
  period_end      TIMESTAMPTZ,
  metadata        JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own payments" ON subscription_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role all payments" ON subscription_payments FOR ALL USING (true);
