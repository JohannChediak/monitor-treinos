# Monitor de Treinos: Design

## Objetivo

App web (PWA) para registrar treinos de musculação (exercícios, pesos e
repetições por série) e visualizar a evolução de força e volume ao longo
das semanas.

## Stack

* **Frontend**: React + TypeScript, build com Vite.
* **UI**: Tailwind CSS + shadcn/ui.
* **Gráficos**: Recharts.
* **Backend**: Supabase (Postgres + Auth). Sem servidor próprio, o
  frontend fala direto com o Supabase via `@supabase/supabase-js`.
* **Segurança**: Row Level Security (RLS) no Postgres, garantindo que cada
  usuário só acessa seus próprios dados.
* **PWA**: `vite-plugin-pwa` para manifest, ícone e instalação (no Android
  a instalação é automática; no iOS, é "Adicionar à Tela de Início" via
  Safari).
* **Hospedagem**: Vercel (ou Netlify), plano gratuito.

## Modelo de dados (Postgres / Supabase)

```sql
-- Treinos nomeados (ex: "Treino A, Peito e Tríceps")
workouts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id),
  nome        text not null,
  ordem       int not null default 0,
  criado_em   timestamptz not null default now()
)

-- Exercícios que compõem o "molde" de um treino
workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references workouts(id) on delete cascade,
  nome        text not null,
  ordem       int not null default 0
)

-- Uma execução real de um treino, em uma data
sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id),
  workout_id  uuid not null references workouts(id),
  data        date not null default current_date,
  criado_em   timestamptz not null default now()
)

-- Cada série registrada dentro de uma sessão
session_sets (
  id                    uuid primary key default gen_random_uuid(),
  session_id            uuid not null references sessions(id) on delete cascade,
  workout_exercise_id   uuid not null references workout_exercises(id),
  numero_serie          int not null,
  peso                  numeric not null,
  repeticoes            int not null
)
```

RLS: todas as tabelas filtram por `user_id = auth.uid()` (em
`session_sets`, via join com `sessions`).

## Telas

1. **Login / Cadastro**: email e senha via Supabase Auth.
2. **Meus Treinos**: lista de treinos nomeados; criar treino; adicionar,
   editar ou remover exercícios de um treino.
3. **Registrar Sessão**: escolhe um treino existente; para cada exercício
   do treino, adiciona séries (peso e repetições); salva a sessão com a
   data.
4. **Histórico**: lista de sessões passadas por data, com detalhe das
   séries de cada uma.
5. **Evolução (gráfico)**: escolhe um exercício; gráfico de linha por
   semana com duas métricas alternáveis.
   * **Carga máxima**: maior peso levantado naquele exercício na semana.
   * **Volume**: soma de `peso × repetições` de todas as séries daquele
     exercício na semana.

## Cálculo de evolução

Agrupamento por semana (ISO week, semana começando na segunda-feira) das
`session_sets` de um exercício específico, via `sessions.data`.

* `carga_maxima_semana = max(peso)` entre as séries da semana.
* `volume_semana = sum(peso * repeticoes)` entre as séries da semana.

Essa lógica de agregação é isolada em uma função pura (ex:
`agregarPorSemana(sets: SessionSet[]): SemanaResumo[]`) para ser testável
sem depender de banco de dados ou UI.

## Testes

* Testes automatizados (Vitest) para a função de agregação por semana
  (carga máxima e volume), cobrindo casos como semanas sem treino, mais
  de uma sessão na mesma semana, e séries com pesos e reps variados.
* Testes manuais no navegador para os fluxos de UI (criar treino,
  registrar sessão, ver histórico, ver gráfico).

## Fora de escopo (por ora)

* App nativo (iOS/Android via loja): PWA cobre a necessidade inicial.
* Notificações push.
* Compartilhamento social ou múltiplos usuários vendo o treino um do
  outro.
* Edição de sessões passadas (só criar novas, por enquanto).
