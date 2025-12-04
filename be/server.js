const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { connectToDb } = require('./db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const menuRoutes = require('./routes/menuRoutes');

const app = express();
const port = 3000;

// Allow CORS
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to Database
connectToDb();

// Routes
app.get("/", (req, res) => {
    res.json({ message: "OK (Server running)" });
});

app.use('/', authRoutes); // /login, /register
app.use('/users', userRoutes); // /users/:id
app.use('/orders', orderRoutes); // /orders, /orders/:id, /orders/user/:userId
app.use('/menu', menuRoutes); // /menu

// Start Server
app.listen(port, () => {
    console.log(`Vulnerable server running on port ${port}`);
});
