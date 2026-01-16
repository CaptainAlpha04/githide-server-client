import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAddCollaborator, useRemoveCollaborator } from '@/hooks/use-api';

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
      { repoId: repositoryId, email: email },
      {
        onSuccess: () => {
          toast.success('Collaborator added successfully');
          setEmail('');
        },
        onError: () => {
          toast.error('Failed to add collaborator');
        },
      }
    );
  };

  const handleRemoveCollaborator = (collaboratorEmail: string) => {
    removeMutation.mutate(
      { repoId: repositoryId, collaboratorEmail },
      {
        onSuccess: () => {
          toast.success('Collaborator removed successfully');
        },
        onError: () => {
          toast.error('Failed to remove collaborator');
        },
      }
    );
  };

  if (!isOwner) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Collaborator email"
        />
        <Button
          onClick={handleAddCollaborator}
          disabled={addMutation.isPending || !email}
        >
          {addMutation.isPending ? 'Adding...' : 'Add'}
        </Button>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Current Collaborators</h4>
        {collaborators.length === 0 ? (
          <p className="text-sm text-gray-500">No collaborators yet</p>
        ) : (
          <ul className="space-y-2">
            {collaborators.map((email) => (
              <li key={email} className="flex items-center justify-between">
                <span className="text-sm">{email}</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveCollaborator(email)}
                  disabled={removeMutation.isPending}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 