import { Router } from 'express';
import admin from 'firebase-admin';

const router = Router({ mergeParams: true });
const db = admin.firestore();

/**
 * GET /api/v1/repositories/:repoId/collaborators
 * Get all collaborators for a repository
 */
router.get('/', async (req, res) => {
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

        // Check access
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
            repositoryId: repoId,
            collaborators: repoData.collaborators || [],
            total: (repoData.collaborators || []).length
        });
    } catch (error) {
        console.error('Failed to fetch collaborators:', error);
        res.status(500).json({
            error: 'Failed to fetch collaborators',
            code: 'FETCH_ERROR'
        });
    }
});

/**
 * POST /api/v1/repositories/:repoId/collaborators
 * Add a collaborator to repository (owner only)
 */
router.post('/', async (req, res) => {
    try {
        const { repoId } = req.params;
        const { email } = req.body;
        const userId = req.user.uid;
        const userEmail = req.user.email;

        // Validate input
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Valid email is required',
                code: 'INVALID_EMAIL'
            });
        }

        // Prevent self-collaboration
        if (email === userEmail) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Cannot add yourself as collaborator',
                code: 'SELF_COLLABORATION'
            });
        }

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
                message: 'Only repository owner can add collaborators',
                code: 'NOT_OWNER'
            });
        }

        const repoData = repoSnap.data();

        // Check if already a collaborator
        if (repoData.collaborators?.includes(email)) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'User is already a collaborator',
                code: 'ALREADY_COLLABORATOR'
            });
        }

        // Verify the user exists in Firestore users collection
        const usersRef = db.collection('users');
        const userQuery = usersRef.where('email', '==', email);
        const userSnap = await userQuery.get();

        if (userSnap.empty) {
            return res.status(404).json({
                error: 'Not found',
                message: 'User with this email does not exist',
                code: 'USER_NOT_FOUND'
            });
        }

        // Add collaborator
        await repoRef.update({
            collaborators: admin.firestore.FieldValue.arrayUnion(email),
            updatedAt: new Date()
        });

        // Update collaborator's shared repositories count
        const collaboratorUID = userSnap.docs[0].id;
        const collaboratorRef = db.collection('users').doc(collaboratorUID);
        const collaboratorSnap = await collaboratorRef.get();

        if (collaboratorSnap.exists()) {
            const currentShared = collaboratorSnap.data().repositoriesShared || 0;
            await collaboratorRef.update({
                repositoriesShared: currentShared + 1
            });
        }

        res.status(201).json({
            repositoryId: repoId,
            collaborator: email,
            message: 'Collaborator added successfully'
        });
    } catch (error) {
        console.error('Failed to add collaborator:', error);
        res.status(500).json({
            error: 'Failed to add collaborator',
            code: 'ADD_ERROR'
        });
    }
});

/**
 * DELETE /api/v1/repositories/:repoId/collaborators/:collaboratorEmail
 * Remove a collaborator from repository (owner only)
 */
router.delete('/:collaboratorEmail', async (req, res) => {
    try {
        const { repoId, collaboratorEmail } = req.params;
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
                message: 'Only repository owner can remove collaborators',
                code: 'NOT_OWNER'
            });
        }

        const repoData = repoSnap.data();

        // Check if collaborator exists
        if (!repoData.collaborators?.includes(collaboratorEmail)) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Collaborator not found in this repository',
                code: 'COLLABORATOR_NOT_FOUND'
            });
        }

        // Remove collaborator
        await repoRef.update({
            collaborators: admin.firestore.FieldValue.arrayRemove(collaboratorEmail),
            updatedAt: new Date()
        });

        // Update collaborator's shared repositories count
        const usersRef = db.collection('users');
        const userQuery = usersRef.where('email', '==', collaboratorEmail);
        const userSnap = await userQuery.get();

        if (!userSnap.empty) {
            const collaboratorUID = userSnap.docs[0].id;
            const collaboratorRef = db.collection('users').doc(collaboratorUID);
            const collaboratorData = userSnap.docs[0].data();

            const currentShared = collaboratorData.repositoriesShared || 0;
            await collaboratorRef.update({
                repositoriesShared: Math.max(0, currentShared - 1)
            });
        }

        res.json({
            repositoryId: repoId,
            collaborator: collaboratorEmail,
            message: 'Collaborator removed successfully'
        });
    } catch (error) {
        console.error('Failed to remove collaborator:', error);
        res.status(500).json({
            error: 'Failed to remove collaborator',
            code: 'REMOVE_ERROR'
        });
    }
});

export default router;
