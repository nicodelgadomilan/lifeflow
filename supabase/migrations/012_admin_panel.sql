-- Crea tabla de configuración de administración
CREATE TABLE IF NOT EXISTS admin_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email text NOT NULL UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Registra el email del administrador master
INSERT INTO admin_config (admin_email) 
VALUES ('master@gmail.com')
ON CONFLICT (admin_email) DO NOTHING;

-- Tabla para controlar habilitación de cuentas (el admin puede deshabilitar usuarios)
CREATE TABLE IF NOT EXISTS user_status (
    user_id uuid PRIMARY KEY,
    is_enabled boolean DEFAULT true,
    disabled_reason text,
    disabled_at timestamptz,
    updated_at timestamptz DEFAULT now()
);

-- Tabla de planes/suscripciones de la plataforma (qué plan tiene cada usuario)
CREATE TABLE IF NOT EXISTS platform_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    plan text NOT NULL DEFAULT 'free', -- 'free', 'pro', 'premium'
    status text NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    started_at timestamptz DEFAULT now(),
    expires_at timestamptz,
    amount numeric(12, 2) DEFAULT 0,
    currency text DEFAULT 'ARS',
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
