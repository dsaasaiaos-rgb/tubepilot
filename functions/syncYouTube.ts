import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await req.json();
    if (!accessToken) return Response.json({ error: 'accessToken required' }, { status: 400 });

    // Fetch videos from YouTube Data API
    const channelRes = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const channelData = await channelRes.json();

    if (!channelData.items?.length) {
      return Response.json({ error: 'No channel found', details: channelData }, { status: 400 });
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Fetch playlist items
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const playlistData = await playlistRes.json();
    const videoIds = playlistData.items?.map(i => i.contentDetails.videoId).join(',');

    if (!videoIds) return Response.json({ synced: 0 });

    // Fetch full video details
    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,status&id=${videoIds}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const videosData = await videosRes.json();

    const now = new Date().toISOString();
    let synced = 0;

    for (const item of videosData.items || []) {
      const snippet = item.snippet;
      const stats = item.statistics;
      const existing = await base44.entities.Video.filter({ youtube_id: item.id });

      const videoData = {
        youtube_id: item.id,
        title: snippet.title,
        description: snippet.description,
        tags: snippet.tags || [],
        thumbnail_url: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
        published_at: snippet.publishedAt,
        status: item.status?.privacyStatus || 'public',
        view_count: parseInt(stats?.viewCount || 0),
        like_count: parseInt(stats?.likeCount || 0),
        comment_count: parseInt(stats?.commentCount || 0),
        duration: item.contentDetails?.duration,
        channel_id: snippet.channelId,
        last_synced_at: now
      };

      if (existing.length > 0) {
        await base44.entities.Video.update(existing[0].id, videoData);
      } else {
        await base44.entities.Video.create(videoData);
      }
      synced++;
    }

    return Response.json({ synced, total: videosData.items?.length || 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});