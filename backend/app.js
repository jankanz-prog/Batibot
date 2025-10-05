// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const rarityRoutes = require('./routes/rarityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));

// Conditional parsing - skip both JSON and URL encoding for file uploads
app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        // Skip all body parsing for file uploads - let multer handle it
        next();
    } else {
        // Apply JSON parsing for other requests
        express.json({ limit: '50mb' })(req, res, next);
    }
});

// URL encoding for form data (but not multipart)
app.use((req, res, next) => {
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        // Skip URL encoding for file uploads
        next();
    } else {
        express.urlencoded({ limit: '50mb', extended: true })(req, res, next);
    }
});

// Serve static files for uploaded images with CORS
app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
}, express.static('uploads'));

// Enhanced logging middleware for debugging (skip for file uploads)
app.use((req, res, next) => {
    // Skip logging for file uploads to avoid body parsing conflicts
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        return next();
    }
    console.log('\n=== REQUEST DEBUG INFO ===');
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);

    // Log headers
    console.log('Headers received:');
    console.log('  Content-Type:', req.headers['content-type'] || 'Not set');
    console.log('  Authorization:', req.headers.authorization ?
        `Bearer ${req.headers.authorization.substring(7, 20)}...` : 'Not provided');
    console.log('  Origin:', req.headers.origin || 'Not set');

    // Log request body (skip for file uploads)
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        console.log('Request body received: [File Upload - FormData]');
    } else {
        console.log('Request body received:', JSON.stringify(req.body, null, 2));
    }

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
        },
        'PATCH /api/auth/notes/:id/toggle-favorite': {
            headers: { authorization: 'Bearer <token>' },
            params: { id: 'number' },
            body: 'empty (PATCH request)'
        },
        'POST /api/auth/profile-picture': {
            headers: { authorization: 'Bearer <token>' },
            body: 'FormData with profilePicture file'
        },
        'DELETE /api/auth/profile-picture': {
            headers: { authorization: 'Bearer <token>' },
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

    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        const isFileUpload = req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data');
        
        if (!isFileUpload && (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json'))) {
            console.log('⚠️  WARNING: Content-Type should be application/json (unless file upload)');
        }

        if (!isFileUpload && req.body && Object.keys(req.body).length === 0 && req.method !== 'PATCH') {
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
app.use('/api/items', itemRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/rarities', rarityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/uploads', uploadRoutes);

// Serve uploaded files statically (for viewing)
app.use('/uploads', express.static('uploads'));

// Download route (forces download with proper headers)
app.get('/download/uploads/:folder/:filename', (req, res) => {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', folder, filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }
    
    // Extract original filename from the stored filename (remove timestamp and user ID)
    // Format: timestamp_userid_originalname
    const parts = filename.split('_');
    const originalName = parts.length >= 3 ? parts.slice(2).join('_') : filename;
    
    // Set headers to force download
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Send file
    res.sendFile(filePath);
});

// Connect to database and start server
const PORT = process.env.PORT || 3001;

sequelize.authenticate()
    .then(async () => {
        console.log('PostgreSQL connected successfully');
        
        // Import models in dependency order
        const { ItemRarity, ItemCategory, User, Item, Inventory, Trade, TradeItem, 
                Wallet, TrustScore, Notification, Profile, Note, ChatMessage } = require('./models');
        
        // Sync models in dependency order to avoid foreign key errors
        if (process.env.RESET_DB === 'true') {
            await sequelize.sync({ force: true });
            console.log('Database reset and tables created successfully');
        } else {
            // Sync in order: parent tables first, then child tables
            await ItemRarity.sync({ alter: true });
            await ItemCategory.sync({ alter: true });
            await User.sync({ alter: true });
            await Item.sync({ alter: true });
            await Inventory.sync({ alter: true });
            await Trade.sync({ alter: true });
            await TradeItem.sync({ alter: true });
            await Wallet.sync({ alter: true });
            await TrustScore.sync({ alter: true });
            await Notification.sync({ alter: true });
            await Profile.sync({ alter: true });
            await Note.sync({ alter: true });
            await ChatMessage.sync({ alter: true });
            console.log('Database tables synced successfully');
        }
    })
    .then(() => {
        console.log('Database setup complete');

        // Initialize and start item generation service
        // TEMPORARILY DISABLED for soft-delete implementation
        try {
            console.log('🔧 Attempting to start item generation service...');
            const itemGenerator = new ItemGenerationService(); //uncomment this line if you want to start automatic item generation
            itemGenerator.startItemGeneration(); //uncomment this line if you want to start automatic item generation
        } catch (error) {
            console.error('❌ Error starting item generation service:', error.message);
            console.error('Stack trace:', error.stack);
        }

        // Start server with WebSocket support
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('\n🎮 ITEM SYSTEM SETUP GUIDE:');
            console.log('═'.repeat(50));
            console.log('📋 To set up the item system for the first time:');
            console.log('   → Run: node item-system-utils/setup-initial-data.js');
            console.log('   → This creates initial rarities and categories');
            console.log('');
            console.log('🔍 To check item generation status:');
            console.log('   → Run: node item-system-utils/debug-item-generation.js');
            console.log('   → This shows database stats and recent items');
            console.log('');
            console.log('🎯 Item Generation Status:');
            console.log('   → Automatic generation: ENABLED (every minute)');
            console.log('   → Manual generation: POST /api/auth/generate-items (admin only)');
            console.log('   → Max inventory per user: 30 items');
            console.log('');
            console.log('🎨 Frontend Features:');
            console.log('   → /items - Browse all items');
            console.log('   → /inventory - View personal inventory');
            console.log('   → /admin - Admin management (admin users only)');
            console.log('');
            console.log('💬 Chat Features:');
            console.log('   → WebSocket endpoint: ws://localhost:' + PORT + '/chat');
            console.log('   → REST API: /api/chat/messages');
            console.log('   → File uploads: /api/uploads/chatUploads');
            console.log('═'.repeat(50));
        });

        // Initialize WebSocket chat service
        const chatService = require('./services/chatService');
        chatService.initialize(server);
        chatService.startHeartbeat();
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

module.exports = app;
