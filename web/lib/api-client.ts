/**
 * API Client for GitHide Server
 * Handles all HTTP requests to the backend with Firebase token authentication
 */
import { auth } from '@/lib/firebase';

export interface Repository {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  collaborators: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * Get Firebase ID token from auth
 */
export const getAuthToken = async () => {
    if (!auth.currentUser) {
        throw new Error('User not authenticated');
    }
    return auth.currentUser.getIdToken();
};

/**
 * Make authenticated API request
 */
const apiRequest = async (
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
) => {
    try {
        const token = await getAuthToken();

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            const message = body.message || body.error || `Request failed (${response.status})`;
            const err = new Error(message) as Error & { status: number; code?: string };
            err.status = response.status;
            err.code = body.code;
            throw err;
        }

        return response.json();
    } catch (error) {
        throw error;
    }
};

/**
 * Repository API endpoints
 */
export const repositoryAPI = {
    /**
     * Get all repositories (owned + collaborated)
     */
    getAll: (): Promise<{ repositories: Repository[] }> => apiRequest('/repositories'),

    /**
     * Get specific repository
     */
    getById: (repoId: string) => apiRequest(`/repositories/${repoId}`),

    /**
     * Create new repository
     */
    create: (name: string, description: string) =>
        apiRequest('/repositories', 'POST', { name, description }),

    /**
     * Update repository
     */
    update: (repoId: string, name?: string, description?: string) =>
        apiRequest(`/repositories/${repoId}`, 'PATCH', { name, description }),

    /**
     * Delete repository
     */
    delete: (repoId: string) => apiRequest(`/repositories/${repoId}`, 'DELETE')
};

/**
 * Collaborator API endpoints
 */
export const collaboratorAPI = {
    /**
     * Get all collaborators for a repository
     */
    getAll: (repoId: string) =>
        apiRequest(`/repositories/${repoId}/collaborators`),

    /**
     * Add collaborator to repository
     */
    add: (repoId: string, email: string) =>
        apiRequest(`/repositories/${repoId}/collaborators`, 'POST', { email }),

    /**
     * Remove collaborator from repository
     */
    remove: (repoId: string, collaboratorEmail: string) =>
        apiRequest(
            `/repositories/${repoId}/collaborators/${encodeURIComponent(collaboratorEmail)}`,
            'DELETE'
        )
};
