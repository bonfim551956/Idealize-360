-- =============================================================
-- Idealize 360º — Segurança (RLS) e automações de usuário
-- Migration 0002
-- =============================================================
-- RLS (Row Level Security) garante que cada usuário só acesse o
-- que tem permissão. Aqui definimos uma base sensata:
--   - Leitura: qualquer usuário autenticado enxerga os dados.
--   - Escrita: apenas admin e RH podem criar/editar/excluir.
--   - Candidatura pública: qualquer pessoa (mesmo sem login) pode
--     ver vagas abertas e se candidatar.
-- Depois refinamos por unidade/gestor conforme a necessidade.
-- =============================================================

-- -------------------------------------------------------------
-- Função auxiliar: retorna o nível de acesso do usuário logado
-- -------------------------------------------------------------
create or replace function public.current_access_level()
returns nivel_acesso as $$
  select access_level from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- Função auxiliar: usuário é admin ou RH?
create or replace function public.is_admin_or_rh()
returns boolean as $$
  select coalesce(public.current_access_level() in ('admin','rh'), false);
$$ language sql stable security definer;

-- -------------------------------------------------------------
-- Gatilho: ao criar um usuário no Auth, cria o perfil
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, access_level)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email,
    'colaborador'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- Ativa RLS em todas as tabelas
-- =============================================================
alter table public.units          enable row level security;
alter table public.roles          enable row level security;
alter table public.profiles       enable row level security;
alter table public.jobs           enable row level security;
alter table public.candidates     enable row level security;
alter table public.employees      enable row level security;
alter table public.courses        enable row level security;
alter table public.lessons        enable row level security;
alter table public.enrollments    enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.evaluations    enable row level security;
alter table public.pdis           enable row level security;
alter table public.pdi_items      enable row level security;
alter table public.notifications  enable row level security;

-- -------------------------------------------------------------
-- PROFILES
-- -------------------------------------------------------------
-- Cada um lê o próprio perfil; admin/RH leem todos.
create policy "profiles_select" on public.profiles
  for select using (id = auth.uid() or public.is_admin_or_rh());
-- Cada um edita o próprio perfil; admin/RH editam qualquer um.
create policy "profiles_update" on public.profiles
  for update using (id = auth.uid() or public.is_admin_or_rh());

-- -------------------------------------------------------------
-- Tabelas de leitura geral p/ autenticados + escrita admin/RH
-- (units, roles, employees, courses, lessons, evaluations, pdis...)
-- -------------------------------------------------------------
-- UNITS
create policy "units_read"  on public.units      for select using (auth.role() = 'authenticated');
create policy "units_write" on public.units      for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- ROLES
create policy "roles_read"  on public.roles       for select using (auth.role() = 'authenticated');
create policy "roles_write" on public.roles       for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- EMPLOYEES
create policy "employees_read"  on public.employees for select using (auth.role() = 'authenticated');
create policy "employees_write" on public.employees for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- COURSES
create policy "courses_read"  on public.courses    for select using (auth.role() = 'authenticated');
create policy "courses_write" on public.courses    for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- LESSONS
create policy "lessons_read"  on public.lessons    for select using (auth.role() = 'authenticated');
create policy "lessons_write" on public.lessons    for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- EVALUATIONS
create policy "evaluations_read"  on public.evaluations for select using (auth.role() = 'authenticated');
create policy "evaluations_write" on public.evaluations for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- PDIs
create policy "pdis_read"  on public.pdis       for select using (auth.role() = 'authenticated');
create policy "pdis_write" on public.pdis       for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());
create policy "pdi_items_read"  on public.pdi_items for select using (auth.role() = 'authenticated');
create policy "pdi_items_write" on public.pdi_items for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- ENROLLMENTS / LESSON_PROGRESS (leitura autenticada; escrita admin/RH por ora)
create policy "enrollments_read"  on public.enrollments for select using (auth.role() = 'authenticated');
create policy "enrollments_write" on public.enrollments for all    using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());
create policy "lesson_progress_read"  on public.lesson_progress for select using (auth.role() = 'authenticated');
create policy "lesson_progress_write" on public.lesson_progress for all using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- -------------------------------------------------------------
-- JOBS — vagas abertas são públicas (página de carreiras)
-- -------------------------------------------------------------
create policy "jobs_read_public"  on public.jobs
  for select using (status = 'open' or auth.role() = 'authenticated');
create policy "jobs_write" on public.jobs
  for all using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- -------------------------------------------------------------
-- CANDIDATES — qualquer pessoa pode se candidatar (insert público);
-- leitura/edição só para autenticados admin/RH.
-- -------------------------------------------------------------
create policy "candidates_insert_public" on public.candidates
  for insert with check (true);
create policy "candidates_read" on public.candidates
  for select using (public.is_admin_or_rh());
create policy "candidates_update" on public.candidates
  for update using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());
create policy "candidates_delete" on public.candidates
  for delete using (public.is_admin_or_rh());

-- -------------------------------------------------------------
-- NOTIFICATIONS — cada usuário vê as suas
-- -------------------------------------------------------------
create policy "notifications_read" on public.notifications
  for select using (user_id = auth.uid() or public.is_admin_or_rh());
create policy "notifications_update" on public.notifications
  for update using (user_id = auth.uid());
create policy "notifications_write_admin" on public.notifications
  for all using (public.is_admin_or_rh()) with check (public.is_admin_or_rh());

-- =============================================================
-- Fim da migration 0002
-- =============================================================
