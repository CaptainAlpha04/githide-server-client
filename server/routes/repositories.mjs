import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router();
const db = admin.firestore();

/**
 * GET /api/v1/repositories
 * Get all repositories for the authenticated user (owned + collaborated)
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.user.uid;
        const userEmail = req.user.email;

        // Query repositories where user is owner or collaborator
        const repositoriesRef = db.collection('repositories');
        
        const ownerQuery = repositoriesRef.where('ownerId', '==', userId);
        const collabQuery = repositoriesRef.where('collaborators', 'array-contains', userEmail);

        const [ownerSnap, collabSnap] = await Promise.all([
            ownerQuery.get(),
            collabQuery.get()
        ]);

        const repositories = [];
        const seenIds = new Set();

        ownerSnap.forEach(doc => {
            if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id);
                repositories.push({
                    id: doc.id,
                    ...doc.data(),
                    userRole: 'owner'
                });
            }
        });

        collabSnap.forEach(doc => {
            if (!seenIds.has(doc.id)) {
                seenIds.add(doc.id);
                repositories.push({
                    id: doc.id,
                    ...doc.data(),
                    userRole: 'collaborator'
                });
            }
        });

        res.json({
            repositories,
            total: repositories.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to fetch repositories:', error);
        res.status(500).json({
            error: 'Failed to fetch repositories',
            code: 'FETCH_ERROR'
        });
    }
});

/**
 * GET /api/v1/repositories/:repoId
 * Get a specific repository (with permission check)
 */
router.get('/:repoId', async (req, res) => {
    try {
        const { repoId } = req.params;
        const userId = req.user.uid;
        const userEmail = req.user.email;

        const repoRef = db.collection('repositories').doc(repoId);
        const repoSnap = await repoRef.get();

        if (!repoSnap.exists) {
            return res.status(404).json({
                error: 'Repository not found',
                code: 'NOT_FOUND'
            });
        }

        const repoData = repoSnap.data();

        // Check if user has access (is owner or collaborator)
        const isOwner = repoData.ownerId === userId;
        const isCollaborator = repoData.collaborators?.includes(userEmail);

        if (!isOwner && !isCollaborator) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have access to this repository',
                code: 'ACCESS_DENIED'
            });
        }

        res.json({
            id: repoId,
            ...repoData,
            userRole: isOwner ? 'owner' : 'collaborator'
        });
    } catch (error) {
        console.error('Failed to fetch repository:', error);
        res.status(500).json({
            error: 'Failed to fetch repository',
            code: 'FETCH_ERROR'
        });
    }
});

/**
 * POST /api/v1/repositories
 * Create a new repository (owner must be authenticated user)
 */
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user.uid;

        // Validate input
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Repository name is required',
                code: 'INVALID_NAME'
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Repository name must be less than 100 characters',
                code: 'NAME_TOO_LONG'
            });
        }

        // Create repository document
        const repositoryId = `${userId}_${Date.now()}`;
        const repositoryRef = db.collection('repositories').doc(repositoryId);

        await repositoryRef.set({
            name: name.trim(),
            description: description?.trim() || '',
            ownerId: userId,
            collaborators: [],
            createdAt: new Date(),
            updatedAt: new Date()
        });

        res.status(201).json({
            id: repositoryId,
            name: name.trim(),
            description: description?.trim() || '',
            ownerId: userId,
            collaborators: [],
            message: 'Repository created successfully'
        });
    } catch (error) {
        console.error('Failed to create repository:', error);
        res.status(500).json({
            error: 'Failed to create repository',
            code: 'CREATE_ERROR'
        });
    }
});

/**
 * PATCH /api/v1/repositories/:repoId
 * Update repository (owner only)
 */
router.patch('/:repoId', async (req, res) => {
    try {
        const { repoId } = req.params;
        const { name, description } = req.body;
        const userId = req.user.uid;

        const repoRef = db.collection('repositories').doc(repoId);
        const repoSnap = await repoRef.get();

        if (!repoSnap.exists) {
            return res.status(404).json({
                error: 'Repository not found',
                code: 'NOT_FOUND'
            });
        }

        // Check ownership
        if (repoSnap.data().ownerId !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only repository owner can update it',
                code: 'NOT_OWNER'
            });
        }

        const updates = { updatedAt: new Date() };

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    error: 'Bad request',
                    message: 'Repository name cannot be empty',
                    code: 'INVALID_NAME'
                });
            }
            updates.name = name.trim();
        }

        if (description !== undefined) {
            updates.description = description?.trim() || '';
        }

        await repoRef.update(updates);

        res.json({
            id: repoId,
            ...repoSnap.data(),
            ...updates,
            message: 'Repository updated successfully'
        });
    } catch (error) {
        console.error('Failed to update repository:', error);
        res.status(500).json({
            error: 'Failed to update repository',
            code: 'UPDATE_ERROR'
        });
    }
});

/**
 * DELETE /api/v1/repositories/:repoId
 * Delete a repository (owner only)
 */
router.delete('/:repoId', async (req, res) => {
    try {
        const { repoId } = req.params;
        const userId = req.user.uid;

        const repoRef = db.collection('repositories').doc(repoId);
        const repoSnap = await repoRef.get();

        if (!repoSnap.exists) {
            return res.status(404).json({
                error: 'Repository not found',
                code: 'NOT_FOUND'
            });
        }

        // Check ownership
        if (repoSnap.data().ownerId !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Only repository owner can delete it',
                code: 'NOT_OWNER'
            });
        }

        await repoRef.delete();

        res.json({
            id: repoId,
            message: 'Repository deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete repository:', error);
        res.status(500).json({
            error: 'Failed to delete repository',
            code: 'DELETE_ERROR'
        });
    }
});

export default router;
