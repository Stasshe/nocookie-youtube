export interface YouTubeComment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  authorChannelUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
  updatedAt: string;
}

export interface YouTubeCommentResponse {
  items: {
    id: string;
    snippet: {
      topLevelComment: {
        id: string;
        snippet: {
          authorDisplayName: string;
          authorProfileImageUrl: string;
          authorChannelUrl: string;
          textDisplay: string;
          likeCount: number;
          publishedAt: string;
          updatedAt: string;
        };
      };
    };
  }[];
  nextPageToken?: string;
}

export const fetchYouTubeComments = async (videoId: string): Promise<YouTubeComment[]> => {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_COMMENT_API_KEY;
  
  if (!apiKey) {
    throw new Error('YouTube API key is not configured');
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&order=relevance&maxResults=20&key=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 403) {
        const errorData = await response.json();
        if (errorData.error?.errors?.[0]?.reason === 'commentsDisabled') {
          throw new Error('この動画はコメントが無効になっています');
        }
        alert('API制限に達しました。しばらく待ってから再試行してください。');
        throw new Error('API制限に達しました。しばらく待ってから再試行してください。');
      }
      throw new Error(`API error: ${response.status}`);
    }

    const data: YouTubeCommentResponse = await response.json();
    
    return data.items.map(item => ({
      id: item.snippet.topLevelComment.id,
      authorDisplayName: item.snippet.topLevelComment.snippet.authorDisplayName,
      authorProfileImageUrl: item.snippet.topLevelComment.snippet.authorProfileImageUrl,
      authorChannelUrl: item.snippet.topLevelComment.snippet.authorChannelUrl,
      textDisplay: item.snippet.topLevelComment.snippet.textDisplay,
      likeCount: item.snippet.topLevelComment.snippet.likeCount,
      publishedAt: item.snippet.topLevelComment.snippet.publishedAt,
      updatedAt: item.snippet.topLevelComment.snippet.updatedAt,
    }));
  } catch (error) {
    console.error('Error fetching YouTube comments:', error);
    throw error;
  }
};

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}秒前`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}日前`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}ヶ月前`;
  return `${Math.floor(diffInSeconds / 31536000)}年前`;
};
