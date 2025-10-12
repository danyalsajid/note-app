import express from 'express';
import {
	login,
	signup,
	logout,
	getCurrentUser,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// POST /api/auth/login - Login user
router.post('/auth/login', login);

// POST /api/auth/signup - Register new user
router.post('/auth/signup', signup);

// POST /api/auth/logout - Logout user
router.post('/auth/logout', logout);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/auth/me', requireAuth, getCurrentUser);

export default router;
