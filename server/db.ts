import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@/shared/schema";
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());

export const db = drizzle(sql, { schema });
