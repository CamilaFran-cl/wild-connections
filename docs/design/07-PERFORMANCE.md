# 07 · Rendimiento — mentoras-vip

**Fase:** Performance · **Agente:** PerformanceAgent · **Solo si el feature ya es correcto.**

Escala esperada: 5.000 usuarios activos, 1.500 suscriptoras VIP recurrentes

## Bottlenecks (por impacto potencial)
| Capa (BD/servidor/cliente) | Problema | Impacto | Mejora estimada |
|---|---|---|---|
| | | | |

## Foco
- BD: N+1, full scans sin índice, joins costosos
- Servidor/Edge: funciones cacheables, llamadas externas síncronas
- Cliente: re-renders innecesarios, bundle size, datos no usados

> No optimizar lo que aún no tiene usuarios.
