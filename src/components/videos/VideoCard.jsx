import { Eye, ThumbsUp, MessageCircle, Edit3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS = {
  public: 'bg-green-500/10 text-green-400 border-green-500/20',
  private: 'bg-red-500/10 text-red-400 border-red-500/20',
  unlisted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

export default function VideoCard({ video, onEdit }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors group">
      <div className="relative">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="w-full aspect-video object-cover" />
        ) : (
          <div className="w-full aspect-video bg-gray-800 flex items-center justify-center text-gray-600">No thumbnail</div>
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[video.status] || STATUS_COLORS.public}`}>
            {video.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-sm line-clamp-2 mb-3 leading-snug">{video.title}</h3>
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{(video.view_count || 0).toLocaleString()}</span>
          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{(video.like_count || 0).toLocaleString()}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{(video.comment_count || 0).toLocaleString()}</span>
        </div>
        {video.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {video.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">#{tag}</span>
            ))}
            {video.tags.length > 3 && <span className="text-xs text-gray-600">+{video.tags.length - 3}</span>}
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={onEdit} size="sm" className="flex-1 bg-gray-800 hover:bg-gray-700 text-white gap-1.5 text-xs">
            <Edit3 className="w-3 h-3" /> Edit & Optimize
          </Button>
          <a
            href={`https://youtube.com/watch?v=${video.youtube_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="border-gray-700 text-gray-400 hover:text-white px-2">
              <ExternalLink className="w-3 h-3" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}