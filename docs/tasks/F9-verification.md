# 驗收報告：F9 10 處 `<img>` 換成 `next/image`，並重新啟用 `@next/next/no-img-element`

> 實作側（nr-implementer）2026-09-11 產出，格式沿用 `docs/tasks/verification_template.md`。
> HEAD：`df2b8ff`（本檔自量：`git rev-parse --short HEAD` 實跑）。分支 `developers`。
> ⛔ **尚未 commit／push，等待架構師確認。**
> ⚠️ 本檔每一個數字都是我自己在本輪實跑取得的，⛔ 不從任務包／plan／plan-review／派工訊息轉抄。
> ⚠️ 凡未實跑者一律標「未驗」或「⏳ 待人工」，⛔ 不以源碼推理冒充已執行。

## 📌 2026-09-12 依稽核報告（`docs/tasks/F9-verification-audit.md`）所做的更正

| # | 稽核指出 | 我的處置 |
|---|---|---|
| ① | 「回歸守門」的 `Middleware 74.8 kB` 與稽核側主樹實跑的 `74.9 kB` 不符 | **自己重跑兩次**（暖／冷快取）仍得 `74.8 kB` ⇒ ⛔ 不照抄稽核側數字，據實寫出**三方三個值與未解差異**，並補一個更細的錨點（`wc -c .next/server/middleware.js`）。同時更正原本「（index 版 74.9 kB）」那個會被誤讀成同條件並列的寫法。見「⚠️ Middleware 數值的更正與未解差異」 |
| ② | 同碼連拍對照圖 `e40936a1…` **未落檔**，無從複核（違反鐵則 8） | **承認是我的錯**，已重拍並落檔 `docs/tasks/F9-evidence/after-recheck/`（4 張），報告內附檔名與 `shasum -a 256` 全文。見 P5(f) 下方「同碼連拍對照」 |
| ③ | P7(a) 只寫「全文已貼在本輪執行記錄」，報告內沒有那份全文 | 已把八檔整檔 diff 的**實際輸出全文**補進 P7(a) |
| ④ | 第三方補跑（`F9-thirdparty-recheck.md`）指出：乾淨載入下無 LCP 警告（**與我一致**），但它讀**累積緩衝**時曾見一條 `/images/team.png` 的 LCP `console.warn` | P4 那句改成**有限定語**的版本：乾淨載入下無、⚠️ 累積緩衝中第三方曾見一條，屬**允許的警告**、⛔ 不影響過線，**來源未查明**。⛔ 未寫成「已排除」、⛔ 未寫成「本輪有 LCP 警告」 |
| ⑤ | 第三方另提出一條我漏掉的機器判準：**worktree 九檔的 blob == 主樹 staged 的 blob** | 已**自己重跑**該比對（九檔全 `SAME`）並補進 P6-3；⛔ 數值不是轉抄 |

⚠️ 本次更正**⛔ 沒有動任何原始碼、⛔ 沒有 `git add`／`git reset`、⛔ 沒有 commit／push**；
唯一新增的檔是 `docs/tasks/F9-evidence/after-recheck/` 的 4 張 PNG（依裁決 ⑥乙 為**預期的 `??`**）。

---

## 變更檔案

| 檔 | 改了什麼 | `git diff --numstat`（實跑） | 位元組（改後，實測 `wc -c`） |
|---|---|---|---|
| `.eslintrc.json` | 刪 `rules` 區塊與第 4–6 行三行說明（裁決 ⑧甲）；第 3 行行尾逗號一併移除（JSON 語法要求） | `1 7` | 56（改前 403） |
| `next.config.js` | 第 5 行插入 `    images: { unoptimized: true },`（裁決 ①丙） | `1 0` | 273（改前 238） |
| `app/sponsor/page.tsx` | import + #1（891×914）+ #2 PayPal（226×142 **且 className 加 `h-auto`**，裁決 ⑨甲） | `5 2` | 12087（改前 11966） |
| `app/team/page.tsx` | import + #3（1920×1080）+ #4（512×512 名目） | `7 2` | 3615（改前 3463） |
| `components/FeatureRow.tsx` | import + 空行 + #5（1024×1024 名目） | `5 1` | 1970（改前 1860） |
| `components/FeatureSection.tsx` | import + 空行 + #6（1024×1024 名目） | `5 1` | 2589（改前 2495） |
| `components/HomeHero.tsx` | import + 空行 + #7（1024×1024） | `3 1` | 2591（改前 2529） |
| `components/Navbar.tsx` | import + #8（1024×1024）+ #9 改條件渲染（32×32，裁決 ④甲(a)） | `5 2` | 5249（改前 5111） |
| `components/ServerSection.tsx` | **index（commit 內容）**：import + #10（1920×1031）；工作樹版同樣兩處但 className 不同 | index：`2 1`（`git diff --cached --numstat`）<br>工作樹：含長期未 commit 舊改動，⛔ 不進 commit | index 版 6318；主樹工作樹版 6390（改前 6329） |

⚠️ `app/layout.tsx`、`app/staff/page.tsx` **一個字都沒動、也沒進 staging**（P8 對帳表）。

**新增（證據檔）**：`docs/tasks/F9-evidence/{before,after,before-index,after-index}/*.json`（各 4 檔）、
`docs/tasks/F9-evidence/{README.md,metrics.js,capture.sh}`、`docs/tasks/F9-evidence/before/MD5SUMS.txt`。
⚠️ **`MD5SUMS.txt` 實際路徑在 `before/` 底下、⛔ 不在 evidence 根層**（我 `ls -la` 實查）——
架構師 2026-09-11 裁「根層四檔要進 git」，我依該裁決的**意旨**把這四個檔（含位於 `before/` 的 `MD5SUMS.txt`）都 add 了。

---

## 設計重點

- **裁決 ①丙**：`next.config.js` 加 `images: { unoptimized: true }`；10 處 `<Image>` ⛔ 都不寫 `unoptimized` prop、⛔ 不加 `remotePatterns`。
- **裁決 ②甲**：⛔ 不加 `sharp`。`git diff --stat yarn.lock package.json` 實跑**無輸出**。
- **裁決 ③甲**：10 處全給 `width`/`height`，⛔ 無 `fill`。
- **裁決 ④甲(a)**：#9 改條件渲染 `{session.user?.image && (<Image … />)}`。
  **型別檢查實測通過**（P3 `yarn build` 的 `Linting and checking validity of types` 段），
  ⇒ 採用 plan §4.1 的**第一種寫法**，⛔ 沒有退回 `{session.user && session.user.image && …}`、⛔ 沒用 `!`／`any`／`@ts-ignore`。
- **裁決 ⑤甲**：`git worktree` 於 repo 外建 HEAD 乾淨樹 `/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index`，symlink `node_modules` 與 `.env.local`（⛔ 未讀取、⛔ 未印出 `.env.local` 內容）。
- **裁決 ⑥乙**：JSON 進 git、PNG ⛔ 不進（P8 列為預期的 `??`）。
- **裁決 ⑦甲**：⛔ 無新元件、⛔ 不碰 `lib/`、⛔ 不動 `eslint.dirs`。
- **裁決 ⑧甲**：`.eslintrc.json` 回到 4 行。
- **裁決 ⑨甲**：`app/sponsor/page.tsx` 第 165 行（改前第 162 行）className 由
  `w-12 object-contain brightness-0 invert` 改為 `w-12 h-auto object-contain brightness-0 invert`。
  ⚠️ **實測結果與裁決點 ⑨ 的前提不符，見下方「裁決 ⑨ 的實測」**——已照裁決執行，架構師知情後（2026-09-12）維持原裁決「留」。

---

## 測試結果

### P0 改前基線（動任何原始碼之前）

**P0-A**
```
$ git status --short
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? .claude/launch.json
?? docs/tasks/F9-background.md
?? docs/tasks/F9-evidence/
?? docs/tasks/F9-plan-review.md
?? docs/tasks/F9-plan.md
?? docs/tasks/F9.md
exit=0
$ git rev-parse --short HEAD
df2b8ff
exit=0
```

**P0-B 正向基線**
```
$ yarn lint --max-warnings 0
✔ No ESLint warnings or errors
Done in 1.70s.
exit=0
```

**N0 改前負向基線（⛔ 一個 repo 檔都沒改）**
```
$ yarn lint --max-warnings 0 -c node_modules/eslint-config-next/core-web-vitals.js
./app/sponsor/page.tsx        38:13 / 162:21   @next/next/no-img-element
./app/team/page.tsx           28:13 / 42:17    @next/next/no-img-element
./components/FeatureRow.tsx   33:21           @next/next/no-img-element
./components/FeatureSection.tsx 46:15         @next/next/no-img-element
./components/HomeHero.tsx     24:11           @next/next/no-img-element
./components/Navbar.tsx       29:11 / 79:15   @next/next/no-img-element
./components/ServerSection.tsx 90:33          @next/next/no-img-element
error Command failed with exit code 1.
exit=1
$ yarn -s lint -c node_modules/eslint-config-next/core-web-vitals.js 2>&1 | grep -c "no-img-element"
10
```
⇒ **這個閘門改前確實會擋、且量得準（7 檔 10 處）。**

**P0-C 尺寸實量**（`sips`，我本輪實跑）
```
sponsor.png        891 914
team.png           1920 1080
quasi.png          512 512
Moon_Flame.png     476 512
liujuhsin.png      512 512
server_quasi.png   989 1076
launcher.png       1024 1024
logo.png           1024 1024
server_01.png      1920 1031
exit=0
```
DOM `naturalWidth×naturalHeight`（`before/*.json`，我本輪 `jq` 實讀）與上表逐檔一致；
PayPal 外部圖 `pp_cc_mark_111x69.jpg` 實為 **226×142**（檔名的 111×69 是 2 倍圖）。
基線 rect：PayPal `48×30.16`（48×142/226 = 30.159…）、team `1022×574.88`（1022×1080/1920 = 574.875）⇒ 兩處比例值給對。

**P0-D 基線完整性**
```
$ md5 -r *.json *.png > <scratchpad>/f9-recheck.txt; diff <(sort … ) <(sort MD5SUMS.txt …)
exit=0
```
⇒ 主迴圈 2026-09-10 落檔的 8 個基線檔**自落檔後沒被動過**。

**P0-E `sharp` 現況**
```
$ ls node_modules/sharp
ls: node_modules/sharp: No such file or directory
exit=1
```

### P1 正向：同一條負向指令現在過了

```
$ yarn lint --max-warnings 0 -c node_modules/eslint-config-next/core-web-vitals.js
✔ No ESLint warnings or errors
Done in 1.08s.
exit=0
```
⇒ **與 N0 是同一條指令、一個字不改**，exit 由 1 變 0。

### P2 完成判準：repo 自己的設定下規則已重新生效

```
$ cat .eslintrc.json
{
  "root": true,
  "extends": "next/core-web-vitals"
}
exit=0
$ yarn lint --max-warnings 0
✔ No ESLint warnings or errors
exit=0
```
⚠️ **這條單獨不算數**，配 N1。

### N1 負向對照（canary）：repo 設定下閘門真的會擋

新增 `data/lintCanary.tsx`（`data` 在 `eslint.dirs` 內）後：
```
$ yarn lint --max-warnings 0
./data/lintCanary.tsx
3:10  Warning: Using `<img>` … @next/next/no-img-element
error Command failed with exit code 1.
exit=1
$ yarn -s lint 2>&1 | grep -c "no-img-element"
1
```
移除與三重確認：
```
$ rm data/lintCanary.tsx           exit=0
$ ls data/                         modpackHistory.ts  news.ts  staff.ts     exit=0
$ git status --porcelain data/     （無輸出）                                exit=0
```

### P3 嚴格三指令（canary 已移除）

```
$ yarn install --frozen-lockfile
Done in 46.88s.
exit=0
$ yarn lint --max-warnings 0
✔ No ESLint warnings or errors
exit=0
$ yarn build
 ✓ Compiled successfully
   Linting and checking validity of types ...
 ✓ Generating static pages (13/13)
Route (app) … ○ / 4.07 kB / 110 kB … λ Middleware 74.8 kB
Done in 9.92s.
exit=0
$ git diff --stat yarn.lock package.json
（無輸出）
exit=0
```
⚠️ **據實**：`yarn build` 綠**證明不了** `width`/`height` 沒漏——缺 `width`/`height` 的 throw 在
`node_modules/next/dist/shared/lib/get-img-props.js` **第 267–276 行**（`"width"` 在第 268、`"height"` 在第 273），
整段包在第 240 行的 `if (process.env.NODE_ENV !== "production")` 內（⚠️ plan §2 寫的 253–262 是錯的，
plan-review 已更正，我本輪 `sed -n` 複讀確認為 267–276）。⇒ 由 P4／P5 的實際開頁佐證。

### P3-b 產物層佐證裁決 ①丙（在 P4 起 dev **之前**跑，dev 會覆寫 `.next/`）

```
$ grep -rEo "[\"'(]/_next/image\?" .next/server/app | head
（無輸出）
exit=0
```
配對正控兩條（證明 grep 抓得到、且樣式能區分本地／外部）：
```
$ grep -rlo "namelessrealms.com/_next/image" .next/server/app | head
.next/server/app/modServer.html
.next/server/app/modServer/page.js
exit=0
$ grep -rlo "/images/logo.png" .next/server/app | head
.next/server/app/team.html
.next/server/app/apply.html
.next/server/app/page.js
.next/server/app/_not-found.html
.next/server/app/index.html
.next/server/app/staff.html
.next/server/app/launcher.html
.next/server/app/donate.html
.next/server/app/modServer.html
.next/server/app/apply/page.js
exit=0
```
⇒ production build 產物裡**沒有任何本地 `/_next/image?` 端點**；`/modServer` 那兩個 `_next/image` 是**外部正式站的字面 URL**（既有現況、⛔ 本包不改）。
⚠️ 這**仍⛔ 不是** Docker 映像內的實測（見「仍未驗」第 1 條）。

### P4 實際開頁（dev server `yarn dev -p 3100`，起之前 `lsof -iTCP:3100 -sTCP:LISTEN` 實查空閒）

**終端 log 全文**（`grep -nE "⨯|Error:|Unhandled|error"` → **無命中、exit=1**）：
```
 ▲ Next.js 14.1.0
 - Local:        http://localhost:3100
 - Environments: .env.local
 ✓ Ready in 656ms
 ○ Compiling / ...
 ✓ Compiled / in 882ms (626 modules)
 ✓ Compiled /sponsor in 218ms (628 modules)
 ✓ Compiled /team in 52ms (634 modules)
 ✓ Compiled /modServer in 67ms (646 modules)
 ✓ Compiled /api/auth/[...nextauth] in 171ms (562 modules)
 ✓ Compiled /not-found in 199ms (886 modules)
```
⚠️ log 只出現 `.env.local` 這個**檔名**、⛔ 無任何值。

**瀏覽器 console（四頁逐頁，實際擷取）**——用 CDP `Runtime.consoleAPICalled` / `Log.entryAdded` / `Runtime.exceptionThrown` 全量收集：

| 頁 | 實際 console 內容 |
|---|---|
| `/` | `[log.error] Failed to load resource: …404… https://grainy-gradients.vercel.app/noise.svg`、`[console.info] Download the React DevTools…` |
| `/sponsor` | 同上兩行 |
| `/team` | 同上兩行 |
| `/modServer` | 只有 `[console.info] Download the React DevTools…` |

- ⛔ **沒有** `Image is missing required "src" property`。
- ⛔ **沒有** `has either width or height modified, but not the other`（plan-review ⛔1 要求加驗的那條）。
- **乾淨載入下⛔ 沒有** LCP `Please add the "priority" property` 警告（我四頁逐頁擷取的結果如上表）。
  ⚠️ **2026-09-12 補記（第三方獨立補跑 `docs/tasks/F9-thirdparty-recheck.md` 回報）**：第三方在**乾淨載入**下同樣**⛔ 沒有**這條警告（與我一致），
  **但**它第一次讀**累積緩衝**時曾見到一條 `/images/team.png` 的 LCP `console.warn`。
  ⇒ 那是 plan／P4 過線標準第 2 條**明文允許的警告**、⛔ 不影響過線判準；**來源⛔ 未查明**。
  ⛔ 不得把這件事寫成「已排除」，也⛔ 不得寫成「本輪有 LCP 警告」——兩者都不是實情。
- ⛔ **沒有** Next 錯誤覆蓋層（同頁查 `document.querySelectorAll('nextjs-portal').length` 得 `0`）。
- ⚠️ 那個 404 是**既有**的：它是 CSS `bg-[url('https://grainy-gradients.vercel.app/noise.svg')]` 這個外部裝飾圖，
  **改前的 HEAD 版（`before-index` 階段）逐頁 console 出現一模一樣的三筆**（見 P6-1）⇒ ⛔ 與 F9 無關。
- ⚠️ **「0 命中」的配對正控**：同一套擷取在同一批頁面**抓到了** 404 與 info 兩類訊息 ⇒ 它不是「沒在看」。
  另有**主動 canary**：把 #2 的 `h-auto` 拿掉再跑一次（見下方「裁決 ⑨ 的實測」），
  console 仍然沒有那條警告 ⇒ 該警告在本 repo 的條件下**根本不會觸發**，⛔ 不能只靠它當判準，故另以 JSON `rect` 逐欄比對為主證。

**每張圖都有顯示**：`after/*.json` 四頁共 20 筆 `complete=true`、`naturalWidth` 全非 0（逐筆見 P5(c) 表）。

### P5 外觀證據：改後 + 前後 diff

**取得方式（⚠️ 與基線同一把尺，逐項交代）**
- 度量：**`docs/tasks/F9-evidence/metrics.js` 原檔，一個字都沒改**（`git add` 進 git 的就是它）。
  透過 CDP `Runtime.evaluate(replMode)` 把該檔**原文**送進頁面執行，回傳字串原樣落檔。
  ⚠️ README 第 9–10 行明文允許「瀏覽器 console 或自動化工具皆可」。
- 視窗：CDP `Emulation.setDeviceMetricsOverride 1280×900`，四份 `after/*.json` 的 `viewport` 欄實測皆 `[1280,900]`，與基線同。
- **⚠️ 儀器可重現性的正控（這是本輪最強的一條）**：
  - `/sponsor`、`/team`、`/modServer` 三頁在 HEAD 與工作樹是**同一份原始碼**。我用自己的儀器對 HEAD 版（`before-index/`）跑出來的 JSON，
    與主迴圈 2026-09-10 落檔的 `before/` **逐欄完全相同**（`diff <(jq -S . …) <(jq -S . …)` 三頁皆 `exit=0`）。
  - PNG 更直接：`before-index/{sponsor,team,modServer}.png` 與 `before/` 對應檔**SHA-256 完全相同**。
  ⇒ 「改後與改前的差異」⛔ 不是換人換工具造成的。
- **程序性前置（改前／改後對稱，⛔ 不是改腳本）**：逐段捲動到底（每次 0.8×視窗高、間隔 300ms）→ 等所有 `img.complete` → 捲回頁首 → **確認 `scrollY===0`** 才貼 `metrics.js`。
  ⚠️ **我改掉了 plan 寫的「一次捲到底、等 2 秒、捲回頂」**，原因是實測發現：一次跳到底會**跳過中段**，
  `loading="lazy"` 的圖（例如 `/` 的 `launcher.png`）永遠不進視窗 ⇒ `complete:false`、`naturalWidth:0`，
  那是**量測程序的假陰性**、⛔ 不是版面差異。
  ⚠️ **對稱性的證明**：改用新前置後重跑 HEAD 版的 `before-index/` 四檔，與舊前置產生的四檔**位元組完全相同**
  （`diff` 四頁皆無差異）⇒ 前置換法對 HEAD 版（`loading:auto`）**不影響任何欄位**。
  ⚠️ 另一個一開始量錯的點：`metrics.js` 的 `rect` 是 `r.top + scrollY`，若量測時不在頁首，**fixed 的 Navbar 兩筆會整個偏移**
  （我第一次跑出 `y=2251`）。修正後 `scrollY-before-metrics=0` 四頁皆是，`y` 回到 `37`。

**(a) 逐欄 diff（剔除 `loading`／`decoding`）**
```
$ for p in home sponsor team modServer; do diff <(jq -S '.imgs | map(del(.loading,.decoding))' before/$p.json) <(jq -S '.imgs | map(del(.loading,.decoding))' after/$p.json); done
== home       （無輸出）exit=0
== sponsor
68c68
<     "className": "w-12 object-contain brightness-0 invert",
---
>     "className": "w-12 h-auto object-contain brightness-0 invert",
exit=1
== team       （無輸出）exit=0
== modServer  （無輸出）exit=0
```
再把 `className` 也剔除：
```
$ diff <(jq -S '.imgs | map(del(.loading,.decoding,.className))' before/sponsor.json) <(jq -S '.imgs | map(del(.loading,.decoding,.className))' after/sponsor.json)
（無輸出）
exit=0
$ jq -r '.imgs[3].className' before/sponsor.json → w-12 object-contain brightness-0 invert
$ jq -r '.imgs[3].className' after/sponsor.json  → w-12 h-auto object-contain brightness-0 invert
$ jq -c '.imgs[3].rect' before/sponsor.json → {"x":882,"y":1913,"w":48,"h":30.16}
$ jq -c '.imgs[3].rect' after/sponsor.json  → {"x":882,"y":1913,"w":48,"h":30.16}
```
⇒ `src`／`currentSrc`／`alt`／`complete`／`naturalWidth|Height`／`rect`／`objectFit`／`opacity`／`filter`／`borderRadius`／`padding` **四頁逐欄逐字相同**。

**逐項說明「預期差異」**

| # | 差異 | 為什麼是預期的 |
|---|---|---|
| 1 | `loading` 由 `auto` → `lazy`（**全 20 筆**） | `next/image` 非 `priority` 一律 `loading="lazy"`。裁決要求最小改法 ⇒ ⛔ 不加 `priority` |
| 2 | `decoding` 由 `auto` → `async`（**全 20 筆**） | `next/image` 固定輸出 `decoding="async"` |
| 3 | `after/sponsor.json` `i:3` 的 `className` 多 ` h-auto` | **裁決 ⑨甲**明示要加。⚠️ 同筆 `rect` 完全相同（48×30.16）⇒ ⛔ 沒有版面差異 |
| 4 | `before-index/`、`after-index/` 的 `home` 比主樹 `before/`、`after/` **多一筆 img、`docHeight` 3520 vs 3114** | index（HEAD）版的 `servers` 陣列有資料、工作樹版被清空 ⇒ **兩組數字⛔ 不可直接互比**，各自與自己那棵樹的改前對照 |
| 5 | `#10` 那筆（`after-index/home.json` `i:5`）的 `className` 與主樹工作樹版**不同** | HEAD 版是 `w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0`；工作樹版是 `absolute inset-0 h-full w-full object-cover opacity-65`。兩版各自原樣保留、⛔ 不互相對齊（裁決 0：ServerSection 只收 img 那幾行） |
| 6 | `before/home.png` 與 `after/home.png` 的 SHA-256 不同 | **背景影片畫格**造成的擷取雜訊，⛔ 不是版面差異——**對照實驗已落檔**於 `docs/tasks/F9-evidence/after-recheck/`（見下方「同碼連拍對照」） |

**(b) 版面總高不變**
```
home       before=3114 after=3114
sponsor    before=2524 after=2524
team       before=1870 after=1870
modServer  before=3842 after=3842
exit=0
```

**(c) `loading`/`decoding`/`complete`/`naturalWidth`（`after/`，逐筆）**
```
home:      0..4  lazy async complete=true nat=1024,1024,1024,989,1024
sponsor:   0..3  lazy async complete=true nat=1024,1024,891,226
team:      0..5  lazy async complete=true nat=1024,1024,1920,512,476,512
modServer: 0..4  lazy async complete=true nat=1024,1024,989,894,706
```

**(d) 沒有任何一張走本地最佳化端點**
```
$ for f in before/*.json after/*.json; do grep -o 'localhost:3100/_next/image' "$f" | wc -l; done
before/home 0  before/modServer 0  before/sponsor 0  before/team 0
after/home  0  after/modServer  0  after/sponsor  0  after/team  0
```
**配對正控**（證明 grep 抓得到東西、樣式對）：
```
$ for f in before/*.json after/*.json; do grep -o '"currentSrc":"http' "$f" | wc -l; done
before: home 5 / modServer 5 / sponsor 4 / team 6
after:  home 5 / modServer 5 / sponsor 4 / team 6
```
⚠️ 任務包原本寫的 `grep -c "_next/image" after/*.json` 預期「四檔皆 0」**永遠達不到**
（`/modServer` 兩張圖的 `src` 本來就是正式站的 `_next/image` URL，且 JSON 是單行、`grep -c` 數的是行數）；
正控樣式 `'"currentSrc": "http'`（冒號後有空格）在 `JSON.stringify` 無縮排輸出下命中 0。**兩者我都實跑確認過**，故照 plan 修正版執行。

**(e) `srcSet` 沒被加上**（`metrics.js` 無此欄 ⇒ 另跑一次現場觀察，四頁 20 筆）
```
alt                                srcset  width height loading decoding
Nameless Realms Logo               (null)  1024  1024   lazy    async     ← 各頁 ×2
Sponsor                            (null)  891   914    lazy    async
PayPal                             (null)  226   142    lazy    async
Team                               (null)  1920  1080   lazy    async
Yu // 無名 / Moon_Flame // 月焰 / liujuhsin // 嚕嚕訊
                                   (null)  512   512    lazy    async
長期開服，服務不間斷 / 即將推出，社群啟動器
                                   (null)  1024  1024   lazy    async
全年無休… / 讓玩家透過投票… / 定期更換…
                                   (null)  1024  1024   lazy    async
```
⇒ `srcset` 全為 `null`（裁決 ①丙 生效）；`width`/`height` 與改法表逐筆相符。
⚠️ **無改前對照**（`<img>` 本來就沒有 `srcset`），這是改後的現場觀察。

**(f) PNG 雜湊（裁決 ⑥乙：PNG ⛔ 不進 git，只記路徑 + `shasum -a 256`）**

| 階段 | 檔 | SHA-256 | 尺寸 |
|---|---|---|---|
| before | `docs/tasks/F9-evidence/before/home.png` | `ffbe59cd9aa91c596488b2e827f6f299d4a1500eef2d977a9468564d230c7063` | 1280×3114 |
| before | `…/before/sponsor.png` | `0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d` | |
| before | `…/before/team.png` | `4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131` | |
| before | `…/before/modServer.png` | `84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3` | |
| **after** | `…/after/home.png` | `cb65a0a32cd4c96f72152f83137ac6f504cc5cdd383b55ba5db8fcc1f6185d79` | 1280×3114 |
| **after** | `…/after/sponsor.png` | `0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d` | **與 before 位元組相同** |
| **after** | `…/after/team.png` | `4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131` | **與 before 位元組相同** |
| **after** | `…/after/modServer.png` | `84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3` | **與 before 位元組相同** |
| before-index（**index 版，非主要證據**） | `…/before-index/home.png` | `daa815cd8b90dcea3079ec9989b1c878f82b94fecff4f117d387a76ef515cf64` | 1280×3520 |
| before-index | `…/before-index/sponsor.png` | `0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d` | |
| before-index | `…/before-index/team.png` | `4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131` | |
| before-index | `…/before-index/modServer.png` | `84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3` | |
| after-index（**index 版，非主要證據**） | `…/after-index/home.png` | `9641dfd5aa15f8977f75c5cbdf648397dfc3af8c6359539b79361829c255fb2f` | 1280×3520 |
| after-index | `…/after-index/sponsor.png` | `0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d` | |
| after-index | `…/after-index/team.png` | `4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131` | |
| after-index | `…/after-index/modServer.png` | `84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3` | |

⭐ **`/sponsor`、`/team`、`/modServer` 三頁的改前／改後 PNG 位元組完全相同**（同一雜湊）⇒ 這三頁**像素級零差異**。

**同碼連拍對照（⚠️ 2026-09-12 補拍並落檔）**

⚠️ **據實聲明**：原報告引用的那次同碼連拍**沒有落檔**（當時拍在暫存階段目錄、驗完就刪了），
稽核側因此複核不到那個雜湊——**那是我的錯**（鐵則 8：證據必須耐久）。本次**重拍並落檔**：

```
$ ./capture.sh after-recheck        （程式碼與拍 after/ 時完全相同，一個字都沒改）
home ok 1719961 bytes / sponsor ok 389993 / team ok 447285 / modServer ok 601979
exit=0
$ shasum -a 256 after/*.png after-recheck/*.png
cb65a0a32cd4c96f72152f83137ac6f504cc5cdd383b55ba5db8fcc1f6185d79  after/home.png
84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3  after/modServer.png
0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d  after/sponsor.png
4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131  after/team.png
5cf5806efc7041e1748594e64845ef7a69221cefe586b4653b2209530967d126  after-recheck/home.png
84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3  after-recheck/modServer.png
0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d  after-recheck/sponsor.png
4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131  after-recheck/team.png
exit=0
$ sips -g pixelWidth -g pixelHeight after-recheck/home.png → 1280 × 3114
```
⇒ **同一份原始碼、同一支腳本，連拍兩次**：`sponsor`／`team`／`modServer` 三張**位元組完全相同**，
只有 `home.png` 不同（`cb65a0a3…` vs `5cf5806e…`）⇒ **`home.png` 的雜湊差異是背景影片畫格的擷取雜訊，⛔ 不是版面差異**。
⚠️ 這次的雜湊（`5cf5806e…`）與我原報告提到的那次（`e40936a1…`）本來就**不會相同**——那正是這個對照要證明的事。
⚠️ `after-recheck/` 的 4 張 PNG 依裁決 ⑥乙 同樣**⛔ 不進 git**，是**預期的 `??`**（P8 對帳表已列）。
⚠️ `before-index`／`after-index` 的 `sponsor/team/modServer` 三張**與主樹四張同雜湊**（同碼同腳本）⇒ 它們對架構師人工看圖⛔ 沒有額外資訊，**只有 `home.png` 一張是 index 版要看的**。

**`capture.sh` 高度參數的處置（依 plan-review 待裁 3 放行條件）**
- 動的是**參數**、⛔ 不是方法：`capture.sh` 第 8 行 `H[home]` 由寫死的 `3114` 暫時改為 **3520**。
- 為什麼要改：index 版 `/` 多渲染一張伺服器卡片，實測 `docHeight=3520`，而 #10 那張圖 `rect.y=2831`、`h=378.5`（底 3209.5）
  ⇒ 用 3114 拍會把它**整個裁在畫面外**，裁決 ⑤甲 要的證據就拿不到。
- 條件 (a)**同一棵樹改前改後同一個值**：`before-index` 與 `after-index` 都用 3520；主樹 `before`／`after` 都用原本的 3114。
- 條件 (b)**用 `.bak` 還原、`diff` 證明**：
  ```
  $ cp capture.sh capture.sh.bak      → 兩檔皆 1295 B
  $ cp capture.sh.bak capture.sh; diff capture.sh capture.sh.bak
  （無輸出）diff-exit=0
  $ sed -n '8p' capture.sh
  typeset -A H; H=( home 3114 sponsor 2524 team 1870 modServer 3842 )
  $ rm capture.sh.bak                 exit=0
  $ wc -c capture.sh                  1295
  ```
  ⛔ 全程未用 `git checkout`。`capture.sh.bak` **已刪**、⛔ 不在 `git status`（P8 對帳）。
- 條件 (c)：**index 版的高度與工作樹版不同，原因是 index 版多渲染一張伺服器卡片**，⇒ 兩組 PNG ⛔ 不可直接互比。
- 採 plan-review 建議 3 的**甲案**（暫時覆寫），⛔ 未採乙案（腳本改讀 JSON `docHeight`）——理由：乙案會改動 `capture.sh` 本身，
  而 `before/` 四張 PNG 是用**現行版本**拍的；改腳本會讓進 git 的版本與拍出基線的版本不一致。

### P6 index 版本（commit 內容）另樹 lint + build + #10 證據

**P6-1 改動前拍 index 基線**（worktree 於 HEAD，`git status --short` 無輸出＝乾淨）
- `before-index/home.json`：`imgs` **6 筆**（比主樹 `before/home.json` 的 5 筆多一筆），`docHeight=3520`，
  第 6 筆 `alt=模組包生存伺服器`、`src=/images/server_01.png`、`rect={x:125,y:2831,w:430.5,h:378.5}`、`loading=auto`、`complete=true`、`naturalWidth=1920`。
  ⇒ plan §9 第 10 條（「應多 1 筆、共 6 筆」是推算）**已由實跑證實**。
- 四頁 console 與主樹改後完全同型（三頁各一筆 `grainy-gradients` 404 + info；`/modServer` 只有 info）⇒ 該 404 為既有。

**P6-2 套改動**
```
$ git status --short    （worktree）
 M .eslintrc.json
 M app/sponsor/page.tsx
 M app/team/page.tsx
 M components/FeatureRow.tsx
 M components/FeatureSection.tsx
 M components/HomeHero.tsx
 M components/Navbar.tsx
 M components/ServerSection.tsx
 M next.config.js
exit=0
```
⇒ **恰 9 檔**，⛔ 無 `app/layout.tsx`、⛔ 無 `app/staff/page.tsx`；symlink 的 `node_modules`／`.env.local`／`.next` 都被 `.gitignore` 擋住、⛔ 沒出現在 `git status`。
worktree 端 `git diff --numstat` 與主樹逐檔相同，`components/ServerSection.tsx` 為 `2 1`。

**P6-3 index 版本的 lint 與 build**
```
$ yarn lint --max-warnings 0     ✔ No ESLint warnings or errors   exit=0
$ yarn build                     ✓ Compiled successfully … Done in 9.00s.   exit=0
```
**負向對照（證明這棵樹的 lint 真的在跑）**：worktree 內建同一份 `data/lintCanary.tsx`
```
$ yarn lint --max-warnings 0
./data/lintCanary.tsx  3:10  … @next/next/no-img-element
exit=1
$ rm data/lintCanary.tsx; ls data/ → modpackHistory.ts news.ts staff.ts；git status --short → 仍是那 9 檔
```
⚠️ 據實：index 版的 lint／build 是在**symlink 的 `node_modules`** 下通過的，⛔ 不宣稱等同乾淨安裝。

**⚠️ 2026-09-12 補一條機器判準：worktree 的九個檔 = 主樹 index 的九個 blob**
（原報告只靠「我把同一批檔 `cp` 過去」的程序性說法，⛔ 沒有機器證明——這條補上之後，
「worktree 的 lint／build 通過」才等於「**commit 內容**的 lint／build 通過」。我自己實跑：）
```
$ for f in <九個檔>; do S=$(git ls-files -s "$f" | awk '{print $2}'); W=$(git hash-object "…/nrw-f9-index/$f"); …; done
.eslintrc.json                 staged=a2569c2c7ca0ae6414f77d03ad45925598a4733e worktree=同  SAME
next.config.js                 staged=ec722a311fb10a4755540693f84f83e4d35bc979 worktree=同  SAME
app/sponsor/page.tsx           staged=8ba64f736c74c40ec6635a1aa218ea67357bd772 worktree=同  SAME
app/team/page.tsx              staged=11c4484cd0f03241097a91543320b3402dbe9fe4 worktree=同  SAME
components/FeatureRow.tsx      staged=cd3f1b4fc3a58d6abcf0d86e01c64c1be1de5352 worktree=同  SAME
components/FeatureSection.tsx  staged=af09fce66a65ae336a8ad5b74b5cbbaaaed647cf worktree=同  SAME
components/HomeHero.tsx        staged=c05c05a3b87b95ed7db24de46b8010b5ceb1f9af worktree=同  SAME
components/Navbar.tsx          staged=c781c82d07e730f43fbe9a2a59aa2e14bfd48e98 worktree=同  SAME
components/ServerSection.tsx   staged=73c40574a982925d64f50fc3caa58aeb8ca2d486 worktree=同  SAME
exit=0
```
⇒ **九個檔全部 `SAME`**（`ServerSection.tsx` 那個雜湊正是 P6-5 `hash-object -w` 印出的 `$BLOB`）。
⚠️ 這條判準是**第三方補跑先提出的**（見 `docs/tasks/F9-thirdparty-recheck.md`）；上面的數值是**我自己重跑量到的**，⛔ 不是轉抄。

**P6-4 拍 #10 改後**
```
$ for p in home sponsor team modServer; do diff <(jq -S '.imgs|map(del(.loading,.decoding))' before-index/$p.json) <(jq -S '.imgs|map(del(.loading,.decoding))' after-index/$p.json); done
== home       （無輸出）exit=0
== sponsor    只有 className 多 h-auto（同主樹）exit=1
== team       （無輸出）exit=0
== modServer  （無輸出）exit=0
docHeight: home 3520→3520 / sponsor 2524→2524 / team 1870→1870 / modServer 3842→3842
```
**#10 那筆逐欄**：
```
before-index: rect={x:125,y:2831,w:430.5,h:378.5} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0" loading=auto  complete=true nat=1920
after-index : rect={x:125,y:2831,w:430.5,h:378.5} className=（同上，逐字相同）                                                     loading=lazy complete=true nat=1920
```
⇒ **commit 內容那張圖的版面零差異**，唯一差異是 `loading`。

**P6-5 寫 index（⛔ 不用 `git add`／`git stash`／`git checkout`／`git add -p`）**
```
$ git ls-files -s components/ServerSection.tsx          （寫入前）
100644 1be7861ffeefb452bfb1f119acee5f42221ca415 0	components/ServerSection.tsx
$ BLOB=$(git hash-object -w "…/nrw-f9-index/components/ServerSection.tsx"); echo "blob=$BLOB"
blob=73c40574a982925d64f50fc3caa58aeb8ca2d486
exit=0
$ git update-index --cacheinfo "100644,73c40574a982925d64f50fc3caa58aeb8ca2d486,components/ServerSection.tsx"
exit=0
```
**三條機器判準（plan-review ⛔2），全部通過**：
```
① $ git diff --cached --numstat components/ServerSection.tsx
2	1	components/ServerSection.tsx            ← 逐字相符（tab 分隔）
exit=0
② $ git diff --cached components/ServerSection.tsx | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)'
+import Image from 'next/image';
-                        <img src={s.image} alt={s.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0" />
+                        <Image src={s.image} alt={s.name} width={1920} height={1031} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0" />
exit=0                                              ← 恰三行
③ $ git ls-files -s components/ServerSection.tsx
100644 73c40574a982925d64f50fc3caa58aeb8ca2d486 0	components/ServerSection.tsx
exit=0                                              ← mode 不變 100644、blob = 上面印出的 $BLOB
```
**禁字清單（負向對照，含前提檢查與配對正控）**：
```
（寫入前，前提：這些字在 HEAD 版必須是 0 命中）
$ git show HEAD:components/ServerSection.tsx | grep -cE 'opacity-65|any\[\] = \[\]|min-h-\[260px\]|max-w-6xl'
0            （grep -c 無命中時 exit=1 是正常的；證據是這個 0）
（寫入後）
staged diff 禁字命中=0
工作樹 diff 禁字命中（配對正控，應非 0）=3
```
⇒ **index 裡⛔ 沒有任何一行工作樹的舊改動**，而同一條 grep 在工作樹 diff 上會命中 3 次 ⇒ 它不是空測。

### P7 既有註解全稱比對（守則 8，⛔ 不抽查）

**(a) 整檔 diff**（`git show "HEAD:$f" | diff - "$f"`，⚠️ 2026-09-12 補上實際輸出全文；八檔各 `exit=1`＝有差異才對）
```
== app/sponsor/page.tsx
4a5
> import Image from 'next/image';
38c39
<             <img
---
>             <Image
40a42,43
>               width={891}
>               height={914}
162c165
<                     <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" className="w-12 object-contain brightness-0 invert" />
---
>                     <Image src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" width={226} height={142} className="w-12 h-auto object-contain brightness-0 invert" />
exit=1
== app/team/page.tsx
2a3
> import Image from "next/image";
28c29
<             <img
---
>             <Image
30a32,33
>               width={1920}
>               height={1080}
42c45
<                 <img
---
>                 <Image
44a48,49
>                   width={512}
>                   height={512}
exit=1
== components/FeatureRow.tsx
2a3,4
> import Image from 'next/image';
> 
33c35
<                     <img
---
>                     <Image
35a38,39
>                         width={1024}
>                         height={1024}
exit=1
== components/FeatureSection.tsx
2a3,4
> import Image from 'next/image';
> 
46c48
<               <img
---
>               <Image
48a51,52
>                 width={1024}
>                 height={1024}
exit=1
== components/HomeHero.tsx
2a3,4
> import Image from 'next/image';
> 
24c26
<           <img src="/images/logo.png" alt="Nameless Realms Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-4 drop-shadow-[0_0_30px_rgba(255,125,0,0.3)]" />
---
>           <Image src="/images/logo.png" alt="Nameless Realms Logo" width={1024} height={1024} className="w-32 h-32 md:w-48 md:h-48 object-contain mb-4 drop-shadow-[0_0_30px_rgba(255,125,0,0.3)]" />
exit=1
== components/Navbar.tsx
4a5
> import Image from 'next/image';
29c30
<           <img src="/images/logo.png" alt="Nameless Realms Logo" className="w-10 h-10 object-contain" />
---
>           <Image src="/images/logo.png" alt="Nameless Realms Logo" width={1024} height={1024} className="w-10 h-10 object-contain" />
79c80,82
<               <img src={session.user?.image || ""} alt="Avatar" className="w-8 h-8 rounded-full border border-brand-primary" />
---
>               {session.user?.image && (
>                 <Image src={session.user.image} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full border border-brand-primary" />
>               )}
exit=1
== .eslintrc.json
3,9c3
<   "extends": "next/core-web-vitals",
<   // @next/next/no-img-element 於此關閉:架構師 2026-09-09 裁決① 丙。
<   // 既有 10 處 <img>(7 檔)本次未修,已列 backlog 建議(見 docs/tasks/F8-verification.md)。
<   // ⚠️ 此規則自此對全 repo 不被檢查——在該 backlog 完成前,這個洞一直在。
<   "rules": {
<     "@next/next/no-img-element": "off"
<   }
---
>   "extends": "next/core-web-vitals"
exit=1
== next.config.js
4a5
>     images: { unoptimized: true },
exit=1
```
⇒ 差異**只有** import 行、`<img>`→`<Image>` 那幾行與新增的 `width`/`height`、
`.eslintrc.json` 的 `rules` 與三行註解、`next.config.js` 的 `images` 那一行。⛔ 沒有任何其他行被動到。

**(b) 全稱比對**（`git show HEAD:<檔> | grep -nE '//|/\*|\*/'` 的**每一行**用 `grep -Fqx` 整行逐字回查現行檔）
```
== app/sponsor/page.tsx
MISSING 162:                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" className="w-12 object-contain brightness-0 invert" />
== app/team/page.tsx            （無）
== components/FeatureRow.tsx    （無）
== components/FeatureSection.tsx（無）
== components/HomeHero.tsx      （無）
== components/Navbar.tsx        （無）
== .eslintrc.json
MISSING 4:  // @next/next/no-img-element 於此關閉:架構師 2026-09-09 裁決① 丙。
MISSING 5:  // 既有 10 處 <img>(7 檔)本次未修,已列 backlog 建議(見 docs/tasks/F8-verification.md)。
MISSING 6:  // ⚠️ 此規則自此對全 repo 不被檢查——在該 backlog 完成前,這個洞一直在。
== next.config.js               （無）
```
**逐條判定**：

| MISSING | 判定 |
|---|---|
| `.eslintrc.json` 第 4／5／6 行三條 | **既有註解**，依**裁決 ⑧甲明示刪除** ⇒ 合規 |
| `app/sponsor/page.tsx` 第 162 行 | **⛔ 不是註解**——它是 PayPal 的 `<img>` 行，因為含 `https://` 而被刻意過寬的樣式抓到；它正是本包**明示改動**的 10 處之一 ⇒ 合規 |

⇒ **⛔ 沒有任何既有註解被靜默改動**。`components/Navbar.tsx` 第 79 行（`session.user?.image || ""` 那行）
本身不含 `//`、`/*`、`*/`，**⛔ 不會**出現在 MISSING（實跑結果確實沒有）。

**⚠️ 空測自查（樣式抓到幾行）**：
```
app/sponsor/page.tsx  6   app/team/page.tsx  4   components/FeatureRow.tsx  0
components/FeatureSection.tsx 2   components/HomeHero.tsx 5   components/Navbar.tsx 5
.eslintrc.json 3   next.config.js 2
```
⇒ **`components/FeatureRow.tsx` 是 0**，它的「無 MISSING」是**空測**（該檔 HEAD 版本來就沒有任何含註解記號的行）。
該檔改動無害的依據改以 (a) 的整檔 diff 為準（只有 `+import Image from 'next/image';`、`+`空行、`<img>`→`<Image>`、`+width`/`+height` 兩行）。其餘七檔皆有實際比對行數 ⇒ 非空測。

**(c) `components/ServerSection.tsx`**（用 worktree 版，⛔ 不用整檔 diff——工作樹 vs HEAD 本來就是 174 行 diff）
```
$ cd nrw-f9-index && git show "HEAD:components/ServerSection.tsx" | grep -nE '//|/\*|\*/' | while …; done
（無 MISSING）exit=0
$ git show "HEAD:components/ServerSection.tsx" | grep -cE '//|/\*|\*/'
5                ← 樣式實際抓到 5 行 ⇒ ⛔ 不是空測
```

### P8 git 對帳（commit 前）

```
$ git log --oneline -1
df2b8ff chore(claude): NR-D8 稽核鑑別力兩條——nr-auditor 鐵則 9/10 + 兩份驗收模板錨點行
$ git rev-parse HEAD          df2b8ffd3e61dbf77cec0760e37ae49daa260f2e
$ git rev-parse origin/developers  df2b8ffd3e61dbf77cec0760e37ae49daa260f2e
⇒ 本地 = 遠端；本輪的改動**尚未 commit、尚未 push**。
$ git status --porcelain data/    （無輸出）exit=0   ← canary 二次確認
```

| 狀態 | 路徑 | 說明 |
|---|---|---|
| `M ` staged | `.eslintrc.json`、`next.config.js`、`app/sponsor/page.tsx`、`app/team/page.tsx`、`components/FeatureRow.tsx`、`components/FeatureSection.tsx`、`components/HomeHero.tsx`、`components/Navbar.tsx` | 逐檔 `git add`（每條指令單獨一次、各取 `$?`），⛔ 未用 `git add .` |
| `MM` | `components/ServerSection.tsx` | index = HEAD+2 行（`update-index` 寫入）；工作樹仍帶長期未 commit 舊改動 ⇒ **`MM` 是預期的** |
| `A ` | `docs/tasks/F9-plan.md`、`docs/tasks/F9-verification.md` | |
| `A ` | `docs/tasks/F9-evidence/{before,after,before-index,after-index}/*.json`（16 檔） | 裁決 ⑥乙 |
| `A ` | `docs/tasks/F9-evidence/README.md`、`metrics.js`、`capture.sh`、`before/MD5SUMS.txt` | 架構師 2026-09-11 裁「要進 git」 |
| ` M` **未 staged** | `app/layout.tsx`、`app/staff/page.tsx` | ⛔ 本包一個字都沒動、⛔ 未進 staging |
| `??` **預期的未追蹤（PNG）** | 我產的 **20 張**：`docs/tasks/F9-evidence/before/`、`…/after/`、`…/before-index/`、`…/after-index/`、`…/after-recheck/`（2026-09-12 補拍的同碼連拍對照）各 `{home,sponsor,team,modServer}.png`<br>第三方產的 **8 張**：`…/thirdparty/burst1/`、`…/thirdparty/burst2/`<br>**合計 28 張**（我自己實跑 `git status --porcelain -uall \| grep "^??" \| grep -c "\.png$"` 得 **28**） | 裁決 ⑥乙：PNG ⛔ 不進 git，收案時由主迴圈搬離 |
| `??` 預期 | `.claude/launch.json`、`docs/tasks/F9.md`、`docs/tasks/F9-background.md`、`docs/tasks/F9-plan-review.md` | 由主迴圈／規劃側收案處理 |
| `??` 預期（**⛔ 不是我產的**，2026-09-12 補記） | `docs/tasks/F9-verification-audit.md`（稽核側）、`docs/tasks/F9-thirdparty-recheck.md` 與 `docs/tasks/F9-evidence/thirdparty/`（主迴圈另派的第三方補跑） | 由主迴圈收案處理：該目錄的**文字檔會進 git**、**8 張 PNG ⛔ 不進**（沿裁決 ⑥乙）。⛔ 我沒有動它們 |
| ` M` **未 staged**（**⛔ 不是我改的**，2026-09-12 補記） | `CLAUDE.md` | 三段改寫由**主迴圈**依架構師裁決套用；本報告「建議的 `CLAUDE.md` 改寫文字」那節寫的是**我提交建議當下**的狀態（我確實沒有改它） |
| ⛔ 不得出現（實查結果：**都不在**） | `data/lintCanary.tsx`、`docs/tasks/F9-evidence/capture.sh.bak` | canary 與備份檔驗完已刪 |

---

## 裁決 ⑨ 的實測（⚠️ 據實記錄：前提不成立，但已照裁決執行）

- **已照裁決 ⑨甲執行**：`app/sponsor/page.tsx` 第 165 行 className 加了 `h-auto`。
- **但實測顯示「不加會變 48×142」的前提不成立。** 我做了主動 canary（備份檔紀律）：
  1. `cp app/sponsor/page.tsx <scratchpad>/sponsor.page.tsx.bak`（12087 B）
  2. `sed` 把 `w-12 h-auto object-contain …` 改回 `w-12 object-contain …`
  3. 重跑同一支 `metrics.js`：`i:3` 的 `rect` 仍是 **`{"x":882,"y":1913,"w":48,"h":30.16}`**，console **沒有**
     `has either width or height modified, but not the other`
  4. `cp <bak> app/sponsor/page.tsx; diff` → **無輸出、exit=0**（還原無誤，⛔ 未用 `git checkout`）
  5. 還原後重跑，`after/sponsor.json` 回到含 `h-auto` 的版本
- **原因（我實查到的）**：TailwindCSS 的 preflight 已對全站下了
  ```css
  img,
  video {
    max-width: 100%;
    height: auto;
  ```
  （我 `curl http://localhost:3100/_next/static/css/app/layout.css` 實讀到這段）
  ⇒ 作者樣式表的 `height:auto` 本來就蓋過 `height="142"` 這個呈現提示，**不論有沒有 `h-auto`**。
- **結論**：`h-auto` 在本 repo 是**冗餘但無害**的（與 #3 `app/team/page.tsx` 的既有寫法一致），
  代價是 `after/sponsor.json` 多一欄 className 差異。
- **⚠️ 2026-09-12 補記（由主迴圈轉達）**：架構師在**被告知「原前提不成立」之後**仍裁決「**留**」
  ⇒ 這是**知情後的重新確認**，⛔ 不是「前提成立」。現況維持有 `h-auto`，⛔ 我沒有改回。
  ⚠️ 正式的裁決記錄由**規劃側**回填 `docs/tasks/F9-plan-review.md`，⛔ 不是本檔、⛔ 不是我寫。

---

## 審計確認

- ⛔ 未新增任何 `console.log`／`console.error`；本包⛔ 沒有動 Route Handler、⛔ 沒有動 `middleware.ts`。
- ⛔ `.env.local` 全程未讀值、未印出、未貼進任何檔；worktree 只用 `ls -la` 確認 symlink 存在。
- dev server log 只出現 `Environments: .env.local` 這個**檔名**提示，⛔ 無任何值。

## 產物重建

- [x] 改過原始碼 → 已跑 `yarn build`（主樹 `Done in 9.92s. exit=0`；**worktree/index 版另跑一次** `Done in 9.00s. exit=0`）
- [x] 無跨 repo 依賴
- ⚠️ `yarn install --frozen-lockfile` 實跑 `exit=0`，`git diff --stat yarn.lock package.json` **無輸出**（裁決 ②甲）

## CI

- 本地：`yarn lint --max-warnings 0` → **綠（exit=0）**；`yarn build` → **綠（exit=0）**。
- ⚠️ 依 `CLAUDE.md`「CI 現況」：本專案⛔ 沒有 build/lint CI ⇒ 以上為收案標準，⛔ 未打任何 tag。
- ⚠️ 「綠」必須連同兩個負向對照一起引用：**N0**（改前同一條 preset 指令 exit=1、10 命中）與
  **N1**（改後 repo 設定 + canary exit=1、1 命中）。⛔ 不得單獨寫「lint 通過」。
- ✅ **`no-img-element` 自本輪起重新生效**（F8 的關閉已移除），且 10 處已全部換掉。

---

## 真機 E2E（#9 Navbar 登入頭像）——⏳ **待人工，由主迴圈逐步帶架構師執行**

> ⚠️ **⛔ 不是我做的、⛔ 我沒有驗過。** 它需要 `ADMIN_DISCORD_ID` 本人登入，
> ⛔ 不得用假帳號／假資料替代。素材已備齊（`metrics.js` 路徑、URL、期望值），⛔ 不得叫架構師自備。
> ⚠️ **一次只給一步，等回報結果才給下一步。**
> ⚠️ 裁決 ④甲(b) 明文：**#9 為改後對期望值，⛔ 無改前基線**（基線由主迴圈在未登入狀態拍）。

| # | 步驟 | 過線標準 | 結果 |
|---|------|----------|------|
| 1 | 在 repo 根目錄跑 `yarn dev -p 3100`（⚠️ 先確認 3100 空閒），開 `http://localhost:3100/` 確認首頁正常 | 終端無 `⨯`／`Error:`；首頁顯示 | ⏳ 待人工 |
| 2 | 架構師開 `http://localhost:3100/api/auth/signin`，用**本人 Discord 帳號**登入 | 回到首頁、Navbar 右側出現頭像與登出鈕 | ⏳ 待人工 |
| 3 | 架構師在 DevTools console 貼 `docs/tasks/F9-evidence/metrics.js` **全文**，把回傳字串存成 `docs/tasks/F9-evidence/after/home-signed-in.json`；另截一張 Navbar 區截圖 | 該 JSON 內有一筆 `alt: "Avatar"`，且 `rect.w`／`rect.h` = **32**、`borderRadius` 為圓（`9999px` 或 `50%`）、`currentSrc` 非空且 hostname 為 `cdn.discordapp.com`、`complete: true`、`naturalWidth` 非 0；console **⛔ 無** `Image is missing required "src" property` | ⏳ 待人工 |
| 4 | 架構師登出 | Navbar 回到未登入樣式 | ⏳ 待人工 |

⚠️ `cdn.discordapp.com` 是我從 `node_modules/next-auth/providers/discord.js` 第 18／21 行讀到的**檔案層事實**，
實際回應⛔ 未實查 ⇒ 若拍到別的 hostname，**據實記錄**、⛔ 不改期望值當沒發生。

---

## 回歸守門

- 四頁 20 張圖的 `rect`／`objectFit`／`opacity`／`filter`／`borderRadius`／`padding`／`alt`／`naturalWidth|Height`／`src`／`currentSrc`／`complete` **逐欄與改前相同**。
- `/sponsor`、`/team`、`/modServer` 三頁整頁 PNG **位元組完全相同**。
- 四頁 `docHeight` 不變；index 版四頁 `docHeight` 亦不變。
- `yarn build` 路由表與改前同樣 13 條。`ƒ Middleware` 的值見下方「⚠️ Middleware 數值的更正與未解差異」。
- `yarn.lock`／`package.json` 零變動。

### ⚠️ Middleware 數值的更正與未解差異（2026-09-12 補記）

稽核側在**主樹**實跑 `yarn build` 得 `ƒ Middleware 74.9 kB`，與我原本寫的 `74.8 kB`（主樹）不符。
**我自己重跑了兩次**（⛔ 沒有照抄稽核側的數字）：

```
① 暖 .next 快取重跑
$ yarn build 2>&1 | tail -30
ƒ Middleware                             74.8 kB
Done in 8.64s.
pipestatus=0
② 清掉 .next 後冷跑
$ rm -rf .next && yarn build 2>&1 | grep -E "Middleware|Done in"
ƒ Middleware                             74.8 kB
Done in 12.10s.
pipestatus=0
```
⇒ **我在主樹三次量到的都是 `74.8 kB`**（初次 P3、暖跑、冷跑），⛔ 無法重現 `74.9 kB`。
⚠️ 唯一量到 `74.9 kB` 的是**worktree（index 版）那次 build**——這一點我原報告寫對了。
**原報告錯在把括號寫成「（index 版 74.9 kB）」的並列，讀起來像是兩邊都由我在同一條件下量過**；
實際上那是**兩棵不同的樹**（路徑長度、`app/layout.tsx`／`app/staff/page.tsx`／`ServerSection.tsx` 內容都不同），⛔ 不是同一條件下的兩個值。

**據實記錄**：主樹 = `74.8 kB`（我，三次）；index 版 worktree = `74.9 kB`（我，一次）；稽核側自述在主樹得 `74.9 kB`（**我重現不了**）。
**差異成因未查明**，⛔ 不臆測、⛔ 不遷就任何一方。
為了讓日後的比對不再卡在 0.1 kB 的四捨五入上，另記一個**更細的錨點**（我實測）：
```
$ wc -c .next/server/middleware.js
364620 .next/server/middleware.js
```
⚠️ `Middleware 74.8 kB` 是 Next 自己印的壓縮後估值，與上面這個原始位元組數⛔ 不是同一個量。

---

## 建議的 `CLAUDE.md` 改寫文字（⛔ 我不自己改，交架構師／主迴圈裁）

**(1)「CI 現況」節**——把現行這段
> ⚠️⚠️ **但⛔ 不得單獨寫「lint 通過」**：F8 依裁決① 丙**明確關閉了 `@next/next/no-img-element`**（既有 10 處 `<img>` 未修，見 backlog F9）⇒ 「CI／lint」欄一律據實寫「**綠，但 `no-img-element` 已 off、10 處未修**」。⚠️ 該規則在 F9 完成前**對全 repo 不被檢查**。

建議改寫為：
> ✅ **`@next/next/no-img-element` 已於 2026-09-11（F9）重新生效**：F8 暫時關閉該規則的 `rules` 區塊已從 `.eslintrc.json` 移除（檔案回到 `root` + `extends` 兩鍵），原本的 10 處 `<img>`（7 檔）已全部換成 `next/image`。
> ⚠️ **但仍⛔ 不得單獨寫「lint 通過」**：`exit 0` 不等於該檢查真的跑了 ⇒ 引用時一律連同兩個負向對照：
> ① 改前用 `yarn lint --max-warnings 0 -c node_modules/eslint-config-next/core-web-vitals.js` 應 `exit=1`、10 命中；
> ② 任何時候在 `eslint.dirs` 內放一個含 `<img>` 的 canary 檔，`yarn lint --max-warnings 0` 應 `exit=1`、1 命中（驗完必刪）。
> ⚠️ 全站已設 `images: { unoptimized: true }`（F9 裁決 ①丙）⇒ `next/image` ⛔ 不走最佳化端點、⛔ 不產生 `srcset`；要開最佳化見地雷清單新條目。

**(2) 地雷清單新增一條（草擬）**：
> N. ⚠️ **`output: 'standalone'` + production + 無 `sharp` ⇒ `/_next/image` 端點直接回 500**，而且 **`yarn dev` 與 `yarn build` 都看不出來**。
> 依據：`node_modules/next/dist/server/image-optimizer.js` 第 497–500 行——
> `if (showSharpMissingWarning && nextConfigOutput === "standalone") { log.error(…); throw new ImageError(500, "Internal Server Error") }`。
> ⇒ 本 repo 因此在 `next.config.js` 設 `images: { unoptimized: true }`（F9 裁決 ①丙），讓 `next/image` 原樣輸出 `src`、⛔ 不碰最佳化端點。
> ⚠️ **要開圖片最佳化，必須先加 `sharp`，並同時補 `images.remotePatterns`**（`/modServer` 與 `/sponsor` 都引外部 hostname）；
> ⛔ 不得只把 `unoptimized` 拿掉——本 repo 打 tag 就是發版且沒有 build CI 可擋，這個 500 只有在正式 image 裡才會炸。

**(3) 另一條建議的地雷（本輪親自踩到，⚠️ 與 F9 的改動無關，但會咬到下一個開 worktree 的人）**：
> N+1. ⚠️ **`git worktree` + symlink 的 `node_modules` + `output: 'standalone'`：`next build` 會在
> `.next/standalone/node_modules` 放一個**指向主樹 `node_modules` 的 symlink**（我 `ls -la` 實查到）；
> 之後在同一棵 worktree 跑 `next dev`，它清 `.next` 時會**穿過那個 symlink 把主樹的 `node_modules` 整個清空**
> （本輪實際發生：`ls node_modules | wc -l` 由 351 變 **0**，dev 隨即 `Cannot find module 'next/dist/pages/_app'`）。
> ⇒ **在 worktree 先 `rm .next/standalone/node_modules` 再 `rm -rf .next`，然後才跑 `next dev`**；
> 修復方式是回主樹跑 `yarn install --frozen-lockfile`（本輪實跑 `exit=0`、351 個項目回來）。

**(4) 程式碼地圖⛔ 不動**：7 檔都在圖上、⛔ 無新檔、`lib/` 仍空 ⇒ 非結構性變更。

**(5) 建議另開的 backlog（⛔ 我不自己開）**：
1. 加 `sharp` + `images.remotePatterns` 開圖片最佳化（裁決 ②甲「最佳化另開一筆」）。
2. 鐵則 5 的兩處既有違例：`app/team/page.tsx` 的 `members`、`components/FeatureSection.tsx` 的 `features` 陣列寫死在元件裡，應搬 `data/`。
3. **雙 Navbar**：`app/layout.tsx` 掛一次、各頁 `page.tsx` 又各掛一次（**HEAD 版就有**，⛔ 與未 commit 舊改動無關）⇒ 每頁 DOM 有兩個 40×40 logo 疊在 `89,37`。
4. `https://grainy-gradients.vercel.app/noise.svg` 回 **404**（`/`、`/sponsor`、`/team` 三頁各一次，改前改後皆然）⇒ 那層雜訊材質其實沒顯示。
5. `components/ServerSection.tsx` 第 1 與第 3 行**各有一次** `'use client';`（HEAD 與工作樹皆然）。
6. `public/images/regular.png`、`vote.png` 無人引用（`/modServer` 引的是正式站的外部 URL）。

---

## 仍未驗清單（⛔ 不得在別處寫成已驗）

### 承接 plan-review 的 U1–U12

| # | 事項 | 結果 |
|---|---|---|
| U1 | HEAD 版 `ServerSection.tsx` 第 81 行原文、import 在 5–6 行、第 1／3 行重複 `'use client';` | ✅ **已查**：`git show HEAD:… \| sed -n '1,8p;81p'` 實跑，三點全部屬實；className 含 `transform` 與 `transition-transform duration-1000`（任務包 §A-4 抄漏的那兩段確實存在） |
| U2 | 禁字清單在 HEAD 版為 0 命中 | ✅ **已查**：印 `0` |
| U3 | ⛔3 修正版樣式在 build 產物 0 命中、兩條正控有輸出 | ✅ **已查**：見 P3-b |
| U4 | 裁決 ⑨ 選甲後 #2 的 `rect` 恢復 `48×30.16`、`y` 1913 | ✅ **已查**：`{"x":882,"y":1913,"w":48,"h":30.16}`。⚠️ 附帶查出「不加 `h-auto` 也是同一個 rect」，見「裁決 ⑨ 的實測」 |
| U5 | #9 條件渲染的型別檢查 | ✅ **已查**：`yarn build` 的 `Linting and checking validity of types` 通過，用第一種寫法 |
| U6 | 3100 是否空閒 | ✅ **已查**：每次起 dev 前 `lsof -iTCP:3100 -sTCP:LISTEN` 皆無輸出 |
| U7 | symlink `node_modules` 下 worktree 的 `next dev`／`lint`／`build` 能跑 | ✅ **已查**：三者皆通過。⚠️ **但踩到一個坑**（見上方建議地雷 N+1）：`next build` 之後直接 `next dev` 會清掉主樹 `node_modules` |
| U8 | headless Chrome 全高視窗下 lazy 圖是否在 `--virtual-time-budget=8000` 內載入 | ✅ **已查**：`after/` 四頁 20 筆 `complete=true`、`naturalWidth` 全非 0；三頁 PNG 與改前位元組相同 ⇒ PNG 裡的圖也都在 |
| U9 | P4 console 無 `has either width or height modified…`、無 `Image is missing required "src" property` | ✅ **已查**：四頁 console 全文已貼，兩條都沒有。⚠️ 前者經 canary 證實在本 repo **根本不會觸發**（Tailwind preflight 的 `height:auto`）⇒ 它⛔ 不是有效的機器訊號，主證是 `rect` 逐欄比對 |
| U10 | `git update-index --cacheinfo` 後 mode 仍 `100644`、blob = `$BLOB` | ✅ **已查**：`100644 73c40574a982925d64f50fc3caa58aeb8ca2d486 0` |
| U11 | index 版 `/` 的 `docHeight` 與 #10 的 `rect.y + rect.h` | ✅ **已查**：`docHeight=3520`；#10 `y=2831`、`h=378.5`（底 3209.5）⇒ 確實超過腳本寫死的 3114 |
| U12 | `sharp` 未安裝 | ✅ **已查**：`ls node_modules/sharp` → `No such file or directory`、exit=1 |

### 本輪仍然驗不到的（據實留著）

| # | 驗不到的事 | 原因 |
|---|---|---|
| 1 | **正式 Docker 映像內的行為** | ⛔ 未跑 `docker build`、⛔ 未打 `v*` tag（鐵則 4）。裁決 ①丙 的效果只以 P3-b 的 **build 產物層 grep** 佐證 |
| 2 | **#9 無改前對照** | 基線由主迴圈在未登入狀態拍（裁決 ④(b) 明文） |
| 3 | **#9 改後本身** | ⏳ 待人工（見 E2E 表）——⛔ 我沒有驗過，⛔ 沒有用假帳號替代 |
| 4 | **Discord CDN 實際 hostname** | 只有 `ADMIN_DISCORD_ID` 本人登得進；期望值 `cdn.discordapp.com` 來自檔案層 |
| 5 | **`loading="lazy"` 對首屏圖的「肉眼閃爍」** | ⚠️ **本輪工具限制**：可用的瀏覽器面板 `document.visibilityState` 恆為 `"hidden"`（我實測；同一張圖改成 `loading='eager'` 立刻載入、`complete=true`）⇒ Chrome 對隱藏分頁**不觸發 lazy 載入**，⛔ 無法做肉眼閃爍判斷。headless 擷取證明「最終都載入、版面不變」，但**「首屏會不會閃一下」仍未驗** ⇒ 建議併入 E2E 由架構師肉眼看一次。⛔ 不因此偷加 `priority` |
| 6 | **`srcset` 的改前對照** | `<img>` 本來就沒有此屬性、`metrics.js` 也無此欄 ⇒ 只有改後現場觀察 |
| 7 | **worktree 的 lint/build 是 symlink 依賴** | ⛔ 不宣稱等同乾淨安裝 |
| 8 | **`before/` 是主迴圈拍的、`after/` 是我拍的** | ⚠️ 已用「同碼三頁 JSON 逐欄相同 + PNG 同雜湊」把這條風險壓到最低（見 P5 儀器正控），但**兩人兩次執行**這件事本身仍在 |
| 9 | **`home.png` 的像素級比對** | 背景影片使兩次擷取必然不同（同碼連拍兩次已證，證據落檔於 `docs/tasks/F9-evidence/after-recheck/`）⇒ `/` 的人工看圖請看**版面**、⛔ 不要看雜湊 |

---

## 守界聲明

- ✅ 只做任務包與 plan 範圍內的事：10 處 `<img>` → `next/image`、`.eslintrc.json` 恢復規則、`next.config.js` 加 `images.unoptimized`。
- ⛔ **未超前**：⛔ 沒抽共用元件、⛔ 沒碰 `lib/`、⛔ 沒動 `eslint.dirs`、⛔ 沒改 `data/`、⛔ 沒加任何套件（含 `sharp`）、⛔ 沒改 Dockerfile／workflow、⛔ 沒打 tag。
- ⛔ **未違反鐵則**：機密只在 server 端（本包沒碰）、⛔ 沒改授權判準、⛔ 沒動 Route Handler 錯誤格式、⛔ 沒打 `v*` tag、內容資料仍在 `data/`。
- **已知、⛔ 本包不修（carryover）**：雙 Navbar（HEAD 版就有）、`ServerSection.tsx` 重複的 `'use client';`、
  `/modServer` 引正式站外部 URL 而 `public/images/{regular,vote}.png` 無人引用、
  鐵則 5 的兩處既有違例（`members`／`features` 陣列寫死在元件裡）、
  `app/layout.tsx` 與 `app/staff/page.tsx` 的長期未 commit 舊改動、
  `grainy-gradients.vercel.app/noise.svg` 404。
- **worktree ⛔ 尚未移除**：`/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index` 仍在，
  依 plan §12 第 11 步，**架構師確認 commit 之後才 `git worktree remove`**。
- ⛔ **尚未 commit／push，等待架構師確認。** 本任務包與派工訊息的任何措辭均⛔ 不構成 push 預授權。
  commit 訊息⛔ 不得含任何 `Co-Authored-By` 行。
