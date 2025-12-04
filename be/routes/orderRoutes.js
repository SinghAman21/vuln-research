const express = require('express');
const router = express.Router();
const { pool, getIsDbConnected } = require('../db');
const { fakeData } = require('../data/fakeData');
const checkAuth = require('../middleware/auth');

// GET ORDER
router.get('/:id',  (req, res) => {
    const orderId = req.params.id;

    if (!getIsDbConnected()) {
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
router.post('/',  (req, res) => {
    const { item_id, quantity } = req.body;

    if (!getIsDbConnected()) {
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

// GET ORDERS FOR USER
router.get('/user/:userId',  (req, res) => {
    const userId = req.params.userId;

    if (!getIsDbConnected()) return res.json(fakeData.orders.getByUser(userId));

    const query = `SELECT * FROM orders WHERE user_id = ${userId}`;
    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result.rows);
    });
});

module.exports = router;
