# mssistemas

Microservicio de Catálogo y Configuración Centralizada

## Propósito

**mssistemas** es el registro centralizado y sistema de gestión de configuraciones para todo el ecosistema de microservicios. Actúa como fuente única de verdad para:

- 📋 Catálogo de microservicios (Service Registry)
- ⚙️ Configuraciones centralizadas por entorno
- 🔐 Gestión segura de secrets
- 🚩 Feature flags y control de releases
- 💓 Health monitoring de todos los servicios

## Funcionalidades

| Módulo | Descripción |
|--------|-------------|
| **Service Registry** | Registro de todos los microservicios con metadatos, URLs, versiones |
| **Configuration Mgmt** | Configuraciones por servicio y entorno (dev, test, staging, prod) |
| **Secrets Vault** | Almacenamiento encriptado de credenciales y API keys |
| **Feature Flags** | Toggle de features, rollout gradual, A/B testing |
| **Health Dashboard** | Monitoreo de estado de todos los servicios en tiempo real |

## Arquitectura

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ msseguridad │    │ msclientes  │    │msnotificac. │    │  otros...   │
│             │    │             │    │             │    │             │
│  ◄──────────┼────┼─────────────┼────┼───────────► │    │             │
│  JWT Auth   │    │             │    │             │    │             │
└─────────────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
                          │                   │                   │
                          └───────────────────┼───────────────────┘
                                              │
                                              ▼
                                   ┌─────────────────────┐
                                   │    mssistemas       │
                                   │  ┌───────────────┐  │
                                   │  │ Configs       │  │
                                   │  │ Secrets       │  │
                                   │  │ Registry      │  │
                                   │  │ Feature Flags │  │
                                   │  └───────────────┘  │
                                   └──────────┬──────────┘
                                              │
                                              ▼
                                   ┌─────────────────────┐
                                   │   PostgreSQL        │
                                   │   (Supabase)        │
                                   └─────────────────────┘
```

## Documentación

- [REQUERIMIENTOS.md](docs/REQUERIMIENTOS.md) - Requerimientos completos y especificaciones técnicas

## Estado

⏳ Fase de documentación completada  
⏳ Pendiente implementación

## Stack Tecnológico

- Node.js 20+ + TypeScript
- Express.js
- PostgreSQL (Supabase)
- TypeORM
- Redis (Upstash)
- JWT (msseguridad)
- AES-256 encryption

## Roadmap

| Fase | Duración | Qué incluye |
|------|----------|-------------|
| 1 | 2 semanas | Service Registry + Health monitoring |
| 2 | 2 semanas | Configuration Management + Client SDK |
| 3 | 2 semanas | Secrets Vault con encriptación |
| 4 | 1 semana | Feature Flags engine |
| 5 | 1 semana | Testing + Swagger + Dashboard UI |

## Integración con otros servicios

Los microservicios pueden usar el client SDK:

```typescript
import { SystemClient } from '@eugarte/mssistemas-client';

const client = new SystemClient({
  serviceName: 'msnotificaciones',
  apiKey: process.env.MSSISTEMAS_API_KEY
});

// Obtener configuración
const config = await client.getConfiguration('database.poolSize', 'prod');

// Evaluar feature flag
const isEnabled = await client.evaluateFlag('new-feature', userId);

// Auto-registro
await client.register({ version: '1.0.0', endpoints: {...} });
client.startHeartbeat(); // Automático cada 30s
```

## Seguridad

- Secrets encriptados con AES-256-GCM
- JWT authentication (vía msseguridad)
- RBAC: Admin, Developer, Service Account, Auditor
- Audit logs de todas las operaciones
- Rate limiting por IP y usuario

## Costos Estimados (Hostinger + SaaS)

| Componente | Costo/mes |
|------------|-----------|
| Hostinger Business | Incluido |
| Supabase PostgreSQL (500MB) | $0 |
| Upstash Redis (10k req/día) | $0 |
| **Total inicial** | **$0** |

---

**Este microservicio es la columna vertebral del ecosistema.**
Sin mssistemas, cada servicio necesitaría gestionar su propia configuración, dificultando mantenimiento y seguridad.
