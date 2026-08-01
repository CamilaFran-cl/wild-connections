# 00 · Contexto y claridad — mentoras-vip

**Fase:** Pensar · **Agente:** CTOAgent · **Regla:** no programar todavía.

## El problema en una frase
Las mentoras y emprendedoras carecen de una red de conexión inteligente para encontrar pares afines por país y etapa de escalamiento de sus proyectos.

## Usuario
- Quién: Emprendedoras, profesionales y mentoras en Chile e Hispanoamérica que buscan conectar con pares estratégicos y servicios complementarios.
- Nivel técnico: medio
- Frecuencia: semanal
- Acción más frecuente: buscar mentoras por especialidad y solicitar conexión VIP con pares afines

## MVP (resultado mínimo con valor)
Buscador público de mentoras, formulario de perfilado por etapas/intereses y sector VIP con algoritmo de match de pares y pagos en CLP/USD.

## Decisiones que bloquean después
- ¿Cliente o personal? → Para cliente
- Stack → Next.js 14 (App Router) + Supabase (PostgreSQL/Auth/RLS) + TypeScript + Tailwind CSS + Mercado Pago SDK + Stripe SDK + Vercel
- Fecha de entrega real → 60 días (8 semanas)
- Plataforma → ambas

## 3 riesgos técnicos (lo que podría romperse primero)
Fuga de datos de contacto VIP por fallas en políticas de Row Level Security (RLS) en Supabase, Fallas en la sincronización de webhooks de cancelación/alta entre Mercado Pago / Stripe y Supabase, Lógica de recomendación lenta al crecer el número de perfiles y tags de servicios secundarios

## Salida del CTOAgent
_(Pega aquí el análisis del CTOAgent: arquitectura, riesgos priorizados, decisiones de hoy.)_
