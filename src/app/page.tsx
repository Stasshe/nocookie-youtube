'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@/types';
import { extractVideoId, generateNoCookieUrl, isAdminUser } from '@/utils/youtube';
import { database } from '@/lib/firebase';
import { ref, set, onValue } from 'firebase/database';
import UsernameModal from '@/components/UsernameModal';
import TabBar from '@/components/TabBar';
import AddressBar from '@/components/AddressBar';
import Instructions from '@/components/Instructions';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [watchTime, setWatchTime] = useState<number>(0);
  const [timeLimit, setTimeLimit] = useState<number | null>(null);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [iframeError, setIframeError] = useState<boolean>(false);
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

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
    initializeTabs();
  };

  const handleUrlSubmit = (url: string) => {
    if (timeLimit && watchTime >= timeLimit) {
      alert('制限時間に達しています。これ以上動画を視聴することはできません。');
      return;
    }

    // 既にnocookieのURLの場合はそのまま使用
    let finalUrl = url;
    let displayUrl = url;
    
    if (!url.includes('youtube-nocookie.com')) {
      const videoId = extractVideoId(url);
      if (!videoId) {
        alert('有効なYouTubeのURLを入力してください。');
        return;
      }
      finalUrl = generateNoCookieUrl(videoId);
      displayUrl = url; // 元のURLを表示用に保持
    }

    const activeTab = tabs.find(tab => tab.id === activeTabId);
    
    if (activeTab) {
      // エラー状態をリセット
      setIframeError(false);
      setIframeLoaded(false);
      
      const updatedTabs = tabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, url: finalUrl, title: `YouTube Video`, displayUrl: displayUrl }
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

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  const activeTab = tabs.find(tab => tab.active);

  // iframeの読み込みタイムアウト処理
  useEffect(() => {
    if (activeTab?.url && !activeTab.url.includes('Instructions')) {
      const timer = setTimeout(() => {
        if (!iframeLoaded) {
          setIframeError(true);
        }
      }, 10000); // 10秒でタイムアウト

      return () => clearTimeout(timer);
    }
  }, [activeTab?.url, iframeLoaded]);
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
        currentUrl={activeTab?.displayUrl || activeTab?.url || ''}
        onUrlSubmit={handleUrlSubmit}
        remainingTime={remainingTime}
      />
      
      <div className="flex-1 bg-white">
        {activeTab?.url && !isOverLimit ? (
          <div className="relative w-full h-full">
            <iframe
              src={activeTab.url}
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube Video"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
            {iframeError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                  <div className="text-6xl mb-4">📺</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">動画の読み込みに失敗しました</h3>
                  <p className="text-gray-600 mb-4">
                    再生するまで、一時的にWiFiを切ってください
                  </p>
                  <button
                    onClick={() => {
                      setIframeError(false);
                      setIframeLoaded(false);
                      // iframeを再読み込み
                      const iframe = document.querySelector('iframe');
                      if (iframe) {
                        iframe.src = iframe.src;
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    再試行
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : isOverLimit ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">制限時間終了</h2>
              <p className="text-black">
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
      
      {/* 管理者用フローティングボタン */}
      {isAdmin && (
        <button
          onClick={() => router.push('/admin')}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-50"
          title="管理者ダッシュボード"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
