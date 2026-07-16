-- =============================================================
-- Idealize 360º — Schema inicial do banco de dados
-- Banco: PostgreSQL (Supabase)
-- Migration 0001 — cria tipos, tabelas, índices e triggers básicos
-- =============================================================

-- -------------------------------------------------------------
-- Extensões
-- -------------------------------------------------------------
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- -------------------------------------------------------------
-- Tipos (enums)
-- -------------------------------------------------------------

-- Nível de acesso do usuário no sistema
do $$ begin
  create type nivel_acesso as enum ('admin', 'rh', 'gestor', 'colaborador', 'candidato');
exception when duplicate_object then null; end $$;

-- Situação de uma vaga
do $$ begin
  create type status_vaga as enum ('open', 'paused', 'closed');
exception when duplicate_object then null; end $$;

-- Etapa do candidato no funil de seleção
do $$ begin
  create type status_candidato as enum ('new', 'evaluating', 'interview', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- Perfil comportamental DISC
do $$ begin
  create type perfil_disc as enum ('D', 'I', 'S', 'C');
exception when duplicate_object then null; end $$;

-- Temperamento
do $$ begin
  create type temperamento as enum ('Colérico', 'Sanguíneo', 'Fleumático', 'Melancólico');
exception when duplicate_object then null; end $$;

-- Nível de cultura IDEALIZE (gamificação)
do $$ begin
  create type nivel_idealize as enum ('I', 'D', 'E', 'A', 'L', 'I2', 'Z', 'E2');
exception when duplicate_object then null; end $$;

-- Tipo de contratação da vaga
do $$ begin
  create type tipo_contratacao as enum ('CLT', 'PJ', 'Estágio', 'Temporário', 'Freelancer');
exception when duplicate_object then null; end $$;

-- -------------------------------------------------------------
-- Função utilitária: atualiza automaticamente "updated_at"
-- -------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- 1. UNIDADES (lojas da rede)
-- =============================================================
create table if not exists public.units (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  state       text,
  manager     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_units_updated
  before update on public.units
  for each row execute function public.set_updated_at();

-- =============================================================
-- 2. CARGOS
-- =============================================================
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  department  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_roles_updated
  before update on public.roles
  for each row execute function public.set_updated_at();

-- =============================================================
-- 3. PROFILES (usuários do sistema — vinculado ao Supabase Auth)
--    Cada linha corresponde a um usuário autenticado (auth.users).
-- =============================================================
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  email         text,
  avatar_url    text,
  access_level  nivel_acesso not null default 'colaborador',
  unit_id       uuid references public.units(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- =============================================================
-- 4. VAGAS
-- =============================================================
create table if not exists public.jobs (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  unit_id       uuid references public.units(id) on delete set null,
  role_id       uuid references public.roles(id) on delete set null,
  description   text,
  requirements  text[] not null default '{}',
  benefits      text[] not null default '{}',
  salary        text,
  type          tipo_contratacao not null default 'CLT',
  status        status_vaga not null default 'open',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_jobs_status on public.jobs(status);
create index if not exists idx_jobs_unit on public.jobs(unit_id);
create trigger trg_jobs_updated
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- =============================================================
-- 5. CANDIDATOS
-- =============================================================
create table if not exists public.candidates (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text,
  phone         text,
  job_id        uuid references public.jobs(id) on delete set null,
  unit_id       uuid references public.units(id) on delete set null,
  status        status_candidato not null default 'new',
  disc_profile  perfil_disc,
  temperament   temperamento,
  resume_url    text,
  notes         text,
  applied_at    timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_candidates_job on public.candidates(job_id);
create index if not exists idx_candidates_status on public.candidates(status);
create trigger trg_candidates_updated
  before update on public.candidates
  for each row execute function public.set_updated_at();

-- =============================================================
-- 6. COLABORADORES
--    Pode (opcionalmente) estar ligado a um usuário do sistema (profile).
-- =============================================================
create table if not exists public.employees (
  id                    uuid primary key default gen_random_uuid(),
  profile_id            uuid references public.profiles(id) on delete set null,
  name                  text not null,
  email                 text,
  role_id               uuid references public.roles(id) on delete set null,
  unit_id               uuid references public.units(id) on delete set null,
  hire_date             date,
  disc_profile          perfil_disc,
  temperament           temperamento,
  idealize_level        nivel_idealize default 'I',
  avatar                text,
  performance           integer default 0 check (performance between 0 and 100),
  trainings_completed   integer default 0,
  pending_feedbacks     integer default 0,
  active                boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists idx_employees_unit on public.employees(unit_id);
create index if not exists idx_employees_role on public.employees(role_id);
create trigger trg_employees_updated
  before update on public.employees
  for each row execute function public.set_updated_at();

-- =============================================================
-- 7. CURSOS (Academy)
-- =============================================================
create table if not exists public.courses (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  pillar        text,          -- Onboarding, Vendas, Técnico, Cultura...
  target_role   text,          -- "Todos" ou nome de um cargo
  duration      text,          -- ex.: "8h"
  thumbnail     text,
  mandatory     boolean not null default false,
  published     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger trg_courses_updated
  before update on public.courses
  for each row execute function public.set_updated_at();

-- =============================================================
-- 8. AULAS (lições de cada curso)
-- =============================================================
create table if not exists public.lessons (
  id            uuid primary key default gen_random_uuid(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  title         text not null,
  content       text,
  video_url     text,
  duration      text,
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_lessons_course on public.lessons(course_id);
create trigger trg_lessons_updated
  before update on public.lessons
  for each row execute function public.set_updated_at();

-- =============================================================
-- 9. MATRÍCULAS (progresso de um colaborador em um curso)
-- =============================================================
create table if not exists public.enrollments (
  id             uuid primary key default gen_random_uuid(),
  employee_id    uuid not null references public.employees(id) on delete cascade,
  course_id      uuid not null references public.courses(id) on delete cascade,
  progress       integer not null default 0 check (progress between 0 and 100),
  completed_at   timestamptz,
  certificate_url text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (employee_id, course_id)
);
create index if not exists idx_enrollments_employee on public.enrollments(employee_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);
create trigger trg_enrollments_updated
  before update on public.enrollments
  for each row execute function public.set_updated_at();

-- Marca quais aulas o colaborador já concluiu
create table if not exists public.lesson_progress (
  id             uuid primary key default gen_random_uuid(),
  enrollment_id  uuid not null references public.enrollments(id) on delete cascade,
  lesson_id      uuid not null references public.lessons(id) on delete cascade,
  completed      boolean not null default false,
  completed_at   timestamptz,
  unique (enrollment_id, lesson_id)
);

-- =============================================================
-- 10. AVALIAÇÕES (avaliação de desempenho de colaborador)
-- =============================================================
create table if not exists public.evaluations (
  id             uuid primary key default gen_random_uuid(),
  employee_id    uuid not null references public.employees(id) on delete cascade,
  evaluator_id   uuid references public.profiles(id) on delete set null,
  period         text,          -- ex.: "2024-Q1"
  score          integer check (score between 0 and 100),
  strengths      text,
  improvements   text,
  comments       text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_evaluations_employee on public.evaluations(employee_id);
create trigger trg_evaluations_updated
  before update on public.evaluations
  for each row execute function public.set_updated_at();

-- =============================================================
-- 11. PDIs (Plano de Desenvolvimento Individual)
-- =============================================================
create table if not exists public.pdis (
  id             uuid primary key default gen_random_uuid(),
  employee_id    uuid not null references public.employees(id) on delete cascade,
  title          text not null,
  description    text,
  status         text not null default 'em_andamento', -- em_andamento, concluido, atrasado
  due_date       date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_pdis_employee on public.pdis(employee_id);
create trigger trg_pdis_updated
  before update on public.pdis
  for each row execute function public.set_updated_at();

-- Itens/metas de cada PDI
create table if not exists public.pdi_items (
  id          uuid primary key default gen_random_uuid(),
  pdi_id      uuid not null references public.pdis(id) on delete cascade,
  description text not null,
  done        boolean not null default false,
  position    integer not null default 0
);

-- =============================================================
-- 12. NOTIFICAÇÕES
-- =============================================================
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  type        text,           -- feedback, training, candidate...
  title       text not null,
  message     text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- =============================================================
-- Fim da migration 0001
-- =============================================================
