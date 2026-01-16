import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { initializeFirebase } from './config/firebase.mjs';
import { firebaseAuthMiddleware } from './middleware/firebaseAuth.mjs';
import repositoriesRouter from './routes/repositories.mjs';
import collaboratorsRouter from './routes/collaborators.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 8000;
const STORAGE_DIR = path.join(__dirname, 'storage');
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'githide-default-token-2026';
const VALID_TOKENS = new Set([AUTH_TOKEN]);
const REQUEST_LOG = [];
const MAX_LOG_SIZE = 1000;

if (!existsSync(STORAGE_DIR)) {
    mkdirSync(STORAGE_DIR);
}

app.use(cors());
app.use(morgan('dev'));
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));
app.use(express.json());

// Rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many auth attempts',
    skipSuccessfulRequests: true,
});

// Enhanced authentication middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        logRequest(req, 'MISSING_AUTH', 401);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing authorization header',
            code: 'NO_AUTH_HEADER'
        });
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    
    if (!token) {
        logRequest(req, 'EMPTY_TOKEN', 401);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid authorization format',
            code: 'INVALID_FORMAT'
        });
    }
    
    if (!VALID_TOKENS.has(token)) {
        logRequest(req, 'INVALID_TOKEN', 403);
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid authentication token',
            code: 'INVALID_TOKEN'
        });
    }
    
    req.token = token;
    logRequest(req, 'AUTH_SUCCESS', 200);
    next();
};

// Logging utility
const logRequest = (req, status, code) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status,
        code,
        ip: req.ip,
    };
    REQUEST_LOG.push(logEntry);
    if (REQUEST_LOG.length > MAX_LOG_SIZE) {
        REQUEST_LOG.shift();
    }
};

app.use('/api/v1', limiter);

// Firebase-authenticated routes (new API)
app.use('/api/v1/repositories', firebaseAuthMiddleware, repositoriesRouter);
app.use('/api/v1/repositories/:repoId/collaborators', firebaseAuthMiddleware, collaboratorsRouter);

// Health check endpoint (protected with old auth, kept for backward compatibility)
app.get('/api/v1/health', authenticate, (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        storage: STORAGE_DIR
    });
});

// Authentication verification endpoint
app.post('/api/v1/auth/verify', strictLimiter, (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        logRequest(req, 'AUTH_VERIFY_FAILED', 401);
        return res.status(401).json({
            authenticated: false,
            message: 'Missing authorization header'
        });
    }
    
    const token = authHeader.replace('Bearer ', '').trim();
    const isValid = VALID_TOKENS.has(token);
    
    if (!isValid) {
        logRequest(req, 'AUTH_VERIFY_INVALID', 403);
        return res.status(403).json({
            authenticated: false,
            message: 'Invalid token'
        });
    }
    
    logRequest(req, 'AUTH_VERIFY_SUCCESS', 200);
    res.json({
        authenticated: true,
        expires_in: 3600,
        message: 'Token is valid'
    });
});

// Logs endpoint (admin only - protected)
app.get('/api/v1/admin/logs', authenticate, (req, res) => {
    res.json({
        logs: REQUEST_LOG,
        total: REQUEST_LOG.length,
        timestamp: new Date().toISOString()
    });
});

app.get('/api/v1/files', authenticate, async (req, res) => {
    try {
        const files = await fs.readdir(STORAGE_DIR);
        const visibleFiles = files.filter(f => !f.startsWith('.'));
        res.json({ files: visibleFiles });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to list files' });
    }
});

app.post('/api/v1/files/:filename', authenticate, async (req, res) => {
    const { filename } = req.params;
    if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }
    const filePath = path.join(STORAGE_DIR, filename);
    try {
        await fs.writeFile(filePath, req.body);
        console.log(`Saved file: ${filename}, size: ${req.body.length}`);
        res.status(201).json({ status: 'uploaded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save file' });
    }
});

app.get('/api/v1/files/:filename', authenticate, async (req, res) => {
    const { filename } = req.params;
    if (filename.includes('..') || filename.includes('/')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }
    const filePath = path.join(STORAGE_DIR, filename);
    try {
        if (!existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        const content = await fs.readFile(filePath);
        res.send(content);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to read file' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${req.method} ${req.path}`, err.message);
    
    logRequest(req, 'ERROR', 500);
    
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
        code: 'INTERNAL_ERROR',
        timestamp
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Endpoint ${req.path} not found`,
        code: 'NOT_FOUND'
    });
});

app.listen(PORT, () => {
    console.log(`\nGitHide Server Started`);
    console.log(`Port: ${PORT}`);
    console.log(`Storage: ${STORAGE_DIR}`);
    console.log(`Auth Token: ${AUTH_TOKEN.substring(0, 10)}...`);
    console.log(`Started: ${new Date().toISOString()}`);
    console.log(`\nServer ready and secure!\n`);
});
