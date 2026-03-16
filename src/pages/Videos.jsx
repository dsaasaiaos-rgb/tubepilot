import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Youtube, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import VideoCard from '@/components/videos/VideoCard';
import EditVideoModal from '@/components/videos/EditVideoModal';

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [accessToken] = useState(localStorage.getItem('yt_access_token') || '');

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(videos.filter(v => v.title?.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q)));
  }, [search, videos]);

  async function fetchVideos() {
    setLoading(true);
    const vids = await base44.entities.Video.list('-published_at', 100);
    setVideos(vids);
    setFiltered(vids);
    setLoading(false);
  }

  async function handleSave(video, updatedData) {
    // Update in DB
    await base44.entities.Video.update(video.id, updatedData);

    // Log changes
    const fields = ['title', 'description', 'tags'];
    for (const field of fields) {
      const oldVal = field === 'tags' ? JSON.stringify(video[field]) : video[field];
      const newVal = field === 'tags' ? JSON.stringify(updatedData[field]) : updatedData[field];
      if (oldVal !== newVal) {
        await base44.entities.VideoChange.create({
          video_id: video.id,
          youtube_id: video.youtube_id,
          video_title: updatedData.title,
          change_type: field,
          old_value: oldVal || '',
          new_value: newVal || '',
          applied_by: 'manual',
          applied_at: new Date().toISOString(),
          status: 'applied'
        });
      }
    }

    // Push to YouTube if token available
    if (accessToken) {
      await base44.functions.invoke('updateYouTubeVideo', {
        accessToken,
        videoId: video.youtube_id,
        title: updatedData.title,
        description: updatedData.description,
        tags: updatedData.tags
      });
    }

    setEditing(null);
    fetchVideos();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">TubeAgent</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/Dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link to="/Videos" className="text-white font-medium">Videos</Link>
            <Link to="/Agent" className="hover:text-white transition-colors">AI Agent</Link>
            <Link to="/Changes" className="hover:text-white transition-colors">Change Log</Link>
          </nav>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Your Videos</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="pl-9 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <Youtube className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No videos found. Sync your YouTube channel from the Dashboard.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(v => (
              <VideoCard key={v.id} video={v} onEdit={() => setEditing(v)} />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditVideoModal
          video={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          accessToken={accessToken}
        />
      )}
    </div>
  );
}