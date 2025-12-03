const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const { fakeData } = require('./data/fakeData');

const app = express();
const port = 3000;

// Allow CORS
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection state
let isDbConnected = false;

// Create DB connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'restaurant.chq66w4ek3xa.ap-south-1.rds.amazonaws.com',
    database: 'restaurant',
    password: 'admin1234',
    port: 5432,
    // multipleStatements: true // Not supported directly in pg connection config like mysql
});

// ------------------------------
// FIX: Safe DB Connection Wrapper
// ------------------------------
async function connectToDb() {
    try {
        const client = await pool.connect();
        console.log("✓ Connected to database");
        isDbConnected = true;
        client.release();
    } catch (err) {
        console.log("⚠️  Database offline. Starting server in FAKE DATA MODE.");
        console.log("⚠️  Error:", err.message);
        isDbConnected = false;
    }
}

// Try connecting once
connectToDb();

// ---------------------------------
// OPTIONAL — Auto Reconnect DB Every 10s
// ---------------------------------
setInterval(() => {
    if (!isDbConnected) {
        console.log("🔄 Attempting DB reconnect...");
        connectToDb();
    }
}, 10000);

// ------------------------------
// Weak Session Management
// ------------------------------
const checkAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing x-user-id header' });
    req.user = { id: userId };
    next();
};

// ------------------------------
// Routes
// ------------------------------

app.get("/", (req, res) => {
    res.json({ message: "OK (Server running)" });
});

// LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!isDbConnected) {
        const user = fakeData.users.find(username, password);
        if (user) return res.json({ message: 'Login successful', token: user.id, role: user.role });
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Vulnerable SQL Injection preserved
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rows.length > 0) {
            const user = result.rows[0];
            return res.json({ message: 'Login successful', token: user.id, role: user.role });
        }
        res.status(401).json({ error: 'Invalid credentials' });
    });
});

// REGISTER
app.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    const userRole = role || 'customer';

    if (!isDbConnected) {
        try {
            const newUser = fakeData.users.create(username, password, userRole);
            return res.status(201).json({ message: 'User registered', userId: newUser.id });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    const query = `INSERT INTO users (username, password, role) VALUES ('${username}', '${password}', '${userRole}') RETURNING id`;

    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'User registered', userId: result.rows[0].id });
    });
});

// GET USER
app.get('/users/:id', checkAuth, (req, res) => {
    if (!isDbConnected) {
        const user = fakeData.users.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        const { password, ...safeUser } = user;
        return res.json(safeUser);
    }

    const query = `SELECT id, username, role, created_at FROM users WHERE id = ${req.params.id}`;

    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    });
});

// GET ORDER
app.get('/orders/:id', checkAuth, (req, res) => {
    const orderId = req.params.id;

    if (!isDbConnected) {
        const order = fakeData.orders.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        return res.json(order);
    }

    const query = `SELECT * FROM orders WHERE id = ${orderId}`;
    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result.rows.length) return res.status(404).json({ error: "Order not found" });
        res.json(result.rows[0]);
    });
});

// CREATE ORDER
app.post('/orders', checkAuth, (req, res) => {
    const { item_id, quantity } = req.body;

    if (!isDbConnected) {
        const newOrder = fakeData.orders.add({
            user_id: req.user.id,
            item_id,
            quantity: quantity || 1
        });
        return res.status(201).json({ message: "Order created", orderId: newOrder.id });
    }

    const query = `
        INSERT INTO orders (user_id, item_id, quantity)
        VALUES (${req.user.id}, ${item_id}, ${quantity || 1})
        RETURNING id
    `;

    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Order created", orderId: result.rows[0].id });
    });
});

// GET MENU
app.get('/menu', (req, res) => {
    if (!isDbConnected) return res.json(fakeData.menu.getAll());

    pool.query("SELECT * FROM menu_items", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result.rows);
    });
});

// ADD MENU
app.post('/menu', checkAuth, (req, res) => {
    const { name, description, price } = req.body;

    if (!isDbConnected) {
        const item = fakeData.menu.add({ name, description, price });
        return res.status(201).json({ message: "Menu item added", item });
    }

    const query = `
        INSERT INTO menu_items (name, description, price)
        VALUES ('${name}', '${description}', ${price})
        RETURNING id
    `;

    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Menu item added", itemId: result.rows[0].id });
    });
});

// DELETE MENU ITEM
app.delete('/menu/:id', checkAuth, (req, res) => {
    const id = req.params.id;

    if (!isDbConnected) {
        const ok = fakeData.menu.delete(id);
        if (!ok) return res.status(404).json({ error: "Menu item not found" });
        return res.json({ message: "Menu item deleted" });
    }

    const query = `DELETE FROM menu_items WHERE id = ${id}`;
    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rowCount === 0) return res.status(404).json({ error: "Menu item not found" });
        res.json({ message: "Menu item deleted" });
    });
});

// GET ORDERS FOR USER
app.get('/orders/user/:userId', checkAuth, (req, res) => {
    const userId = req.params.userId;

    if (!isDbConnected) return res.json(fakeData.orders.getByUser(userId));

    const query = `SELECT * FROM orders WHERE user_id = ${userId}`;
    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result.rows);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Vulnerable server running on port ${port}`);
});
