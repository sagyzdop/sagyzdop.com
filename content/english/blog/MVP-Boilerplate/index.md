---
title: "MVP Boilerplate"
meta_title: "MVP Boilerplate"
description: "A guide to help you to vibecode your next million dollar GPT wrapper – MVP boilerplate with TanStack Start, Cloudflare Workers, Better Auth (Google Sign-In), Drizzle ORM and Shadcn UI."
date: 2026-03-15T12:12:12Z
image: "images/thumbnail.svg"
categories: ["Guide"]
author: "Bakhtiyar Yesbolsyn"
tags: ["Cloud Technologies", "Software Engineering", "WebDev", "Full Stack"]
draft: false
featured: true
---

![thumbnail](images/thumbnail.svg)

> Last Updated: August 25, 2026

This is a guide to set up a TanStack Start application on the Cloudflare Workers platform with Google Sign-In, using Drizzle ORM, Better Auth and Shadcn UI. The best part: *it is all free*!

Reference implementation repo: [sagyzdop/mvp-app-boilerplate](https://github.com/sagyzdop/mvp-app-boilerplate).

I see a use case for this in hackathon projects, building an MVP, or creating real small-scale projects. However, you can certainly build something bigger because Cloudflare's free tier is very generous.

This stack uses bleeding-edge tools that are gaining a lot of community support. The downside is that some links in this post will probably break over time. Please contact me if they do. Also, if there is any inconsistency, false information, or room for improvement, please let me know.

## Prerequisites

Before you start, make sure you have the following:

- **Cloudflare account** – Sign up at [cloudflare.com](https://www.cloudflare.com/). The free tier is sufficient for this guide.
- **Google Cloud account** – Sign up at [cloud.google.com](https://cloud.google.com/). We will use it to get OAuth credentials for Google Sign-In.
- **Node.js (v18+)** and **npm** – Install from [nodejs.org](https://nodejs.org/). Verify with:
  ```bash
  node --version
  npm --version
  ```
- **Git** – Install from [git-scm.com](https://git-scm.com/). Verify with:
  ```bash
  git --version
  ```

> Make sure they work in your terminal and shell.

- Basic familiarity with **React** and **TypeScript**.
- Comfortable using a **terminal/command line**.
- A **code editor**.

If you are ready, let's go!

---

## Cloudflare

Cloudflare has an `npm create` command for [starting a TanStack Start application pre-configured for Cloudflare Workers](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/).

```bash
npm create cloudflare@latest -- mvp-app --framework=tanstack-start
```

Click through the defaults, we will configure what we need manually.

After you see `🎉  SUCCESS  Application created successfully!` create `.env` and add this variable:

```env
CLOUDFLARE_ACCOUNT_ID=
```

Easiest way to find it is by Search on [dash.cloudflare.com](https://dash.cloudflare.com).

### Wrangler & D1 SQLite Database Binding

> [Wrangler](https://developers.cloudflare.com/workers/wrangler/) is the Cloudflare Developer Platform CLI and allows you to manage Worker projects.

Create a [D1 database](https://developers.cloudflare.com/d1/).

```bash
npx wrangler@latest d1 create mvp-app-d1
```

If you have never used Wrangler before, it will open your web browser so you can log in to your Cloudflare account.

```bash
mvp-app % npx wrangler@latest d1 create mvp-app-d1
Need to install the following packages:
wrangler@4.76.0
Ok to proceed? (y) y

 ⛅️ wrangler 4.76.0
───────────────────
✅ Successfully created DB 'mvp-app-d1' in region EEUR
Created your new D1 database.

To access your new D1 database in your Worker, add the following snippet to your configuration file:
{
  "d1_databases": [
    {
      "binding": "mvp_app_d1",
      "database_name": "mvp-app-d1",
      "database_id": "686d1a06-1a3c-4ada-aa63-af8f6503de27"
    }
  ]
}
✔ Would you like Wrangler to add it on your behalf? … yes
✔ What binding name would you like to use? … mvp_app_d1
✔ For local dev, do you want to connect to the remote resource instead of a local resource? … no
```

Click through the defaults. You should have this block added in your `wrangler.jsonc` file (`database_id` obviously will be different):

```jsonc
"d1_databases": [
    {
    "binding": "mvp_app_d1",
        "database_name": "mvp-app-d1",
        "database_id": "686d1a06-1a3c-4ada-aa63-af8f6503de27"
    }
]
```

Recreate types for Cloudflare bindings:

```bash
npm run cf-typegen
```

---

### Checkpoint Commit

After scaffolding and wiring Cloudflare basics, create a checkpoint commit:

```bash
git add -A
git commit -m "chore: set up TanStack Start on Cloudflare Workers"
```

---

## Drizzle ORM

> [Drizzle ORM](https://orm.drizzle.team/docs/overview) is a headless TypeScript ORM with a head.

We use it to work with the newly created D1 database.

There are instructions on their [website](https://orm.drizzle.team/docs/get-started/d1-new), but parts are outdated for the TanStack Start config we are using. Some pieces are still helpful.

### Step 1 – Create the file structure

Create a folder `db` under `src`. In it create two files: `index.ts` and `schema.ts`.

```bash
mkdir -p src/db && touch src/db/index.ts src/db/schema.ts
```

Copy this into `index.ts`:

```ts
// index.ts

import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';

export function db(d1: D1Database) {
  return drizzle(d1, { schema });
}
```

Leave `schema.ts` empty for now, we will populate it with Better Auth tables later.

### Step 2 – Install required packages

```bash
npm install drizzle-orm dotenv
npm install -D drizzle-kit tsx
```

### Step 3 – Drizzle config file

Create Drizzle config file `drizzle.config.ts` at root and configure it to work with D1. [Source.](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit)

```ts
// drizzle.config.ts

import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
    schema: './src/db/schema.ts',
    out: './migrations',
    dialect: 'sqlite',
    driver: 'd1-http',
    dbCredentials: {
        accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
        databaseId: process.env.CLOUDFLARE_DATABASE_ID,
        token: process.env.CLOUDFLARE_D1_TOKEN,
    },
})
```

Why `process.env` here? `drizzle.config.ts` runs in Node as a CLI/build config file, so it reads values from `.env` via `process.env`.

Add these to `.env`:

```env
CLOUDFLARE_DATABASE_ID=
CLOUDFLARE_D1_TOKEN=
```

You can get the database ID from previously created binding in `wrangler.jsonc`.

To get a token in [Cloudflare dashboard](https://dash.cloudflare.com/login?) go to My profile > API Tokens and create token with D1 edit permissions. You will see it only once, make sure to save it somewhere safe!

---

### Checkpoint Commit

After Drizzle configuration is in place, create another checkpoint:

```bash
git add -A
git commit -m "chore: set up Drizzle D1 and migration config"
```

---

## Google Cloud

Before configuring Better Auth, get your Google OAuth credentials. (Mainly following the [instructions from Better Auth](https://better-auth.com/docs/authentication/google).)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/apis/main).
2. Go to APIs and Services > OAuth Consent Screen and create an OAuth configuration (choose audience "External").
3. Create an OAuth 2.0 Client ID (choose application type "Web application").
4. Add authorized redirect URI for local development – `http://localhost:3000/api/auth/callback/google`

Upon creation you will see a dialog with secrets that are meant to be shown only once. You have an option to download them as `json` file, do that if you want, just make sure to keep them safe. Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

This should be quite straightforward, but if you have any problems there are many good guides online.

## Better Auth

> [Better Auth](https://better-auth.com) is an authentication framework. It provides a comprehensive set of features out of the box and includes a Plugin ecosystem that simplifies adding advanced functionalities and infrastructure to help own your auth at scale.

We will mainly follow the recommendations from the [general installation guide](https://better-auth.com/docs/installation) and the [TanStack integration guide](https://better-auth.com/docs/integrations/tanstack).

### Step 1 – Install the Package

```bash
npm install better-auth
```

### Step 2 – Set Environment Variables

Add these to `.env`

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

Generate Better Auth secret [here](https://better-auth.com/docs/installation#set-environment-variables).

### Step 3 – Create A Better Auth Instance

Create `./src/lib/auth/auth.ts`:

```bash
mkdir -p src/lib/auth && touch src/lib/auth/auth.ts
```

```ts
// auth.ts

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '@/db/schema'
import { env } from 'cloudflare:workers'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  socialProviders: {
    google: {
      prompt: 'select_account',
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: drizzleAdapter(
    drizzle(env.mvp_app_d1 as D1Database, { schema }),
    {
      provider: 'sqlite',
    }
  ),
  plugins: [tanstackStartCookies()],
})
```

Note the two ways of accessing environment values here. `process.env` is read for plain string secrets/vars (`clientId`, `clientSecret`). They are available at runtime on Cloudflare Workers when `nodejs_compat` is enabled, which is the default for recent compatibility dates. 

`env` from `cloudflare:workers` is used for `baseURL` (set it as a Worker secret) and the D1 **binding**, neither of which is a plain `process.env` value and both are only available at runtime inside the Worker. The `auth` object must be a direct export (not wrapped in a function) because Better Auth's framework integrations expect to import it directly.

Usage example:

```ts
import { auth } from '@/lib/auth/auth'

const session = await auth.api.getSession({ headers })
```

Notice that I am using only `Sign In with Google`. There are many more [authentication methods](https://better-auth.com/docs/installation#authentication-methods) Better Auth supports if you want something else.

Moreover, if you want integrations like Google Calendar, you will need [additional OAuth scopes](https://better-auth.com/docs/authentication/google#requesting-additional-google-scopes) (for example `https://www.googleapis.com/auth/calendar`). You have to enable corresponding APIs on the Google Cloud project, and these scopes can require Google OAuth app verification before public use.

### Step 4 – Create Database Tables

This is the command to create the tables to go in the `schema.ts` I talked about earlier.

```bash
npx auth@latest generate --config ./src/lib/auth/auth.ts
```

It will create a `auth-schema.ts` file at root. **Copy** its contents into previously created `schema.ts` and **delete** it.

### Step 5 – Generate Migrations

Create the migrations using Drizzle's CLI tool:

```bash
npx drizzle-kit generate
```

### Step 6 – Mount Handler

Now we do the backend. To handle API requests, set up a route handler on your server. For TanStack Start, create a `$.ts` file at `./src/routes/api/auth/` with the following code:

```bash
touch src/routes/api/auth/$.ts
```

Copy this into `$.ts`:

```ts
// $.ts

import { auth } from '@/lib/auth/auth'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return await auth.handler(request)
      },
      POST: async ({ request }: { request: Request }) => {
        return await auth.handler(request)
      },
    },
  },
})
```

### Step 7 – Create Client Instance

The client-side library helps you interact with the auth server.

Create `src/lib/auth/auth-client.ts`:

```bash
touch src/lib/auth/auth-client.ts
```

Copy this into `auth-client.ts`:


```ts
// auth-client.ts

import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
})
```

---

### Checkpoint Commit

After Better Auth server/client setup and auth route handler are done:

```bash
git add -A
git commit -m "feat(auth): add Better Auth with Google and D1"
```

---

## Integration

### Using D1

Now apply the migrations using `wrangler`. First apply migrations for local dev environment with:

```bash
npx wrangler d1 migrations apply mvp_app_d1 --local
```

And for remote D1 (the real production database on Cloudflare) with `--remote` flag:

```bash
npx wrangler d1 migrations apply mvp_app_d1 --remote
```

Change `package.json` scripts to run local dev with the database:

```json
"scripts": {
  "dev": "npm run build && wrangler dev --local --port 3000",
  "dev:vite": "vite dev",
  "build": "vite build",
  "preview": "npm run build && vite preview",
  "test": "vitest run",
  "deploy": "npm run build && wrangler deploy",
  "cf-typegen": "wrangler types",
  "db:generate": "drizzle-kit generate"
},
```

With these scripts, `npm run dev` builds the project and allows you to test D1 locally. Note that it is heavy and might be slow. If you are only testing UI, use `npm run dev:vite`. For me it was fine, YMMV.

---

At this point you have set up the bare bones. Let us do a midway check:

```bash
npm run dev
```

If everything went well, you should see a template page at `localhost:3000`:

![Tanstack Start](images/midway.jpeg)

> Looks might change on newer versions of TanStack.

---

### TanStack Server Functions

[Server functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions) are how you can write backend logic in TanStack. I found this file structure convenient for storing them, although it is [recommended](https://tkdodo.eu/blog/please-stop-using-barrel-files) to avoid barrel exports. In this case, I think this is a good trade-off. These are the functions I used for handling user sessions.

```text
src/
└─ lib/
   └─ user/
      ├─ functions.ts
      ├─ index.ts
      └─ types.ts
```

Create this structure:

```bash
mkdir -p src/lib/user && touch src/lib/user/{functions,index,types}.ts
```

Copy the code into corresponding files:

```ts
// functions.ts

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from '@/lib/auth/auth'
import type { User } from './types'

export const getUserFn = createServerFn({ method: 'GET' }).handler(async (): Promise<User | null> => {
  const session = await auth.api.getSession({
    headers: getRequestHeaders(),
  })

  if (!session?.user) {
    return null
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  }
})
```

```ts
// index.ts

export * from './types'
export * from './functions'
```

```ts
// types.ts

export interface User {
    id: string
    name: string
    email: string
    image: string | null
}
```

When a page needs to know who is signed in, it calls `getUserFn`. TanStack runs this function on the server. It gives Better Auth the request headers, which contain the session cookie, and Better Auth checks whether the session is valid. The function returns the user's `id`, name, email, and image, or `null` when nobody is signed in. `types.ts` describes the returned object, and `index.ts` re-exports everything so the rest of the app can use `getUserFn` from `@/lib/user`.

---

### Checkpoint Commit

After integration and server function wiring is complete:

```bash
git add -A
git commit -m "feat(app): add session functions and protected routes"
```

---

## Shadcn UI

Finally, the frontend. You should not sweat the UI too much when there is [Shadcn UI](https://ui.shadcn.com/docs). 

### Step 0 – Delete template files

Clear the `./src/components` folder, then **delete** their imports and uses from `./src/routes/__root.tsx` file.

### Step 1 – Install required packages

Choose what you like from [here](https://ui.shadcn.com/create), click "Create Project", pick Tanstack Start and copy the command. The `--preset` code is unique to your configuration, so generate your own. I'll use the default one.


```bash
npx shadcn@latest init --preset b0 --template start
```

You will see an interactive install. Important to type in the path to global CSS file as `src/styles.css`. Other options can be left on defaults. After this, download all shadcn primitives:

```bash
npx shadcn@latest add --all
```

It will create all the necessary files, and a couple of example files that you can delete.

---

### Checkpoint Commit

Create a checkpoint right after base shadcn setup and before downloading blocks:

```bash
git add -A
git commit -m "chore(ui): add base shadcn/ui setup"
```

---

### Step 2 – Shadcn Blocks

Shadcn blocks are pre-built, ready-to-use UI sections like navigation bars, hero sections, forms, and dashboards composed of multiple `shadcn/ui` components.

This MVP boilerplate creates a main page and a profile page with a sidebar. Although this approach to UI [seems to be fading](https://michalmalewicz.medium.com/the-end-of-dashboards-and-design-systems-5d98ec9de627), it is still practical for this use case.

I used the most basic [login block](https://ui.shadcn.com/blocks/login#login-05), and a [sidebar](https://ui.shadcn.com/blocks/sidebar#sidebar-08).

To download them:

```bash
npx shadcn@latest add login-05
npx shadcn@latest add sidebar-08
```

This will download the following files.

```text
app-sidebar.tsx
login-form.tsx
nav-main.tsx
nav-projects.tsx
nav-secondary.tsx
nav-user.tsx
```

They require some tweaking to work with the system we are building.

---

### Checkpoint Commit

Before you start customizing downloaded shadcn/template files, create a clean checkpoint that captures the generated template state and any other files changed so far:

```bash
git add -A
git commit -m "chore(ui): save shadcn blocks files"
```

---

### Side quest 1 – Component File Structure

The first insight I got while building this project was about file management. File-based routing enforces a way to organize and name route files, but it does not say much about components. I settled on a convention: each route page gets a folder under `src/components/routes/` with the same name as the route, containing an `index.tsx` that exports a `Page` component. Shared layout components live in `src/components/layouts/`.

Here is the actual structure from the repo:

```text
src/
├─ components/
│  ├─ routes/                    ← mirrors src/routes/, one folder per route page
│  │  ├─ login/
│  │  │  └─ index.tsx           ← page component for /login
│  │  ├─ main/
│  │  │  ├─ components/
│  │  │  │  └─ stats.tsx        ← components exclusive to the main page
│  │  │  └─ index.tsx           ← page component for /main
│  │  └─ playground/
│  │     └─ index.tsx           ← page component for /playground
│  ├─ layouts/                   ← shared layout components
│  │  └─ sidebar/
│  │     ├─ app-sidebar.tsx
│  │     ├─ nav-main.tsx
│  │     ├─ nav-projects.tsx
│  │     ├─ nav-secondary.tsx
│  │     └─ nav-user.tsx
│  └─ ui/                       ← shadcn components
└─ routes/
   ├─ _authenticated/
   │  ├─ main.tsx
   │  └─ playground.tsx
   ├─ api/
   │  └─ auth/
   │     └─ $.ts
   ├─ __root.tsx
   ├─ _authenticated.tsx
   ├─ index.tsx
   └─ login.tsx
```

The mapping:

| Route file                      | Component folder              | What it renders                                |
| ------------------------------- | ----------------------------- | ---------------------------------------------- |
| `login.tsx`                     | `routes/login/index.tsx`      | `Page` from login folder                       |
| `_authenticated/main.tsx`       | `routes/main/index.tsx`       | `Page` from main folder                        |
| `_authenticated/playground.tsx` | `routes/playground/index.tsx` | `Page` from playground folder                  |
| `_authenticated.tsx`            | `layouts/sidebar/`            | Shared sidebar layout for all protected routes |

`routes/` strictly mirrors `routes/` – every folder there corresponds to a route file. `layouts/` holds components shared across multiple routes (like the sidebar used by `_authenticated`). Page-exclusive components (like `stats` on the main page) go in a `components/` subfolder inside the route folder. Shared UI primitives live in `src/components/ui/`.

Look in the repo for details: [sagyzdop/mvp-app-boilerplate](https://github.com/sagyzdop/mvp-app-boilerplate).

### Side quest 2 – Tanstack Router and `_authenticated` Routes

TanStack allows [file-based routing](https://tanstack.com/router/latest/docs/routing/file-based-routing). At a basic level, any file you create under `./src/routes` becomes a route with that name.

For example, the most basic route file for the `/example` route will be with the following contents:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/example')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/example"!</div>
}
```

TanStack's build step registers this file as a route automatically, you only need to create the file itself.

However, this guide follows the convention of importing a `Page` function (AFAIK you can name them however you like, but stay consistent whatever you do) from an `index.tsx` located at the folder with the same name as the route, `/example` route:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { Page } from '@/components/routes/example'

export const Route = createFileRoute('/_authenticated/example')({
  component: ExamplePage,
})

function ExamplePage() {
  return <Page />
}
```

Naturally, we want to have protected routes that only authenticated users can access.

[Tanstack](https://tanstack.com/router/v1/docs/guide/authenticated-routes) provides a technique for protected routes by creating a file with `_` prefix. I preferred calling it `_authenticated.tsx`, you can choose anything you want if you prefer.

The trick is that you create a `_authenticated.tsx` file at the root, and a folder with the same name. The file catches everything trying to access routes in that folder, where you run the auth check. More about it [here](https://tanstack.com/router/v1/docs/how-to/setup-authentication).

Create/update these files under `./src/routes`:

```bash
mkdir -p src/routes/{_authenticated,api/auth} && \
touch src/routes/_authenticated.tsx \
      src/routes/login.tsx \
      src/routes/_authenticated/main.tsx \
      src/routes/_authenticated/playground.tsx \
```

Note: `src/routes/index.tsx` already exists from the TanStack Start template – overwrite it with the `index.tsx` code shown below.

Copy/replace the code into corresponding files:

```tsx
// _authenticated.tsx

import {
  createFileRoute,
  Outlet,
  redirect,
  useLocation,
  useRouter,
} from '@tanstack/react-router'
import { getUserFn } from '@/lib/user'
import { AppSidebar } from '@/components/layouts/sidebar/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const user = await getUserFn()

    if (!user) {
      throw redirect({ to: '/login' })
    }

    return { user }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  const router = useRouter()
  const { pathname } = useLocation()

  // Added this to make the breadcrumbs work as expected
  const currentSegment = pathname.split('/').filter(Boolean).at(-1)
  const currentPageLabel = currentSegment
    ? currentSegment
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Main'

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-max" 
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentPageLabel}</BreadcrumbPage> 
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 min-w-0 flex-col p-4 pt-0">
            <Outlet />
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </TooltipProvider>
  )
}
```

```tsx
// index.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { getUserFn } from '@/lib/user'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = await getUserFn()

    if (user) {
      throw redirect({ to: '/main' })
    } else {
      throw redirect({ to: '/login' })
    }
  },
  component: App,
})

function App() {
  return null
}
```

```tsx
// login.tsx

import { createFileRoute, redirect } from '@tanstack/react-router'
import { Page } from '@/components/routes/login'
import { getUserFn } from '@/lib/user'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    const user = await getUserFn()

    if (user) {
      throw redirect({ to: '/main' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return <Page />
}
```

### Step 3 – Pages

Rename the downloaded `login-form.tsx` to `index.tsx` and place it under `./src/components/routes/login/`:

```bash
mkdir -p src/components/routes/login
```

This is how I changed its contents to leave only `Sign in with Google` button:

```tsx
// index.tsx

import { GalleryVerticalEnd } from 'lucide-react'
import { authClient } from '@/lib/auth/auth-client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field'

export function Page({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
      })
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  return (
  <div className="min-h-screen flex items-center justify-center">
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <a href="#" className="flex flex-col items-center gap-2 font-medium">
          <div className="flex size-8 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-6" />
          </div>
          <span className="sr-only">MVP App</span>
        </a>
        <h1 className="text-xl font-bold">Welcome to MVP App</h1>
        <FieldDescription>
          Sign in with your Google account to continue
        </FieldDescription>
      </div>

      <FieldGroup>
        <Field className="grid gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4"
            >
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Continue with Google
          </Button>
        </Field>
      </FieldGroup>

      <FieldDescription className="px-6 text-center">
        Made by <a href="https://sagyzdop.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">sagyzdop</a>
      </FieldDescription>
    </div>
  </div>
  )
}
```

By the end, it will look something like this:

![login](images/login.jpeg)

We will show the sidebar only in authenticated routes. The sidebar files (`app-sidebar.tsx`, `nav-main.tsx`, `nav-projects.tsx`, `nav-secondary.tsx`, `nav-user.tsx`) I placed under `./src/components/layouts/sidebar`.

```bash
mkdir -p src/components/layouts/sidebar
```

I added a function to handle logout, and changed the links to point to `/main` when clicking the logo and `/playground` when clicking `Playground`. To make this work you have to copy the edited sidebar files.

I also added corresponding `./src/components/routes/main/index.tsx` and `./src/components/routes/playground/index.tsx` placeholder page component files as discussed before. 

```bash
mkdir -p src/components/routes/main/components && \
touch src/components/routes/main/index.tsx src/components/routes/main/components/stats.tsx && \
mkdir -p src/components/routes/playground && \
touch src/components/routes/playground/index.tsx
```

You can copy these files from the GitHub repo – [sagyzdop/mvp-app-boilerplate](https://github.com/sagyzdop/mvp-app-boilerplate) – and examine the commit diffs if needed.

The route files (under `./src/routes/_authenticated`) look like this:

```tsx
// main.tsx

import { createFileRoute } from '@tanstack/react-router'
import { Page } from '@/components/routes/main'

export const Route = createFileRoute('/_authenticated/main')({
  component: MainPage,
})

function MainPage() {
  return <Page />
}
```

```tsx
// playground.tsx

import { createFileRoute } from '@tanstack/react-router'
import { Page } from '@/components/routes/playground'

export const Route = createFileRoute('/_authenticated/playground')({
  component: PlaygroundPage,
})

function PlaygroundPage() {
  return <Page />
}
```

They look something like this:

![main](images/main.jpeg)

![playground](images/playground.jpeg)

---

### Checkpoint Commit

After customizing shadcn/template files, route pages, and any other touched project files:

```bash
git add -A
git commit -m "feat(ui): customize shadcn blocks and app layout"
```

---

## Deploy


### Step 1 – Create the Worker from GitHub

Workers support automatic deploy on push to GitHub, and I recommend using that first. Push your code to GitHub (for example, [sagyzdop/mvp-app-boilerplate](https://github.com/sagyzdop/mvp-app-boilerplate)), then go to `dash.cloudflare.com`, Compute > Workers & Pages > Continue with GitHub and select the repository from your GitHub account.

Set a **Project name**. Delete the **Build command** and leave it empty. Change the **Deploy command** to `npm run deploy`. Click deploy and wait.

This first deploy creates the Worker resource. If everything went well, from "Domains" tab of your worker you need to activate a production domain (or add your custom domain, you can buy from Cloudflare itself). Copy it, we will need it in the next step.

### Step 2 - Update Google Cloud Credentials

We need to add the copied production address to authorized redirect URIs list we edited at the very beginning – `https://YOUR_CLOUDFLARE_DOMAIN_NAME/api/auth/callback/google`.


### Step 3 – Add Environment Variables to Production

After the Worker exists, add secrets from the Worker web UI or by `npx wrangler secret put` command. Important: put your domain name into `BETTER_AUTH_URL`, for example `https://mvp-app.sagyzdop-cloudflare.workers.dev`, **NOT** `http://localhost:3000`.

You can also add the same keys from the web dashboard.

### Step 4 – Apply Production Migrations

Before first production login, apply migrations remotely if you haven't already:

```bash
npx wrangler d1 migrations apply mvp_app_d1 --remote
```

If everything goes well, your app is live.

---

### Final Checkpoint Commit

Finally, update the README and make a final checkpoint:

```bash
git add -A
git commit -m "docs: update README and finalize MVP boilerplate guide"
```

---

That is it. Use this however you want. If you do, it would be really nice if you mention it with a link to this post somewhere in your project 😉

Live demo at [mvp-app-boilerplate.sagyzdop-cloudflare.workers.dev](https://mvp-app-boilerplate.sagyzdop-cloudflare.workers.dev).

GitHub repo: [sagyzdop/mvp-app-boilerplate](https://github.com/sagyzdop/mvp-app-boilerplate).

***Happy building!***

---

## Troubleshooting

- If Google login redirects fail, verify the exact callback URL in Google Cloud and make sure it matches your auth route path.
- If local auth works but production fails, re-check Worker secrets (`BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) and make sure `BETTER_AUTH_URL` is your production domain.
- If database tables are missing in production, run `npx wrangler d1 migrations apply mvp_app_d1 --remote` again.
- If type errors mention missing Cloudflare bindings, run `npm run cf-typegen` after changing `wrangler.jsonc` bindings.
