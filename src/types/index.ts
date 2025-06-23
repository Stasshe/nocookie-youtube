export interface Tab {
  id: string;
  title: string;
  url: string;
  displayUrl?: string; // 表示用の元URL
  active: boolean;
}

export interface User {
  username: string;
  watchTime: number;
  lastActive: number;
  timeLimit?: number; // 分単位での制限時間
  lastReset?: number; // 最後にリセットされた時刻
}

export interface WatchSession {
  username: string;
  videoId: string;
  startTime: number;
  duration: number;
}
