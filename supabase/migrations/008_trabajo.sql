-- ============================================================
-- LIFEHUB — Módulo Trabajo
-- ============================================================

-- PROYECTOS
CREATE TABLE IF NOT EXISTS work_projects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  client      TEXT,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  deadline    DATE,
  budget      DECIMAL(12,2),
  color       TEXT DEFAULT '#6366f1',
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE work_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own work_projects" ON work_projects FOR ALL USING (auth.uid() = user_id);

-- TAREAS DE TRABAJO (ligadas o no a proyectos)
CREATE TABLE IF NOT EXISTS work_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id  UUID REFERENCES work_projects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date    DATE,
  estimated_hours DECIMAL(5,2),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE work_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own work_tasks" ON work_tasks FOR ALL USING (auth.uid() = user_id);

-- REUNIONES
CREATE TABLE IF NOT EXISTS work_meetings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id  UUID REFERENCES work_projects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  with_whom   TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME,
  duration_min INT DEFAULT 60,
  location    TEXT,
  type        TEXT DEFAULT 'virtual' CHECK (type IN ('virtual', 'presencial', 'telefonica')),
  agenda      TEXT,
  notes       TEXT,
  status      TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'done', 'cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE work_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own work_meetings" ON work_meetings FOR ALL USING (auth.uid() = user_id);

-- COBROS PENDIENTES (cuentas por cobrar)
CREATE TABLE IF NOT EXISTS work_receivables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id   UUID REFERENCES work_projects(id) ON DELETE SET NULL,
  client       TEXT NOT NULL,
  concept      TEXT NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  currency     TEXT DEFAULT 'ARS',
  due_date     DATE,
  invoice_number TEXT,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
  paid_amount  DECIMAL(12,2) DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE work_receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own work_receivables" ON work_receivables FOR ALL USING (auth.uid() = user_id);

-- PAGOS PENDIENTES (cuentas por pagar / proveedores)
CREATE TABLE IF NOT EXISTS work_payables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_id   UUID REFERENCES work_projects(id) ON DELETE SET NULL,
  vendor       TEXT NOT NULL,
  concept      TEXT NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  currency     TEXT DEFAULT 'ARS',
  due_date     DATE,
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE work_payables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own work_payables" ON work_payables FOR ALL USING (auth.uid() = user_id);

-- TRIBUTACIÓN (impuestos y declaraciones)
CREATE TABLE IF NOT EXISTS work_taxes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name         TEXT NOT NULL,        -- Ej: Monotributo, Ganancias, IVA, IIBB
  type         TEXT DEFAULT 'periodic' CHECK (type IN ('periodic', 'annual', 'one_time')),
  amount       DECIMAL(12,2),
  due_date     DATE NOT NULL,
  period       TEXT,                 -- Ej: Marzo 2026
  status       TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'exempted')),
  category     TEXT DEFAULT 'national' CHECK (category IN ('national', 'provincial', 'municipal')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE work_taxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own work_taxes" ON work_taxes FOR ALL USING (auth.uid() = user_id);
