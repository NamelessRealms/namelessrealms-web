# 實作計畫：F2 移除入版控的 web.log + .gitignore 去重

> 實作側（`nr-implementer`）依 `docs/tasks/F2.md` 產出。
> ⛔ **本檔落檔時尚未動手實作**，等 `docs/tasks/F2-plan-review.md` 放行才動工
> （repo `CLAUDE.md` 開發守則第 7 條）。
>
> ⚠️ 本檔內所有數值**均為實作側自行實測**，⛔ 無一項自任務包或他處轉抄。
> 取得數值的指令逐條附在該數值旁，可原地複驗。

---

## 0. 基準事實複驗（⚠️ 全部自行實跑，⛔ 不轉抄任務包）

### 0.1 基準 commit — ✅ 與任務包一致

```
$ git rev-parse HEAD
f9696a2ec77b623e0ace6009748e366f645d4756

$ git rev-parse --abbrev-ref HEAD
developers
```

⇒ 任務包寫的 `f9696a2` **複驗相符**（短碼為此長碼前 7 碼）。分支 `developers` 正確。

### 0.2 `.gitignore` 現況 — ✅ 與任務包一致

```
$ wc -l -c .gitignore
      43     432 .gitignore

$ md5 -q .gitignore
68c2d3488a6612761baa924485b02a07
```

43 行、432 bytes。逐行核對任務包背景區列的檔尾 37–43 行，**完全相符**：

| 行 | 內容 |
|---|---|
| 36 | （空行） |
| 37 | `/node_modules` |
| 38 | `/build` |
| 39 | （空行） |
| 40 | `.DS_Store` |
| 41 | `.vscode` |
| 42 | `.env` |
| 43 | `yarn-error.log` |

⚠️ 任務包背景區的表只列 37–43，**沒有列到第 36 行的空行**——刪除範圍實際要含它，
否則檔尾會殘留一個孤兒空行、與逐字終態不符。已納入下方步驟 1 的錨點。

### 0.3 陷阱條目複驗 — ✅ 任務包的判定正確

```
$ for p in '^/node_modules$' '^/build$' '^\.DS_Store$' '^\.vscode$' '^\.env$' '^yarn-error\.log$' '^web\.log$'; do
      printf "%-22s %s\n" "$p" "$(grep -c "$p" .gitignore)"; done
^/node_modules$        2
^/build$               2
^\.DS_Store$           2
^\.vscode$             1
^\.env$                1
^yarn-error\.log$      1
^web\.log$             0
```

⇒ `.vscode`（1 次）與 `.env`（1 次）確實**只出現在檔尾那段**，
整段刪掉就會歸零 ⇒ 任務包的「⛔ 獨有，不可弄丟」判定**成立**。

### 0.4 `web.log` 現況 — ✅ 與任務包一致

```
$ git ls-files web.log
web.log

$ ls -l web.log
-rw-r--r--  1 quasi-pc  staff  1242 Feb 12  2026 web.log

$ wc -l -c web.log
      17    1242 web.log

$ git log --oneline --diff-filter=A -- web.log
5afda1a chore: reorganize project structure and migrate to app router

$ git ls-files | grep '\.log$'
web.log
```

⇒ 已入版控、1242 bytes、17 行、入版 commit `5afda1a`、repo 內唯一入版控的 `.log`。**全部相符。**

**機密掃描（自行重跑任務包那條指令）：**

```
$ grep -icE "token|secret|password|webhook|client_secret|discord\.com/api/webhooks|Bearer|[A-Za-z0-9_-]{40,}" web.log
0
```

⇒ 0 命中。另已逐行目視 17 行全文：內容為 `yarn dev` 終端輸出
（Next.js 14.1.0 啟動訊息 + 兩筆舊 prisma query log）。
⚠️ 兩筆 SQL 的參數是 `?` **佔位符**，⛔ 未展開任何實值 ⇒ 不含個資。
⇒ **確認不需改寫歷史**，任務包此判定成立。

### 0.5 工作樹守界基線

```
$ git status --porcelain
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F2.md

$ git diff --stat app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
 app/layout.tsx               |   2 +-
 app/staff/page.tsx           |   6 +-
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
 3 files changed, 92 insertions(+), 89 deletions(-)
```

⇒ 三個未 commit 改動確實存在，且 `ServerSection.tsx` 改動量不小（173 行受影響）。
⚠️ 這對 `yarn build` 有影響，見 §5 風險 R-1。

### 0.6 忽略集合快照（本計畫新增的守門手段，⛔ 不在任務包驗收清單內）

```
$ git status --porcelain --ignored | wc -l
      13

$ git status --porcelain --ignored
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F2.md
!! .DS_Store
!! .github/.DS_Store
!! .next/
!! .vscode/
!! app/.DS_Store
!! app/api/.DS_Store
!! node_modules/
!! public/.DS_Store
!! yarn-error.log
```

⇒ 只有 13 行，成本極低。**這是「忽略保護零退步」最強的證據**：
改動前後各取一次快照對 diff，若忽略集合只多出 `web.log`、其餘一字不差，
就直接證明沒有任何規則失效——比任務包驗收第 4、5、6 條的抽樣檢查更完整。
⇒ 本計畫**兩者都做**（任務包 9 條照跑，另加這一條）。

### 0.7 環境

```
$ node -v      → v22.19.0
$ yarn -v      → 1.22.18
$ ls -d node_modules → node_modules   （已安裝）
$ ls -d .next        → .next          （已有前次建置產物）
```

⚠️ **`.env` 檔在硬碟上不存在**：`ls -a | grep -i '^\.env'` 無任何輸出。
`.vscode/` 則**存在**（內有 `settings.json`，225 bytes）。
⇒ 這不影響驗收第 4 條，理由見 §4 的「⚠️ check-ignore 語義」一段。

---

## 1. 事前預演（⚠️ 已完成，⛔ 未觸碰本 repo 工作樹）

為避免「計畫紙上談兵」，已先在 scratchpad 內
`git clone --branch developers` 一份複本，把整套改動與 9 條驗收**完整跑過一遍**。
⚠️ 複本位於 scratchpad，⛔ 對本 repo 為唯讀（clone 不改來源），
⇒ 本 repo 工作樹此刻仍與 §0.5 快照一致。

**預演複本基準**（證明與本 repo 同源同態）：

```
$ git rev-parse HEAD   → f9696a2ec77b623e0ace6009748e366f645d4756
$ md5 -q .gitignore    → 68c2d3488a6612761baa924485b02a07
```

預演的三項關鍵產出（→ 直接決定下方步驟與 §6 的任務包問題回報）：

1. §2 的四處錨點編輯，產物與任務包逐字終態 **byte-identical**（`diff` 無輸出）。
2. `git rm --cached web.log` 行為符合預期，檔案留在硬碟。
3. ⛔ **驗收第 9 條照任務包的順序跑會失敗**——這是本計畫最重要的發現，見 §6.1。

---

## 2. 逐步驟操作序列

> ⚠️ 每步都寫明「跑什麼 / 改哪裡 / 預期結果」。
> ⛔ 全部步驟等 `F2-plan-review.md` 放行後才開始。

### 步驟 0：備份、before 快照、基準 build

> ⚠️ **2026-08-31 修訂（裁定 B，丙變體）**：本步原採 `.evidence/F2/` 落檔，已全數改掉。
> ⇒ **過程性工作檔**（備份、before 快照、awk 抽出的 target）放**實作側 scratchpad**，
> ⛔ 不落 repo 內任何路徑；**指令實際輸出**一律直接貼進 `docs/tasks/F2-verification.md`。

本計畫以 `$SCRATCH` 代表實作側 scratchpad 暫存目錄（session 專屬，⛔ 在 repo 之外）：

```
SCRATCH=/private/tmp/claude-501/-Users-quasi-pc-Desktop-Projects-Nameless-Realms-namelessrealms-web/fe681576-8aac-4656-87f3-a2aad985c0a7/scratchpad/F2
mkdir -p "$SCRATCH"
cp .gitignore "$SCRATCH/gitignore.before"
md5 -q .gitignore
git status --porcelain --ignored | tee "$SCRATCH/ignored.before.txt"
git rev-parse HEAD
yarn build 2>&1 | tail -40
```

- **預期**：`md5 -q .gitignore` 印出 `68c2d3488a6612761baa924485b02a07`；基準 build 成功。
- **證據落點**：上列每條指令的**實際輸出直接貼進 `F2-verification.md`**
  （build 至少含完整結尾摘要 + exit 狀態，⛔ 不得以「成功」二字代替實際輸出）。
- **工作檔用途**：`$SCRATCH/gitignore.before` 是**回滾用的備份檔**（§5 R-3，⛔ 不用 `git checkout`）；
  `$SCRATCH/ignored.before.txt` 供步驟 4 的條 B 做 before/after `diff`。
- ⚠️ 基準 build 若**紅**：⛔ 立即停手回報，⛔ 不進入步驟 1（見 §5 R-1）。
- ⚠️ ⛔ **不得建立 `.evidence/` 目錄**，⛔ 不得為此在 `.gitignore` 新增任何規則
  （逐字終態維持任務包原樣）。

### 步驟 1：改 `.gitignore` 至逐字終態（四處錨點編輯）

⚠️ ⛔ **不整份重寫**，一律用 Edit 工具做**精確錨點取代**；錨點不匹配即失敗（安全失敗）。
四處編輯如下（`⏎` 表換行，僅為標示，實際不含此符號）：

| # | 錨點（old） | 取代為（new） | 效果 |
|---|---|---|---|
| 1 | `*.pem⏎` | `*.pem⏎.vscode⏎` | `.vscode` 併入 `# misc` 節 |
| 2 | `.pnpm-debug.log*⏎` | `.pnpm-debug.log*⏎web.log⏎` | `web.log` 加入 `# debug` 節 |
| 3 | `# local env files⏎.env*.local⏎` | `# local env files⏎.env⏎.env*.local⏎` | `.env` 併入 `# local env files` 節 |
| 4 | `*.tsbuildinfo⏎⏎/node_modules⏎/build⏎⏎.DS_Store⏎.vscode⏎.env⏎yarn-error.log⏎` | `*.tsbuildinfo⏎` | 刪除第 36 行空行 + 檔尾 37–43 行整段 |

⚠️ 錨點 3 連 `# local env files` 註解一起錨。
**更正（依 review 建議，2026-08-31）**：我原寫的理由是「單錨 `.env*.local` 會與檔尾第 42 行的
`.env` 前綴混淆」——⛔ **這個理由不成立**：Edit 是精確字串匹配，`.env*.local` 在現況檔內
**唯一**（第 42 行的 `.env` 不含該字串）。⇒ 正確理由是：連註解錨**更保險且無害**，
且讓錨點語義自帶「插進哪一節」的意圖。**做法不變，僅更正紀錄。**
⚠️ 錨點 4 之所以從 `*.tsbuildinfo` 起頭，是為了把第 36 行那個空行一併吃掉（見 §0.2 的 ⚠️）。

- **預期結果（預演實測值，⛔ 非推算）**：

```
$ md5 -q .gitignore
c00fe3e470d64c88983b06a29cb0ddb6

$ wc -l -c .gitignore
      38     392 .gitignore
```

- **逐字比對如何驗**：⛔ 不靠肉眼。從任務包直接機械抽出終態區塊再 `diff`：

```
awk '/^```gitignore$/{f=1;next} f&&/^```$/{exit} f{print}' docs/tasks/F2.md > "$SCRATCH/target.gitignore"
diff "$SCRATCH/target.gitignore" .gitignore; echo "exit=$?"
```

  **預期：`diff` 無輸出、`exit=0`。** 預演已驗證這條會過。
  ⚠️ 空輸出無法自證「跑過」⇒ 一律附 `; echo "exit=$?"`，把該行**實際輸出貼進 verification**。
  ⚠️ target 檔落 `$SCRATCH`，⛔ 不落 repo。
  ⚠️ 用 `awk` 從任務包抽取而非手打，是為了避免轉寫誤差（`CLAUDE.md` 撰碼紀律同理）。

### 步驟 2：`web.log` 移出版控

```
git rm --cached web.log
```

- ⛔ **不加 `-f`**、⛔ **不用裸 `git rm`**（兩者都會刪掉硬碟上的檔案）。
- **預期輸出**：`rm 'web.log'`（預演實測）。
- **預期副作用**：index 內 `web.log` 被刪除並**已暫存**；硬碟檔案**保留**。

### 步驟 3：逐檔暫存 `.gitignore`

```
git add .gitignore
```

- ⛔ **禁用 `git add .`**（會把 §0.5 那三個無關改動一起帶走）。
- ⛔ 本次**只**能 `git add` 這一個路徑。
- ⚠️ **這一步任務包的「操作順序建議」沒寫，但驗收第 9 條需要它才成立**——見 §6.1。

### 步驟 4：取證（§4 全部指令）

跑 §4 的驗收指令，**輸出逐條直接貼進 `F2-verification.md`**（⛔ 不落 repo 內任何證據目錄）。

### 步驟 5：`yarn build`（硬約束，⛔ 不可豁免）

```
yarn build 2>&1 | tail -40
```

- ⚠️ 架構師 2026-08-30 裁定「甲」（＝裁定 A）＝ build 必跑，⛔ 實作側不得自行豁免。
- **預期**：build 成功，且與步驟 0 的基準結果一致。
- **證據落點**：完整結尾摘要 + exit 狀態**直接貼進 `F2-verification.md`**，
  ⛔ 不得以「成功」二字代替實際輸出。
- ⚠️ 失敗時的動作見 §5 R-1：**停手回報，⛔ 不修 `.ts` / `.tsx`**（超出範圍）。

### 步驟 6：產 `F2-verification.md` 後停手回報

- ⛔ **不 commit、不 push**。commit 訊息草稿寫進 verification 供架構師過目。
- ⛔ commit 訊息不得含任何讓 Claude 出現在作者 / 共同作者欄的行。
- ⛔ 不打任何 `v` 開頭的 tag。
- ⚠️ `push-gate` hook 無條件擋 push，⛔ 不嘗試繞過。

---

## 3. 守界自檢（三個既有未 commit 改動不被帶走）

| 機制 | 具體做法 |
|---|---|
| **⛔ 禁 `git add .`** | 全程只出現一次 `git add`，且明寫路徑 `.gitignore`（步驟 3）。 |
| **暫存區白名單驗證** | 步驟 4 跑 `git diff --cached --name-status`，**必須**恰為 `M .gitignore` + `D web.log` 兩行。多一行即停手。 |
| **工作樹狀態驗證** | `git status --porcelain` 必須仍見三檔為 ` M`（**前一欄空白**＝未暫存）。 |
| **內容不變驗證** | 額外跑 `git diff --stat app/layout.tsx app/staff/page.tsx components/ServerSection.tsx`，比對是否仍為 `92 insertions(+), 89 deletions(-)`（§0.5 實測基線）。⚠️ 這條任務包沒有，是本計畫加的——porcelain 的 ` M` 只證明「有改動」，⛔ 不證明「改動未被動過」。 |
| **⛔ 不用 `git checkout`** | 任何還原一律用步驟 0 的備份檔。 |

---

## 4. 驗收如何取證（對照任務包 9 條，逐條指令）

> **全部輸出直接貼進 `docs/tasks/F2-verification.md`**（裁定 B）——該檔入版控，
> 即為耐久證據載體；⛔ 不引用會消失的終端捲軸，⛔ 不在 repo 內另開證據目錄。
> ⚠️ 下表「預期」欄的值來自 §1 預演的**實測結果**，⛔ 非設計推理；
> 但真實 repo 的實跑輸出仍以 `F2-verification.md` 為準，⛔ 不以本表冒充已執行。

| # | 指令 | 預期（預演實測） |
|---|---|---|
| 1 | `git ls-files web.log` | **無輸出**。⚠️ 注意 exit code 是 **0**（不是 1）⇒ 判準是「輸出為空」，⛔ 不是「非零退出」。 |
| 2 | `ls -l web.log` | 檔案仍在，大小 **1242** bytes。 |
| 3 | `git check-ignore -v web.log` | `.gitignore:28:web.log	web.log`（exit 0） |
| 4 | `git check-ignore -v .env` | `.gitignore:31:.env	.env`（exit 0） |
| 5 | `git check-ignore -v .vscode/settings.json` | `.gitignore:21:.vscode	.vscode/settings.json`（exit 0） |
| 6 | `grep -c '^/node_modules$' .gitignore` 等三條 | 各為 **1**（改動前實測為 2、2、2） |
| 7 | `yarn build` | 成功；輸出貼報告 |
| 8 | `git status --porcelain` | 三檔仍 ` M` 未暫存；`web.log` 的部分**須 commit 後才驗**（見下方 ⚠️） |
| 9 | **兩條都跑**（依 review 建議逐字對齊任務包）：<br>`git diff --cached --name-only`<br>`git diff --cached --name-status` | `--name-only` 恰為 `.gitignore` + `web.log` 兩路徑（逐字對上任務包條文）；<br>`--name-status` 恰為 `M .gitignore` + `D web.log`（多驗「後者為 D 刪除」）。⛔ 無其他路徑 |

**⚠️ check-ignore 語義（先講清楚，免得稽核側誤判第 4 條無效）：**
`git check-ignore` 比對的是**路徑字串**，⛔ 不看檔案是否存在。
已實測佐證：預演複本內 `.vscode/` 目錄根本不存在，第 5 條照樣命中；
本 repo 內 `.env` 檔不存在（§0.7），第 4 條同樣會命中。
⇒ 第 4、5 條證明的是「**規則仍在且仍會命中該路徑**」，
這正是任務包要的「維持現狀不退步」，⛔ 不是「保護了某個現存檔案」。**兩者不可混為一談。**

**⚠️ 第 8 條的時序**：步驟 2–3 之後、commit 之前，`git status --porcelain` 會顯示
`D  web.log`（已暫存的刪除）——⛔ 這時 web.log **不會**從輸出中消失。
只有 commit 之後，它才成為「未追蹤且被忽略」而完全不出現。
⇒ 第 8 條拆成兩段驗：**commit 前**驗三檔守界（可做），
**commit 後**驗 web.log 消失（⚠️ 需架構師放行 commit 後補驗，在 verification 據實標「待放行後補」）。
任務包括號內已寫「於 commit 後驗」，本計畫與之一致，只是把時序寫死。

**額外三條（本計畫加的，⛔ 不在任務包 9 條內）：**

| # | 指令 | 預期 | 為什麼加 |
|---|---|---|---|
| A | `diff "$SCRATCH/target.gitignore" .gitignore; echo "exit=$?"` | 無輸出 + `exit=0` | 逐字終態的**機械**比對，⛔ 不靠肉眼 |
| B | `git status --porcelain --ignored \| tee "$SCRATCH/ignored.after.txt"`，再 `diff "$SCRATCH/ignored.before.txt" "$SCRATCH/ignored.after.txt"` | **`!!`（忽略）行僅多出 `web.log`、其餘一字不差**；`??` 行會因新增的 `F2-plan.md` / `F2-plan-review.md` / `F2-verification.md` 而增加，⛔ 不列入判準 | **忽略集合零退步的完整證明**（§0.6）。⚠️ 判準措辭依 review 確認事項 9 |
| C | `git check-ignore -v yarn-error.log` | `.gitignore:26:yarn-error.log*	yarn-error.log` | ⚠️ 見下方 |

**⚠️ 條 C 存在的理由（提醒稽核側，避免誤報「弄丟規則」）：**
`grep -c '^yarn-error\.log$' .gitignore` 會從 **1 變成 0**——因為檔尾第 43 行的
精確字串 `yarn-error.log` 被刪了，只剩上半段第 26 行的 `yarn-error.log*`。
⚠️ 這是**正確且預期**的：`yarn-error.log*` 完整涵蓋 `yarn-error.log`（預演已實測命中）。
⇒ 條 C 就是那個涵蓋性的正面證據。⛔ 不要把這個 1→0 當成退步。

---

## 5. 風險與回滾

| 代號 | 風險 | 等級 | 緩解 / 回滾 |
|---|---|---|---|
| **R-1** | ⚠️ **`yarn build` 在髒工作樹上跑**：`ServerSection.tsx` 有 173 行受影響的未 commit 改動（§0.5），build 若失敗**可能與 F2 完全無關**。而本次⛔ 不得改 `.ts`/`.tsx`，也⛔ 不得還原那三檔。 | **高** | ⇒ **步驟 0 先跑一次基準 `yarn build`**，輸出貼進 verification，讓改動後的 build 有可歸因的對照組。<br>• 基準綠、改後綠 ⇒ 正常收案。<br>• 基準**紅** ⇒ ⛔ 停手回報架構師（既有缺口，非 F2 造成；⛔ 不現場擴大修）。<br>• 基準綠、改後紅 ⇒ ⛔ 停手回報，用備份檔還原 `.gitignore` 後複驗。 |
| **R-2** | 錨點編輯誤傷其他規則 | 低 | 步驟 1 為錨點取代，**不匹配即失敗**（安全失敗）；再加驗收條 A 的機械 `diff` + 條 B 的忽略集合 diff 雙重把關。 |
| **R-3** | 需要還原 `.gitignore` | 低 | `cp "$SCRATCH/gitignore.before" .gitignore`（⚠️ 備份落 scratchpad——回滾是**同 session 內**的需求，scratchpad 夠用；耐久證據的載體是 `F2-verification.md`，兩者職責分開）。⛔ **不用 `git checkout .gitignore`**——⚠️ 本例 `.gitignore` 本身雖無未 commit 改動（§0.5 已驗），但 `git checkout` 一旦手滑帶到別的路徑就會清掉那三個正式改動。⇒ 一律走備份檔，⛔ 不開特例。 |
| **R-4** | `git rm` 漏 `--cached` 誤刪硬碟檔 | 中 | 指令逐字寫死在步驟 2；驗收第 2 條取證。真誤刪可 `git show HEAD:web.log > web.log` 復原（⛔ 不用 `git checkout`）。 |
| **R-5** | commit 誤帶三個既有改動 | 中 | §3 四道自檢；驗收第 8、9 條取證。 |

> ⚠️ **原 R-6（`.evidence/` 成為未追蹤雜物）已整條刪除**——2026-08-31 裁定 B 採丙變體，
> ⛔ 不開該目錄 ⇒ 風險前提消失。

---

## 6. ⚠️ 我認為任務包有問題的地方（plan-review 前最後一次修正機會）

### 6.1 ⛔ 驗收第 9 條照任務包的操作順序跑會**失敗**（實測，非推理）

任務包「操作順序建議」是：①改 `.gitignore` ②`git rm --cached web.log`
③跑驗收 ④回報待 commit ——**整串沒有 `git add .gitignore`**。

但驗收第 9 條要求
`git diff --cached --name-only` →「僅 `.gitignore` 與 `web.log`（後者為 D 刪除）兩個路徑」。

⚠️ `git diff --cached` 比的是 **index vs HEAD**。只改工作樹不 `git add`，
`.gitignore` **根本不會出現在暫存區**。預演實測輸出：

```
$ git diff --cached --name-only
web.log

$ git diff --cached --name-status
D	web.log
```

⇒ 只有 `web.log` 一行，**第 9 條當場不成立**。

**我的處置（已寫進步驟 3）**：在 `git rm --cached` 之後補一步
`git add .gitignore`。依據是任務包硬約束自己寫的
「⛔ 禁用 `git add .`，一律逐檔 `git add`（**本次只有 `.gitignore`**）」
——⇒ 這一步本來就在任務包的意圖之內，只是**漏寫進操作順序**。
⚠️ 這是我對任務包的**補寫**，⛔ 不是自行改題；若架構師認為應改由別的方式處理，請在 review 指正。

### 6.2 ⚠️ 任務包背景區的刪除範圍少算了第 36 行空行

背景區的表列 `37–43`，「改動內容」也寫「①檔尾 37–43 行整段刪除」。
但逐字終態最後一行是 `*.tsbuildinfo`（第 38 行，見 §2 步驟 1 的預期值）
——若只刪 37–43、保留第 36 行空行，產物會比終態多一個檔尾空行 ⇒ ⛔ 與逐字終態不符。

⇒ 已在步驟 1 錨點 4 把第 36 行一併納入刪除範圍。**這是實作細節的補正，不改變終態。**

### 6.3 ✅ 證據落點 —— **已由架構師裁定，⛔ 不再是待裁決項**

> **架構師 Yu 2026-08-31 裁定「丙」**（＝裁定 B，見 `docs/tasks/F2-plan-review.md`）。
> 本節原提的甲（在 repo 內開 `.evidence/F2/` 留為未追蹤）與乙（把 `.evidence/` 加進 `.gitignore`）
> **均不採**，已從本 plan 全篇移除。

**裁定內容**：⛔ 不開 `.evidence/` 目錄。

- **指令實際輸出**一律直接貼進 `docs/tasks/F2-verification.md`。
- **過程性工作檔**（`.gitignore` 備份、before/after 快照、awk 抽出的 target 檔）
  放實作側 **scratchpad**（`$SCRATCH`），⛔ 不落 repo 內任何路徑。

**裁定理由**（供日後對帳）：

1. 五件套的**驗收報告本就是設計來裝證據的地方**，且該檔入版控 ⇒ 耐久性由它承擔；
   稽核側反正要逐條重跑，不靠實作側留的中間檔。
2. 在 repo 內開一個未追蹤目錄，會踩 `CLAUDE.md` **地雷清單第 6 條**
   （工作樹長期帶未收斂改動）的老問題。
3. 把 `.evidence/` 加進 `.gitignore` 會**偏離任務包逐字終態**（硬約束）。

⇒ 我原本對丙的疑慮（「scratchpad 是 session 專屬，換對話就沒了」）**由 1 解消**：
耐久載體是 verification.md，scratchpad 只放同 session 內用完即棄的工作檔，兩者職責分開。
⚠️ `.gitignore` 逐字終態 ⛔ 維持任務包原樣，⛔ 不得為此新增任何 `.evidence/` 規則。

### 6.4 ⚠️ 任務包驗收第 6 條的抽樣不完整（不阻斷，補強即可）

第 6 條只查 `/node_modules`、`/build`、`.DS_Store` 三條的計數為 1，
⛔ **沒有任何一條驗證「忽略集合整體沒退步」**——而那正是本任務最大的風險（觸鐵則 1）。
第 4、5 條雖然點驗了 `.env` / `.vscode`，仍是**抽樣**。

⇒ 已加驗收條 B（忽略集合 before/after diff，§0.6）作為完整證明。**建議 review 一併認可。**

### 6.5 ⚠️ 措辭層級的一點提醒（不阻斷）

任務包驗收第 1 條寫「`git ls-files web.log` → **無輸出**」。
實測該指令在「查無此檔」時 **exit code 為 0**。
⇒ 稽核側若用 `if git ls-files web.log; then` 之類的退出碼判準會誤判。
已在 §4 表格註明判準是「輸出為空」。

### 6.6 ✅ 任務包中經我複驗**無誤**的部分（留痕）

- 基準 commit `f9696a2` ✅（§0.1）
- `.gitignore` 43 行、檔尾 37–43 行內容 ✅（§0.2）
- `.vscode` / `.env` 為檔尾獨有 ✅（§0.3）
- `web.log` 1242 bytes、17 行、入版 commit `5afda1a`、repo 唯一入版 `.log` ✅（§0.4）
- 機密掃描 0 命中 ⇒ 不需改寫歷史 ✅（§0.4）
- 三個未 commit 改動確實存在 ✅（§0.5）
- 逐字終態經四處錨點編輯後 byte-identical ✅（§1、§2）
- 「規劃側曾記 `0153998`」：本次 `git rev-parse HEAD` 實查為 `f9696a2…`，
  ⇒ 任務包對此的更正**正確** ✅

---

## 7. 守界聲明（本計畫階段）

- 本階段**只寫了 `docs/tasks/F2-plan.md` 一個檔**。
- ⛔ 未改 `.gitignore`、⛔ 未跑 `git rm --cached`、⛔ 未跑 `yarn build`、
  ⛔ 未 `git add`、⛔ 未 commit、⛔ 未 push、⛔ 未打 tag。
- ⛔ 未觸碰任何 `.ts` / `.tsx` / `data/` / Dockerfile / workflow / `CLAUDE.md`。
- ⛔ 未存取知識庫（vault）任何路徑。
- 唯一的「執行」是 §0 的唯讀查詢與 §1 在 scratchpad 內的 clone 預演
  （⛔ 對本 repo 工作樹零影響；本 repo `git status --porcelain` 此刻仍與 §0.5 一致）。
- ⛔ 不做 F1 / F4 / F5 / F6。

## 8. 放行狀態（2026-08-31 更新）

`docs/tasks/F2-plan-review.md` 結論為 **⛔ 阻斷**，唯一阻斷點是證據落點（裁定 B）。
放行條件：「照阻斷點 1 逐處修完即可動工、**免重審**」。

**本次修訂逐處對照**（⛔ 僅限 review 列明事項，未超出範圍）：

| review 指定位置 | 本次處置 |
|---|---|
| 步驟 0 | 刪 `mkdir -p .evidence/F2`；工作檔改 `$SCRATCH`，輸出改貼 verification |
| 步驟 1 | awk target 落點改 `$SCRATCH`；`diff` 補 `; echo "exit=$?"` 以證明空輸出 |
| 步驟 4、5 | `tee .evidence/…` 全改為輸出直接貼 verification；build 需附結尾摘要 + exit 狀態 |
| §4 前言、條 A、條 B | 路徑改 `$SCRATCH`；條 B 判準改為「`!!` 行僅多出 `web.log`」，`??` 行不列入判準 |
| §5 R-3 | 備份檔路徑改 `$SCRATCH` |
| §5 R-6 | **整條刪除**（前提消失） |
| §6.3 | 改寫為「已裁定（丙變體）」，⛔ 不再是待裁決項 |
| 建議（不阻斷）：第 9 條逐字對齊 | **採納**——§4 第 9 條改為 `--name-only` 與 `--name-status` **兩條都跑** |
| 建議（不阻斷）：錨點 3 理由措辭 | **採納**——已更正措辭，做法不變（見步驟 1） |

⇒ 依放行條件，**修訂完成即可動工**。
⛔ commit / push 仍須回報待架構師確認，`push-gate` 擋 push 是預期行為，⛔ 不繞過。
