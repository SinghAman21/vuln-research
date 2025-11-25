// DELIBERATELY VULNERABLE APPLICATION - FOR SECURITY TESTING ONLY
// DO NOT DEPLOY IN PRODUCTION ENVIRONMENTS

const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fakeData = require('./data/fakeData');

const app = express();
const PORT = 3000;

// 🔥 UI-ONLY MODE: Enables fake DB data, disables MySQL
const USE_FAKE_DB = true;   // ← change to false when DB is ready

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
    secure: false,
    httpOnly: false,
    sameSite: 'none'
  }
}));

// Database connection - Configure for Aurora
let db;
if (!USE_FAKE_DB) {
  db = mysql.createConnection({
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
} else {
  console.log("⚠️  USING FAKE DATABASE — REAL DB DISABLED");
}

// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------

// Home page
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

// ------------------------------------------------------------
// LOGIN (VULNERABLE)
// ------------------------------------------------------------
app.get('/login', (req, res) => {
  res.render('login', { error: null
    ,    user: req.session.user || null
   });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Fake DB mode
  if (USE_FAKE_DB) {
    const user = fakeData.users.find(username, password);
    if (user) {
        req.session.user = { id: user.id, username: user.username, role: user.role };
        return res.redirect('/menu');
    } else {
        return res.render('login', { error: 'Invalid credentials (try admin/admin123 or demo/password)' });
    }
  }

  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  
  console.log('Executing query:', query);
  
  db.query(query, (err, results) => {
    if (err) {
      return res.render('login', { error: 'Database error: ' + err.message });
    }
    
    if (results.length > 0) {
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

// ------------------------------------------------------------
// MENU ROUTES
// ------------------------------------------------------------

// View menu
app.get('/menu', (req, res) => {
  if (USE_FAKE_DB) {
    return res.render('menu', {
      user: req.session.user,
      menu: fakeData.menu.getAll()
    });
  }

  db.query('SELECT * FROM menu_items', (err, items) => {
    if (err) throw err;
    res.render('menu', { user: req.session.user, menu: items });
  });
});


// Add menu item form
app.get('/menu/add', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'manager') {
      return res.redirect('/login');
  }
  res.render('add_menu', { user: req.session.user });
});

// Add menu item (POST)
app.post('/menu/add', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'manager') {
      return res.status(403).send('Unauthorized');
  }

  const { name, description, price } = req.body;

  if (USE_FAKE_DB) {
    fakeData.menu.add({ name, description, price });
    return res.redirect('/menu');
  }

  const query = `INSERT INTO menu_items (name, description, price) VALUES ('${name}', '${description}', ${price})`;
  
  db.query(query, (err) => {
    if (err) {
      return res.send('Error: ' + err.message);
    }
    res.redirect('/menu');
  });
});

// Edit menu item form
app.get('/menu/edit/:id', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'manager') {
      return res.redirect('/login');
  }

  const id = req.params.id;

  if (USE_FAKE_DB) {
    const item = fakeData.menu.getById(id);
    if (item) {
        return res.render('edit_menu', { user: req.session.user, item });
    } else {
        return res.send('Item not found');
    }
  }
  
  db.query(`SELECT * FROM menu_items WHERE id = ${id}`, (err, results) => {
    if (err || results.length === 0) {
      return res.send('Item not found');
    }
    res.render('edit_menu', { user: req.session.user, item: results[0] });
  });
});

// Edit menu item (POST)
app.post('/menu/edit/:id', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'manager') {
      return res.status(403).send('Unauthorized');
  }

  const id = req.params.id;
  const { name, description, price } = req.body;

  if (USE_FAKE_DB) {
    fakeData.menu.update(id, { name, description, price });
    return res.redirect('/menu');
  }
  
  const query = `UPDATE menu_items SET name='${name}', description='${description}', price=${price} WHERE id=${id}`;
  
  db.query(query, (err) => {
    if (err) {
      return res.send('Error: ' + err.message);
    }
    res.redirect('/menu');
  });
});

// Delete menu item
app.get('/menu/delete/:id', (req, res) => { // Changed to GET for simplicity in links, usually should be POST/DELETE
    if (!req.session.user || req.session.user.role !== 'manager') {
        return res.redirect('/login');
    }
  
    const id = req.params.id;

    if (USE_FAKE_DB) {
      fakeData.menu.delete(id);
      return res.redirect('/menu');
    }
    
    db.query(`DELETE FROM menu_items WHERE id = ${id}`, (err) => {
      if (err) throw err;
      res.redirect('/menu');
    });
});

// ------------------------------------------------------------
// ORDERS ROUTES
// ------------------------------------------------------------

// View orders
app.get('/orders', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  if (USE_FAKE_DB) {
    let orders;
    if (req.session.user.role === 'manager') {
        orders = fakeData.orders.getAll();
    } else {
        orders = fakeData.orders.getByUser(req.session.user.id);
    }
    return res.render('orders', { user: req.session.user, orders });
  }
  
  let query;
  if (req.session.user.role === 'manager') {
    query = `
      SELECT o.*, u.username, m.name as item_name 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      JOIN menu_items m ON o.item_id = m.id
    `;
  } else {
    query = `
      SELECT o.*, m.name as item_name 
      FROM orders o 
      JOIN menu_items m ON o.item_id = m.id 
      WHERE o.user_id = ${req.session.user.id}
    `;
  }

  db.query(query, (err, orders) => {
    if (err) throw err;
    res.render('orders', { user: req.session.user, orders });
  });
});

// Add order form
app.get('/orders/add', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  
  const selectedItemId = req.query.item_id;

  if (USE_FAKE_DB) {
    return res.render('add_order', {
      user: req.session.user,
      items: fakeData.menu.getAll(),
      selectedItemId
    });
  }

  db.query('SELECT * FROM menu_items', (err, items) => {
    if (err) throw err;
    res.render('add_order', { user: req.session.user, items, selectedItemId });
  });
});

// Add order (POST)
app.post('/orders/add', (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const { item_id, quantity } = req.body;
  const user_id = req.session.user.id;

  if (USE_FAKE_DB) {
    fakeData.orders.add({ user_id, item_id: parseInt(item_id), quantity: parseInt(quantity) });
    return res.redirect('/orders');
  }
  
  const query = `INSERT INTO orders (user_id, item_id, quantity) VALUES (${user_id}, ${item_id}, ${quantity})`;
  
  db.query(query, (err) => {
    if (err) {
      return res.send('Error: ' + err.message);
    }
    res.redirect('/orders');
  });
});

// ------------------------------------------------------------
// SEARCH ROUTE
// ------------------------------------------------------------
app.get('/search', (req, res) => {
  const searchTerm = req.query.q || '';

  if (USE_FAKE_DB) {
    return res.render('search_results', {
      user: req.session.user,
      searchTerm,
      results: fakeData.menu.search(searchTerm)
    });
  }
  
  const query = `
    SELECT * FROM menu_items 
    WHERE name LIKE '%${searchTerm}%' 
    OR description LIKE '%${searchTerm}%'
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.send('Search error: ' + err.message);
    }
    res.render('search_results', { user: req.session.user, results, searchTerm });
  });
});

// ------------------------------------------------------------
// START SERVER
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`⚠️  VULNERABLE APPLICATION RUNNING ON PORT ${PORT}`);
  console.log(`⚠️  FOR SECURITY TESTING ONLY - DO NOT EXPOSE TO PUBLIC INTERNET`);
  console.log(`🔥 Fake DB mode: ${USE_FAKE_DB}`);
});
