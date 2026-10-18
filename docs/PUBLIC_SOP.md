# TimeCraft Local 公開版 SOP

這份文件是公開版的安裝、維護與發版標準流程。公開版必須維持「免帳號、免 Notion、資料只留在瀏覽器」的產品邊界。

## 1. 版本邊界

公開版可以包含：

- 週工時、專案、甘特圖與工作／個人範圍功能
- 瀏覽器 `localStorage` 儲存
- 不含個資的公開行事曆 API
- 可公開檢視的測試、文件與範例資料

公開版不得包含：

- Notion API、資料庫 ID、整合 Token 或同步端點
- 應用程式登入密碼、Session Secret 或私人帳號資料
- 私有版的 `.env.local`、Vercel／Cloudflare Token
- 從私有 repo 複製過來的 Git 歷史

## 2. 本機安裝與啟動

需求：Node.js 20 以上與 npm。

```bash
git clone https://github.com/roklul/timecraft-local.git
cd timecraft-local
npm install
npm run dev
```

開啟 <http://localhost:3000>。公開版不需要 `.env.local`；選用設定請從 `.env.example` 開始，且不得提交任何 `.env*.local`。

## 3. 使用者資料備份

資料與網域、瀏覽器 Profile 綁定。更換瀏覽器、清除網站資料或切換部署網域前，應先備份。

1. 在 TimeCraft 頁面開啟瀏覽器開發者工具的 Console。
2. 執行以下程式，會下載 `timecraft-backup.json`：

```js
const keys = Object.keys(localStorage).filter((key) => key.startsWith('timecraft_'));
const data = Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)]));
const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
const link = Object.assign(document.createElement('a'), {
  href: URL.createObjectURL(blob),
  download: 'timecraft-backup.json',
});
link.click();
URL.revokeObjectURL(link.href);
```

備份檔可能包含工作內容與備註，請視為私人資料妥善保存。

## 4. 使用者資料還原

僅還原自己建立且已確認內容的 JSON；還原會覆蓋相同名稱的 TimeCraft 儲存鍵。

1. 在目標 TimeCraft 網域開啟開發者工具的 Console。
2. 執行下列程式並選擇備份檔：

```js
const input = Object.assign(document.createElement('input'), {
  type: 'file',
  accept: 'application/json',
});
input.onchange = async () => {
  const file = input.files?.[0];
  if (!file) return;
  const data = JSON.parse(await file.text());
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('timecraft_') && typeof value === 'string') {
      localStorage.setItem(key, value);
    }
  }
  location.reload();
};
input.click();
```

## 5. 開發與驗證流程

從最新 `main` 建立功能分支，完成修改後依序執行：

```bash
npm test
npm run lint
npm run build
```

合併前至少人工確認：

- 新增、修改、刪除工時正常
- 新增、改名、刪除專案不會錯綁同名專案
- `work`／`personal` 篩選與統計正確
- 重新整理後資料仍存在
- 瀏覽器 Console 沒有新的錯誤
- 沒有新增登入、Notion 或其他私人 API 路由

## 6. 發版與 Vercel 部署

正式站：<https://person-work-notion-plan.vercel.app>

標準流程：

1. 將通過驗證的變更合併至 `main`。
2. 若 Vercel Git 整合已連線，確認 `main` push 觸發的 Production Deployment 成功。
3. 若尚未連線，從已登入 Vercel CLI 的乾淨工作目錄執行：

   ```bash
   npx vercel deploy --prod --yes
   ```

4. 確認正式網址回傳 HTTP 200，且不要求 Vercel 或應用程式登入。
5. 開啟正式站完成新增工時、切換範圍與重新整理的 smoke test。

部署失敗時，不要用私有版 repo 代替公開版部署；修正公開 repo 後重新跑完整驗證。

## 7. 發版前安全檢查

```bash
git status --short
git log --oneline -5
rg -n -i --hidden -g '!node_modules/**' -g '!.next/**' \
  'NOTION_API_KEY|NOTION_DATABASE_ID|APP_ACCESS_PASSWORD|APP_SESSION_SECRET|VERCEL_OIDC_TOKEN|CLOUDFLARE_API_TOKEN|ntn_|secret_' .
npm audit --omit=dev
```

預期結果：工作目錄乾淨、敏感字串掃描沒有憑證值、production dependencies 沒有已知漏洞。若掃描發現真正的憑證，立即停止部署、從 Git 歷史移除並到原服務撤銷／輪替；只刪除目前檔案並不足以保密。

## 8. 回復版本

優先建立修正 commit 或 revert commit，不改寫公開 `main` 歷史。緊急情況可在 Vercel 將上一個已驗證 Deployment promote 回 Production，之後仍需在 Git 補上對應修正，確保程式碼與正式環境一致。
