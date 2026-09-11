import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/veritassupply',
});

pool.on('error', (err) => {
  console.error('[DB_ERROR] Unexpected error on idle client:', err);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('[DB_QUERY]', { text: text.trim().slice(0, 80), duration: `${duration}ms`, rows: res.rowCount });
  return res;
};
