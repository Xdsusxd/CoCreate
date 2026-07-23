# CoCreate Supabase Database Setup & Migrations

Este directorio contiene las migraciones SQL necesarias para configurar la base de datos de Supabase para CoCreate.

## Estructura de la Base de Datos

1. **Tabla `public.profiles`**:
   - `id`: UUID (Foreign Key a `auth.users.id`)
   - `username`: TEXT (Único)
   - `avatar_url`: TEXT
   - `created_at` / `updated_at`: TIMESTAMPTZ

2. **Trigger Automatizado (`on_auth_user_created`)**:
   - Crea automáticamente un registro inicial en `profiles` cuando un usuario se registra en `auth.users`.

3. **Políticas RLS (Row Level Security)**:
   - Acceso de lectura pública a perfiles.
   - Edición e inserción permitida únicamente al usuario dueño del ID.

4. **Bucket de Almacenamiento `avatars`**:
   - Bucket público para fotos de perfil.

## Cómo Aplicar la Migración

### Opción A: Supabase SQL Editor (Recomendado)
1. Inicia sesión en tu [Supabase Dashboard](https://supabase.com/dashboard).
2. Ve a la sección **SQL Editor**.
3. Copia el contenido del archivo [`supabase/migrations/20260722_init_schema.sql`](./migrations/20260722_init_schema.sql).
4. Haz clic en **Run** para ejecutar la migración.

### Opción B: Supabase CLI
```bash
npx supabase db push
```
