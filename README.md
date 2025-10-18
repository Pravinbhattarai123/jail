This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Database (Prisma ORM)

This project uses Prisma as the ORM. By default, it's configured with a local SQLite database for zero-setup development.

### Quick start

1) Ensure dependencies are installed (already in package.json):

- `prisma` (dev dependency)
- `@prisma/client`

2) Prisma files created:

- `prisma/schema.prisma` (SQLite provider)
- `.env` → `DATABASE_URL="file:./prisma/dev.db"`
- `lib/prisma.ts` → Prisma Client singleton for Next.js
- `app/api/db-check/route.ts` → Health-check endpoint

3) Migrate and generate client (done once after schema changes):

```
npx prisma migrate dev --name init
```

4) Test the connection:

- Start the dev server, then visit `/api/db-check`. You should get JSON like `{ ok: true, users: 0 }`.

### Using Prisma in the app

Import the Prisma Client via the singleton helper:

```ts
import prisma from '@/lib/prisma'

const users = await prisma.user.findMany()
```

### Switching to Postgres (optional)

If you prefer Postgres for local or hosted environments:

1) Update `.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
```

2) Update `prisma/schema.prisma` datasource provider:

```
datasource db {
	provider = "postgresql"
	url      = env("DATABASE_URL")
}
```

3) Apply migrations and regenerate client:

```
npx prisma migrate dev
```

4) (Optional) Use Prisma Accelerate or PlanetScale/Neon deployment depending on your infra.

### Prisma Studio

Open a GUI to browse data:

```
npx prisma studio
```

### Notes

- For Next.js App Router, the `lib/prisma.ts` singleton prevents hot-reload connection storms.
- Commit `prisma/migrations/` but not the SQLite database file. `.gitignore` already ignores `.env*`; keep secrets out of Git.
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
