import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

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
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleAddCollaborator = async () => {
    if (!email) return;
    setIsAdding(true);

    try {
      await updateDoc(doc(db, 'repositories', repositoryId), {
        collaborators: arrayUnion(email),
      });
      toast.success('Collaborator added successfully');
      setEmail('');
    } catch (error) {
      toast.error('Failed to add collaborator');
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorEmail: string) => {
    setIsRemoving(true);

    try {
      await updateDoc(doc(db, 'repositories', repositoryId), {
        collaborators: arrayRemove(collaboratorEmail),
      });
      toast.success('Collaborator removed successfully');
    } catch (error) {
      toast.error('Failed to remove collaborator');
      console.error(error);
    } finally {
      setIsRemoving(false);
    }
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
          disabled={isAdding || !email}
        >
          {isAdding ? 'Adding...' : 'Add'}
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
                  disabled={isRemoving}
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