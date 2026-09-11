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
- ✅ **`yarn lint` 的空測已於 2026-09-09（F8）解除**：repo 根目錄已有 `.eslintrc.json`
  （`root: true` + `next/core-web-vitals`），覆蓋範圍寫在 `next.config.js` 的 `eslint.dirs`
  （`app` / `components` / `data` / `middleware.ts`）⇒ **lint 與 build 共用同一份範圍**。
  ⚠️ F10（2026-09-10 收案）已把 `lib` 從 `eslint.dirs` 拿掉（它是空目錄，加上 `--error-on-unmatched-pattern`
  會讓本機 lint 假失敗）⇒ **往 `lib/` 放第一個檔時必須把 `'lib'` 加回 `dirs`**，否則 `lib/` 永遠不會被 lint
  ——設了 `dirs` 就**整個取代** Next 內建預設清單（`["app","pages","components","lib","src"]`），⛔ 不會合併回來。
  ⚠️ 歷史留痕：`.eslintrc.json` 曾於 **2026-02-12** commit `5afda1a` 被刪除，此後 `next lint`
  會跳出互動式設定問卷、無 TTY 輸入即結束，**exit 0 但⛔ 一個檔案都沒 lint**（F1 實測發現）。
  ⇒ ✅ **自 F8 起，`yarn lint` 的 exit 0 是有效佐證** —— 但仍須連同負向對照一起引用。
- ✅ **`@next/next/no-img-element` 已於 2026-09-11（F9）重新生效**：F8 暫時關閉該規則的 `rules` 區塊
  已從 `.eslintrc.json` 移除（檔案回到 `root` + `extends` 兩鍵），原本的 10 處 `<img>`（7 檔）已全部換成 `next/image`。
- ⚠️⚠️ **但仍⛔ 不得單獨寫「lint 通過」**：`exit 0` ⛔ 不等於該檢查真的跑了
  ⇒ 引用時一律連同兩個負向對照：
  ① 改前用 `yarn lint --max-warnings 0 -c node_modules/eslint-config-next/core-web-vitals.js`
     應 `exit=1`、10 命中（⚠️ 該規則在 preset 裡是 **warning** ⇒ `--max-warnings 0` 是讓它 fail 的必要條件）；
  ② 任何時候在 `eslint.dirs` 內放一個含 `<img>` 的 canary 檔，`yarn lint --max-warnings 0`
     應 `exit=1`、1 命中（**驗完必刪**，並確認它不在 `git status`）。
- ⚠️ 全站已設 `images: { unoptimized: true }`（F9 裁決 ①丙）⇒ `next/image` ⛔ 不走最佳化端點、
  ⛔ 不產生 `srcset`；**要開最佳化見地雷清單第 7 條**。
- ⚠️ **一般原則（本 repo 已踩過七次）**：**`exit 0` ⛔ 不等於「該檢查真的跑了」**。
  ① `next lint` 無設定檔 ⇒ exit 0 但一個檔都沒 lint（即 F8 本身）；
  ② F4 的 `git check-ignore` 對**已追蹤檔**恆回「不忽略」（需 `--no-index`）；
  ③ `--debug` 的輸出**不寫 stdout**（寫在 `~/.claude/debug/`）⇒ grep stdout 得 0 命中；
  ④ **zsh 下 `${PIPESTATUS[0]}` 恆為空**（那是 bash 的變數；zsh 為 `pipestatus`、1-based）
     ⇒ 所有 `exit=` 欄位都沒量到，形式上卻「跑完了」；
  ⑤ `next lint -f json` **只列有問題的檔**（formatter 輸出前就濾掉沒有 messages 的檔）
     ⇒ 拿它數檔案當覆蓋證明，會把「這檔很乾淨」與「這檔根本沒被 lint」混為一談；
  ⑥ **`next lint --file` 給絕對路徑** ⇒ **靜默一個檔都不 lint**、仍回 `exit 0`
     （同一個檔改成**相對路徑**就會噴錯。F9 稽核側原想拿它當唯讀槓桿，就是被這點作廢的）；
  ⑦ **`next lint --dir` 指向會被 ignore 的目錄** ⇒ 同樣 `exit 0`（F9 稽核側實測）。
  ⇒ 凡把某指令當閘門，**必須有一次「它真的會 fail」的負向對照**，
  ⛔ 沒有負向對照就只是換了個指令。
  ⚠️ 且**負向對照本身也要能證明它量得準** —— 先故意讓指令失敗、確認取得非 0，再開始正式量測。

### 套件管理器

- ✅ **2026-08-31（F4 收案）起，倉庫只有 `yarn.lock` 一份 lock 檔。**
  `package-lock.json` 已刪除，並由 `.gitignore`（`# dependencies` 節）擋住。
- Dockerfile 的 deps 階段已收斂為**無條件** `yarn install --frozen-lockfile`
  （原本的 `npm ci` / `npm install` 分支是永遠走不到的死碼，已一併刪除）。
  ⚠️ builder 階段**仍是** `RUN npm run build` —— 架構師裁定**不動**：它只執行
  `package.json` 的 script、⛔ 不需要 lock 檔；改它會動到**真正的發版路徑**，
  而本 repo 打 tag 就是發版且⛔ 沒有 build CI 可擋。
- ⇒ 本地一律用 **yarn**（與 image 的依賴解析一致）。
- ⛔ **不得跑 `npm install`。** ⚠️ **理由已於 F4 改變**：不再是「會讓兩份 lock 更分岔」
  （已經只剩一份），而是**會讓已刪除的 `package-lock.json` 復活**
  ——雖然 `.gitignore` 擋著不讓它進版控，但硬碟上多一份無人維護的 lock 仍會誤導後人。

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
   - ⭐ **既有註解不得被靜默改動——用全稱比對證明，⛔ 不抽查**（架構師 2026-09-09 裁決，撰碼規約 §A 同條）：
     凡該輪壓縮過任何說明文字，收稿前以 `git show HEAD:<檔>` 取出**每一行**註解逐字回查現行檔，
     對不上的**逐條列出**並判定「自己新寫的（可精簡）/ 既有的（⛔ 必還原）」。
     （實測依據：Meridian M1-12 一次抽查式自我聲稱漏掉兩行，826 行全稱比對才抓到。）

---

## 撰碼規約（防止長出已清掉的債）

**A. 檔案可讀性**（⚠️ 原名「檔案體積」——架構師 2026-09-09 裁決改判準，全組織適用；`§A` 代號⛔ 不變）
- **觸發判準只有一題：這個檔裝了幾件<u>不相干</u>的事？** **2 件以上** ⇒ 停下評估是否分檔。
  判準是「不相干」（= 單一職責：會不會因**不同的理由**而改動），⛔ 不是幾個方法 / 幾行 / 幾 KB；一條再長的流程仍是一件事。
- **拆檔前的反向檢查（煞車，⛔ 不是觸發）**：拆完之後讀懂一個決定要跳超過 2 個檔，或會切開下方 §D 登記的邏輯 ⇒ ⛔ 不拆或換切法。
- **位元組數降為參考數字**：顯著改動一個檔時在 verification 記一行實測值（1 KB = 1024 B），⛔ 不停手、⛔ 不登記例外、⛔ 不得以「檔太大」為由要求分檔。
- ⛔ **不得以壓縮或刪除說明文字、註解作為守任何判準的手段**；既有註解新舊以 `git show HEAD:<檔>` 全稱比對判定，⛔ 不抽查。
- **沿革留痕（舊制 20 / 40 KB 線的紀錄，⛔ 不再是閘門）**：2026-08-30 基線實測最大檔 `app/sponsor/page.tsx` 11,966 B，
  次大 `app/voteModpack/page.tsx` 10,347 B、`app/launcher/page.tsx` 10,305 B。⚠️ 數字⛔ 不得當現況引用，要現況一律實量。

**B. 元件結構**
- ⛔ **禁止元件內嵌套 `renderXxx()` 回傳 JSX**——這是單檔膨脹的頭號主因。需拆獨立子元件檔。
- **state 就近**：只被單一視圖使用的 state 下放到該子元件，不留父層。
- **純函式外置**：不依賴元件 state 的函式放 `lib/`，且同步補測試。
  ⚠️ `lib/` 目前是空的——**第一個放進去的人負責建立慣例**。
  ⚠️ **並且必須把 `'lib'` 加回 `next.config.js` 的 `eslint.dirs`**（F10 已把它拿掉）——
  否則 `lib/` 裡的程式碼永遠不會被 lint，且⛔ 沒有任何指令會提醒你。

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
| `lib/` | ⚠️ **空目錄**（共用邏輯預留位）。⚠️ F10 已把 `lib` 從 `next.config.js` 的 `eslint.dirs` 拿掉 ⇒ **放第一個檔時必須加回**，否則不會被 lint |
| `docs/LAUNCHER_DESIGN.md` | 啟動器頁設計文件 |

---

## ⚠️ 地雷清單（2026-08-30 實查，⛔ 不要「順手修掉」，先問架構師）

1. ⚠️ **`middleware.ts` 保護的 `/admin` 路由仍不存在**——`app/` 底下沒有 `admin/`
   （F1 的臨時測試路由已於驗收後刪除）。⇒ 這道保護目前**沒有守到任何實際頁面**，
   要新增後台時記得它已經在守。
   ✅ **但「它是否有效」已於 2026-09-04（F1 收案）由假設變為實測確認**：三情境全過——
   未登入被擋（`307` → `/api/auth/signin`）、`ADMIN_DISCORD_ID` 本人可過、
   假 ID 之下**同一個真 token** 立刻被擋，且重新登入被 `signIn` 拒（session 為空）。
   ⇒ ⛔ 不必再懷疑它會不會擋；⛔ 但也不要以為它守著某個頁面。
   ⚠️ **附帶發現**：matcher 是 `/admin/:path*`，它在**路由解析之前**攔截
   ⇒ 頁面不存在也照樣轉向登入頁（實測臨時路由刪除後仍回 `307`、⛔ 不是 404）
   ⇒ 它守的是**路徑空間**，⛔ 不只是既有頁面。
   詳見 `docs/tasks/archive/F1-verification.md`。
2. ✅ **已解（2026-08-30）**：git remote 已依架構師裁定改為
   `NamelessRealms/namelessrealms-web`。⚠️ 保留編號以免其餘各條錯位。
3. ✅ **已解（2026-08-31，F2 收案）**：`web.log` 已移出版控（`git rm --cached`，
   檔案保留於工作目錄），並在 `.gitignore` 補擋（`# debug` 節，精確檔名）。
4. ✅ **已解（2026-08-31，F2 收案）**：`.gitignore` 檔尾重複樣板段已刪（43 行 → 38 行）。
   ⚠️ **經驗（去重前必讀）**：該段**不是純重複**——`.vscode` 與 `.env` 是其中**獨有**條目，
   上半段只有 `.env*.local`、⛔ 擋不到單純的 `.env`。整段刪除會弄丟 `.env` 的忽略保護
   ⇒ 直接踩**鐵則 1**（`.env` 存 `DISCORD_CLIENT_SECRET` / webhook URL）。
   ⇒ 本次是先把兩條併入上半段對應節、再刪該段。**⛔ 日後同類去重一律逐條比對，⛔ 不得整段刪。**
5. ✅ **已解（2026-08-31，F4 收案）**：`package-lock.json` 已刪除（連硬碟一起），
   `.gitignore` 補擋，Dockerfile deps 階段收斂為無條件 yarn。詳見上方「套件管理器」。
   ⚠️ **經驗（驗 `.gitignore` 保護時必讀）**：`git check-ignore` **預設會查 index**，
   ⇒ 對**已追蹤檔**一律回「不忽略」，拿它驗「某已追蹤檔沒被誤擋」是**空測**
   （規則寫成 `*lock*` 也照樣回報通過）。**⇒ 這類檢查一律加 `--no-index`，
   並附負向對照**（故意寫錯規則、證明測得出失敗），⛔ 沒有負向對照就只是換了個指令。
6. **工作樹長期帶未 commit 改動**：2026-08-30 實查 `app/layout.tsx`、`app/staff/page.tsx`、
   `components/ServerSection.tsx` 三檔為 modified。⇒ **`git add .` 會把它們一起帶走**。
   ⚠️ **F9（2026-09-11）新增經驗**：`components/ServerSection.tsx` 同時是 F9 的改動對象
   ⇒ 架構師裁「只收 `<img>` 那幾行」，實作側是用 `git hash-object -w` + `git update-index --cacheinfo`
   把「HEAD 版 + 換 img」寫進 index（⛔ 不用 `git add` / `git stash` / `git checkout` / `git add -p`）。
   ⇒ **該檔會同時出現在 staged 與未 staged，這是預期的**，⛔ 不要「順手」把它們合起來。
   判準：`git diff --cached --numstat <檔>` 應恰為 `2	1`，且 diff ⛔ 不得含工作樹舊改動的字串。

7. ⚠️ **`output: 'standalone'` + production + 無 `sharp` ⇒ `/_next/image` 端點直接回 500**，
   而且 **`yarn dev` 與 `yarn build` 都看不出來**。
   依據：`node_modules/next/dist/server/image-optimizer.js` 第 497–500 行——
   `if (showSharpMissingWarning && nextConfigOutput === "standalone") { log.error(…); throw new ImageError(500, "Internal Server Error") }`。
   ⇒ 本 repo 因此在 `next.config.js` 設 `images: { unoptimized: true }`（F9 裁決 ①丙），
   讓 `next/image` 原樣輸出 `src`、⛔ 不碰最佳化端點。
   ⚠️ **要開圖片最佳化，必須先加 `sharp`，並同時補 `images.remotePatterns`**
   （`/modServer` 與 `/sponsor` 都引外部 hostname）；⛔ 不得只把 `unoptimized` 拿掉——
   本 repo **打 tag 就是發版且沒有 build CI 可擋**，這個 500 只有在正式 image 裡才會炸。

8. ⚠️ **`git worktree` + symlink 的 `node_modules` + `output: 'standalone'` ⇒ 會清空主樹的 `node_modules`**。
   `next build` 會在 `.next/standalone/node_modules` 放一個**指向主樹 `node_modules` 的 symlink**；
   之後在同一棵 worktree 跑 `next dev`，它清 `.next` 時會**穿過那個 symlink 把主樹的 `node_modules` 整個清空**
   （F9 本輪實際發生：`ls node_modules | wc -l` 由 351 變 **0**，dev 隨即 `Cannot find module 'next/dist/pages/_app'`）。
   ⇒ **在 worktree 先 `rm .next/standalone/node_modules`，再 `rm -rf .next`，然後才跑 `next dev`**；
   已中招的修復方式是回主樹跑 `yarn install --frozen-lockfile`（F9 實跑 `exit=0`、351 個項目回來）。

9. ⛔⛔ **證據本身會挾帶機密——落檔前必須掃過**（F9 真機 E2E 當場發現，⚠️ **五方都漏掉**）。
   實例：Discord 頭像 URL 的路徑第一段**就是 `ADMIN_DISCORD_ID` 本人的數字 ID**
   （`https://cdn.discordapp.com/avatars/<ADMIN_DISCORD_ID>/<hash>.png`）——而那是**鐵則 1 明列的機密**。
   F9 的 E2E 計畫原訂「把 console 量測的**回傳字串原樣存成 json**」並隨證據進版控
   ⇒ **照做就會把它永久寫進版本庫**。
   ⚠️ **成因比洞本身更值得記**：本 repo 的稽核火力全部集中在「**指令會不會空轉**」
   （空測判例已累積七例），**⛔ 沒有任何一方問過「這條證據本身會不會挾帶機密」**
   ⇒ **盲點不在深度，在維度。**
   ⇒ **規矩**：凡要把「**真機／實際執行的原始輸出**」（console 回傳、dev log、HAR、截圖旁的 JSON…）
   落檔進版控，**落檔前必須先對 `.env.local` 的每個值做一次比對掃描**，
   ⛔ 不得因為「那只是一張圖的網址／一行 log」就跳過。
   ⚠️ **掃描本身也要配正控**（拿一個已知存在於該檔的字串證明掃得到），否則就是第八例空測。
   ⚠️ 遮蔽時**只遮機密與可反查的識別碼**（本次遮了 ID 與頭像雜湊），其餘欄位**逐字不動**，
   並在檔內註明遮了什麼、⛔ 不得默默改值。

10. ⚠️ **量測腳本對 `position: fixed` 元素的座標會隨捲動灌水**（F9 E2E 副產品）。
   `docs/tasks/F9-evidence/metrics.js` 算的是 `r.top + scrollY`（文件座標）：
   一般元素**捲動不變**，但 `Navbar`（`components/Navbar.tsx` 第 27 行是 `fixed`）的 `r.top`
   是**視窗相對且恆定** ⇒ 加上 `scrollY` 會隨捲動量灌水
   （F9 實測 `159 - 37 = 122`，正是當下的捲動量）。
   ⇒ 用它做前後外觀比對時，**固定元素的 `rect.y` ⛔ 不可直接比**，除非兩次捲動位置相同。
   ⚠️ 這⛔ 不是 bug，但不知道就會把它誤判成「版面變了」。

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
**但抄的來源限 repo**（架構師 2026-09-02 裁決 D-1）：本專案⛔ 沒有 spec 主檔，
規格的等價物是本檔的**程式碼地圖與地雷清單**；前案裁決在
`docs/tasks/{代號}-plan-review.md`「裁決記錄」欄。
⛔ **vault 內容不得抄進派工訊息、也不得寫進任務包**（見 `WORKFLOW.md`「vault 讀寫權」），
⛔ 更不得寫「詳見 vault 某檔」。
⇒ 子代理需要 vault 裡的東西時，由**主迴圈先寫成 repo 檔**（放 `docs/tasks/`）再派它讀。

⚠️ **任務代號：`F{n}`**（單一序列 + 型別欄位，⛔ 不是里程碑制）。
本專案是**完成品**，`M{n}` 會逼出一個假的「M0 專案骨架」。編號規則全文見 `BACKLOG.md` 開頭。

⛔ **本專案沒有 `spec` 主檔，也沒有 `DEV-INDEX.md`**——規格的等價物就是本檔的
程式碼地圖與地雷清單。⇒ ⛔ 不要去找不存在的 spec 章節。
