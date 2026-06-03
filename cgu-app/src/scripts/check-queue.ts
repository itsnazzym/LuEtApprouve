import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
dotenv.config();
const sql = neon(process.env.DATABASE_URL!);
sql`SELECT * FROM platforms WHERE name ILIKE '%chatgpt%' OR source_url ILIKE '%chatgpt%' OR source_url ILIKE '%openai%'`.then(console.log);
