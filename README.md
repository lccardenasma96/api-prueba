# API de Municipios y Turismo

API REST para gestionar municipios, lugares turísticos, eventos y funcionalidades de usuario como favoritos, lugares visitados y calendario de eventos.

## Base URL
```
http://localhost:3000/api/users
```

## Autenticación

La mayoría de endpoints requieren autenticación mediante JWT. Incluye el token en el header:
```bash
Authorization: Bearer <tu_token_jwt>
```

## Endpoints

### 🔐 Autenticación

#### Registro de Usuario
```bash
curl -X POST http://localhost:3000/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

#### Verificar Token
```bash
curl -X GET http://localhost:3000/api/users/verify-token \
  -H "Authorization: Bearer <tu_token_jwt>"
```

#### Obtener Perfil
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer <tu_token_jwt>"
```

### 🏛️ Municipios

#### Obtener Todos los Municipios
```bash
curl -X GET http://localhost:3000/api/v1/municipios
```

#### Obtener Municipio por ID
```bash
curl -X GET http://localhost:3000/api/v1/municipios/1
```

#### Obtener Lugares de un Municipio
```bash
curl -X GET http://localhost:3000/api/v1/municipios/1/places
```

#### Obtener Eventos de un Municipio
```bash
curl -X GET http://localhost:3000/api/v1/municipios/1/events
```

### 🏞️ Lugares

#### Obtener Todos los Lugares
```bash
curl -X GET http://localhost:3000/api/v1/places
```

#### Obtener Lugar por ID
```bash
curl -X GET http://localhost:3000/api/v1/places/1
```

#### Crear Nuevo Lugar
```bash
curl -X POST http://localhost:3000/api/v1/places \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plaza Central",
    "description": "Hermosa plaza en el centro de la ciudad",
    "location": "Centro de la ciudad",
    "image": "https://example.com/plaza.jpg",
    "municipio_id": 1
  }'
```

### 🎉 Eventos

#### Obtener Todos los Eventos
```bash
curl -X GET http://localhost:3000/api/v1/events
```

#### Obtener Evento por ID
```bash
curl -X GET http://localhost:3000/api/v1/events/1
```

### ⭐ Favoritos de Lugares

#### Agregar Lugar a Favoritos
```bash
curl -X POST http://localhost:3000/api/v1/favorite-places \
  -H "Authorization: Bearer <tu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": 1
  }'
```

#### Obtener Lugares Favoritos
```bash
curl -X GET http://localhost:3000/api/users/favorite-places \
  -H "Authorization: Bearer <tu_token_jwt>"
```

#### Eliminar Lugar de Favoritos
```bash
curl -X DELETE http://localhost:3000/api/users/favorite-places/1 \
  -H "Authorization: Bearer <tu_token_jwt>"
```

### ⭐ Favoritos de Eventos

#### Agregar Evento a Favoritos
```bash
curl -X POST http://localhost:3000/api/v1/favorite-events \
  -H "Authorization: Bearer <tu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1
  }'
```

#### Obtener Eventos Favoritos
```bash
curl -X GET http://localhost:3000/api/v1/favorite-events \
  -H "Authorization: Bearer <tu_token_jwt>"
```

#### Eliminar Evento de Favoritos
```bash
  curl -X DELETE http://localhost:3000/api/v1/favorite-events/1 \
    -H "Authorization: Bearer <tu_token_jwt>"
```

### 🗺️ Lugares Visitados

#### Marcar Lugar como Visitado
```bash
curl -X POST http://localhost:3000/api/users/visited \
  -H "Authorization: Bearer <tu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "place_id": 1
  }'
```

#### Obtener Lugares Visitados
```bash
curl -X GET http://localhost:3000/api/users/visited \
  -H "Authorization: Bearer <tu_token_jwt>"
```

#### Eliminar Lugar de Visitados
```bash
curl -X DELETE http://localhost:3000/api/users/visited/1 \
  -H "Authorization: Bearer <tu_token_jwt>"
```

### 📅 Calendario de Eventos

#### Agregar Evento al Calendario
```bash
curl -X POST http://localhost:3000/api/users/calendar \
  -H "Authorization: Bearer <tu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1
  }'
```

#### Obtener Eventos del Calendario
```bash
curl -X GET http://localhost:3000/api/users/calendar \
  -H "Authorization: Bearer <tu_token_jwt>"
```

#### Eliminar Evento del Calendario
```bash
curl -X DELETE http://localhost:3000/api/users/calendar/1 \
  -H "Authorization: Bearer <tu_token_jwt>"
```

## Estructura de Respuestas

### Respuesta de Autenticación
```json
{
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Respuesta de Lugar
```json
{
  "id": 1,
  "name": "Plaza Central",
  "description": "Hermosa plaza en el centro de la ciudad",
  "image": "https://example.com/plaza.jpg",
  "location": "Centro de la ciudad",
  "municipio_id": 1,
  "municipio_name": "Ciudad de México",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Respuesta de Evento
```json
{
  "id": 1,
  "name": "Festival de Primavera",
  "description": "Gran festival anual",
  "start_date": "2024-03-21",
  "end_date": "2024-03-23",
  "image": "https://example.com/festival.jpg",
  "location": "Parque Central",
  "municipio_id": 1,
  "municipio_name": "Ciudad de México",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Respuesta de Municipio
```json
{
  "id": 1,
  "name": "Ciudad de México",
  "slogan": "La ciudad de la esperanza",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Códigos de Estado HTTP

- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos de entrada inválidos
- `401` - Unauthorized: Token inválido o faltante
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto (ej: email ya registrado)
- `500` - Internal Server Error: Error interno del servidor

## Ejemplos de Uso Completo

### 1. Registro y Login
```bash
# 1. Registrar usuario
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "password": "password123"
  }'

# 2. Hacer login y obtener token
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@example.com",
    "password": "password123"
  }'
```

### 2. Explorar Municipios y Lugares
```bash
# 1. Obtener todos los municipios
curl -X GET http://localhost:3000/api/users/municipios

# 2. Obtener lugares de un municipio específico
curl -X GET http://localhost:3000/api/users/municipios/1/places

# 3. Obtener detalles de un lugar específico
curl -X GET http://localhost:3000/api/users/places/1
```

### 3. Gestionar Favoritos
```bash
# 1. Agregar lugar a favoritos
curl -X POST http://localhost:3000/api/users/favorite-places \
  -H "Authorization: Bearer <tu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"place_id": 1}'

# 2. Ver lugares favoritos
curl -X GET http://localhost:3000/api/users/favorite-places \
  -H "Authorization: Bearer <tu_token_jwt>"

# 3. Eliminar de favoritos
curl -X DELETE http://localhost:3000/api/users/favorite-places/1 \
  -H "Authorization: Bearer <tu_token_jwt>"
```

### 4. Marcar Lugares Visitados
```bash
# 1. Marcar lugar como visitado
curl -X POST http://localhost:3000/api/users/visited \
  -H "Authorization: Bearer <tu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"place_id": 1}'

# 2. Ver lugares visitados
curl -X GET http://localhost:3000/api/users/visited \
  -H "Authorization: Bearer <tu_token_jwt>"
```

### 5. Gestionar Calendario de Eventos
```bash
# 1. Agregar evento al calendario
curl -X POST http://localhost:3000/api/users/calendar \
  -H "Authorization: Bearer <tu_token_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"event_id": 1}'

# 2. Ver eventos del calendario
curl -X GET http://localhost:3000/api/users/calendar \
  -H "Authorization: Bearer <tu_token_jwt>"
```

## Notas Importantes

1. **Autenticación**: La mayoría de endpoints requieren un token JWT válido en el header `Authorization: Bearer <token>`

2. **Municipio ID**: Al crear lugares, es obligatorio especificar el `municipio_id`

3. **Fechas**: Los eventos tienen fechas de inicio (`start_date`) y opcionalmente de fin (`end_date`)

4. **Duplicados**: Los endpoints de favoritos, visitados y calendario evitan duplicados automáticamente

5. **Ordenamiento**: 
   - Lugares se ordenan por nombre (ASC)
   - Eventos se ordenan por fecha de inicio (ASC)
   - Lugares visitados se ordenan por fecha de visita (DESC)

## Instalación y Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
JWT_SECRET=tu_clave_secreta
DATABASE_URL=postgresql://usuario:password@localhost:5432/municipios_app
```

3. Ejecutar la aplicación:
```bash
npm start
```

## Base de Datos

Asegúrate de tener PostgreSQL instalado y ejecutar el script SQL proporcionado para crear las tablas necesarias antes de usar la API.
