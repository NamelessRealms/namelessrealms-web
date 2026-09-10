# 稽核報告：F10 驗收報告(`docs/tasks/F10-verification.md`)

> 稽核側 = nr-auditor。⚠️ 本檔**每一個數字都由稽核側自己實跑取得**，
> ⛔ 未從 `F10-verification.md`、⛔ 未從 `F10-plan.md` / `F10-plan-review.md` / `F10.md`、
> ⛔ 未從派工訊息轉抄任何一個數值。
> ⚠️ 本稽核**對現場一律唯讀**：全程⛔ 未建立、⛔ 未修改、⛔ 未刪除任何 repo 檔案
> （唯一例外是本檔，由 `audit-write-guard` 放行）。
> ⚠️ 稽核對象自述「所有輸出原文直接落在本檔」——本稽核**⛔ 不採信該自述**，
> 凡能重跑者一律重跑，⛔ 不以報告文字為證。

**稽核環境（自量）**

```
$ git rev-parse HEAD                → 3a15b705cc0c02954c27ad4e4ffbe976962e468d
$ git rev-parse --abbrev-ref HEAD   → developers
$ echo $SHELL                       → /bin/zsh
$ node -e "require('next/package.json').version"    → 14.1.0
$ node -e "require('eslint/package.json').version"  → 8.57.1
```

---

## 〇、開工前：取值機制負向對照(依 `CLAUDE.md`「CI 現況」節：⛔ 沒有負向對照就只是換了個指令)

本稽核一律以 `指令; echo "exit=$?"` 取狀態碼，⛔ 全程未使用 `${PIPESTATUS[0]}`
（`CLAUDE.md` 第 ④ 種空測：那是 bash 的變數，zsh 恆為空）。開工前先證明它抓得到非 0：

```
$ false; echo "exit=$?"
exit=1
$ true; echo "exit=$?"
exit=0
$ ls -ld /nonexistent-audit-probe 2>&1; echo "exit=$?"
ls: /nonexistent-audit-probe: No such file or directory
exit=1
```

⇒ ✅ 取值機制確認**量得到非 0**，後續每一格 `exit=` 皆為真實量測。

---

## 一、工作樹前後對照(稽核側⛔ 未動現場)

**稽核開始時**

```
$ git status --short; echo "exit=$?"
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
 M next.config.js
?? docs/tasks/F10-background.md
?? docs/tasks/F10-plan-review.md
?? docs/tasks/F10-plan.md
?? docs/tasks/F10-verification.md
?? docs/tasks/F10.md
exit=0
$ git rev-parse HEAD; echo "exit=$?"
3a15b705cc0c02954c27ad4e4ffbe976962e468d
exit=0
```

**稽核結束時(寫本檔之前)**

```
$ git status --short; echo "exit=$?"
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
 M next.config.js
?? docs/tasks/F10-background.md
?? docs/tasks/F10-plan-review.md
?? docs/tasks/F10-plan.md
?? docs/tasks/F10-verification.md
?? docs/tasks/F10.md
exit=0
$ git rev-parse HEAD; echo "exit=$?"
3a15b705cc0c02954c27ad4e4ffbe976962e468d
exit=0
```

⇒ ✅ **逐字相同**（9 列、順序與標記完全一致），HEAD 未變。
⚠️ 本檔落檔後會多一行 `?? docs/tasks/F10-verification-audit.md`——那是本稽核報告自己。
⚠️ 稽核期間跑過 `yarn build`（重建 `.next/`，已 gitignore）與多次 `yarn lint`（唯讀），
⇒ ⛔ 未在 `git status` 留下任何新痕跡，證據如上。

---

## 二、審計結論

**✅ 通過**（逐條實跑取證，**⛔ 未發現任何 ✗ 不符**；報告所有可重跑的數字與 exit 全部逐格吻合，
措辭據實、無 push 預授權、無空測、無揮發性證據來源。
⚠️ 有 **4 條因稽核側守門結構性跑不了**，已據實標「報告值不可重現／待第三方獨立補跑」，
⛔ 未寫成已核；其中 3 條的**結論**已由稽核側用**唯讀替代對照**獨立證實，詳見四、五節。
判讀（這些不可重現項要不要緊）回規劃側，⛔ 不由稽核側判斷。）

---

## 三、逐條對照總表

| # | 報告聲稱（出處行號） | 稽核判定 |
|---|---|---|
| 1 | 分支 `developers`、HEAD `3a15b70`、log 訊息（行 10–11） | ✅ 相符（自跑 `rev-parse` / `log`） |
| 2 | `git show HEAD:next.config.js \| wc -c` ⇒ **245**（行 27–29） | ✅ 相符（逐格重跑） |
| 3 | `git show HEAD:next.config.js \| wc -l` ⇒ **8**（行 30–32） | ✅ 相符 |
| 4 | `wc -l next.config.js` ⇒ **8**（行 33–35） | ✅ 相符 |
| 5 | `wc -c next.config.js` ⇒ **238**（行 36–38） | ✅ 相符 |
| 6 | 「差 7 B = `'lib', ` 七個字元」（行 41） | ✅ 相符（245−238=7；`'lib', ` 實為 7 字元） |
| 7 | 唯一原始碼改動 = `next.config.js` 一行（行 17） | ✅ 相符（`git status --short` 僅 ` M next.config.js`；全稱 diff 僅第 4 行） |
| 8 | N0 前置：`ls -ld lib` ⇒ `drwxrwxr-x@ 2 quasi-pc staff 64 Sep 9 00:59 lib`（行 72、85） | ✅ 相符（逐字重跑，含時戳） |
| 9 | N0 前置：`ls -A lib \| wc -l` ⇒ **0**（行 73） | ✅ 相符 |
| 10 | 「⛔ 未 `rmdir lib`」「⛔ 未往 `lib/` 放任何檔」（行 21、549） | ✅ 相符（`ls -ld lib` exit=0；`find lib` 只回 `lib`；`git ls-files lib` 0 筆） |
| 11 | N0-A（改前）`yarn lint --max-warnings 0` `exit=0`（行 109–115） | ⚠️ **報告值，稽核側不可重現**（需改前設定）；⛔ 未判 ✓／✗，見四-1 |
| 12 | N0-B（改前）`--error-on-unmatched-pattern` `exit=1` + `No files matching '…/lib' were found.`（行 121–128） | ⚠️ **報告值，稽核側不可重現**（需改前設定，稽核側⛔ 不得改檔）；**失敗機制已由唯讀替代對照 100% 重現**，見四-1、五-A |
| 13 | 「N0-B `exit=1`，⛔ 不是 backlog 記載的 2；與任務包 §C 記載相符」（行 131） | ✅ 相符（`F10.md` 行 179 `exit=1`、行 182–184 說明 backlog 原文 `exit=2` 為記錄錯誤） |
| 14 | 改檔 `git diff next.config.js`：恰好一行 `-` 一行 `+`（行 137–151） | ✅ 相符（逐字重跑，diff 全文吻合，含 index `7028f3e..dc792d7`） |
| 15 | P1-A `yarn lint --max-warnings 0` `exit=0`（行 161–167） | ✅ 相符（自跑，`✔ No ESLint warnings or errors`） |
| 16 | P1-B `--error-on-unmatched-pattern` `exit=0`、`No files matching` 已不再出現（行 173–182） | ✅ 相符（自跑，exit=0，輸出無該訊息） |
| 17 | N1 canary 殘留前置檢查：兩種 canary 動手前都不存在（行 189–194） | ⚠️ 事後不可查（時點性）；**現況**同樣兩者皆不存在（自跑，見五-C） |
| 18 | N1 主指令：`mkdir f10-empty-canary && yarn lint … --dir f10-empty-canary` ⇒ `exit=1` + 訊息行（行 202–209） | ⛔ **稽核側結構上不可重跑**（需新建目錄，`audit-write-guard` 阻擋）⇒ **待第三方獨立補跑**；**結論已由唯讀替代對照證實**，見四-2、五-A |
| 19 | N1 還原：`rmdir` 後 `ls -ld f10-empty-canary` ⇒ `No such file or directory` `exit=1`（行 222–232） | ✅ **現況相符**（自跑 `ls -ld f10-empty-canary` ⇒ 同訊息、`exit=1`）；`rmdir` 動作本身不可事後查 |
| 20 | N1 後 `git status --short` 未出現 `f10-empty-canary`（行 240–249） | ✅ 相符（現況 `git status --short` 無該項） |
| 21 | P2：新建 `data/lintCanary.ts` ⇒ 輸出含 `./data/lintCanary.ts` 與 `react-hooks/rules-of-hooks`、`exit=1`（行 261–284） | ⛔ **稽核側結構上不可重跑**（需新建檔，守門阻擋）⇒ **待第三方獨立補跑**；「`eslint.dirs` 仍被讀」此一**結論**已由唯讀替代對照證實，見四-3、五-B |
| 22 | P2 論證：`data` ⛔ 不在 Next 預設清單 `["app","pages","components","lib","src"]`（行 287） | ✅ 相符（自讀 `node_modules/next/dist/lib/constants.js` 行 235–241，清單逐字一致、確無 `data`） |
| 23 | P2 對照組取樣自 `F8-verification.md` 第 54–61 行、標明⛔ 非本輪重跑（行 293–307） | ✅ 相符（自跑 `sed -n '54,61p'` 與報告引用區塊 `diff` ⇒ `exit=0`，逐字元相同；且已據實標明非本輪） |
| 24 | 移除 canary 後 `git status --porcelain data/` 零輸出（行 312–313） | ✅ 現況相符（自跑零輸出；`ls data/lintCanary.ts .tsx` 皆 `No such file or directory`） |
| 25 | P3-1 `yarn install --frozen-lockfile` `exit=0`（行 343–352） | ⛔ **稽核側被守門阻擋⇒不可重跑**（見四-4）⇒ **待第三方獨立補跑**；旁證：`git diff --stat yarn.lock package.json` 零輸出（自跑） |
| 26 | P3-2 `yarn lint --max-warnings 0` `exit=0`（行 358–364） | ✅ 相符（自跑） |
| 27 | P3-3 `yarn build` `exit=0`、13 條路由 + Middleware 74.9 kB（行 368–415） | ✅ 相符（自跑，路由表 13 列與每一格大小、shared JS 84.2 kB、chunk 檔名皆逐字吻合） |
| 28 | build 輸出含 `Linting and checking validity of types ...`（行 418） | ✅ 相符 |
| 29 | 「build 期 `errorOnUnmatchedPattern` 恆 false ⇒ 這條 build 是回歸、⛔ 不是修好 build」（行 419–420） | ✅ 措辭據實（自讀 `runLintCheck.js:134` 為 `errorOnUnmatchedPattern: false`、`verifyAndLint.js:41–43` `eslintOptions` 只有 `cacheLocation`） |
| 30 | `git diff --stat yarn.lock package.json` 零輸出（行 423–424） | ✅ 相符（自跑零輸出，`exit=0`） |
| 31 | P4 全稱比對 `git show HEAD:next.config.js \| diff - next.config.js` ⇒ `exit=1`、恰好一組 `<`/`>`、僅第 4 行（行 432–437） | ✅ 相符（自跑，輸出逐字吻合） |
| 32 | P4 結論：diff 輸出⛔ 未出現既有註解 / `output:` / `module.exports` / `/** @type`（行 441–443） | ✅ 相符（自跑輸出確無這四者） |
| 33 | P4 第二條：HEAD 側與現行檔側 `grep -n '//'` 皆為 `5:    // 如果有其他配置可以加在這裡`（行 448–455） | ✅ 相符（兩側各自重跑，逐字相同、皆 `exit=0`） |
| 34 | 「第 1 行 `/** @type … */` ⛔ 不含 `//`，兩側各只回一行是對的」（行 456） | ✅ 相符（自讀全檔，`//` 僅第 5 行一處） |
| 35 | P5 收稿時 `git status --short` 8 列、第一欄全空白（⛔ 無 staged）（行 463–478） | ✅ 相符（自跑：現況 9 列 = 該 8 列 + `?? F10-verification.md`，報告行 479 已據實預告；`git diff --cached --stat` 零輸出 ⇒ 確無 staged） |
| 36 | ⛔ 未出現 `data/lintCanary.*`、`f10-empty-canary`、`package-lock.json`、`next.config.js.bak`（行 477） | ✅ 相符（`ls` 四者皆 `No such file or directory`；`git status` 亦無） |
| 37 | `git rev-parse HEAD origin/developers` 兩者皆 `3a15b70…e468d`；尚未 push（行 482–488） | ✅ 相符（自跑，兩行同雜湊） |
| 38 | `git log --oneline -1` ⇒ `3a15b70 docs(claude): NR-D7 …`（行 491–493） | ✅ 相符 |
| 39 | ⛔ 未打任何 tag（行 6、526、551） | ✅ 相符（`ls -A .git/refs/tags` 零筆；⛔ 無 `.git/packed-refs`） |
| 40 | ⛔ 未碰 `CLAUDE.md` / `.eslintrc.json` / `Dockerfile` / `.github/` / `package.json` / `yarn.lock`（行 19–22、549–551） | ✅ 相符（`git diff --stat` 對這些路徑零輸出） |
| 41 | §6 錨點 1：`plan 480–482` 與 `CLAUDE.md 107–109` `diff` `exit=0`（行 572–573） | ✅ 相符（自跑 `diff`，`exit=0`） |
| 42 | §6 錨點 2：`plan 501–502` 與 `CLAUDE.md 191–192` `diff` `exit=0`（行 574–575） | ✅ 相符（自跑） |
| 43 | §6 錨點 3：`plan 519` 與 `CLAUDE.md 237` `diff` `exit=0`（行 576–577） | ✅ 相符（自跑） |
| 44 | §6.5 錨點完整性：本檔 6.1／6.2／6.3 錨點 vs `CLAUDE.md` 三段 `diff` 全 `exit=0`（行 672–678） | ✅ 相符（自跑同一段 script，三條 `diff` 全 `exit=0`） |
| 45 | §6.5 解析到的行號：6.1 在 **609–611**、6.2 在 **630–631**、6.3 在 **648**（行 681） | ✅ 相符（自跑得 A1=604→609–611、A2=625→630–631、A3=643→648，逐格吻合） |
| 46 | `grep -n 'lib' CLAUDE.md` ⇒ 7 行：38 / 109 / 168 / 191 / 192 / 195 / 237（行 585–593） | ✅ 相符（**判準字串逐字重跑**，七個行號與內容全部吻合） |
| 47 | `grep -c 'lib' CLAUDE.md` ⇒ **7**（行 594–596） | ✅ 相符（逐格重跑；措辭「共 7 行」正確，`grep -c` 數的是行⛔ 不是出現次數） |
| 48 | 「§6 覆蓋 109 / 191–192 / 237；其餘 38、168、195 = **三處**」（行 599–600） | ✅ 相符（7 − 4 = 3，逐行核對） |
| 49 | 「`F10-plan.md` §1 表 ② 寫『其餘四處』是誤數」（行 601–602） | ✅ 相符（自查 `F10-plan.md` 行 28 確為「其餘四處」；同檔行 473 卻寫「三處」，報告的更正正確） |
| 50 | §6.2 建議文字「原兩行一個字不動」（行 634、637–638） | ✅ 相符（自跑 `sed -n '637,638p'` vs `CLAUDE.md 191–192` `diff` `exit=0`） |
| 51 | §6.1 建議文字「前兩行不動、第三行清單拿掉 lib」（行 614、617–619） | ✅ 相符（前兩行 `diff` `exit=0`；第三行實為 `（app / components / data / middleware.ts）…`，確已無 `lib`） |
| 52 | 「CI／lint」欄逐字：**綠，但 `no-img-element` 已 off、10 處未修**（行 519） | ✅ 相符（逐字比對 `CLAUDE.md` 規定措辭） |
| 53 | 自量 `grep -rno '<img' app components data lib middleware.ts \| wc -l` ⇒ **10**（行 520） | ✅ 相符（**判準字串含 `lib` 在內逐字重跑**，得 10） |
| 54 | 自量 `grep -rl` ⇒ **7 個檔**，且逐檔次數 team×2 / sponsor×2 / HomeHero×1 / Navbar×2 / ServerSection×1 / FeatureSection×1 / FeatureRow×1（行 521–522） | ✅ 相符（自跑 `uniq -c` 七檔次數逐格吻合，合計 10） |
| 55 | `@next/next/no-img-element` 仍為 off（行 557、757） | ✅ 相符（自讀 `.eslintrc.json`，`"rules": { "@next/next/no-img-element": "off" }`） |
| 56 | ⛔ 未寫「等 remote Actions 綠」（行 525） | ✅ 相符（全檔 `Actions` 僅此一處，是否定句） |
| 57 | ⛔ 不寫「修好發版風險／修好發版路徑」（行 48–51） | ✅ 相符（全檔 `發版` 三處：行 51 否定句、行 526 tag 禁令、行 749 未驗說明；⛔ 無宣稱修好發版路徑） |
| 58 | ⛔ 無 push 預授權措辭（行 6、558、706） | ✅ 相符（全檔 `push` 六處，全為「尚未 push」「commit/push 前回報」「不構成 push 預授權」或 workflow 檔名） |
| 59 | 機密不入 log；`yarn build` 只印 `- Environments: .env.local`、⛔ 未印變數值（行 498–500） | ✅ 相符（稽核側自跑 build，輸出僅該行，⛔ 無任何 token / ID / webhook） |
| 60 | 證據耐久性：⛔ 不引用會消失的終端狀態（行 5） | ✅ 相符（全檔⛔ 無 `docker logs`／執行中容器／未落檔終端狀態；輸出原文全部落在 repo 內 `.md`。⚠️ 本 repo 確無 `.evidence/`：`ls -ld .evidence` ⇒ `No such file or directory`） |
| 61 | review 七條建議「全數採納」（行 718–728） | ✅ 相符（逐條核到落點，見六節） |
| 62 | §9 仍未驗七條「每一條都寫明為什麼沒驗」（行 737–757） | ✅ 相符（七條逐條有成因，⛔ 無靜默略過；且⛔ 未把未驗項寫成已驗） |
| 63 | 全檔有無「把預期值寫成已執行」 | ✅ 未發現（`預期` 僅行 512 一處，且是描述 `git status` 不 clean 為預期狀態，非冒充執行） |

---

## 四、⛔ 稽核側結構上不可重跑者(據實標明，⛔ 未寫成已核)

> ⚠️ 以下每一條都附**為什麼跑不了**與**實際被擋的原始輸出**，⛔ 不以「看起來合理」放過。

### 四-1 N0-A / N0-B(改前基線)：**報告值，稽核側不可重現**

**成因**：現行 `next.config.js` 已是**改後**版本；要重現「改前 `exit=1`」必須把 `'lib'` 改回去，
而稽核側**⛔ 對現場一律唯讀**（`audit-write-guard` 強制）⇒ 結構上做不到。

稽核側改以「HEAD 版確實含 `'lib'`」佐證改前狀態成立：

```
$ git show HEAD:next.config.js; echo "exit=$?"
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },
    // 如果有其他配置可以加在這裡
};

module.exports = nextConfig;
exit=0
```

⇒ ✅ HEAD 版 `eslint.dirs` 確含 `'lib'`，改前條件成立；
⇒ ⚠️ 但「N0-A `exit=0` / N0-B `exit=1`」這兩格**是報告值**，⛔ 稽核側未能以原式重現。
⇒ ⭐ **N0-B 的失敗機制已由稽核側唯讀完全重現**（見五-A）：用 `--dir` 餵入**與改前完全相同的五項清單**
（`--dir` 與 `nextConfig.eslint.dirs` 在原始碼是同一個變數，見五-B 的行 121），得到**同一條訊息、同一個 `exit=1`**。

### 四-2 N1(空目錄 canary)：⛔ 稽核側結構上不可重跑 ⇒ **待第三方獨立補跑**

**成因**：N1 主指令含 `mkdir f10-empty-canary`，稽核側⛔ 不得建立任何檔案／目錄。
⛔ **未為了跑它繞過守門。**
⇒ 「`mkdir` 真的建了一個新目錄、lint 真的看到它、`exit=1`」這一組**執行事實**待第三方補跑。
⇒ ⭐ 但 N1 的**結論**（「改後 `--error-on-unmatched-pattern` 對『存在但為空』的目錄仍會 fail」）
已由稽核側用**現成的空 `lib/`**（⛔ 未新建任何東西）獨立證實，見五-A。

### 四-3 P2(`data/lintCanary.ts`)：⛔ 稽核側結構上不可重跑 ⇒ **待第三方獨立補跑**

**成因**：P2 需新建 `data/lintCanary.ts`，稽核側⛔ 不得寫任何檔。⛔ **未繞過守門。**
⇒ 「canary 出現在 lint 輸出、規則名 `react-hooks/rules-of-hooks`、`exit=1`」這一組**執行事實**待第三方補跑。
⇒ ⭐ 但 P2 要證的**核心結論**（「改後 `next.config.js` 的 `eslint.dirs` **仍被讀**、Next ⛔ 未退回預設清單」）
已由稽核側用**唯讀鑑別力測試**獨立證實，見五-B。

### 四-4 P3-1 `yarn install --frozen-lockfile`：被守門阻擋 ⇒ **待第三方獨立補跑**

被擋的原始輸出：

```
$ yarn install --frozen-lockfile; echo "exit=$?"
⛔ audit-write-guard: 稽核側只寫得到 docs/tasks/{代號}-verification-audit.md,其餘一切檔案改動一律阻擋。
偵測到檔案改動類指令(rm/mv/cp/tee/touch/chmod/… 之一)。
```

⇒ ⛔ 指令未執行（連 exit 都沒取到）。⛔ **未繞過守門。**
⇒ 旁證（自跑）：`git diff --stat yarn.lock package.json` **零輸出、`exit=0`**
⇒ 至少可確認**本輪⛔ 未造成 lock/manifest 漂移**；但「該指令自己 `exit=0`」仍**待第三方補跑**。

---

## 五、稽核側自建的唯讀替代對照(⛔ 未改動任何檔)

> 依派工授權：可用唯讀槓桿取得負向對照（F8 先例）。以下三組全部只用現成檔案與命令列旗標，
> ⛔ 未 `mkdir`、⛔ 未寫檔、⛔ 未改設定。

### 五-A 負向對照：改後旗標對「存在但為空」的目錄**仍會** fail(替代 N1，並重現 N0-B 的機制)

**(a) 只餵空 `lib/`**

```
$ yarn lint --max-warnings 0 --error-on-unmatched-pattern --dir lib; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --error-on-unmatched-pattern --dir lib
No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/lib' were found.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
exit=1
```

**(b) 正向對照(非空目錄)**

```
$ yarn lint --max-warnings 0 --error-on-unmatched-pattern --dir data; echo "exit=$?"
…
✔ No ESLint warnings or errors
Done in 0.65s.
exit=0
```

**(c) ⭐ 完整重現 N0-B 的機制：餵入與改前一模一樣的五項清單**

```
$ yarn lint --max-warnings 0 --error-on-unmatched-pattern --dir app --dir components --dir data --dir lib --dir middleware.ts; echo "exit=$?"
…
No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/lib' were found.
error Command failed with exit code 1.
exit=1
```

**(d) 唯一變因對照：同一串清單，只拿掉 `lib`**

```
$ yarn lint --max-warnings 0 --error-on-unmatched-pattern --dir app --dir components --dir data --dir middleware.ts; echo "exit=$?"
…
✔ No ESLint warnings or errors
Done in 0.68s.
exit=0
```

⇒ ✅ **(c) `exit=1` vs (d) `exit=0`，唯一變因就是 `lib` 那一項** ——
稽核側在**⛔ 沒動任何檔**的前提下，獨立證實了：
① 旗標在改後**仍然有效**（＝ N1 的結論）；
② 改前那份清單**確實會**以 `exit=1` + `No files matching '…/lib' were found.` 失敗（＝ N0-B 的機制）；
③ 拿掉 `lib` 之後**就不會**失敗（＝ F10 的直接效果）。
⇒ ✅ 因此 P1-B 的 `exit=0` **⛔ 不是「旗標沒生效」造成的** —— 這一點稽核側已獨立驗到。

### 五-B ⭐ 鑑別力測試：改後 `eslint.dirs` **仍被讀**(替代 P2 的核心結論)

**先讀原始碼確認鑑別力從何而來（唯讀）**

```
$ sed -n '235,242p' node_modules/next/dist/lib/constants.js
const ESLINT_DEFAULT_DIRS = [
    "app",
    "pages",
    "components",
    "lib",
    "src"
];
$ sed -n '116,130p' node_modules/next/dist/cli/next-lint.js
…
    const dirs = args["--dir"] ?? (…nextConfig.eslint…dirs);
    const filesToLint = [ ...dirs ?? [], ...files ];
    const pathsToLint = (filesToLint.length ? filesToLint : _constants.ESLINT_DEFAULT_DIRS).reduce((res, d)=>{
        const currDir = (0, _path.join)(baseDir, d);
        if (!(0, _fs.existsSync)(currDir)) return res;
        res.push(currDir);
        return res;
```

**預設清單各項在本機是否存在（唯讀）**

```
app: EXISTS
pages: MISSING
components: EXISTS
lib: EXISTS
src: MISSING
exit=0
```

⇒ **推論鏈全部由已執行的事實構成**：
若 `next.config.js` 的 `eslint.dirs` **沒有被讀到**，`pathsToLint` 會退回 `ESLINT_DEFAULT_DIRS`，
經 `existsSync` 過濾後為 `[app, components, **lib**]` —— **含空的 `lib`**；
而五-A(a) 已**實測**空 `lib` 在此旗標下必 `exit=1`。
但 P1-B（不帶 `--dir`、完全走設定檔）**實測 `exit=0`**（稽核側自跑）
⇒ ✅ **改後的 `eslint.dirs` 確實被讀到了，Next ⛔ 未退回預設清單**（＝ P2 的核心結論）。
⚠️ **據實界定**：這證到「設定被讀、且清單裡沒有 `lib`」；
⛔ **沒有**證到「`data/` 的檔案真的被 ESLint 掃描」——那需要 P2 的 canary，**待第三方補跑**（四-3）。

### 五-C canary 殘留現況(唯讀)

```
$ ls -l data/lintCanary.ts data/lintCanary.tsx 2>&1; echo "exit=$?"
ls: data/lintCanary.ts: No such file or directory
ls: data/lintCanary.tsx: No such file or directory
exit=1
$ ls -ld f10-empty-canary 2>&1; echo "exit=$?"
ls: f10-empty-canary: No such file or directory
exit=1
$ ls -l package-lock.json next.config.js.bak 2>&1; echo "exit=$?"
ls: next.config.js.bak: No such file or directory
ls: package-lock.json: No such file or directory
exit=1
$ git status --porcelain data/; echo "exit=$?"
exit=0
$ find lib; echo "exit=$?"
lib
exit=0
$ git ls-files lib | wc -l; echo "exit=$?"
       0
exit=0
```

⇒ ✅ 兩種 canary 皆已清除、`data/` 零改動、空 `lib/` 依裁決② 甲原封保留、⛔ 無備份檔、⛔ 無 `package-lock.json` 復活。

---

## 六、review 七條建議「全數採納」的逐條核對(附落點行號)

| review 建議 | 報告聲稱處置 | 稽核核到的落點（`F10-verification.md` 行號） | 判定 |
|---|---|---|---|
| 1. N1 還原 exit 有兩種來源；⛔ 不能只憑非 0；**附加**單獨一條 `ls -ld f10-empty-canary; echo "exit=$?"` | ✅ 全採納 | 行 219–225（任務包原式，⛔ 未取代）、行 227–233（**附加**的單獨一條，`exit=1`）、行 235 標明「這一條的 exit 確定是 `ls` 的」、行 236–237 **據實寫明 plan §5-N1 該句推論不成立**；同族 `mkdir` 撞號風險另以行 186–197 的「動手前殘留檢查」+ 行 212–214 的訊息行處理 | ✅ 相符 |
| 2. P2 備援三（`import/no-anonymous-default-export`，warn 級，需加跑 `--max-warnings 0`） | ✅ 採納但⛔ 未動用 | 行 256–258 明寫「主素材一次就觸發、⛔ 未動用 `.tsx` 備援與備援三」；行 721 表格；行 745–747 §9-2 **據實列為未驗、⛔ 不對其作任何聲稱** | ✅ 相符（「採納但未動用」有前置條件說明，⛔ 非拒絕） |
| 3. 統一寫**三處**（plan §1「四處」是誤數） | ✅ 全採納 | 行 582–602：自跑 `grep -n` / `grep -c` 得 7 行，扣掉 §6 的 109 / 191–192 / 237 ⇒ 其餘 38、168、195 = 三處；行 601–602 明寫 plan §1 誤數 | ✅ 相符（稽核側逐格重跑，7 行與三處皆吻合；`F10-plan.md` 行 28 確為「四處」） |
| 4. §6.1 日期由收案時填實際收案日 | ✅ 採納 | 行 659–661（§6.4 第 1 點）：明寫 `2026-09-10` 與 `2026-09-09` **都不是收案日**、套用時填實際收案日、實作側⛔ 未自行改動 | ✅ 相符 |
| 5. N0 前置**附加**一條 `ls -ld lib; echo "exit=$?"` | ✅ 全採納 | 行 68–79（任務包原式，並於行 77 註明其 `exit` 是 `wc` 的）、行 81–89（**附加**的單獨一條，`exit=0`） | ✅ 相符 |
| 6. plan §2.4 `sed -n '30,46p'` 只貼 15 行；verification 若重貼請據實 | ✅ 採納（以⛔ 不重貼的方式） | 行 725 表格；行 741–744 §9-1：明標 `errorOnUnmatchedPattern` 恆 false 是**檔案層結論、⛔ 非本輪實跑** | ✅ 相符（全檔確實⛔ 未重貼 `node_modules` 原始碼） |
| 7. P4 `grep -n '//'` 兩側輸出都貼、⛔ 不只寫「相同」 | ✅ 全採納 | 行 445–456：HEAD 側與現行檔側**兩組輸出逐字都貼**，並註明第 1 行不含 `//` | ✅ 相符（稽核側兩側各自重跑，逐字吻合） |

⇒ ✅ **七條全部有具體落點，「全數採納」屬實。**

---

## 七、報告更正(文字級，⛔ 非不符)

> ⚠️ 以下**⛔ 不是 ✗ 不符**，是稽核側量到、但報告未載或未註明的事項，列出供規劃側判讀。

1. **報告⛔ 未自量本檔體積**。撰碼規約 §A 要求「顯著改動一個檔時記一行實測值」，
   報告只記了 `next.config.js`（245 B → 238 B），⛔ 未記本檔自身。
   稽核側自量存查：`wc -l docs/tasks/F10-verification.md` ⇒ **766**、`wc -c` ⇒ **43590 B**（≈ 42.6 KB，1 KB = 1024 B）。
   （`grep -n '766\|43,590\|43590' docs/tasks/F10-verification.md` ⇒ `exit=1`，全檔⛔ 無此數 ⇒ **報告未作此聲稱**，
   ⇒ 稽核側⛔ 不判 ✓／✗，僅據實記錄。）
2. **「檔案體積」四條的 `exit=0` 未註明取自 `wc`**（行 27–38）。
   `git show HEAD:next.config.js | wc -c` 的 `$?` 是管線最後一段 `wc` 的離開碼，
   報告在 N0 前置（行 77）與 P4（行 440）都主動註明了同族情形，**唯獨此處未註**。
   ⚠️ 實害為零（該四格的證據是**數值本身**、⛔ 不是 exit），但與報告自訂的計量紀律不一致。
3. **N0-B 的執行時序⛔ 無法事後查證**。報告行 132 稱「閘門的負向對照先於正式量測成立」，
   稽核側只能查到最終狀態，⛔ 查不到指令執行的先後。
   ⇒ ⚠️ 但稽核側已用五-A(c)(d) 自建了一組**同等強度的負向／正向對照**，該紀律的實質要求已滿足。

---

## 八、追認(計畫差異)

1. **P2 只用了主素材、⛔ 未跑 `.tsx` 備援與 review 備援三** —— 報告已於行 256–258、721、745–747 據實標明
   「前置條件未發生 ⇒ ⛔ 未建這兩個檔、⛔ 不對其作任何聲稱」。
   ⇒ ✅ **認可**：plan §8 的優先序是「主素材 → `.tsx` 備援 → 備援三」，主素材觸發即止，⛔ 未偏離。
2. **P2 對照組沿用 F8 取樣、⛔ 未重做 Run A/Run B** —— 報告行 291–307 明標「⛔ 非本輪重跑」，
   且稽核側 `diff` 確認引用逐字元無誤。
   ⇒ ✅ **認可**：任務包 §F 授權；且稽核側五-A(c)(d) 另提供了本機現跑的一變因對照。
3. **實作側⛔ 未改 `CLAUDE.md`，改寫文字放 §6 由主迴圈套用** —— 與裁決① 丙、F8 `028c4eb` 慣例一致。
   ⇒ ✅ **認可**（`git diff --stat CLAUDE.md` 零輸出為證）。

---

## 九、carryover 對號

- **F6**：往 `lib/` 放第一個檔時**必須把 `'lib'` 加回 `next.config.js` 的 `eslint.dirs`**。
  ⇒ ✅ 稽核側確認此風險為**真**：`ESLINT_DEFAULT_DIRS` 雖含 `"lib"`，但 `next-lint.js` 行 121–126 顯示
  設了 `dirs` 就**整個取代**預設清單、⛔ 不合併（稽核側自讀原始碼）；且⛔ 沒有任何指令會提醒。
  ⇒ 報告行 52–54、556、§6.1／6.2／6.3 三處建議文字均已寫入此提醒。
- **F9**：10 處 `<img>`（7 檔）未修、`@next/next/no-img-element` 仍為 off。
  ⇒ ✅ 稽核側自量確認：10 處 / 7 檔（明細見三-53、三-54），`.eslintrc.json` 確為 `"off"`。

---

## 十、⛔ 必改

**無。**

⚠️ ⛔ 未發現任何 ✗ 不符；⛔ 未發現空測（`exit 0` 但檢查沒跑）；⛔ 未發現以預期值冒充已執行；
⛔ 未發現揮發性證據來源；⛔ 未發現 push 預授權措辭。

⚠️ **待第三方獨立補跑（⛔ 非必改，是稽核側能力邊界）**：N1（空目錄 canary）、P2（`data/lintCanary.ts`）、
P3-1（`yarn install --frozen-lockfile`）、N0-A／N0-B 原式。要不要補、要不要緊，**回規劃側判讀**。

---

## 十一、修畢後的回報格式

- 本次⛔ 無必改項，⛔ 不需要修畢回報。
- ⛔ **commit / push 仍待架構師確認。** 本稽核報告的任何措辭均⛔ 不構成 commit / push / tag 預授權。
- ⛔ 稽核側全程未 `git add`、未 commit、未 push、未打 tag、未 `npm install`、未改動任何 repo 檔（本檔除外）。
