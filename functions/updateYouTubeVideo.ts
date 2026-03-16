import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken, videoId, title, description, tags } = await req.json();
    if (!accessToken || !videoId) {
      return Response.json({ error: 'accessToken and videoId required' }, { status: 400 });
    }

    const body = {
      id: videoId,
      snippet: {
        title,
        description,
        tags: tags || [],
        categoryId: '22' // People & Blogs default
      }
    };

    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/videos?part=snippet',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: 'YouTube API error', details: data }, { status: res.status });
    }

    return Response.json({ success: true, video: data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});