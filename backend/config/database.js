const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'zyra_db',
  multipleStatements: true
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initDatabase() {
  try {
    // Create server connection without DB name to ensure database exists
    const rootConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    console.log('[MySQL] Connected to server.');
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConnection.end();

    // Now initialize schema and seed if tables don't exist or products table is empty
    const db = await pool.getConnection();
    console.log(`[MySQL] Connected to database '${dbConfig.database}'.`);

    const [tables] = await db.query("SHOW TABLES LIKE 'products'");
    if (tables.length === 0) {
      console.log('[MySQL] Running schema.sql...');
      const schemaSql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');
      await db.query(schemaSql);

      console.log('[MySQL] Running seed.sql...');
      const seedSql = fs.readFileSync(path.join(__dirname, '../seed.sql'), 'utf8');
      await db.query(seedSql);
      console.log('[MySQL] Database initialized and seeded successfully.');
    } else {
      const [rows] = await db.query('SELECT COUNT(*) as count FROM products');
      if (rows[0].count === 0) {
        console.log('[MySQL] Seeding products...');
        const seedSql = fs.readFileSync(path.join(__dirname, '../seed.sql'), 'utf8');
        await db.query(seedSql);
      }
    }
    db.release();
  } catch (error) {
    console.error('[MySQL Error] Initialization failed:', error.message);
  }
}

module.exports = { pool, initDatabase };
