import { neon } from '@neondatabase/serverless';

function getDbUrl(): string {
  const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("NEON_DATABASE_URL or DATABASE_URL must be set");
  }
  return url;
}

const dbUrl = getDbUrl();
const sql = neon(dbUrl);

async function checkDb() {
  try {
    console.log('Checking database connection...');
    console.log('Using URL:', dbUrl.substring(0, 50) + '...');
    
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('Tables in database:', tables);
    
    if (tables.length === 0) {
      console.log('No tables found. Database is empty.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDb();
