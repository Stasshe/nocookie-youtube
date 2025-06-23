'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminUser, isValidAdminKey } from '@/utils/youtube';
import AdminDashboard from '@/components/AdminDashboard';
import UsernameModal from '@/components/UsernameModal';

export default function AdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [keyAuthTimeout, setKeyAuthTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('youtube-username');
    const keyVerified = localStorage.getItem('admin-key-verified');
    const keyTimestamp = localStorage.getItem('admin-key-timestamp');
    
    if (savedUsername) {
      setUsername(savedUsername);
      setIsModalOpen(false);
      
      const isAdmin = isAdminUser(savedUsername);
      
      // キー認証の期限チェック（30分）
      let isKeyValid = false;
      if (keyVerified === 'true' && keyTimestamp) {
        const timestamp = parseInt(keyTimestamp);
        const now = Date.now();
        const thirtyMinutes = 30 * 60 * 1000;
        
        if (now - timestamp < thirtyMinutes) {
          isKeyValid = true;
          
          // 残り時間でタイムアウトを設定
          const remainingTime = thirtyMinutes - (now - timestamp);
          const timeout = setTimeout(() => {
            localStorage.removeItem('admin-key-verified');
            localStorage.removeItem('admin-key-timestamp');
            setIsAuthorized(false);
            setShowKeyInput(true);
            alert('セッションが期限切れになりました。再度アクセスキーを入力してください。');
          }, remainingTime);
          
          setKeyAuthTimeout(timeout);
        } else {
          // 期限切れの場合はクリア
          localStorage.removeItem('admin-key-verified');
          localStorage.removeItem('admin-key-timestamp');
        }
      }
      
      if (isAdmin || isKeyValid) {
        setIsAuthorized(true);
      } else {
        setShowKeyInput(true);
      }
    }

    // ページ遷移時にキー認証をクリアするためのイベントリスナー
    const handleBeforeUnload = () => {
      localStorage.removeItem('admin-key-verified');
      localStorage.removeItem('admin-key-timestamp');
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        localStorage.removeItem('admin-key-verified');
        localStorage.removeItem('admin-key-timestamp');
      }
    };

    // ページ離脱時とタブ切り替え時にキー認証をクリア
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // コンポーネントアンマウント時にタイムアウトをクリア
      if (keyAuthTimeout) {
        clearTimeout(keyAuthTimeout);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUsernameSubmit = (inputUsername: string) => {
    setUsername(inputUsername);
    localStorage.setItem('youtube-username', inputUsername);
    setIsModalOpen(false);
    
    const isAdmin = isAdminUser(inputUsername);
    setIsAuthorized(isAdmin);
    
    if (!isAdmin) {
      setShowKeyInput(true);
    }
  };

  const handleKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // クライアントサイドでキー検証
    const valid = isValidAdminKey(accessKey);
    
    if (valid) {
      setIsAuthorized(true);
      setShowKeyInput(false);
      
      // キー認証を一時的に保存（30分後に自動削除）
      localStorage.setItem('admin-key-verified', 'true');
      const timestamp = Date.now().toString();
      localStorage.setItem('admin-key-timestamp', timestamp);
      
      // 30分後に自動でキー認証を無効化
      const timeout = setTimeout(() => {
        localStorage.removeItem('admin-key-verified');
        localStorage.removeItem('admin-key-timestamp');
        setIsAuthorized(false);
        setShowKeyInput(true);
        alert('セッションが期限切れになりました。再度アクセスキーを入力してください。');
      }, 5 * 60 * 1000); // 5分
      
      setKeyAuthTimeout(timeout);
    } else {
      alert('無効なアクセスキーです。');
    }
  };

  if (isModalOpen) {
    return <UsernameModal isOpen={isModalOpen} onSubmit={handleUsernameSubmit} />;
  }

  if (showKeyInput) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-black">アクセスキーを入力</h1>
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label htmlFor="accessKey" className="block text-sm font-medium text-gray-700 mb-2">
                管理者アクセスキー
              </label>
              <input
                type="password"
                id="accessKey"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="アクセスキーを入力してください"
                required
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                認証
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-black mb-4">管理者権限が必要です。</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-black">管理者ダッシュボード</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-black">管理者: {username}</span>
              <button
                onClick={() => router.push('/')}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <div className="py-8">
        <AdminDashboard />
      </div>
    </div>
  );
}
