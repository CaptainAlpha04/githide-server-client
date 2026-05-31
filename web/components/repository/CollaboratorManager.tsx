import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAddCollaborator, useRemoveCollaborator } from '@/hooks/use-api';
import { Plus, X, User, Loader2 } from 'lucide-react';

interface CollaboratorManagerProps {
  repositoryId: string;
  collaborators: string[];
  isOwner: boolean;
}

export function CollaboratorManager({
  repositoryId,
  collaborators,
  isOwner,
}: CollaboratorManagerProps) {
  const [email, setEmail] = useState('');
  const addMutation = useAddCollaborator();
  const removeMutation = useRemoveCollaborator();

  const handleAddCollaborator = () => {
    if (!email) return;
    addMutation.mutate(
      { repoId: repositoryId, email },
      {
        onSuccess: () => {
          toast.success('Collaborator added');
          setEmail('');
        },
        onError: (error: Error) => toast.error(error?.message || 'Failed to add collaborator'),
      }
    );
  };

  const handleRemoveCollaborator = (collaboratorEmail: string) => {
    removeMutation.mutate(
      { repoId: repositoryId, collaboratorEmail },
      {
        onSuccess: () => toast.success('Collaborator removed'),
        onError: (error: Error) => toast.error(error?.message || 'Failed to remove collaborator'),
      }
    );
  };

  if (!isOwner) return null;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="collaborator@example.com"
          className="h-8 text-xs"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCollaborator())}
        />
        <Button
          size="sm"
          onClick={handleAddCollaborator}
          disabled={addMutation.isPending || !email}
          className="h-8 text-xs shrink-0"
        >
          {addMutation.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Plus className="w-3 h-3 mr-1" />
          )}
          Add
        </Button>
      </div>

      {collaborators.length > 0 ? (
        <ul className="space-y-1">
          {collaborators.map((collab) => (
            <li
              key={collab}
              className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-zinc-50 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-2.5 h-2.5 text-zinc-500" />
                </div>
                <span className="text-xs text-zinc-700">{collab}</span>
              </div>
              <button
                onClick={() => handleRemoveCollaborator(collab)}
                disabled={removeMutation.isPending}
                className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                aria-label={`Remove ${collab}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-zinc-400 text-center py-2">No collaborators added yet</p>
      )}
    </div>
  );
}
