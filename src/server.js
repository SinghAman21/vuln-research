require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../')));

// Database connection - Intentionally exposed credentials for Aurora DB
// Intentionally vulnerable: No environment variables, hardcoded credentials
const db = mysql.createConnection({
        host: process.env.DB_HOST || 'database-1-instance-1.chq66w4ek3xa.ap-south-1.rds.amazonaws.com',
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || 'admin123456789',
    database: process.env.DB_NAME || 'restaurant-db'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        // Intentionally not handling error properly - keep vulnerable
        return;
    }
    console.log('Connected to Aurora DB');
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../register.html'));
});

// Intentionally vulnerable register endpoint
// No input validation, no sanitization, SQL injection vulnerable
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    
    // Intentionally vulnerable SQL query - direct string interpolation
    const query = `INSERT INTO users (username, email, password, role) VALUES ('${username}', '${email}', '${password}', 'user')`;
    
    db.query(query, (err, result) => {
        if (err) {
            // Intentionally exposed error messages
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, message: 'User registered successfully' });
    });
});

// Intentionally vulnerable login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // Intentionally vulnerable SQL query - classic SQL injection vulnerability
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    db.query(query, (err, results) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }

        if (results.length > 0) {
            const user = results[0];
            // Intentionally vulnerable: storing sensitive data in cookies
            res.cookie('user', JSON.stringify(user), { maxAge: 900000, httpOnly: false });
            res.json({ success: true, user });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Intentionally vulnerable user search - XSS and SQL injection
app.get('/api/users/search', (req, res) => {
    const searchTerm = req.query.q;
    
    // Multiple vulnerabilities: SQL injection + no output encoding
    const query = `SELECT * FROM users WHERE username LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`;
    
    db.query(query, (err, results) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, users: results });
    });
});

// Intentionally vulnerable reservations endpoint
app.post('/api/reservations', (req, res) => {
    const { name, email, phone, date, time, guests, specialRequests } = req.body;
    
    // Intentionally vulnerable SQL query
    const query = `INSERT INTO reservations (name, email, phone, date, time, guests, special_requests) VALUES ('${name}', '${email}', '${phone}', '${date}', '${time}', '${guests}', '${specialRequests}')`;
    
    db.query(query, (err, result) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, message: 'Reservation saved successfully' });
    });
});

// Get all reservations - vulnerable to information disclosure
app.get('/api/reservations', (req, res) => {
    // No authentication, no access control
    const query = 'SELECT * FROM reservations';
    
    db.query(query, (err, results) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, reservations: results });
    });
});

// Handle newsletter subscriptions - vulnerable
app.post('/api/newsletter', (req, res) => {
    const { email } = req.body;
    
    // Intentionally vulnerable SQL query
    const query = `INSERT INTO newsletter_subscribers (email) VALUES ('${email}')`;
    
    db.query(query, (err, result) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, message: 'Successfully subscribed to newsletter' });
    });
});

// Menu Items endpoints - intentionally vulnerable
app.get('/api/menu-items', (req, res) => {
    const query = 'SELECT * FROM menu_items';
    db.query(query, (err, results) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, items: results });
    });
});

app.post('/api/menu-items', (req, res) => {
    const { name, description, price } = req.body;
    
    // Intentionally using user cookie without proper validation
    const userCookie = req.cookies.user;
    
    if (!userCookie) {
        res.json({ success: false, message: 'Not authenticated' });
        return;
    }

    const user = JSON.parse(userCookie);
    if (user.role !== 'manager') {
        res.json({ success: false, message: 'Not authorized' });
        return;
    }

    // Intentionally vulnerable SQL query
    const query = `INSERT INTO menu_items (name, description, price) VALUES ('${name}', '${description}', ${price})`;
    
    db.query(query, (err, result) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true, id: result.insertId });
    });
});

app.put('/api/menu-items/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, price } = req.body;
    const userCookie = req.cookies.user;
    
    if (!userCookie) {
        res.json({ success: false, message: 'Not authenticated' });
        return;
    }

    const user = JSON.parse(userCookie);
    if (user.role !== 'manager') {
        res.json({ success: false, message: 'Not authorized' });
        return;
    }

    // Intentionally vulnerable SQL query
    const query = `UPDATE menu_items SET name = '${name}', description = '${description}', price = ${price} WHERE id = ${id}`;
    
    db.query(query, (err) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true });
    });
});

app.delete('/api/menu-items/:id', (req, res) => {
    const { id } = req.params;
    const userCookie = req.cookies.user;
    
    if (!userCookie) {
        res.json({ success: false, message: 'Not authenticated' });
        return;
    }

    const user = JSON.parse(userCookie);
    if (user.role !== 'manager') {
        res.json({ success: false, message: 'Not authorized' });
        return;
    }

    // Intentionally vulnerable SQL query
    const query = `DELETE FROM menu_items WHERE id = ${id}`;
    
    db.query(query, (err) => {
        if (err) {
            res.json({ success: false, message: err.message });
            return;
        }
        res.json({ success: true });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Vulnerable server running on port ${PORT}`);
    console.log('NOTE: This server is intentionally vulnerable for research purposes');
});
