// app.js
const express = require('express');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Connect to database and start server
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {
        console.log('PostgreSQL connected successfully');
        return sequelize.sync(); // This creates tables if they don't exist
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

module.exports = app;