'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminUser } from '@/utils/youtube';
import AdminDashboard from '@/components/AdminDashboard';
import UsernameModal from '@/components/UsernameModal';

export default function AdminPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('youtube-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsModalOpen(false);
      setIsAuthorized(isAdminUser(savedUsername));
    }
  }, []);

  const handleUsernameSubmit = (inputUsername: string) => {
    setUsername(inputUsername);
    localStorage.setItem('youtube-username', inputUsername);
    setIsModalOpen(false);
    
    const isAdmin = isAdminUser(inputUsername);
    setIsAuthorized(isAdmin);
    
    if (!isAdmin) {
      alert('管理者権限がありません。');
      router.push('/');
    }
  };

  if (isModalOpen) {
    return <UsernameModal isOpen={isModalOpen} onSubmit={handleUsernameSubmit} />;
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
