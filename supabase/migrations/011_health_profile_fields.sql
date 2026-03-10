-- ============================================================
-- LIFEHUB — Módulo Salud: Perfil Físico
-- ============================================================

ALTER TABLE profiles ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE profiles ADD COLUMN height_cm DECIMAL(5,2);
