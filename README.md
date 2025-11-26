# Arroyave Gift Cards - Next.js

Sistema completo de gestión de Gift Cards empresariales migrado a Next.js 15 con un panel de administración premium.

## 🚀 Características

- **API REST completa** - Todos los endpoints migrados de Flask a Next.js API Routes
- **Panel de Administración** - Dashboard moderno con diseño glassmorphism
- **TypeScript** - Type safety en todo el proyecto
- **Diseño Premium** - UI oscuro con gradientes animados y efectos glassmorphism
- **Responsive** - Optimizado para todos los dispositivos

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build

# Ejecutar en producción
npm start
```

El servidor correrá en `http://localhost:3000`

## 🌐 Despliegue a Vercel

```bash
# Deploy directo
vercel --prod
```

O conecta el repositorio de GitHub para deployments automáticos.

## 📱 Endpoints API

### GET `/api/health`
Verifica el estado de la API

```bash
curl http://localhost:3000/api/health
```

### POST `/api/giftcards/_search`
Busca gift cards por email de usuario

```bash
curl -X POST http://localhost:3000/api/giftcards/_search \
  -H "Content-Type: application/json" \
  -d '{"client":{"email":"test@example.com"}}'
```

### GET `/api/giftcards/:id`
Obtiene una gift card específica por ID (formato: `empresa_indice`)

```bash
curl http://localhost:3000/api/giftcards/arroyave_0
```

### GET `/api/giftcards`
Obtiene todas las gift cards

```bash
curl http://localhost:3000/api/giftcards
```

### POST `/api/giftcards/redeem/:code`
Redime una gift card

```bash
curl -X POST http://localhost:3000/api/giftcards/redeem/CODIGO123 \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000}'
```

### GET `/api/admin/stats`
Obtiene estadísticas del dashboard

```bash
curl http://localhost:3000/api/admin/stats
```

## 🎨 Panel de Administración

Accede al panel en `http://localhost:3000/admin`

### Características del Admin:
- **Dashboard** - Estadísticas generales (total empresas, balance, usuarios)
- **Gestión de Empresas** - Ver todas las empresas, miembros y balances
- **Búsqueda de Gift Cards** - Buscar por email de usuario
- **Diseño Premium** - Glassmorphism, animaciones suaves, gradientes

## 📂 Estructura del Proyecto

```
arroyave-giftcards-nextjs/
├── app/
│   ├── api/                      # API Routes (Next.js)
│   │   ├── health/route.ts       # Health check
│   │   ├── giftcards/
│   │   │   ├── route.ts          # GET all, POST search
│   │   │   ├── [id]/route.ts     # GET by ID
│   │   │   ├── _search/route.ts  # POST search (VTEX)
│   │   │   └── redeem/[code]/route.ts
│   │   ├── admin/
│   │   │   └── stats/route.ts    # Admin stats
│   │   └── route.ts              # API home
│   ├── admin/                    # Admin panel
│   │   ├── page.tsx              # Dashboard
│   │   ├── companies/page.tsx    # Companies management
│   │   └── giftcards/page.tsx    # Gift cards search
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── lib/
│   ├── db.ts                     # JSON database utilities
│   └── utils.ts                  # Gift card utilities
├── data/
│   ├── giftCards.json            # Gift cards database
│   └── creditDB.json             # Companies database
├── vercel.json                   # Vercel config
├── next.config.ts                # Next.js config
├── tailwind.config.ts            # Tailwind config
└── package.json
```

## 🔧 Tecnologías

- **Next.js 16** - Framework React con App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first CSS
- **Vercel** - Plataforma de deployment

## 🎯 Migración desde Flask

Este proyecto es una migración completa del API Flask original. Todos los endpoints mantienen compatibilidad con VTEX y el comportamiento original.

### Ventajas de la migración:
- ✅ Serverless functions optimizadas
- ✅ Panel de administración incluido
- ✅ Type safety con TypeScript
- ✅ Mejor performance y escalabilidad
- ✅ Diseño moderno y responsive

## 📊 Bases de Datos

El sistema utiliza archivos JSON para almacenamiento:

- `data/creditDB.json` - Empresas y sus miembros
- `data/giftCards.json` - Gift cards individuales

## 🔐 Seguridad

- CORS configurado para endpoints API
- Validación de datos en todos los endpoints
- Headers VTEX para autenticación

## 📝 Notas

- Los endpoints mantienen compatibilidad 100% con la API Flask original
- El panel admin es una nueva característica no presente en Flask
- Diseño optimizado para dark mode
- Animaciones y transiciones suaves en toda la UI

---

**Version:** 2.0.0  
**Framework:** Next.js 16  
**Migrado desde:** Flask API v1.0.0
