// db.js - MySQL Connection
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

connection.connect(err => {
    if (err) {
        console.error('❌ MySQL connection failed:', err.stack);
        return;
    }
    console.log('✅ Connected to MySQL');
});

module.exports = connection;
