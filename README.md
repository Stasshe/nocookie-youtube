# NoCookie YouTube Manager

YouTube動画をプライバシー保護モード（no-cookie）で視聴し、視聴時間を管理するWebアプリケーションです。

## 主な機能

### 👥 ユーザー機能
- **プライバシー保護視聴**: YouTube動画を`youtube-nocookie.com`で視聴
- **タブ機能**: ブラウザライクなタブで複数動画を同時管理
- **視聴時間記録**: 個人の視聴時間を自動記録（5分間隔でFirebaseに保存）
- **ユーザー名登録**: 初回利用時にユーザー名を設定

### 🔧 管理者機能
- **視聴データ管理**: 全ユーザーの視聴時間を一覧表示
- **ダッシュボード**: 統計情報とユーザー管理
- **アクセス制御**: 管理者ユーザー名またはアクセスキーによる認証

## 技術スタック

- **フレームワーク**: Next.js 15.3.4 (App Router)
- **言語**: TypeScript
- **スタイル**: Tailwind CSS
- **データベース**: Firebase Realtime Database
- **デプロイ**: 静的サイトホスティング対応

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
# または
yarn install
# または
pnpm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```bash
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url

# 管理者設定
ADMIN_USERNAME=Admin_Manager
NEXT_PUBLIC_ADMIN_ACCESS_KEY=your_admin_key
```

### 3. 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションにアクセスできます。

## 使用方法

### 一般ユーザー

1. **初回利用**: ユーザー名を入力してアカウントを作成
2. **動画視聴**: 
   - 中央の入力フィールドにYouTubeのURLを貼り付け
   - 動画が自動的にno-cookieモードで再生開始
3. **タブ管理**: 
   - 複数の動画を同時に開く
   - タブの切り替えで動画を切り替え
4. **視聴時間**: 自動的に記録され、5分間隔でデータベースに保存

### 管理者

1. **管理者ログイン**: 
   - ユーザー名に `Admin_Manager` を入力
   - または一般ユーザー名 + アクセスキーで認証
2. **ダッシュボード**: `/admin` ページで全ユーザーの視聴データを確認
3. **セキュリティ**: 
   - アクセスキー認証は30分で自動期限切れ
   - ページ遷移時に認証状態がリセット

## ビルド・デプロイ

### 開発用ビルド
```bash
npm run build
```

### 静的サイト用ビルド
```bash
NEXT_PUBLIC_BUILD_MODE=production npm run build
```

## プロジェクト構造

```
src/
├── app/
│   ├── admin/          # 管理者ダッシュボード
│   ├── globals.css     # グローバルスタイル
│   ├── layout.tsx      # レイアウトコンポーネント
│   └── page.tsx        # ホームページ
├── components/
│   ├── AddressBar.tsx  # URLアドレスバー
│   ├── AdminDashboard.tsx # 管理者ダッシュボード
│   ├── Instructions.tsx   # 使用方法説明
│   ├── TabBar.tsx      # タブ管理
│   └── UsernameModal.tsx # ユーザー名入力モーダル
├── lib/
│   └── firebase.ts     # Firebase設定
├── types/
│   └── index.ts        # TypeScript型定義
└── utils/
    └── youtube.ts      # YouTube関連ユーティリティ
```

## ライセンス

MIT License

## 開発者向け情報

このプロジェクトは教育目的で作成されており、YouTube動画の視聴時間管理とプライバシー保護を目的としています。

- **静的サイトホスティング**: サーバーレス環境でのデプロイに対応
- **Firebase**: リアルタイムデータベースでの視聴時間記録
- **セキュリティ**: 環境変数による認証情報管理

## サポート

問題や質問がある場合は、GitHubのIssuesページでお気軽にお問い合わせください。
