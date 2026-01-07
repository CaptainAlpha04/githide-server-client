import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { CollaboratorManager } from './CollaboratorManager';

interface RepositoryCardProps {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  currentUserId: string;
  collaborators: string[];
  onDelete: () => void;
}

export function RepositoryCard({
  id,
  name,
  description,
  ownerId,
  currentUserId,
  collaborators,
  onDelete,
}: RepositoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedDescription, setEditedDescription] = useState(description);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);

  const isOwner = ownerId === currentUserId;

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'repositories', id), {
        name: editedName,
        description: editedDescription,
      });
      toast.success('Repository updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update repository');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this repository?')) return;
    
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'repositories', id));
      toast.success('Repository deleted successfully');
      onDelete();
    } catch (error) {
      toast.error('Failed to delete repository');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {isEditing ? (
        <>
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            placeholder="Repository name"
          />
          <Input
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder="Repository description"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => setShowCollaborators(!showCollaborators)}
            >
              {showCollaborators ? 'Hide Collaborators' : 'Manage Collaborators'}
            </Button>
          </div>
          {showCollaborators && (
            <div className="mt-4 pt-4 border-t">
              <CollaboratorManager
                repositoryId={id}
                collaborators={collaborators}
                isOwner={isOwner}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 