# 大衛假髮 David Hair Studio

魔髮倉庫工作室（大衛假髮）官方網站——男性 / 女性 / 化療醫療假髮客製化服務、線上商城與品牌部落格。

## 技術架構

- **前端**：React 19 + Vite 6 + Tailwind CSS 4
- **後端**：Express（`server.ts`），開發模式用 `tsx` 直接執行 TypeScript
- **資料庫 / 後台**：Firebase（Firestore），管理員可直接在網頁上編輯文章、商品、評價等內容
- **地圖**：`@vis.gl/react-google-maps`（門市地圖）
- **部署**：Netlify（見 `netlify.toml`）

## 專案結構

```
├── server.ts                # Express 伺服器（API 路由、假髮商品資料等）
├── src/
│   ├── App.tsx               # 主應用（首頁、品牌故事、關於我們、門市地圖…等各頁面）
│   ├── components/           # 各功能模組（男/女/化療假髮型錄、線上商城、部落格、評價系統…）
│   ├── services/              # Firebase、YouTube API 等外部服務串接
│   └── data/                  # 部落格文章等靜態資料
├── public/images/             # 靜態圖片資源
├── firestore.rules            # Firestore 安全規則
└── firebase-applet-config.json # Firebase 前端設定
```

## 本機開發

**前置需求**：Node.js（建議 18+）

1. 安裝套件：
   ```bash
   npm install
   ```
2. 設定環境變數：複製 `.env.example` 為 `.env.local`，並填入：
   - `VITE_GEMINI_API_KEY` / `GEMINI_API_KEY`：Gemini API 金鑰（AI 客服功能用）
   - `VITE_YOUTUBE_API_KEY`：YouTube Data API 金鑰（首頁影音專區用）

   > 沒有金鑰網站主體仍可正常瀏覽，僅 AI 客服與 YouTube 影片相關功能會停用。
3. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
   預設會在 `http://localhost:3000` 啟動。

## 常用指令

| 指令 | 說明 |
|---|---|
| `npm run dev` | 啟動開發伺服器（`tsx server.ts`） |
| `npm run build` | 建置正式版前端與後端（輸出至 `dist/`） |
| `npm start` | 執行建置後的正式版伺服器 |
| `npm run lint` | TypeScript 型別檢查（`tsc --noEmit`） |
| `npm run clean` | 清除 `dist/` 建置產物 |

## 部署

本專案設定為部署至 [Netlify](https://www.netlify.com/)，建置指令與發佈目錄已寫在 `netlify.toml`。部署前記得在 Netlify 後台的環境變數設定裡補上 `.env.example` 列出的金鑰。
