'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tab } from '@/types';
import { extractVideoId, generateNoCookieUrl, isAdminUser } from '@/utils/youtube';
import { database } from '@/lib/firebase';
import { ref, set, onValue, push } from 'firebase/database';
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
  const [iframeErrors, setIframeErrors] = useState<{[key: string]: boolean}>({});
  const [iframeLoaded, setIframeLoaded] = useState<{[key: string]: boolean}>({});

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

  // GMT+0 4時（日本時間13時）のリセット時刻を計算
  const getTodayResetTime = () => {
    const now = new Date();
    const resetTime = new Date();
    resetTime.setUTCHours(4, 0, 0, 0); // GMT 4:00
    
    // 現在時刻が4時より前の場合は前日の4時を返す
    if (now.getUTCHours() < 4) {
      resetTime.setUTCDate(resetTime.getUTCDate() - 1);
    }
    
    return resetTime.getTime();
  };

  // 視聴時間がリセットされるべきかチェック
  const shouldResetWatchTime = (lastActive: number) => {
    const todayResetTime = getTodayResetTime();
    return lastActive < todayResetTime;
  };

  // ユーザーデータの監視
  useEffect(() => {
    if (!username || isAdmin) return;

    console.log('ユーザーデータの監視を開始:', username);
    const userRef = ref(database, `users/${username}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      console.log('Firebaseからユーザーデータを取得:', userData);
      
      if (userData) {
        const lastActive = userData.lastActive || 0;
        const shouldReset = shouldResetWatchTime(lastActive);
        
        if (shouldReset) {
          console.log('🔄 GMT4時を過ぎているため視聴時間をリセットします');
          console.log('前回アクティブ:', new Date(lastActive).toISOString());
          console.log('今日のリセット時刻:', new Date(getTodayResetTime()).toISOString());
          
          // 視聴時間をリセットしてFirebaseに保存
          const resetData = {
            ...userData,
            watchTime: 0,
            lastActive: Date.now(),
            lastReset: Date.now()
          };
          
          set(userRef, resetData).then(() => {
            console.log('✅ 視聴時間をリセットしました');
            setWatchTime(0);
            setTimeLimit(userData.timeLimit ? userData.timeLimit * 60 : null);
          }).catch((error) => {
            console.error('❌ 視聴時間のリセットに失敗しました:', error);
          });
        } else {
          setWatchTime(userData.watchTime || 0);
          setTimeLimit(userData.timeLimit ? userData.timeLimit * 60 : null);
          console.log('視聴時間を更新:', userData.watchTime || 0, '秒');
        }
      } else {
        // 初回ユーザーの場合、初期データを作成
        console.log('初回ユーザーです。初期データを作成します。');
        const initialData = {
          username,
          watchTime: 0,
          lastActive: Date.now(),
          timeLimit: null,
          lastReset: Date.now()
        };
        
        set(userRef, initialData).then(() => {
          console.log('初期ユーザーデータを作成しました:', initialData);
          setWatchTime(0);
          setTimeLimit(null);
        }).catch((error) => {
          console.error('初期ユーザーデータの作成に失敗しました:', error);
        });
      }
    });

    return () => unsubscribe();
  }, [username, isAdmin]);

  // 視聴時間の即座保存と30秒ごとの更新
  useEffect(() => {
    if (!username || isAdmin || !isWatching) return;

    console.log('視聴時間更新処理を開始します。現在の視聴時間:', watchTime);

    // 視聴開始時に即座に30秒分を加算して保存
    const saveWatchTime = (addTime: number = 0) => {
      // 現在のwatchTimeを直接Firebaseから取得して更新
      const userRef = ref(database, `users/${username}`);
      
      setWatchTime(prevWatchTime => {
        const newWatchTime = prevWatchTime + addTime;
        console.log('視聴時間を更新中:', prevWatchTime, '+', addTime, '=', newWatchTime);
        
        // Firebaseに保存（lastResetも更新）
        set(userRef, {
          username,
          watchTime: newWatchTime,
          lastActive: Date.now(),
          timeLimit: timeLimit ? timeLimit / 60 : null,
          lastReset: Date.now() // リセット時刻も記録
        }).then(() => {
          console.log('✅ 視聴時間を保存しました:', newWatchTime, '秒');
          console.log('📅 現在時刻:', new Date().toISOString());
          console.log('⏰ 次回リセット予定:', new Date(getTodayResetTime() + 24 * 60 * 60 * 1000).toISOString());
        }).catch((error) => {
          console.error('❌ 視聴時間の保存に失敗しました:', error);
        });
        
        return newWatchTime;
      });
    };

    // 視聴開始時に即座に30秒加算
    console.log('🎬 視聴開始 - 30秒を即座に加算します');
    saveWatchTime(5 * 60); // 30秒（300秒）を即座に加算

    // その後は30秒ごとに更新
    const interval = setInterval(() => {
      console.log('⏰ 定期更新 - 30秒を加算します');
      saveWatchTime(30); // 30秒ごとに30秒加算
    }, 30 * 1000); // 30秒

    return () => {
      clearInterval(interval);
      console.log('🛑 視聴時間更新のタイマーを停止しました');
    };
  }, [username, isAdmin, isWatching, timeLimit]);

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
      setIframeErrors(prev => ({ ...prev, [activeTabId]: false }));
      setIframeLoaded(prev => ({ ...prev, [activeTabId]: false }));
      
      const updatedTabs = tabs.map(tab =>
        tab.id === activeTabId
          ? { ...tab, url: finalUrl, title: `YouTube Video`, displayUrl: displayUrl }
          : tab
      );
      setTabs(updatedTabs);
      
      // 動画視聴開始
      if (!isWatching) {
        console.log('動画視聴を開始します:', finalUrl);
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
    // タブが既にアクティブな場合は何もしない
    if (activeTabId === tabId) return;
    
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      active: tab.id === tabId
    }));
    setTabs(updatedTabs);
    setActiveTabId(tabId);
    
    // アドレスバーの更新を確実にするため、強制的に再レンダリングをトリガー
    // 新しいアクティブタブの情報を取得してアドレスバーに反映
    const newActiveTab = updatedTabs.find(tab => tab.id === tabId);
    if (newActiveTab) {
      // アドレスバーが確実に更新されるように少し遅延を入れる
      setTimeout(() => {
        // 必要に応じてここで追加の処理を行う
      }, 0);
    }
  };

  const handleTabClose = (tabId: string) => {
    if (tabs.length === 1) return;

    const filteredTabs = tabs.filter(tab => tab.id !== tabId);
    const wasActive = tabs.find(tab => tab.id === tabId)?.active;

    if (wasActive && filteredTabs.length > 0) {
      // 最初のタブをアクティブにする
      const updatedTabs = filteredTabs.map((tab, index) => ({
        ...tab,
        active: index === 0
      }));
      setTabs(updatedTabs);
      setActiveTabId(updatedTabs[0].id);
    } else {
      setTabs(filteredTabs);
    }
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // iframeの読み込みタイムアウト処理
  useEffect(() => {
    const timeouts: { [key: string]: NodeJS.Timeout } = {};
    
    tabs.forEach(tab => {
      if (tab.url && !tab.url.includes('Instructions')) {
        timeouts[tab.id] = setTimeout(() => {
          if (!iframeLoaded[tab.id]) {
            setIframeErrors(prev => ({ ...prev, [tab.id]: true }));
          }
        }, 5000); // 10秒でタイムアウト
      }
    });

    return () => {
      Object.values(timeouts).forEach(timeout => clearTimeout(timeout));
    };
  }, [tabs, iframeLoaded]);
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
      
      <div className="flex-1 bg-white relative">
        {/* 全てのタブのiframeを表示（非表示のものも含む） */}
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const hasUrl = tab.url && !isOverLimit;
          
          if (!hasUrl) {
            return isActive ? (
              <div key={tab.id} className="p-8 w-full h-full">
                <Instructions />
              </div>
            ) : null;
          }
          
          return (
            <div
              key={tab.id}
              className={`w-full h-full ${isActive ? 'block' : 'hidden'}`}
            >
              <iframe
                src={tab.url}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`YouTube Video - ${tab.title}`}
                onLoad={() => {
                  setIframeLoaded(prev => ({ ...prev, [tab.id]: true }));
                  setIframeErrors(prev => ({ ...prev, [tab.id]: false }));
                }}
                onError={() => {
                  setIframeErrors(prev => ({ ...prev, [tab.id]: true }));
                  setIframeLoaded(prev => ({ ...prev, [tab.id]: false }));
                }}
              />
              {iframeErrors[tab.id] && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
                  <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
                    <div className="text-6xl mb-4">📺</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">動画の読み込みに失敗しました</h3>
                    <p className="text-gray-600 mb-4">
                      再生するまで、一時的にWiFiを切ってください
                    </p>
                    <button
                      onClick={() => {
                        setIframeErrors(prev => ({ ...prev, [tab.id]: false }));
                        setIframeLoaded(prev => ({ ...prev, [tab.id]: false }));
                        // iframeを再読み込み
                        const iframe = document.querySelector(`iframe[title="YouTube Video - ${tab.title}"]`) as HTMLIFrameElement;
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
          );
        })}
        
        {/* 制限時間超過の表示 */}
        {isOverLimit && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-red-600 mb-4">制限時間終了</h2>
              <p className="text-black">
                あなたの視聴制限時間に達しました。<br />
                管理者にお問い合わせください。
              </p>
            </div>
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
