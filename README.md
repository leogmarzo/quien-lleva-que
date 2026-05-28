# Quién Lleva Qué

Webapp mobile-first para organizar quién lleva qué a un evento (asado, cumple, picnic).
El organizador se loguea con Google, crea un evento, comparte el link por WhatsApp.
Cualquiera con el link entra, ve la lista, sugiere items o se anota a llevar.

Stack: **Next.js 16** (App Router, Server Actions) + **Supabase** (Auth Google + Postgres + Realtime) + **Tailwind v4**. Deploy en **Vercel** (todo en free tier).

---

## Setup local

### 1. Variables de entorno

Copiá el ejemplo y poné tus credenciales de Supabase:

```bash
cp .env.local.example .env.local
```

### 2. Supabase project

1. Creá un proyecto en https://supabase.com (free).
2. En el dashboard del proyecto:
   - **Settings → API**: copiá `Project URL` y `anon public` key a `.env.local`.
   - **Authentication → Providers**: activá **Google** (necesitás un OAuth client en Google Cloud Console; usá `https://YOUR-PROJECT.supabase.co/auth/v1/callback` como redirect URI autorizado).
   - **SQL Editor**: pegá el contenido de `supabase/migrations/0001_init.sql` y ejecutalo. Esto crea tablas, RLS y RPCs.
   - **Database → Replication**: confirmá que `items` y `claims` aparecen en la publicación `supabase_realtime`.

### 3. Instalar y correr

```bash
pnpm install
pnpm dev
```

App en `http://localhost:3000`.

---

## Deploy

1. Subí el repo a GitHub.
2. En Vercel: **Import Project**, seleccioná el repo.
3. Vercel detecta Next.js automáticamente.
4. En **Project Settings → Environment Variables**, agregá `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Volvé a Supabase: **Authentication → URL Configuration**, agregá tu dominio Vercel (`https://tu-app.vercel.app`) a "Site URL" y a "Redirect URLs". Sumá también `https://tu-app.vercel.app/auth/callback`.
6. En Google Cloud Console: agregá `https://YOUR-PROJECT.supabase.co/auth/v1/callback` a los redirect URIs autorizados (si no está ya).

---

## Estructura

```
app/
  page.tsx                 — landing (logout) o dashboard (login)
  login/                   — Google OAuth
  new/                     — crear evento (auth required)
  e/[slug]/                — evento público
    page.tsx
    settings/page.tsx      — editar/borrar (solo owner)
  auth/callback/route.ts   — OAuth callback
  auth/signout/route.ts    — logout
  actions/
    events.ts              — create/update/delete event
    items.ts               — add/delete item
    claims.ts              — claim/unclaim
components/
  ui/                      — Button, Input, Pill, Modal, Toaster
  event/                   — EventClient, EventHeader, ShareButton, ItemList, ItemRow,
                            AddItemSheet, GuestNameModal, NewEventForm, EditEventForm
  dashboard/               — EventCard
lib/
  supabase/                — server/client helpers + Database types
  emoji-suggest.ts         — lookup nombre → emoji
  guest.ts                 — localStorage del nombre de invitado
  dates.ts                 — formato y parseo de fechas
middleware.ts              — refresca la sesión de Supabase en cada request
supabase/
  migrations/0001_init.sql — schema, RLS, RPCs, Realtime publication
```

## Modelo de datos

- `events` (id, slug único, name, event_at?, description?, owner_id)
- `items` (id, event_id, name, emoji, notes?, creator: user_id XOR guest_name)
- `claims` (id, item_id, claimer: user_id XOR guest_name; unique por par)

RLS:
- Cualquiera ve todo (lookup por slug no adivinable).
- Insert/Update/Delete de `events`: solo `owner_id`.
- Insert de `items`/`claims`: usuario logueado se inserta a sí mismo, invitado debe pasar `guest_name`.
- Delete: el usuario logueado borra solo lo suyo. Invitados borran lo suyo vía RPC `delete_*_as_guest(id, guest_name)` (security definer con check explícito).
