# Monitor de Treinos

App web (PWA) para registrar treinos de musculação (exercícios, pesos e
repetições por série) e acompanhar a evolução de força e volume ao longo
das semanas.

Veja o design completo em
[docs/superpowers/specs/2026-08-26-monitor-treinos-design.md](docs/superpowers/specs/2026-08-26-monitor-treinos-design.md).

## Stack

* React + TypeScript, build com Vite.
* Tailwind CSS + shadcn/ui.
* Recharts, para os gráficos de evolução.
* Supabase (Postgres + Auth), como backend.
* `vite-plugin-pwa`, para instalação e uso offline.

## Rodando localmente

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
```
