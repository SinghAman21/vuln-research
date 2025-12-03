// const mysql = require('mysql2');  // or 'mysql2/promise' for async/await

// const connection = mysql.createConnection({
//   host: 'restaurant.chq66w4ek3xa.ap-south-1.rds.amazonaws.com',  // RDS endpoint from console [web:43]
//   port: 5432,                                         // Default MySQL port (change if custom) [web:43]
//   user: 'postgres',                       // RDS master username [web:43]
//   password: 'admin1234',                   // RDS master password [web:43]
//   database: 'restaurant',                     // Target DB (create first if needed) [web:43]
//   ssl: { rejectUnauthorized: false }                  // Optional: for RDS SSL (recommended for prod) [web:47]
// });

// connection.connect((err) => {
//   if (err) throw err;
//   console.log('Connected to RDS!');
//   // Run queries here
//   connection.end();  // Always close when done
// });

// psql -h restaurant.chq66w4ek3xa.ap-south-1.rds.amazonaws.com -p 5432 -U Aman -d postgres

const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'restaurant.chq66w4ek3xa.ap-south-1.rds.amazonaws.com',
  database: 'restaurant',
  password: 'admin1234',
  port: 5432,

  // host: 'localhost',
  // user: 'root',
  // password: '',
  // database: 'restaurant_db',
  multipleStatements: true,
});

(async () => {
  const res = await pool.query('SELECT NOW()');
  console.log(res.rows[0]);
  await pool.end();
})();
