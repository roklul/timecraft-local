# TimeCraft Local

TimeCraft Local 是一個免帳號、免後端、免 Notion 的個人工時與專案工作台。

所有工時、專案與偏好設定都只保存在目前瀏覽器的 `localStorage`，適合個人學習、開發紀錄與離線使用。

## 功能

- 週網格工時排程
- 專案甘特圖
- 工作／個人範圍分類與分開統計
- 專案與常態維運管理
- 多國行事曆
- 0.5 小時工時顆粒度
- 不需註冊、登入或提供外部服務金鑰

## 本機啟動

需求：Node.js 20 以上。

```bash
npm install
npm run dev
```

開啟 <http://localhost:3000>。不需要建立 `.env.local`；若要覆寫時區，可參考 `.env.example`。

## 資料與隱私

- 資料不會上傳至 TimeCraft、Notion 或其他資料庫。
- 不同瀏覽器、裝置與網域的資料彼此獨立。
- 清除網站資料、無痕模式結束或瀏覽器重設可能移除所有紀錄。
- 請勿將 localStorage 視為加密或雲端備份。

## 驗證

```bash
npm test
npm run lint
npm run build
```

## 公開版 SOP

本機安裝、資料備份／還原、貢獻流程、發版與安全檢查請見 [Public SOP](docs/PUBLIC_SOP.md)。

## 授權

[MIT](LICENSE)
