import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useUpdateRepository, useDeleteRepository, useRepoFiles } from '@/hooks/use-api';
import { CollaboratorManager } from './CollaboratorManager';

interface RepositoryCardProps {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  currentUserId: string;
  collaborators: string[];
}

function decodeFilename(base64Name: string): string {
  try {
    return atob(base64Name);
  } catch {
    return base64Name;
  }
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
  const [showFiles, setShowFiles] = useState(false);
  const [copied, setCopied] = useState(false);

  const isOwner = ownerId === currentUserId;

  const updateMutation = useUpdateRepository();
  const deleteMutation = useDeleteRepository();

  // Only fetch files when the panel is open
  const { data: filesData, isLoading: filesLoading, error: filesError, refetch: refetchFiles } =
    useRepoFiles(showFiles ? id : '');

  const handleSave = () => {
    updateMutation.mutate(
      { repoId: id, name: editedName, description: editedDescription },
      {
        onSuccess: () => { toast.success('Repository updated successfully'); setIsEditing(false); },
        onError: () => { toast.error('Failed to update repository'); },
      }
    );
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this repository?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => { toast.success('Repository deleted successfully'); },
      onError: () => { toast.error('Failed to delete repository'); },
    });
  };

  const cliCommand = `githide config set repo_id ${id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </>
      ) : (
        <>
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-500">{description || 'No description'}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowCollaborators(!showCollaborators)}>
              {showCollaborators ? 'Hide Collaborators' : 'Manage Collaborators'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowFiles(!showFiles);
                if (!showFiles) refetchFiles();
              }}
            >
              {showFiles ? 'Hide Files' : 'View Files'}
            </Button>
          </div>

          {/* Collaborators panel */}
          {showCollaborators && (
            <div className="mt-4 pt-4 border-t">
              <CollaboratorManager
                repositoryId={id}
                collaborators={collaborators}
                isOwner={isOwner}
              />
            </div>
          )}

          {/* Files panel */}
          {showFiles && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-700">Synced Env Files</h4>
                <button
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => refetchFiles()}
                >
                  ↻ Refresh
                </button>
              </div>

              {/* CLI link hint */}
              <div className="bg-gray-50 rounded-md p-3 space-y-1">
                <p className="text-xs text-gray-500">
                  Run this in your project to link it to this repository:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 overflow-x-auto whitespace-nowrap">
                    {cliCommand}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="text-xs text-blue-500 hover:text-blue-700 shrink-0"
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* File list */}
              {filesLoading && (
                <p className="text-sm text-gray-400 text-center py-3">Loading files...</p>
              )}

              {filesError && (
                <p className="text-sm text-red-500 text-center py-3">
                  Could not reach file server. Make sure it&apos;s running on port 8000.
                </p>
              )}

              {!filesLoading && !filesError && filesData && (
                filesData.files.length === 0 ? (
                  <div className="text-center py-4 space-y-1">
                    <p className="text-sm text-gray-400">No files synced yet.</p>
                    <p className="text-xs text-gray-400">
                      Run <code className="bg-gray-100 px-1 rounded">githide sync</code> after linking this repo.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 rounded-md border overflow-hidden">
                    {filesData.files.map((f) => (
                      <li key={f} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Lock icon */}
                          <span className="text-gray-400 shrink-0">🔒</span>
                          <span className="text-sm font-mono text-gray-700 truncate" title={decodeFilename(f)}>
                            {decodeFilename(f)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">encrypted</span>
                      </li>
                    ))}
                  </ul>
                )
              )}

              <p className="text-xs text-gray-400">
                {filesData?.total ?? 0} file{(filesData?.total ?? 0) !== 1 ? 's' : ''} synced
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}