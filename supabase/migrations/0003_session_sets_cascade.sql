-- Mesmo problema da migração anterior: excluir um treino cascade-exclui
-- seus workout_exercises, mas session_sets.workout_exercise_id não tinha
-- "on delete cascade", travando a exclusão.

alter table session_sets
  drop constraint session_sets_workout_exercise_id_fkey,
  add constraint session_sets_workout_exercise_id_fkey
    foreign key (workout_exercise_id) references workout_exercises(id) on delete cascade;
