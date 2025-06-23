const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_COMMENT_API_KEY;
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeComment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
}

export const extractVideoIdFromUrl = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube-nocookie\.com\/embed\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

export const fetchYouTubeComments = async (videoUrl: string): Promise<YouTubeComment[]> => {
  if (!YOUTUBE_API_KEY) {
    console.error('YouTube API key is not configured');
    return [];
  }

  const videoId = extractVideoIdFromUrl(videoUrl);
  if (!videoId) {
    console.error('Invalid YouTube URL:', videoUrl);
    return [];
  }

  try {
    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/commentThreads?part=snippet&videoId=${videoId}&order=relevance&maxResults=20&key=${YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items) {
      return [];
    }

    return data.items.map((item: any) => ({
      id: item.id,
      authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
      authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
      textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt
    }));
  } catch (error) {
    console.error('Error fetching YouTube comments:', error);
    return [];
  }
};
