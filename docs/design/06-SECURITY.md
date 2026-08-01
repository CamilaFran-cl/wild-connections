# 06 · Seguridad — mentoras-vip

**Fase:** Security · **Agente:** SecurityAgent · **No negociable antes de deploy.**

Roles: public_user, VIP_subscriber, mentor_user, super_admin
Datos sensibles: Datos de contacto directo (WhatsApp/Email VIP), registros de facturación de suscripciones, tokenización de pasarelas de pago

## Vulnerabilidades (por severidad)
| Severidad (crítica/alta/media/baja) | Vulnerabilidad | Vector de ataque | Estado |
|---|---|---|---|
| | | | |

## Checklist de señales de alerta
- [ ] Cada tabla sensible tiene políticas RLS activas
- [ ] No hay `SELECT *` sin filtro de usuario
- [ ] No hay endpoints sin verificación de sesión
- [ ] Service key no se usa en el cliente
- [ ] `.env` está en `.gitignore`, sin keys hardcodeadas
- [ ] No hay escalación de privilegios posible
- [ ] Nada sensible llega al frontend que no deba
