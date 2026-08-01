# mentoras-vip

Las mentoras y emprendedoras carecen de una red de conexión inteligente para encontrar pares afines por país y etapa de escalamiento de sus proyectos.

**MVP:** Buscador público de mentoras, formulario de perfilado por etapas/intereses y sector VIP con algoritmo de match de pares y pagos en CLP/USD.

## Stack
Next.js 14 (App Router) + Supabase (PostgreSQL/Auth/RLS) + TypeScript + Tailwind CSS + Mercado Pago SDK + Stripe SDK + Vercel

## Estado
- [ ] Diseño aprobado (CTOAgent + DataArchitectAgent)
- [ ] BD + RLS
- [ ] Backend
- [ ] Frontend
- [ ] QA
- [ ] Security
- [ ] Deploy

## Cómo empezar
1. `cp .env.example .env` y completa las variables de Supabase. **Nunca** commitees `.env`.
2. Instala dependencias y levanta el dev server.
3. Ejecuta las migraciones en Supabase (ver `docs/design/02-DATA-MODEL.md`).

## Documentación de diseño
Todo el diseño vive en `docs/design/`. Empieza por `CLAUDE.md`.
