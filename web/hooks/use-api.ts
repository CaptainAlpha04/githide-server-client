/**
 * Custom React hooks for API operations using React Query
 * Handles loading, error, and success states with automatic caching and refetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { repositoryAPI, collaboratorAPI } from '@/lib/api-client';
import { toast } from 'sonner';

const QUERY_KEYS = {
    repositories: ['repositories'],
    repository: (id: string) => ['repositories', id],
    collaborators: (repoId: string) => ['collaborators', repoId]
};

/**
 * Hook for fetching all repositories
 */
export const useRepositories = () => {
    return useQuery({
        queryKey: QUERY_KEYS.repositories,
        queryFn: async () => {
            const data = await repositoryAPI.getAll();
            return data.repositories || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 2
    });
};

/**
 * Hook for fetching a specific repository
 */
export const useRepository = (repoId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.repository(repoId),
        queryFn: () => repositoryAPI.getById(repoId),
        enabled: !!repoId,
        staleTime: 1000 * 60 * 5,
        retry: 2
    });
};

/**
 * Hook for creating a repository
 */
export const useCreateRepository = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ name, description }: { name: string; description: string }) =>
            repositoryAPI.create(name, description),
        onSuccess: () => {
            toast.success('Repository created successfully');
            // Invalidate and refetch repositories
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
        },
        onError: (error: any) => {
            const message = error.message || 'Failed to create repository';
            toast.error(message);
        }
    });
};

/**
 * Hook for updating a repository
 */
export const useUpdateRepository = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            repoId,
            name,
            description
        }: {
            repoId: string;
            name?: string;
            description?: string;
        }) => repositoryAPI.update(repoId, name, description),
        onSuccess: (data: any) => {
            toast.success('Repository updated successfully');
            // Update both the general repositories list and specific repository
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
            if (data?.id) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repository(data.id) });
            }
        },
        onError: (error: any) => {
            const message = error.message || 'Failed to update repository';
            toast.error(message);
        }
    });
};

/**
 * Hook for deleting a repository
 */
export const useDeleteRepository = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (repoId: string) => repositoryAPI.delete(repoId),
        onSuccess: (data: any) => {
            toast.success('Repository deleted successfully');
            // Remove from cache and refetch list
            if (data?.id) {
                queryClient.removeQueries({ queryKey: QUERY_KEYS.repository(data.id) });
            }
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
        },
        onError: (error: any) => {
            const message = error.message || 'Failed to delete repository';
            toast.error(message);
        }
    });
};

/**
 * Hook for fetching collaborators
 */
export const useCollaborators = (repoId: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.collaborators(repoId),
        queryFn: () => collaboratorAPI.getAll(repoId),
        enabled: !!repoId,
        staleTime: 1000 * 60 * 5,
        retry: 2
    });
};

/**
 * Hook for adding a collaborator
 */
export const useAddCollaborator = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ repoId, email }: { repoId: string; email: string }) =>
            collaboratorAPI.add(repoId, email),
        onSuccess: (data: any) => {
            toast.success('Collaborator added successfully');
            // Invalidate collaborators and repositories
            if (data?.repositoryId) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collaborators(data.repositoryId) });
            }
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
        },
        onError: (error: any) => {
            const message = error.message || error.error || 'Failed to add collaborator';
            toast.error(message);
        }
    });
};

/**
 * Hook for removing a collaborator
 */
export const useRemoveCollaborator = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ repoId, collaboratorEmail }: { repoId: string; collaboratorEmail: string }) =>
            collaboratorAPI.remove(repoId, collaboratorEmail),
        onSuccess: (data: any) => {
            toast.success('Collaborator removed successfully');
            // Invalidate collaborators and repositories
            if (data?.repositoryId) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.collaborators(data.repositoryId) });
            }
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repositories });
        },
        onError: (error: any) => {
            const message = error.message || 'Failed to remove collaborator';
            toast.error(message);
        }
    });
};
