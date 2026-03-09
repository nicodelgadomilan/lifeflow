# 🏗️ LifeHub - Lifestyle App

## 🎯 WHY: Propósito del Proyecto
LifeHub es una plataforma SaaS "personal-and-lifestyle" que centraliza finanzas, organización, deportes, salud, vehículos, documentos y metas en un solo lugar. Es un sistema multi-cuenta con un panel de administración master. 
Principios clave de diseño: Model-first (con dashboard rico en desktop), offline-ready donde sea posible (caché), sin fricción (3 clics máximo para registrar datos), y fuertemente visual (gráficos orientados a un vistazo rápido).

## 🛠 WHAT: Tecnologías y Arquitectura
- **Frontend / Framework:** Next.js 14 (App Router)
- **Estilos y Componentes:** Tailwind CSS, shadcn/ui, Lucide React
- **Gráficos:** Recharts
- **Backend (BaaS):** Supabase (Authentication mediante JWT, PostgreSQL Base de datos con Row Level Security, y Storage)
- **Deployment & CI/CD:** Vercel / GitHub

### Estructura Principal del Proyecto
- `/app/(auth)`: Rutas públicas (login/registro).
- `/app/(app)`: Rutas protegidas divididas por módulos (`/dashboard`, `/finanzas`, `/organizacion`, `/deportes`, `/salud`, `/vehiculo`, `/documentos`, `/metas`).
- `/app/admin`: Panel master (solo rol admin).
- `/components`: UI (shadcn), layouts (sidebar/header), e implementaciones específicas de dominio.
- `/lib/supabase`: Clientes de autenticación/DB para servidor (`server.ts`), cliente (`client.ts`), y el `middleware.ts` para porteger rutas.
- `/supabase/migrations`: Archivos SQL con el esquema de la base de datos de cada módulo.

## ⚙️ HOW: Flujo de Trabajo y Convenciones

1. **Base de Datos y Seguridad (RLS):** 
   - TODA tabla creada debe tener un campo `id UUID DEFAULT gen_random_uuid()` como primary key y un `user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE`.
   - **Row Level Security (RLS)** debe estar siempre habilitado para asegurar que cada usuario ve única y exclusivamente sus datos.
   
2. **Componentes y UI:** 
   - No construyas componentes complejos de UI desde cero si `shadcn/ui` provee uno (ej. modales, selects, popovers, tarjetas). 
   - Prioriza interfaces móviles que sean completamente expandibles a desktop de manera amigable.

3. **Cronómetros y Tiempo Real:**
   - Hay implementaciones complejas de temporizadores (Organización y Deportes Tabata). Debes usar hooks de control preciso (`useInterval`, `useReducer`, `Web Audio API`) para no saturar el framework React.

4. **Variables de Entorno:**
   - La aplicación usa variables standard de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Jamás expongas en cliente `SUPABASE_SERVICE_ROLE_KEY`.

> *Nota explicativa para los módulos:* La app está extremadamente segmentada por módulos de vida. Siempre verifica en qué módulo estás trabajando (finanzas, organización, deportes, etc) para conectar y consultar únicamente a las tablas correctas definidas en la planificación.
