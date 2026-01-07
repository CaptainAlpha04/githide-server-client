import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface CreateRepositoryFormProps {
  userId: string;
  onSuccess: () => void;
}

export function CreateRepositoryForm({ userId, onSuccess }: CreateRepositoryFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await addDoc(collection(db, 'repositories'), {
        name,
        description,
        ownerId: userId,
        createdAt: new Date().toISOString(),
        collaborators: [],
      });
      toast.success('Repository created successfully');
      setName('');
      setDescription('');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create repository');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Repository name"
          required
        />
      </div>
      <div className="space-y-2">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Repository description"
          required
        />
      </div>
      <Button type="submit" disabled={isCreating}>
        {isCreating ? 'Creating...' : 'Create Repository'}
      </Button>
    </form>
  );
} 