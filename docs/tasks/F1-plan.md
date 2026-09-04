# 實作計畫：F1 實測 `/admin` middleware 保護真的會擋

> 產出者：實作側（`nr-implementer`）。讀者：規劃側（`nr-planner`）。
> 依 repo `CLAUDE.md` 開發守則第 7 條：**本檔落檔後等 `F1-plan-review.md` 放行才動手**。
> ⛔ 本輪只產這一份 plan，未動任何實碼、未建任何 env 檔、未 `git add`。
>
> **修訂 v2（2026-09-02）**：依 `F1-plan-review.md` 修兩個 ⛔ 阻斷點
> （①D5／R2／§7 表的 Discord ID 外洩分支封堵 ②P2 狀態更新為已滿足），
> 並採納四條非阻斷建議、補記架構師 2026-09-02 的裁決。
> ⛔ **仍未放行實作**——本輪只改本檔，修完需回頭再過一次 review 才動手。
>
> **修訂 v3（2026-09-04，實作與真機步驟已全數執行完畢後回填）**：
> ①**埠號全案由 3000 改為 3100**（架構師 2026-09-02 裁決丙；新增 §0.2 說明成因與例外）
> ②**D7 定案「不做」**（原記「待架構師再裁」，經回報後架構師維持原裁決 ⇒ 移除未定狀態）
> ③P2／Q4／R7 依實跑結果回填（Discord 後台 redirect URI 分兩次註冊、C3 首試失敗後補正）。
> ⚠️ 本輪**未動任何實碼**、未重跑任何驗收步驟；執行結果的完整記錄在 `F1-verification.md`。

---

## 0. 依據與立場

- 任務包：`docs/tasks/F1.md`（2026-09-01）。
- **四個裁決點已由架構師 Yu 於 2026-09-01 拍板：1乙 2乙 3甲 4甲**
  （見任務包「## ✅ 裁決結果」節）。本計畫**只依裁決結果撰寫**，
  ⛔ 未選中的選項不進入本計畫、不列為待議。
- 本任務性質：**驗證債**。repo 實碼**淨變動為零**（臨時路由驗完即刪），
  ⇒ ⛔ 不更新 `CLAUDE.md` 程式碼地圖。

### 0.1 本輪（規劃側）已自行實測的事實

> 以下每一條都是本輪我自己跑指令量到的，⛔ 不是從任務包轉抄。

| 事實 | 實測方式 | 結果 |
|------|----------|------|
| `middleware.ts` 現況 | `cat middleware.ts` / `wc -l -c middleware.ts` | 20 行、529 bytes；`matcher: ["/admin/:path*"]`；`authorized: ({token}) => !!token && token.sub === process.env.ADMIN_DISCORD_ID` |
| `signIn` 判準 | `cat "app/api/auth/[...nextauth]/route.ts"` | `profile?.id === adminId` 才 `return true`，否則 `return false`；`session` callback 把 `token.sub` 塞進 `session.user.id`；`pages: { error: '/auth/error' }` |
| `app/` 底下有無 `admin/` | `find app -type d -name 'admin*'` | **零輸出**（目前不存在） |
| 工作樹有無 env 檔 | `find . -name '.env*' -not -path './node_modules/*'` | **零筆** |
| `.gitignore` 對 env 的保護 | `cat -n .gitignore` | 第 31–33 行 `# local env files` / `.env` / `.env*.local` ⇒ `.env.local` 被擋 |
| dev 埠 | `sed -n '1,25p' package.json` | `"dev": "next dev"`（**無 `-p`**）⇒ 預設 3000 |
| `next-auth` 實裝版本 | `node -p "require('./node_modules/next-auth/package.json').version"` | `4.24.13` |
| 工作樹狀態 | `git status --short` | `M app/layout.tsx` / `M app/staff/page.tsx` / `M components/ServerSection.tsx` / `?? docs/tasks/F1.md` |
| HEAD | `git log --oneline -1` | `a593cfb`；分支 `developers` |
| repo 有無 `.evidence/` | `ls -ld .evidence` | 不存在（見 §12 待答問題 Q3） |

⚠️ 上述皆為**規劃時點**的量測；驗收報告會在實作時**重新量一次**，⛔ 不從本檔轉抄。

### 0.2 埠號定案（2026-09-02 架構師裁決「丙」）—— 本檔全案用 **3100**

⚠️ 上表「dev 埠 ⇒ 預設 3000」是**對 `package.json` 的量測結果，仍為事實**（該 script 至今無 `-p`）。
但 A4 實測發現 **3000 被 `deploy-aegis-bff-1` 佔用、3001 被 `deploy-grafana-1` 佔用**
（均為**別的專案的 Docker 容器**），`next dev` 自動退到 **3002**——⇒ 埠不可預測。
⇒ 架構師 2026-09-02 裁決**丙：固定 3100**，做法是啟動時逐次帶 `-p`：

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn dev -p 3100
```

⛔ **不改 `package.json`**（那會動到共用 script，超出本任務範圍）。
⇒ **本檔以下所有 URL、`NEXTAUTH_URL`、Discord 後台 redirect URI 一律用 3100。**
⚠️ **唯一例外（歷史事實，⛔ 不得改寫）**：**A2/A3 在埠裁決之前就已執行完畢，實際跑在 3002**
（見 `A2-devserver.log` / `A3-devserver.log` 的 `Local:` 行）；
它們只驗情境 (a)，⛔ 不涉 OAuth 回跳，⇒ 埠不同不影響其結論。

---

## 1. 前置條件（硬阻塞，未滿足⛔ 不得開跑真機步驟）

| # | 前置條件 | 誰負責 | 未滿足會怎樣 |
|---|----------|--------|--------------|
| P1 | `F1-plan-review.md` 放行 | 規劃側 | ⛔ 實作不得開始（開發守則第 7 條） |
| P2 | ✅ **已滿足（分兩次；最終為 3100）**：Discord 開發者後台已註冊 redirect URI `http://localhost:3100/api/auth/callback/discord` | **Yu 本人**（已完成） | 情境 (b)(c) 會卡在 OAuth 跳轉，Discord 回 `Invalid OAuth2 redirect_uri`。⇒ 停手回報，⛔ 實作側不得自行去改 Discord 後台設定 |
| P3 | Yu 備妥 `.env.local` 五個變數的**值**（見 §4） | **Yu 本人** | 情境 (b)(c) 無法進行 |

⚠️ P2 的**狀態更新紀錄**（三個時點，⛔ 不得壓縮成「一次就好了」）：
2026-09-01 架構師回報「還沒有」註冊；
2026-09-02 架構師回報「加好了」，由**他本人**在 Discord 開發者後台新增
`http://localhost:3000/api/auth/callback/discord`。⛔ Claude 全程未代為操作。
⚠️ 但埠號其後定案為 **3100**（§0.2 裁決丙）⇒ 已註冊的 3000 那條**對不上**：
2026-09-04 C3 **首次嘗試即失敗**，Discord 回「無效的 OAuth2 redirect_uri」。
依 C3 的「若卡在 OAuth」條款**停手回報架構師**，由**他本人**在後台補上
`http://localhost:3100/api/auth/callback/discord`，重試後 C3 通過。
⛔ Claude 全程未代改 Discord 後台。

⚠️ 但 **Claude 這端無法獨立複驗**此事（沒有可用的已登入瀏覽器），只有 Yu 在後台看得到。
⇒ **首次 OAuth 跳轉即為實測**：若 Discord 回 `Invalid OAuth2 redirect_uri`，代表尚未生效
⇒ **停下回報架構師**，⛔ 實作側不得自行去改 Discord 後台設定。

⚠️ **Phase A（見 §3）不受 P2/P3 阻塞**——它只驗情境 (a)，不需要 Discord 憑證。

---

## 2. 交付物清單

| 交付物 | 位置 | 進版控？ |
|--------|------|----------|
| `F1-plan.md`（本檔） | `docs/tasks/F1-plan.md` | ✅ 是（收案時 commit，待架構師確認） |
| `F1-verification.md` | `docs/tasks/F1-verification.md` | ✅ 是（同上） |
| `.env.local` 骨架（**只有變數名、沒有值**） | 貼在對話 + scratchpad 副本 | ⛔ **否**（裁決 1乙） |
| 臨時路由 `app/admin/f1-probe/page.tsx` | 工作樹 | ⛔ **否**（裁決 3甲，全程不 commit，驗完刪） |
| 過程輸出（curl / build log 等） | scratchpad 落檔 → **關鍵行逐字貼進 `F1-verification.md`** | 報告進版控 |

⚠️ 依 `WORKFLOW.md` 第五節：⛔ 不得在報告寫「輸出見 scratchpad」；
scratchpad 只是工作區，**耐久物是 `F1-verification.md` 內貼出的關鍵行**。

---

## 3. 步驟拆解

> 每步格式：**做什麼 / 預期看到什麼 / 怎麼證明它成立 / 誰執行**。
> 執行者欄位：**[C]** = 實作側自己跑得完；**[Yu]** = 需要架構師本人操作。

### Phase A — 環境探測與情境 (a)（[C] 全程自跑，⛔ 不需 Discord 憑證）

#### A0 [C] 依賴安裝
- **做什麼**：`yarn install --frozen-lockfile`。⛔ 不得跑 `npm install`（會讓已刪除的 `package-lock.json` 復活）。
- **預期**：安裝成功、`yarn.lock` 未被改動。
- **怎麼證明**：貼指令末段輸出（含 `Done in Xs`）+ `git status --short` 顯示 `yarn.lock` 未出現在改動清單。

#### A1 [C] 建臨時路由
- **做什麼**：建 `app/admin/f1-probe/page.tsx`，內容**逐字照任務包 fixture 抄**：
  ```tsx
  export default function F1ProbePage() {
    return (
      <main style={{ padding: "4rem", textAlign: "center" }}>
        <h1>F1 admin probe</h1>
        <p>看得到這頁 = middleware 已放行（token.sub 符合 ADMIN_DISCORD_ID）</p>
      </main>
    );
  }
  ```
- **預期**：檔案存在，`git status` 顯示為**未追蹤**（裁決 3甲：全程不 commit）。
- **怎麼證明**：`find app -type d -name 'admin*'` 有輸出 + `git status --short` 出現 `?? app/admin/`。

#### A2 [C] 探測：完全沒有 `.env.local` 時，情境 (a) 的行為
- **做什麼**：在**不建任何 env 檔**的狀態下起 dev server，
  以無 cookie 的 `curl -i` 打 `/admin/f1-probe`。
- **預期**：⚠️ **未知，需實測**。`next-auth` v4 的 `withAuth` 走 `getToken`，缺 `NEXTAUTH_SECRET` 的行為
  ⛔ 不得靠源碼推理寫成已知（可能是 500、也可能是 302 轉登入頁）。
- **怎麼證明**：貼完整 response 狀態行 + header；並以
  `grep -c 'F1 admin probe' <body 落檔>` 證明 **body 不含 probe 頁內容**（應為 0）。
- **判準**：只要 **body 不含 probe 內容**，就算「有擋住」；狀態碼是 3xx 還是 5xx **據實記錄**，⛔ 不美化。

#### A3 [C] 探測：只有 `NEXTAUTH_SECRET`（⛔ 不填 Discord 三項）時，情境 (a) 的行為
- **做什麼**：
  1. 先確認 `.env.local` 不存在（`test -e .env.local`），存在就停手回報（⛔ 不覆蓋 Yu 的檔）。
  2. 建一份**拋棄式** `.env.local`，內容只有 `NEXTAUTH_SECRET=<自產隨機值>`
     （用 `openssl rand -base64 32` 直接重導進檔案，**⛔ 全程不印到終端、不進報告**）。
  3. 重啟 dev server，重跑 A2 的 curl。
- **預期**：⚠️ 需實測。合理猜測是 302/307 轉向 `/api/auth/signin?callbackUrl=...`，但**以實測為準**。
- **怎麼證明**：同 A2（狀態行 + header + `grep -c` 為 0）。
- **這一步回答的是鐵則 7 清單第 1 題**：「(a) 是否只靠 `NEXTAUTH_SECRET` 就跑得動」。
- **收尾**：A3 結束後**刪除**這份拋棄式 `.env.local`（`rm .env.local` + `test -e` 確認已不存在），
  再進 Phase B。⚠️ 這是為了不讓我的拋棄式值污染 Yu 之後要填的正式檔。

#### A4 [C] 埠確認
- **做什麼**：dev server 啟動輸出落檔，`grep` 出 `Local:` 那一行。
- **預期**：⚠️ 需實測，⛔ 不預寫。
- **怎麼證明**：貼該行原文。⚠️ `package.json` 的 `"dev": "next dev"` 無 `-p`（本輪已實測）⇒ 預設 3000；
  但**仍以啟動輸出的實際埠為準**，若不是 3000 則全案的 URL 與 `NEXTAUTH_URL` 一併改用實際埠並在報告記錄。
- ✅ **實測結果（已執行）**：3000 被 `deploy-aegis-bff-1`、3001 被 `deploy-grafana-1`（別的專案的 Docker）
  佔用，`next dev` 自動退到 **3002** ⇒ 埠不可預測。
  ⇒ 架構師 2026-09-02 裁決**丙：固定 3100**（`yarn dev -p 3100`，⛔ 不改 `package.json`）。詳見 §0.2。

#### A5 [C] `.gitignore` 保護驗證（含負向對照）
- **做什麼**：
  - `git check-ignore --no-index -v .env.local` → 應命中 `.gitignore:33:.env*.local`
  - **負向對照**：`git check-ignore --no-index -v .env.local.f1-backup` → 應**不命中**（退出碼 1）
- **預期**：正向命中、負向不命中。
- **怎麼證明**：貼兩條輸出 + 退出碼。
- **為什麼要這樣做**：`CLAUDE.md` 地雷清單第 5 條——`git check-ignore` **預設會查 index**，
  ⇒ 對已追蹤檔一律回「不忽略」，是空測；**一律加 `--no-index` 並附負向對照**。
- **附帶結論**：負向對照證明備份檔若取名 `.env.local.f1-backup` **不會被 gitignore 擋**
  ⇒ 所以 **§5 的備份檔一律放 scratchpad，⛔ 不放 repo 工作樹**。

---

### Phase B — 交付 `.env.local` 骨架（[C] 產骨架 → [Yu] 填值）

#### B1 [C] 產骨架並交付
- 見 §4。骨架**只有變數名**，⛔ 不含任何值。

#### B2 [Yu] 填值
- Yu 填入五個值並存檔。

#### B3 [C] 非侵入式檢查（⛔ 不印值）
- **做什麼**：只列出**變數名 + 是否已填**，⛔ 不印任何值：
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && awk -F= '/^[A-Z]/{v=substr($0,index($0,"=")+1); print $1, (v==""?"EMPTY":"FILLED")}' .env.local
  ```
- **預期**：五行，全部 `FILLED`。
- **怎麼證明**：貼這五行（只有變數名與 FILLED/EMPTY，⛔ 無值）。
- ⚠️ 任一行是 `EMPTY` ⇒ 回頭請 Yu 補，⛔ 不自行填值。

---

### Phase C — 情境 (a) 正式版 + 情境 (b) 正向（[Yu] 主導）

#### C1 [C] 情境 (a)：完整 env 下、未登入應被擋
- **做什麼**：重啟 dev server，以**無 cookie** 的 `curl -i` 打 `/admin/f1-probe`。
- **預期**：3xx 轉向 next-auth 登入路徑（或等效拒絕），body ⛔ 不含 probe 內容。
- **怎麼證明**：狀態行 + `location` header + `grep -c 'F1 admin probe'` = 0。
- ⚠️ 這是情境 (a) 的**權威證據**（A2/A3 是環境探測，用來回答鐵則 7 的第 1 題）。

#### C2 [Yu] 情境 (a) 瀏覽器對照
- **做什麼**：Yu 用**無痕視窗**開 `http://localhost:3100/admin/f1-probe`。
- **預期**：看到 Discord 登入頁（或被導離），⛔ 看不到「F1 admin probe」。
- **怎麼證明**：Yu 口述看到什麼；報告記錄他回報的原文（必要時附截圖）。
- ⚠️ **截圖遮蔽**：Discord 登入頁可能顯示 Yu 的帳號名／頭像 ⇒ 入報告的截圖以 probe 頁為主；
  若必須附含帳號資訊的畫面，**遮蔽後再入**，⛔ 不得原樣貼進要 commit 的檔案（鐵則 1）。

#### C3 [Yu] 情境 (b)：本人登入應能過
- **做什麼**：Yu 用**本人 Discord 帳號**完成 OAuth 登入，再開 `http://localhost:3100/admin/f1-probe`。
- **預期**：看到「F1 admin probe」標題頁。
- **怎麼證明**：Yu 回報看到該標題；報告記錄。
- ⛔ **禁止事項**：⛔ 不得請 Yu 開 `http://localhost:3100/api/auth/session`
  ——**登入成功時該端點會回傳含 Discord ID 的 JSON**，開了就有貼進報告的風險（鐵則 1）。
  正向情境一律只看 probe 頁本身。
- **若卡在 OAuth**（Discord 回 `Invalid OAuth2 redirect_uri`）：代表 P2 於 2026-09-02 回報的新增
  **尚未生效** ⇒ **停下回報架構師**，⛔ 實作側不自行改 Discord 後台。
  ⚠️ 這一步同時是 P2 的**唯一實測點**（Claude 端⛔ 無法獨立複驗後台設定）。

---

### Phase D — 情境 (c) 反向驗證（裁決 2乙，[C] 改設定 / [Yu] 操作瀏覽器）

#### D1 [C] 備份 `.env.local`
- **做什麼**：`cp .env.local "<scratchpad>/env.local.f1-backup"`。
- **預期**：備份存在、內容與原檔相同。
- **怎麼證明**：`diff -q` 原檔與備份 → 退出碼 0（⛔ 只貼退出碼，⛔ 不貼檔案內容）。
- ⚠️ 備份放 **scratchpad**，⛔ 不放 repo 工作樹（A5 已證明 `.env.local.f1-backup` 這種檔名**不會**被 gitignore 擋）。

#### D2 [C] 把 `ADMIN_DISCORD_ID` 改成假 ID
- **做什麼**：只改該一行，值改為 `000000000000000001`
  （**刻意選一個明顯不可能是真人的 snowflake；此值非機密，可寫進報告**）。
  用精確錨點編輯（只匹配 `^ADMIN_DISCORD_ID=` 該行），⛔ 不整檔覆寫。
- **預期**：檔案只有該行變動。
- **怎麼證明**：
  - `grep -c '^ADMIN_DISCORD_ID=000000000000000001$' .env.local` → `1`
  - 比對「備份檔的變數名清單」與「改後檔的變數名清單」（`awk -F= '{print $1}'`）→ 無差異
  - ⛔ 全程不印其他行的值。

#### D3 [C] 重啟 dev server
- **做什麼**：停掉舊 process、重啟（確保 middleware 讀到新的 env）。
- **怎麼證明**：新的啟動輸出（含埠）落檔並貼關鍵行。

#### D4 [Yu] middleware 負向（**用真 token**）
- **做什麼**：Yu **保留 C3 的既有登入 session**，直接開 `http://localhost:3100/admin/f1-probe`。
- **預期**：**被擋**（轉向登入頁 / 拒絕），⛔ 看不到 probe 頁。
- **為什麼有價值**：token 是真的、`token.sub` 是真的，只是 `ADMIN_DISCORD_ID` 變了
  ⇒ 這條走的是 middleware `token.sub === ADMIN_DISCORD_ID` 的 **false 分支**，
  是**唯一一次用真 token 驗到 middleware 負向路徑**的機會。
- **怎麼證明**：Yu 回報結果；報告記錄。同時請 Yu 確認三件事：
  **未登出、同一瀏覽器、未清 cookie**。
- ⚠️ **隱含假設（verification 必須誠實標註）**：「被擋」有兩種可能成因——
  ①`token.sub` 不符（要證的那條）②C3 的 session 其實已失效／cookie 掉了。
  兩者從瀏覽器行為**分不出來**，而唯一能直接分辨的手段（開 `/api/auth/session`）
  在此時點是⛔ 禁區（正向 session 仍在時會回真 Discord ID）。
  ⇒ `F1-verification.md` 必須寫明「此步隱含假設 session 存續，依據為
  **D2→D4 時間相鄰**（分鐘級，next-auth JWT 預設效期以天計）＋**架構師確認期間未登出**」，
  ⛔ 不得把 D4 寫成無條件的鐵證。
  ⚠️ D7 補不了這個洞（它是**重新登入**，⛔ 不證明舊 session 曾存續）。

#### D5 [Yu] `signIn` 負向
- **做什麼**：Yu 登出 → 重新走一次 Discord OAuth 登入。
- **預期**：**登入被拒**，被導向 `/auth/error`。
  ⚠️ **看到 404 是已知現況（裁決 4甲），⛔ 不算 F1 失敗、⛔ 不得中途動手修掉它。**
- **判準（必須是這一條，不是畫面好不好看）**：**未建立 session**。
- **怎麼證明**：Yu 開 `http://localhost:3100/api/auth/session`，
  **只回報「空」或「非空」兩種答案之一**——
  ⛔ 非空時不得把內容貼回對話、⛔ 不得貼 JSON、⛔ 不得截圖、⛔ 不得貼任何欄位值。
  ⚠️ 只在**負向**情境開這個端點；正向情境⛔ 禁開（見 C3）。
  另可再打一次 `/admin/f1-probe` → 仍被擋。
- ⚠️ **若回報「非空」**：代表假 ID 之下 session 竟然仍建立了 ⇒ **守門被突破**，屬**真發現**（R2）。
  處置是**停下回報架構師**，⛔ 不得自行修守門、⛔ 不得為了取證去 dump session、
  ⛔ 不得把 session 原文或任何 Discord ID 寫進報告（鐵則 1）。

#### D6 [C] 還原 `.env.local`
- **做什麼**：`cp "<scratchpad>/env.local.f1-backup" .env.local`。
  ⛔ **不用 `git checkout`**——理由有二：①`.env.local` 根本不在版控裡，救不回來；
  ②`git checkout` 會清掉工作樹裡三個長期未 commit 的舊改動
  （`app/layout.tsx` / `app/staff/page.tsx` / `components/ServerSection.tsx`）。
- **預期**：還原後與備份完全相同。
- **怎麼證明**：`diff -q "<backup>" .env.local; echo "exit=$?"` → `exit=0`（⛔ 只貼退出碼，⛔ 不貼內容）。
- 重啟 dev server。

#### D7 [Yu] 還原後健全性檢查 —— **定案：不做（已結案，⛔ 不再待議）**
- ⚖️ **狀態**：架構師 2026-09-02 裁決「**不做**」；規劃側在 `F1-plan-review.md`
  **建議改為做**（理由：那是「還原真的生效」的唯一直接證據，成本只是一次登入），
  該建議已回報架構師，**架構師維持原裁決「不做」**（2026-09-04 由主迴圈轉達；
  ⚠️ 本行是**實作側據轉達所做的紀錄**，⛔ 不是實作側的裁決）。
  ⇒ **本題不再是未定因素**：D7 **不執行**，驗收據實標「未做」+ 原因。
  ⛔ 實作側不得自行改成「做」。**以下步驟內容保留在文件裡**供日後複驗參考。
- **做什麼**：Yu 重新登入一次，開 `/admin/f1-probe`。
- **預期**：回到 C3 的結果（看得到頁面）⇒ 證明還原確實生效、環境沒被 D2 弄壞。
- **成本**：多一次登入。定案「不做」⇒ 報告據實標「未做」+ 原因（架構師裁決），⛔ 不寫成已做。
- ⇒ 代價已明列於 §13：**缺少「還原確實生效」的直接證據**。
  ⚠️ D6 的 `diff` 退出碼 0 + md5 回到原值只證明**檔案內容**還原，
  ⛔ 不證明**執行環境**在還原後仍如 C3 般可通行。
- ⚠️ 即使日後改為做，D7 也**補不了 D4 的 session 存續假設**（它是重新登入）
  ⇒ ⛔ 報告不得把 D7 寫成 D4 的佐證。

---

### Phase E — 收尾與回歸（[C] 全程自跑）

#### E1 [C] 停掉 dev server
- **怎麼證明**：`lsof -i :3100` 或 `ps` 查無殘留 process 的輸出。

#### E2 [C] 刪除臨時路由（**範圍內必做**）
- **做什麼**：刪 `app/admin/f1-probe/page.tsx`，再移除 `app/admin/f1-probe/` 與 `app/admin/` 兩層空目錄。
- **預期**：`app/` 底下不再有任何 `admin*` 目錄。
- **怎麼證明**（裁決 3甲要求的收尾證明，**驗收報告必附**）：
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && find app -type d -name 'admin*'; echo "exit=$?"
  ```
  → **零輸出**；並附 `git status --short` 顯示**只剩**那三個舊改動 + 本任務文件。

#### E3 [C] 嚴格指令（**必須在 E2 之後跑**）
- **做什麼**（逐字，`--max-warnings 0` ⛔ 不可省）：
  - `yarn lint --max-warnings 0`
  - `yarn build`
- **預期**：兩者皆 green。
- **怎麼證明**：貼實際輸出末段 + 退出碼。
- ⚠️ 本專案 ⛔ **沒有 build/lint CI** ⇒ 報告 CI 欄一律以本地輸出為準，
  ⛔ 不得寫「等 remote Actions 綠」；⛔ 不得為測試打 `v*.*.*` tag（打 tag 就是發版）。

#### E4 [C] 既有頁面回歸抽查
- **做什麼**：`yarn dev -p 3100` 起服務，`curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/` 抽查首頁。
- **預期**：`200`。
- **怎麼證明**：貼狀態碼；跑完再停 server。

#### E5 [C] 產出 `F1-verification.md`
- 格式沿用 `docs/tasks/verification_template.md`；內容要求見 §11。

#### E6 [C] 回報，**等架構師確認才 commit**
- ⛔ **尚未 commit/push，等待架構師確認**。任務包任何措辭均⛔ 不構成 push 預授權。
- 屆時只 commit `docs/tasks/F1.md`、`F1-plan.md`、`F1-plan-review.md`、`F1-verification.md`（+ 稽核檔），
  **逐檔 `git add`**，⛔ **禁用 `git add .`**（會誤帶那三個舊改動）。

---

## 4. `.env.local` 骨架（裁決 1乙 的交付物）

### 4.1 骨架內容（**只有變數名，⛔ 沒有值**）

```
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
ADMIN_DISCORD_ID=
```

### 4.2 各變數的用途與來源

| 變數 | 用途 | 來源 | 缺了會卡在哪 |
|------|------|------|--------------|
| `NEXTAUTH_SECRET` | JWT 簽發／解讀。middleware 的 `getToken` 與 auth route 共用 | Yu 自產強隨機字串（例：`openssl rand -base64 32`） | 連情境 (a) 都可能跑不了（⚠️ 實際行為由 A2/A3 實測回答） |
| `NEXTAUTH_URL` | OAuth 回跳網址基準 | 固定填 `http://localhost:3100`（埠裁決丙，見 §0.2） | 情境 (b) 卡在 callback |
| `DISCORD_CLIENT_ID` | 發起 OAuth | Discord 開發者後台 → 該應用程式 OAuth2 頁 | (b)(c) 無法發起 OAuth |
| `DISCORD_CLIENT_SECRET` | token 交換 | 同上 | (b)(c) token 交換失敗 |
| `ADMIN_DISCORD_ID` | **兩層守門的比對基準**（middleware 比 `token.sub`、`signIn` 比 `profile.id`） | Yu 本人的真實 Discord 使用者 ID | (b) 必失敗 |

### 4.3 交付方式（裁決 1乙）

- 骨架**貼在對話**給 Yu，同時在 **scratchpad** 留一份副本。
- ⛔ **不進版控、⛔ 不建 `.env.example`、⛔ 不放進 repo 工作樹**（除了 Yu 自己填好的 `.env.local`，
  而它已被 `.gitignore` 第 33 行 `.env*.local` 擋住——A5 會實測驗證）。
- ⛔ 骨架裡不得有任何真實值；⛔ 我不代填任何一格。

### 4.4 給 Yu 的建檔指令（⚠️ 執行時一次只給一條，見 §6）

產生強隨機 secret（輸出直接複製，⛔ 不要貼回對話給我）：

```bash
openssl rand -base64 32
```

建立骨架檔（**空值**，之後用編輯器填）：

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && printf 'NEXTAUTH_SECRET=\nNEXTAUTH_URL=http://localhost:3100\nDISCORD_CLIENT_ID=\nDISCORD_CLIENT_SECRET=\nADMIN_DISCORD_ID=\n' > .env.local
```

用預設編輯器打開來填值：

```bash
open -t "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/.env.local"
```

⚠️ 填完存檔即可，⛔ **不要把檔案內容貼回對話**——我用 §3 B3 的非侵入式指令自行確認五格都已填。

---

## 5. 還原保護（裁決 2乙）

| 規則 | 內容 |
|------|------|
| 備份時機 | **改 `ADMIN_DISCORD_ID` 之前**（D1），⛔ 不得改了才想到 |
| 備份位置 | **scratchpad**，⛔ 不放 repo 工作樹（A5 負向對照證明 `.env.local.f1-backup` 這類檔名不被 gitignore 擋） |
| 還原方式 | `cp` 備份回原位，再 `diff -q` 比對 → 退出碼 0 |
| ⛔ 禁用 | **`git checkout`**。理由①`.env.local` 不在版控裡，救不回來；②它會清掉工作樹裡三個長期未 commit 的舊改動 |
| 三個舊檔 | `app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx` —— **與 F1 無關**，⛔ 全程不碰、⛔ 不 commit、⛔ 禁用 `git add .` |
| 報告揭露 | 「改動過又還原的檔案清單 + 比對方式 + 比對結果（退出碼）」寫進 verification，⛔ 不貼檔案內容。⚠️ 該清單**必須包含 A3 的拋棄式 `.env.local`（建立 → 刪除）**，避免稽核側誤判為殘留 |
| 備份耐久性 | ⚠️ scratchpad 是 **session 專屬**，實作側中途卡死時備份可能一併消失（F4 曾發生）。**可接受**——五個值 Yu 手上都有、最壞重填。⇒ verification 據實記一句這個取捨，⛔ 不因此把備份改放 repo 工作樹 |

---

## 6. 真機 E2E 執行紀律（`WORKFLOW.md`「真機 E2E 協議」）

> ⚠️ 下方 §7 是**完整步驟表**，寫在 plan / verification 裡是為了**供日後複驗**。
> ⛔ **執行時不得一次貼整份步驟表給 Yu**——一次只給**一個**步驟、附過線標準，
> **等他回報結果才給下一步**。

其他紀律：
- 給 Yu 的每個指令都是**可直接複製貼上的完整指令**：bash 區塊、**一個區塊一條**、
  ⛔ 不加 `$` 提示符；路徑含空格一律加引號。
- fixture（臨時路由）由實作側**事先備妥**，⛔ 不叫 Yu 自己建檔。
- 真機揭出的**既有缺口**（例：`/auth/error` 404）⛔ 不現場擴大處理，登記回報即可。

---

## 7. 完整真機步驟表（供日後複驗；執行時逐步給）

| # | 步驟 | 執行者 | 過線標準 |
|---|------|--------|----------|
| P2 | Discord 後台註冊 `http://localhost:3100/api/auth/callback/discord` —— ✅ **已完成（分兩次：2026-09-02 先加 3000；埠改 3100 後 C3 首試失敗，架構師本人於 2026-09-04 補加 3100）** | **Yu**（已完成） | Claude 端⛔ 無法複驗；**首次 OAuth 跳轉即為實測**：未回 `Invalid OAuth2 redirect_uri` 即通過，回了就**停下回報架構師**（本案實際即走了這條停手路徑） |
| A0 | `yarn install --frozen-lockfile` | C | 安裝成功、`yarn.lock` 未變動 |
| A1 | 建臨時路由 `app/admin/f1-probe/page.tsx` | C | 檔案存在且為未追蹤 |
| A2 | 無 env 時 curl `/admin/f1-probe` | C | body 不含 `F1 admin probe`（狀態碼據實記錄） |
| A3 | 只有 `NEXTAUTH_SECRET` 時 curl 同上 | C | 同上；並據此回答鐵則 7 第 1 題 |
| A4 | 確認 dev 實際埠 | C | 啟動輸出的 `Local:` 行 |
| A5 | `git check-ignore --no-index` 正向 + 負向對照 | C | 正向命中 `.gitignore:33`、負向退出碼 1 |
| B1 | 交付 `.env.local` 骨架 | C | 骨架只有變數名 |
| B2 | 填入五個值 | **Yu** | 存檔完成 |
| B3 | 非侵入式檢查五格已填 | C | 五行皆 `FILLED`（⛔ 無值輸出） |
| C1 | 完整 env 下、無 cookie curl `/admin/f1-probe` | C | 3xx 轉登入路徑；`grep -c` = 0 |
| C2 | 無痕視窗開 `/admin/f1-probe` | **Yu** | 看不到 probe 頁 |
| C3 | 本人 Discord 登入 → 開 `/admin/f1-probe` | **Yu** | **看得到「F1 admin probe」** |
| D1 | 備份 `.env.local` 到 scratchpad | C | `diff -q` 退出碼 0 |
| D2 | `ADMIN_DISCORD_ID` 改為 `000000000000000001` | C | 該行 `grep -c` = 1；變數名清單未變 |
| D3 | 重啟 dev server | C | 新啟動輸出 |
| D4 | 用**既有 session** 開 `/admin/f1-probe` | **Yu** | **被擋**（middleware 負向・真 token）；另請 Yu 確認「未登出／同瀏覽器／未清 cookie」，報告須標註 session 存續假設 |
| D5 | 登出 → 重新 OAuth 登入 | **Yu** | **登入被拒**；Yu 只回報 `/api/auth/session` 是「**空**」或「**非空**」（⛔ 非空時不得貼內容／JSON／截圖／欄位值；非空 = 守門被突破 ⇒ 停手回報）。看到 404 是已知現況，⛔ 不算失敗 |
| D6 | 用備份檔還原 `.env.local` + 重啟 | C | `diff -q` 退出碼 0 |
| D7 | 還原後重新登入確認 —— **定案「不做」**（規劃側曾建議做，架構師維持原裁決） | **Yu** | ⛔ **不執行** ⇒ 驗收據實標「未做」+ 原因；代價見 §13 |
| E1 | 停 dev server | C | 無殘留 process |
| E2 | 刪臨時路由與 `app/admin/` | C | `find app -type d -name 'admin*'` **零輸出** |
| E3 | `yarn lint --max-warnings 0` / `yarn build` | C | 皆 green（**須在 E2 之後**） |
| E4 | 首頁抽查 | C | HTTP `200` |
| E5 | 產 `F1-verification.md` | C | 五件套之一落檔 |
| E6 | 回報，等待 commit 確認 | C → **Yu** | ⛔ 未獲確認前不 commit/push |

**需要 Yu 本人操作的步驟共 7 個**：**P2、B2、C2、C3、D4、D5、D7**，
外加最後的 **E6 commit/push 確認**。
⚠️ 其中 **P2 已由架構師本人完成**（分兩次，見上表），**D7 定案「不做」**（⛔ 不再待議）
⇒ 實際待執行的 Yu 操作為 **B2、C2、C3、D4、D5** 五步 + E6 確認。

---

## 8. 鐵則 7（實作側必查）清單——用什麼指令驗

> 規劃側沒有 Bash，任務包把下列項目標為「實作側必查」。以下逐條寫明驗法。
> ⚠️ 每一條都**實跑**，⛔ 不得以源碼推理代替；查不了的據實寫「仍未查證 + 原因」。

| # | 必查項 | 驗法（實跑指令） | 記在哪 |
|---|--------|------------------|--------|
| 1 | 情境 (a) 是否**只靠 `NEXTAUTH_SECRET`** 就跑得動（不填 Discord 三項） | A2（無 env）與 A3（只有 secret）兩組對照 curl：`curl -sS -i http://localhost:3100/admin/f1-probe` 落檔 → 貼狀態行 + `grep -c 'F1 admin probe'`。⚠️ **A2/A3 實際執行於 3002**（埠裁決之前，見 §0.2）；不涉 OAuth ⇒ 結論不受埠影響 | verification「測試結果・負向流程」 |
| 2 | `token.sub` 實測是否等於 `profile.id` | **不外洩 ID 的間接證明**，見 §8.1 | verification「審計確認」 |
| 3 | `yarn install --frozen-lockfile` 實際輸出 | A0 | verification「CI」 |
| 4 | `yarn lint --max-warnings 0` 實際輸出 | E3（⛔ `--max-warnings 0` 不可省） | verification「CI」 |
| 5 | `yarn build` 實際輸出 | E3 | verification「產物重建」 |
| 6 | 本機埠 | A4：`grep 'Local:' <dev 啟動輸出落檔>`。⚠️ `package.json` 的 dev script 是 `next dev`（無 `-p`）⇒ 預設 3000，但**以實際輸出為準**。✅ **已查**：3000／3001 被別的專案 Docker 佔用、自動退到 3002 ⇒ 裁決丙固定 **3100**（`yarn dev -p 3100`），見 §0.2 | verification「設計重點」 |
| 7 | 刪除後 `app/` 底下確實沒有 `admin/` | E2：`find app -type d -name 'admin*'` | verification「守界聲明」 |

⛔ **不得跑 `npm install`**（會讓已刪除的 `package-lock.json` 復活，`CLAUDE.md`「套件管理器」節）。

### 8.1 不外洩 ID 的 `token.sub == profile.id` 證明法

**⛔ 不可行的做法（明確排除）**：
- ⛔ 用 `console.log` 印 `token.sub` / `profile.id`（鐵則 1 + 機密不入 log）。
- ⛔ 請 Yu 在正向情境開 `/api/auth/session`（該回應含 `session.user.id`）。
- ⛔ 貼 `token.sub` 的雜湊值。理由：Discord snowflake 的**搜尋空間有限**，
  雜湊可被暴力還原 ⇒ 那仍是外洩，只是慢一點。

**採用的做法：以共同常數做遞移證明 + 差分佐證。**

**(1) 遞移證明（正向，來自 C3）**

C3 成立時，Yu 一次動作同時通過了兩層：

- 通過 `signIn` callback ⇒ 程式碼 `profile?.id === process.env.ADMIN_DISCORD_ID` 為 **true**
  ⇒ `profile.id === ADMIN_DISCORD_ID`
- 通過 middleware `authorized` ⇒ 程式碼 `token.sub === process.env.ADMIN_DISCORD_ID` 為 **true**
  ⇒ `token.sub === ADMIN_DISCORD_ID`

兩式右側是**同一個環境變數、同一個 process 生命週期內未被改動**
⇒ 由等式遞移律：**`token.sub === profile.id`**。證畢，**全程不需知道該值是什麼**。

**(2) 差分佐證（負向，來自 D2 + D4）**

只把 `ADMIN_DISCORD_ID` 換成 `000000000000000001`（其他一切不變、token 不變），
middleware 立刻改判「擋」（D4）⇒ 證明 `authorized` 真的在**比對這個變數的值**，
⛔ 不是「有 token 就過」。這排除了「(1) 的通過其實來自某個恆真條件」的可能。

**(3) 報告寫法**

verification 的「審計確認」節寫出上面 (1)(2) 的推理與其所依賴的**實測事實編號**
（C3 通過、D4 被擋），並聲明「⛔ 全程未取得、未列印、未儲存任何 Discord ID 值」。

⚠️ (2) 的差分佐證**必須同時標註 D4 的隱含假設**（session 存續，判準＝D2→D4 時間相鄰
＋架構師確認未登出）——⛔ 不得把 D4 寫成無條件的鐵證。詳見 §3 D4 步驟的說明。

---

## 9. 風險與退場

| 風險 | 判斷 | 處置 |
|------|------|------|
| **R1 情境 (a) 沒被擋**（curl body 含 `F1 admin probe`） | ⚠️ **這是真發現，不是實作失敗**——代表 middleware 保護實際上沒守住 | **立刻停手**，把實際輸出寫進報告，回報架構師。⛔ **不得自行修 `middleware.ts`**（任務包：一個字都不改） |
| **R2 假 ID 之下仍能登入 / 仍進得去 probe 頁**（D4/D5 失敗） | ⚠️ 同上，**真發現** | 同 R1：停手、留證、回報，⛔ 不自行修守門。⚠️ **留證的例外**：R2 的留證 ⛔ **不得含 `/api/auth/session` 原文或任何 Discord ID**（⛔ 含雜湊、⛔ 含部分遮罩皆不可——snowflake 搜尋空間有限，雜湊可暴力還原）。⇒ 只寫「session 非空」這種**描述性記錄**＋確認無機密的片段，⛔ 不得為了取證去 dump session |
| **R3 OAuth 卡在 redirect（P2 已回報完成，但 Claude 端⛔ 無法複驗）** | 環境阻塞，非守門問題 | 停在 C3，回報架構師：2026-09-02 已回報新增，若仍回 `Invalid OAuth2 redirect_uri` 代表未生效，由他本人再確認後台。⛔ 實作側**不得**自行去改 Discord 後台。報告該步標「**待人工**」，⛔ 不得以推理補寫結果 |
| **R4 缺 `NEXTAUTH_SECRET` 導致 dev server 500** | 這是 A2 要**回答的問題**本身，不是失敗 | 據實記錄狀態碼與錯誤型態（⛔ 不貼含機密的 stack）。只要 body 不含 probe 內容就記「有擋住，但形式是錯誤而非乾淨轉向」 |
| **R5 `.env.local` 還原後 `diff` 不為 0** | 還原失敗 | 停手回報，⛔ 不用 `git checkout` 搶救（救不回且會清掉三個舊改動）。備份檔仍在 scratchpad，請 Yu 一起確認 |
| **R6 E3 的 lint/build 失敗** | 若在 E2（刪路由）之後失敗，代表工作樹被動到了不該動的地方 | 比對 `git status --short` 是否仍只有那三個舊改動；若有額外改動，停手回報，⛔ 不自行「順手修」 |
| **R7 dev server 埠不是 3000** —— ⚠️ **已發生（不是假想風險）** | 環境差異：3000／3001 被別的專案的 Docker 容器佔用，`next dev` 退到 3002 | 全案 URL 與 `NEXTAUTH_URL` 一併改用實際埠，並在報告記錄；⚠️ 若改埠，Discord 後台的 redirect URI 也要對應（回報 Yu 決定，⛔ 不自行改後台）。✅ **實際處置**：架構師 2026-09-02 裁決**丙：固定 3100**（§0.2）；Discord 後台的 3100 那條**當時尚未註冊** ⇒ C3 首試回「無效的 OAuth2 redirect_uri」，依條款停手回報，架構師本人補加後通過 |
| **R8 中途中斷，工作樹殘留臨時檔** | 裁決 3甲的已知代價 | 一旦恢復，第一件事是 `find app -type d -name 'admin*'` 檢查並清乾淨；報告據實記錄殘留期間 |

⚠️ **共同原則**：R1/R2 這類「守門其實沒守住」的結果，是本任務**最有價值的產出**，
⛔ 不得為了讓報告好看而修掉再重跑。發現即停手、留證、回報架構師裁決。

---

## 10. 守界聲明（本計畫承諾不做的事）

- ⛔ 不改 `middleware.ts`（一個字都不改）。
- ⛔ 不改 `app/api/auth/[...nextauth]/route.ts`（裁決 2乙只改 `.env.local` 的值，⛔ 不動任何 `.ts`）。
- ⛔ 不建正式 `/admin` 後台頁面。
- ⛔ 不補 `app/auth/error` 頁（裁決 4甲；另記 backlog 由主迴圈處理）。
- ⛔ 不建 `.env.example` 進版控（裁決 1乙）。
- ⛔ 不碰 `app/layout.tsx` / `app/staff/page.tsx` / `components/ServerSection.tsx`。
- ⛔ 不 `git add .`（一律逐檔 add）。
- ⛔ 不打任何 `v` 開頭的 tag（打 tag 就是發版）。
- ⛔ 不預先修改 `CLAUDE.md`（含地雷清單第 1 條與程式碼地圖）。
- ⛔ 不碰知識庫路徑（實作側無存取權，由守門機制強制）。
- ⛔ 機密不入 log：`console.log` / `console.error` ⛔ 不印 token、webhook URL、`ADMIN_DISCORD_ID`、
  `DISCORD_CLIENT_SECRET`、`NEXTAUTH_SECRET`。貼任何終端輸出前**逐行確認無機密**，並在報告聲明已確認。

---

## 11. 收尾

- 產出 `docs/tasks/F1-verification.md`（格式沿用 `verification_template.md`），
  必含：①§8.1 的兩層守門同值間接證明 ②「所有貼出輸出已逐行確認無機密」的聲明
  ③改動過又還原的檔案清單與比對方式（**含 A3 拋棄式 `.env.local` 的建立→刪除**）
  ④E2 的刪除證明輸出 ⑤**D4 的 session 存續假設標註**（§3 D4、§8.1）
  ⑥**D7 據實標「未做」+ 原因（架構師 2026-09-02 裁決「不做」，經規劃側再議後維持 ⇒ 定案）**
  ⑦備份放 scratchpad 的耐久性取捨（§5）。
- ⚠️ **D5 的 session 端點結果只寫「空／非空」**，⛔ 不得貼原文、JSON、截圖或任何 Discord ID
  （含雜湊、含遮罩皆不可）。
- **收案時要回頭更新 `CLAUDE.md` 地雷清單第 1 條**——該條目前寫「`/admin` 保護沒守到任何頁面」，
  F1 做完後其狀態會改變。⚠️ **改成什麼由主迴圈於收案時決定**，
  實作側⛔ 不預先改，只在 verification 末尾留這一句提醒。
- ⛔ **commit/push 前回報，待架構師確認。** 任務包與本計畫任何措辭均⛔ 不構成 push 預授權。

---

## 12. 待架構師回答的問題 —— ✅ **2026-09-02 已裁決**

> 架構師 2026-09-02 逐字回覆「**全預設**」⇒ 下表各題**全數採納本檔的建議值**。
> ⚠️ Q2（D7）當時尚有未定因素，**已於 2026-09-04 定案**（見該列）⇒ 本表⛔ 已無待議項。

| # | 問題 | 建議 | 裁決（2026-09-02） |
|---|------|------|----------|
| Q1 | 全部驗完後，`.env.local` 要**保留**在硬碟還是刪掉？ | **保留**（已被 `.gitignore` 擋、不影響 repo 淨變動，且日後本機開發還用得到）。若要刪，請明講，我會刪並在報告記錄 | ✅ **保留**（已被 `.gitignore` 擋）。報告據實記錄 |
| Q2 | D7（還原後再登入一次確認）要做嗎？成本是 Yu 多登入一次 | **建議做**——它是「還原確實生效」的唯一直接證據 | ✅ **定案：不做**。2026-09-02 裁決「不做」；規劃側在 `F1-plan-review.md` 建議**改為做**，經回報後**架構師維持原裁決**（2026-09-04 由主迴圈轉達）⇒ ⛔ 不再是未定因素。驗收據實標「未做」+ 原因；D7 步驟內容**保留**在 §3 供日後複驗，⛔ 實作側不得自行改成「做」 |
| Q3 | 全域紀律要求「證據落 `.evidence/`」，但本 repo **沒有** `.evidence/` 慣例（本輪實查不存在），且本任務要求淨變動為零——新增未追蹤目錄與該要求相衝 | **不建 `.evidence/`**，改依 `WORKFLOW.md` 第五節：關鍵行**逐字貼進 `F1-verification.md`**（進版控 ⇒ 耐久），scratchpad 只當工作區 | ✅ **不建 `.evidence/`**：關鍵行逐字貼進 `F1-verification.md` |
| Q4 | P2（Discord 後台是否已註冊 callback redirect URI） | 需架構師本人查證回覆 | ✅ **已解決**：2026-09-01 回報「還沒有」→ 2026-09-02 回報「加好了」（**當時加的是 3000 那條**），由**他本人**在後台新增。⚠️ 埠其後定案 3100 ⇒ 2026-09-04 C3 首試回「無效的 OAuth2 redirect_uri」，停手回報後由**他本人**補加 `http://localhost:3100/api/auth/callback/discord`，重試通過。⚠️ Claude 端⛔ 無法複驗後台畫面 ⇒ 只有 OAuth 跳轉結果這個間接實測（見 §1） |
| Q5 | 本 plan 體積已超過撰碼規約 A 的 20 KB 門檻（本輪實測，數值見交付回報），是否需拆檔？ | **不需拆**（規約 A 管的是**原始碼單檔**，交接文件不在射程） | ✅ **不拆** |

---

## 13. 本計畫未涵蓋 / 誠實標註

- A2/A3 的**實際狀態碼與行為目前未知**，本計畫刻意⛔ 不預寫結果（`next-auth` v4 缺 secret 的
  `getToken` 行為要實測才知）。⚠️ 驗收報告只寫實跑到的結果。
- 情境 (c) 走的是**反向驗證**（裁決 2乙），⇒ ⛔ 未驗到「**不同 Discord 帳號**的 profile 結構也相同」
  這個 Discord 端事實。該事實由 Discord API 規格保證，風險低，但驗收報告**必須據實寫明這是未驗項**，
  ⛔ 不得寫成「已驗證非管理員帳號被拒」。
- `/auth/error` 404 為**已知現況**（裁決 4甲），⛔ 本任務不修、⛔ 不列為失敗。
- **P2（Discord 後台 redirect URI）Claude 端⛔ 無法獨立複驗**：僅有架構師 2026-09-02 的
  口頭回報「加好了」。⇒ 驗收報告⛔ 不得寫成「已驗證後台設定」，只能寫
  「架構師回報已新增；本端以首次 OAuth 跳轉未報 `Invalid OAuth2 redirect_uri` 間接佐證」。
- **D4 的證據力隱含「session 存續」假設**（見 §3 D4、§8.1）——⛔ 不得寫成無條件鐵證。
- **D7 定案不做** ⇒ ⛔ 缺少「還原確實生效」的直接證據，驗收據實標「未做」。
  （規劃側曾建議改為做，經回報後架構師維持原裁決 ⇒ 已定案，⛔ 不再待議；
  ⚠️ D6 只證明**檔案內容**還原，⛔ 不證明**執行環境**在還原後仍可通行。）
