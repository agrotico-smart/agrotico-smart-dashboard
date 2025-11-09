
import { createPool } from 'mysql2/promise';

// Since config.js is a CommonJS module, we use require
const config = require('../../config');

if (!config.database) {
  throw new Error('Database configuration is missing in config.js');
}

// Create the connection pool.
// Set timezone to Costa Rica (UTC-6) to ensure timestamps are returned correctly
const pool = createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  port: config.database.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '-06:00' // Costa Rica timezone (UTC-6)
});

export default pool;
