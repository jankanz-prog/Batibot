// app.js
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const ItemGenerationService = require('./services/itemGenerationService');
require('./models'); // This will load all models and associations

const app = express();

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:58516',
            /^http:\/\/127\.0\.0\.1:\d+$/  // Allow any port on 127.0.0.1
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin matches any allowed origins (including regex patterns)
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return allowedOrigin === origin;
            } else if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Enhanced logging middleware for debugging
app.use((req, res, next) => {
    console.log('\n=== REQUEST DEBUG INFO ===');
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);

    // Log headers
    console.log('Headers received:');
    console.log('  Content-Type:', req.headers['content-type'] || 'Not set');
    console.log('  Authorization:', req.headers.authorization ?
        `Bearer ${req.headers.authorization.substring(7, 20)}...` : 'Not provided');
    console.log('  Origin:', req.headers.origin || 'Not set');

    // Log request body
    console.log('Request body received:', JSON.stringify(req.body, null, 2));

    // Log query parameters
    if (Object.keys(req.query).length > 0) {
        console.log('Query parameters:', JSON.stringify(req.query, null, 2));
    }

    // Log route parameters
    if (Object.keys(req.params).length > 0) {
        console.log('Route parameters:', JSON.stringify(req.params, null, 2));
    }

    // Expected format based on route
    const expectedFormats = {
        'POST /api/auth/login': {
            body: { email: 'string OR username: string', password: 'string' }
        },
        'POST /api/auth/register': {
            body: { username: 'string', email: 'string', password: 'string' }
        },
        'POST /api/auth/create-admin': {
            body: { username: 'string', email: 'string', password: 'string', adminKey: 'string' }
        },
        'PUT /api/auth/change-password': {
            headers: { authorization: 'Bearer <token>' },
            body: { currentPassword: 'string', newPassword: 'string' }
        },
        'GET /api/auth/verify-token': {
            headers: { authorization: 'Bearer <token>' },
            body: 'empty (GET request)'
        },
        'POST /api/auth/notes': {
            headers: { authorization: 'Bearer <token>' },
            body: { title: 'string', content: 'string (optional)' }
        },
        'GET /api/auth/notes': {
            headers: { authorization: 'Bearer <token>' },
            body: 'empty (GET request)'
        },
        'GET /api/auth/notes/:id': {
            headers: { authorization: 'Bearer <token>' },
            params: { id: 'number' },
            body: 'empty (GET request)'
        },
        'PUT /api/auth/notes/:id': {
            headers: { authorization: 'Bearer <token>' },
            params: { id: 'number' },
            body: { title: 'string', content: 'string (optional)' }
        },
        'DELETE /api/auth/notes/:id': {
            headers: { authorization: 'Bearer <token>' },
            params: { id: 'number' },
            body: 'empty (DELETE request)'
        }
    };

    const routeKey = `${req.method} ${req.path}`;
    const expectedFormat = expectedFormats[routeKey];

    if (expectedFormat) {
        console.log('Expected format for this endpoint:');
        console.log(JSON.stringify(expectedFormat, null, 2));
    }

    // Validation warnings
    console.log('\n--- VALIDATION CHECKS ---');

    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
            console.log('⚠️  WARNING: Content-Type should be application/json');
        }

        if (Object.keys(req.body).length === 0) {
            console.log('⚠️  WARNING: Request body is empty for POST/PUT request');
        }
    }

    if (req.path.includes('/api/auth/') &&
        !req.path.includes('/login') &&
        !req.path.includes('/register') &&
        !req.path.includes('/create-admin') &&
        !req.path.includes('/rarities')) {

        if (!req.headers.authorization) {
            console.log('🔒 WARNING: This endpoint requires authentication (Authorization header)');
        }
    }

    console.log('========================\n');

    next();
});


// Routes
app.use('/api/auth', authRoutes);

// Connect to database and start server
const PORT = process.env.PORT || 3001;

sequelize.authenticate()
    .then(() => {
        console.log('PostgreSQL connected successfully');
        return sequelize.sync({ alter: true }); // Updates tables without losing data
    })
    .then(() => {
        console.log('Database tables created successfully');

        // Initialize and start item generation service

        //const itemGenerator = new ItemGenerationService(); //uncomment this line if you want to start automatic item generation
        //itemGenerator.startItemGeneration(); //uncomment this line if you want to start automatic item generation

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

module.exports = app;
