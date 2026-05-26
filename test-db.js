const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.motdlxlxntilpcrrestc:Askrindo2026@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to DIRECT_URL");
    await client.end();
  } catch (err) {
    console.error("DIRECT_URL Error:", err.message);
  }

  const poolClient = new Client({
    connectionString: 'postgresql://postgres.motdlxlxntilpcrrestc:Askrindo2026@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres'
  });
  try {
    await poolClient.connect();
    console.log("Connected successfully to DATABASE_URL");
    await poolClient.end();
  } catch (err) {
    console.error("DATABASE_URL Error:", err.message);
  }
}

run();
