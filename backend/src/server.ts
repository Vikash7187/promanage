import { config } from "dotenv";
import { MongoMemoryReplSet } from "mongodb-memory-server";

config();

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === "production") {
      console.error("FATAL: DATABASE_URL environment variable is required in production.");
      process.exit(1);
    }
    // Use in-memory MongoDB only for local dev
    const replSet = await MongoMemoryReplSet.create({
      replSet: { count: 1, name: "rs0" }
    });
    const uri = replSet.getUri();
    const dbUri = uri.replace("/?", "/tasknest?");
    process.env.DATABASE_URL = dbUri;
    console.log(`In-memory MongoDB: ${dbUri}`);
  }

  const { app } = await import("./app.js");
  const { env } = await import("./lib/env.js");

  app.listen(Number(env.PORT), () => {
    console.log(`TaskNest API running on port ${env.PORT}`);
  });
}

bootstrap();
