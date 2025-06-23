'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { User } from '@/types';
import { formatTime } from '@/utils/youtube';

export default function AdminDashboard() {
  const [users, setUsers] = useState<Record<string, User>>({});
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newTimeLimit, setNewTimeLimit] = useState<number>(60); // デフォルト60分

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSetTimeLimit = async () => {
    if (!selectedUser) return;

    try {
      const userRef = ref(database, `users/${selectedUser}/timeLimit`);
      await set(userRef, newTimeLimit);
      alert(`${selectedUser}の制限時間を${newTimeLimit}分に設定しました。`);
    } catch (error) {
      console.error('制限時間の設定に失敗しました:', error);
      alert('制限時間の設定に失敗しました。');
    }
  };

  const handleResetUserTime = async (username: string) => {
    try {
      const userRef = ref(database, `users/${username}/watchTime`);
      await set(userRef, 0);
      alert(`${username}の視聴時間をリセットしました。`);
    } catch (error) {
      console.error('視聴時間のリセットに失敗しました:', error);
      alert('視聴時間のリセットに失敗しました。');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">管理者ダッシュボード</h1>
      
      {/* 制限時間設定セクション */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">制限時間設定</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">ユーザーを選択</option>
            {Object.keys(users).map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={newTimeLimit}
            onChange={(e) => setNewTimeLimit(Number(e.target.value))}
            min="1"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
          />
          <span className="text-gray-600">分</span>
          <button
            onClick={handleSetTimeLimit}
            disabled={!selectedUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            設定
          </button>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-6 border-b border-gray-200 text-gray-700">
          ユーザー視聴状況
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  視聴時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  制限時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  残り時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終活動
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(users).map(([username, user]) => {
                const timeLimit = user.timeLimit ? user.timeLimit * 60 : null; // 分を秒に変換
                const remainingTime = timeLimit ? timeLimit - user.watchTime : null;
                const isOverLimit = remainingTime !== null && remainingTime <= 0;
                
                return (
                  <tr key={username} className={isOverLimit ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(user.watchTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.timeLimit ? `${user.timeLimit}分` : '制限なし'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {remainingTime !== null ? (
                        <span className={isOverLimit ? 'text-red-600 font-medium' : 'text-green-600'}>
                          {isOverLimit ? '制限超過' : formatTime(remainingTime)}
                        </span>
                      ) : (
                        '制限なし'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastActive ? new Date(user.lastActive).toLocaleString('ja-JP') : 'なし'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <button
                        onClick={() => handleResetUserTime(username)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        リセット
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {Object.keys(users).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              まだユーザーデータがありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
