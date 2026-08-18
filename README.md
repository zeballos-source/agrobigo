# AgroBigo — catálogo + CRM

Plataforma para Agro Bigo S.R.L. (Río Cuarto, Córdoba + Santa Rosa de Conlara,
San Luis): catálogo público de maquinaria e implementos agrícolas, panel
interno para cargar productos (con foto + dictado por voz desde el celular) y
CRM de oportunidades de venta.

## Cómo está armado

- **Next.js 14 (App Router)** + **Prisma** + **Postgres (Supabase)** — mismo
  stack que se usó para `inmoplatform` (el proyecto de real estate).
- Sin capa multi-tenant: es una app dedicada a AgroBigo. Las dos sucursales
  son un modelo (`Sucursal`) dentro de esta misma base, no proyectos
  separados.
- **Publicación Rápida** (`/panel/productos/nuevo`): el agente saca la foto
  desde el celular, dicta la publicación completa y la IA (Anthropic Haiku)
  completa categoría, marca, modelo, precio y descripción. El GPS del celular
  detecta sola la sucursal más cercana (calculando distancia contra las
  coordenadas cargadas en `/panel/sucursales`).
- **Oportunidades** (`/panel/oportunidades`): kanban arrastrable con las
  consultas que llegan desde el catálogo público.

## Levantarlo local

1. Node 18+.

2. Instalar dependencias:
   ```
   npm install
   ```

3. Copiar el env de ejemplo y completar — ver comentarios en cada variable:
   ```
   cp .env.example .env
   ```
   Necesitás como mínimo `DATABASE_URL` (Supabase Postgres) para levantar el
   server. `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` para que
   funcione la subida de fotos, y `ANTHROPIC_API_KEY` para el dictado
   completo por IA (el resto de Publicación Rápida funciona sin esa key).

4. Crear las tablas y cargar los datos de partida (2 sucursales, usuario
   admin, y el catálogo real de Agrochery / Impagro / Ascanelli):
   ```
   npm run db:push
   npm run db:seed
   ```
   El seed imprime en consola el email y contraseña del usuario admin
   (`admin@agrobigo.com.ar` / lo que hayas puesto en `ADMIN_SEED_PASSWORD`, o
   `CambiarPassword123!` por defecto — cambiala después de entrar la primera
   vez).

5. Levantar el server:
   ```
   npm run dev
   ```
   - `http://localhost:3000` → catálogo público.
   - `http://localhost:3000/panel/login` → panel interno.

## Sobre el catálogo inicial

Los 38 productos que carga el seed (línea completa de tractores Agrochery,
implementos Impagro, tolvas y otros productos Ascanelli) salen de fuentes
públicas reales — el sitio oficial de Impagro, el distribuidor oficial de
Agrochery, y listados de la industria para Ascanelli (su sitio oficial no
estaba respondiendo al armar esto). Son un punto de partida realista para la
demo, no el inventario real de AgroBigo — antes de mostrarlo como definitivo,
convendría que el cliente confirme specs y, sobre todo, cargue sus propios
precios (el seed los deja todos en "Consultar").

## Qué falta para producción (mismo espíritu que el roadmap de inmoplatform)

- Verificación de dominio propio + deploy en Vercel.
- Revisar si conviene mover el número de WhatsApp por sucursal en vez de uno
  compartido (hoy Ventas y Repuestos son los mismos para las dos sucursales,
  que es lo único que se pudo confirmar por Instagram).
- Métricas de conversión (cuántas consultas de WhatsApp vs. formulario llegan
  a "Cerrado ganado").
