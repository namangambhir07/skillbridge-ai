import pg from 'pg';
const { Pool } = pg;

async function test(url: string) {
  console.log('Testing:', url.replace(/:[^:@]+@/, ':***@'));
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });
  try {
    const res = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 5');
    console.log('SUCCESS! Tables found:', res.rows.map(r => r.table_name));
  } catch (err: any) {
    console.log('FAILED:', err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  const url1 = 'postgresql://neondb_owner:npg_kCocKM3b2JyA@ep-rough-lab-b4tcl1z8-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
  const url2 = 'postgresql://neondb_owner:npg_kCocKM3b2JyA@ep-rough-lab-b4tcl1z8-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';
  const url3 = 'postgresql://neondb_owner:npg_kCocKM3b2JyA@ep-rough-lab-b4tcl1z8.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';
  
  await test(url1);
  await test(url2);
  await test(url3);
}

run();
