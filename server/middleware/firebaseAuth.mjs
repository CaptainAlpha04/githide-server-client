import admin from 'firebase-admin';

/**
 * Firebase Authentication Middleware
 * Validates Firebase ID tokens and attaches user data to request
 */
export const firebaseAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing authorization header',
            code: 'NO_AUTH_HEADER'
        });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid authorization format',
            code: 'INVALID_FORMAT'
        });
    }

    try {
        // Verify Firebase ID token using Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Attach user data to request
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            token: token
        };

        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);

        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.code === 'auth/invalid-id-token') {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            });
        }

        res.status(403).json({
            error: 'Forbidden',
            message: 'Failed to verify token',
            code: 'VERIFICATION_FAILED'
        });
    }
};

/**
 * Optional: Verify user owns the resource being accessed
 * Attach to routes that require ownership validation
 */
export const requireOwnership = (req, res, next) => {
    const { userId } = req.params;

    if (req.user.uid !== userId) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have permission to access this resource',
            code: 'OWNERSHIP_MISMATCH'
        });
    }

    next();
};
