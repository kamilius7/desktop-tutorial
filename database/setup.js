const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.resolve(__dirname, '../backend/.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const setup = async () => {
  const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8');
  try {
    await pool.query(schema);
    console.log('Database setup complete.');
  } catch (error) {
    console.error('Error setting up the database:', error);
  } finally {
    await pool.end();
  }
};

setup();
