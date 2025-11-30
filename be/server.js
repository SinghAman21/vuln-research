const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const { fakeData } = require('./data/fakeData');

const app = express();
const port = 3000;

// Vulnerability 7: Security Misconfiguration - Allow CORS from any origin
app.use(cors({
    origin: '*'
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection State
let isDbConnected = false;

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Assuming root user, change if needed
    password: '', // Assuming empty password, change if needed
    database: 'restaurant_db',
    multipleStatements: true // Enable multiple statements for potential SQLi exploitation
});

// Handle connection errors without crashing
// db.on('error', (err) => {
//     console.error('Database error:', err);
//     if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNREFUSED') {
//         console.log('⚠️  Switching to FAKE DATA mode - Database connection lost');
//         isDbConnected = false;
//     }
// });

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        console.log('⚠️  Using FAKE DATA mode - Database connection failed');
        isDbConnected = false;
        // Don't throw or exit - just continue with fake data
        return;
    }
    console.log('✓ Connected to database');
    isDbConnected = true;
});

// Middleware for Weak Session Management
// Vulnerability 3: Weak Session Management - Predictable tokens/headers
const checkAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: Missing x-user-id header' });
    }
    req.user = { id: userId };
    next();
};

// Routes

// Login
// Vulnerability 1: SQL Injection (potentially in login too, but let's focus on the requested one)
// Vulnerability 5: Plaintext Password Storage - Checking against plaintext password
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        const user = fakeData.users.find(username, password);
        if (user) {
            // Vulnerability 3: Weak Session Management - Returning simple ID as "token"
            res.json({ message: 'Login successful', token: user.id, role: user.role });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
        return;
    }
    
    // Vulnerability: Raw query with string concatenation (SQL Injection risk here too)
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    db.query(query, (err, results) => {
        if (err) {
            // Vulnerability 6: Information Disclosure - Detailed error messages
            return res.status(500).json({ error: err.message, stack: err.stack });
        }
        if (results.length > 0) {
            const user = results[0];
            // Vulnerability 3: Weak Session Management - Returning simple ID as "token"
            res.json({ message: 'Login successful', token: user.id, role: user.role });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// Register
// Vulnerability 5: Plaintext Password Storage - Storing password directly

app.get('/', (req,res) => {
    res.json({ message: 'OK' });
})

app.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    const userRole = role || 'customer';
    
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        try {
            const newUser = fakeData.users.create(username, password, userRole);
            res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
        return;
    }
    
    const query = `INSERT INTO users (username, password, role) VALUES ('${username}', '${password}', '${userRole}')`;
    
    db.query(query, (err, result) => {
        if (err) {
             // Vulnerability 6: Information Disclosure
            return res.status(500).json({ error: err.message, stack: err.stack });
        }
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    });
});

// Get User Profile
// Vulnerability 1: SQL Injection - Raw user input in queries
app.get('/users/:id', checkAuth, (req, res) => {
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        const user = fakeData.users.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
        return;
    }
    
    // VULNERABLE: Direct interpolation of req.params.id
    const query = `SELECT id, username, role, created_at FROM users WHERE id = ${req.params.id}`;
    
    db.query(query, (err, results) => {
        if (err) {
            // Vulnerability 6: Information Disclosure
            return res.status(500).json({ error: err.message, sql: query });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});

// Get Order
// Vulnerability 2: Broken Access Control - No ownership check
app.get('/orders/:id', checkAuth, (req, res) => {
    const orderId = req.params.id;
    
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        const order = fakeData.orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
        return;
    }
    
    // We are NOT checking if the order belongs to req.user.id
    const query = `SELECT * FROM orders WHERE id = ${orderId}`;
    
    db.query(query, (err, results) => {
        if (err) {
            // Vulnerability 6: Information Disclosure
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(results[0]);
    });
});

// Create Order
// Vulnerability 4: CSRF - No tokens/validation on POST routes
app.post('/orders', checkAuth, (req, res) => {
    const { item_id, quantity } = req.body;
    const userId = req.user.id; // From the weak header
    
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        const newOrder = fakeData.orders.add({ user_id: userId, item_id, quantity: quantity || 1 });
        res.status(201).json({ message: 'Order created', orderId: newOrder.id });
        return;
    }
    
    const query = `INSERT INTO orders (user_id, item_id, quantity) VALUES (${userId}, ${item_id}, ${quantity || 1})`;
    
    db.query(query, (err, result) => {
        if (err) {
            // Vulnerability 6: Information Disclosure
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Order created', orderId: result.insertId });
    });
});

// List Menu Items (Public)
app.get('/menu', (req, res) => {
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        res.json(fakeData.menu.getAll());
        return;
    }
    
    const query = 'SELECT * FROM menu_items';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Add Menu Item (Manager only - but no real auth check, just vulnerability demo)
app.post('/menu', checkAuth, (req, res) => {
    const { name, description, price } = req.body;
    
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        const newItem = fakeData.menu.add({ name, description, price });
        res.status(201).json({ message: 'Menu item added', item: newItem });
        return;
    }
    
    const query = `INSERT INTO menu_items (name, description, price) VALUES ('${name}', '${description}', ${price})`;
    
    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Menu item added', itemId: result.insertId });
    });
});

// Delete Menu Item
app.delete('/menu/:id', checkAuth, (req, res) => {
    const itemId = req.params.id;
    
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        const success = fakeData.menu.delete(itemId);
        if (success) {
            res.json({ message: 'Menu item deleted' });
        } else {
            res.status(404).json({ error: 'Menu item not found' });
        }
        return;
    }
    
    const query = `DELETE FROM menu_items WHERE id = ${itemId}`;
    
    db.query(query, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted' });
    });
});

// Get Orders for User
app.get('/orders/user/:userId', checkAuth, (req, res) => {
    const userId = req.params.userId;
    
    if (!isDbConnected) {
        // Use fake data when DB is not connected
        const orders = fakeData.orders.getByUser(userId);
        res.json(orders);
        return;
    }
    
    const query = `SELECT * FROM orders WHERE user_id = ${userId}`;
    
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.listen(port, () => {
    console.log(`Vulnerable server running on port ${port}`);
});
