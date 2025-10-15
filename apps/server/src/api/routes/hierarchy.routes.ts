import express from 'express';
import {
	getHierarchyTree,
	getHierarchyItem,
	createHierarchyItem,
	updateHierarchyItem,
	deleteHierarchyItem,
} from '../controllers/hierarchy.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/hierarchy/tree - Get complete hierarchy tree structure
router.get('/hierarchy/tree', requireAuth, getHierarchyTree);

// GET /api/hierarchy/:id - Get single hierarchy item with notes
router.get('/hierarchy/:id', requireAuth, getHierarchyItem);

// POST /api/hierarchy - Create a new hierarchy item
router.post('/hierarchy', requireAuth, createHierarchyItem);

// PUT /api/hierarchy/:id - Update hierarchy item
router.put('/hierarchy/:id', requireAuth, updateHierarchyItem);

// DELETE /api/hierarchy/:id - Delete hierarchy item with cascading delete
router.delete('/hierarchy/:id', requireAuth, deleteHierarchyItem);

export default router;
