const express = require('express');
const sql = require('mssql');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

const config = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    server: process.env.DATABASE_SERVER,
    port: Number(process.env.DATABASE_PORT),
    database: process.env.DATABASE_NAME,
    authentication: {
        type: 'default',
    },
    options: {
        encrypt: true,
    },
};

let isDbConnected = false;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/check-connection', async (req, res) => {
    try {
        const poolConnection = await sql.connect(config);
        isDbConnected = true;
        res.send('Connection successful');
        poolConnection.close();
    } catch (err) {
        isDbConnected = false;
        res.status(500).send('Connection failed: ' + err.message);
    }
});

app.get('/check-table', async (req, res) => {
    if (!isDbConnected) {
        return res.status(400).send('Database connection not established');
    }

    try {
        const poolConnection = await sql.connect(config);
        const result = await poolConnection.request().query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`);
        if (result.recordset.length > 0) {
            res.send(`Tables in the database: ${result.recordset.map(row => row.TABLE_NAME).join(', ')}`);
        } else {
            res.send('No tables found in the database');
        }
        poolConnection.close();
    } catch (err) {
        res.status(500).send('Error fetching tables: ' + err.message);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
