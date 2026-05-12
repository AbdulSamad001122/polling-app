import { rateLimit } from 'express-rate-limit';
import { getAuth } from '@clerk/express';

export const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    limit: 100, 
    standardHeaders: 'draft-7', 
    legacyHeaders: false, 
    // Best Approach: Track by User ID if logged in, fallback to IP if not
    keyGenerator: (req) => {
        const auth = getAuth(req);
        return auth?.userId || req.ip; 
    },
    message: {
        success: false,
        message: 'Too many requests, please try again after 15 minutes',
    },
    validate: false
});

export const authRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    limit: 10, 
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after an hour',
    },
    validate: false
});
