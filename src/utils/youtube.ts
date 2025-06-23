export const extractVideoId = (url: string): string | null => {
  // NetStarなどのURLブロッキングシステムの場合、urldataパラメータから実際のURLを抽出
  if (url.includes('urldata=')) {
    try {
      const urldataMatch = url.match(/urldata=([^&]+)/);
      if (urldataMatch && urldataMatch[1]) {
        const decodedUrl = decodeURIComponent(urldataMatch[1]);
        // 再帰的に実際のYouTube URLからビデオIDを抽出
        return extractVideoId(decodedUrl);
      }
    } catch (error) {
      console.warn('URLデコードに失敗しました:', error);
    }
  }

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

export const generateNoCookieUrl = (videoId: string): string => {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`;
};

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}時間${minutes}分${secs}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${secs}秒`;
  } else {
    return `${secs}秒`;
  }
};

export const isAdminUser = (username: string): boolean => {
  return username === process.env.NEXT_PUBLIC_ADMIN_USERNAME;
};

export const isValidAdminKey = (key: string): boolean => {
  // クライアントサイドで環境変数を使用
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_ACCESS_KEY;
  return adminKey ? key === adminKey : false;
};
