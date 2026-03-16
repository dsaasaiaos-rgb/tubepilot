import { Eye, ThumbsUp, Video, GitCommit } from 'lucide-react';

export default function StatsRow({ videos, changes, totalViews, totalLikes }) {
  const stats = [
    { label: 'Total Videos', value: videos.length, icon: Video, color: 'text-red-400', bg: 'bg-red-500/10' },
    { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: ThumbsUp, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Changes Made', value: changes.length, icon: GitCommit, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => (
        <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-400 text-sm">{s.label}</p>
            <div className={`p-2 rounded-lg ${s.bg}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}