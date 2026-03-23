# SafePassWordmaker — Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.
The main product is **SafePassWordmaker** — a dark-themed cybersecurity toolkit + blog CMS.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **Frontend**: React 19 + Vite + Tailwind CSS v4 + Wouter (routing)
- **Build**: esbuild (API server), Vite (frontend)

## Artifacts

| Artifact | Path | Port | Description |
|---|---|---|---|
| `artifacts/safepasswordmaker` | `/` | 18874 | Main React SPA — public site + admin CMS |
| `artifacts/api-server` | `/api-server` | 8080 | Express REST API |
| `artifacts/mockup-sandbox` | `/__mockup` | 8081 | Component preview server (design tooling) |

## Frontend Routes

### Public (uses main site Layout)
- `/` — Home
- `/blog` — Blog listing
- `/blog/:slug` — Blog post (3-column layout: TOC, content, author+share)
- `/tools/password-generator` — Password generator
- `/tools/hash-generator` — Hash generator (MD5/SHA-1/SHA-256/SHA-512)
- `/tools/pin-generator` — PIN generator
- `/tools/password-checker` — Password strength checker
- `/about`, `/contact`, `/faq`, `/privacy-policy`, `/terms` — Static pages

### Auth (dark theme, no Layout)
- `/admin/setup` — First-time admin setup (redirects if admin exists)
- `/admin/login` — Admin login
- `/auth/login` — Contributor login
- `/auth/register` — Contributor registration

### Admin / CMS (protected, uses AdminLayout sidebar)
- `/admin` — Dashboard (stats + quick actions)
- `/admin/posts` — Post list (edit/delete, own posts for contributors)
- `/admin/posts/new` — Create post (markdown editor, tags, categories)
- `/admin/posts/:id/edit` — Edit post
- `/admin/tags` — Tags list (add, inline edit, delete)
- `/admin/categories` — Categories (admin only)
- `/admin/users` — User list with role toggle + delete (admin only)
- `/profile` — Profile view + edit (bio, photo, designation, social links)

## API Routes (all prefixed with `/api`)

### Auth
- `POST /auth/setup` — Create first admin (only works if no admin exists)
- `POST /auth/register` — Register contributor
- `POST /auth/login` — Login (admin or contributor)
- `GET /auth/me` — Get current user (requires JWT)
- `GET /auth/status` — Check if admin exists

### Content
- `GET/POST /posts` — List / create posts
- `GET/PUT/DELETE /posts/:id` — Single post operations
- `GET/POST /tags` — List / create tags (POST: auth required)
- `PUT/DELETE /tags/:id` — Edit / delete tags (admin only)
- `GET/POST /categories` — List / create categories (POST: admin only)
- `PUT/DELETE /categories/:id` — Edit / delete categories (admin only)

### Users
- `GET /users` — List all users (admin only)
- `GET /users/:id` — Get user (own profile or admin)
- `PUT /users/:id` — Update user (own profile or admin; role change: admin only)
- `DELETE /users/:id` — Delete user (admin only)

## DB Schema (lib/db/src/schema)

- `users` — id, username, email, password_hash, role, summary, profile_picture, designation, twitter, linkedin, github
- `categories` — id, name, slug
- `tags` — id, name, slug
- `posts` — id, title, slug, excerpt, content, image, status, category_id, author_id, timestamps
- `post_tags` — post_id, tag_id (many-to-many junction)

## Key Files

```text
artifacts/safepasswordmaker/src/
  App.tsx                    # Router with public + admin + auth routes
  contexts/AuthContext.tsx   # JWT auth state (login/register/logout)
  lib/api.ts                 # Fetch wrapper using /api-server/api as base
  components/AdminLayout.tsx # Admin sidebar layout
  pages/admin/               # Dashboard, Posts, Tags, Categories, Users, Login, Setup
  pages/auth/                # Contributor Login, Register
  pages/Profile.tsx          # Profile view + edit
  pages/Blog.tsx             # Blog listing with categories/search
  pages/BlogPost.tsx         # 3-column blog post layout (TOC + content + author/share)

artifacts/api-server/src/
  app.ts                     # Express app setup (CORS, JSON, routes at /api)
  middlewares/auth.ts        # JWT sign/verify, requireAuth, requireAdmin
  routes/auth.ts             # Auth endpoints
  routes/posts.ts            # Post CRUD
  routes/tags.ts             # Tag CRUD
  routes/categories.ts       # Category CRUD
  routes/users.ts            # User management

lib/db/src/schema/
  users.ts                   # Users table
  blog.ts                    # Posts, tags, categories, post_tags tables
```

## Notes

- Vite proxy: `/api-server/*` → `http://localhost:8080/*` (in development)
- Dark theme applied globally via `ThemeInit` in App.tsx; persisted in `localStorage('spm_theme')`
- JWT tokens stored in `localStorage('spm_token')`, expire in 7 days
- Default admin: `admin@safepasswordmaker.com` (created via `/admin/setup`)
- All blog tools (password gen, hash gen, etc.) are 100% client-side — no server calls
- Push DB schema changes: `pnpm --filter @workspace/db run push`
