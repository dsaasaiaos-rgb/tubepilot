import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Youtube, RefreshCw, Video, TrendingUp, Edit3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatsRow from '@/components/dashboard/StatsRow';
import RecentChanges from '@/components/dashboard/RecentChanges';
import VideoGrid from '@/components/dashboard/VideoGrid';
import ConnectYouTube from '@/components/ConnectYouTube';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('yt_access_token') || '');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [vids, chngs] = await Promise.all([
      base44.entities.Video.list('-published_at', 50),
      base44.entities.VideoChange.list('-applied_at', 20)
    ]);
    setVideos(vids);
    setChanges(chngs);
    setLoading(false);
  }

  async function handleSync() {
    if (!accessToken) return;
    setSyncing(true);
    try {
      const res = await base44.functions.invoke('syncYouTube', { accessToken });
      await fetchData();
      alert(`Synced ${res.data.synced} videos!`);
    } catch (e) {
      alert('Sync failed: ' + e.message);
    }
    setSyncing(false);
  }

  function handleTokenSaved(token) {
    setAccessToken(token);
    localStorage.setItem('yt_access_token', token);
  }

  const totalViews = videos.reduce((s, v) => s + (v.view_count || 0), 0);
  const totalLikes = videos.reduce((s, v) => s + (v.like_count || 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
              <Youtube className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">TubeAgent</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-400">
            <Link to="/Dashboard" className="text-white font-medium">Dashboard</Link>
            <Link to="/Videos" className="hover:text-white transition-colors">Videos</Link>
            <Link to="/Agent" className="hover:text-white transition-colors">AI Agent</Link>
            <Link to="/Changes" className="hover:text-white transition-colors">Change Log</Link>
          </nav>
          <Button
            onClick={handleSync}
            disabled={syncing || !accessToken}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync YouTube'}
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {!accessToken && <ConnectYouTube onTokenSaved={handleTokenSaved} />}

        <StatsRow videos={videos} changes={changes} totalViews={totalViews} totalLikes={totalLikes} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <VideoGrid videos={videos} loading={loading} />
          </div>
          <div>
            <RecentChanges changes={changes} videos={videos} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}