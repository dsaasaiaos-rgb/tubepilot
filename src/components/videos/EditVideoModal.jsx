import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Sparkles, Loader2, Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function EditVideoModal({ video, onClose, onSave }) {
  const [title, setTitle] = useState(video.title || '');
  const [description, setDescription] = useState(video.description || '');
  const [tags, setTags] = useState(video.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleOptimize() {
    setOptimizing(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a YouTube SEO expert. Optimize this video's metadata for maximum search visibility and click-through rate.

Current title: ${title}
Current description: ${description}
Current tags: ${tags.join(', ')}

Return a JSON object with:
- title: string (optimized title, max 70 chars, compelling and keyword-rich)
- description: string (optimized description, 300-500 words, includes keywords naturally, starts with a hook)
- tags: array of 12-15 strings (mix of broad and specific keywords, no #)`,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    });
    if (res.title) setTitle(res.title);
    if (res.description) setDescription(res.description);
    if (res.tags) setTags(res.tags);
    setOptimizing(false);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(video, { title, description, tags });
    setSaving(false);
  }

  function addTag() {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  function removeTag(tag) {
    setTags(tags.filter(t => t !== tag));
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="font-bold text-lg text-white">Edit & Optimize Video</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOptimize}
              disabled={optimizing}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {optimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {optimizing ? 'Optimizing...' : 'AI Optimize'}
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {video.thumbnail_url && (
            <img src={video.thumbnail_url} alt={video.title} className="w-full aspect-video object-cover rounded-xl" />
          )}

          <div>
            <Label className="text-gray-300 mb-2 block">Title <span className="text-gray-500 text-xs">({title.length}/70)</span></Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={100}
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={8}
              className="bg-gray-800 border-gray-700 text-white resize-none"
            />
          </div>

          <div>
            <Label className="text-gray-300 mb-2 block">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 bg-gray-800 text-gray-300 text-xs px-2.5 py-1 rounded-full">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-white ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="Add tag and press Enter"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
              <Button onClick={addTag} size="sm" variant="outline" className="border-gray-700 text-gray-300">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-800">
          <Button onClick={onClose} variant="outline" className="border-gray-700 text-gray-300">Cancel</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}