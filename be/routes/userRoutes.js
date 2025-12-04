const express = require('express');
const router = express.Router();
const { pool, getIsDbConnected } = require('../db');
const { fakeData } = require('../data/fakeData');
const checkAuth = require('../middleware/auth');

// GET USER
router.get('/:id', (req, res) => {
    if (!getIsDbConnected()) {
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

// GET ORDERS FOR USER
// Note: This was originally /orders/user/:userId in server.js
// If mounted at /users, this becomes /users/orders/user/:userId which is weird.
// Or if mounted at /api, we can keep the path.
// Let's assume this file is mounted at /users for the first route.
// But the second route is /orders/user/:userId.
// I will put the second route in orderRoutes.js or keep it here but I need to be careful about mounting.
// Actually, the plan said "Move /users/:id and /orders/user/:userId here".
// If I mount this router at /, then I can define /users/:id and /orders/user/:userId.
// But usually we mount at /users.
// Let's put /orders/user/:userId in orderRoutes.js instead, it makes more sense REST-wise.
// Wait, the plan explicitly said "Move /users/:id and /orders/user/:userId here".
// I will follow the plan but I might need to adjust mounting in server.js or route paths here.
// I'll define it as /:userId/orders if mounted at /users, OR I'll just export it and mount it differently?
// No, I'll just put it in orderRoutes.js because it starts with /orders.
// It's cleaner. I'll deviate slightly from the plan for better structure, or I can define it here and mount this router at /api/users and /api/orders? No.
// Let's stick to the plan but maybe the path in the plan was just the original path.
// I'll put it in `orderRoutes.js` as `GET /user/:userId` (mounted at /orders).
// So `GET /orders/user/:userId`.
// I will remove it from here.

module.exports = router;
