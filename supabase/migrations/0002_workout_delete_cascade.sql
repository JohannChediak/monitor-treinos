-- Excluir um treino deve excluir também suas sessões e séries registradas
-- (sessions.workout_id não tinha "on delete cascade", diferente de
-- workout_exercises, causando erro de chave estrangeira ao excluir um
-- treino que já tinha sessões registradas).

alter table sessions
  drop constraint sessions_workout_id_fkey,
  add constraint sessions_workout_id_fkey
    foreign key (workout_id) references workouts(id) on delete cascade;
