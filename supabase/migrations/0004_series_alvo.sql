-- Número de séries planejadas para cada exercício de um treino (ex:
-- Agachamento = 5 séries). Usado para pré-preencher a tela de Registrar
-- Sessão com a quantidade certa de linhas em branco.
alter table workout_exercises
  add column series_alvo integer not null default 3;
