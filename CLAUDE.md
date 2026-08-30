# Nameless Realms 官方網站 — 專案憲法（CLAUDE.md）

> 專案代號：**namelessrealms-web**（用於 repo、目錄、docker image、指令）
> 全名：**Nameless Realms 官方網站**
> 命名意象：對外的門面——玩家第一次認識 Nameless Realms 的地方。
>
> 這份檔案是 Claude Code 每次工作都會記得的「常駐規矩」，放在專案根目錄。
> **任何時候有疑慮，以本檔的「鐵則」為最高優先。**
>
> ✅ **本檔已於 2026-08-30 經架構師裁定生效**（Yu 逐字：「兩份 CLAUDE.md 可以了」）。
> 初版由組織層總管依 repo 實碼草擬，**鐵則區與技術棧區已獲準**，⛔ 不再是草案。
> ⇒ 鐵則自此為**硬約束**：當「方便」與鐵則衝突時一律選鐵則。
> ⚠️ 要改鐵則或換技術選型，一律回頭問架構師，⛔ 不得自行放寬。

---

## 專案是什麼

Nameless Realms 的官方網站，用 Next.js 14 App Router 建置的**內容型單體前端**。
對外提供：首頁 / 伺服器介紹 / 團隊與 staff / 啟動器下載頁 / 模組伺服器說明 /
贊助與捐款 / 白名單申請表 / 模組包投票。

目前**沒有自己的資料庫**：頁面內容以 `data/*.ts` 靜態資料驅動；
唯二的動態出口是 `app/api/apply`（白名單申請 → 轉發 Discord Webhook）
與 `app/api/auth/[...nextauth]`（Discord OAuth 登入，僅單一管理員可登入）。

---

## 架構

- **單體前端 + 少量 Route Handler**，無獨立後端；部署為 Next.js `standalone` 產物裝進 Docker image。
- **`app/`**：App Router 頁面。每個路由一個 `page.tsx`，各自為 client component。
- **`components/`**：跨頁共用的展示元件（Navbar / Footer / Hero / Modal / Toast …）。
- **`data/`**：硬編內容資料（`staff.ts` / `news.ts` / `modpackHistory.ts`）——
  ⚠️ **內容改動的唯一落點**，⛔ 不得把清單資料散寫進元件。
- **`app/api/`**：Route Handler。目前兩支，見下方程式碼地圖。
- **`middleware.ts`**：`next-auth` 的 `withAuth`，保護 `/admin/:path*`。
- **`lib/`**：⚠️ **目前是空目錄**（2026-08-30 實查）。共用邏輯要放這裡。
- **溝通方式**：瀏覽器 → Next.js Route Handler → 外部服務（Discord Webhook / Discord OAuth）。
  ⛔ 目前沒有「呼叫 Nameless Realms 自家 API」的路徑（`app/api/apply/route.ts` 內
  `// TODO: 待串接 Core API` 仍未實作）。

---

## 鐵則（任何時候都不可違反）

> ✅ **已生效**（Yu 2026-08-30 裁定：「兩份 CLAUDE.md 可以了」）。以下五條獲準 ⇒ 是**硬約束**，⛔ 不是建議。

1. **機密只走 server 端環境變數**：`DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` /
   `DISCORD_WEBHOOK_URL` / `ADMIN_DISCORD_ID` 只能在 Route Handler、middleware 或
   Server Component 讀取。⛔ 不得出現在任何 `"use client"` 檔、⛔ 不得改名成
   `NEXT_PUBLIC_*`、⛔ 不得寫進版控。**改成 `NEXT_PUBLIC_` 等於公開它。**
2. **管理員授權判準單一**：可登入者只有 `ADMIN_DISCORD_ID` 本人。
   `app/api/auth/[...nextauth]/route.ts` 的 `signIn` callback 與 `middleware.ts` 的
   `authorized` callback **是同一條判準的兩層**，⛔ 不得只改一邊，
   ⛔ 更不得為了方便放寬成「有 token 就過」。
3. **對外 API 一律回結構化錯誤**：Route Handler 缺欄回 `400 { error }`、
   例外回 `500 { error }`，⛔ 不得讓例外冒泡成框架預設純文字錯誤，
   ⛔ 不得把內部錯誤原文（stack、外部服務回應）回給呼叫端。
4. **打 tag 就是發版**：`.github/workflows/push-docker.yaml` 由 `v*.*.*` tag 觸發，
   一推 tag 就 build 並 push image 到私有 registry。
   ⛔ **不得為了測試打 `v` 開頭的 tag。**
5. **內容資料改 `data/`，不改元件**：staff、news、modpack 歷史一律改 `data/*.ts`；
   ⛔ 不得為了「這次只加一筆」而把資料寫死在 `.tsx` 裡。

---

## 技術棧（不要擅自更換）

> ✅ **已於 2026-08-30 經架構師確認為定案選型。** ⛔ 不得擅自替換或引入未列的框架/套件。
> Claude Code ⛔ 不得擅自替換或引入未列的框架/套件；要換先問架構師。

| 層 | 技術 |
|----|------|
| 框架 | Next.js **14.1.0**（App Router、`output: 'standalone'`） |
| UI | React 18 + TypeScript 5（`strict: true`） |
| 樣式 | TailwindCSS 3.3 + PostCSS + autoprefixer；`clsx` + `tailwind-merge` |
| 圖示 | `lucide-react` 0.330 |
| 認證 | `next-auth` 4.24（Discord provider，scope 僅 `identify`） |
| Lint | ESLint 8 + `eslint-config-next` 14.1.0（`yarn lint` = `next lint`） |
| 容器化 | Docker 多階段（`node:20-alpine`），runtime 跑 `.next/standalone/server.js`，`PORT=56130` |
| CI | GitHub Actions **僅** `push-docker.yaml`，觸發條件 = push tag `v*.*.*` |

---

## 領域專屬約束

### 分支與遠端

- **慣例工作分支：`developers`**，⛔ 不是 `main`。遠端兩支都存在。
- git remote 是 `https://github.com/NamelessRealms/namelessrealms-web.git`
  （✅ 2026-08-30 由架構師裁定改名，原 `QuasiMkl/MKLMinecraftMods.git` 為同一個庫的舊名）。
  ⛔ 再動 remote 一律先問架構師，⛔ 不要「順手改對」。

### CI 現況（⚠️ 影響驗收措辭）

- ⛔ **本專案沒有 build/lint CI。** 唯一的 workflow 只在 tag `v*.*.*` 時 build docker image。
- ⇒ 驗收報告的「CI」欄一律以**本地嚴格指令輸出**為準，
  ⛔ 不得寫「等 remote Actions 綠」——那件事在這個 repo 不會發生。
- ⇒ 本地嚴格指令（逐字跑、附輸出）：
  ```
  yarn install --frozen-lockfile
  yarn lint --max-warnings 0
  yarn build
  ```
  ⚠️ `next lint` 預設**不會**因 warning 失敗，所以 `--max-warnings 0` 是必要的，⛔ 不可省。

### 套件管理器

- 倉庫同時存在 `yarn.lock` 與 `package-lock.json`。Dockerfile 的 deps 階段
  **優先用 `yarn install --frozen-lockfile`**，但 builder 階段跑的是 `npm run build`。
- ⇒ 本地一律用 **yarn**（與 image 的依賴解析一致）；
  ⛔ 不得為了方便跑 `npm install`（會改寫 `package-lock.json`，讓兩份 lock 更分岔）。

---

## 開發守則（給 Claude Code）

1. **只做被指派的範圍**：不要超前實作其他頁面或功能。
2. **完成要能驗證**：做完要能 `yarn build` 過並在 `yarn dev` 下實際開頁確認。
3. **不確定先問**：設計決策有疑慮時先問，不要自己假設後埋頭寫。
4. **資源用到才建**：不要一次補齊所有頁面/元件，依當前任務需要。
5. **遵守鐵則**：鐵則優先於任何「方便」或「順手多做」的衝動。
6. **小步前進**：寧可一次做小一點、確定對，再進下一步。
7. **先計畫、放行才實作、完成必產驗收報告**：接到任務包先落檔
   `docs/tasks/{代號}-plan.md`，**等 `{代號}-plan-review.md` 放行才動手**；
   實作完成後主動產出 `docs/tasks/{代號}-verification.md`（格式沿用
   `docs/tasks/verification_template.md`）。不需要等我要求。
   ⛔ **commit/push 前回報，待架構師確認**——任務包任何措辭均不構成 push 預授權。
8. **工程慣例 checklist（每次實作 + 驗收報告須一併滿足）**：
   - **改過原始碼 → 必重建產物**：`yarn build` 要在報告裡確認跑過（附輸出）。
     ⚠️ `yarn dev` 的熱更新**不算**產物重建。
   - **改過 Route Handler / middleware → 必實測一次正向 + 一次負向**
     （例：`apply` 缺欄位應回 400 而非 500；貼實際 `curl` 輸出）。
   - **⛔ 機密不入 log**：`console.log` / `console.error` ⛔ 不得印出 token、webhook URL、
     `ADMIN_DISCORD_ID`。
   - **驗收報告不得用範本/預期值/設計推理冒充已執行**；做不到就誠實標「待人工」。
   - **負向測試的還原一律用備份檔**，⛔ 不用 `git checkout`（會連同未 commit 的正式改動清掉）。
   - **結構性變更同步更新本檔的程式碼地圖**（新增/移動頁面、新增 Route Handler、
     新增 `data/` 檔、`lib/` 開始有東西時）；非結構變更勿動地圖。
   - **⛔ 逐檔 `git add`**：⛔ 不用 `git add .`——工作樹長期帶著未收斂的改動（見下方地雷清單）。

---

## 撰碼規約（防止長出已清掉的債）

**A. 檔案體積**
- 單檔超過 **20 KB** 即須停下評估是否分檔；超過 **40 KB** 視為必須處理。
- ⚠️ **2026-08-30 基線實測**：最大檔 `app/sponsor/page.tsx` **11,966 B**，
  次大 `app/voteModpack/page.tsx` 10,347 B、`app/launcher/page.tsx` 10,305 B
  ——**全部低於門檻**，目前無例外條款。⇒ 有檔案越線就是新債，⛔ 不是既成事實。
- 體積對帳以**實測值**為準，不得以「原檔減新檔」推算。

**B. 元件結構**
- ⛔ **禁止元件內嵌套 `renderXxx()` 回傳 JSX**——這是單檔膨脹的頭號主因。需拆獨立子元件檔。
- **state 就近**：只被單一視圖使用的 state 下放到該子元件，不留父層。
- **純函式外置**：不依賴元件 state 的函式放 `lib/`，且同步補測試。
  ⚠️ `lib/` 目前是空的——**第一個放進去的人負責建立慣例**。

**C. 去重**
- 樣式常數/工具字串**複製到第二個檔就必須抽共用**（`lib/` 或 `components/`）。
- ⚠️ **但不得過早抽象**：相似度高但屬不同領域的頁面不合併。
  判準：「這兩處未來會不會因為**不同的理由**而改動？」會，就不合併。
- 重複兩次可以忍，第三次必須抽。**錯的抽象比重複更貴。**

**D. 不得抽離的東西（防護欄）**
- 帶計時器、ref 時序、或在 render body 直接賦值的狀態邏輯**不抽共用**。
  此類位置一旦出現，在本區明列具體檔案與理由。
  ⚠️ 目前（2026-08-30）**尚未盤點**，⛔ 不代表沒有。

---

## 命名慣例

- repo / 根目錄：`namelessrealms-web`
- docker image：`namelessrealms-official-web`（見 `.github/workflows/push-docker.yaml` 的 `IMAGE`）
- 路由目錄：小駝峰（現況：`voteModpack` / `modServer`），⚠️ 與 `apply` / `donate` / `team`
  等單字路由並存。⛔ 新增路由前先看既有慣例，不要再開第三種寫法。
- 元件檔：`PascalCase.tsx`，一檔一元件，檔名 = 元件名。
- 資料檔：`data/{名詞複數或領域}.ts`。

---

## 程式碼地圖

> ⚠️ 結構性變更時**同步更新本區**。2026-08-30 實查。

| 路徑 | 職責 |
|------|------|
| `app/layout.tsx` | 根 layout（含 `AuthProvider`） |
| `app/page.tsx` | 首頁 |
| `app/apply/page.tsx` | 白名單申請表單 |
| `app/launcher/page.tsx` | 啟動器下載頁 |
| `app/modServer/page.tsx` | 模組伺服器說明 |
| `app/team/page.tsx` / `app/staff/page.tsx` | 團隊 / staff 介紹 |
| `app/donate/page.tsx` / `app/sponsor/page.tsx` | 捐款 / 贊助（含方案選擇與 PayPal） |
| `app/voteModpack/page.tsx` | 模組包投票（用 `data/modpackHistory.ts`） |
| `app/api/apply/route.ts` | POST 白名單申請 → Discord Webhook。⚠️ `// TODO: 待串接 Core API` |
| `app/api/auth/[...nextauth]/route.ts` | Discord OAuth；`signIn` 只放行 `ADMIN_DISCORD_ID` |
| `middleware.ts` | `withAuth` 保護 `/admin/:path*` |
| `components/` | Navbar / Footer / Hero / HomeHero / Modal / Toast / FeatureRow / FeatureSection / NewsSection / ServerSection / StaffSection / AuthProvider |
| `data/staff.ts` / `data/news.ts` / `data/modpackHistory.ts` | 靜態內容資料 |
| `lib/` | ⚠️ **空目錄**（共用邏輯預留位） |
| `docs/LAUNCHER_DESIGN.md` | 啟動器頁設計文件 |

---

## ⚠️ 地雷清單（2026-08-30 實查，⛔ 不要「順手修掉」，先問架構師）

1. **`middleware.ts` 保護的 `/admin` 路由不存在**——`app/` 底下沒有 `admin/`。
   ⇒ 這道保護目前**沒有守到任何頁面**。要新增後台時記得它已經在守。
2. ✅ **已解（2026-08-30）**：git remote 已依架構師裁定改為
   `NamelessRealms/namelessrealms-web`。⚠️ 保留編號以免其餘各條錯位。
3. ✅ **已解（2026-08-31，F2 收案）**：`web.log` 已移出版控（`git rm --cached`，
   檔案保留於工作目錄），並在 `.gitignore` 補擋（`# debug` 節，精確檔名）。
4. ✅ **已解（2026-08-31，F2 收案）**：`.gitignore` 檔尾重複樣板段已刪（43 行 → 38 行）。
   ⚠️ **經驗（去重前必讀）**：該段**不是純重複**——`.vscode` 與 `.env` 是其中**獨有**條目，
   上半段只有 `.env*.local`、⛔ 擋不到單純的 `.env`。整段刪除會弄丟 `.env` 的忽略保護
   ⇒ 直接踩**鐵則 1**（`.env` 存 `DISCORD_CLIENT_SECRET` / webhook URL）。
   ⇒ 本次是先把兩條併入上半段對應節、再刪該段。**⛔ 日後同類去重一律逐條比對，⛔ 不得整段刪。**
5. **`yarn.lock` 與 `package-lock.json` 並存**，見上方「套件管理器」。
6. **工作樹長期帶未 commit 改動**：2026-08-30 實查 `app/layout.tsx`、`app/staff/page.tsx`、
   `components/ServerSection.tsx` 三檔為 modified。⇒ **`git add .` 會把它們一起帶走**。

---

## 專案文件地圖

| 檔案 | 位置 | 用途 | 誰讀 |
|------|------|------|------|
| `CLAUDE.md` | 根目錄 | 本檔，專案憲法與鐵則 | Claude Code 自動讀 |
| `WORKFLOW.md` | 根目錄 | 協作規則、工作迴圈、驗收要求 | 架構師與 Claude 共用 |
| `docs/LAUNCHER_DESIGN.md` | docs/ | 啟動器頁設計 | 按需查閱 |
| `docs/tasks/` | docs/tasks/ | 交接五件套骨架；收案後移 `docs/tasks/archive/` | 執行任務時 |
| `.claude/` | 根目錄 | 三個 subagent + 六支 hook + `settings.json` + `/go` | Claude Code 自動讀 |

⚠️ **知識庫（vault）在**：`/Users/quasi-pc/Documents/Obsidian Vault/Claude 知識庫/namelessrealms-web/`
（`WORKSPACE.md` / `BACKLOG.md` / `DECISIONS-ARCHIVE.md`）。
⛔ **實作側與稽核側讀不到 vault**（`vault-guard` 強制）——任務包必須自我完備，
需要的背景直接抄進包裡，⛔ 不得寫「詳見 vault 某檔」。

⚠️ **任務代號：`F{n}`**（單一序列 + 型別欄位，⛔ 不是里程碑制）。
本專案是**完成品**，`M{n}` 會逼出一個假的「M0 專案骨架」。編號規則全文見 `BACKLOG.md` 開頭。

⛔ **本專案沒有 `spec` 主檔，也沒有 `DEV-INDEX.md`**——規格的等價物就是本檔的
程式碼地圖與地雷清單。⇒ ⛔ 不要去找不存在的 spec 章節。
