import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import pool from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDirectory = path.resolve(
  __dirname,
  "../../migrations"
);

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await fs.readdir(migrationsDirectory))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    const appliedResult = await client.query(
      "SELECT version FROM schema_migrations"
    );

    const applied = new Set(
      appliedResult.rows.map((row) => row.version)
    );

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`Applying migration: ${file}`);

      const sql = await fs.readFile(
        path.join(migrationsDirectory, file),
        "utf8"
      );

      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          "INSERT INTO schema_migrations (version) VALUES ($1)",
          [file]
        );

        await client.query("COMMIT");

        console.log(`Applied migration: ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Database migrations complete.");
  } finally {
    client.release();
  }
};

runMigrations()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
