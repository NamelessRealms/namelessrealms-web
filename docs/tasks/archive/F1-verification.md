# 驗收報告：F1 實測 `/admin` middleware 保護真的會擋

> 產出者：實作側（`nr-implementer`）。讀者：規劃側（`nr-planner`）／架構師。
> 格式沿用 `docs/tasks/verification_template.md`。
> **⛔ 不得用範本／預期值／設計推理冒充已執行。** 真機做不到就誠實標「待人工」。
>
> **執行分工（據實記錄）**：Phase A 由實作側自跑；Phase B–E 的機器步驟由**主迴圈**執行，
> 真機步驟（C2／C3／D4／D5）由**架構師 Yu 本人**在主迴圈逐步領路下操作。
> 本報告的每一個數字，撰寫者都**自己重量過一次**；⛔ 凡未能重量者一律逐條標明
> 「主迴圈實測值，本輪未重量 + 原因」，⛔ 不混充為本側量測。
>
> **證據耐久性（`WORKFLOW.md` 第五節 + 裁決 Q3）**：本 repo ⛔ 不建 `.evidence/`
> （2026-09-04 實查 `ls -ld .evidence` → `No such file or directory`）。
> **修訂 v2（2026-09-04，經稽核「⚠️ 有條件通過」後回填）**：依 `F1-verification-audit.md`
> 的三項必改與四項文字更正修正本檔 —— ①F2／F4 的 lint 佐證前提**經實查為偽**，改為據實陳述
> ②補列 D4 的第 ④ 個前提（fixture 於 D3–D5 仍在）與其**耐久性缺口**
> ③鐵則 5 列的措辭加限定語 ④build 末段補齊被省略的行、log 行號更正、
> 機密掃描範圍補 `*.txt`、四項證據耐久性缺口改標為「稽核側獨立補量確認」並抄錄原始輸出。
> ⚠️ 本輪**只改本檔**：⛔ 未改實碼、⛔ 未重跑任何測試、⛔ 未改稽核報告與其餘 F1 文件。
>
> ⇒ 關鍵輸出**逐字貼進本檔**（進版控 ⇒ 耐久）；scratchpad
> （`…/2839e485-…/scratchpad/f1/`）只當工作區，⚠️ **會隨 session 消失，⛔ 不得作為唯一引用來源**。

---

## 變更檔案

| 路徑 | 改了什麼 | 是否進版控 |
|------|----------|-----------|
| `docs/tasks/F1-plan.md` | 修訂 v3：埠號全案 3000 → **3100**、D7 **定案不做**、P2／Q4／R7 回填實跑結果 | ✅ 是（待架構師確認才 commit） |
| `docs/tasks/F1-verification.md`（本檔） | 新增；**修訂 v2** 依稽核結論回填三項必改 + 四項文字更正 | ✅ 是（同上） |
| `.env.local` | 由主迴圈建立、架構師填值；D2 改假值 → D6 還原 | ⛔ **否**（被 `.gitignore` 擋；裁決 Q1 = 保留在硬碟） |
| `app/admin/f1-probe/page.tsx` + `app/admin/` 兩層目錄 | **建立 → 驗完刪除**（臨時 fixture） | ⛔ 否（全程未追蹤） |

### ⚠️ 實碼淨變動 = **零**（本側實測）

```
$ git diff --stat -- middleware.ts "app/api/auth/[...nextauth]/route.ts" .gitignore
（零輸出）
exit=0
```

⇒ `middleware.ts`（20 行 / 529 bytes，本側 `wc -lc` 實測）、
`app/api/auth/[...nextauth]/route.ts`、`.gitignore` **一個字都沒改**。
⇒ 依 plan §0：本任務性質為**驗證債**，⛔ 不更新 `CLAUDE.md` 程式碼地圖。

---

## 設計重點

### 1. 埠號：3000 → **3100**（架構師 2026-09-02 裁決「丙」）

A4 實測（`A2-devserver.log` / `A3-devserver.log` 逐字）：

```
 ⚠ Port 3000 is in use, trying 3001 instead.
 ⚠ Port 3001 is in use, trying 3002 instead.
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3002
```

成因：3000 被 `deploy-aegis-bff-1`、3001 被 `deploy-grafana-1` 佔用
——**兩者都是別的專案的 Docker 容器**，⇒ 埠不可預測。
⇒ 裁決**丙：固定 3100**，做法為啟動時帶 `-p`（`yarn dev -p 3100`），
⛔ **不改 `package.json`**（`"dev": "next dev"` 至今無 `-p`，本側 `grep` 複核仍是事實）。

⚠️ **例外（歷史事實，⛔ 不改寫）**：**A2/A3 在埠裁決之前執行，實際跑在 3002**。
它們只驗情境 (a)、⛔ 不涉 OAuth 回跳 ⇒ 埠不同不影響其結論。
C 之後各 phase 的 log（`C-devserver.log` / `C-devserver-2.log` / `D-devserver.log` /
`E4-devserver.log`）**第 3 行**皆為 `$ next dev -p 3100`，隨後為 `- Local: http://localhost:3100`。
⚠️ 更正：本報告初版寫「首行」——實際第 1 行是 `yarn run v1.22.18`、第 2 行是 license warning，
該字串在**第 3 行**。

### 2. 鐵則 7 第 1 題的答案：情境 (a) **只靠 `NEXTAUTH_SECRET` 就跑得動**

- A2（**完全無 env 檔**）：`307` → `location: /api/auth/error?error=Configuration`；
  `A2-devserver.log` 有 `[next-auth][error][NO_SECRET]`。
- A3（**只有 `NEXTAUTH_SECRET`**）：`307` → `location: /api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe`
  ⇒ 已是**正常的守門轉向**，⛔ 不再是設定錯誤。

⚠️ **plan 原列「500」為可能之一 —— 實測不成立**：兩種情境都是 `307`，
差別只在轉向目標（`/api/auth/error?error=Configuration` vs `/api/auth/signin?...`）。
⇒ 據實記錄，⛔ 不套用 plan 的預期值。

### 3. `NEXTAUTH_URL` 精確比對（布林，⛔ 未輸出值）

```
$ grep -qxF 'NEXTAUTH_URL=http://localhost:3100' .env.local && echo true || echo false
true
```

`/api/auth/providers` 端點回報的 `callbackUrl` = `http://localhost:3100/api/auth/callback/discord`
（主迴圈實測 + **稽核側獨立補量確認**，逐字相同 —— 原始輸出已抄錄於「回歸守門 §3」，
另見 `F1-verification-audit.md` 群組 9。⚠️ 實作側本輪未重量：重量需重啟 dev server，本輪守界禁止）。

---

## 測試結果

### 單元測試

**無**。本 repo ⛔ 沒有測試框架（`package.json` 無 test script）；本任務為驗證債，
⛔ 未新增測試（超出任務包範圍）。

### 正向流程（情境 (b)：管理員本人應能進 `/admin`）

| 步驟 | 做什麼 | 結果 |
|------|--------|------|
| C3（第 1 次） | 架構師本人 Discord OAuth 登入 | ⛔ **失敗** |
| C3（第 2 次） | 架構師於 Discord 後台補正後重試 | ✅ **通過** |

**C3 第 1 次失敗的逐字記錄**（`C3-attempt1-FAILED.txt`）：

```
Discord 回應：無效的 OAuth2 redirect_uri（中文介面）
判定：P2（後台 redirect URI 註冊）尚未生效於本 client_id
處置：依 plan §1 / C3「若卡在 OAuth」條款停手回報架構師，Claude ⛔ 未代改後台
```

診斷（**全部是布林／非機密比對，⛔ 未輸出任何值**）：
① `.env.local` 的 client_id **等於**失敗請求所用的 client_id
② 我方送出的 redirect_uri 正確
③ `NEXTAUTH_URL` 精確相符
⇒ **成因在 Discord 後台**：2026-09-02 架構師註冊的是 `http://localhost:3000/...`，
埠其後定案 3100 ⇒ 那條**對不上**。架構師本人補加 3100 那條後重試通過。
⛔ **Claude 全程未代改 Discord 後台設定。**

**C3 第 2 次通過的記錄**（`C3-PASSED.txt`）：probe 頁顯示，內文為
「看得到這頁 = middleware 已放行（token.sub 符合 ADMIN_DISCORD_ID）」。
⚠️ 架構師的截圖含其 Discord 頭像 ⇒ 依 plan C2/C3 遮蔽條款，
本報告**以文字記錄**，⛔ 不附原圖（鐵則 1）。

### 負向流程

#### N1 情境 (a)：無憑證 ⇒ 應被擋（**四組獨立取樣，全部一致**）

本側對四份落檔逐一重量（`head -1` + `grep -i '^location:'` + `grep -c 'F1 admin probe'`）：

| 落檔 | 情境 | 狀態行 | `location` | `grep -c 'F1 admin probe'` |
|------|------|--------|-----------|---------------------------|
| `A2-probe-response.txt` | 完全無 env | `HTTP/1.1 307 Temporary Redirect` | `/api/auth/error?error=Configuration` | **0** |
| `A3-probe-response.txt` | 只有 `NEXTAUTH_SECRET` | `HTTP/1.1 307 Temporary Redirect` | `/api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe` | **0** |
| `C1-probe-response.txt` | 完整憑證、無 cookie | `HTTP/1.1 307 Temporary Redirect` | `/api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe` | **0** |
| `D3-probe-anon.txt` | 假 ADMIN_ID、無 cookie | `HTTP/1.1 307 Temporary Redirect` | `/api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe` | **0** |

⚠️ **`grep -c` = 0 的負向對照（⛔ 沒有對照就只是空測）**：同一字串在 probe 頁**原始檔**中的計數

```
$ grep -c 'F1 admin probe' <scratchpad>/f1-probe-page.tsx.archived
1
```

⇒ grep 樣式本身測得出來 ⇒ 上表四個 0 **不是空測**。

**C2**（架構師本人，無痕視窗）：被導向 `/api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe`，
畫面只有「Sign in with Discord」按鈕，⛔ 未見 probe 內容。
（架構師口述；⚠️ 本輪未重量——真機步驟。）

#### N2 情境 (c) 反向驗證（裁決 2乙）：middleware 負向・**用真 token**

- **D2**：`ADMIN_DISCORD_ID` 改為假值 `000000000000000001`（非有效 snowflake），
  其餘四項未動。改後 md5 = `f20669bb1094f2081803b92734b2fd2a`
  ⚠️ **主迴圈實測值，本輪⛔ 未重量**（檔案已於 D6 還原，該狀態不可重現）。
- **D3**：重啟 dev server。`D-devserver.log` 逐字：`- Environments: .env.local` / `✓ Ready in 709ms`。
- **D4 = 通過**（架構師）：沿用 C3 既有 session、**同一無痕視窗**重載 `/admin/f1-probe`
  → 被導向 `/api/auth/signin`、按鈕為「Sign in with Discord」、⛔ 未見 probe 頁。
  架構師逐字確認：「**沒登出也沒關視窗**」。

**D4 的客觀佐證（本側重量）** —— 該 dev server 實例⛔ **從未編譯 `/admin/f1-probe`**：

```
$ grep -oE '(Compiling|Compiled) [^ ]+' D-devserver.log | sort -u
Compiled /
Compiled /api/auth/[...nextauth]
Compiled /middleware
Compiled /not-found
Compiling /
$ grep -c 'admin/f1-probe' D-devserver.log
0
負向對照 $ grep -c 'admin/f1-probe' C-devserver-2.log
1
```

⚠️ **兩點誠實修正（⛔ 不美化）**：
① 主迴圈給我的摘要說該 log「僅 `/`、`/middleware`、`/api/auth/[...nextauth]`」——
   **本側重量發現還有 `/not-found`**（成因：D5 前實測 `/auth/error` 為 404 的那次請求）。
   ⇒ 以 log 為準，補列。
② 負向對照（`C-devserver-2.log` = 1）證明該 grep 測得出來 ⇒ `0` 不是空測。

> #### ⚠️⚠️ D4 的隱含假設 —— **⛔ 不得寫成無條件鐵證**
>
> 「被擋」在觀察上有**兩種**可能成因：
> **(i)** `token.sub` 與 `ADMIN_DISCORD_ID` 不符（要證的那條）
> **(ii)** C3 的 session 恰好失效／cookie 掉了。
>
> 唯一能直接分辨的手段是開 `/api/auth/session`，而該端點在**正向 session 仍在**時
> 會回傳含真實 Discord ID 的 JSON ⇒ 屬**禁區**（鐵則 1）。
> ⇒ 排除 (ii) 的依據只有三條**間接**證據：
> ① C3 與 D4 時間相鄰（分鐘級；`next-auth` JWT 預設效期以天計）
> ② 架構師本人逐字確認「沒登出也沒關視窗」
> ③ 同一無痕視窗、未清 cookie。
> ⇒ **D7（還原後再登入複驗）經架構師裁決不做**，故⛔ **無該項補強證據**。
>
> **④ 還有一個前提（本報告初版⛔ 未陳述，稽核側指出後補列）：
> 臨時 fixture 在 D3–D5 期間仍然存在。**
> ⚠️ **為什麼這條是必要的**：若 fixture 在 D4 之前就已刪除，那個 `307` 就能被
> 「頁面根本不存在 + middleware 攔截**路徑空間**」完全解釋掉
> —— 本報告自己的附帶發現（見「回歸守門」）正好證明了這種解釋成立
> ⇒ 差分結論會**失去效力**。
>
> **④ 的證據（時間軸；本側自量 `stat -f '%Sm' -t '%Y-%m-%d %H:%M:%S'` 與 `grep 'Done in'`）**：
>
> ```
> 2026-09-04 00:01:21  C-devserver-2.log   （C 階段 server 結束；Done in 553.31s）
> 2026-09-04 00:01:21  C3-PASSED.txt
> 2026-09-04 00:01:56  D3-probe-anon.txt
> 2026-09-04 00:05:42  D4-PASSED.txt       ← 落在 D server 存續區間內
> 2026-09-04 00:08:29  D-devserver.log     （D 階段 server 結束；Done in 427.68s ⇒ 起於 ~00:01:21）
> 2026-09-04 00:08:29  D5-PASSED.txt
> 2026-09-04 00:08:43  E3-install.log      ← E3 已開跑 ⇒ E2 刪除必在此之前
> ```
>
> ⇒ D 階段 dev server 存續區間 **00:01:21–00:08:29**；D4 發生於 **00:05:42**（區間內）；
> **E2 的刪除發生於 00:08:29–00:08:43**，即**D 全部步驟結束之後**
> ⇒ **前提 ④ 成立**：fixture 在 D3–D5 全程都還在。
> ⇒ 附帶量出：**C3 通過（00:01:21）與 D4（00:05:42）相距約 4 分 21 秒**
> —— 依據 ① 的「時間相鄰（分鐘級）」由形容詞變成了數字。
>
> ⚠️ **耐久性缺口（依 `WORKFLOW.md` 第五節據實標註，⛔ 不得寫成「不存在」）**：
> ④ 的直接證據是 **scratchpad 檔案的 mtime**，而 scratchpad 是 session 專屬、
> **將隨 session 消失** ⇒ 該證據**存在但⛔ 不具耐久性**。
> ⇒ 因此把上列七個時間值與兩個 `Done in` 秒數**逐字抄進本檔**（進版控才耐久）；
> ⛔ 日後若要複驗，只能依賴這段抄錄，⛔ 無法回頭再 `stat` 一次。
>
> **本報告的結論措辭因此是「差分佐證」而非「直接證明」**：token 不變、
> 僅 `ADMIN_DISCORD_ID` 改變 ⇒ middleware 判定由放行翻為擋下
> ⇒ 可排除「有 token 即放行」這個恆真解釋（`authorized` callback 確實在比對 `ADMIN_DISCORD_ID`）。
> ⚠️ 此結論**同時**依賴 ①②③④ 四個前提，⛔ 缺一不可。

#### N3 情境 (c) 反向驗證：`signIn` callback 負向

**D5 = 通過**（架構師）：`/api/auth/signout` 登出 → 重新 Sign in with Discord（**本人帳號**）
→ 開 `/api/auth/session` → 架構師逐字回覆「**空**」。

判準（依 plan）：**未建立 session** ⇒ `signIn` callback 的
`profile?.id !== adminId ⇒ return false` 分支確實生效。

⚠️ **依 plan 禁區條款**：⛔ 未取得、⛔ 未記錄任何 session 原文、JSON、截圖或任何欄位值
（含雜湊、含部分遮罩皆不可 —— snowflake 搜尋空間有限，雜湊可暴力還原）。
⚠️ 登入失敗導向 `/auth/error` 實測為 **404**（主迴圈於 D5 前實測 + **稽核側獨立補量確認**
——原始輸出見「回歸守門 §3」；⚠️ 實作側本輪未重量）
⇒ 屬**裁決 4甲 的已知現況**，⛔ 不算 F1 失敗、⛔ 本任務未修。

### 還原方式（⛔ 不用 `git checkout`）

- **D1 備份**：`.env.local` → scratchpad（⛔ **不放 repo 工作樹**，理由見「A5 附帶結論」）。
- **D6 還原**：`cp <備份> .env.local`。
  ⛔ **不用 `git checkout`**，兩個理由：①`.env.local` 不在版控裡，救不回來
  ②`git checkout` 會清掉工作樹三個長期未 commit 的舊改動。
- **A3 拋棄式 `.env.local`**：A3 用完即 `rm` + `test -e` 確認不存在，
  ⇒ ⛔ 未讓實作側的拋棄式值污染架構師之後要填的正式檔。

**本側重量的還原證明**（⛔ 只貼退出碼與整檔摘要，⛔ 不貼內容）：

```
$ md5 -q .env.local
91a29db3359bbca9e7aa96b608e8fdd0
$ md5 -q <scratchpad>/env.local.D1-backup
91a29db3359bbca9e7aa96b608e8fdd0
$ diff -q <scratchpad>/env.local.D1-backup .env.local; echo "exit=$?"
exit=0
$ grep -qE '^ADMIN_DISCORD_ID=[0-9]{18}$' .env.local && echo true || echo false
true
$ stat -f '%Sp %z bytes' .env.local
-rw------- 1095 bytes
```

⇒ 內容與備份逐位元組相同、`ADMIN_DISCORD_ID` 回為 18 位純數字（**布林，⛔ 未輸出值**）、權限 600。
⚠️ 上列 md5 是**整檔**摘要，⛔ 不是任何單一機密值的雜湊。

---

## 審計確認

### A. 機密未入落檔

⚠️ **掃描範圍宣告（更正：初版只宣告 `*.log`，⛔ 覆蓋不全）**：
下表為 scratchpad 的 **10 個 `*.log`**（本側逐檔重量，全數為 0）。
**`*.txt` 留證檔由稽核側補掃**，結果一併據實列於表後 —— ⇒ 兩類合計即為完整覆蓋。

#### A-1 `*.log`（10 檔，本側逐檔重量）

```
$ for f in <scratchpad>/*.log; do grep -c 'NEXTAUTH_SECRET=' $f; grep -c 'DISCORD_CLIENT_SECRET=' $f; grep -cE '[0-9]{17,19}' $f; done
```

| 落檔 | `NEXTAUTH_SECRET=` | `DISCORD_CLIENT_SECRET=` | 17–19 位數字 |
|------|---|---|---|
| `A0-yarn-install.log` | 0 | 0 | 0 |
| `A2-devserver.log` | 0 | 0 | 0 |
| `A3-devserver.log` | 0 | 0 | 0 |
| `C-devserver.log` | 0 | 0 | 0 |
| `C-devserver-2.log` | 0 | 0 | 0 |
| `D-devserver.log` | 0 | 0 | 0 |
| `E3-install.log` | 0 | 0 | 0 |
| `E3-lint.log` | 0 | 0 | 0 |
| `E3-build.log` | 0 | 0 | 0 |
| `E4-devserver.log` | 0 | 0 | 0 |

#### A-2 `*.txt` 留證檔（稽核側補掃，⛔ 非實作側自量 —— 據實標明）

稽核側掃描 scratchpad 的 `*.txt` 後發現：`D4-PASSED.txt` 與 `D5-PASSED.txt`
**各有 1 筆** 17–19 位數字，**經逐一比對確認 100% 是 D2 刻意寫入的假值
`000000000000000001`** ⇒ ⛔ **無任何真實 ID 外洩**。

```
$ grep -oE '[0-9]{17,19}' D4-PASSED.txt   → 000000000000000001
$ grep -oE '[0-9]{17,19}' D5-PASSED.txt   → 000000000000000001
$ grep -oE '[0-9]{17,19}' D4-PASSED.txt | grep -vc '^000000000000000001$'  → 0
$ grep -oE '[0-9]{17,19}' D5-PASSED.txt | grep -vc '^000000000000000001$'  → 0
```

⇒ ⚠️ 上面兩條 `grep -vc` 就是「**除了假值以外一筆都沒有**」的證明
（⛔ 只數總筆數不夠，那不能排除混有真值）。
⇒ **A-1（`*.log`）＋ A-2（`*.txt`）合計為完整覆蓋。**

### B. 本報告與 `F1-plan.md` 的機密自檢

- ⛔ **無** Discord 使用者 ID（真值或雜湊或部分遮罩）
- ⛔ **無** `DISCORD_CLIENT_SECRET`、⛔ **無** `NEXTAUTH_SECRET`
- ⛔ **無** session 原文、JSON、欄位值
- 出現的 `000000000000000001` 是 **D2 刻意寫入的假值**（非有效 snowflake），⛔ 不是任何人的 ID
- 出現的雜湊皆為**整檔／`yarn.lock`／fixture** 摘要，⛔ 不是單一機密值的雜湊
- ⇒ **上列輸出已逐行確認無機密**（plan §11 ② 要求的聲明）

### C. `.env.local` 未進版控（含負向對照 —— 地雷第 5 條）

```
$ git check-ignore --no-index -v .env.local
.gitignore:33:.env*.local	.env.local
exit=0

負向對照 $ git check-ignore --no-index -v .env.local.f1-backup
exit=1

$ git status --short | grep -c 'env.local'
0
```

⚠️ **A5 附帶結論**：備份檔名 `.env.local.f1-backup` **不會**被 `.gitignore` 擋
⇒ **D1 的備份必須放 scratchpad，⛔ 不放 repo 工作樹**（已照辦）。

⚠️ **重現地雷清單第 5 條（`--no-index` 不可省）—— 本側重量**：
以臨時 exclude 規則 `*lock*` 打**已追蹤**的 `yarn.lock`（git 2.47.1）：

```
$ git -c core.excludesFile=<scratchpad>/fake-excludes check-ignore -v yarn.lock
exit=1                       ← ⚠️ 空測：規則明明命中，卻回報「不忽略」

$ git -c core.excludesFile=<scratchpad>/fake-excludes check-ignore --no-index -v yarn.lock
<scratchpad>/fake-excludes:1:*lock*	yarn.lock
exit=0                       ← ✅ 加了 --no-index 才測得出來
```

⇒ **`git check-ignore` 預設查 index、對已追蹤檔一律回「不忽略」** ⇒ `--no-index` ⛔ 不可省。
⚠️ 誠實記錄一個過程細節：原始執行用的旗標本側無法確認，本輪改用 `-c core.excludesFile=`
重量（`git check-ignore` **不支援** `--exclude-from`，本側實測 exit=129）——結論相同。

### D. `token.sub == profile.id` 的不外洩間接證明（plan §8.1 / 鐵則 7 第 2 題）

⛔ **不可行且未做**：dump token、印 `session`、開正向 `/api/auth/session`。

**實際採用的間接證明 = 兩層守門的差分對照**（`.env.local` 只有**一份** `ADMIN_DISCORD_ID`）：

| 層 | 判準（源碼，本側 `cat -n` 複核） | 真值下 | 假值下 |
|----|------|--------|--------|
| middleware `authorized` | `!!token && token.sub === process.env.ADMIN_DISCORD_ID`（`middleware.ts:13`） | C3 **放行** | D4 **擋下** |
| auth route `signIn` | `profile?.id === adminId` 才 `return true`（`route.ts:16-19`） | C3 **建立 session** | D5 **未建立 session（「空」）** |

⇒ 兩層在**同一個真值**下同時放行、在**同一個假值**下同時擋下
⇒ `token.sub` 與 `profile.id` 在本案中**指向同一個值**，⛔ 全程未輸出該值。
⚠️ 這是**同值的間接證明**，⛔ 不是「取得兩個值後比對」——後者屬禁區。

---

## 產物重建

- [x] **改過原始碼 → 已跑 `yarn build`**（⚠️ 附帶說明：F1 的原始碼**淨變動為零**，
      臨時 fixture 於 E2 已刪；`yarn build` 仍逐字跑過，作為「工作樹沒被動壞」的守門）
- [ ] 跨 repo 依賴：**不適用**（本 repo 無被依賴方）
- [x] 或：無原始碼變更，沿用現有產物 —— ⇒ **兩欄都成立**，據實兩者皆標

**`yarn build` 末段（`E3-build.log`，逐字完整、⛔ 未省略）**：

⚠️ **更正**：本報告初版把此區塊標為「逐字末段」，但實際**省略了 3 行 `chunks/…` 明細與
`○ (Static)` / `λ (Dynamic)` 圖例**且未加省略記號。數值⛔ 無誤，但「逐字」在本 repo 是承重詞
⇒ 已補齊被省略的行，現為完整末段。

```
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (13/13)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    4.02 kB         105 kB
├ ○ /_not-found                          882 B          85.1 kB
├ λ /api/apply                           0 B                0 B
├ λ /api/auth/[...nextauth]              0 B                0 B
├ ○ /apply                               1.31 kB        85.5 kB
├ ○ /donate                              141 B          84.4 kB
├ ○ /launcher                            6.19 kB         107 kB
├ ○ /modServer                           3.75 kB         105 kB
├ ○ /sponsor                             4.58 kB         106 kB
├ ○ /staff                               141 B          84.4 kB
├ ○ /team                                2.4 kB          104 kB
└ ○ /voteModpack                         4.86 kB         106 kB
+ First Load JS shared by all            84.2 kB
  ├ chunks/69-9685b12e726c2066.js        28.9 kB
  ├ chunks/fd9d1056-ec06e3651eb582df.js  53.4 kB
  └ other shared chunks (total)          1.96 kB


ƒ Middleware                             74.8 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand using Node.js

Done in 12.93s.
```

⚠️ **一項無害差異，在此留痕以免日後被誤認為不符**：稽核側自跑一次新 build，
其 `ƒ Middleware` 為 **74.9 kB**，而 `E3-build.log` 逐字為 **74.8 kB**。
⇒ 差異來自**兩次不同的 build run**（此數值在本 repo 於 74.8／74.9 kB 間抖動，
`archive/F2-verification.md` 亦已記錄過同一現象）⇒ ⛔ **不是轉抄錯誤、⛔ 不需更正**。

**本側自量的計數（⛔ 未轉抄摘要）**：

```
$ grep -cE '^[┌├└]' E3-build.log        → 12    （route 表項總數，含 /_not-found）
$ grep -cE '^[┌├└] λ' E3-build.log      →  2    （/api/apply、/api/auth/[...nextauth]）
$ grep -cE '^[┌├└] ○' E3-build.log      → 10
```

⚠️ **誠實修正**：主迴圈給我的摘要寫「12 條路由 + `/_not-found`」（= 13）——
**本側重量為 route 表共 12 項，`/_not-found` 已包含在內**（2 λ + 10 ○）。以 log 為準。
（`Generating static pages (13/13)` 是 Next.js 的另一個內部計數，⛔ 不等於表項數。）

⚠️ **關鍵守門結論**：build 產物中 ⛔ **沒有任何 `/admin` 路由**
⇒ 證明 E2 的刪除**發生在 build 之前**（若 fixture 還在，`/admin/f1-probe` 會出現在上表）。

---

## git 對帳

```
$ git log --oneline -1
a593cfb chore(tasks): F4 收案——五件套歸檔並更新地雷清單與套件管理器節

$ git rev-parse HEAD origin/developers
a593cfb849b57fc524d52429c87b072e276a9d0f
a593cfb849b57fc524d52429c87b072e276a9d0f
⇒ 本地 = 遠端；本任務**尚未 commit、尚未 push**

$ git status --short
 M WORKFLOW.md                    ← ⚠️ ⛔ 不屬於 F1，見「守界聲明」
 M app/layout.tsx                 ← 長期未 commit 的舊改動（地雷第 6 條）
 M app/staff/page.tsx             ← 同上
 M components/ServerSection.tsx   ← 同上
?? docs/tasks/F1.md               ← F1 任務包
?? docs/tasks/F1-plan.md          ← F1 計畫（本輪修訂 v3）
?? docs/tasks/F1-plan-review.md   ← F1 放行書
（⚠️ 本檔 F1-verification.md 於此對帳之後才落檔）

$ git diff --stat HEAD
 WORKFLOW.md                  | 118 ++++++++++++++++++++++++++---
 app/layout.tsx               |   2 +-
 app/staff/page.tsx           |   6 +-
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
 4 files changed, 201 insertions(+), 98 deletions(-)
```

⇒ 工作樹**除**三個長期未 commit 的舊檔、`WORKFLOW.md`（非 F1）與 F1 文件外，⛔ **無殘留**。
⛔ **尚未 `git add`**（且將來只逐檔 add，⛔ 不用 `git add .` —— 地雷第 6 條）。

---

## CI

> ⚠️ 本專案 ⛔ **沒有 build/lint CI**（唯一 workflow 只在 tag `v*.*.*` 時 build image）。
> ⇒ 收案標準 = **本地嚴格指令逐字跑過並附輸出**，⛔ 不得寫「等 remote Actions 綠」。
> ⚠️ 打 `v*.*.*` tag 就是發版，⛔ 不得為測試打 tag（**本任務未打任何 tag**）。

| 指令 | 退出碼 | 結論 |
|------|--------|------|
| `yarn install --frozen-lockfile` | **0**（`Done in 0.60s.`） | ✅ 通過 |
| `yarn lint --max-warnings 0` | **0** | ⛔ **不是「通過」——見下方：這是空測** |
| `yarn build` | **0**（`Done in 12.93s.`） | ✅ 通過 |

`yarn install --frozen-lockfile` 的守門（**本側重量**）：

```
$ shasum -a 256 yarn.lock
a751386e39e543654dcf4f7520cc20d0f291314fd59c15848dc555d20e3bab48  yarn.lock
$ cat <scratchpad>/yarn.lock.before.sha256          ← A0 之前落的檔
a751386e39e543654dcf4f7520cc20d0f291314fd59c15848dc555d20e3bab48  yarn.lock
⇒ 前後同值 ⇒ lock 檔未被動到

$ ls -l package-lock.json
ls: package-lock.json: No such file or directory
exit=1
⇒ package-lock.json ⛔ 未復活（全程未跑 npm install）
```

### ⚠️⚠️ `yarn lint --max-warnings 0` 是**空測** —— exit 0 但**根本沒有 lint 任何檔案**

`E3-lint.log` 逐字（8 行 / 409 bytes，本側 `wc -lc` 實測；`❯` 前有一個 `ESC[?25l` 游標控制序列）：

```
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0
? How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint
❯  Strict (recommended)
   Base
   Cancel ⚠ If you set up ESLint yourself, we recommend adding the Next.js ESLint plugin. See https://nextjs.org/docs/basic-features/eslint#migrating-existing-config
Done in 0.63s.
```

⇒ 它跳出**互動式設定問卷**、無 TTY 輸入、直接結束。**⛔ 一個檔案都沒 lint。**

**成因（本側逐條重量）**：

```
$ ls -la .eslintrc* eslint.config.*
(eval):1: no matches found: .eslintrc*        ⇒ 工作樹⛔ 無任何 ESLint 設定檔

$ grep -c 'eslintConfig' package.json
0                                              ⇒ package.json ⛔ 無 eslintConfig 欄位

$ git ls-tree -r HEAD --name-only | grep -cE 'eslintrc|eslint\.config'
0                                              ⇒ HEAD 版控內容⛔ 無 eslint 設定檔
負向對照 $ git ls-tree -r HEAD --name-only | grep -cx 'tsconfig.json'
1                                              ⇒ 同一查法找得到 ⇒ 上面的 0 不是空測

$ node -p "require('./node_modules/eslint/package.json').version"          → 8.57.1
$ node -p "require('./node_modules/eslint-config-next/package.json').version" → 14.1.0
$ grep -nE '"eslint"|"eslint-config-next"' package.json
33:    "eslint": "^8",
34:    "eslint-config-next": "14.1.0",
⇒ 套件**確實裝著**，缺的只是設定檔
```

**版控史（本側重量）**：

```
$ git log -1 --format='%h %ad %s' --date=short 16635f9
16635f9 2022-05-13 Convert next.js framework
$ git show --numstat --format='' 16635f9 -- .eslintrc.json
6	0	.eslintrc.json            ← 新增 6 行

$ git log -1 --format='%h %ad %s' --date=short 5afda1a
5afda1a 2026-02-12 chore: reorganize project structure and migrate to app router
$ git show --numstat --format='' 5afda1a -- .eslintrc.json
0	6	.eslintrc.json            ← 刪除 6 行
```

⇒ **意涵**：repo `CLAUDE.md` 與 `WORKFLOW.md` 都把 `yarn lint --max-warnings 0`
列為驗收的必要閘門（並特別註明 `--max-warnings 0` 不可省），
但**自 2026-02-12（commit `5afda1a`）起，這道閘門一直是空測。**

**對 F1 本身的影響 = 無**：F1 的**原始碼淨變動為零**（臨時 fixture 已刪）
⇒ 本任務⛔ 沒有需要 lint 的新程式碼。
⇒ 此事是一個**獨立於 F1 的既有缺陷**，⛔ 不是 F1 的實作瑕疵。

⛔ **本任務未順手修**（開發守則第 1 條「只做被指派的範圍」＋
地雷清單「⛔ 不要順手修掉，先問架構師」）。處置見下節。

---

## 真機 E2E

> 完整步驟表見 `F1-plan.md` §7（供日後複驗）。
> 執行採 **一次一步**：主迴圈逐步領路，⛔ 未一次貼整份步驟表；fixture 由實作側事先備好交付。

| # | 步驟 | 過線標準 | 結果 |
|---|------|----------|------|
| P2 | Discord 後台註冊 redirect URI | 首次 OAuth 未回 `Invalid OAuth2 redirect_uri` | ⚠️ **分兩次才成立**：09-02 加了 3000；埠改 3100 後 C3 首試**失敗**，架構師本人補加 3100 後通過。⛔ Claude 端無法複驗後台畫面 |
| A0 | `yarn install --frozen-lockfile` | 安裝成功、`yarn.lock` 未變動 | ✅ exit 0、SHA-256 前後同值 |
| A1 | 建臨時路由 fixture | 與任務包**逐位元組**相同且未追蹤 | ✅ `diff` exit 0；SHA-256 `0ce5baf8…5b255b` 兩份同值、各 251 bytes（本側重量） |
| A2 | 無 env 時 curl `/admin/f1-probe` | body 不含 `F1 admin probe` | ✅ `307` → `/api/auth/error?error=Configuration`、`grep -c` = 0 |
| A3 | 只有 `NEXTAUTH_SECRET` 時 curl | 同上 | ✅ `307` → `/api/auth/signin?...`、`grep -c` = 0 |
| A4 | 確認 dev 實際埠 | 啟動輸出的 `Local:` 行 | ✅ 實測 3002（3000/3001 被別的專案 Docker 佔用）⇒ 裁決丙固定 **3100** |
| A5 | `check-ignore --no-index` 正向 + 負向 | 正向命中 `.gitignore:33`、負向 exit 1 | ✅ 兩者皆符；另重現地雷第 5 條 |
| B1 | 交付 `.env.local` 骨架 | 骨架只有變數名 | ✅ 骨架⛔ 無任何值；⛔ 未進版控（裁決 1乙） |
| B2 | 填入五個值 | 存檔完成 | ✅ 見下「B2 的一次修正」 |
| B3 | 非侵入式檢查五格已填 | 五行皆有值（⛔ 無值輸出） | ✅ 五項全部有值；⛔ 無引號、⛔ 無多餘空格、⛔ 無 CRLF；`ADMIN_DISCORD_ID` 為 18 位純數字；權限 600 |
| C1 | 完整 env、無 cookie curl | 3xx 轉登入路徑、`grep -c` = 0 | ✅ `307` → `/api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe`、`grep -c` = 0（含負向對照）；首頁 `200` |
| C2 | 無痕視窗開 `/admin/f1-probe` | 看不到 probe 頁 | ✅ 被導向 signin、只有「Sign in with Discord」按鈕 |
| C3 | 本人 Discord 登入 → 開 probe | 看得到「F1 admin probe」 | ⚠️ **第 1 次失敗**（`無效的 OAuth2 redirect_uri`）→ 停手回報 → 架構師補正後 **第 2 次通過** |
| D1 | 備份 `.env.local` 到 scratchpad | `diff -q` exit 0 | ✅ md5 `91a29db3…8fdd0` |
| D2 | `ADMIN_DISCORD_ID` 改假值 | 只有該行變動 | ✅ 其餘四項未動；⚠️ 改後 md5 為**主迴圈實測值**，本輪未重量（該狀態已還原） |
| D3 | 重啟 dev server | 新啟動輸出 | ✅ `Environments: .env.local` / `Ready in 709ms`；假 ID 下無憑證 curl 仍 `307` |
| D4 | 用**既有 session** 開 probe | **被擋**（middleware 負向・真 token） | ✅ 通過；⚠️ **附 session 存續假設**（見「測試結果 N2」框） |
| D5 | 登出 → 重新 OAuth 登入 | **登入被拒**（session「空」） | ✅ 架構師逐字回「空」；⛔ 未記錄任何 session 內容 |
| D6 | 用備份檔還原 + 重啟 | `diff -q` exit 0 | ✅ md5 回到 `91a29db3…8fdd0`、`diff` exit 0、權限 600；⛔ 全程未用 `git checkout` |
| **D7** | 還原後重新登入確認 | — | ⛔ **未做** —— 架構師 2026-09-02 裁決「不做」，規劃側於 `F1-plan-review.md` 建議改為做、經回報後**架構師維持原裁決** ⇒ **定案**。代價見「未涵蓋」節 |
| E1 | 停 dev server | 無殘留 process | ✅ 主迴圈實測 3100 LISTEN 0 筆、`next` 程序 0 個；**本側於報告產出時點複量**：`lsof -nP -iTCP:3100 -sTCP:LISTEN` → 0 行、`pgrep -fl 'next dev'` → 0 |
| E2 | 刪臨時路由與 `app/admin/` | `find app -type d -name 'admin*'` 零輸出 | ✅ 見下「回歸守門」 |
| E3 | `yarn lint --max-warnings 0` / `yarn build` | 皆 green | ⚠️ `build` ✅；`lint` **exit 0 但空測**（見「CI」節） |
| E4 | 既有頁面回歸抽查 | HTTP `200` | ✅ 見下「回歸守門」 |
| E5 | 產 `F1-verification.md` | 五件套之一落檔 | ✅ 本檔 |
| E6 | 回報，等待 commit 確認 | ⛔ 未獲確認前不 commit/push | ⏸ **待架構師確認** |

### ⚠️ B2 的一次修正（過程紀錄，**⛔ 不是缺陷**）

架構師初次填入的 `DISCORD_CLIENT_SECRET` **長度為 70 字元**（Discord 常見為 32）。
主迴圈以**長度檢查**（⛔ 未輸出任何字元）提出質疑後，架構師重貼為 **32 字元**。
⇒ 若未攔下，C3 會在 token 交換階段失敗、且錯因難以定位。
⚠️ 據實記錄此往返；⛔ 不美化成「一次填對」。

---

## 回歸守門

### 1. 臨時 fixture 已完全刪除（裁決 3甲 要求的收尾證明）

```
$ find app -type d -name 'admin*'
（零輸出）
exit=0

$ find app -maxdepth 1 -mindepth 1 -type d | sort
app/api
app/apply
app/donate
app/launcher
app/modServer
app/sponsor
app/staff
app/team
app/voteModpack
count=9
```

⇒ `app/` 恢復為**9 個目錄**，與 `CLAUDE.md` 程式碼地圖一致。
⇒ 第二道獨立證明：`yarn build` 產物的 route 表中 ⛔ **無任何 `/admin` 路由**。

> #### ⚠️ 附帶發現：刪除後打 `/admin/f1-probe` 回的是 **307**，⛔ 不是 404
>
> 主迴圈原本**預期 404**，實測是 **307**。
> **成因**：`middleware.ts` 的 matcher 為 `["/admin/:path*"]`，
> **middleware 在路由解析之前就攔截** ⇒ 頁面不存在也照樣轉向登入頁。
> ⇒ **307 是正確行為，⛔ 不是缺陷。**
> ⇒ 這是一個有價值的附帶發現：**這道保護守的是「路徑空間」，⛔ 不只是既有頁面。**
> ⇒ 因此「fixture 已刪」的證明**⛔ 不能用 404 來證**，改以
> ①`find` 零輸出 ②build 產物無 `/admin` 路由 為準（如上）。
> ⚠️ 此 307 為主迴圈實測 + **稽核側獨立補量確認**（原始輸出見下方 §3）；
> 實作側本輪⛔ 未重量（重量需重啟 dev server，本輪守界禁止）。
> ⚠️ **這個附帶發現本身需要負向對照才不是空測** —— 稽核側已補上（見 §3 末段）：
> 非 `/admin` 的不存在路徑回 **404**，`/admin` 底下任一不存在路徑回 **307**
> ⇒ 307 確實由 matcher `["/admin/:path*"]` 造成，⛔ 不是本站對所有 404 的通用行為。

### 2. 既有九頁全部正常（E4）

主迴圈實測：`/`、`/apply`、`/launcher`、`/modServer`、`/staff`、`/team`、
`/sponsor`、`/donate`、`/voteModpack` —— **全部 `200`**。跑完已停 server。
✅ **稽核側獨立補量確認**：九頁全部 `200`，逐頁原始輸出見下方 §3。
⚠️ **實作側本輪未重量**（重量需重啟 dev server，本輪守界禁止）。

**耐久佐證（本側重量）** —— `E4-devserver.log` 顯示這九頁**確實各被編譯過一次**
（dev 模式只在收到請求時才編譯 ⇒ 這是「真的被打過」的客觀證據）：

```
$ grep -oE 'Compiled /[a-zA-Z]*' E4-devserver.log | sort -u
Compiled /
Compiled /apply
Compiled /donate
Compiled /launcher
Compiled /middleware
Compiled /modServer
Compiled /sponsor
Compiled /staff
Compiled /team
Compiled /voteModpack
```

⇒ 九頁 + `/middleware`，⛔ 無編譯失敗訊息。

### 3. 稽核側獨立補量的四項原始輸出（**耐久化抄錄**）

> ⚠️ 這四項原本**既不在本報告、也不在 scratchpad 落檔**，本報告初版只寫「主迴圈實測」
> ⇒ 屬**證據耐久性缺口**。稽核側（`F1-verification-audit.md` 群組 9）已**全部獨立補量、結果全符**，
> 依 `WORKFLOW.md` 第五節把原始輸出**逐字抄進本檔**（進版控才耐久）。
> ⚠️ 抄錄來源為稽核報告，⛔ 不是實作側自跑 —— 據實標明。

```
（稽核側啟一次 yarn dev -p 3100；起跑前 lsof/pgrep 皆 0）

PAGE / CODE 200
PAGE /apply CODE 200
PAGE /launcher CODE 200
PAGE /modServer CODE 200
PAGE /staff CODE 200
PAGE /team CODE 200
PAGE /sponsor CODE 200
PAGE /donate CODE 200
PAGE /voteModpack CODE 200

$ curl -sI http://localhost:3100/admin/f1-probe | head -2
HTTP/1.1 307 Temporary Redirect
location: /api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe
$ curl -s http://localhost:3100/admin/f1-probe | grep -c 'F1 admin probe'
0

$ curl -s -o /dev/null -w 'status=%{http_code}' http://localhost:3100/auth/error
status=404

$ curl -s http://localhost:3100/api/auth/providers
{"discord":{"id":"discord","name":"Discord","type":"oauth","signinUrl":"http://localhost:3100/api/auth/signin/discord","callbackUrl":"http://localhost:3100/api/auth/callback/discord"}}
```

**「307 守的是路徑空間」的負向對照**（稽核側補上，⛔ 沒有它就只是空測）：

```
$ curl -s -o /dev/null -w 'status=%{http_code} redirect=%{redirect_url}' http://localhost:3100/admin/nonexistent-xyz
status=307 redirect=http://localhost:3100/api/auth/signin?callbackUrl=%2Fadmin%2Fnonexistent-xyz

負向對照 $ curl -s -o /dev/null -w 'status=%{http_code}' http://localhost:3100/nonexistent-xyz
status=404
```

⇒ `/admin` 底下任一不存在路徑皆 **307**、非 `/admin` 的不存在路徑為 **404**
⇒ 307 確實由 matcher `["/admin/:path*"]` 造成 ⇒ **「守的是路徑空間」的結論成立**。

**稽核側的停機證明**（跑完已停，工作樹未變）：

```
$ pkill -f 'next dev'
$ lsof -nP -iTCP:3100 -sTCP:LISTEN | wc -l   → 0
$ pgrep -f 'next dev' | wc -l                 → 0
$ curl --max-time 3 http://localhost:3100/ ; echo curl_exit=$?
curl_exit=7                                    ← Couldn't connect ⇒ 已停
$ git status --short                           → 與稽核開始時逐字相同
```

---

## 待處理 / 建議另立任務

### ✅ 已裁決：ESLint 空測 ⇒ **另立 backlog 任務**（架構師 2026-09-04 裁「甲」）

- **裁決內容**：另立 backlog 任務補 ESLint 設定，⛔ **不在 F1 內順手補**；**F1 照原樣收案**。
- ⚠️ 該新任務的要求**必須包含**：補設定檔後**驗證 `next lint` 真的會 fail**
  ——⛔ **不能只看 exit 0**。⚠️ 理由就是本次發現的成因：**exit 0 不代表有 lint**。
- **登記方式**：由**主迴圈**登記進 backlog。⇒ 實作側⛔ 不代為登記、⛔ 不代為實作。

### ✅ 已裁決：這道閘門的佐證處置 ⇒ **只在 backlog 記一行，⛔ 不回頭改已收案文件**

- 架構師採納主迴圈建議，依 `CLAUDE.md`「已收案的四件套任務⛔ 不回頭補稽核報告」：
  **⛔ 不回溯修改已收案文件**，僅於 backlog 記錄。

> #### ⚠️ 修正（稽核側實查、本側逐字複量）：**實際受影響的已收案佐證 = 0 件**
>
> 本報告初版寫「F2／F4 的驗收報告**若曾**以 `yarn lint` exit 0 作為佐證⇒證明力受影響」。
> **那個「若」查下來⛔ 不成立** —— 本側自跑 `grep -n 'yarn lint' docs/tasks/archive/F{2,4}-verification.md`
> 並逐字讀出：
>
> ```
> archive/F2-verification.md:633: `yarn lint --max-warnings 0` → **⛔ 未跑**。
> archive/F2-verification.md:634-635: 架構師 2026-08-30 裁定「甲」時
>                                     **明確豁免 lint**（理由：本任務未動任何 .ts / .tsx，
>                                     lint 對象集合不變）
> archive/F4-verification.md:380: `yarn lint --max-warnings 0` → ⛔ **未跑，經架構師 2026-08-31 明確豁免**
> archive/F4-verification.md:382: ⚠️ 據實標明為「豁免未跑」，⛔ 不冒充已執行
> ```
>
> ⇒ **F2 與 F4 都⛔ 從未執行過 `yarn lint`**，兩案皆為**架構師明確豁免**、且**據實標明**。
> （⚠️ `F2-verification.md:198` 的 `Linting and checking validity of types` 是 `next build`
> 的內建 TypeScript 階段，⛔ **不是** `next lint`。）
> ⇒ **⛔ 沒有任何已收案的 lint 佐證受本發現影響。**
>
> **架構師 2026-09-04 的裁定本身⛔ 無誤、維持有效** —— 只是**適用對象是日後**：
> ⇒ **在 ESLint 設定補好、並實測驗出「`next lint` 真的會 fail」之前，
> ⛔ 任何報告不得以 `yarn lint` exit 0 作為佐證。**
>
> ⛔ **不得再寫**「F2／F4 的佐證證明力受影響」那種說法 —— 那是**基於假前提**。
> ⚠️ 這一改⛔ 不放寬也⛔ 不加重架構師的裁定，只是把它掛在正確的事實上。
> ⚠️ 它會直接改變主迴圈要記進 backlog 的那一行怎麼寫。

### 📌 移交給主迴圈的收案動作（實作側⛔ 不得自行做）

`CLAUDE.md` 地雷清單**第 1 條**目前寫「`/admin` 保護沒守到任何頁面」——
其狀態已因 F1 改變（見下「結論」）。
⚠️ **該條要改成什麼由主迴圈於收案時決定**，實作側⛔ 不預先改 `CLAUDE.md`。

---

## 結論

**middleware 的 `/admin` 保護，經實測確認有效 —— 三個情境全過。**

| 情境 | 測法 | 結果 |
|------|------|------|
| (a) 未登入 | C1 無 cookie curl（+ A2/A3 環境對照、C2 瀏覽器對照） | ✅ **被擋**（`307` → signin，body 無 probe 內容） |
| (b) 管理員本人 | C3 真機 OAuth 登入 | ✅ **放行**（看得到 probe 頁） |
| (c) 非管理員 | D2–D5 **反向驗證**（改 `ADMIN_DISCORD_ID` 為假值） | ✅ **被擋**（middleware 負向 D4 + `signIn` 負向 D5） |

⇒ 對 `CLAUDE.md` **地雷清單第 1 條**的影響：

- **前半仍為事實**：`app/` 底下確實⛔ 沒有 `admin/` 頁面
  （本側 `find app -type d -name 'admin*'` 零輸出）
  ⇒ 這道保護目前**確實沒守到任何實際頁面**。
- **後半改變了**：「它是否有效」**已由假設變為已驗證**。
  ⚠️ 而且比原先假設的更廣 —— 由附帶發現可知，它守的是**路徑空間**，
  ⛔ 不只是既有頁面（即使頁面不存在也會攔截並轉向）。
- ⇒ ⚠️ **該條要改寫成什麼由主迴圈於收案時決定**，⛔ 實作側不預先改。

---

## 未涵蓋 / 誠實標註（⛔ 不得以推理補寫）

1. **D7 未做**（架構師裁決，已定案）⇒ ⛔ **缺少「還原確實生效」的直接證據**。
   ⚠️ D6 的 `diff` exit 0 + md5 回到原值只證明**檔案內容**還原，
   ⛔ 不證明**執行環境**在還原後仍如 C3 般可通行。
2. **D4 的證據力隱含「session 存續」假設** —— ⛔ 不是無條件鐵證（詳見「測試結果 N2」框）。
3. **情境 (c) 走的是反向驗證**（裁決 2乙）⇒ ⛔ **未驗到「不同 Discord 帳號的 profile 結構也相同」**。
   該事實由 Discord API 規格保證、風險低，但 ⛔ **不得寫成「已驗證非管理員帳號被拒」**。
4. **P2（Discord 後台 redirect URI）Claude 端⛔ 無法獨立複驗**：只有架構師的口頭回報
   ＋ OAuth 跳轉結果這個間接實測（C3 首試回 `無效的 OAuth2 redirect_uri`、
   補正後通過 —— 這一正一負剛好構成間接佐證）。
   ⛔ 不得寫成「已驗證後台設定」。
5. **`/auth/error` 為 404** —— 裁決 4甲 的已知現況，⛔ 不算 F1 失敗、⛔ 本任務未修。
6. **`yarn lint --max-warnings 0` 是空測** —— 已裁決另立任務（見上節）。
7. **實作側本輪未重量的項目**（重量需重啟 dev server 或重建已刪除的 fixture，本輪守界禁止）
   —— ⚠️ **其中四項已由稽核側獨立補量、結果全符**，原始輸出已抄錄於「回歸守門 §3」：
   | 項目 | 狀態 |
   |------|------|
   | E4 的九個 `200` | ✅ 主迴圈實測 + **稽核側獨立補量確認** |
   | 已刪路由的 `307` | ✅ 同上（稽核側另補負向對照：非 `/admin` 的不存在路徑為 404） |
   | `/auth/error` 的 `404` | ✅ 同上 |
   | `/api/auth/providers` 的 `callbackUrl` | ✅ 同上（逐字相同） |
   | D2 假值狀態的 `.env.local` md5 | ⛔ **仍無人獨立重量** —— 該狀態已於 D6 還原、**永久不可重現**；重現需改 `.env.local`（含架構師真實憑證，屬禁區）⇒ 僅為**主迴圈單一來源**的數值 |
8. **真機步驟（C2／C3／D4／D5）本質上不可由 Claude 重量** —— 依架構師口述記錄。
   ⚠️ 稽核側亦⛔ 無法重量，僅能核對留證檔與報告陳述是否一致（已核，逐句相符）
   與客觀側證（`D-devserver.log` 差分、`C-devserver-2.log` 的 `Compiled /admin/f1-probe`）。
9. **無單元測試**：本 repo ⛔ 無測試框架；本任務⛔ 未新增（超出範圍）。
10. ⚠️ **稽核側⛔ 未能獨立重量 `yarn install --frozen-lockfile` 的 exit 0**
   —— 原因是**守門 hook（`audit-write-guard`）阻擋 install 類指令**（逐字：「偵測到檔案改動類指令」）
   ⇒ 該項**⛔ 不得視為已被稽核複核**，其來源仍是實作側／主迴圈的 `E3-install.log`。
   ⚠️ 但它的**衍生結論已由稽核側獨立重量**：`yarn.lock` sha256 前後同值、
   `package-lock.json` 不存在（`ls_exit=1`）⇒ 「安裝未改動依賴解析」這個**實質結論**站得住。
11. ⚠️ **稽核側⛔ 未能執行 `git tag` 列表**（同一 hook 阻擋，因 `git tag` 可建 tag）
   ⇒ 已改用唯讀替代確認「⛔ 未打任何 tag」：`.git/refs/tags` 為**空目錄**、
   `.git/packed-refs` 內 `refs/tags` 零筆（本側亦自量：`ls -A .git/refs/tags | wc -l` → `0`）。

---

## 守界聲明

### 只做了任務包範圍

- **實碼零變動**：`git diff --stat -- middleware.ts "app/api/auth/[...nextauth]/route.ts" .gitignore`
  → **零輸出**（三檔皆 0 行）。
- **臨時 fixture 已刪**：`find app -type d -name 'admin*'` → 零輸出；`app/` 恢復 9 個目錄。
- **工作樹殘留**：除三個**長期未 commit 的舊改動**（`app/layout.tsx` /
  `app/staff/page.tsx` / `components/ServerSection.tsx` —— 地雷第 6 條，**F1 前就存在**）
  與 F1 文件外，⛔ **無殘留**。
- **`.env.local` 保留**（裁決 Q1）且被 `.gitignore:33:.env*.local` 擋住，
  `git status` 完全看不到它（`grep -c 'env.local'` → 0）。

### ⚠️ `WORKFLOW.md` 的 modified 狀態 ⛔ **不屬於 F1**

`git status` 顯示 `M WORKFLOW.md`（`git diff --stat HEAD` 計 118 行變動）。
⚠️ 這是**主迴圈依另一份裁決（NR-D3 第一段）**所做的變更，
⛔ **與 F1 無關、⛔ 不得計入 F1 的變動**。
⇒ F1 的變動只有：`docs/tasks/F1-plan.md`（修訂 v3）、`docs/tasks/F1-verification.md`（本檔）。
（`docs/tasks/F1.md` 任務包與 `F1-plan-review.md` 放行書為 F1 五件套的另兩件，
⛔ 本輪未動 —— 依守界，實作側⛔ 不得改任務包與 review。）

### 未違反鐵則

| 鐵則 | 遵守情形 |
|------|----------|
| 1 機密只走 server 端 env | ✅ 五個變數只存在於 `.env.local`（未進版控）；⛔ 未改名 `NEXTAUTH_PUBLIC_*`／`NEXT_PUBLIC_*`；⛔ 未出現在任何 `"use client"` 檔；本報告與 plan ⛔ 無任何機密值／雜湊／遮罩 |
| 2 管理員授權判準單一 | ✅ ⛔ 一個字都沒改（`middleware.ts` 與 auth route 皆 0 行 diff）；本任務只**觀測**這條判準 |
| 3 對外 API 回結構化錯誤 | ✅ ⛔ 未動任何 Route Handler |
| 4 打 tag 就是發版 | ✅ ⛔ 未打任何 tag |
| 5 內容資料改 `data/` | ✅ `data/` 零 diff（`git diff --stat -- data/` **零筆**）；`components/` **僅** `ServerSection.tsx` 為 **F1 前既存的舊改動**（地雷第 6 條，本側 `stat` 實測檔案時間 **2026-03-28 00:52:00**，比 F1 早約五個月；`git diff --stat` 為 88+/85-）⇒ **F1 ⛔ 未修改任何元件** |

### 其他守界

- ⛔ 未跑 `npm install`（`package-lock.json` 未復活，本側 `ls` 實測 `No such file or directory`）
- ⛔ 未用 `git checkout` 做任何還原（改用 scratchpad 備份 + `cp`）
- ⛔ 未 `git add`／⛔ 未 commit／⛔ 未 push
- ⛔ 未改 `CLAUDE.md`（含地雷清單、程式碼地圖）
- ⛔ 未改 `F1.md`／`F1-plan.md`（v3 之後未再動）／`F1-plan-review.md`／`WORKFLOW.md`
- ⛔ 未改 `F1-verification-audit.md` —— ⚠️ 稽核報告由稽核側署名，實作側⛔ 不得改；
  本輪只依其結論修正**本檔**
- ⛔ 未建 `.evidence/`（裁決 Q3）
- ⛔ 未代改 Discord 開發者後台任何設定
- ⛔ 未順手補 ESLint 設定（已裁決另立任務）

### carryover

1. **ESLint 設定缺失 ⇒ `next lint` 空測** —— 已裁決另立 backlog 任務（架構師 2026-09-04 裁「甲」），
   由主迴圈登記；⚠️ 新任務須驗證 `next lint` **真的會 fail**。
2. **這道閘門的佐證處置** —— 已裁決：只在 backlog 記一行，⛔ 不回頭改已收案文件。
   ⚠️ **登記文字須採更正版**：實際受影響的已收案佐證 = **0 件**（F2／F4 皆經架構師明確豁免、
   **從未執行** `yarn lint`）；裁定的適用對象是**日後** —— 在補好 ESLint 設定並驗出
   「`next lint` 真的會 fail」之前，⛔ 任何報告不得以 `yarn lint` exit 0 作為佐證。
   ⛔ 不得沿用初版「F2／F4 的佐證證明力受影響」那句（前提為偽）。
3. **`CLAUDE.md` 地雷清單第 1 條的改寫** —— 由主迴圈於收案時決定。
4. **`/auth/error` 404** —— 裁決 4甲 的已知現況，⛔ 本任務未修；是否另立任務由架構師決定。
5. **`.env.local` 保留在硬碟**（裁決 Q1）—— 日後本機開發可直接沿用；⚠️ 埠固定 3100，
   若換埠需同步 Discord 後台的 redirect URI（⛔ 只有架構師本人能改）。

### ⛔ 尚未 commit/push，**等待架構師確認**

⛔ 任務包、`F1-plan.md`、本報告與任何往來措辭 **均⛔ 不構成 push 預授權**。
⇒ 待架構師逐字確認後才 `git add`（**逐檔 add，⛔ 不用 `git add .`** —— 地雷第 6 條）。
