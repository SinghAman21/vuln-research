const express = require('express');
const router = express.Router();
const { pool, getIsDbConnected } = require('../db');
const { fakeData } = require('../data/fakeData');
const checkAuth = require('../middleware/auth');

// GET MENU
router.get('/', (req, res) => {
    if (!getIsDbConnected()) return res.json(fakeData.menu.getAll());

    pool.query("SELECT * FROM menu_items", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result.rows);
    });
});

// ADD MENU
router.post('/', (req, res) => {
    const { name, description, price } = req.body;

    if (!getIsDbConnected()) {
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
router.delete('/:id', (req, res) => {
    const id = req.params.id;

    if (!getIsDbConnected()) {
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

// UPDATE MENU ITEM
router.put('/:id',(req, res) => {
    const id = req.params.id;
    const { name, description, price } = req.body;

    if (!getIsDbConnected()) {
        const item = fakeData.menu.update(id, { name, description, price });
        if (!item) return res.status(404).json({ error: "Menu item not found" });
        return res.json({ message: "Menu item updated", item });
    }

    const query = `
        UPDATE menu_items 
        SET name = '${name}', description = '${description}', price = ${price}
        WHERE id = ${id}
    `;

    pool.query(query, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rowCount === 0) return res.status(404).json({ error: "Menu item not found" });
        res.json({ message: "Menu item updated" });
    });
});

module.exports = router;
