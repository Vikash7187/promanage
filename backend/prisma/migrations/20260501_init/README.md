This folder is a placeholder for the initial Prisma migration.

Prisma's migration engine handles MongoDB schema changes when you run the CLI locally.

To create and apply the initial migration (run from `backend`):

```bash
# ensure DATABASE_URL is set in backend/.env
npx prisma migrate dev --name init
npx prisma generate
```

Notes:
- Prisma migrations for MongoDB create a set of change steps instead of SQL files.
- Run the commands above to have Prisma generate the migration files under `prisma/migrations`.

If you want me to run these commands here, grant permission and I will attempt to run them in the workspace.
