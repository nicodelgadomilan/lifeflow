-- Expand asset types to include Bonos and FCI
ALTER TABLE assets DROP CONSTRAINT IF EXISTS assets_type_check;
ALTER TABLE assets ADD CONSTRAINT assets_type_check 
  CHECK (type IN ('Cripto', 'Acciones', 'Bonos', 'FCI', 'Inmueble', 'Físico', 'Vehículo', 'Otro'));

-- Add ticker/symbol and quantity fields for financial assets
ALTER TABLE assets ADD COLUMN IF NOT EXISTS ticker TEXT;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS quantity DECIMAL(18,8) DEFAULT 1;
ALTER TABLE assets ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'ARS';
