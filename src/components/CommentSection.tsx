'use client';

import { useState, useEffect } from 'react';
import { YouTubeComment, fetchYouTubeComments, formatTimeAgo } from '@/utils/commentApi';
import { extractVideoId } from '@/utils/youtube';

interface CommentSectionProps {
  videoUrl: string;
  isVisible: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export default function CommentSection({ videoUrl, isVisible, isFullscreen = false, onToggleFullscreen }: CommentSectionProps) {
  const [comments, setComments] = useState<YouTubeComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComments = async () => {
    if (!videoUrl) return;
    
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('有効なYouTube URLではありません');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const fetchedComments = await fetchYouTubeComments(videoId);
      setComments(fetchedComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'コメントの取得に失敗しました');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible && videoUrl) {
      loadComments();
    }
  }, [isVisible, videoUrl]);

  if (!isVisible) return null;

  return (
    <div className={`bg-white border-t border-gray-200 ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className={`${isFullscreen ? 'h-full flex flex-col' : ''} max-w-4xl mx-auto p-4 ${isFullscreen ? 'max-w-none p-6' : ''}`}>
        <div className={`flex items-center justify-between mb-6 ${isFullscreen ? 'border-b border-gray-200 pb-4' : ''}`}>
          <h3 className={`font-semibold text-gray-900 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
            コメント ({comments.length})
          </h3>
          <div className="flex items-center space-x-2">
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors flex items-center space-x-1 font-medium shadow-sm"
                title={isFullscreen ? '元のサイズに戻す' : '全画面表示'}
              >
                {isFullscreen ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>閉じる</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                    <span>全画面</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {!loading && !error && comments.length === 0 && (
          <div className={`text-center py-8 text-gray-500 ${isFullscreen ? 'py-16' : ''}`}>
            <div className={`${isFullscreen ? 'text-lg' : 'text-base'}`}>
              コメントが見つかりませんでした
            </div>
          </div>
        )}

        <div className={`space-y-4 ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}>
          {comments.map((comment) => (
            <div key={comment.id} className={`flex space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors ${isFullscreen ? 'p-4 hover:bg-gray-100' : ''}`}>
              <div className="flex-shrink-0">
                <img
                  src={comment.authorProfileImageUrl}
                  alt={comment.authorDisplayName}
                  className={`rounded-full ${isFullscreen ? 'w-12 h-12' : 'w-10 h-10'}`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMjQiIGN5PSIxOCIgcj0iOCIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTIgMzhDMTIgMzAuOCAxNy44IDI1IDI1IDI1SDIzQzMwLjIgMjUgMzYgMzAuOCAzNiAzOFY0MkMzNiA0My4xIDM1LjEgNDQgMzQgNDRIMTRDMTIuOSA0NCAxMiA0My4xIDEyIDQyVjM4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <a
                    href={comment.authorChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {comment.authorDisplayName}
                  </a>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(comment.publishedAt)}
                  </span>
                </div>
                <div 
                  className={`text-gray-700 leading-relaxed ${isFullscreen ? 'text-base' : 'text-sm'}`}
                  dangerouslySetInnerHTML={{
                    __html: comment.textDisplay
                      .replace(/\n/g, '<br>')
                      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
                  }}
                />
                {comment.likeCount > 0 && (
                  <div className="flex items-center mt-2">
                    <svg className="w-4 h-4 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                    </svg>
                    <span className="text-xs text-gray-500">{comment.likeCount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
