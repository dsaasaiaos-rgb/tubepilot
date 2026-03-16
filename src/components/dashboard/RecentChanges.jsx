import { Link } from 'react-router-dom';
import { Bot, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function RecentChanges({ changes, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Recent Changes</h2>
        <Link to="/Changes" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-3 bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-2 bg-gray-800 rounded w-1/2" />
            </div>
          ))
        ) : changes.length === 0 ? (
          <div className="p-8 text-center text-gray-600 text-sm">No changes yet.</div>
        ) : (
          changes.slice(0, 8).map(c => (
            <div key={c.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.video_title || c.youtube_id}</p>
                  <p className="text-xs text-gray-500 mt-0.5 capitalize">{c.change_type} updated</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 shrink-0">
                  {c.applied_by === 'agent' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                  {c.applied_at && format(new Date(c.applied_at), 'MMM d')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}