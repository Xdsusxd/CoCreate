# CoCreate Backend

Supabase PostgreSQL backend configuration, migrations and security policies.

## Directory Structure

```
backend/
└── supabase/
    └── migrations/
        └── 001_profiles_schema.sql   # Profiles table, RLS & Trigger
```

## Database Schema

### Table: `public.profiles`

| Column       | Type         | Constraints                              |
|-------------|-------------|------------------------------------------|
| `id`        | UUID         | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `username`  | TEXT         | NOT NULL, UNIQUE, CHECK(length >= 3)     |
| `updated_at`| TIMESTAMPTZ  | DEFAULT `now()`                          |

### Row Level Security (RLS)

| Operation | Policy                         | Rule                          |
|-----------|-------------------------------|-------------------------------|
| SELECT    | Authenticated read access      | Any authenticated user        |
| INSERT    | Owner-only insert              | `auth.uid() = id`            |
| UPDATE    | Owner-only update              | `auth.uid() = id`            |
| DELETE    | Disabled                       | CASCADE from `auth.users`    |

### Trigger: `on_auth_user_created`

Automatically creates a profile row when a new user registers via Supabase Auth.
Username is derived from `raw_user_meta_data.username` or the email local-part.

## How to Apply

### Option A: Supabase SQL Editor (Recommended)
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_profiles_schema.sql`
4. Click **Run**

### Option B: Supabase CLI
```bash
npx supabase db push
```

## Security Notes

- **No anonymous access**: All RLS policies require `TO authenticated`.
- **No mock sessions**: The frontend strictly requires a valid Supabase JWT session.
- **Username validation**: Server-side CHECK constraint enforces minimum 3 characters.
- **Unique usernames**: Database-level UNIQUE constraint prevents duplicates.
