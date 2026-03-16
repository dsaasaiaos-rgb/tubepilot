import { useState } from 'react';
import { Youtube, Key, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ConnectYouTube({ onTokenSaved }) {
  const [token, setToken] = useState('');
  const [open, setOpen] = useState(false);

  function handleSave() {
    if (!token.trim()) return;
    onTokenSaved(token.trim());
    setOpen(false);
  }

  return (
    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-red-600/20 rounded-lg">
            <Youtube className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-1">Connect Your YouTube Channel</h3>
            <p className="text-sm text-gray-400">
              Add a YouTube OAuth access token to sync videos and push changes directly to YouTube.
              Get one from <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline inline-flex items-center gap-0.5">Google OAuth Playground <ExternalLink className="w-3 h-3" /></a> with the <code className="text-xs bg-gray-800 px-1 py-0.5 rounded">youtube.force-ssl</code> scope.
            </p>
          </div>
        </div>
        <Button onClick={() => setOpen(!open)} size="sm" className="bg-red-600 hover:bg-red-700 text-white shrink-0">
          <Key className="w-3.5 h-3.5 mr-1.5" /> Add Token
        </Button>
      </div>
      {open && (
        <div className="mt-4 flex gap-2">
          <Input
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Paste your YouTube OAuth access token..."
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 flex-1"
          />
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">Save</Button>
        </div>
      )}
    </div>
  );
}