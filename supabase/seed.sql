-- =============================================================
-- Idealize 360º — Dados iniciais (seed)
-- Popula o banco com as unidades, cargos, cursos e algumas vagas
-- que já existiam no protótipo, para o sistema não nascer vazio.
-- Rode DEPOIS das migrations 0001 e 0002.
-- =============================================================

-- Unidades
insert into public.units (name, city, state, manager) values
  ('Matriz - São Paulo',        'São Paulo',       'SP', 'Carlos Silva'),
  ('Unidade Campinas',          'Campinas',        'SP', 'Ana Souza'),
  ('Unidade Ribeirão Preto',    'Ribeirão Preto',  'SP', 'Pedro Santos'),
  ('Unidade Curitiba',          'Curitiba',        'PR', 'Maria Oliveira'),
  ('Unidade Belo Horizonte',    'Belo Horizonte',  'MG', 'João Pereira')
on conflict do nothing;

-- Cargos
insert into public.roles (name, department) values
  ('Consultor de Vendas',       'Comercial'),
  ('Pós-venda',                 'Atendimento'),
  ('Técnico de Laboratório',    'Operações'),
  ('Gestor de Unidade',         'Gestão'),
  ('Analista de RH',            'Recursos Humanos'),
  ('Coordenador Comercial',     'Comercial')
on conflict do nothing;

-- Vagas (referenciando unidade e cargo por nome)
insert into public.jobs (title, unit_id, role_id, description, requirements, benefits, salary, type, status)
values
  (
    'Consultor de Vendas',
    (select id from public.units where name = 'Matriz - São Paulo' limit 1),
    (select id from public.roles where name = 'Consultor de Vendas' limit 1),
    'Buscamos um consultor de vendas para atender clientes na loja matriz. O profissional será responsável por todo o processo de vendas, desde a recepção até o fechamento.',
    array['Experiência em vendas','Boa comunicação','Ensino médio completo'],
    array['Vale transporte','Vale refeição','Comissão','Plano de saúde'],
    'R$ 2.500 - R$ 4.500', 'CLT', 'open'
  ),
  (
    'Técnico de Laboratório',
    (select id from public.units where name = 'Unidade Campinas' limit 1),
    (select id from public.roles where name = 'Técnico de Laboratório' limit 1),
    'Vaga para técnico de laboratório óptico. O profissional será responsável pela confecção e ajuste de lentes.',
    array['Curso técnico em óptica','Experiência com surfaçagem','Atenção aos detalhes'],
    array['Vale transporte','Vale refeição','Plano de saúde','PLR'],
    'R$ 3.000 - R$ 4.000', 'CLT', 'open'
  ),
  (
    'Pós-venda',
    (select id from public.units where name = 'Unidade Ribeirão Preto' limit 1),
    (select id from public.roles where name = 'Pós-venda' limit 1),
    'Responsável pelo atendimento pós-venda, garantindo a satisfação dos clientes e resolução de problemas.',
    array['Experiência em atendimento','Paciência','Proatividade'],
    array['Vale transporte','Vale refeição','Plano de saúde'],
    'R$ 2.200 - R$ 2.800', 'CLT', 'open'
  )
on conflict do nothing;

-- Cursos (Academy)
insert into public.courses (title, description, pillar, target_role, duration, thumbnail, mandatory)
values
  ('Onboarding Consultor de Vendas', 'Trilha completa de integração para novos consultores de vendas.', 'Onboarding', 'Consultor de Vendas', '8h',  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', true),
  ('Técnicas de Vendas SPIN',        'Aprenda a metodologia SPIN para aumentar suas conversões.',       'Vendas',     'Consultor de Vendas', '4h',  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400', true),
  ('Conhecimento de Lentes',         'Tudo sobre tipos de lentes, materiais e tratamentos.',            'Técnico',    'Todos',               '6h',  'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400', true),
  ('Cultura Idealize',               'Conheça os valores, missão e visão da Idealize.',                 'Cultura',    'Todos',               '2h',  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', true),
  ('Rapport e Conexão',              'Como criar conexão genuína com os clientes.',                     'Vendas',     'Consultor de Vendas', '3h',  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400', false),
  ('Laboratório Óptico Básico',      'Fundamentos do trabalho em laboratório óptico.',                  'Técnico',    'Técnico de Laboratório','12h', 'https://images.unsplash.com/photo-1581093458791-9f3c3250a8b0?w=400', true)
on conflict do nothing;

-- Colaboradores de exemplo
insert into public.employees (name, email, role_id, unit_id, hire_date, disc_profile, temperament, idealize_level, avatar, performance, trainings_completed, pending_feedbacks)
values
  ('Carlos Silva',   'carlos.silva@idealize.com',   (select id from public.roles where name='Gestor de Unidade' limit 1),      (select id from public.units where name='Matriz - São Paulo' limit 1),  '2019-03-15', 'D', 'Colérico',    'I',  'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos', 92, 18, 2),
  ('Ana Souza',      'ana.souza@idealize.com',      (select id from public.roles where name='Gestor de Unidade' limit 1),      (select id from public.units where name='Unidade Campinas' limit 1),    '2020-06-01', 'I', 'Sanguíneo',   'D',  'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',    88, 15, 0),
  ('Pedro Santos',   'pedro.santos@idealize.com',   (select id from public.roles where name='Consultor de Vendas' limit 1),    (select id from public.units where name='Matriz - São Paulo' limit 1),  '2022-01-10', 'S', 'Fleumático',  'E',  'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',  85, 12, 1),
  ('Maria Oliveira', 'maria.oliveira@idealize.com', (select id from public.roles where name='Pós-venda' limit 1),              (select id from public.units where name='Matriz - São Paulo' limit 1),  '2021-08-20', 'C', 'Melancólico', 'A',  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',  94, 20, 0),
  ('João Pereira',   'joao.pereira@idealize.com',   (select id from public.roles where name='Técnico de Laboratório' limit 1), (select id from public.units where name='Unidade Campinas' limit 1),    '2023-02-01', 'C', 'Melancólico', 'L',  'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',   78,  8, 3)
on conflict do nothing;

-- =============================================================
-- Fim do seed
-- =============================================================
