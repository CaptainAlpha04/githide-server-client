import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateRepository } from '@/hooks/use-api';

export function CreateRepositoryForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { mutate: create, isPending } = useCreateRepository();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    create(
      { name, description },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
        }
      }
    );
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
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Repository'}
      </Button>
    </form>
  );
} 