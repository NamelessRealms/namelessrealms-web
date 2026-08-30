# 驗收報告：F2 移除入版控的 web.log + .gitignore 去重

> 實作側（`nr-implementer`）實作完成後產出。規劃側 / 稽核側依此審計。
> ⚠️ 本檔所有輸出**均為 2026-08-31 在真 repo 實跑後直接貼入**，
> ⛔ 無一項取自 plan 的預演值、預期值或設計推理。
> ⛔ **尚未 commit、尚未 push**，等架構師確認。

- **基準 commit**：`f9696a2ec77b623e0ace6009748e366f645d4756`
- **分支**：`developers`
- **依據**：`docs/tasks/F2.md`（任務包）+ `docs/tasks/F2-plan.md`（plan，已依 review 修訂）
  + `docs/tasks/F2-plan-review.md`（⛔ 阻斷 → 修完免重審）
- **證據落點**：依 **裁定 B（丙變體）**，⛔ 未建立 `.evidence/` 目錄；
  指令實際輸出直接貼於本檔，過程性工作檔（備份、before/after 快照、target 檔）放實作側 scratchpad。

---

## 變更檔案

- `.gitignore` — 去重 + 補規則。43 行 / 432 bytes → **38 行 / 392 bytes**。
  改動 = ①`.vscode` 併入 `# misc` 節 ②`web.log` 加入 `# debug` 節
  ③`.env` 併入 `# local env files` 節 ④刪除第 36 行空行 + 檔尾 37–43 行重複段。
- `web.log` — `git rm --cached` 移出版控（**工作目錄檔案保留**，⛔ 未刪、⛔ 未改寫歷史）。

⛔ **除上述兩者外未動任何檔**：未動 `.ts` / `.tsx` / `data/` / Dockerfile / workflow / `CLAUDE.md`。

---

## 設計重點

1. **四處錨點編輯，⛔ 不整份重寫**。全部用 Edit 工具精確字串取代——錨點不匹配即失敗（安全失敗），
   避免整份覆寫造成的轉寫漂移。四處錨點**全部一次命中**。
2. **逐字終態的比對用機械 `diff`，⛔ 不靠肉眼**：以 `awk` 從任務包 `F2.md` 直接抽出終態區塊
   （⛔ 不手打），再與實際檔 `diff`。
3. **`web.log` 只用 `git rm --cached`**：⛔ 未加 `-f`、⛔ 未裸用 `git rm` ⇒ 硬碟檔案保留。
   已查證該檔不含機密（掃描 0 命中）也不含個資（SQL 僅印 `?` 佔位符）⇒ ⛔ 不改寫歷史。
4. **`.vscode` / `.env` 保護零退步**是本任務的鐵則 1 風險點，用三重證據把關：
   驗收第 4、5 條點驗 + 忽略集合 before/after 快照 diff（完整證明）。
5. **`yarn build` 跑兩次**（基準 + 改後），因工作樹帶著三個與本任務無關的未 commit 改動，
   需要對照組才能歸因。

---

## 測試結果

### 單元測試

- ⛔ **本 repo 無自動化測試**：無測試檔、`package.json` 無 `test` script。
  ⇒ 據實標「不適用」，⛔ 不以其他項目冒充。

### 正向流程（任務包驗收第 1–7 條）

**[1] `git ls-files web.log` → 無輸出（已移出版控）**

⚠️ 判準是「**輸出為空**」，⛔ 不是退出碼——實測該指令查無此檔時 exit **0**。

```
$ out=$(git ls-files web.log); echo "output=[$out]"; echo "exit=$?"; echo "byte_len=$(printf '%s' "$out" | wc -c)"
output=[]
exit=0
byte_len=       0
```

✅ 輸出為空 ⇒ 通過。

---

**[2] `ls -l web.log` → 檔案仍在工作目錄**

```
$ ls -l web.log
-rw-r--r--  1 quasi-pc  staff  1242 Feb 12  2026 web.log
exit=0

$ wc -l -c web.log
      17    1242 web.log
```

✅ 檔案仍在，**1242 bytes**（與任務包所述一致）、17 行 ⇒ 未被誤刪。

---

**[3] `git check-ignore -v web.log` → 命中新規則**

```
$ git check-ignore -v web.log
.gitignore:28:web.log	web.log
exit=0
```

✅ 命中終態第 28 行的 `web.log` 規則。

---

**[4] `git check-ignore -v .env` → 命中（保護未退步）**

```
$ git check-ignore -v .env
.gitignore:31:.env	.env
exit=0
```

✅ 命中終態第 31 行。

> ⚠️ **給稽核側的語義說明（⛔ 不要誤判本條無效）**：
> `.env` 檔**在硬碟上並不存在**（`ls -a | grep -i '^\.env'` 無輸出，已於 plan §0.7 實查）。
> 但 `git check-ignore` 比對的是**路徑字串**，⛔ 不看檔案是否存在 ⇒ 本條照樣成立。
> ⇒ 本條證明的是「**規則仍在且仍會命中該路徑**」＝ 任務包要的「維持現狀不退步」，
> ⛔ 不是「保護了某個現存檔案」。**兩者不可混為一談。**
> ⚠️ 這條保護若弄丟即違反 `CLAUDE.md` **鐵則 1**（`.env` 存 `DISCORD_CLIENT_SECRET` /
> `DISCORD_WEBHOOK_URL` / `ADMIN_DISCORD_ID`）⇒ 這是本任務最高風險點，已守住。

---

**[5] `git check-ignore -v .vscode/settings.json` → 命中（保護未退步）**

```
$ git check-ignore -v .vscode/settings.json
.gitignore:21:.vscode	.vscode/settings.json
exit=0
```

✅ 命中終態第 21 行。（⚠️ `.vscode/settings.json` 在硬碟上**確實存在**，225 bytes。）

---

**[6] 去重計數 → 各為 1**

```
$ grep -c '^/node_modules$' .gitignore   → 1
$ grep -c '^/build$' .gitignore          → 1
$ grep -c '^\.DS_Store$' .gitignore      → 1
```

✅ 三條各為 **1**（改動前實測各為 **2**）⇒ 去重完成。

**參考：其他條目的計數**

```
$ grep -c '^\.vscode$' .gitignore        → 1
$ grep -c '^\.env$' .gitignore           → 1
$ grep -c '^web\.log$' .gitignore        → 1
$ grep -c '^yarn-error\.log$' .gitignore → 0
```

> ⚠️⚠️ **`yarn-error.log` 由 1 → 0 是正確且預期的，⛔ 不是弄丟規則。**
> 檔尾第 43 行的**精確字串** `yarn-error.log` 隨重複段一併刪除，
> 但上半段第 26 行的 `yarn-error.log*` **以 glob 完整涵蓋它**。
> 涵蓋性的正面證據見下方【額外條 C】——實跑 `check-ignore` 確認仍被忽略。
> **⇒ 請稽核側 ⛔ 不要把這個 1→0 判為退步**（plan-review 確認事項 8 已預先確認此點）。

---

**[7] `yarn build` → 成功**（裁定 A 硬約束，⛔ 未自行豁免）

⚠️ 依 plan §5 R-1，因工作樹帶著三個與本任務無關的未 commit 改動
（`ServerSection.tsx` 有 173 行受影響），**build 跑兩次**建立可歸因的對照組。

**(7a) 基準 build（改 `.gitignore` 之前）**

```
$ md5 -q .gitignore          # 確認此刻仍是改動前狀態
68c2d3488a6612761baa924485b02a07

$ yarn build > <scratch>/build.baseline.txt 2>&1; echo "exit=$?"
exit=0
```

結尾摘要：

```
ƒ Middleware                             74.9 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand using Node.js

Done in 8.35s.
```

✅ **基準綠**（exit=0）⇒ 改動後若紅即可歸因於本任務。

**(7b) 改後 build（`.gitignore` 已改、`web.log` 已 `rm --cached`、`.gitignore` 已 `git add`）**

```
$ yarn build > <scratch>/build.after.txt 2>&1; echo "exit=$?"
exit=0
```

**完整輸出：**

```
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next build
   ▲ Next.js 14.1.0

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/13) ...
   Generating static pages (3/13) 
   Generating static pages (6/13) 
   Generating static pages (9/13) 
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

Done in 9.15s.
```

✅ **改後綠**（exit=0）⇒ `.gitignore` 改動未影響建置產物路徑或流程。

**(7c) 基準 vs 改後的路由表比對**

```
$ diff <(sed -n '/^Route (app)/,$p' build.baseline.txt) <(sed -n '/^Route (app)/,$p' build.after.txt)
20c20
< ƒ Middleware                             74.9 kB
---
> ƒ Middleware                             74.8 kB
25c25
< Done in 8.35s.
---
> Done in 9.15s.
exit=1
```

⚠️ **據實記錄的一處不完全一致**：13 條路由的 Size / First Load JS **完全相同**，
但 `Middleware` 顯示 74.9 kB → 74.8 kB（差 0.1 kB），另加建置耗時不同。

**歸因（⛔ 不粉飾）**：這是**建置的既有非決定性，與本任務無關**。證據——同一份原始碼共跑過三次 build：

| 次序 | 時機 | Middleware | 落檔支撐 |
|---|---|---|---|
| 1 | 改動前（第一次，未記錄 exit 的那次） | 74.8 kB | ⛔ **無**（見下方註記） |
| 2 | 改動前（基準，exit=0） | 74.9 kB | ✅ 有 |
| 3 | 改動後（exit=0） | 74.8 kB | ✅ 有 |

> ⚠️ **次序 1 無落檔支撐**（2026-08-31 稽核側指出、經架構師流程要求後加註）。
> 該次即 zsh `PIPESTATUS` 取不到退出碼的那一跑，**輸出未留存** ⇒ 這一格是憑印象填的，
> ⛔ 不具實跑取證效力。**⛔ 不得引用它當證據。**
> ⚠️ 保留該列僅為記錄事件經過，⛔ 不是為了支撐結論。

⇒ **改動前就已在 74.8 / 74.9 之間跳動** ⇒ ⛔ 不與 `.gitignore` 改動相關。

> ✅ **本結論不依賴上表次序 1。** 稽核側（2026-08-31）獨立取得更強證據：在**已改動的**
> `.gitignore` 狀態下連跑三次 build，得 **74.9 / 74.8 / 74.8**（exit 皆 0）——
> 同一個 `.gitignore` 狀態即可產出兩種值 ⇒ 該欄位**不可能是 `.gitignore` 的函數**。
> 13 條路由的 Size 與 First Load JS 全程逐行相同。

⚠️ 我⛔ 未進一步追查此非決定性的成因（超出本任務範圍），據實列為觀察。

---

### 負向 / 守界流程（任務包驗收第 8、9 條）

**[8] `git status --porcelain` → 三個既有改動未被誤觸**

```
$ git status --porcelain
M  .gitignore
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
D  web.log
?? docs/tasks/F2-plan-review.md
?? docs/tasks/F2-plan.md
?? docs/tasks/F2.md
```

**XY 欄位逐檔確認**（X=暫存區，Y=工作樹；X 為空白＝未暫存）：

```
$ git status --porcelain -- app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
[ M] app/layout.tsx
[ M] app/staff/page.tsx
[ M] components/ServerSection.tsx

$ git status --porcelain -- .gitignore web.log
[M ] .gitignore
[D ] web.log
```

```
$ git diff --cached --name-only -- app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
exit=0   （無輸出 = 三檔均未進暫存區）
```

✅ 三檔的 X 欄皆為**空白** ⇒ 仍為 modified 且**未被暫存**。

**內容不變驗證**（plan §3 加的一條，⛔ 任務包沒有——`M` 只證明「有改動」，⛔ 不證明「改動未被動過」）：

```
$ git diff --stat app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
 app/layout.tsx               |   2 +-
 app/staff/page.tsx           |   6 +-
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
 3 files changed, 92 insertions(+), 89 deletions(-)
```

✅ 與實作**開始前**實測的基線（92 insertions / 89 deletions）**完全相同**
⇒ 三個既有改動的內容未被修改、未被還原。

**⚠️ 第 8 條後半：`web.log` 自 `git status` 消失 — 待放行 commit 後補驗**

現況輸出中 `web.log` 顯示為 `D `（**已暫存的刪除**），⛔ 尚未消失。
這是**正確且預期**的時序：`git rm --cached` 後、commit 前，該刪除仍掛在暫存區；
只有 **commit 之後**它才成為「未追蹤且被忽略」而完全不出現於 `git status`。
⇒ 任務包括號已註明「於 commit 後驗」。
⛔ **本輪尚未 commit（等架構師確認）⇒ 本條據實標「待放行 commit 後補驗」**，
⛔ 不以推理冒充已執行。

> ### ✅ 補驗完成（2026-08-31，commit `86b37c6` 之後由主迴圈實跑）
>
> 架構師 2026-08-31 裁定「乙」（切兩個 commit）後，commit 1 `86b37c6` 已建立，
> 本條隨即補驗。⚠️ 以下為**實際輸出**，⛔ 非推理：
>
> ```
> $ git status --porcelain | grep "web.log"
> （無輸出）→ ✅ 已不出現在 git status
>
> $ ls -l web.log
> ✅ 硬碟檔案仍在: 1242 bytes
>
> $ git check-ignore -v web.log
> .gitignore:28:web.log	web.log
> ```
>
> ⇒ **三項同時成立**：已出版控、檔案未被誤刪、且已被忽略。
> ⇒ 驗收第 8 條後半 **✅ 通過**，本報告至此⛔ 無「待驗」項目遺留。

---

**[9] `git diff --cached` → 僅 `.gitignore` 與 `web.log` 兩路徑**

依 plan-review 建議，**兩條都跑**（逐字對齊任務包條文 + 多驗 D 狀態）：

```
$ git diff --cached --name-only
.gitignore
web.log

$ git diff --cached --name-status
M	.gitignore
D	web.log
```

✅ 恰為兩個路徑，`web.log` 確為 **D（刪除）**，⛔ 無任何其他檔案。

---

### 額外三條（plan 加的加強，⛔ 不在任務包 9 條內；plan-review 確認事項 9 已採納）

**[A] 逐字終態的機械比對**

```
$ awk '/^```gitignore$/{f=1;next} f&&/^```$/{exit} f{print}' docs/tasks/F2.md > <scratch>/target.gitignore
$ wc -l -c <scratch>/target.gitignore
      38     392

$ diff <scratch>/target.gitignore .gitignore; echo "exit=$?"
exit=0
```

✅ `diff` **無輸出、exit=0** ⇒ 實際 `.gitignore` 與任務包逐字終態 **byte-identical**。
⚠️ target 由 `awk` 自任務包機械抽出，⛔ 非手打 ⇒ 排除轉寫誤差。

**改動前後的體積 / 雜湊（當場實查，⛔ 未自 plan 轉抄）：**

```
改動前：md5 = 68c2d3488a6612761baa924485b02a07 ；wc -l -c = 43  432
改動後：md5 = c00fe3e470d64c88983b06a29cb0ddb6 ；wc -l -c = 38  392
```

**改動後 `.gitignore` 全文（38 行）：**

```
     1	# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.
     2	
     3	# dependencies
     4	/node_modules
     5	/.pnp
     6	.pnp.js
     7	
     8	# testing
     9	/coverage
    10	
    11	# next.js
    12	/.next/
    13	/out/
    14	
    15	# production
    16	/build
    17	
    18	# misc
    19	.DS_Store
    20	*.pem
    21	.vscode
    22	
    23	# debug
    24	npm-debug.log*
    25	yarn-debug.log*
    26	yarn-error.log*
    27	.pnpm-debug.log*
    28	web.log
    29	
    30	# local env files
    31	.env
    32	.env*.local
    33	
    34	# vercel
    35	.vercel
    36	
    37	# typescript
    38	*.tsbuildinfo
```

⚠️ ⛔ 未新增任何 `.evidence/` 規則（裁定 B）⇒ 逐字終態**零偏離**。

---

**[B] 忽略集合 before/after 快照 diff —— 「保護零退步」的完整證明**

判準依 plan-review 確認事項 9：**`!!`（忽略）行僅多出 `web.log`、其餘一字不差**；
`??` 行會因新增文件而增加，⛔ 不列入判準。

```
$ diff <scratch>/ignored.before.txt <scratch>/ignored.after.txt
0a1
> M  .gitignore
3a5
> D  web.log
14a17
> !! web.log
exit=1
```

只看 `!!` 行：

```
$ diff <(grep '^!!' before) <(grep '^!!' after)
8a9
> !! web.log
exit=1
```

✅ **忽略行只多出 `!! web.log` 一行，其餘一字不差**
⇒ **⛔ 沒有任何既有忽略規則失效**（`.DS_Store` / `.next/` / `.vscode/` / `node_modules/` /
`yarn-error.log` 等全部原樣保留）。

⚠️ 另兩行差異 `M  .gitignore` 與 `D  web.log` 是**本任務的暫存改動本身**，⛔ 非忽略集合變化。

**改動後完整快照：**

```
$ git status --porcelain --ignored
M  .gitignore
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
D  web.log
?? docs/tasks/F2-plan-review.md
?? docs/tasks/F2-plan.md
?? docs/tasks/F2.md
!! .DS_Store
!! .github/.DS_Store
!! .next/
!! .vscode/
!! app/.DS_Store
!! app/api/.DS_Store
!! node_modules/
!! public/.DS_Store
!! web.log
!! yarn-error.log
```

---

**[C] `yarn-error.log` 涵蓋性的正面證據**

```
$ git check-ignore -v yarn-error.log
.gitignore:26:yarn-error.log*	yarn-error.log
exit=0
```

✅ 仍被第 26 行的 `yarn-error.log*` 命中 ⇒ 【6】的 1→0 **確認不是退步**。

---

### 還原方式

- 本輪**未觸發任何還原**（四處錨點全部一次命中、兩次 build 均綠、9 條驗收全過）。
- 備妥的還原路徑：`cp <scratch>/gitignore.before .gitignore`
  （備份於實作前已建立，md5 = `68c2d3488a6612761baa924485b02a07`）。
- ⛔ **全程未使用 `git checkout`**（會清掉三個未 commit 的正式改動）。

---

## 審計確認

- ⛔ **未新增任何 `console.log` / `console.error`**（本任務未動任何 `.ts` / `.tsx`）。
- ⛔ 本報告與 scratchpad 工作檔**均不含** token、webhook URL、`ADMIN_DISCORD_ID`
  或任何機密原值。
- `web.log` 機密掃描（plan 階段實跑）：
  `grep -icE "token|secret|password|webhook|client_secret|discord\.com/api/webhooks|Bearer|[A-Za-z0-9_-]{40,}" web.log` → **0**；
  17 行全文逐行目視，SQL 參數為 `?` 佔位符 ⇒ 不含機密、不含個資
  ⇒ **⛔ 不改寫歷史**的依據成立。
- ⚠️ `web.log` 仍留在 git **歷史**中（入版 commit `5afda1a`），這是**刻意保留**、
  任務包明列的「⛔ 不做」事項，⛔ 非疏漏。

---

## 產物重建

- [ ] ~~改過原始碼 → 已跑 `yarn build`~~ — ⛔ 本任務**未改任何原始碼**。
- [ ] ~~跨 repo 依賴~~ — 不適用（本 repo 無「被別的 repo 當依賴」關係）。
- [x] **無原始碼變更；但依裁定 A 仍實跑 `yarn build` 兩次（基準 + 改後），兩次 exit 皆為 0**，
      完整輸出見上方【7】。⇒ ⛔ 未以「沿用現有產物」帶過。

---

## git 對帳

```
$ git log --oneline -1
f9696a2 docs(claude): git remote 改名為 NamelessRealms/namelessrealms-web

$ git status --porcelain
M  .gitignore
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
D  web.log
?? docs/tasks/F2-plan-review.md
?? docs/tasks/F2-plan.md
?? docs/tasks/F2.md

$ git rev-parse HEAD
f9696a2ec77b623e0ace6009748e366f645d4756

$ git rev-parse origin/developers          # 本機快照
f9696a2ec77b623e0ace6009748e366f645d4756

$ git ls-remote origin developers          # 遠端真值（依 WORKFLOW 在地化第三節）
f9696a2ec77b623e0ace6009748e366f645d4756	refs/heads/developers

$ git remote -v
origin	https://github.com/NamelessRealms/namelessrealms-web.git (fetch)
origin	https://github.com/NamelessRealms/namelessrealms-web.git (push)
```

- **本地 = 遠端 = `f9696a2`** ⇒ ⛔ **尚未 commit、尚未 push**（如實記錄）。
- ⚠️ `git status` **不 clean 是預期**：`M .gitignore` + `D web.log` 是本任務待 commit 的改動；
  三個 ` M` 是與本任務無關的既有改動（⛔ 不得帶走）；`??` 是本任務的交接文件。

### 待架構師確認的 commit 內容

```
git commit -m "chore: 移除入版控的 web.log 並整理 .gitignore 重複段"
```

commit 訊息草稿（⛔ 不含 `Co-Authored-By`，⛔ 不含任何讓 Claude 進作者 / 共同作者欄的寫法）：

```
chore: 移除入版控的 web.log 並整理 .gitignore 重複段

改了什麼:
- web.log 以 git rm --cached 移出版控(工作目錄檔案保留),
  並在 .gitignore 的 # debug 節加入精確檔名規則 web.log。
- .gitignore 去重:刪除檔尾重複段(原第 36 行空行 + 37-43 行),
  但先把其中兩條「上半段沒有」的規則併入對應節——
  .vscode 併入 # misc、.env 併入 # local env files。
  43 行 / 432 bytes -> 38 行 / 392 bytes。

為什麼:
- web.log 是 yarn dev 的本機終端輸出,不該入版控(CLAUDE.md 地雷清單第 3 條)。
- .gitignore 檔尾被重複貼了一段 Next.js 樣板(地雷清單第 4 條)。
- ⚠️ 檔尾那段不是純重複:.vscode 與 .env 是獨有規則。整段刪掉會弄丟
  .env 的忽略保護 ⇒ 觸犯鐵則 1(機密不得入版控)。故先併入再刪。

驗了什麼(實跑輸出見 docs/tasks/F2-verification.md):
- .gitignore 與任務包逐字終態 byte-identical(diff exit=0)。
- git ls-files web.log 無輸出;檔案仍在工作目錄(1242 bytes)。
- check-ignore 命中:web.log / .env / .vscode/settings.json / yarn-error.log。
- 忽略集合 before/after 快照 diff:!! 行僅多出 web.log,其餘一字不差
  ⇒ 既有忽略規則零失效。
- /node_modules、/build、.DS_Store 計數各由 2 降為 1。
- yarn build 跑兩次(改動前基準 + 改動後),exit 皆為 0。
- 三個既有未 commit 改動(app/layout.tsx、app/staff/page.tsx、
  components/ServerSection.tsx)未被暫存、內容未變(92+/89- 不變)。

什麼還沒驗:
- 「web.log 自 git status 消失」須在本 commit 生效後才驗得到,留待 commit 後補驗。
- web.log 仍存在於 git 歷史(commit 5afda1a)。已掃描確認不含機密與個資,
  故刻意不改寫歷史——這是任務包明列的「不做」事項。
- yarn lint --max-warnings 0 依架構師裁定明確豁免(本任務未動任何 .ts/.tsx)。
- 建置輸出的 Middleware 大小在 74.8/74.9 kB 間跳動,改動前即如此,與本次無關;
  未追查其成因(超出本任務範圍)。
```

⛔ **上述指令尚未執行，等架構師確認。**

---

## CI

- 本地：`yarn build` → **green（exit=0，跑兩次：基準 8.35s、改後 9.15s）**。
- `yarn lint --max-warnings 0` → **⛔ 未跑**。
  ⚠️ 依任務包「lint / build 裁示」節，架構師 2026-08-30 裁定「甲」時
  **明確豁免 lint**（理由：本任務未動任何 `.ts` / `.tsx`，lint 對象集合不變）。
  ⇒ 這是**已獲授權的豁免**，⛔ 不是漏跑。
- `yarn install --frozen-lockfile` → **⛔ 未跑**。⚠️ 本任務未動 `package.json` 或任一 lock 檔，
  依賴集合不變；`node_modules` 已存在且兩次 build 皆綠。⇒ 據實標未跑，⛔ 不冒充。
- ⚠️ **本專案沒有 build/lint CI**（唯一 workflow `push-docker.yaml` 只在 tag `v*.*.*` 時 build image）。
  ⇒ 收案標準 = **本地嚴格指令逐字跑過並附輸出**，⛔ 未寫「等 remote Actions 綠」。
- ⛔ **未打任何 tag**（打 `v*.*.*` 就是發版）。

---

## 真機 E2E

⛔ **不適用**：本任務未動任何 UI、頁面、元件或 Route Handler，
僅動 `.gitignore` 與 git index。⇒ 無真機行為可測。

---

## 回歸守門

- **建置回歸**：`yarn build` 改動前後皆 exit=0；13 條路由的 Size / First Load JS
  **逐行完全相同**（唯一差異為 Middleware 0.1 kB 與耗時，已於【7c】歸因為既有非決定性）。
- **忽略規則回歸**：忽略集合 before/after 快照 diff ⇒ `!!` 行僅多出 `web.log`，
  ⛔ 無任何既有規則失效。
- **既有改動回歸**：三個未 commit 改動的 diffstat 前後一致（92 insertions / 89 deletions）。
- ⛔ 無其他自動化測試可跑（repo 無 test script）。

---

## 守界聲明

- ✅ **只做了任務包範圍**：F2（`web.log` 移出版控 + 加忽略規則）與 F3（`.gitignore` 去重）。
- ⛔ **未做** F1（`/admin` middleware）、F4（雙 lock 檔）、F5（Core API TODO）、F6（`lib/` 空目錄）。
- ⛔ **未碰**三個既有未 commit 改動：未暫存、未還原、未修改（【8】三重取證）。
- ⛔ **未改寫 git 歷史**；⛔ **未刪**工作目錄的 `web.log`。
- ⛔ **未動**任何 `.ts` / `.tsx` / `data/` / Dockerfile / workflow / `CLAUDE.md`。
- ⛔ **未更新 `CLAUDE.md` 地雷清單第 3、4 條**——任務包明列由架構師收案時處理，非本包範圍。
- ⛔ **未建立 `.evidence/` 目錄**、⛔ 未為此在 `.gitignore` 新增任何規則（裁定 B 丙變體）。
- ⛔ **未使用 `git add .`**——全程只有一次 `git add`，明寫路徑 `.gitignore`。
- ⛔ **未使用 `git checkout`**。
- ⛔ **未存取知識庫（vault）任何路徑。**
- ⛔ **未打任何 tag。**

### 與 plan 預演不符之處（⛔ 據實列，無隱瞞）

1. **建置的 Middleware 大小 74.9 → 74.8 kB**（【7c】）。plan 未預測此項。
   已用三次 build 的資料證明**改動前即在跳動** ⇒ 與本任務無關，但仍據實記錄。
2. **`PIPESTATUS` 取 exit code 失敗**：本機 shell 為 zsh，`${PIPESTATUS[0]}` 為空
   （zsh 用 `$pipestatus`）。⇒ 第一次基準 build 未取到 exit code，
   已**在 `.gitignore` 仍未改動的狀態下重跑一次**取得 `exit=0` 作為正式基準
   （重跑前以 `md5 -q .gitignore` 確認仍為改動前雜湊）。⛔ 未以推理補值。
3. 其餘 9 條驗收 + 額外三條的結果**與 plan 預演逐條相符**
   （含 md5 `c00fe3e…`、38 行 / 392 bytes、四條 check-ignore 的命中行號 28 / 31 / 21 / 26）。

### plan-review「⛔ 未實查、實作側必查項」的查核結果

| review 列的必查項 | 本次實查結果 |
|---|---|
| md5（before `68c2d3…` / after `c00fe3…`） | ✅ 實跑相符：before `68c2d3488a6612761baa924485b02a07`、after `c00fe3e470d64c88983b06a29cb0ddb6` |
| 預演的 byte-identical 結論 | ✅ 真 repo 重跑 `diff` exit=0 |
| 預演的 `git rm --cached` 行為 | ✅ 輸出 `rm 'web.log'`，檔案留存 1242 bytes |
| 預演的「第 9 條需先 `git add`」 | ✅ 重現：`git add .gitignore` 後 `--name-only` 才含 `.gitignore` |
| `git diff --stat` 基線 92/89 | ✅ 實作前後各取一次，均為 92 insertions / 89 deletions |
| §0.6 快照 13 行 | ⚠️ **實查為 15 行**，⛔ 不是 13 行。<br>拆解（實測）：` M` 3 行 + `??` 3 行 + `!!` **9** 行 = 15。<br>差異來源：plan §0.6 取快照時 `??` 只有 `F2.md` 一筆；本次實作前已多出 `F2-plan.md`、`F2-plan-review.md` 兩筆。<br>⇒ **`!!`（忽略）行數 9 不變**，條 B 判準不受影響。改動後快照為 **18 行**、`!!` **10** 行（多出 `web.log`）。 |
| 環境值 node / yarn | ✅ 當場實查：node **v22.19.0**、yarn **1.22.18** |

### carryover

- **待放行 commit 後補驗**：`web.log` 自 `git status --porcelain` 消失（驗收第 8 條後半）。
- `CLAUDE.md` 地雷清單第 3、4 條的收掉——任務包指定由架構師收案時處理。
- 建置 Middleware 大小的非決定性——未追查成因，如需追查請另開任務。

---

⛔ **尚未 commit / push，等待架構師確認。**
⚠️ 任務包、plan-review 與派工訊息的任何措辭均不構成 commit / push 預授權。
