# 驗收報告：F10 把空目錄 `lib` 從 `next.config.js` 的 `eslint.dirs` 拿掉

> 實作側（nr-implementer）產出。格式沿用 `docs/tasks/verification_template.md`。
> ⚠️ **本檔所有數字與輸出都是本輪自己跑出來的**，⛔ 未轉抄任務包 §C、`F10-plan.md` §2、或 `F10-plan-review.md` 的任何值。
> ⚠️ 本 repo ⛔ 無 `.evidence/` 慣例（沿 F8 處置）⇒ 所有輸出原文**直接落在本檔**，⛔ 不引用會消失的終端狀態。
> ⛔ **尚未 commit / push、⛔ 未 `git add`（連 stage 都沒有）、⛔ 未打任何 tag**，等待架構師確認。

## 追溯資訊
- **日期**：2026-09-10
- **分支**：`developers`（自量 `git rev-parse --abbrev-ref HEAD` ⇒ `developers`）
- **HEAD**：`3a15b70`（自量 `git rev-parse --short HEAD`；`git log --oneline -1` ⇒ `3a15b70 docs(claude): NR-D7 撰碼規約 §A 判準改判——檔案體積改為檔案可讀性`）
- **型別**：債（backlog F10）
- **依據**：`docs/tasks/F10.md`（任務包）／`docs/tasks/F10-plan.md`（plan）／`docs/tasks/F10-plan-review.md`（✅ 放行、⛔ 無阻斷點）
- **執行順序**（依 plan §4，每步只差一個變因）：`N0 重跑（改前）→ 改檔 → P1 → N1 → P2 → 移除 canary → P3 → P4 → P5`

## 變更檔案
- `next.config.js` — `eslint.dirs` 陣列拿掉 `'lib'`（**唯一的原始碼改動，一行**）。以錨點文字 `eslint: { dirs: [` 精確定位編輯，⛔ 未整份重寫。

⚠️ **本輪⛔ 未改動任何其他檔**：⛔ 未碰 `CLAUDE.md`（依裁決①，由主迴圈收案套用本檔 §6）、
⛔ 未碰 `.eslintrc.json`、⛔ 未碰 F9 的 10 處 `<img>`、⛔ 未往 `lib/` 放任何檔、
⛔ 未 `rmdir lib`（依裁決② 甲）、⛔ 未動 `Dockerfile` / workflow / `package.json` / `yarn.lock`、
⛔ 未動三個無關舊改動檔。

**檔案體積（撰碼規約 §A 的參考數字，⛔ 不是閘門；1 KB = 1024 B）**：

```
$ git show HEAD:next.config.js | wc -c; echo "exit=$?"
     245
exit=0
$ git show HEAD:next.config.js | wc -l; echo "exit=$?"
       8
exit=0
$ wc -l next.config.js; echo "exit=$?"
       8 next.config.js
exit=0
$ wc -c next.config.js; echo "exit=$?"
     238 next.config.js
exit=0
```

⇒ 改前 **245 B / 8 行**、改後 **238 B / 8 行**（差 7 B = `'lib', ` 七個字元）。
⚠️ 只改一行，⛔ 不構成「顯著改動」；記於此僅為履行「自己量過一次」。

## 設計重點

- **改動範圍就是一行**：`eslint.dirs` 從 `['app', 'components', 'data', 'lib', 'middleware.ts']`
  改為 `['app', 'components', 'data', 'middleware.ts']`。4 空白縮排、單引號、行尾逗號**全部保留**，其餘七行一個字元都沒動（P4 全稱比對為證）。
- **⚠️ 目標措辭據實（這件事到底修了什麼）**：F10 修的是**本機才有的假失敗來源**
  ——「本機硬碟上存在空 `lib/`、且有人手動加上 `--error-on-unmatched-pattern`」時才成立。
  `lib/` 不入 git ⇒ fresh clone 沒有它；且 build 期的 ESLint 選項恆 `errorOnUnmatchedPattern: false`。
  ⇒ ⛔ **本報告不寫「修好發版風險／修好發版路徑」**，因為那不是事實。
- **甲案的隱藏代價（必須落進 `CLAUDE.md`，見 §6）**：Next.js 內建預設 dirs 本來就含 `lib`，
  但 `next.config.js` 一旦設了 `eslint.dirs`，**預設清單整個被取代、⛔ 不是合併**
  ⇒ 日後 F6 往 `lib/` 放第一個檔時**必須把 `'lib'` 加回 `dirs`**，否則 `lib/` 永遠不會被 lint，且⛔ 沒有任何指令會提醒。
- **兩個負向對照分工（⛔ 不能只做一個）**：
  - **N1** 證明「改後 `--error-on-unmatched-pattern` 這個旗標本身仍有效」——否則 P1-B 的 `exit=0` 可能只是旗標沒生效。
  - **P2** 證明「改後 `next.config.js` 的 `eslint.dirs` 仍被讀」——否則一個手滑（少個逗號、或 Next 退回預設清單）會讓 `data/` 與 `middleware.ts` 悄悄脫離 lint 而 `exit` 照樣 0。
  ⇒ ⚠️ **P1-B 的 `exit=0` 單獨⛔ 不算數；N1 + P2 才是佐證。**

## 測試結果

> ⚠️ 全部指令在 zsh 下跑；exit 一律**緊接指令後 `echo "exit=$?"`**，⛔ 未使用 `${PIPESTATUS[0]}`
> （`CLAUDE.md`「CI 現況」節第 ④ 種空測：那是 bash 的變數，zsh 恆為空）。
> ⚠️ 凡 `$?` 取到的不是該步想量的那個指令者，**逐條註明並改以輸出原文為證**。

### N0 起始基線（改前；證明問題現在真的存在、且量得準）

**N0-前置（任務包指定形式，逐字）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -ld lib && ls -A lib | wc -l; echo "exit=$?"
drwxrwxr-x@ 2 quasi-pc  staff  64 Sep  9 00:59 lib
       0
exit=0
```

⚠️ **這個 `exit=0` 是 `wc -l` 的、⛔ 不是 `ls -ld` 的**（plan 異議 3 / review 建議 5 的計量瑕疵）
⇒ **證據取 `drwxrwxr-x@ 2 quasi-pc  staff  64 Sep  9 00:59 lib` 這一行原文**（`d` 開頭 ⇒ 是目錄），
以及 `ls -A lib` 的 `0`（含 dotfile 計數為 0 ⇒ 空）。

**N0-前置（⭐ 依 review 建議 1／5 的附加指令，⛔ 不取代任務包指令）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -ld lib; echo "exit=$?"
drwxrwxr-x@ 2 quasi-pc  staff  64 Sep  9 00:59 lib
exit=0
```

⇒ ✅ `ls -ld lib` **自己的** exit 為 0 ⇒ 「`lib` 存在且是目錄」現在有 exit 層級的證據。
⇒ **N0-B 的重現條件成立**（⛔ 未 `mkdir lib` 製造條件）。

**動工前工作樹（P5 對照基準）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short; echo "exit=$?"
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F10-background.md
?? docs/tasks/F10-plan-review.md
?? docs/tasks/F10-plan.md
?? docs/tasks/F10.md
exit=0
```

**N0-A（正向基線）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0
✔ No ESLint warnings or errors
Done in 1.53s.
exit=0
```

**N0-B（⭐ 這就是「改前會 fail」的負向基線）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 --error-on-unmatched-pattern; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --error-on-unmatched-pattern
No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/lib' were found.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
exit=1
```

⇒ ✅ **N0-B `exit=1`**（⛔ 不是 backlog 原文記載的 2）。⚠️ 據實：本輪自量得 1，與任務包 §C 的記載相符，⛔ 但本報告以自量值為準。
⇒ ✅ **閘門的負向對照先於正式量測成立**（`CLAUDE.md`「先故意讓指令失敗、確認取得非 0，再開始正式量測」）。

### 改檔（唯一的原始碼改動）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff next.config.js; echo "exit=$?"
diff --git a/next.config.js b/next.config.js
index 7028f3e..dc792d7 100644
--- a/next.config.js
+++ b/next.config.js
@@ -1,7 +1,7 @@
 /** @type {import('next').NextConfig} */
 const nextConfig = {
     output: 'standalone',
-    eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },
+    eslint: { dirs: ['app', 'components', 'data', 'middleware.ts'] },
     // 如果有其他配置可以加在這裡
 };
 
exit=0
```

⇒ ✅ **恰好一行 `-` 一行 `+`**；context 行顯示 `output: 'standalone'` 與既有註解 `// 如果有其他配置可以加在這裡` 皆為未變更的 context（前置空白），⛔ 未被動到。

### P1 正向：假失敗消失

**P1-A**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0
✔ No ESLint warnings or errors
Done in 0.72s.
exit=0
```

**P1-B（F10 的直接證據；⚠️ 單獨⛔ 不算數，見 N1 + P2）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 --error-on-unmatched-pattern; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --error-on-unmatched-pattern
✔ No ESLint warnings or errors
Done in 0.66s.
exit=0
```

⇒ ✅ `exit` 由 **1 → 0**，且輸出中**`No files matching` 已不再出現**（同一條指令、同一台機器、唯一變因是那一行設定）。

### N1 負向對照：改後旗標對「存在但為空」的目錄**仍會** fail

**canary 殘留前置檢查（動手前確認乾淨，避免 `mkdir` 失敗導致 exit 撞號 —— review 建議 1 同族風險）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -ld f10-empty-canary 2>&1; echo "exit=$?"; ls -l data/lintCanary.ts data/lintCanary.tsx 2>&1; echo "exit=$?"
ls: f10-empty-canary: No such file or directory
exit=1
ls: data/lintCanary.ts: No such file or directory
ls: data/lintCanary.tsx: No such file or directory
exit=1
```

⇒ 兩種 canary 動手前都**不存在** ⇒ 下一條的 `mkdir` 必定是真的建了一個新目錄。

**N1 主指令**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && mkdir f10-empty-canary && yarn lint --max-warnings 0 --error-on-unmatched-pattern --dir f10-empty-canary; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --error-on-unmatched-pattern --dir f10-empty-canary
No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/f10-empty-canary' were found.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
exit=1
```

⇒ ✅ **`exit=1`**，且**關鍵證據行是 `No files matching '…/f10-empty-canary' were found.`**
（⚠️ 依 review 建議 1：若 `mkdir` 失敗，`&&` 短路後的 `exit=1` 會與 lint 的 `exit=1` 撞號 ⇒ ⛔ 不以 exit 單獨為證，
**以這行訊息為證** —— 它出現代表 lint 真的跑到了、且真的看見這個目錄）。
⇒ ✅ **旗標在改後仍然有效** ⇒ P1-B 的 `exit=0` ⛔ 不是「旗標沒生效」造成的。
⚠️ 依任務包 B-2：目錄是**真的 `mkdir` 出來的**（不存在的假目錄會被 `existsSync` 濾掉 ⇒ 空測）。
⚠️ 依任務包 B-6：**一次只放一個**空目錄（ESLint 只報第一個不匹配樣式）。

**還原（⛔ 不用 `git checkout`；空目錄是本輪新建，直接 `rmdir`）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && rmdir f10-empty-canary && ls -ld f10-empty-canary; echo "exit=$?"
ls: f10-empty-canary: No such file or directory
exit=1
```

**⭐ 依 review 建議 1 的附加指令（單獨一條，⛔ 不取代任務包指令）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -ld f10-empty-canary; echo "exit=$?"
ls: f10-empty-canary: No such file or directory
exit=1
```

⇒ ✅ 這一條的 `exit=1` **確定是 `ls` 的**（沒有 `&&` 前段可短路）⇒ 「目錄已清」現在有無歧義的證據。
⚠️ 據實採納 review 建議 1 的判定：plan §5-N1 原本寫「`exit` 非 0（那是 `ls` 的 exit ⇒ 代表目錄已清）」這句**推論不成立**，
本報告改以 `No such file or directory` 訊息行 + 上面這條附加指令為證。

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short; echo "exit=$?"
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
 M next.config.js
?? docs/tasks/F10-background.md
?? docs/tasks/F10-plan-review.md
?? docs/tasks/F10-plan.md
?? docs/tasks/F10.md
exit=0
```

⇒ ✅ ⛔ 未出現 `f10-empty-canary`（空目錄本來就不入 git，仍貼一次存查）。

### P2 覆蓋回歸：改後 `eslint.dirs` **仍被讀**（`data/` canary 仍被抓）

**用了哪一個素材（據實）**：**主素材 `data/lintCanary.ts`**（plan §5-P2 / 任務包「實作要點」的逐字內容），
⛔ **未動用** `.tsx` 備援，也⛔ **未動用** review 建議 2 的備援三 —— **主素材一次就觸發了**。

素材內容（逐字，新檔，驗完必刪、⛔ 未進 commit）：

```ts
// F10 覆蓋證明用 canary —— 驗完必刪，⛔ 不得進 commit
import { useState } from "react";

export function notAComponent(): number {
  const [v] = useState(0); // 故意違反 react-hooks/rules-of-hooks（error 級）：在非元件、非 hook 的函式裡呼叫 hook
  return v;
}
```

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint

./data/lintCanary.ts
5:15  Error: React Hook "useState" is called in function "notAComponent" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use".  react-hooks/rules-of-hooks

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
exit=1
```

⇒ ✅ 輸出含 **`./data/lintCanary.ts`** 與規則名原文 **`react-hooks/rules-of-hooks`**（**Error 級**），**`exit=1`**。
⇒ ✅ **`data` ⛔ 不在** Next 內建預設清單 `["app","pages","components","lib","src"]` 裡
⇒ 「canary 被抓」與「改後的 `next.config.js` 的 `eslint.dirs` 仍被讀」**等價** ⇒ 設定沒被弄壞、Next ⛔ 未退回預設清單。
⇒ ⭐ **順帶清掉 plan §9 的一條未驗**：`react-hooks/rules-of-hooks` **確實會對無 JSX 的 `.ts` 檔觸發**（本輪實測，⛔ 非推理）。

**對照組（⚠️ 取樣自 F8，⛔ 非本輪重跑）**

`docs/tasks/archive/F8-verification.md` 第 54–61 行（本輪 `sed -n '54,61p'` 自行取出核對，逐字）：

```
### P3' 覆蓋證明（⛔ 不得以「設定裡寫了」當覆蓋）

| 回合 | 設定 | 輸出中出現的檔 |
|---|---|---|
| **Run A** | `dirs` 含 `'middleware.ts'` | `./data/lintCanary.ts`、`./middleware.ts` **都出現** |
| **Run B** | 從 `dirs` 拿掉 `'middleware.ts'`（對照組） | 只剩 `./data/lintCanary.ts`；**`middleware.ts` 消失，但其違規仍原封不動留在檔案裡** |

⇒ 差別只可能來自 `dirs` 那一項 ⇒ **`data/` 與 `middleware.ts` 確實被 lint 到**，是證明、⛔ 不是宣稱。
```

⇒ 「從 `dirs` 拿掉一項 ⇒ 該處從輸出消失」已由 F8 實證 ⇒ 本輪⛔ 不重做對照組（任務包 §F 授權）。
⚠️ **據實標明：這一段是 F8 的取樣，⛔ 不是本輪執行結果。**

**移除 canary（新檔直接 `rm`，⛔ 不用 `git checkout`）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && rm data/lintCanary.ts && git status --porcelain data/; echo "exit=$?"
exit=0
```

⇒ ✅ `git status --porcelain data/` **零輸出** ⇒ canary 已刪、從未 `git add`、`data/` 其他檔未動。

**P3 前的 canary 總清點（⚠️ 兩種 canary 都要確認，⛔ 不得只清一個就宣稱乾淨）**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -l data/lintCanary.ts data/lintCanary.tsx 2>&1; echo "exit=$?"; ls -ld f10-empty-canary 2>&1; echo "exit=$?"; git status --short; echo "exit=$?"
ls: data/lintCanary.ts: No such file or directory
ls: data/lintCanary.tsx: No such file or directory
exit=1
ls: f10-empty-canary: No such file or directory
exit=1
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
 M next.config.js
?? docs/tasks/F10-background.md
?? docs/tasks/F10-plan-review.md
?? docs/tasks/F10-plan.md
?? docs/tasks/F10.md
exit=0
```

⇒ ✅ **P3 開跑時工作樹只有本包那一行改動 + 三個無關舊改動 + `docs/tasks/F10*` 四個 untracked 檔。**

### P3 嚴格三指令（`CLAUDE.md`「CI 現況」節逐字指令）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn install --frozen-lockfile; echo "exit=$?"
yarn install v1.22.18
warning ../../../../package.json: No license field
[1/4] Resolving packages...
[2/4] Fetching packages...
warning Pattern ["string-width@^4.1.0"] is trying to unpack in the same destination "/Users/quasi-pc/Library/Caches/Yarn/v6/npm-string-width-cjs-4.2.3-269c7117d27b05ad2e536830a8ec895ef9c6d010-integrity/node_modules/string-width-cjs" as pattern ["string-width-cjs@npm:string-width@^4.2.0"]. This could result in non-deterministic behavior, skipping.
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 0.61s.
exit=0
```

⚠️ 那條 `string-width` warning 是**既有**的 yarn 快取警告，與本改動無關（本輪⛔ 未動 `package.json` / `yarn.lock`，見下方 `git diff --stat`）。

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0
✔ No ESLint warnings or errors
Done in 0.69s.
exit=0
```

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn build; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next build
   ▲ Next.js 14.1.0
   - Environments: .env.local

   Creating an optimized production build ...
Browserslist: browsers data (caniuse-lite) is 8 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
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


ƒ Middleware                             74.9 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand using Node.js

Done in 8.49s.
exit=0
```

⇒ ✅ **三條全 `exit=0`**；build 輸出含 `Linting and checking validity of types ...` 與 13 條路由表。
⚠️ **據實**：build 期 ESLint 的 `errorOnUnmatchedPattern` 恆 `false`
⇒ 這條 build 是「**改了設定檔沒把 build 弄壞**」的回歸，⛔ **不是**「修好了 build」的證據。

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --stat yarn.lock package.json; echo "exit=$?"
exit=0
```

⇒ ✅ **零輸出** ⇒ `yarn.lock` 與 `package.json` 全程未動（硬約束 2：本任務不需要任何新套件）。

### P4 既有註解全稱比對（守則 8 ⭐，⛔ 不抽查）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git show HEAD:next.config.js | diff - next.config.js; echo "exit=$?"
4c4
<     eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },
---
>     eslint: { dirs: ['app', 'components', 'data', 'middleware.ts'] },
exit=1
```

⇒ ✅ `diff` **`exit=1`**（有差異才對；⚠️ 此處 `$?` 取到的正是 `diff` 的離開碼——它是管線最後一段 ⇒ 這條**可以**當證據）。
⇒ ✅ 差異**恰好一組 `<` / `>`，只有第 4 行**；`diff` 輸出中⛔ **未出現**
`// 如果有其他配置可以加在這裡`、`output: 'standalone'`、`module.exports`、`/** @type`
⇒ **既有註解一個字都沒動**（`next.config.js` 全檔 8 行，`diff` 是全檔比對、⛔ 非抽查）。

**⭐ 依 review 建議 7：兩側輸出都貼，⛔ 不只寫「相同」**

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git show HEAD:next.config.js | grep -n '//' ; echo "exit=$?"; grep -n '//' next.config.js; echo "exit=$?"
5:    // 如果有其他配置可以加在這裡
exit=0
5:    // 如果有其他配置可以加在這裡
exit=0
```

⇒ ✅ **HEAD 側**（第一組）與**現行檔側**（第二組）逐字相同：同為第 5 行、同為 `    // 如果有其他配置可以加在這裡`。
⚠️ 兩側各只回一行是對的：第 1 行 `/** @type … */` ⛔ 不含 `//`。

### P5 git 對帳

**動工前**（見上方 N0 節）與**收稿時**各貼一次：

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short; echo "exit=$?"
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
 M next.config.js
?? docs/tasks/F10-background.md
?? docs/tasks/F10-plan-review.md
?? docs/tasks/F10-plan.md
?? docs/tasks/F10.md
exit=0
```

⇒ ✅ 與動工前逐字比對，**唯一新增的是 ` M next.config.js`**（本包那一行改動）。
⇒ ✅ 三個舊改動檔（`app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`）**仍為 ` M` 且未 staged**。
⇒ ✅ ⛔ **未出現** `data/lintCanary.ts` / `data/lintCanary.tsx`、`f10-empty-canary`、`package-lock.json`、`next.config.js.bak`。
⇒ ✅ 第一欄全部為空白 ⇒ **⛔ 什麼都沒有 `git add`**（連 stage 都沒有）。
⚠️ 本檔 `docs/tasks/F10-verification.md` 落檔後會多一行 `?? docs/tasks/F10-verification.md`——那是本報告自己。

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git rev-parse HEAD origin/developers; echo "exit=$?"
3a15b705cc0c02954c27ad4e4ffbe976962e468d
3a15b705cc0c02954c27ad4e4ffbe976962e468d
exit=0
```

⇒ 本地 `HEAD` = `origin/developers`。⚠️ **據實：尚未 commit、尚未 push**（本次改動全部在工作樹）。

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git log --oneline -1; echo "exit=$?"
3a15b70 docs(claude): NR-D7 撰碼規約 §A 判準改判——檔案體積改為檔案可讀性
exit=0
```

## 審計確認
- 本任務**無 audit log**（⛔ 未改任何 Route Handler、⛔ 未改 `middleware.ts`）。
- ⛔ **機密不入 log**：本輪貼進本檔的 lint / build / git 輸出**逐段過目過**，
  ⛔ 不含 `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` / `DISCORD_WEBHOOK_URL` / `ADMIN_DISCORD_ID` / 任何 token。
  ⚠️ `yarn build` 輸出只有 `- Environments: .env.local` 這一行提到環境檔，**⛔ 未印出任何變數值**。
- ⛔ 本輪⛔ 未新增任何 `console.log` / `console.error`。

## 產物重建
- [x] 改過原始碼 → **已跑 `yarn build`**（P3 第三條，`exit=0`，輸出已附）。
      ⚠️ `next.config.js` 是 build 讀的設定檔 ⇒ 硬約束 7 成立、⛔ 未以 `yarn dev` 熱更新充數。
- [ ] 跨 repo 依賴：**不適用**（本 repo 無被依賴方）。
- [ ] 或：無原始碼變更 —— **不適用**（有一行原始碼變更）。

## git 對帳
```
git log --oneline -1                    → 3a15b70 docs(claude): NR-D7 撰碼規約 §A 判準改判——檔案體積改為檔案可讀性
git status                              → ⛔ 不 clean（預期）：` M next.config.js`（本包）+ 三個無關舊改動 + `docs/tasks/F10*` untracked；⛔ 無 canary、⛔ 無 staged
git rev-parse HEAD origin/developers    → 兩者皆 3a15b705cc0c02954c27ad4e4ffbe976962e468d；⚠️ **尚未 push**（本次改動尚未 commit）
```

## CI
- **本地**：`yarn install --frozen-lockfile` `exit=0`／`yarn lint --max-warnings 0` `exit=0`／`yarn build` `exit=0`（P3，輸出全附）。
- **CI／lint 欄措辭（逐字，依 `CLAUDE.md` 與任務包 §D）**：
  **綠，但 `no-img-element` 已 off、10 處未修**。
  ⚠️ 本輪自量該數字：`grep -rno '<img' app components data lib middleware.ts | wc -l` ⇒ **10**、
  `grep -rl` ⇒ **7 個檔**（`app/team/page.tsx`×2、`app/sponsor/page.tsx`×2、`components/HomeHero.tsx`、
  `components/Navbar.tsx`×2、`components/ServerSection.tsx`、`components/FeatureSection.tsx`、`components/FeatureRow.tsx`）
  ⇒ 與規定措辭相符，⛔ 未轉抄。
- ⚠️ **本專案沒有 build/lint CI**（唯一 workflow 只在 tag `v*.*.*` 時 build image）
  ⇒ 收案標準 = 上述本地嚴格指令逐字跑過並附輸出，⛔ 未寫「等 remote Actions 綠」。
  ⚠️ 打 `v*.*.*` tag 就是發版 ⇒ 本輪⛔ **未打任何 tag**。
- ⚠️ **⛔ 不得以 P1-B 的 `exit=0` 單獨當佐證**：佐證是 **N1**（旗標仍有效）**+ P2**（設定仍被讀）。

## 真機 E2E（若涉 UI / 真機行為）
**不適用。** 本包⛔ 不涉 UI 行為改動：只動 lint 覆蓋範圍；`output: 'standalone'` 由 P4 證明未動
⇒ 依任務包「回歸」條，⛔ 不需要 `yarn dev` 開頁目視。

| # | 步驟 | 過線標準 | 結果 |
|---|------|----------|------|
| — | 無 | 無 | 不適用（⛔ 非「待人工」，是本包範圍外） |

## 回歸守門
- `yarn build` `exit=0`（P3）⇒ 改設定檔⛔ 未把 build 弄壞；13 條路由與 middleware 全數產出。
- `yarn lint --max-warnings 0` `exit=0`（P1-A、P3）⇒ 既有 `app` / `components` / `data` / `middleware.ts` 覆蓋範圍仍全綠。
- **P2** 實測 `data/` 的 canary 仍被抓 ⇒ 拿掉 `'lib'` **⛔ 沒有連帶讓其他四項脫離 lint**。
- `git diff --stat yarn.lock package.json` 零輸出 ⇒ 依賴解析未變。
- ⛔ **不觸發**守則 8 的 `curl` 正負向測試：本任務⛔ 未改任何 Route Handler 或 `middleware.ts`。

## 守界聲明
- ✅ 只做了任務包範圍：**唯一原始碼改動 = `next.config.js` 一行**。⛔ 未超前實作、⛔ 未違反任何鐵則。
- ✅ **裁決① 丙**：⛔ **未自己改 `CLAUDE.md`**，三處建議改寫文字寫在 §6，由主迴圈收案套用。
- ✅ **裁決② 甲**：⛔ **未 `rmdir lib`**；硬碟上的空 `lib/` 原封不動（N0 前置的 `ls -ld lib` 即在目錄存在時量的）。
- ✅ **裁決③ 甲**：backlog 回填屬 vault 層，本輪**零動作**（僅在 §7 標記）。
- ✅ ⛔ 未碰 `.eslintrc.json`、⛔ 未碰 F9 的 10 處 `<img>`、⛔ 未往 `lib/` 放任何檔、
  ⛔ 未動 `Dockerfile` / `.dockerignore` / `.github/workflows/push-docker.yaml` / `package.json` / `yarn.lock`、
  ⛔ 未跑 `docker build`、⛔ 未跑 `npm install`、⛔ 未打任何 tag、⛔ 未用 `git add .`（連單檔 `git add` 都沒做）。
- ✅ 兩個 canary（`f10-empty-canary` 空目錄、`data/lintCanary.ts`）**驗完已刪**，
  且清除方式為 `rmdir` / `rm`（新建物件）⇒ ⛔ **全程未使用 `git checkout` 還原任何東西**。
- ✅ ⛔ 未寫、未改 `F10-plan-review.md`、⛔ 未代填任何裁決或批覆。
- **carryover（本階段沒解、留給後續）**：
  - **F6**：往 `lib/` 放第一個檔時**必須把 `'lib'` 加回 `next.config.js` 的 `eslint.dirs`**（本包造成的責任，見 §6）。
  - **F9**：10 處 `<img>` 未修、`@next/next/no-img-element` 仍為 off（F8 裁決① 丙，⛔ 不在本包）。
- ⛔ **尚未 commit / push，等待架構師確認。** 任務包與 plan 的任何措辭均⛔ 不構成 push 預授權。

---

## 六、`CLAUDE.md` 建議改寫文字（依裁決① 丙＝三處；⛔ 實作側不自己改，由主迴圈收案套用）

> ⚠️ 沿 F8 慣例（收案 commit `028c4eb` 由主迴圈改寫「CI 現況」節）。
> ⚠️ **本節的「錨點」三段是本輪用 `sed` 從 `CLAUDE.md` 直接取出、以 `diff` 逐字驗過的原文**，
> ⛔ **未經人手重打**（守則 10：大段中文能搬不重寫；U+651A/U+651B 類的轉寫錯誤肉眼審不出來）。
> 套用時請用**精確錨點編輯**，⛔ 不整份重寫；⛔ 錨點不匹配即失敗（安全失敗）優於整份覆寫。

**錨點逐字驗證（本輪實跑，⛔ 非聲稱）**

```
$ diff <(sed -n '480,482p' docs/tasks/F10-plan.md) <(sed -n '107,109p' CLAUDE.md); echo "exit=$?"
exit=0
$ diff <(sed -n '501,502p' docs/tasks/F10-plan.md) <(sed -n '191,192p' CLAUDE.md); echo "exit=$?"
exit=0
$ diff <(sed -n '519p' docs/tasks/F10-plan.md) <(sed -n '237p' CLAUDE.md); echo "exit=$?"
exit=0
```

⇒ ✅ 三處錨點與 `CLAUDE.md` **現行檔（= HEAD `3a15b70`，該檔未被本輪改動）逐字相同**，可直接用於精確錨點編輯。

⚠️ **三處 / 其餘三處的實數（⭐ 依 review 建議 3，本輪自量、⛔ 未轉抄）**：

```
$ grep -n 'lib' CLAUDE.md; echo "exit=$?"
38:- **`lib/`**：⚠️ **目前是空目錄**（2026-08-30 實查）。共用邏輯要放這裡。
109:  （`app` / `components` / `data` / `lib` / `middleware.ts`）⇒ **lint 與 build 共用同一份範圍**。
168:     新增 `data/` 檔、`lib/` 開始有東西時）；非結構變更勿動地圖。
191:- **純函式外置**：不依賴元件 state 的函式放 `lib/`，且同步補測試。
192:  ⚠️ `lib/` 目前是空的——**第一個放進去的人負責建立慣例**。
195:- 樣式常數/工具字串**複製到第二個檔就必須抽共用**（`lib/` 或 `components/`）。
237:| `lib/` | ⚠️ **空目錄**（共用邏輯預留位） |
exit=0
$ grep -c 'lib' CLAUDE.md; echo "exit=$?"
7
exit=0
```

⇒ `CLAUDE.md` 提到 `lib` 的共 **7 行**（38、109、168、191、192、195、237）。
本節三處覆蓋 **109、191–192、237**；**其餘為 38、168、195 = 三處**（依裁決② 甲，措辭**不動**）。
⚠️ ⭐ **據實更正**：`F10-plan.md` §1 表 ② 寫「其餘**四處**」是**誤數**，
本報告依 review 建議 3 統一寫 **三處**，且⛔ 未把誤數帶進下方建議文字。

### 6.1 「CI 現況」節的 `eslint.dirs` 清單（**必改** —— 不改就會留下一句假話）

**錨點（現行逐字，三行；`CLAUDE.md` 行 107–109）**

```
- ✅ **`yarn lint` 的空測已於 2026-09-09（F8）解除**：repo 根目錄已有 `.eslintrc.json`
  （`root: true` + `next/core-web-vitals`），覆蓋範圍寫在 `next.config.js` 的 `eslint.dirs`
  （`app` / `components` / `data` / `lib` / `middleware.ts`）⇒ **lint 與 build 共用同一份範圍**。
```

**建議改為**（前兩行不動；第三行的清單拿掉 `lib` 那一項，並在其後**新增**三行提醒）

```
- ✅ **`yarn lint` 的空測已於 2026-09-09（F8）解除**：repo 根目錄已有 `.eslintrc.json`
  （`root: true` + `next/core-web-vitals`），覆蓋範圍寫在 `next.config.js` 的 `eslint.dirs`
  （`app` / `components` / `data` / `middleware.ts`）⇒ **lint 與 build 共用同一份範圍**。
  ⚠️ F10（2026-09-10）已把 `lib` 從 `eslint.dirs` 拿掉（它是空目錄，加上 `--error-on-unmatched-pattern`
  會讓本機 lint 假失敗）⇒ **往 `lib/` 放第一個檔時必須把 `'lib'` 加回 `dirs`**，否則 `lib/` 永遠不會被 lint
  ——設了 `dirs` 就**整個取代** Next 內建預設清單（`["app","pages","components","lib","src"]`），⛔ 不會合併回來。
```

### 6.2 撰碼規約 §B「第一個放進去的人負責建立慣例」（`CLAUDE.md` 行 191–192）

**錨點（現行逐字，兩行）**

```
- **純函式外置**：不依賴元件 state 的函式放 `lib/`，且同步補測試。
  ⚠️ `lib/` 目前是空的——**第一個放進去的人負責建立慣例**。
```

**建議改為**（原兩行**一個字不動**，其後**新增**兩行）

```
- **純函式外置**：不依賴元件 state 的函式放 `lib/`，且同步補測試。
  ⚠️ `lib/` 目前是空的——**第一個放進去的人負責建立慣例**。
  ⚠️ **並且必須把 `'lib'` 加回 `next.config.js` 的 `eslint.dirs`**（F10 已把它拿掉）——
  否則 `lib/` 裡的程式碼永遠不會被 lint，且⛔ 沒有任何指令會提醒你。
```

### 6.3 程式碼地圖 `lib/` 那列（`CLAUDE.md` 行 237）

**錨點（現行逐字，一行）**

```
| `lib/` | ⚠️ **空目錄**（共用邏輯預留位） |
```

**建議改為**

```
| `lib/` | ⚠️ **空目錄**（共用邏輯預留位）。⚠️ F10 已把 `lib` 從 `next.config.js` 的 `eslint.dirs` 拿掉 ⇒ **放第一個檔時必須加回**，否則不會被 lint |
```

### 6.4 給套用者的兩個提醒

1. **日期欄位**（⭐ 依 review 建議 4）：6.1 的建議文字寫 `F10（2026-09-10）`，
   任務包裁決① 的建議措辭寫 2026-09-09（裁「甲」之日）——**兩者都不是收案日**。
   ⇒ 套用時請填**實際收案日期**；實作側⛔ 未自行改動。
2. **⛔ 其餘三處（38、168、195）措辭不動**（依裁決② 甲：空 `lib/` 不刪 ⇒ 「空目錄」的措辭仍為事實）。


### 6.5 ⭐ 錨點完整性複核（證明本檔 §6 裡那三段錨點**沒有在轉寫過程中變質**）

⚠️ 守則 10 的實測教訓：`U+651A` 被誤寫成 `U+651B`，兩碼位相鄰、字形極相似，**肉眼審不出來**。
⇒ 本檔 §6 的三段錨點**全部用 `sed` 從 `CLAUDE.md` 直接複製**、⛔ 未經人手重打；
並在落檔**之後**再用 `diff` 拿**本檔實際內容**與 `CLAUDE.md` 對一次（⛔ 不是拿 plan 對）：

```
$ V=docs/tasks/F10-verification.md
$ A1=$(grep -n '^### 6.1' "$V" | cut -d: -f1); sed -n "$((A1+5)),$((A1+7))p" "$V" | diff - <(sed -n '107,109p' CLAUDE.md); echo "exit=$?"
exit=0
$ A2=$(grep -n '^### 6.2' "$V" | cut -d: -f1); sed -n "$((A2+5)),$((A2+6))p" "$V" | diff - <(sed -n '191,192p' CLAUDE.md); echo "exit=$?"
exit=0
$ A3=$(grep -n '^### 6.3' "$V" | cut -d: -f1); sed -n "$((A3+5))p" "$V" | diff - <(sed -n '237p' CLAUDE.md); echo "exit=$?"
exit=0
```

（本輪實跑時解析到的行號：6.1 錨點在本檔第 **609–611** 行、6.2 在 **630–631** 行、6.3 在 **648** 行。）

⇒ ✅ **三段 `diff` 全部 `exit=0`** ⇒ 本檔 §6 印出的錨點與 `CLAUDE.md` 現行檔**逐字元相同**，
主迴圈可直接拿它做精確錨點編輯；⛔ 錨點不匹配即失敗（安全失敗）優於整份覆寫。
⚠️ 據實：`diff` 的 `exit` 取自管線最後一段 ⇒ **這裡的 `$?` 正是 `diff` 自己的**，可當證據。

---

## 七、進 commit 的檔案（逐檔 `git add`，⛔ 禁 `git add .`）

⛔ **本輪什麼都沒 `git add`**（`git status --short` 第一欄全空白為證）。以下是**建議**清單，待架構師確認後才動。

**建議 add 的（逐檔）**
- `next.config.js`
- `docs/tasks/F10-plan.md`
- `docs/tasks/F10-verification.md`（本檔）

**⛔ 不得進 staging**
- `app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`（三個與本任務無關的舊改動，`CLAUDE.md` 地雷第 6 條）
- `data/lintCanary.ts` / `.tsx`、`f10-empty-canary/`（**已刪，⛔ 不在 `git status` 裡**）
- `CLAUDE.md`（依裁決①，由主迴圈收案時套用 §6）

**由收案時處理（沿 F8 慣例）**
- `docs/tasks/F10.md`、`docs/tasks/F10-background.md`、`docs/tasks/F10-plan-review.md`

⛔ **commit / push 前一律回報，待架構師確認。** 任務包與 plan 的任何措辭均⛔ 不構成 push 預授權。⛔ 不打任何 tag。

### 收案後續（⛔ 不在實作側範圍，僅標記）
- **主迴圈**：依裁決① 套用 §6 的 `CLAUDE.md` 三處改寫（填實際收案日期）；依裁決③ **甲** 回填 backlog
  （F10 結案 + F6 條目補「加回 `eslint.dirs`」）；七件套歸檔至 `docs/tasks/archive/`。
- **規劃側（nr-planner）**：`F10-plan-review.md` 檔末「裁決記錄」節已於放行時回填三項裁決。
  ⚠️ 實作側⛔ 未寫、⛔ 未改該檔任何一個字。

---

## 八、對 `F10-plan-review.md` 七條建議的逐條處置（採納／不採）

| # | 建議摘要 | 處置 | 落點 |
|---|---|---|---|
| 1 | N1 還原指令的 exit 有兩種來源，⛔ 不能只憑「非 0」；證據取 `No such file or directory` 那行，並**附加**單獨一條 `ls -ld f10-empty-canary; echo "exit=$?"` | ✅ **全採納** | §N1「還原」：任務包指令原樣跑（⛔ 未取代），另加跑附加指令得 `exit=1`；並據實寫明 plan §5-N1 那句推論**不成立**。同族的 `mkdir` 撞號風險亦已用「動手前殘留檢查」+ 訊息行處理 |
| 2 | P2 備援三 `data/lintCanary.ts`（`import/no-anonymous-default-export`，warn 級，需加跑 `--max-warnings 0`） | ✅ **採納但**⛔ **未動用** | **主素材一次就觸發**（`react-hooks/rules-of-hooks`，**Error 級**，`exit=1`）⇒ ⛔ 不需要 `.tsx` 備援、⛔ 不需要備援三。⚠️ 據實：本輪**未實跑**備援二／備援三，⛔ 不對它們作任何聲稱（見 §9） |
| 3 | `CLAUDE.md` 其餘處統一寫**三處**（plan §1 的「四處」是誤數） | ✅ **全採納** | §6：本輪自跑 `grep -n 'lib' CLAUDE.md` + `grep -c` 得 **7 行**，扣掉 §6 的 109 / 191–192 / 237 ⇒ 其餘 **38、168、195 = 三處**；並明寫 plan §1 誤數 |
| 4 | §6.1 日期由收案時填實際收案日，實作側⛔ 不必改 | ✅ **採納** | §6.4 第 1 點：保留 plan 原文的 `2026-09-10`，並註明「兩者都不是收案日、套用時填實際收案日」 |
| 5 | N0 前置**附加**一條 `ls -ld lib; echo "exit=$?"`（⛔ 不取代任務包指令） | ✅ **全採納** | §N0：任務包指令原樣跑（並註明其 `exit` 是 `wc` 的），另加跑附加指令得 `exit=0` |
| 6 | plan §2.4 的 `sed -n '30,46p'` 只貼出 15 行；verification 若重貼請據實 | ✅ **採納（以⛔ 不重貼的方式）** | 本輪⛔ **未重跑也未重貼** `node_modules` 原始碼——那是 plan 的勘查紀錄，⛔ 不是本輪執行結果。本檔凡引用該結論處（`errorOnUnmatchedPattern` 於 build 期恆 `false`）**一律標明是 plan／任務包的檔案層結論、⛔ 非本輪實跑** |
| 7 | P4 `grep -n '//'` 兩側輸出都貼、⛔ 不只寫「相同」 | ✅ **全採納** | §P4：兩組輸出**逐字都貼**（HEAD 側、現行檔側各一行 `5:    // 如果有其他配置可以加在這裡`），並註明「第 1 行 `/** @type … */` ⛔ 不含 `//`，故各只回一行是對的」 |

⇒ **七條全部採納，⛔ 無一條不採。**（第 2 條的「採納但未動用」是因為前置條件沒發生，⛔ 不是拒絕。）

**另：plan §10 六條異議的後續**
- 異議 1（背景檔「7 行」誤植）：review 已判「實作側對」且**主迴圈已訂正背景檔**。本輪自量 `git show HEAD:next.config.js | wc -l` ⇒ **8**、`wc -c` ⇒ **245**，與訂正後一致 ⇒ 結案。
- 異議 3（N0 exit 計量瑕疵）：本輪依 review 建議 5 加跑附加指令處理，⛔ 未改寫任務包指令。
- 異議 5（背景行號略偏）：review 判「不成立」，本輪**接受該判定**，⛔ 未再爭執、⛔ 未重跑 `node_modules` 查證。

---

## 九、仍未驗清單（⛔ 不得以源碼推理代替；據實列出）

> ⚠️ 以下每一條都寫明**為什麼沒驗**，⛔ 沒有靜默略過的項目。

1. ⛔ **未驗（本輪⛔ 不需要驗）**：`errorOnUnmatchedPattern` 在 **build 期恆 `false`** 這件事。
   ⚠️ 這是 `F10.md` §B-4 與 `F10-plan.md` §2.4 的**檔案層（讀 `node_modules` 原始碼）結論**，
   ⛔ **不是本輪的執行結果**，本檔引用它時一律如此標明。
   本輪只實跑到「`yarn build` `exit=0`」這個**事實**（P3），⛔ 未實跑「刻意讓 build 撞到空目錄看它會不會失敗」的對照。
2. ⛔ **未驗**：P2 的 **`.tsx` 備援素材**（`@next/next/no-sync-scripts`）與 **review 建議 2 的備援三**
   （`import/no-anonymous-default-export`）。**成因**：主素材一次就觸發 ⇒ 前置條件未發生 ⇒ ⛔ 未建這兩個檔。
   ⇒ 本檔⛔ 不對它們是否會觸發作任何聲稱。
3. ⛔ **未驗（本輪⛔ 未做，且任務包明列⛔ 不該做）**：`docker build` 是否會把空目錄經 `COPY . .` 帶進 image。
   **成因**：任務包 §B-4 與「不做什麼」第 7 條明寫⛔ 不跑 `docker build`；且兩條發版路徑的結論都與這個答案無關。
4. ⛔ **未驗**：`CLAUDE.md` §6 三處建議文字**套用之後**的結果（措辭是否讀得順、是否與其他段落打架）。
   **成因**：依裁決① 丙，實作側⛔ 不自己改 `CLAUDE.md` ⇒ 本輪只驗到「錨點與現行檔逐字相同」（§6 的三條 `diff` `exit=0`）。
5. ⛔ **未驗**：backlog（vault 層）F6 條目與 F10 結案的回填。**成因**：裁決③ 甲指定由主迴圈處理；
   實作側⛔ 讀不到 vault、也⛔ 不得寫。
6. ⛔ **未驗**：fresh clone（沒有 `lib/` 的環境）下 `--error-on-unmatched-pattern` 的行為。
   **成因**：本機硬碟上的 `lib/` 依裁決② 甲**不刪** ⇒ 本輪⛔ 無法製造「`lib/` 不存在」的情境。
   ⚠️ 但 **N1 已用另一個真實空目錄 `f10-empty-canary` 證明旗標本身仍有效** ⇒ 本項⛔ 不影響 F10 的結論。
7. ⛔ **未驗（⛔ 不在範圍）**：F9 的 10 處 `<img>`（`no-img-element` 仍為 off）。**成因**：F8 裁決① 丙，⛔ 不在本包。

**⭐ 本輪已清掉的「規劃側標未實查」項目（逐條查掉、⛔ 未靜默略過）**
- ✅ plan §9 第 1 條「未驗：改後的 P1-A / P1-B」⇒ **已驗**（P1-A `exit=0`、P1-B `exit=0` 且 `No files matching` 消失）。
- ✅ plan §9 第 2 條「未驗：N1 的空目錄 canary」⇒ **已驗**（`mkdir` 真建、`exit=1` + 訊息行）。
- ✅ plan §9 第 3 條「未驗：`rules-of-hooks` 是否對無 JSX 的 `.ts` 觸發」⇒ **已驗，答案是「會觸發」**
  （`./data/lintCanary.ts` `5:15  Error: … react-hooks/rules-of-hooks`）。⚠️ 這一條同時是 review 建議 2 指出「F8 沒驗過」的那一項。
- ✅ plan §9 第 4 條「未驗：`yarn install --frozen-lockfile`」⇒ **已驗**（`exit=0`，且 `git diff --stat yarn.lock package.json` 零輸出）。
- ✅ plan §9 第 5 條「未驗：`yarn build`」⇒ **已驗**（`exit=0`，`.next/` 已重建）。
- ✅ review 建議 3 的「三處 vs 四處」⇒ **已自量查掉**（`grep -c 'lib' CLAUDE.md` ⇒ 7 行；其餘為三處）。
