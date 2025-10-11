import express from 'express';
import { 
	getHierarchyTree, 
	createHierarchyItem, 
	updateHierarchyItem, 
	deleteHierarchyItem 
} from '../controllers/hierarchy.controller.js';

const router = express.Router();

// GET /api/hierarchy/tree - Get complete hierarchy tree structure
router.get('/hierarchy/tree', getHierarchyTree);

// POST /api/hierarchy - Create a new hierarchy item
router.post('/hierarchy', createHierarchyItem);

// PUT /api/hierarchy/:id - Update hierarchy item
router.put('/hierarchy/:id', updateHierarchyItem);

// DELETE /api/hierarchy/:id - Delete hierarchy item with cascading delete
router.delete('/hierarchy/:id', deleteHierarchyItem);

export default router;
