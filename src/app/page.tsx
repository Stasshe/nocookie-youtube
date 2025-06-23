'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tab, User } from '@/types';
import { extractVideoId, generateNoCookieUrl, isAdminUser } from '@/utils/youtube';
import { database } from '@/lib/firebase';
import { ref, set, onValue } from 'firebase/database';
import UsernameModal from '@/components/UsernameModal';
import TabBar from '@/components/TabBar';
import AddressBar from '@/components/AddressBar';
import Instructions from '@/components/Instructions';

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [watchTime, setWatchTime] = useState<number>(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);

  // ユーザー名をローカルストレージから読み込み
  useEffect(() => {
    const savedUsername = localStorage.getItem('youtube-username');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsModalOpen(false);
      initializeTabs();
    }
  }, []);

  // 管理者チェック
  const isAdmin = isAdminUser(username);

  // 管理者の場合は管理画面にリダイレクト
  useEffect(() => {
    if (isAdmin && !isModalOpen) {
      window.location.href = '/admin';
    }
  }, [isAdmin, isModalOpen]);

  // タブ初期化
  const initializeTabs = () => {
    const initialTab: Tab = {
      id: '1',
      title: 'Home',
      url: '',
      active: true
    };
    setTabs([initialTab]);
    setActiveTabId('1');
  };

  // ユーザーデータの監視
  useEffect(() => {
    if (!username || isAdmin) return;

    const userRef = ref(database, `users/${username}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      if (userData) {
        setWatchTime(userData.watchTime || 0);
        setTimeLimit(userData.timeLimit ? userData.timeLimit * 60 : null); // 分を秒に変換
      }
    });

    return () => unsubscribe();
  }, [username, isAdmin]);

  // 視聴時間の更新（5分ごと）
  useEffect(() => {
    if (!username || isAdmin || !isWatching) return;

    const interval = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
      const sessionTime = currentTime - startTime;
      const newWatchTime = watchTime + sessionTime;

      // Firebaseに保存
      const userRef = ref(database, `users/${username}`);
      set(userRef, {
        username,
        watchTime: newWatchTime,
        lastActive: Date.now(),
        timeLimit: timeLimit ? timeLimit / 60 : null // 秒を分に変換
      });

      setWatchTime(newWatchTime);
      setStartTime(currentTime);
    }, 5 * 60 * 1000); // 5分

    return () => clearInterval(interval);
  }, [username, isAdmin, isWatching, watchTime, startTime, timeLimit]);

  const handleUsernameSubmit = (inputUsername: string) => {
    setUsername(inputUsername);
    localStorage.setItem('youtube-username', inputUsername);
    setIsModalOpen(false);
    
    if (!isAdminUser(inputUsername)) {
      initializeTabs();
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (timeLimit && watchTime >= timeLimit) {
      alert('制限時間に達しています。これ以上動画を視聴することはできません。');
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      alert('有効なYouTubeのURLを入力してください。');
      return;
    }

    const noCookieUrl = generateNoCookieUrl(videoId);
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    
    if (activeTab) {
      const updatedTabs = tabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, url: noCookieUrl, title: `YouTube Video` }
          : tab
      );
      setTabs(updatedTabs);
      
      // 動画視聴開始
      if (!isWatching) {
        setIsWatching(true);
        setStartTime(Math.floor(Date.now() / 1000));
      }
    }
  };

  const handleNewTab = () => {
    const newTabId = Date.now().toString();
    const newTab: Tab = {
      id: newTabId,
      title: 'New Tab',
      url: '',
      active: true
    };

    const updatedTabs = tabs.map(tab => ({ ...tab, active: false }));
    setTabs([...updatedTabs, newTab]);
    setActiveTabId(newTabId);
  };

  const handleTabSelect = (tabId: string) => {
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      active: tab.id === tabId
    }));
    setTabs(updatedTabs);
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;

    const filteredTabs = tabs.filter(tab => tab.id !== tabId);
    const wasActive = tabs.find(tab => tab.id === tabId)?.active;

    if (wasActive && filteredTabs.length > 0) {
      filteredTabs[0].active = true;
      setActiveTabId(filteredTabs[0].id);
    }

    setTabs(filteredTabs);
  };

  const activeTab = tabs.find(tab => tab.active);
  const remainingTime = timeLimit ? timeLimit - watchTime : undefined;
  const isOverLimit = remainingTime !== undefined && remainingTime <= 0;

  if (isModalOpen) {
    return <UsernameModal isOpen={isModalOpen} onSubmit={handleUsernameSubmit} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <TabBar
        tabs={tabs}
        onTabSelect={handleTabSelect}
        onTabClose={handleTabClose}
        onNewTab={handleNewTab}
      />
      
      <AddressBar
        currentUrl={activeTab?.url || ''}
        onUrlSubmit={handleUrlSubmit}
        remainingTime={remainingTime}
      />
      
      <div className="flex-1 bg-white">
        {activeTab?.url && !isOverLimit ? (
          <iframe
            src={activeTab.url}
            className="w-full h-full border-none"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Video"
          />
        ) : isOverLimit ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">制限時間終了</h2>
              <p className="text-gray-600">
                あなたの視聴制限時間に達しました。<br />
                管理者にお問い合わせください。
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <Instructions />
          </div>
        )}
      </div>
    </div>
  );
}
