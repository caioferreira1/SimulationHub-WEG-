# SimulationHub WMO-C

App web para gerenciamento de demandas de simulação — WEG Equipamentos Elétricos, Jaraguá do Sul.

## Stack

- **Frontend**: React + TypeScript + Vite
- **Estilização**: Tailwind CSS v4
- **Backend/DB**: Supabase (PostgreSQL + Auth)
- **Formulários**: React Hook Form + Zod
- **Data fetching**: TanStack Query

## Configuração

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd simulation-hub
npm install
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto
2. Execute `supabase/migrations/001_initial_schema.sql` no **SQL Editor** do Supabase
3. Ative o provedor de autenticação **Email** em Authentication → Providers
4. Crie os usuários em **Authentication → Users → Invite User**

### 3. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha `.env` com os dados do seu projeto Supabase (em **Settings → API**):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 4. Rodar localmente

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Estrutura

```
src/
├── components/
│   ├── layout/       # Layout, Sidebar
│   ├── projects/     # ProjectForm
│   ├── activities/   # ActivityForm
│   └── ui/           # Badge, Modal, ProgressBar
├── hooks/            # useProjects, useActivities, useAuth
├── lib/              # supabase.ts, utils.ts
├── pages/            # Dashboard, Projects, ProjectDetail, Login
└── types/            # Tipos TypeScript
supabase/
└── migrations/       # Schema SQL
```
