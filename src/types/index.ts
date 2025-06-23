export interface Tab {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export interface User {
  username: string;
  watchTime: number;
  lastActive: number;
  timeLimit?: number; // 分単位での制限時間
}

export interface WatchSession {
  username: string;
  videoId: string;
  startTime: number;
  duration: number;
}
