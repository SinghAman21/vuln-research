// DELIBERATELY VULNERABLE APPLICATION - FOR SECURITY TESTING ONLY
// DO NOT DEPLOY IN PRODUCTION ENVIRONMENTS

const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// VULNERABLE: Weak session configuration - no secure flags
app.use(session({
  secret: 'weak-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // Should be true in production
    httpOnly: false, // Vulnerable to XSS cookie theft
    sameSite: 'none' // No CSRF protection
  }
}));

// Database connection - Configure for Aurora
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'restaurant_db'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to Aurora/MySQL database');
});

// Routes

// Home page
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// VULNERABLE LOGIN - SQL Injection possible
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // VULNERABILITY: Raw SQL query with unsanitized input
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('Executing query:', query); // For testing purposes
  
  db.query(query, (err, results) => {
    if (err) {
      return res.render('login', { error: 'Database error: ' + err.message });
    }
    
    if (results.length > 0) {
      // VULNERABILITY: Storing user role in session (easily tampered)
      req.session.user = {
        id: results[0].id,
        username: results[0].username,
        role: results[0].role
      };
      res.redirect('/menu');
    } else {
      res.render('login', { error: 'Invalid credentials' });
    }
  });
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Menu - View all items
app.get('/menu', (req, res) => {
  db.query('SELECT * FROM menu_items', (err, items) => {
    if (err) throw err;
    res.render('menu', { user: req.session.user, items });
  });
});

// VULNERABLE: Add menu item - XSS and SQL Injection
app.get('/menu/add', (req, res) => {
  // VULNERABILITY: No access control check
  res.render('menu_add', { user: req.session.user });
});

app.post('/menu/add', (req, res) => {
  const { name, description, price } = req.body;
  
  // VULNERABILITY: Raw SQL with unsanitized input
  const query = `INSERT INTO menu_items (name, description, price) VALUES ('${name}', '${description}', ${price})`;
  
  db.query(query, (err) => {
    if (err) {
      return res.send('Error: ' + err.message);
    }
    res.redirect('/menu');
  });
});

// VULNERABLE: Edit menu item
app.get('/menu/edit/:id', (req, res) => {
  const id = req.params.id;
  
  // VULNERABILITY: SQL Injection in WHERE clause
  db.query(`SELECT * FROM menu_items WHERE id = ${id}`, (err, results) => {
    if (err || results.length === 0) {
      return res.send('Item not found');
    }
    res.render('menu_edit', { user: req.session.user, item: results[0] });
  });
});

app.post('/menu/edit/:id', (req, res) => {
  const id = req.params.id;
  const { name, description, price } = req.body;
  
  // VULNERABILITY: Raw SQL update
  const query = `UPDATE menu_items SET name='${name}', description='${description}', price=${price} WHERE id=${id}`;
  
  db.query(query, (err) => {
    if (err) {
      return res.send('Error: ' + err.message);
    }
    res.redirect('/menu');
  });
});

// VULNERABLE: Delete menu item - No CSRF protection
app.post('/menu/delete/:id', (req, res) => {
  const id = req.params.id;
  
  // VULNERABILITY: SQL Injection
  db.query(`DELETE FROM menu_items WHERE id = ${id}`, (err) => {
    if (err) throw err;
    res.redirect('/menu');
  });
});

// Orders - View orders
app.get('/orders', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  
  let query;
  if (req.session.user.role === 'manager') {
    // VULNERABILITY: SQL Injection via session data
    query = `SELECT o.*, u.username, m.name as item_name 
             FROM orders o 
             JOIN users u ON o.user_id = u.id 
             JOIN menu_items m ON o.item_id = m.id`;
  } else {
    query = `SELECT o.*, m.name as item_name 
             FROM orders o 
             JOIN menu_items m ON o.item_id = m.id 
             WHERE o.user_id = ${req.session.user.id}`;
  }
  
  db.query(query, (err, orders) => {
    if (err) throw err;
    res.render('orders', { user: req.session.user, orders });
  });
});

// VULNERABLE: Add order
app.get('/orders/add', (req, res) => {
  db.query('SELECT * FROM menu_items', (err, items) => {
    if (err) throw err;
    res.render('order_add', { user: req.session.user, items });
  });
});

app.post('/orders/add', (req, res) => {
  const { item_id, quantity } = req.body;
  const user_id = req.session.user ? req.session.user.id : 1;
  
  // VULNERABILITY: SQL Injection
  const query = `INSERT INTO orders (user_id, item_id, quantity) VALUES (${user_id}, ${item_id}, ${quantity})`;
  
  db.query(query, (err) => {
    if (err) {
      return res.send('Error: ' + err.message);
    }
    res.redirect('/orders');
  });
});

// VULNERABLE: Edit order
app.post('/orders/edit/:id', (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;
  
  db.query(`UPDATE orders SET quantity=${quantity} WHERE id=${id}`, (err) => {
    if (err) throw err;
    res.redirect('/orders');
  });
});

// VULNERABLE: Delete order
app.post('/orders/delete/:id', (req, res) => {
  const id = req.params.id;
  
  db.query(`DELETE FROM orders WHERE id=${id}`, (err) => {
    if (err) throw err;
    res.redirect('/orders');
  });
});

// Search functionality - VULNERABLE to SQL Injection
app.get('/search', (req, res) => {
  const searchTerm = req.query.q || '';
  
  // VULNERABILITY: Direct string concatenation
  const query = `SELECT * FROM menu_items WHERE name LIKE '%${searchTerm}%' OR description LIKE '%${searchTerm}%'`;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.send('Search error: ' + err.message);
    }
    res.render('search_results', { user: req.session.user, results, searchTerm });
  });
});

app.listen(PORT, () => {
  console.log(`⚠️  VULNERABLE APPLICATION RUNNING ON PORT ${PORT}`);
  console.log(`⚠️  FOR SECURITY TESTING ONLY - DO NOT EXPOSE TO PUBLIC INTERNET`);
});