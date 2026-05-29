-- SimulationHub WMO-C — Initial Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id            SERIAL PRIMARY KEY,
  project_code  TEXT UNIQUE NOT NULL,
  descricao     TEXT NOT NULL,
  tipo          TEXT NOT NULL,
  linha         TEXT NOT NULL,
  secao         TEXT NOT NULL,
  caracteristica TEXT NOT NULL,
  data_entrada  DATE NOT NULL,
  prioridade    TEXT NOT NULL DEFAULT '2. Média',
  solicitante   TEXT NOT NULL DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'Planejado',
  colaborador   TEXT NOT NULL DEFAULT '',
  andamento     INTEGER NOT NULL DEFAULT 0 CHECK (andamento >= 0 AND andamento <= 100),
  data_final    DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- ACTIVITIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id            SERIAL PRIMARY KEY,
  project_id    INTEGER NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  descricao     TEXT NOT NULL,
  apres_inicial DECIMAL(8,2) NOT NULL DEFAULT 0,
  geometria     DECIMAL(8,2) NOT NULL DEFAULT 0,
  setup         DECIMAL(8,2) NOT NULL DEFAULT 0,
  solucao       DECIMAL(8,2) NOT NULL DEFAULT 0,
  pos           DECIMAL(8,2) NOT NULL DEFAULT 0,
  apres_final   DECIMAL(8,2) NOT NULL DEFAULT 0,
  dias          DECIMAL(6,2) NOT NULL DEFAULT 0,
  data_inicio   DATE,
  data_fim      DATE,
  status        TEXT NOT NULL DEFAULT 'Planejado',
  colaborador   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.projects  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write all projects
CREATE POLICY "Authenticated users can manage projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can read/write all activities
CREATE POLICY "Authenticated users can manage activities"
  ON public.activities
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_status      ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_colaborador ON public.projects(colaborador);
CREATE INDEX IF NOT EXISTS idx_projects_tipo        ON public.projects(tipo);
CREATE INDEX IF NOT EXISTS idx_activities_project   ON public.activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_status    ON public.activities(status);
