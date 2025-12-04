const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'restaurant.chq66w4ek3xa.ap-south-1.rds.amazonaws.com',
    database: 'restaurant',
    password: 'admin1234',
    port: 5432,
});

let isDbConnected = false;

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

// Auto Reconnect
setInterval(() => {
    if (!isDbConnected) {
        console.log("🔄 Attempting DB reconnect...");
        connectToDb();
    }
}, 10000);

module.exports = {
    pool,
    connectToDb,
    getIsDbConnected: () => isDbConnected
};
