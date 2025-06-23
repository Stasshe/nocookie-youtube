'use client';

import { useState, useEffect } from 'react';

interface AddressBarProps {
  currentUrl: string;
  onUrlSubmit: (url: string) => void;
  remainingTime?: number; // 残り時間（秒）
}

export default function AddressBar({ currentUrl, onUrlSubmit, remainingTime }: AddressBarProps) {
  const [url, setUrl] = useState(currentUrl);

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onUrlSubmit(url.trim());
    }
  };

  const formatRemainingTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="flex items-center bg-white border-b border-gray-300 px-4 py-1">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center">
        <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-1 border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="YouTubeのURLを入力してください"
            className="flex-1 bg-transparent outline-none text-sm text-black placeholder-gray-500"
          />
          <button
            type="submit"
            className="ml-2 text-blue-600 hover:text-blue-800"
          >
            →
          </button>
        </div>
      </form>
      {remainingTime !== undefined && remainingTime > 0 && (
        <div className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
          残り時間: {formatRemainingTime(remainingTime)}
        </div>
      )}
      {remainingTime !== undefined && remainingTime <= 0 && (
        <div className="ml-4 px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
          制限時間終了
        </div>
      )}
    </div>
  );
}
