# Guia — Criar o backend no Supabase (Idealize 360º)

Este guia é o passo a passo para ligar a plataforma a um backend real e gratuito.
São ~10 minutos. Qualquer dúvida, é só me chamar que eu te ajudo em cada etapa.

---

## Passo 1 — Criar a conta e o projeto

1. Acesse **https://supabase.com** e clique em **Start your project** (pode entrar com o GitHub ou com e-mail).
2. Clique em **New project**.
3. Preencha:
   - **Name**: `idealize-360` (ou o nome que preferir)
   - **Database Password**: crie uma senha forte e **guarde bem** (você vai usar para administrar o banco).
   - **Region**: escolha **South America (São Paulo)** — fica mais rápido no Brasil.
4. Clique em **Create new project** e aguarde ~2 minutos enquanto ele prepara tudo.

---

## Passo 2 — Criar as tabelas (rodar os scripts)

No menu lateral do Supabase, abra o **SQL Editor** (ícone de banco de dados) e faça, **nesta ordem**:

1. Clique em **New query**, cole todo o conteúdo do arquivo
   `supabase/migrations/0001_schema_inicial.sql` e clique em **Run**.
2. Nova query → cole `supabase/migrations/0002_seguranca_rls.sql` → **Run**.
3. (Opcional, recomendado) Nova query → cole `supabase/seed.sql` → **Run**.
   Isso já cria as unidades, cargos, cursos e alguns exemplos.

Se aparecer "Success. No rows returned", deu tudo certo. ✅

> Eu te envio esses três arquivos aqui pelo chat — é só abrir, copiar e colar.

---

## Passo 3 — Pegar as chaves de conexão

1. No menu lateral, vá em **Project Settings** (engrenagem) → **API**.
2. Copie estes dois valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** (uma chave longa começando com `eyJ...`)

⚠️ **Importante:** copie apenas a chave **`anon public`**.
A chave **`service_role`** é secreta — **NÃO** me envie e **NÃO** use no frontend.

---

## Passo 4 — Me enviar as chaves

Cole as duas informações aqui no chat assim:

```
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJ...
```

Com isso eu ligo o sistema ao seu banco, testo o login e já começo a substituir os
dados de exemplo pelos dados reais vindos do banco.

> A chave `anon public` é feita para ficar no aplicativo (é "pública" por design).
> A segurança de verdade fica nas regras de acesso (RLS) que já configurei nos scripts.

---

## Passo 5 — Criar o primeiro usuário (admin)

Depois que o banco estiver pronto, criamos seu login de administrador:

1. No Supabase, vá em **Authentication** → **Users** → **Add user** → **Create new user**.
2. Informe seu e-mail e uma senha. Marque **Auto Confirm User**.
3. Me avisa que eu rodo um comando rápido para te promover a **admin** (nível máximo de acesso).

Pronto — a partir daí você entra na plataforma com login e senha de verdade. 🚀

---

### Resumo do que já está pronto no código

- ✅ Estrutura completa do banco de dados (14 tabelas)
- ✅ Regras de segurança por nível de acesso (admin, RH, gestor, colaborador, candidato)
- ✅ Login e logout reais (Supabase Auth)
- ✅ Proteção de rotas (sem login, não entra)
- ⏳ Falta só: você criar o projeto Supabase e me mandar as chaves.
