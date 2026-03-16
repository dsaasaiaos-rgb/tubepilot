import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Youtube, History, Bot, User, Tag, Type, AlignLeft, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const CHANGE_ICONS = {
  title: Type,
  description: AlignLeft,
  tags: Tag,
  status: User,
  scheduled: Calendar
};

const CHANGE_COLORS = {
  title: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  description: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  tags: 'bg-green-500/10 text-green-400 border-green-500/20',
  status: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  scheduled: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
};

export default function Changes() {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchChanges();
  }, []);

  async function fetchChanges() {
    setLoading(true);
    const data = await base44.entities.VideoChange.list('-applied_at', 100);
    setChanges(data);
    setLoading(false);
  }

  const filtered = filter === 'all' ? changes : changes.filter(c => c.applied_by === filter);

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
            <Link to="/Videos" className="hover:text-white transition-colors">Videos</Link>
            <Link to="/Agent" className="hover:text-white transition-colors">AI Agent</Link>
            <Link to="/Changes" className="text-white font-medium">Change Log</Link>
          </nav>
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-red-400" />
            <h1 className="text-2xl font-bold">Change Log</h1>
          </div>
          <div className="flex gap-2">
            {['all', 'agent', 'manual'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm capitalize transition-colors ${
                  filter === f ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Changes' : f === 'agent' ? '🤖 Agent' : '✋ Manual'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl h-24 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No changes logged yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(change => {
              const Icon = CHANGE_ICONS[change.change_type] || Type;
              return (
                <div key={change.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg border ${CHANGE_COLORS[change.change_type] || 'bg-gray-700 text-gray-400 border-gray-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{change.video_title || change.youtube_id}</span>
                          <Badge variant="outline" className="text-xs capitalize shrink-0 border-gray-700 text-gray-400">
                            {change.change_type}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Before</p>
                            <p className="text-sm text-gray-400 bg-gray-800 rounded-lg px-3 py-2 line-clamp-2 break-words">
                              {change.old_value || '(empty)'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">After</p>
                            <p className="text-sm text-gray-200 bg-gray-800 rounded-lg px-3 py-2 line-clamp-2 break-words">
                              {change.new_value || '(empty)'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        {change.applied_by === 'agent' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        <span className="capitalize">{change.applied_by}</span>
                      </div>
                      {change.applied_at && (
                        <p className="text-xs text-gray-600">
                          {format(new Date(change.applied_at), 'MMM d, h:mm a')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}