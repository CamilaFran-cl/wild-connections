# CLAUDE.md — mentoras-vip

> Manual operativo del proyecto para agentes de IA. Léelo antes de tocar nada.
> Regla #1 del framework: **no se programa sin diseño aprobado.**

## Qué es esto
- **Problema:** Las mentoras y emprendedoras carecen de una red de conexión inteligente para encontrar pares afines por país y etapa de escalamiento de sus proyectos.
- **MVP:** Buscador público de mentoras, formulario de perfilado por etapas/intereses y sector VIP con algoritmo de match de pares y pagos en CLP/USD.
- **Para:** Para cliente · **Entrega:** 60 días (8 semanas)
- **Usuario:** Emprendedoras, profesionales y mentoras en Chile e Hispanoamérica que buscan conectar con pares estratégicos y servicios complementarios. (nivel técnico: medio, frecuencia: semanal)
- **Acción principal:** buscar mentoras por especialidad y solicitar conexión VIP con pares afines
- **Plataforma:** ambas

## Stack
Next.js 14 (App Router) + Supabase (PostgreSQL/Auth/RLS) + TypeScript + Tailwind CSS + Mercado Pago SDK + Stripe SDK + Vercel

## Reglas del proyecto (no negociables)
- Imports de Supabase solo desde `@/lib/supabase-client.ts` (cliente) o `@/lib/supabase-server.ts` (servidor).
- En servidor usar `createServerSupabase()`; `createAdminSupabase()` solo cuando se necesitan permisos admin.
- Params de rutas dinámicas son **async** en Next.js 14+.
- No usar `window.location.href`; usar `router.push()` o `window.location.assign()`.
- Naming: **snake_case** en BD, **camelCase** en TS, **PascalCase** en componentes, hooks con prefijo `use`.
- Validar inputs **siempre** antes de consultar la BD. Errores **tipados**, nunca strings genéricos.
- RLS desde el inicio, nunca como afterthought. Nada de `SELECT *` sin filtro de usuario.
- Estados `loading / error / empty / success` presentes en **toda** operación async.
- `.env` **nunca** se commitea. Sin keys en el código ni expuestas al cliente.
- Colores del sistema: #1e3a8a / #2563eb.

## Dónde vive cada cosa
- **Datos / SQL / RLS** → DataArchitectAgent. (`docs/design/02-DATA-MODEL.md`)
- **Lógica de negocio / APIs** → BackendAgent (server). (`docs/design/04-API-SPEC.md`)
- **Presentación / componentes** → FrontendAgent (sin lógica de negocio). (`docs/design/03-UX-FLOWS.md`)
- **Reglas del dominio** → Red social freemium de mentoría, networking B2B y marketplace de servicios profesionales de bienestar y desarrollo laboral (DomainBot).

## El equipo de agentes
Pensar → Datos → UX → Backend → Frontend → QA → Security → Performance.
Un prompt, un rol, un output. El output de un agente alimenta al siguiente.
Prompts en `docs/design/agents/`. Orquestación en `docs/design/agents/MASTER-PROMPT.md`.

## Reglas de oro
1. Nunca programar sin diseño aprobado.
2. Nunca mezclar roles en un prompt.
3. No saltarse QA y Security antes de deploy.
4. Pasar el output entre agentes (contexto acumulado).

## Deuda técnica
_(Anota aquí lo que dejas pendiente. Marca en código con `// TODO: revisar con CTOAgent`.)_
