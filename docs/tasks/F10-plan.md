# F10 實作計畫：把空目錄 `lib` 從 `next.config.js` 的 `eslint.dirs` 拿掉

> 實作側（nr-implementer）產出。依 `docs/tasks/F10.md`（任務包）與 `docs/tasks/F10-background.md`（背景）。
> ⚠️ **狀態：本輪只做勘查與計畫，⛔ 未動工。** 一個檔案都沒改（見 §2.1／§2.7 的工作樹對帳）。
> ⛔ 須等 `docs/tasks/F10-plan-review.md` 放行才依 §4 執行。
> ⚠️ 本檔內所有數字與輸出**都是本輪自己跑出來的**，⛔ 未轉抄任務包 §C 或背景 §2-2 的任何值。

## 追溯資訊
- **日期**：2026-09-10
- **分支**：`developers`（實測 `git rev-parse --abbrev-ref HEAD` ⇒ `developers`；⛔ 不是 `main`）
- **HEAD**：`3a15b70`（實測 `git rev-parse --short HEAD`）
- **repo**：僅 namelessrealms-web
- **型別**：債（backlog F10）
- **前置**：F8 已收案。無其他前置。
- **證據落點**：本 repo ⛔ 無 `.evidence/` 慣例（沿 F8 `F8-plan.md` §1 的處置）⇒ 所有原文**直接落在本檔**，
  ⛔ 不引用會消失的終端輸出。

---

## 一、三個裁決點的落位（架構師 2026-09-10 拍板）

⚠️ **拍板方式據實**：這三點是架構師**在主迴圈提供的白話版摘要上**拍板的，
⛔ **不得**寫成「已審閱本任務包／本 plan 全文」。

| 裁決點 | 裁決 | 本 plan 的落實位置 |
|---|---|---|
| ① `CLAUDE.md` 要改幾處 | **丙（三處）** | §6：三處錨點文字 + 建議改寫文字。⚠️ 依任務包「誰改 `CLAUDE.md`」條（沿 F8 慣例，收案 commit `028c4eb` 由主迴圈改寫），**實作側⛔ 不自己改 `CLAUDE.md`**，只在 `F10-verification.md` 附建議文字，由主迴圈收案時套用。 |
| ② 硬碟上的空 `lib/` 刪不刪 | **甲（不刪）** | §3「不做什麼」第 1 條：⛔ 不 `rmdir lib`。⇒ `CLAUDE.md` 其餘四處「空目錄」措辭**不動**（38 / 168 / 195 行與 §6 三處以外者）。⚠️ N0 基線已在目錄還在時量完（§2.3），此點已無時序風險。 |
| ③ backlog F6 補「加回 `eslint.dirs`」 | **甲（回填）** | ⛔ **不在實作側範圍**（vault 層，由主迴圈收案時回填）。本 plan **僅標記**，§7「收案後續」列一行，⛔ 不做任何動作。 |

---

## 二、勘查結果（本輪實跑，⛔ 非推理；勘查期間⛔ 未改任何檔）

### 2.1 勘查前工作樹基準

```
$ git status --short
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F10-background.md
?? docs/tasks/F10.md
exit=0
```

⇒ `CLAUDE.md` 地雷第 6 條的三個舊改動檔確實在，且⛔ 未 staged。本檔的還原對帳以此為準。

### 2.2 `lib/` 在硬碟上的狀態（N0 前置；⚠️ 若不存在就必須停下回報）

```
$ ls -ld lib && ls -A lib | wc -l; echo "exit=$?"
drwxrwxr-x@ 2 quasi-pc  staff  64 Sep  9 00:59 lib
       0
exit=0
```

⇒ `lib` **是目錄**（`d` 開頭）且**內容數 = 0**（含 dotfile；`ls -A`）⇒ **存在且為空** ⇒ N0-B 的重現條件成立。
⚠️ **據實標一個計量瑕疵（見 §10 異議 3）**：這條指令的 `exit=0` 是 `wc -l` 的離開碼、**⛔ 不是 `ls -ld` 的**，
⇒ 它⛔ 不能拿來證明 `lib` 存在。**真正的證據是上面那行 `drwxrwxr-x@ … lib` 原文**，本 plan 以該行為準。

### 2.3 N0 起始基線（改前；證明問題現在真的存在、且量得準）

**N0-A（任務包指定形式）**

```
$ yarn lint --max-warnings 0; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0
✔ No ESLint warnings or errors
Done in 1.15s.
exit=0
```

**N0-B（任務包指定形式）— 這就是「改前會 fail」的負向基線**

```
$ yarn lint --max-warnings 0 --error-on-unmatched-pattern; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --error-on-unmatched-pattern
No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/lib' were found.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
exit=1
```

**同兩式的 `yarn -s` 版本（主迴圈派工訊息指定的形式，一併跑過存查）**

```
$ echo "=== A: yarn -s lint --max-warnings 0 ===" && yarn -s lint --max-warnings 0; echo "exit=$?"
=== A: yarn -s lint --max-warnings 0 ===
warning ../../../../package.json: No license field
✔ No ESLint warnings or errors
exit=0
$ echo "=== B: yarn -s lint --max-warnings 0 --error-on-unmatched-pattern ===" && yarn -s lint --max-warnings 0 --error-on-unmatched-pattern; echo "exit=$?"
=== B: yarn -s lint --max-warnings 0 --error-on-unmatched-pattern ===
warning ../../../../package.json: No license field
No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/lib' were found.
exit=1
```

⇒ **四次執行、兩種形式，結論一致：A `exit=0`、B `exit=1`。**
⚠️ 取值方式：zsh 下**指令後直接 `echo "exit=$?"`**，⛔ 未使用 `${PIPESTATUS[0]}`
（`CLAUDE.md`「CI 現況」節第 ④ 種空測：那是 bash 的變數，zsh 恆為空）。
⚠️ 與任務包 §C／背景 §2-2 的 `exit=1` 一致，與 backlog 原文的 `exit=2` 不一致 ⇒ **本 plan 以自量的 `exit=1` 為準**。

### 2.4 Next.js 14.1.0 原始碼事實（⭐ 清掉規劃側標「檔案層已核／⛔ 未實查」的四條，本輪自己 grep 過）

版本自量：`node -e "console.log(require('./node_modules/next/package.json').version)"` ⇒ `14.1.0`。

**B-1 內建預設 dirs 含 `lib`，且 `dirs` 是「整個取代」⛔ 不是合併**

```
$ sed -n '235,242p' node_modules/next/dist/lib/constants.js
const ESLINT_DEFAULT_DIRS = [
    "app",
    "pages",
    "components",
    "lib",
    "src"
];
const ESLINT_PROMPT_VALUES = [
$ sed -n '119,133p' node_modules/next/dist/cli/next-lint.js
    const nextConfig = await (0, _config.default)(_constants1.PHASE_PRODUCTION_BUILD, baseDir);
    const files = args["--file"] ?? [];
    const dirs = args["--dir"] ?? ((_nextConfig_eslint = nextConfig.eslint) == null ? void 0 : _nextConfig_eslint.dirs);
    const filesToLint = [
        ...dirs ?? [],
        ...files
    ];
    const pathsToLint = (filesToLint.length ? filesToLint : _constants.ESLINT_DEFAULT_DIRS).reduce((res, d)=>{
        const currDir = (0, _path.join)(baseDir, d);
        if (!(0, _fs.existsSync)(currDir)) return res;
        res.push(currDir);
        return res;
    }, []);
    const reportErrorsOnly = Boolean(args["--quiet"]);
    const maxWarnings = args["--max-warnings"] ?? -1;
```

⇒ ✅ **確認**：`filesToLint.length ? filesToLint : ESLINT_DEFAULT_DIRS` ⇒ 設了 `eslint.dirs` 就**整份取代**預設清單。
⇒ **甲案的隱藏代價成立**：拿掉 `'lib'` 後它⛔ 不會從預設清單回來，F6 加檔時**必須手動加回**。
⇒ ✅ 另確認 **B-5**：`args["--dir"] ?? nextConfig.eslint.dirs` ⇒ 命令列 `--dir` **取代** `eslint.dirs`
（而 `--file` 是**附加**在後面）⇒ N1 用 `--dir f10-empty-canary` 可隔離測試、⛔ 不必動 `next.config.js`。

**B-2 `next lint` 對「不存在」的目錄直接跳過**

上面 `next-lint.js` 第 128 行 `if (!(0, _fs.existsSync)(currDir)) return res;`（另第 116 行對 `baseDir` 同樣處理）。
⇒ ✅ **確認兩件事**：① fresh clone 沒有 `lib/` ⇒ ⛔ 撞不到本 bug；
② **負向對照⛔ 不能用「不存在的假目錄」**——會被濾掉、ESLint 根本看不到 ⇒ 得到的 `exit=0` 什麼都證明不了。
**N1 必須真的 `mkdir` 一個空目錄。**

**B-3 / B-4 build 期不可能因空目錄失敗**

```
$ sed -n '30,46p' node_modules/next/dist/lib/verifyAndLint.js
        });
        lintWorkers.getStdout().pipe(process.stdout);
        lintWorkers.getStderr().pipe(process.stderr);
        const lintDirs = (configLintDirs ?? _constants.ESLINT_DEFAULT_DIRS).reduce((res, d)=>{
            const currDir = (0, _path.join)(dir, d);
            if (!(0, _fs.existsSync)(currDir)) return res;
            res.push(currDir);
            return res;
        }, []);
        const lintResults = await lintWorkers.runLintCheck(dir, lintDirs, {
            lintDuringBuild: true,
            eslintOptions: {
                cacheLocation
            }
        });
$ grep -rn "errorOnUnmatchedPattern" node_modules/next/dist/lib/eslint/runLintCheck.js node_modules/next/dist/cli/next-lint.js node_modules/next/dist/lib/verifyAndLint.js
node_modules/next/dist/lib/eslint/runLintCheck.js:134:            errorOnUnmatchedPattern: false,
node_modules/next/dist/cli/next-lint.js:54:        errorOnUnmatchedPattern: args["--error-on-unmatched-pattern"] ? Boolean(args["--error-on-unmatched-pattern"]) : false
```

⇒ ✅ **確認**：`verifyAndLint.js` 傳給 `runLintCheck` 的 `eslintOptions` **只有 `{ cacheLocation }`**，
`grep` 在該檔**零命中** `errorOnUnmatchedPattern` ⇒ build 期沿用 `runLintCheck.js` 第 134 行的**硬寫 `false`**。
⇒ **`yarn build` 與 Dockerfile 的 `npm run build` ⛔ 不可能因空 `lib/` 失敗**，
⛔ 不論 `COPY . .` 有沒有把空目錄帶進 image ⇒ ⛔ 不需要跑 `docker build` 實查。
⇒ ⚠️ **措辭據實**：F10 修的是**本機才有的假失敗來源**，
verification ⛔ **不得**寫「修好發版風險／修好發版路徑」之類的話。

### 2.5 `next.config.js` 現況實量

```
$ wc -l next.config.js && wc -c next.config.js
       8 next.config.js
     245 next.config.js
```

⇒ **8 行、245 B**（1 KB = 1024 B ⇒ 約 0.24 KB）。
⚠️ 撰碼規約 §A：位元組數只是**參考數字**、⛔ 不是閘門；本次只改一行，⛔ 不構成「顯著改動」，
⛔ 不因此多做任何事。記在此處只為履行「自己量過」。

現行全文（Read 逐字，4 空白縮排、單引號）：

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },
    // 如果有其他配置可以加在這裡
};

module.exports = nextConfig;
```

### 2.6 canary 殘留檢查（動工前確認乾淨）

```
$ ls -ld f10-empty-canary 2>&1; ls -l data/lintCanary.ts data/lintCanary.tsx 2>&1
ls: f10-empty-canary: No such file or directory
ls: data/lintCanary.ts: No such file or directory
ls: data/lintCanary.tsx: No such file or directory
```

⇒ 兩個驗收用臨時物件**目前都不存在**，⛔ 沒有前案殘留。

### 2.7 勘查後工作樹對帳（證明本輪⛔ 未改任何檔）

```
$ git status --short
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F10-background.md
?? docs/tasks/F10.md
exit=0
```

⇒ **與 §2.1 逐字相同** ⇒ 勘查期間零改動（`.next/` 未重建，本輪⛔ 未跑 `yarn build`）。
⚠️ 本輪⛔ 未跑 `npm install`、⛔ 未裝任何套件、⛔ 未打任何 tag。
⚠️ 本檔 `docs/tasks/F10-plan.md` 落檔後會多一行 `?? docs/tasks/F10-plan.md`——那是本 plan 自己。

---

## 三、改動清單（**唯一**的原始碼改動 = 一行）

**`next.config.js`**：以錨點文字 `eslint: { dirs: [` 定位（⛔ 不憑行號），把該行改為

```js
    eslint: { dirs: ['app', 'components', 'data', 'middleware.ts'] },
```

- 只拿掉 `'lib', `；保持 **4 空白縮排、單引號、行尾逗號**，其餘七行**一個字元都不動**。
- 用**精確錨點編輯**（Edit 工具），⛔ 不整份重寫（守則 10）。

### 不做什麼（明確守界）

1. ⛔ **不 `rmdir lib`**（依裁決② 甲）。
2. ⛔ **不動 `next.config.js` 第 5 行既有註解 `// 如果有其他配置可以加在這裡`**、
   ⛔ 不動第 3 行 `output: 'standalone'`、⛔ 不動 `module.exports` 行。（P4 逐行比對驗證）
3. ⛔ **不碰 `.eslintrc.json`**（含 `no-img-element` 的 `off` 與其三行註解——那是 F9 的事）。
4. ⛔ **不碰 F9 的 10 處 `<img>`**（7 檔）。
5. ⛔ **不往 `lib/` 放任何檔**（那是被否決的乙案；F6 不在本包）。
6. ⛔ 不動 `eslint.dirs` 其餘四項（`app` / `components` / `data` / `middleware.ts`）。
7. ⛔ 不自己改 `CLAUDE.md` / `WORKFLOW.md`（依裁決①，由主迴圈收案套用 §6 的建議文字）。
8. ⛔ 不改 `Dockerfile`、`.dockerignore`、`.github/workflows/push-docker.yaml`、`package.json`、`yarn.lock`。
9. ⛔ 不跑 `docker build`（§2.4 已證明與本 bug 無關）。
10. ⛔ 不打任何 `v` 開頭的 tag（鐵則 4：打 tag 就是發版）。
11. ⛔ 不跑 `npm install`（會讓已刪除的 `package-lock.json` 復活）；只用 `yarn`。
12. ⛔ 不動三個舊改動檔（`app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`）；⛔ 不用 `git add .`。
13. ⛔ 不用 `git checkout` 還原任何東西（canary 是新檔直接 `rm`；若動到既有檔一律備份檔還原）。
14. ⛔ 不碰 vault、⛔ 不寫 `F10-plan-review.md` / `F10-verification-audit.md`、⛔ 不代填任何裁決或批覆。

---

## 四、實作步驟（⛔ 等 `F10-plan-review.md` 放行才執行）

**執行順序（每一步只差一個變因）**：
`N0 重跑（改前）` → `改檔` → `P1` → `N1` → `P2` → `移除 canary` → `P3` → `P4` → `P5`。

0. 重跑 §5 的 **N0**（動工當下再量一次，⛔ 不沿用本 plan §2.3 的值當驗收證據；
   §2.3 是**勘查**紀錄，verification 另貼自己那次的原文）。
   ⚠️ 若 `ls -ld lib` 報 `No such file` ⇒ **停下回報**，⛔ 不得 `mkdir lib` 製造條件後當作重現。
   ⚠️ 若 N0-B 得到 `exit=0` ⇒ 前提已不成立，**停下回報**。
1. 依 §3 改 `next.config.js` 一行；`git diff next.config.js` 貼出，應**恰好一行 `-` 一行 `+`**。
2. 跑 **P1**（正向：假失敗消失）。
3. 跑 **N1**（負向：旗標對「存在但為空」的目錄仍會 fail）→ `rmdir` 還原。
4. 跑 **P2**（覆蓋回歸：`eslint.dirs` 仍被讀）→ `rm` canary → `git status` 證明已移除。
5. 跑 **P3**（嚴格三指令）→ **P4**（既有註解全稱比對）→ **P5**（git 對帳）。
6. 產 `docs/tasks/F10-verification.md`（格式沿用 `docs/tasks/verification_template.md`），內含：
   全部 N0/P1/N1/P2/P3/P4/P5 原文與 exit code、§6 的 `CLAUDE.md` 建議改寫文字、
   §9 的「仍未驗」清單、以及「CI／lint」欄依 §5-P3 的規定措辭。
7. ⛔ **commit / push 前回報，待架構師確認。** ⛔ 不打任何 tag。

---

## 五、驗收執行計畫（逐條對應任務包 N0/P1/N1/P2/P3/P4/P5）

> ⚠️ 每步指令後接 `; echo "exit=$?"`，貼**原文與 exit code**。
> ⚠️ zsh 下**⛔ 不用 `${PIPESTATUS[0]}`**（恆為空）；exit 一律用緊接其後的 `$?`。
> ⚠️ 凡 `$?` 取到的其實是管線最後一段的離開碼者，本計畫**逐條註明**（見 N0-前置、N1-還原），
> ⛔ 不拿它當該步的證據。

### N0 起始基線（改前）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -ld lib && ls -A lib | wc -l; echo "exit=$?"
```
- 預期：`ls -ld` 印出 `d` 開頭那行、內容數 `0`。
- ⚠️ 此處 `exit=` 是 `wc -l` 的、⛔ 不是 `ls` 的 ⇒ **證據取 `ls -ld` 的輸出行**，⛔ 不取 exit。

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
```
- **N0-A** 預期：`✔ No ESLint warnings or errors`、`exit=0`。

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 --error-on-unmatched-pattern; echo "exit=$?"
```
- **N0-B** 預期：`No files matching '…/lib' were found.`、**`exit=1`**。
- ⚠️ 若得到 `exit=2` 或其他值，**據實貼**並在 verification 註明差異，⛔ 不得改寫成 1。

### 改檔

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff next.config.js; echo "exit=$?"
```
- 預期：**恰好一行 `-` 一行 `+`**，差別只有 `'lib', `。

### P1 正向：假失敗消失

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
```
- **P1-A** 預期：`✔ No ESLint warnings or errors`、`exit=0`。

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 --error-on-unmatched-pattern; echo "exit=$?"
```
- **P1-B** 預期：`✔ No ESLint warnings or errors`、**`exit=0`**，且輸出**不再出現** `No files matching`。
- ⚠️ **P1-B 單獨⛔ 不算數**（它可能只是旗標沒生效）⇒ 必須配 **N1**；而「設定仍被讀」必須配 **P2**。

### N1 負向對照：改後旗標對「存在但為空」的目錄仍會 fail

**canary 放置**：在 repo 根目錄（與 `lib` 同層）`mkdir f10-empty-canary`，
以 `--dir f10-empty-canary` 讓該次執行**只** lint 這個目錄（§2.4 B-5：`--dir` 取代 `eslint.dirs`）
⇒ ⛔ 不必動 `next.config.js`、⛔ 不必備份、⛔ 不會碰到第 5 行既有註解。
⚠️ 目錄**必須真的建出來**（§2.4 B-2：不存在的目錄會被 `existsSync` 濾掉 ⇒ 空測）。
⚠️ **一次只放一個空目錄**（任務包 B-6：ESLint 只報第一個不匹配樣式，F8 稽核已實測）。

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && mkdir f10-empty-canary && yarn lint --max-warnings 0 --error-on-unmatched-pattern --dir f10-empty-canary; echo "exit=$?"
```
- 預期：`No files matching '…/f10-empty-canary' were found.`、**`exit=1`**。
- ⚠️ 若 `exit=0` ⇒ 旗標沒生效或 `--dir` 沒被吃到 ⇒ **P1-B 的 `exit=0` 無效**，**停下回報**。

**還原（⛔ 不用 `git checkout`；空目錄是本輪新建，直接 `rmdir`）**

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && rmdir f10-empty-canary && ls -ld f10-empty-canary; echo "exit=$?"
```
- 預期：`ls: f10-empty-canary: No such file or directory`、`exit` 非 0（那是 `ls` 的 exit ⇒ 代表目錄已清）。

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short; echo "exit=$?"
```
- 預期：⛔ 不出現 `f10-empty-canary`（空目錄本來就不入 git，仍貼一次存查）。

### P2 覆蓋回歸：改後 `eslint.dirs` 仍被讀（`data/` canary 仍被抓）

**為什麼用 `data/`**：`data` ⛔ **不在** Next 預設清單 `["app","pages","components","lib","src"]` 裡（§2.4 B-1 已自核）
⇒ 「canary 被抓」與「`next.config.js` 的 `dirs` 被讀」**等價**。
⇒ 這一步擋的是「少個逗號讓 `eslint` 物件壞掉 / Next 退回預設清單」導致 `data/` 與 `middleware.ts` 悄悄脫離 lint 而 `exit` 照樣 0。

**主素材**：新建 `data/lintCanary.ts`（新檔，⛔ 驗完必刪、⛔ 不得進 commit），內容逐字：

```ts
// F10 覆蓋證明用 canary —— 驗完必刪，⛔ 不得進 commit
import { useState } from "react";

export function notAComponent(): number {
  const [v] = useState(0); // 故意違反 react-hooks/rules-of-hooks（error 級）：在非元件、非 hook 的函式裡呼叫 hook
  return v;
}
```

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint; echo "exit=$?"
```
- 預期：輸出含 `./data/lintCanary.ts` 與 `react-hooks/rules-of-hooks`、**`exit=1`**。
- ⚠️ **⛔ 未實查（本輪勘查⛔ 不改任何檔 ⇒ 未跑）**：`rules-of-hooks` 是否對**無 JSX 的 `.ts`** 檔觸發。
  **備援（F8 N1b 已實證的素材路線）**：改用 `data/lintCanary.tsx`，內容
  `export function LintCanary() { return <script src="/canary.js" />; }`，觸發 `@next/next/no-sync-scripts`（error 級）。
  兩者任一觸發即可；⛔ **不得用 `<img>`**（`no-img-element` 已在 `.eslintrc.json` 關閉 ⇒ 會變空測）。
  無論用哪個，verification **都要貼規則名原文**，並寫明實際用了哪一個素材。
- ⚠️ 若 canary **沒出現**在輸出且 `exit=0` ⇒ `data/` 沒被 lint ⇒ 改後設定沒被讀 ⇒ **停下回報**，⛔ 不得繼續。
- **對照組⛔ 不必重做**：F8 P3' Run B 已實證「從 `dirs` 拿掉一項 ⇒ 該處從輸出消失」
  （`docs/tasks/archive/F8-verification.md` 第 54–61 行）⇒ verification 引用它即可，
  ⚠️ 引用時標明「取樣自 F8，⛔ 非本輪重跑」。

**移除 canary（新檔直接 `rm`，⛔ 不用 `git checkout`）**

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && rm data/lintCanary.ts && git status --porcelain data/; echo "exit=$?"
```
- 預期：`git status --porcelain data/` **無輸出**（canary 已刪、從未 `git add`；`data/` 其他檔未動）。
- ⚠️ 若用了 `.tsx` 備援素材，這條的檔名改成 `data/lintCanary.tsx`（⛔ 不得只刪一個就宣稱清乾淨）。
- ⚠️ **P3 之前必須確認 canary 已移除**（本步的 `git status --porcelain data/` 無輸出即為證明）。

### P3 嚴格三指令（canary 已移除、工作樹只剩本包那一行改動時跑）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn install --frozen-lockfile; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn build; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --stat yarn.lock package.json; echo "exit=$?"
```
- 預期：三條全 `exit=0`；build 輸出含 `Linting and checking validity of types` 與路由表；`git diff --stat` **空輸出**。
- ⚠️ `yarn build` **必跑**（硬約束 7：`next.config.js` 是 build 讀的設定檔）。
  ⚠️ **但據實**：build 期旗標恆 `false`（§2.4 B-4 已自核）⇒ 這條 build 是
  「**改了設定檔沒把 build 弄壞**」的回歸，⛔ **不是**「修好了 build」的證據。
- **verification「CI／lint」欄措辭（逐字）**：
  **「綠，但 `no-img-element` 已 off、10 處未修」**——⛔ 不得只寫「lint 通過」。
- ⚠️ 並附註：P1-B 的 `exit=0` ⛔ 不得單獨當佐證，**N1 + P2 才是佐證**。

### P4 既有註解全稱比對（守則 8 ⭐，⛔ 不抽查）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git show HEAD:next.config.js | diff - next.config.js; echo "exit=$?"
```
- 預期：`diff` **`exit=1`**（有差異才對）；差異**恰好**是一組 `<` / `>`（`eslint: { dirs: [...] },` 那行）。
- ⚠️ 此處 `$?` 取到的正是 `diff` 的離開碼（管線最後一段）⇒ 這條**可以**當證據。
- **輸出中⛔ 不得出現**：`// 如果有其他配置可以加在這裡`、`output: 'standalone'`、`module.exports`、`/** @type`。
- 貼 diff 原文。這是「既有註解一個字沒動」的證明。
- 另補一條檔尾對帳（`next.config.js` 只有一行既有註解，全稱比對成本極低）：

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git show HEAD:next.config.js | grep -n '//' ; echo "exit=$?"; grep -n '//' next.config.js; echo "exit=$?"
```
- 預期：兩側**逐字相同**（同一行 `    // 如果有其他配置可以加在這裡`）。

### P5 git 對帳

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short; echo "exit=$?"
```
- 動工前後**各貼一次**。預期收稿時：
  - `next.config.js` 為 ` M`；
  - 三個舊改動檔（`app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`）**仍為 ` M` 且未 staged**；
  - `docs/tasks/F10.md`、`docs/tasks/F10-background.md`、`docs/tasks/F10-plan.md`、`docs/tasks/F10-verification.md`
    為 `??`（或已依 §7 逐檔 `git add`）；
  - ⛔ **不得出現** `data/lintCanary.ts`（或 `.tsx`）、`f10-empty-canary`、`package-lock.json`、`next.config.js.bak`。

### 回歸

- `yarn build` `exit=0`（P3）即可。本改動只影響 lint 覆蓋範圍，`output: 'standalone'` 由 P4 證明未動
  ⇒ ⛔ **不需要 `yarn dev` 開頁目視**。
- ⛔ **不觸發**守則 8 的 `curl` 正負向測試：本任務⛔ 未改任何 Route Handler 或 `middleware.ts`。

### 審計

- 本任務無 audit log。⛔ 機密不入 log：lint / build 輸出不含 token、webhook URL、`ADMIN_DISCORD_ID`；
  貼進 verification 前仍逐段過目一次。

---

## 六、`CLAUDE.md` 建議改寫文字（依裁決① 丙＝三處；⛔ 實作側不自己改，由主迴圈收案套用）

> ⚠️ 沿 F8 慣例（收案 commit `028c4eb` 由主迴圈改寫「CI 現況」節）。
> 以下**錨點文字**為 HEAD `3a15b70` 逐字（本輪 Read 取得，行號僅供定位，⚠️ 動手時以錨點文字重定位）；
> 套用時請用**精確錨點編輯**，⛔ 不整份重寫（守則 10）。
> ⚠️ 依裁決② 甲（不刪 `lib/`），其餘提到 `lib/` 的三處（第 38、168、195 行）**措辭不動**。

### 6.1 「CI 現況」節的 `eslint.dirs` 清單（**必改**，行 107–109）

**錨點（現行逐字，三行）**

```
- ✅ **`yarn lint` 的空測已於 2026-09-09（F8）解除**：repo 根目錄已有 `.eslintrc.json`
  （`root: true` + `next/core-web-vitals`），覆蓋範圍寫在 `next.config.js` 的 `eslint.dirs`
  （`app` / `components` / `data` / `lib` / `middleware.ts`）⇒ **lint 與 build 共用同一份範圍**。
```

**建議改為**（前兩行不動，第三行改清單並在其後**新增**兩行提醒）

```
- ✅ **`yarn lint` 的空測已於 2026-09-09（F8）解除**：repo 根目錄已有 `.eslintrc.json`
  （`root: true` + `next/core-web-vitals`），覆蓋範圍寫在 `next.config.js` 的 `eslint.dirs`
  （`app` / `components` / `data` / `middleware.ts`）⇒ **lint 與 build 共用同一份範圍**。
  ⚠️ F10（2026-09-10）已把 `lib` 從 `eslint.dirs` 拿掉（它是空目錄，加上 `--error-on-unmatched-pattern`
  會讓本機 lint 假失敗）⇒ **往 `lib/` 放第一個檔時必須把 `'lib'` 加回 `dirs`**，否則 `lib/` 永遠不會被 lint
  ——設了 `dirs` 就**整個取代** Next 內建預設清單（`["app","pages","components","lib","src"]`），⛔ 不會合併回來。
```

### 6.2 撰碼規約 §B「第一個放進去的人負責建立慣例」（行 191–192）

**錨點（現行逐字，兩行）**

```
- **純函式外置**：不依賴元件 state 的函式放 `lib/`，且同步補測試。
  ⚠️ `lib/` 目前是空的——**第一個放進去的人負責建立慣例**。
```

**建議改為**（原兩行不動，其後**新增**兩行）

```
- **純函式外置**：不依賴元件 state 的函式放 `lib/`，且同步補測試。
  ⚠️ `lib/` 目前是空的——**第一個放進去的人負責建立慣例**。
  ⚠️ **並且必須把 `'lib'` 加回 `next.config.js` 的 `eslint.dirs`**（F10 已把它拿掉）——
  否則 `lib/` 裡的程式碼永遠不會被 lint，且⛔ 沒有任何指令會提醒你。
```

### 6.3 程式碼地圖 `lib/` 那列（行 237）

**錨點（現行逐字，一行）**

```
| `lib/` | ⚠️ **空目錄**（共用邏輯預留位） |
```

**建議改為**

```
| `lib/` | ⚠️ **空目錄**（共用邏輯預留位）。⚠️ F10 已把 `lib` 從 `next.config.js` 的 `eslint.dirs` 拿掉 ⇒ **放第一個檔時必須加回**，否則不會被 lint |
```

---

## 七、進 commit 的檔案（逐檔 `git add`，⛔ 禁 `git add .`）

**要 add 的（逐檔）**
- `next.config.js`
- `docs/tasks/F10-plan.md`
- `docs/tasks/F10-verification.md`

**⛔ 不得進 staging**
- `app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`（三個與本任務無關的舊改動，`CLAUDE.md` 地雷第 6 條）
- `data/lintCanary.ts`（或 `.tsx`）、`f10-empty-canary/`（驗完必清，且⛔ 不得出現在 `git status`）
- `CLAUDE.md`（依裁決①，由主迴圈收案時套用 §6）

**由收案時處理（沿 F8 慣例）**
- `docs/tasks/F10.md`、`docs/tasks/F10-background.md`、`docs/tasks/F10-plan-review.md`

**⛔ commit / push 前一律回報，待架構師確認。** 任務包任何措辭均⛔ 不構成 push 預授權。⛔ 不打任何 tag。

### 收案後續（⛔ 不在實作側範圍，僅標記）
- **主迴圈**：依裁決① 套用 §6 的 `CLAUDE.md` 改寫；依裁決③ **甲** 回填 backlog
  （F10 結案 + F6 條目補「加回 `eslint.dirs`」）；七件套歸檔至 `docs/tasks/archive/`。
- **規劃側（nr-planner）**：在 `F10-plan-review.md` 檔末「裁決記錄」節逐字追加三項裁決，
  並據實註明「**架構師在白話版摘要上拍板，⛔ 非審閱全文**」。
  ⚠️ 實作側⛔ 不得代寫該節。

---

## 八、待裁決事項

**無。** ①丙 / ②甲 / ③甲 皆已於 2026-09-10 拍板（見 §1）。

⚠️ **唯一會重新產生裁決需求的情況**：P2 主素材與備援素材**都**觸發不了 error 級規則
（⇒ 無法證明「`data/` 仍被 lint」）。那時⛔ 實作側不得自選第三種素材或改動 `.eslintrc.json`，
**停下回報**，由規劃側列選項給架構師。

---

## 九、本輪已知但尚未驗證的事（⛔ 不得以源碼推理代替）

- ⛔ **未驗**：改後的 P1-A / P1-B（本輪⛔ 未改檔）。
- ⛔ **未驗**：N1 的空目錄 canary（`mkdir f10-empty-canary` + `--dir`）——本輪⛔ 未建任何目錄。
- ⛔ **未驗**：P2 canary 素材 `data/lintCanary.ts` 的 `react-hooks/rules-of-hooks` 是否對**無 JSX 的 `.ts`** 觸發；
  備援 `@next/next/no-sync-scripts`（`.tsx`）同樣未跑。⚠️ 成因是「勘查⛔ 不改任何檔」的紀律，⛔ 不是遺漏。
- ⛔ **未驗**：`yarn install --frozen-lockfile`（本輪未跑；`yarn.lock` / `package.json` 全程未動）。
- ⛔ **未驗**：`yarn build`（本輪未跑 ⇒ `.next/` 未重建）。
- ⛔ **未驗且⛔ 不需要驗**：Docker `COPY . .` 會不會把空目錄帶進 image
  ——§2.4 B-4 已自核「build 期旗標恆 `false`」⇒ 兩條發版路徑都與這個答案無關。
- ✅ **本輪已清掉的規劃側標記**：任務包 §B 的 B-1 / B-2 / B-3 / B-4 / B-5（原標「檔案層已核」）
  與 §C 的 lint 實跑輸出（原標「主迴圈實跑、實作側仍須自跑」）**均已由本輪自量**（§2.3、§2.4）。

---

## 十、對任務包的異議

1. **背景檔 `F10-background.md` §2-1 的行數錯誤**（任務包 `F10.md` §A 正確，兩者互相矛盾）。
   背景寫「`next.config.js` 全文（**7 行**）」，任務包寫「全文（**8 行**，第 9 行為檔尾換行）」。
   **實量：`wc -l` ⇒ 8、`wc -c` ⇒ 245**（§2.5）⇒ **任務包對、背景錯**（背景漏數了 `};` 與 `module.exports` 之間那一行空行）。
   ⚠️ 影響：無實質影響（改動以錨點文字定位、⛔ 不憑行號），但**若有人拿背景的行數去做 `sed -n` 定位會偏一行**。
   ⇒ 建議收案時由主迴圈在背景檔訂正，⛔ 實作側不自行改交接件。

2. **任務包 §A 說「`next.config.js` 全文（8 行）」而其下的程式碼區塊只列 8 行本文** —— 一致，⛔ 無異議。
   （列此條只為說明我逐字比對過，⛔ 不是問題。）

3. **N0 第一條指令的 `exit=` 量不到它想量的東西（計量瑕疵，非阻斷）**。
   任務包 N0 前置寫
   `ls -ld lib && ls -A lib | wc -l; echo "exit=$?"`
   ——zsh 下 `$?` 取的是**管線最後一段 `wc -l`** 的離開碼，⛔ 不是 `ls -ld` 的。
   ⇒ 就算 `lib` 不存在，`ls -ld` 失敗會讓 `&&` 短路、後半根本不執行，`$?` 反映的是 `ls -ld` ⇒ **不會誤判成 0**；
   但當目錄**存在**時，這個 `exit=0` **⛔ 不構成「目錄存在」的證據**（它只是 `wc` 成功）。
   ⇒ **本 plan 的處置**：這一步的證據**取 `ls -ld` 印出的那一行原文**（`d` 開頭 + 目錄名），⛔ 不取 exit code；
   已在 §2.2 與 §5-N0 逐條註明。⚠️ 這正是 `CLAUDE.md`「CI 現況」節列的第 ④ 種空測的同族問題。
   ⛔ **不建議改寫任務包指令**（改了就與任務包不逐字一致），改以註明的方式處理。

4. **任務包「進 commit 的檔案」漏了 `docs/tasks/F10-plan.md` 的 untracked 狀態說明**（極小）。
   §「進 commit 的檔案」列了 `docs/tasks/F10-plan.md`、`F10-verification.md`，而驗收 P5 的預期也寫了它們為 `??`
   ——兩處一致，⛔ 無矛盾。列此條僅為說明我核對過。

5. **背景檔 §2-3 第 2 點引用的行號略有偏移**（極小，⛔ 不影響結論）。
   背景寫 `cli/next-lint.js` 第 **125–130** 行 `if (!existsSync(currDir)) return res;`；
   **實查該行在第 128 行**（任務包 §B 寫「126–131 行」，**包含** 128 ⇒ 任務包較準）。
   同樣地背景寫 `verifyAndLint.js` 第 33–37 行，實查 `existsSync` 在第 **35** 行、`lintDirs` 區塊為 33–37 ⇒ 相符。
   ⇒ 結論⛔ 不受影響（§2.4 已附自跑的 `sed -n` 原文）。

6. **⛔ 無阻斷級異議。** 任務包的裁決點設計、驗收步驟切法（N0/P1/N1/P2/P3/P4/P5）、
   「兩個負向對照分工（N1 管旗標、P2 管設定被讀）」與「⛔ 不得用不存在的假目錄當負向對照」等關鍵處，
   本輪均已自核為正確（§2.4）。
