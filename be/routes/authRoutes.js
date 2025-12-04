const express = require('express');
const router = express.Router();
const { pool, getIsDbConnected } = require('../db');
const { fakeData } = require('../data/fakeData');

// LOGIN
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!getIsDbConnected()) {
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
router.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    const userRole = role || 'customer';

    if (!getIsDbConnected()) {
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

module.exports = router;
