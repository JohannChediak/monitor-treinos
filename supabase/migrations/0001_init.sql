-- Treinos nomeados (ex: "Treino A, Peito e Tríceps")
create table workouts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  nome       text not null,
  ordem      int not null default 0,
  criado_em  timestamptz not null default now()
);

-- Exercícios que compõem o "molde" de um treino
create table workout_exercises (
  id          uuid primary key default gen_random_uuid(),
  workout_id  uuid not null references workouts(id) on delete cascade,
  nome        text not null,
  ordem       int not null default 0
);

-- Uma execução real de um treino, em uma data
create table sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  workout_id uuid not null references workouts(id),
  data       date not null default current_date,
  criado_em  timestamptz not null default now()
);

-- Cada série registrada dentro de uma sessão
create table session_sets (
  id                   uuid primary key default gen_random_uuid(),
  session_id           uuid not null references sessions(id) on delete cascade,
  workout_exercise_id  uuid not null references workout_exercises(id),
  numero_serie         int not null,
  peso                 numeric not null,
  repeticoes           int not null
);

alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table sessions enable row level security;
alter table session_sets enable row level security;

create policy "workouts: dono acessa" on workouts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "workout_exercises: dono acessa" on workout_exercises
  for all using (
    auth.uid() = (select user_id from workouts where workouts.id = workout_exercises.workout_id)
  ) with check (
    auth.uid() = (select user_id from workouts where workouts.id = workout_exercises.workout_id)
  );

create policy "sessions: dono acessa" on sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "session_sets: dono acessa" on session_sets
  for all using (
    auth.uid() = (select user_id from sessions where sessions.id = session_sets.session_id)
  ) with check (
    auth.uid() = (select user_id from sessions where sessions.id = session_sets.session_id)
  );
