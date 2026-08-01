# 02 · Modelo de datos — mentoras-vip

**Fase:** Datos · **Agente:** DataArchitectAgent · **Regla:** sin SQL ejecutable todavía.

## Entidades
users, profiles, project_stages, mentor_services, subscriptions, matches

## Roles de usuario
public_user, VIP_subscriber, mentor_user, super_admin

## Volumen esperado
- Hoy: ~500 usuarios activos mensuales, 150 suscripciones VIP
- 12 meses: 5.000 usuarios activos, 1.500 suscriptoras VIP recurrentes

## Tablas
_(nombre, campos, tipos, constraints — snake_case)_

## Relaciones
_(FK con ON DELETE, cardinalidades, patrones de join)_

## Índices (solo los necesarios, con justificación)
- 

## Políticas RLS por tabla y rol
| Tabla | Rol | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|---|
| | | | | | |

## Orden de migraciones
1. 
