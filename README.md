# Task Management Platform

Una plataforma profesional de gestión de tareas y proyectos construida con stack moderno PERN (PostgreSQL, Express, React, Node.js).

## 🚀 Características

- ✅ Autenticación y autorización con JWT
- 📊 Dashboard interactivo con métricas en tiempo real
- 🎯 Gestión de proyectos y tareas con drag & drop
- 👥 Colaboración en equipo
- 🔔 Sistema de notificaciones
- 📱 Diseño responsive
- 🔒 Seguridad con bcrypt y validación de datos
- 🧪 Cobertura de tests completa
- 🐳 Containerización con Docker
- 🚦 CI/CD con GitHub Actions

## 🛠️ Stack Tecnológico

### Frontend
- React 18 con TypeScript
- Vite como build tool
- TailwindCSS para estilos
- React Query para gestión de estado del servidor
- React Router v6 para navegación
- Axios para peticiones HTTP
- React Hook Form + Zod para validación
- Recharts para visualizaciones

### Backend
- Node.js con Express y TypeScript
- Prisma ORM con PostgreSQL
- JWT para autenticación
- Bcrypt para encriptación
- Express Validator para validación
- Jest para testing
- Winston para logging

### DevOps
- Docker & Docker Compose
- GitHub Actions para CI/CD
- ESLint & Prettier
- Husky para Git hooks

## 📋 Prerrequisitos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- Docker y Docker Compose (opcional)
- npm o yarn

## 🚀 Instalación y Configuración

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/task-management-platform.git
cd task-management-platform

# Iniciar todos los servicios
docker-compose up -d

# Las migraciones se ejecutan automáticamente
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
```

### Opción 2: Instalación Manual

#### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npx prisma migrate dev

# Generar Prisma Client
npx prisma generate

# Iniciar en desarrollo
npm run dev
```

#### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en desarrollo
npm run dev
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage
```

## 📁 Estructura del Proyecto

```
task-management-platform/
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios API
│   │   ├── utils/          # Utilidades
│   │   ├── types/          # Tipos TypeScript
│   │   └── styles/         # Estilos globales
│   ├── tests/              # Tests
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/    # Controladores
│   │   ├── services/       # Lógica de negocio
│   │   ├── routes/         # Rutas API
│   │   ├── middlewares/    # Middlewares
│   │   ├── utils/          # Utilidades
│   │   ├── types/          # Tipos TypeScript
│   │   └── config/         # Configuraciones
│   ├── prisma/             # Schema y migraciones
│   ├── tests/              # Tests
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## 🔑 Variables de Entorno

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Obtener proyecto
- `PUT /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Tareas
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `GET /api/tasks/:id` - Obtener tarea
- `PUT /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea
- `PATCH /api/tasks/:id/status` - Cambiar estado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Convenciones de Código

- Seguimos el style guide de Airbnb
- Usamos Conventional Commits
- El código debe pasar ESLint y Prettier
- Cobertura de tests mínima: 80%

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- Tu Nombre - [@tu-usuario](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Comunidad de React
- Comunidad de Node.js
- Todos los contribuidores