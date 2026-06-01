import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useUpdateRepository, useDeleteRepository } from '@/hooks/use-api';
import { CollaboratorManager } from './CollaboratorManager';
import { FolderGit2, Pencil, Trash2, Users, X, Check, Loader2 } from 'lucide-react';

interface RepositoryCardProps {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  currentUserId: string;
  collaborators: string[];
}

export function RepositoryCard({
  id,
  name,
  description,
  ownerId,
  currentUserId,
  collaborators,
}: RepositoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedDescription, setEditedDescription] = useState(description);
  const [showCollaborators, setShowCollaborators] = useState(false);

  const isOwner = ownerId === currentUserId;
  const updateMutation = useUpdateRepository();
  const deleteMutation = useDeleteRepository();

  const handleSave = () => {
    updateMutation.mutate(
      { repoId: id, name: editedName, description: editedDescription },
      {
        onSuccess: () => {
          toast.success('Repository updated');
          setIsEditing(false);
        },
        onError: () => toast.error('Failed to update repository'),
      }
    );
  };

  const handleDelete = () => {
    if (!confirm('Delete this repository? This action cannot be undone.')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Repository deleted'),
      onError: () => toast.error('Failed to delete repository'),
    });
  };

  return (
    <div className="border border-zinc-200 rounded-xl bg-white hover:border-zinc-300 transition-colors">
      {isEditing ? (
        <div className="p-5 space-y-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Editing</p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700">Repository name</label>
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Repository name"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700">Description</label>
            <Input
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Repository description"
              className="h-8 text-sm"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="h-8 text-xs"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3 mr-1" />
              )}
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
              className="h-8 text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-zinc-900 truncate">{name}</h3>
                {isOwner && (
                  <span className="shrink-0 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full">
                    Owner
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed mb-4 min-h-[2rem]">
            {description || <span className="italic text-zinc-400">No description provided.</span>}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-zinc-100">
            {isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-7 text-xs"
                >
                  <Pencil className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3 mr-1" />
                  )}
                  Delete
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCollaborators(!showCollaborators)}
              className="h-7 text-xs ml-auto text-zinc-500"
            >
              <Users className="w-3 h-3 mr-1" />
              {showCollaborators ? 'Hide' : 'Collaborators'}
            </Button>
          </div>

          {showCollaborators && (
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <CollaboratorManager
                repositoryId={id}
                collaborators={collaborators}
                isOwner={isOwner}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
