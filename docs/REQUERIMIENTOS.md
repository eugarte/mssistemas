# Microservicio de Sistemas - Requerimientos

## Visión General

**mssistemas** es el microservicio de catálogo y configuración centralizada para todo el ecosistema de microservicios. Actúa como fuente única de verdad para metadatos, configuraciones, variables de entorno, feature flags y secrets compartidos.

**Propósito:** Centralizar el control, monitoreo y gestión de configuraciones de todos los microservicios (msseguridad, msclientes, msnotificaciones, etc.).

---

## Funcionalidades Core

### 1. Service Registry (Catálogo de Microservicios)

Registro centralizado de todos los microservicios del ecosistema con metadatos completos.

**Datos de cada servicio:**
- ID único y nombre del servicio
- Versión actual y changelog
- URLs (desarrollo, staging, producción)
- Estado del servicio (active, deprecated, maintenance)
- Responsable/equipo dueño
- Tecnología stack (Node.js, Python, etc.)
- Repositorio GitHub
- Documentación links (Swagger, README)

**Endpoints de registro:**
- Self-registration: Cada microservicio se registra al iniciar
- Heartbeat: Actualización periódica de estado (cada 30s)
- Deregistration: Eliminación al detenerse

### 2. Configuration Management

Gestión centralizada de configuraciones por entorno.

**Jerarquía de configuraciones:**
```
Default (aplica a todos los servicios y entornos)
  ↓
Service-specific (aplica solo a un servicio en todos los entornos)
  ↓
Environment-specific (aplica a todos los servicios en un entorno)
  ↓
Service + Environment (aplica solo a un servicio en un entorno específico)
```

**Tipos de configuración:**
- **Application Settings:** Timeouts, límites de paginación, TTLs de cache
- **Integration URLs:** Endpoints de otros microservicios
- **Database Configs:** Connection pools, timeouts, retry policies
- **Third-party Services:** API keys no sensibles, endpoints externos
- **Business Rules:** Parámetros de negocio (sin código)

**Operaciones:**
- CRUD de configuraciones
- Versionado de cambios (audit trail)
- Rollback a versiones anteriores
- Bulk import/export (JSON/YAML)

### 3. Secrets Management (Seguro)

Gestión segura de credenciales y datos sensibles.

**Tipos de secrets:**
- Database passwords
- API keys (SendGrid, Twilio, Firebase)
- JWT secrets
- OAuth client secrets
- TLS certificates
- Encryption keys

**Seguridad:**
- Encriptación AES-256 en reposo
- Acceso solo via HTTPS
- RBAC: quién puede leer/escribir qué secrets
- Audit logging de cada acceso
- Rotación automática de secrets
- No logging de valores desencriptados

### 4. Feature Flags

Sistema de banderas de características para despliegues controlados.

**Funcionalidades:**
- Toggle features ON/OFF por servicio
- Targeting por porcentaje de usuarios (gradual rollout)
- Targeting por usuario específico (lista blanca)
- Targeting por grupo/rol
- Programación temporal (activar el lunes 9 AM)
- A/B testing support

**Estructura de flag:**
```json
{
  "key": "new-payment-gateway",
  "name": "Nueva Pasarela de Pagos",
  "description": "Integración con Stripe v2",
  "enabled": true,
  "strategy": "percentage",
  "percentage": 10,
  "targetUsers": ["user123"],
  "targetGroups": ["beta-testers"],
  "schedule": {
    "startDate": "2026-05-01T00:00:00Z",
    "endDate": null
  }
}
```

### 5. Environment Variables Centralizado

Variables de entorno gestionadas desde un solo lugar.

**Soporte para:**
- Desarrollo (dev)
- Testing/QA (test)
- Staging (staging)
- Producción (prod)

**Features:**
- Asignación de variables a múltiples servicios
- Herencia de valores (default → servicio → entorno)
- Validación de tipos (string, number, boolean, JSON)
- Validación de formato (URL, email, regex)
- Referencias entre variables (`${db_host}:${db_port}`)

### 6. Health & Status Dashboard

Monitoreo centralizado del estado de todos los servicios.

**Datos recolectados:**
- Status: UP, DOWN, DEGRADED, UNKNOWN
- Último heartbeat timestamp
- Response time del health check
- Versión del servicio reportada
- Métricas: CPU, memory (si disponible)
- Incidentes activos
- Dependencias funcionando/fallando

**Dashboard:**
- Vista global de todos los servicios
- Filtros por entorno, equipo, status
- Histórico de uptime
- Alertas configurables

### 7. API Gateway & Routing (Opcional)

Puede incluir funcionalidad de gateway para enrutamiento dinámico.

**Features:**
- Dynamic routing basado en el registry
- Load balancing simple (round-robin)
- Rate limiting global
- Request logging centralizado

---

## Modelo de Datos

### Entidades Principales

```sql
-- Microservicios registrados
services
- id (UUID PK)
- name (varchar, unique) -- ej: "msseguridad"
- display_name (varchar) -- ej: "Microservicio de Seguridad"
- description (text)
- version (varchar) -- semver ej: "1.2.3"
- status (enum: active, inactive, deprecated, maintenance)
- team_owner (varchar)
- repository_url (varchar)
- documentation_url (varchar)
- technology_stack (json) -- ["nodejs", "typescript", "express"]
- health_check_url (varchar)
- created_at, updated_at

-- URLs por entorno
service_endpoints
- id (UUID PK)
- service_id (UUID FK)
- environment (enum: dev, test, staging, prod)
- base_url (varchar) -- ej: "https://api-dev.ejemplo.com"
- health_check_path (varchar) -- ej: "/health"
- is_active (boolean)
- created_at, updated_at

-- Configuraciones
configurations
- id (UUID PK)
- service_id (UUID FK, nullable - si null aplica a todos)
- environment (varchar, nullable - si null aplica a todos)
- key (varchar)
- value (text) -- puede ser string, number, boolean, JSON
- type (enum: string, number, boolean, json, yaml)
- is_secret (boolean) -- si true, requiere permisos especiales
- is_encrypted (boolean)
- version (int) -- para versionado
- description (text)
- tags (json)
- created_by (varchar)
- created_at, updated_at, deleted_at (soft delete)

-- Historial de cambios de configuración
configuration_history
- id (UUID PK)
- configuration_id (UUID FK)
- action (enum: created, updated, deleted)
- old_value (text, encrypted)
- new_value (text, encrypted)
- changed_by (varchar)
- change_reason (text)
- created_at

-- Secrets (encriptados)
secrets
- id (UUID PK)
- service_id (UUID FK, nullable)
- environment (varchar, nullable)
- key (varchar)
- encrypted_value (text) -- AES-256
- encryption_version (varchar)
- is_rotating (boolean) -- en proceso de rotación
- last_rotated_at (timestamp)
- expires_at (timestamp, nullable)
- created_by (varchar)
- created_at, updated_at

-- Access logs de secrets (quién leyó qué)
secret_access_logs
- id (UUID PK)
- secret_id (UUID FK)
- service_id (UUID FK) -- servicio que accedió
- action (enum: read, write, rotate)
- accessed_by (varchar) -- user o service account
- ip_address (varchar)
- user_agent (text)
- created_at

-- Feature Flags
feature_flags
- id (UUID PK)
- key (varchar, unique) -- ej: "nuevo-checkout"
- name (varchar)
- description (text)
- enabled (boolean)
- strategy (enum: simple, percentage, user_target, group_target, schedule)
- percentage (int, 0-100) -- para strategy=percentage
- target_users (json) -- array de user IDs
- target_groups (json) -- array de group names
- schedule_start (timestamp, nullable)
- schedule_end (timestamp, nullable)
- created_by (varchar)
- created_at, updated_at

-- Feature Flag aplicaciones por servicio
feature_flag_services
- id (UUID PK)
- feature_flag_id (UUID FK)
- service_id (UUID FK)
- is_enabled (boolean) -- puede sobrescribir el global
- override_strategy (json, nullable)
- created_at, updated_at

-- Heartbeats de servicios
service_heartbeats
- id (UUID PK)
- service_id (UUID FK)
- environment (varchar)
- instance_id (varchar) -- identificador único de instancia
- status (enum: up, down, degraded)
- response_time_ms (int)
- version (varchar)
- metadata (json) -- CPU, memory, custom data
- reported_at (timestamp)

-- Dependencias entre servicios
service_dependencies
- id (UUID PK)
- service_id (UUID FK) -- servicio que depende
- depends_on_service_id (UUID FK) -- servicio del que depende
- dependency_type (enum: required, optional)
- is_healthy (boolean) -- último estado conocido
- checked_at (timestamp)
- created_at

-- Audit logs general
audit_logs
- id (UUID PK)
- entity_type (enum: service, configuration, secret, feature_flag)
- entity_id (UUID)
- action (varchar)
- actor (varchar) -- user o service
- actor_type (enum: user, service)
- ip_address (varchar)
- details (json)
- created_at
```

---

## API Endpoints

### Service Registry

```
POST   /api/v1/services                    # Registrar nuevo servicio
GET    /api/v1/services                    # Listar todos los servicios
GET    /api/v1/services/:id                 # Obtener servicio específico
PUT    /api/v1/services/:id                 # Actualizar servicio
DELETE /api/v1/services/:id                 # Eliminar servicio (soft)
POST   /api/v1/services/:id/heartbeat       # Enviar heartbeat
GET    /api/v1/services/:id/health         # Obtener health status
GET    /api/v1/services/:id/dependencies    # Obtener dependencias
POST   /api/v1/services/:id/dependencies    # Registrar dependencia
```

### Configuration

```
GET    /api/v1/configurations               # Listar configuraciones (con filtros)
GET    /api/v1/configurations/:id          # Obtener configuración
POST   /api/v1/configurations               # Crear configuración
PUT    /api/v1/configurations/:id           # Actualizar configuración
DELETE /api/v1/configurations/:id           # Eliminar configuración
POST   /api/v1/configurations/:id/rollback   # Rollback a versión anterior
GET    /api/v1/configurations/history        # Ver historial de cambios
POST   /api/v1/configurations/bulk-update    # Actualización masiva
POST   /api/v1/configurations/export         # Exportar a JSON/YAML
POST   /api/v1/configurations/import         # Importar desde JSON/YAML
```

### Secrets

```
GET    /api/v1/secrets                      # Listar secrets (solo metadata, no valores)
GET    /api/v1/secrets/:id                 # Obtener valor desencriptado (requiere permisos)
POST   /api/v1/secrets                     # Crear secret
PUT    /api/v1/secrets/:id                 # Actualizar secret
DELETE /api/v1/secrets/:id                 # Eliminar secret
POST   /api/v1/secrets/:id/rotate          # Rotar secret
GET    /api/v1/secrets/:id/access-logs     # Ver quién accedió al secret
```

### Feature Flags

```
GET    /api/v1/feature-flags                # Listar feature flags
GET    /api/v1/feature-flags/:id           # Obtener flag
POST   /api/v1/feature-flags               # Crear flag
PUT    /api/v1/feature-flags/:id          # Actualizar flag
DELETE /api/v1/feature-flags/:id          # Eliminar flag
POST   /api/v1/feature-flags/:id/toggle    # Toggle ON/OFF
POST   /api/v1/feature-flags/:id/services  # Asociar a servicios
POST   /api/v1/feature-flags/evaluate       # Evaluar si flag está activo para usuario
```

### Service Discovery (para otros microservicios)

```
GET    /api/v1/discovery/services           # Descubrir todos los servicios activos
GET    /api/v1/discovery/services/:name      # Obtener URL de servicio específico
GET    /api/v1/discovery/services/:name/config # Obtener configuración de servicio
GET    /api/v1/discovery/health             # Health de todo el ecosistema
```

### Dashboard & Monitoring

```
GET    /api/v1/dashboard/status            # Status global de servicios
GET    /api/v1/dashboard/metrics            # Métricas agregadas
GET    /api/v1/dashboard/activity           # Actividad reciente
GET    /api/v1/audit-logs                  # Logs de auditoría
```

---

## Arquitectura

### Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                         mssistemas                              │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                    API Layer                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │   │
│  │  │ Services │ │ Config   │ │ Secrets  │ │ Feature  │     │   │
│  │  │ Registry │ │ Mgmt     │ │ Mgmt     │ │ Flags    │     │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘     │   │
│  └───────┼─────────────┼─────────────┼─────────────┼────────┘   │
│          │             │             │             │              │
│  ┌───────┼─────────────┼─────────────┼─────────────┼────────┐     │
│  │       ▼             ▼             ▼             ▼        │     │
│  │   ┌──────────────────────────────────────────────────┐  │     │
│  │   │           Business Logic Layer                   │  │     │
│  │   │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │     │
│  │   │  │ Service │ │ Config  │ │ Secret  │            │  │     │
│  │   │  │Service  │ │Service  │ │Service  │            │  │     │
│  │   │  └─────────┘ └─────────┘ └─────────┘            │  │     │
│  │   └──────────────────────────────────────────────────┘  │     │
│  │                       │                                 │     │
│  │   ┌──────────────────────────────────────────────────┐  │     │
│  │   │           Data Access Layer                      │  │     │
│  │   │  ┌─────────┐ ┌─────────┐ ┌─────────┐            │  │     │
│  │   │  │ Service │ │ Config  │ │ Audit   │            │  │     │
│  │   │  │ Repo    │ │ Repo    │ │ Repo    │            │  │     │
│  │   │  └─────────┘ └─────────┘ └─────────┘            │  │     │
│  │   └──────────────────────────────────────────────────┘  │     │
│  └───────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PostgreSQL (Supabase)                        │
│  - Services, configs, secrets, flags, heartbeats, audit logs    │
└─────────────────────────────────────────────────────────────────┘
```

### Clean Architecture Layers

```
src/
├── domain/
│   ├── entities/
│   │   ├── Service.ts
│   │   ├── Configuration.ts
│   │   ├── Secret.ts
│   │   ├── FeatureFlag.ts
│   │   └── ServiceHeartbeat.ts
│   ├── repositories/
│   │   ├── IServiceRepository.ts
│   │   ├── IConfigurationRepository.ts
│   │   └── ISecretRepository.ts
│   └── services/
│       ├── ServiceRegistryService.ts
│       ├── ConfigurationService.ts
│       └── EncryptionService.ts
│
├── application/
│   ├── use-cases/
│   │   ├── RegisterServiceUseCase.ts
│   │   ├── GetConfigurationUseCase.ts
│   │   ├── UpdateSecretUseCase.ts
│   │   ├── EvaluateFeatureFlagUseCase.ts
│   │   └── HealthCheckUseCase.ts
│   ├── dtos/
│   │   ├── ServiceDto.ts
│   │   ├── ConfigurationDto.ts
│   │   └── SecretDto.ts
│   └── mappers/
│
├── infrastructure/
│   ├── persistence/
│   │   ├── config/
│   │   ├── entities/
│   │   └── repositories/
│   ├── encryption/
│   │   └── AesEncryptionService.ts
│   ├── auth/
│   │   └── JwtAuthService.ts
│   └── logging/
│       └── AuditLogger.ts
│
└── interfaces/
    ├── http/
    │   ├── controllers/
    │   │   ├── ServiceController.ts
    │   │   ├── ConfigurationController.ts
    │   │   ├── SecretController.ts
    │   │   └── FeatureFlagController.ts
    │   ├── middleware/
    │   │   ├── AuthMiddleware.ts
    │   │   ├── AuditMiddleware.ts
    │   │   └── RateLimitMiddleware.ts
    │   └── routes/
    └── websocket/
        └── DashboardWebSocket.ts
```

---

## Tecnología Stack

| Capa | Tecnología |
|------|------------|
| **Runtime** | Node.js 20+ |
| **Framework** | Express.js |
| **Lenguaje** | TypeScript |
| **Database** | PostgreSQL 15+ (Supabase) |
| **ORM** | TypeORM |
| **Cache** | Redis (Upstash) |
| **Auth** | JWT (integración con msseguridad) |
| **Encryption** | crypto (AES-256-GCM) |
| **Testing** | Jest |
| **Documentation** | Swagger/OpenAPI |

---

## Seguridad

### RBAC (Role-Based Access Control)

| Rol | Permisos |
|-----|----------|
| **Admin** | Todo (CRUD servicios, configs, secrets) |
| **Developer** | Ver configs, crear configs propios, NO ver secrets |
| **Service Account** | Leer configs/secrets asignados, enviar heartbeats |
| **Auditor** | Solo lectura de todo, ver logs |
| **DevOps** | Gestionar feature flags, ver health dashboards |

### Medidas de Seguridad

1. **Encryption:**
   - Secrets encriptados con AES-256-GCM
   - Master key en environment variable (nunca en código)
   - Rotación de keys periódica

2. **Access Control:**
   - JWT validation (msseguridad)
   - Permisos granulares por endpoint
   - Rate limiting por IP y por usuario

3. **Audit:**
   - Todo cambio logueado (quién, qué, cuándo)
   - Acceso a secrets auditado separadamente
   - Retención de logs: 1 año

4. **Network:**
   - HTTPS obligatorio
   - CORS configurado explícitamente
   - IP whitelisting para acceso a secrets

---

## Integraciones

### Con msseguridad
- JWT validation para autenticación
- Permisos basados en roles de msseguridad
- User sync para audit logs

### Con otros microservicios
- Client SDK (npm package) para:
  - Auto-registro al iniciar
  - Obtener configuraciones
  - Evaluar feature flags
  - Enviar heartbeats

### Con CI/CD
- API para actualizar versiones automáticamente
- Webhooks para notificar cambios de config

---

## Monitoreo

### Métricas
- Número de servicios registrados por estado
- Latencia de health checks
- Errores de desencriptación de secrets
- Uso de feature flags (cuántos usuarios afectados)

### Alertas
- Servicio no envía heartbeat por > 2 minutos
- Múltiples fallos de desencriptación
- Cambio de secret sin autorización

---

## Roadmap

### Fase 1: Core Registry (2 semanas)
- CRUD de servicios
- Heartbeat system
- Health dashboard
- Service discovery API

### Fase 2: Configuration (2 semanas)
- CRUD de configuraciones
- Versionado
- Import/export
- Client SDK

### Fase 3: Secrets (2 semanas)
- Encriptación
- Gestión segura
- Rotación
- Audit logs

### Fase 4: Feature Flags (1 semana)
- CRUD de flags
- Evaluation engine
- Targeting strategies

### Fase 5: Polish (1 semana)
- Testing >80%
- Swagger docs
- Dashboard UI
- Docker setup

---

## Consideraciones Hostinger

### Adaptaciones para Business Managed

| Recurso | Solución Hostinger |
|---------|-------------------|
| PostgreSQL | Supabase (free tier) |
| Redis | Upstash (free tier) |
| Storage | Supabase Storage (para exports) |
| Deploy | Git push → Hostinger auto-deploy |

### Variables de Entorno Críticas

```env
# Database
DATABASE_URL=postgresql://...

# Encryption
MASTER_KEY=32-byte-hex-encoded-key

# JWT (msseguridad)
JWT_SECRET=...
JWT_ISSUER=msseguridad

# Redis
REDIS_URL=rediss://...

# App
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

---

## Costos Estimados

| Componente | Proveedor | Costo/mes |
|------------|-----------|-----------|
| Hostinger Business | Hostinger | Incluido |
| PostgreSQL | Supabase (500MB) | $0 |
| Redis | Upstash (10k req/día) | $0 |
| **Total** | | **$0** |

---

## Ejemplo de Uso

### Registrar un servicio desde código

```typescript
import { SystemClient } from '@eugarte/mssistemas-client';

const client = new SystemClient({
  serviceName: 'msnotificaciones',
  apiKey: process.env.MSSISTEMAS_API_KEY,
  baseUrl: 'https://mssistemas.ejemplo.com'
});

// Auto-registro al iniciar
await client.register({
  version: '1.0.0',
  endpoints: {
    dev: 'http://localhost:3003',
    prod: 'https://msnotificaciones.ejemplo.com'
  },
  healthCheckPath: '/health'
});

// Obtener configuración
const dbConfig = await client.getConfiguration('database.poolSize', 'prod');

// Evaluar feature flag
const isEnabled = await client.evaluateFlag('new-sms-provider', userId);

// Heartbeat automático cada 30s
client.startHeartbeat();
```

---

## Conclusión

**mssistemas** es la columna vertebral operativa del ecosistema de microservicios, proporcionando:
- Centralización de configuraciones
- Gestión segura de secrets
- Control de feature releases
- Observabilidad del sistema completo

Sin este servicio, cada microservicio necesitaría gestionar su propia configuración, dificultando mantenimiento, seguridad y consistencia entre entornos.
