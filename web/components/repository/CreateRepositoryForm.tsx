import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateRepository } from '@/hooks/use-api';
import { Loader2 } from 'lucide-react';

interface CreateRepositoryFormProps {
  onSuccess?: () => void;
}

export function CreateRepositoryForm({ onSuccess }: CreateRepositoryFormProps) {
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
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="repo-name">
            Repository name <span className="text-red-500">*</span>
          </label>
          <Input
            id="repo-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-project"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-zinc-700" htmlFor="repo-desc">
            Description
          </label>
          <Input
            id="repo-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
          />
        </div>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          'Create Repository'
        )}
      </Button>
    </form>
  );
}
