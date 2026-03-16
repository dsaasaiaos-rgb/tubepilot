import { Link } from 'react-router-dom';
import { Eye, ThumbsUp, ArrowRight } from 'lucide-react';

export default function VideoGrid({ videos, loading }) {
  const recent = videos.slice(0, 6);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Recent Videos</h2>
        <Link to="/Videos" className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-gray-800 rounded-xl h-40 animate-pulse" />)}
        </div>
      ) : recent.length === 0 ? (
        <div className="text-center py-12 text-gray-600 bg-gray-900 rounded-xl border border-gray-800">
          <p>No videos synced yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {recent.map(v => (
            <div key={v.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
              {v.thumbnail_url && (
                <img src={v.thumbnail_url} alt={v.title} className="w-full aspect-video object-cover" />
              )}
              <div className="p-3">
                <p className="text-sm font-medium line-clamp-2 mb-2">{v.title}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(v.view_count || 0).toLocaleString()}</span>
                  <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{(v.like_count || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}