# 稽核報告：F8 驗收報告(`docs/tasks/F8-verification.md`)

> 稽核側 = nr-auditor。⚠️ 本檔所有數字**由稽核側自己實跑取得**，
> ⛔ 未從 `F8-verification.md`、⛔ 未從 `F8-evidence.md`、⛔ 未從派工訊息轉抄任何一個數值。
> ⚠️ `docs/tasks/F8-evidence.md` 是**被查對象自產的輸出**（執行者為主迴圈本人），
> ⇒ 本稽核**⛔ 不引用它當證據**，只在「報告內部一致性」一節把它當作
> **報告的自我陳述**與報告本文對照（查自打嘴巴，⛔ 不是採信）。

**稽核環境**：`HEAD = afd5324bd264f43e985fa9db3cddf3b741ff05b2`，分支 `developers`，shell = zsh，
ESLint `v8.57.1`，Next `14.1.0`。

---

## 〇、開工前的取值機制負向對照（依派工紀律，⛔ 不用 pipeline 取狀態碼）

本稽核一律以 `out=$(cmd 2>&1); st=$?` 取狀態碼。開工前先證明它抓得到非 0：

```
NEGATIVE CONTROL st=1
POSITIVE CONTROL st=0
SHELL=/bin/zsh
```

⇒ 取值機制有效，後續每一格 `exit=` 皆為真實量測。

---

## 一、逐條對照結果總表

| # | 報告聲稱 | 判定 |
|---|---|---|
| 1 | P1a：10 條 `no-img-element`、7 檔、`exit=0` | ✅ 相符（逐格重跑） |
| 2 | P1a 表格 10 筆「行:欄」 | ✅ 相符（10/10 逐格吻合） |
| 3 | P1b：最終設定 `yarn lint` → `✔ No ESLint warnings or errors`、`exit=0` | ✅ 相符 |
| 4 | P2：`yarn lint` `exit=0` | ✅ 相符 |
| 5 | P2：`yarn lint --max-warnings 0` `exit=0` | ✅ 相符 |
| 6 | P2：`yarn build` `exit=0` | ✅ 相符 |
| 7 | `.eslintrc.json` = `root:true` + `next/core-web-vitals` + **只**關一條規則 | ✅ 相符（無第二條） |
| 8 | `.eslintrc.json` 吃 `//` 註解且能被正常讀取 | ✅ 相符（另有正負對照，見二-3） |
| 9 | `next.config.js` 的 `eslint.dirs` 為那五項 | ✅ 相符 |
| 10 | ⛔ 無任何原始碼變更 | ✅ 相符 |
| 11 | ⛔ 未動 `yarn.lock` / `package.json`、⛔ 未新增套件 | ✅ 相符 |
| 12 | ⛔ 未動 `app/layout.tsx` / `app/staff/page.tsx` / `components/ServerSection.tsx` | ✅ 相符 |
| 13 | ⛔ 未改 `Dockerfile` / `.github/` / `CLAUDE.md` / `.claude/` | ✅ 相符 |
| 14 | `middleware.ts` 與 HEAD 零行差異 | ✅ 相符 |
| 15 | N3：canary 已刪除、未殘留 | ✅ 相符（工作樹與版控皆無） |
| 16 | ⛔ 未為測試打任何 tag | ✅ 相符（本地無任何 tag） |
| 17 | ⛔ 未新增 `console.log` / `console.error`、⛔ 無機密入 log | ✅ 相符（變更集內無原始碼檔） |
| 18 | 證據耐久性（是否依賴揮發性來源） | ✅ 相符（證據已落檔並 commit） |
| 19 | N1 設計是否成立（error 級素材選得對） | ✅ 設計成立（但執行**未重跑**，見三） |
| 20 | N2 設計是否成立（避開已關閉的 `no-img-element`） | ✅ 設計成立（但執行**未重跑**，見三） |
| 21 | P3' 設計是否成立（Run A/B 對照是否有鑑別力） | ✅ 設計成立（但執行**未重跑**，見三） |
| 22 | git 對帳「`git status --short` → **11 列**」 | ⚠️ 有出入（自附證據檔為 **10 列**） |
| 23 | N3「`git status` 回到**動工前狀態**」 | ⚠️ 有出入（措辭；當時仍有本任務產物） |
| 24 | N1：canary → `yarn lint` `exit=1` | ⛔ 未能重跑（結構性） |
| 25 | N1b：canary → `yarn build` `exit=1` | ⛔ 未能重跑（結構性） |
| 26 | N2：canary → `1 vs 0`、`--max-warnings 0` `exit=1` | ⛔ 未能重跑（結構性）※見三-4 的替代正證 |
| 27 | P3' Run A / Run B 覆蓋證明 | ⛔ 未能重跑（結構性） |
| 28 | git 對帳 `git ls-remote origin developers → 50a9fac` | ⛔ 未能重跑（指令被 guard 阻擋） |

**計：✅ 相符 21 條／⚠️ 有出入 2 條／⛔ 未能重跑 5 條／❌ 不成立 0 條。**

---

## 二、稽核側自己跑出來的原文

### 1. P1b / P2 三條嚴格指令（唯讀，稽核側可實跑）

```
===== yarn lint =====
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint
✔ No ESLint warnings or errors
Done in 0.85s.
===== yarn lint exit=0 =====
```

```
===== yarn lint --max-warnings 0 =====
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0
✔ No ESLint warnings or errors
Done in 0.62s.
===== exit=0 =====
```

`yarn build`（節錄尾段，全 13 頁靜態產生成功）：

```
 ✓ Compiled successfully
   Linting and checking validity of types ...
 ✓ Generating static pages (13/13)
...
ƒ Middleware                             74.8 kB
Done in 8.06s.
===== yarn build exit=0 =====
```

⇒ 第 3、4、5、6 條 ✅ 相符。
⚠️ 附帶佐證：`yarn build` 輸出含 `Linting and checking validity of types ...`
⇒ build 確實會呼叫 lint（這是 N1b 之所以可能成立的前提，但 N1b 本身未重跑）。

### 2. P1a 的 10 條 / 7 檔（唯讀槓桿：命令列 `--rule` 覆寫，⛔ 設定檔原封不動）

先確認 `--rule` 存在：

```
eslint --help exit=0
15:  --rule Object                    Specify rules
v8.57.1 (exit=0)
```

⚠️ `lib/` 是空目錄，裸跑會因 unmatched pattern 而 `exit=2`，故加 `--no-error-on-unmatched-pattern`
（此旗標**只影響「找不到檔時要不要報錯」**，⛔ 不影響任何規則判定）：

```
./node_modules/.bin/eslint --rule '{"@next/next/no-img-element":"warn"}' \
  --no-error-on-unmatched-pattern app components data lib middleware.ts --ext .js,.jsx,.ts,.tsx
```

輸出（去除重複的長訊息本文，保留檔名與行:欄）：

```
app/sponsor/page.tsx        38:13  warning  ... @next/next/no-img-element
app/sponsor/page.tsx       162:21  warning  ... @next/next/no-img-element
app/team/page.tsx           28:13  warning  ... @next/next/no-img-element
app/team/page.tsx           42:17  warning  ... @next/next/no-img-element
components/FeatureRow.tsx        33:21  warning  ... @next/next/no-img-element
components/FeatureSection.tsx    46:15  warning  ... @next/next/no-img-element
components/HomeHero.tsx          24:11  warning  ... @next/next/no-img-element
components/Navbar.tsx            29:11  warning  ... @next/next/no-img-element
components/Navbar.tsx            79:15  warning  ... @next/next/no-img-element
components/ServerSection.tsx     90:33  warning  ... @next/next/no-img-element

✖ 10 problems (0 errors, 10 warnings)
===== exit=0 =====
```

相異檔案數獨立點名（`-f unix` + `sort -u`）：

```
app/sponsor/page.tsx
app/team/page.tsx
components/FeatureRow.tsx
components/FeatureSection.tsx
components/HomeHero.tsx
components/Navbar.tsx
components/ServerSection.tsx
--- count of no-img-element lines ---
10
```

⇒ **10 處 / 7 檔**、`exit=0`（純 warning）✅；報告表格 10 筆「行:欄」**逐格吻合**，⛔ 無一格出入。
⚠️ 稽核側**逐格重跑判準本身**，⛔ 未只核對總數、⛔ 未核增量。

### 3. 設定檔內容與「註解真的被解析」的正負對照

工作樹內容 = HEAD 內容（`git diff --stat HEAD -- .eslintrc.json next.config.js` 為空）：

```
{
  "root": true,
  "extends": "next/core-web-vitals",
  // @next/next/no-img-element 於此關閉:架構師 2026-09-09 裁決① 丙。
  // 既有 10 處 <img>(7 檔)本次未修,已列 backlog 建議(見 docs/tasks/F8-verification.md)。
  // ⚠️ 此規則自此對全 repo 不被檢查——在該 backlog 完成前,這個洞一直在。
  "rules": {
    "@next/next/no-img-element": "off"
  }
}
```

⇒ `rules` 物件**只有一個鍵**，⛔ 沒有偷關第二條 ✅。

**「註解能被解析」的證明⛔ 不靠肉眼**，用一組正負對照：

- 正：`yarn lint`（吃這份含註解的設定）→ `✔ No ESLint warnings or errors`、`exit=0`
  ⇒ 檔案若解析失敗，ESLint 會直接報設定錯誤而非乾淨通過。
- 負：把設定換成同一份 preset、繞過這份 `.eslintrc.json` 的 `rules`
  → **10 條 `no-img-element` 立刻回來**（見二-4 的 C1）。

⇒ 這份設定檔**確實被讀取、且那條 `"off"` 確實生效**（⛔ 不是「lint 根本沒跑所以沒訊息」）✅。

其餘隱藏空測向量一併排除：

```
.eslintignore                        → No such file or directory
package.json 內 eslintConfig/eslintIgnore → grep exit=1（不存在）
.eslintrc*                           → 只有 .eslintrc.json 一份
```

`next.config.js`：

```
const nextConfig = {
    output: 'standalone',
    eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },
    // 如果有其他配置可以加在這裡
};
```

⇒ 五項與報告一致 ✅。

### 4. 稽核側自製的「閘門真的會 fail」負向對照（⛔ 不需要 canary、⛔ 未動任何檔）

⚠️ `next lint` **沒有** `--rule`（`--help` 只列 `--rulesdir`），但有 `-c/--config`。
⇒ 指向**節點模組內既存**的 preset 檔即可在**⛔ 不寫任何檔**的前提下把那條規則放回來。

**C1**：`yarn next lint -c node_modules/eslint-config-next/core-web-vitals.js`

```
./app/sponsor/page.tsx
38:13  Warning: ... @next/next/no-img-element
162:21 Warning: ... @next/next/no-img-element
（略，同二-2 的 10 筆、7 檔，行:欄完全一致）
Done in 0.98s.
===== exit=0 =====
```

**C2**：同上再加 `--max-warnings 0`

```
info  - Need to disable some ESLint rules? ...
error Command failed with exit code 1.
===== exit=1 =====
```

⇒ **透過真正的閘門指令 `yarn next lint --max-warnings 0` 取得 `exit=1`**。
這是稽核側**獨立取得**的負向對照：證明「`--max-warnings 0` 會因 warning 而失敗」
⛔ 不是靠報告的 N2 轉述。⚠️ 但它**⛔ 不等於**重跑了 N2（素材不同、且未證明 error 級與 build 路徑）。

### 5. 守界（唯讀 git）

F8 的兩筆 commit（`dcde3fa..afd5324`）變更集：

```
A	.eslintrc.json
A	docs/tasks/F8-background.md
A	docs/tasks/F8-evidence.md
A	docs/tasks/F8-plan-review.md
A	docs/tasks/F8-plan.md
A	docs/tasks/F8-verification.md
A	docs/tasks/F8.md
M	next.config.js
 8 files changed, 1490 insertions(+)
```

- `yarn.lock` / `package.json` / `package-lock.json`：`grep exit=1` ⇒ **完全未出現在變更集** ✅
- `app/layout.tsx` / `app/staff/page.tsx` / `components/ServerSection.tsx`：`grep exit=1` ⇒ **未被動到** ✅
- `Dockerfile` / `.github/` / `CLAUDE.md` / `.claude/`：`grep exit=1` ⇒ **未被動到** ✅
- ⇒ 變更集內**⛔ 無任何 `.ts`/`.tsx` 原始碼檔** ⇒ 「無原始碼變更」「未新增 console.log」皆成立 ✅
- `git diff --stat HEAD -- middleware.ts` → 空 ⇒ **零行差異** ✅

目前工作樹（`git status --short`）：

```
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
```

⇒ 僅剩三個長期舊改動，**canary 未殘留** ✅。另查：

```
ls components/LintCanary.tsx → No such file or directory
ls data/lintCanary.ts        → No such file or directory
git ls-files | grep -i canary → exit=1（版控內亦無）
```

tag（回應「⛔ 未為測試打 tag」）：

```
git show-ref --tags → （無輸出）exit=1
ls -la .git/refs/tags/ → 空目錄
.git/packed-refs → 不存在
```

⇒ **本地一個 tag 都沒有**，遑論 `v*.*.*` ✅。

---

## 三、設計層判讀（執行未重跑，但設計是否成立稽核側查得動）

### 1. N1 素材選得對嗎？→ ✅ 設計成立

`node_modules/@next/eslint-plugin-next/dist/index.js` 的 `core-web-vitals` 設定：

```
"core-web-vitals": {
    extends: ["plugin:@next/next/recommended"],
    rules: {
        "@next/next/no-html-link-for-pages": "error",
        "@next/next/no-sync-scripts": "error"
    }
}
```

⇒ `no-sync-scripts` 在 `recommended` 是 `warn`，**被 `core-web-vitals` 提升為 `error`**。
⇒ 報告拿它當 **error 級** canary 的前提成立，⛔ 不是誤判。

### 2. N2 有沒有踩「用已關閉規則當素材 ⇒ 變空測」的坑？→ ✅ 已避開

報告明寫「⛔ 不可用 `<img>` —— 該規則已 off，用它會變空測」，改用 `react-hooks/exhaustive-deps`。
稽核側查該規則的實際嚴重度（`eslint-plugin-react-hooks` 的 `configs.recommended`）：

```
{"react-hooks/rules-of-hooks":"error","react-hooks/exhaustive-deps":"warn"}
```

⇒ 確為 **warn**，符合 N2 要證明的「warning 級 ⇒ `lint` 過、`--max-warnings 0` 不過」。
⚠️ 且該規則**不在**本 repo `.eslintrc.json` 的關閉清單內（清單只有一條）⇒ ⛔ 不是空測。設計成立。

### 3. P3' 的 Run A / Run B 有鑑別力嗎？→ ✅ 設計成立（且比報告自己說的更關鍵）

稽核側查 `node_modules/next/dist/lib/constants.js`：

```
const ESLINT_DEFAULT_DIRS = [
    "app", "pages", "components", "lib", "src"
];
```

⚠️ **重要**：`next lint --help` 寫的預設是「'pages', 'components', and 'lib'」，
**與實碼不符**（實碼含 `app` 與 `src`）。⇒ 這改變了「`eslint.dirs` 到底加了什麼」的判讀：

- `app` / `components` / `lib` **本來就是預設** ⇒ 它們被 lint **⛔ 不能證明** `eslint.dirs` 生效。
- 真正的增量只有 **`data`** 與 **`middleware.ts`**（另外少了不存在的 `pages` / `src`）。

⇒ 報告把 P3' 的舉證焦點放在 `data/lintCanary.ts` 與 `middleware.ts`
**正好落在唯一有鑑別力的位置**，⛔ 不是隨手挑的。設計成立。
⚠️ 且 `data` 不在預設清單內 ⇒ 「`data/` 的 canary 有出現」本身就是 `eslint.dirs` 生效的證據；
`middleware.ts` 另有 Run B 對照組。兩者的舉證邏輯都站得住。

### 4. 為什麼稽核側做不出 P3' 的等效重跑（⚠️ 這一段是結構性限制，⛔ 不是偷懶）

稽核側嘗試過**唯讀**路徑，逐一失敗，據實記錄：

- `next lint` **無** `--rule` ⇒ ⛔ 無法在命令列臨時開一條「每個檔都會違反」的規則。
- `-c` 指向既存 preset（C1/C2 成功）⇒ 但 preset 只含 next/react 規則，
  而 `data/*.ts` 與 `middleware.ts` **在這些規則下本來就是乾淨的**
  ⇒ 它們「有沒有被走訪」在輸出上**看不出來**（乾淨檔不會被列出）。
- `--error-on-unmatched-pattern`：實跑得到

  ```
  No files matching '.../lib' were found.
  ===== exit=1 =====
  ```

  ⚠️ 但稽核側另做方法學檢查，證明 **ESLint 只報「第一個」不匹配的樣式**：

  ```
  ./node_modules/.bin/eslint data bogusAAA bogusBBB --ext .ts
  → No files matching the pattern "bogusAAA" were found.   (bogusBBB 從未被提及) exit=2
  ```

  ⇒ `middleware.ts` 排在 `lib` **之後**，它沒被報成 unmatched **⛔ 不構成「它匹配到了」**。
  ⚠️ 且 `next-lint.js:126-128` 會用 `existsSync` 濾掉不存在的目錄
  ⇒ 預設清單裡的 `pages` / `src` 也會被濾掉、同樣只剩 `lib` 報錯
  ⇒ **此路徑⛔ 無法區分「預設清單」與「next.config.js 的 dirs」**。
- 寫一份臨時 eslintrc 到 scratchpad 再用 `-c` 指過去 ⇒ **亦被 guard 阻擋**（實測）：

  ```
  ⛔ audit-write-guard: ... 偵測到寫入目標:["$SP/probe.txt"]
  ```

⇒ **結論：要重跑 N1 / N1b / N2 / P3'，唯一途徑是放 canary，而 canary 必須寫檔。**
`audit-write-guard` **依設計**禁止稽核側在 shell 層寫任何檔（repo 內外皆然），
⇒ 這四條**⛔ 稽核側未獨立重跑**。⚠️ ⛔ 不得因為跑不動就當成通過。

**要重跑需要什麼條件**（供規劃側裁決）：
一個**可寫檔但與被稽核者獨立**的執行者（例如另開一個非稽核身分的 agent，
或由架構師本人在終端逐條貼指令），依報告所載步驟放 canary → 跑 → 移除 → 對帳。

---

## 四、⚠️ 有出入的兩條（附原始輸出）

### 出入 1：`git status --short` 的列數，報告本文與其自附證據檔不一致

報告「git 對帳」節寫：

```
git status --short     → 11 列（見下）
```

但同一份報告指名的 `docs/tasks/F8-evidence.md` 內，**兩處** `git status` 擷取（N3 一處、還原後一處）
**皆為 10 列**：

```
 M .claude/TEMPLATE-VERSION
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
 M next.config.js
?? .eslintrc.json
?? docs/tasks/F8-background.md
?? docs/tasks/F8-plan-review.md
?? docs/tasks/F8-plan.md
?? docs/tasks/F8.md
```

⚠️ **合理解釋存在**：`F8-evidence.md` 與 `F8-verification.md` 本身是在那兩次擷取**之後**才產生的，
第 11 列很可能是 `?? docs/tasks/F8-evidence.md`。
⚠️ 但稽核側**⛔ 無法重量**：該狀態已隨 commit 消滅（現況 HEAD `afd5324`、工作樹僅 3 列）。
⇒ 據實標為**有出入**（報告本文 vs 自附證據字面不一致），
⛔ 不判斷要不要緊 —— 判讀回規劃側。

### 出入 2：N3 的「回到動工前狀態」措辭過寬

報告 N3 欄寫：「`components/LintCanary.tsx` 已刪，`git status` 回到**動工前狀態**」。
但其自附證據檔在該處的 `git status` 仍含 `M next.config.js`、`?? .eslintrc.json` 等**本任務產物**。

⇒ 實際成立的是「**canary 已移除，其餘皆為本任務預期產物**」，⛔ 不是字面的「回到動工前」。
⚠️ 這是**措辭**問題，⛔ 不是數字錯誤；canary 確已清除一事，稽核側已獨立驗證（見二-5）✅。

---

## 五、⛔ 未能重跑的第 5 條：遠端對帳

報告 git 對帳含：

```
git ls-remote origin developers → 50a9facb820568866ca09f57169230e507ceabf3
```

稽核側執行時被 guard 阻擋（`ls-remote` 不在唯讀允許清單內）：

```
⛔ audit-write-guard: ... 偵測到會改動 repo 現場的 git 子指令。
```

⇒ **⛔ 稽核側未獨立重跑**遠端狀態。
⚠️ 同理 `git tag -l` 亦被阻擋，故改用 `git show-ref --tags` 與直接查 `.git/refs/tags/` 取得
「本地無任何 tag」的結論（見二-5）——該條**有**獨立佐證，⛔ 不受此限制影響。

⚠️ 另依派工說明：報告內文「尚未 commit」「HEAD = fc0af69」是**產出當下的實況**，
現況已由架構師裁准 commit（HEAD `afd5324`）⇒ ⛔ **不列為不符**。

---

## 六、證據耐久性（鐵則：⛔ 不得以揮發性來源舉證）

- 報告的原始輸出落於 `docs/tasks/F8-evidence.md`，且該檔**已進版控**
  （`git diff --name-status dcde3fa..afd5324` 顯示 `A docs/tasks/F8-evidence.md`）
  ⇒ ✅ 符合「證據應落檔」的要求。
- ⛔ 全份報告未以 `docker logs`、執行中容器狀態、或未落檔的終端輸出為證據來源。
- ⇒ 此項 ✅ 相符。

---

## 七、稽核側額外觀察（⛔ 不是判定，供規劃側處置）

1. ⚠️ **`next lint --help` 的預設 dirs 說明與實碼不符**（help 說 `pages/components/lib`，
   實碼 `ESLINT_DEFAULT_DIRS = ["app","pages","components","lib","src"]`）。
   ⇒ 若日後有人依 help 推論「加了 `dirs` 才 lint 到 `app/`」會**推錯**；
   本次 `eslint.dirs` 的**真實增量只有 `data/` 與 `middleware.ts`**。
   ⚠️ 報告的措辭（「`data/` 與 `middleware.ts` 自此納入檢查」）**與此一致**，⛔ 無誇大。
2. ⚠️ `lib/` 是**空目錄**且列在 `eslint.dirs` 內。目前 `--error-on-unmatched-pattern` 預設為 false
   ⇒ 對閘門無影響；但一旦有人加上該旗標，`yarn lint` 會**因空的 `lib/` 而 `exit=1`**（稽核側實測）。
   ⇒ 是一個潛在的「假失敗」來源，供規劃側斟酌是否記入 backlog。
3. ⚠️ `.eslintrc.json` 關閉 `no-img-element` 的**代價**，報告已在本文與設定檔註解**兩處**據實聲明
   （「此規則自此對全 repo 不被檢查」）⇒ ✅ ⛔ 無隱瞞。
   稽核側確認該 backlog 的完成判準（移除該 `"off"` 後 `--max-warnings 0` 仍 `exit 0`）
   **可被本次 C1/C2 直接執行**：目前 C2 為 `exit=1` ⇒ 該 backlog **尚未**達成，判準本身有效可用。

---

## 八、結論

- **✅ 相符 21 條**：含 P1a 十格逐格重跑、P1b/P2 三條嚴格指令、設定檔內容與生效性（含正負對照）、
  `eslint.dirs` 五項、全部守界聲明、canary 未殘留、無 tag、證據耐久性、以及 N1/N2/P3' 的**設計層**成立性。
- **⚠️ 有出入 2 條**：`git status` 列數（11 vs 自附證據 10，已無法重量）、
  N3「回到動工前狀態」措辭過寬。⛔ 兩者皆不涉及本任務的技術結論。
- **⛔ 未能重跑 5 條**：N1 / N1b / N2 / P3' 四條負向與覆蓋證明（結構性：需 canary ⇒ 需寫檔 ⇒
  `audit-write-guard` 依設計禁止），以及 `git ls-remote` 遠端對帳（指令被阻擋）。
- **❌ 不成立 0 條。**

⚠️ 稽核側**⛔ 不判斷**上述出入與未重跑項是否影響收案 —— **判讀與裁決回規劃側**。
