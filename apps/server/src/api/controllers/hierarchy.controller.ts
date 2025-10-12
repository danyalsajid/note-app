import { db } from '../../db/index.js';
import { hierarchyNodes, hierarchyClosure, notes } from '../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import type {
	Episode,
	Client,
	Team,
	Organisation,
	HierarchyResponse,
	CreateHierarchyItemBody,
	UpdateHierarchyItemBody,
	NodeWithParent,
	NoteAttachment,
} from '../../types/hierarchy.types.js';
import {
	VALID_PARENT_TYPES,
	VALID_HIERARCHY_TYPES,
} from '../../types/hierarchy.types.js';

// Get single hierarchy item by ID with notes
export async function getHierarchyItem(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;

		// Get the node
		const node = await db
			.select()
			.from(hierarchyNodes)
			.where(eq(hierarchyNodes.id, id))
			.limit(1);

		if (node.length === 0) {
			return res.status(404).json({
				error: 'Not found',
				message: `Hierarchy item with ID ${id} not found`,
			});
		}

		// Get full notes attached to this item
		const itemNotes = await db
			.select()
			.from(notes)
			.where(eq(notes.attachedToId, id));

		const noteIds = itemNotes.map(note => note.id);

		// Return the node with noteIds and full notes
		res.status(200).json({
			...node[0],
			noteIds,
			notes: itemNotes,
		});
	} catch (error) {
		console.error('Error fetching hierarchy item:', error);
		res.status(500).json({
			error: 'Failed to fetch hierarchy item',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

// API endpoint handler
export async function getHierarchyTree(req: Request, res: Response) {
	try {
		// Get all nodes with their parent information
		const nodesWithParents = await db
			.select({
				id: hierarchyNodes.id,
				type: hierarchyNodes.type,
				name: hierarchyNodes.name,
				createdAt: hierarchyNodes.createdAt,
				updatedAt: hierarchyNodes.updatedAt,
				parentId: hierarchyClosure.ancestor,
			})
			.from(hierarchyNodes)
			.leftJoin(
				hierarchyClosure,
				and(
					eq(hierarchyClosure.descendant, hierarchyNodes.id),
					eq(hierarchyClosure.depth, 1) // Direct parent only
				)
			);

		// Get all notes grouped by attachedToId
		const allNotes = await db
			.select({
				id: notes.id,
				attachedToId: notes.attachedToId,
			})
			.from(notes);

		// Create a map of nodeId -> noteIds[]
		const notesMap = new Map<string, string[]>();
		allNotes.forEach((note: NoteAttachment) => {
			if (!notesMap.has(note.attachedToId)) {
				notesMap.set(note.attachedToId, []);
			}
			notesMap.get(note.attachedToId)!.push(note.id);
		});

		// Create maps for each node type
		const organisations = new Map<string, Organisation>();
		const teams = new Map<string, Team>();
		const clients = new Map<string, Client>();
		const episodes = new Map<string, Episode>();

		// Populate maps
		nodesWithParents.forEach((node: NodeWithParent) => {
			const noteIds = notesMap.get(node.id) || [];

			switch (node.type) {
				case 'organisation':
					if (!organisations.has(node.id)) {
						organisations.set(node.id, {
							id: node.id,
							type: node.type,
							name: node.name,
							createdAt: node.createdAt,
							updatedAt: node.updatedAt,
							parentId: null,
							noteIds,
							teams: [],
						});
					}
					break;
				case 'team':
					if (!teams.has(node.id)) {
						teams.set(node.id, {
							id: node.id,
							type: node.type,
							name: node.name,
							createdAt: node.createdAt,
							updatedAt: node.updatedAt,
							parentId: node.parentId!,
							noteIds,
							clients: [],
						});
					}
					break;
				case 'client':
					if (!clients.has(node.id)) {
						clients.set(node.id, {
							id: node.id,
							type: node.type,
							name: node.name,
							createdAt: node.createdAt,
							updatedAt: node.updatedAt,
							parentId: node.parentId!,
							noteIds,
							episodes: [],
						});
					}
					break;
				case 'episode':
					if (!episodes.has(node.id)) {
						episodes.set(node.id, {
							id: node.id,
							type: node.type,
							name: node.name,
							createdAt: node.createdAt,
							updatedAt: node.updatedAt,
							parentId: node.parentId!,
							noteIds,
						});
					}
					break;
			}
		});

		// Build hierarchy: episodes -> clients
		episodes.forEach(episode => {
			const client = clients.get(episode.parentId);
			if (client) {
				client.episodes.push(episode);
			}
		});

		// Build hierarchy: clients -> teams
		clients.forEach(client => {
			const team = teams.get(client.parentId);
			if (team) {
				team.clients.push(client);
			}
		});

		// Build hierarchy: teams -> organisations
		teams.forEach(team => {
			const org = organisations.get(team.parentId);
			if (org) {
				org.teams.push(team);
			}
		});

		// Return response
		const response: HierarchyResponse = {
			organisations: Array.from(organisations.values()),
		};

		res.status(200).json(response);
	} catch (error) {
		console.error('Error fetching hierarchy tree:', error);
		res.status(500).json({
			error: 'Failed to fetch hierarchy tree',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

// Create hierarchy item
export async function createHierarchyItem(req: Request<object, object, CreateHierarchyItemBody>, res: Response) {
	try {
		const { id, type, name, parentId } = req.body;

		// Validate required fields
		if (!id || !type || !name) {
			return res.status(400).json({
				error: 'Missing required fields',
				message: 'id, type, and name are required',
			});
		}

		// Validate type
		if (!VALID_HIERARCHY_TYPES.includes(type as any)) {
			return res.status(400).json({
				error: 'Invalid type',
				message: `Type must be one of: ${VALID_HIERARCHY_TYPES.join(', ')}`,
			});
		}

		// Validate parent relationship based on type
		if (type === 'organisation' && parentId) {
			return res.status(400).json({
				error: 'Invalid parent',
				message: 'Organisation cannot have a parent',
			});
		}

		if (type !== 'organisation' && !parentId) {
			return res.status(400).json({
				error: 'Missing parent',
				message: `${type} must have a parentId`,
			});
		}

		// If parentId is provided, verify parent exists and has correct type
		if (parentId) {
			const parent = await db
				.select()
				.from(hierarchyNodes)
				.where(eq(hierarchyNodes.id, parentId))
				.limit(1);

			if (parent.length === 0) {
				return res.status(404).json({
					error: 'Parent not found',
					message: `Parent with ID ${parentId} does not exist`,
				});
			}

			// Validate parent-child type relationship
			const parentNode = parent[0];
			const expectedParentType = VALID_PARENT_TYPES[type];
			if (type !== 'organisation' && expectedParentType && parentNode && parentNode.type !== expectedParentType) {
				return res.status(400).json({
					error: 'Invalid parent type',
					message: `${type} must have a parent of type ${expectedParentType}, but got ${parentNode.type}`,
				});
			}
		}

		// Check if ID already exists
		const existing = await db
			.select()
			.from(hierarchyNodes)
			.where(eq(hierarchyNodes.id, id))
			.limit(1);

		if (existing.length > 0) {
			return res.status(409).json({
				error: 'Conflict',
				message: `Hierarchy item with ID ${id} already exists`,
			});
		}

		// Create the node
		const now = new Date().toISOString();
		await db.insert(hierarchyNodes).values({
			id,
			type,
			name,
			createdAt: now,
			updatedAt: now,
		});

		// Create closure table entries
		// 1. Self-reference (depth 0)
		await db.insert(hierarchyClosure).values({
			ancestor: id,
			descendant: id,
			depth: 0,
		});

		// 2. If has parent, copy all ancestor relationships and add direct parent
		if (parentId) {
			// Get all ancestors of the parent
			const parentAncestors = await db
				.select()
				.from(hierarchyClosure)
				.where(eq(hierarchyClosure.descendant, parentId));

			// Insert relationships for all ancestors
			const closureEntries = parentAncestors.map(ancestor => ({
				ancestor: ancestor.ancestor,
				descendant: id,
				depth: ancestor.depth + 1,
			}));

			if (closureEntries.length > 0) {
				await db.insert(hierarchyClosure).values(closureEntries);
			}
		}

		// Fetch the created node
		const createdNode = await db
			.select()
			.from(hierarchyNodes)
			.where(eq(hierarchyNodes.id, id))
			.limit(1);

		res.status(201).json({
			message: 'Hierarchy item created successfully',
			node: createdNode[0],
		});
	} catch (error) {
		console.error('Error creating hierarchy item:', error);
		res.status(500).json({
			error: 'Failed to create hierarchy item',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

// Update hierarchy item
export async function updateHierarchyItem(req: Request<{ id: string }, object, UpdateHierarchyItemBody>, res: Response) {
	try {
		const { id } = req.params;
		const { name, type } = req.body;

		// Check if the node exists
		const existingNode = await db
			.select()
			.from(hierarchyNodes)
			.where(eq(hierarchyNodes.id, id))
			.limit(1);

		if (existingNode.length === 0) {
			return res.status(404).json({
				error: 'Not found',
				message: `Hierarchy item with ID ${id} not found`,
			});
		}

		// Validate at least one field to update
		if (!name && !type) {
			return res.status(400).json({
				error: 'Missing update fields',
				message: 'At least one field (name or type) must be provided',
			});
		}

		// If type is being changed, validate it
		if (type) {
			if (!VALID_HIERARCHY_TYPES.includes(type as any)) {
				return res.status(400).json({
					error: 'Invalid type',
					message: `Type must be one of: ${VALID_HIERARCHY_TYPES.join(', ')}`,
				});
			}

			// Check if type change is compatible with existing parent/children
			const parentRelation = await db
				.select({
					parentId: hierarchyClosure.ancestor,
					parentType: hierarchyNodes.type,
				})
				.from(hierarchyClosure)
				.innerJoin(
					hierarchyNodes,
					eq(hierarchyClosure.ancestor, hierarchyNodes.id)
				)
				.where(
					and(
						eq(hierarchyClosure.descendant, id),
						eq(hierarchyClosure.depth, 1)
					)
				)
				.limit(1);

			if (parentRelation.length > 0) {
				const parentRel = parentRelation[0];
				const expectedParentType = VALID_PARENT_TYPES[type];
				if (type !== 'organisation' && expectedParentType && parentRel && parentRel.parentType !== expectedParentType) {
					return res.status(400).json({
						error: 'Invalid type change',
						message: `Cannot change type to ${type} because parent is of type ${parentRel.parentType}`,
					});
				}
			}
		}

		// Build update object
		const updateData: { name?: string; type?: string; updatedAt: string } = {
			updatedAt: new Date().toISOString(),
		};

		if (name) updateData.name = name;
		if (type) updateData.type = type;

		// Update the node
		await db
			.update(hierarchyNodes)
			.set(updateData)
			.where(eq(hierarchyNodes.id, id));

		// Fetch the updated node
		const updatedNode = await db
			.select()
			.from(hierarchyNodes)
			.where(eq(hierarchyNodes.id, id))
			.limit(1);

		res.status(200).json({
			message: 'Hierarchy item updated successfully',
			node: updatedNode[0],
		});
	} catch (error) {
		console.error('Error updating hierarchy item:', error);
		res.status(500).json({
			error: 'Failed to update hierarchy item',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

// Delete hierarchy item with cascading delete
export async function deleteHierarchyItem(req: Request<{ id: string }>, res: Response) {
	try {
		const { id } = req.params;

		// Check if the node exists
		const existingNode = await db
			.select()
			.from(hierarchyNodes)
			.where(eq(hierarchyNodes.id, id))
			.limit(1);

		if (existingNode.length === 0) {
			return res.status(404).json({
				error: 'Not found',
				message: `Hierarchy item with ID ${id} not found`,
			});
		}

		// Get all descendants that will be deleted (for logging/response)
		const descendants = await db
			.select({
				id: hierarchyNodes.id,
				type: hierarchyNodes.type,
				name: hierarchyNodes.name,
			})
			.from(hierarchyNodes)
			.innerJoin(
				hierarchyClosure,
				eq(hierarchyClosure.descendant, hierarchyNodes.id)
			)
			.where(eq(hierarchyClosure.ancestor, id));

		// Delete the node - cascading delete will handle:
		// 1. All entries in hierarchyClosure where this node is ancestor or descendant
		// 2. All notes attached to this node and its descendants
		// 3. All attachments linked to those notes (via notes cascade)
		await db.delete(hierarchyNodes).where(eq(hierarchyNodes.id, id));

		res.status(200).json({
			message: 'Hierarchy item deleted successfully',
			deleted: {
				node: existingNode[0],
				descendantsCount: descendants.length - 1, // Exclude self
				descendants: descendants.filter(d => d.id !== id),
			},
		});
	} catch (error) {
		console.error('Error deleting hierarchy item:', error);
		res.status(500).json({
			error: 'Failed to delete hierarchy item',
			message: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

