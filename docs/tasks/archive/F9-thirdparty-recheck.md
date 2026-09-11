# F9 第三方獨立補跑報告（8 條）

> 產出者：**第三方獨立驗證者**（`nr-implementer` 身分，⛔ 非 `F9-verification.md` 作者、⛔ 非 `F9-verification-audit.md` 作者）
> 日期：**2026-09-12**　主樹 HEAD：`df2b8ff`　分支 `developers`
> 緣由：稽核側受 `audit-write-guard` 限制（依設計⛔ 不得做任何檔案改動），有 8 條驗收聲稱**結構上重跑不了**
> （需建 canary 檔或跑會寫檔的指令）⇒ 由本報告獨立重跑取證。
>
> ⚠️ **紀律聲明**：本報告的 §27–§65 八節，全部在**⛔ 尚未開啟** `F9-verification.md` 與 `F9-verification-audit.md`
> 的前提下，由本驗證者自行設計驗法、自行執行、自行記錄輸出。八節結論寫定後才開那兩份報告做 §比對。
> ⚠️ 凡本報告與那兩份不一致者，**以本報告的實測為準**，⛔ 未事後調整任何數字去遷就報告。
>
> ⛔ 本輪⛔ 未 commit、⛔ 未 push、⛔ 未動 staging（⛔ 無 `git add`／`git reset`）。

---

## 前置：環境實況（本驗證者自量，⛔ 非轉抄）

```
$ git rev-parse --short HEAD
df2b8ff
$ git worktree list
/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web  df2b8ff [developers]
/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index        df2b8ff (detached HEAD)
$ for p in 3100 3101 3102; do lsof -iTCP:$p -sTCP:LISTEN -n -P; done
（三個埠皆無輸出 ⇒ 空閒）
```

現行 `.eslintrc.json`（4 行，`rules` 區塊與三行註解已不存在 ⇒ 裁決 ⑧甲 已落地）：
```json
{
  "root": true,
  "extends": "next/core-web-vitals"
}
```
現行 `next.config.js` 含 `images: { unoptimized: true },`（裁決 ①丙 已落地），既有註解
`// 如果有其他配置可以加在這裡` 仍是物件內最後一行。
`app/sponsor/page.tsx` #2 的 className 為 `w-12 h-auto object-contain brightness-0 invert`
⇒ 裁決 ⑨甲（加 `h-auto`）已落地。

---

## 27 — N1 canary：`@next/next/no-img-element` 這道閘門真的會擋

**本驗證者的驗法**（⛔ 不沿用實作側的檔名，另建 `data/tpCanary.tsx` 以免與已刪的舊 canary 混淆）：
① 先量無 canary 的基線 → ② 建含 `<img>` 的 canary（`data/` 在 `next.config.js` 的 `eslint.dirs` 內）
→ ③ 量 `exit` 與命中數 → ④ 刪除並**四重**確認 → ⑤ 確認 lint 回到 `exit=0`。

**② canary 內容（逐字）**
```tsx
// F9 第三方複驗 canary —— 驗完必刪，⛔ 不得進 commit
export function TpCanary() {
  return <img src="/images/logo.png" alt="tp-canary" />;
}
```

**① 基線（無 canary）**
```
$ yarn lint --max-warnings 0
✔ No ESLint warnings or errors
Done in 0.76s.
exit=0
```

**③ 有 canary（實際輸出逐字）**
```
$ yarn lint --max-warnings 0
./data/tpCanary.tsx
3:10  Warning: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element  @next/next/no-img-element

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
error Command failed with exit code 1.
exit=1
```
```
$ yarn -s lint 2>&1 | grep -c "no-img-element"
1
$ yarn -s lint 2>&1 | grep -E "^\./"
./data/tpCanary.tsx
```
⇒ **`exit=1`、恰 1 命中、命中檔恰為 canary 本身**（⇒ 10 個既有位置全部已換乾淨，⛔ 沒有殘留）。

**④ 還原（四重確認）**
```
$ rm data/tpCanary.tsx        → rm_exit=0
$ ls data/                    → modpackHistory.ts  news.ts  staff.ts
$ git status --porcelain data/        → （無輸出）
$ git status --porcelain | grep -i canary → （無命中，grep exit=1）
$ find . -name "*anary*" -not -path "./node_modules/*" -not -path "./.git/*" → （無輸出）
$ yarn lint --max-warnings 0  → ✔ No ESLint warnings or errors / exit=0
```

**結論：✅ 通過。** 這道閘門**真的會紅也會綠**——同一條指令在 canary 在場時 `exit=1`、移除後 `exit=0`，
⇒ backlog F9 的完成判準（規則重新生效下 lint 仍綠）**成立**，⛔ 不是空測。
canary ⛔ 未進 git、⛔ 已從硬碟移除（四重確認如上）。

---

## 28 — `yarn install --frozen-lockfile` 過，且 `yarn.lock` / `package.json` 零變動

**本驗證者的驗法**：改用**內容雜湊前後比對**（⛔ 不只靠 `git diff` 無輸出，因為「檔案完全沒被讀到」也會無輸出），
再加一條**負向對照**證明 `--frozen-lockfile` 這道閘門量得準。

**正向**
```
（安裝前）
$ md5 -r yarn.lock package.json
1c92ad40f6c718d3f79e6122bfd41aa4 yarn.lock
066e2c9b253ab74d17b22e3ba8589944 package.json

$ yarn install --frozen-lockfile
... Done in 0.57s.
exit=0

（安裝後）
$ md5 -r yarn.lock package.json
1c92ad40f6c718d3f79e6122bfd41aa4 yarn.lock
066e2c9b253ab74d17b22e3ba8589944 package.json
$ git diff --stat yarn.lock package.json       → （無輸出）
$ git status --porcelain yarn.lock package.json → （無輸出）
$ ls node_modules | wc -l                       → 351
```
⇒ 兩檔 md5 **逐字節相同**，`node_modules` 頂層 351 項（⛔ 未被 worktree symlink 陷阱清空）。

**負向對照（本驗證者自行加測；還原一律用備份檔）**
把 `"left-pad": "^1.3.0"` 注入 `package.json` 的 `dependencies`（⛔ 不動 `yarn.lock`）後：
```
$ yarn install --frozen-lockfile
error Your lockfile needs to be updated, but yarn was run with `--frozen-lockfile`.
exit=1
```
還原：
```
$ cp <scratchpad>/package.json.bak package.json
$ diff <scratchpad>/package.json.bak package.json → （無輸出）diff_exit=0
$ md5 -r package.json yarn.lock
066e2c9b253ab74d17b22e3ba8589944 package.json
1c92ad40f6c718d3f79e6122bfd41aa4 yarn.lock       ← 與注入前逐字相同
$ git status --porcelain package.json yarn.lock  → （無輸出）
$ grep -c "left-pad" package.json                → 0
```

**結論：✅ 通過，且已具備負向對照。** `--frozen-lockfile` 是**真的會 fail** 的閘門
（lock 與 `package.json` 不一致時 `exit=1`），因此正向的 `exit=0` + md5 不變是有效證據。
裁決 ②甲（⛔ 不加 `sharp`）的「零技術棧變更」成立。

---
## 前置（54/55 共用）：worktree 內容確實等於 commit 內容——本驗證者自行實證

任務包／plan 只說「worktree 用來驗 index 版本」，但「worktree 檔案 == staged blob」這件事
本身沒有被任何一條驗收用**機器判準**證明過。本驗證者補證（⛔ 不靠肉眼看 diff）：

```
$ git ls-files -s components/ServerSection.tsx        （主樹）
100644 73c40574a982925d64f50fc3caa58aeb8ca2d486 0	components/ServerSection.tsx
$ git hash-object "<worktree>/components/ServerSection.tsx"
73c40574a982925d64f50fc3caa58aeb8ca2d486
```
九檔逐檔比對（主樹 index blob vs worktree 檔案 `hash-object`）：
```
SAME  .eslintrc.json
SAME  app/sponsor/page.tsx
SAME  app/team/page.tsx
SAME  components/FeatureRow.tsx
SAME  components/FeatureSection.tsx
SAME  components/HomeHero.tsx
SAME  components/Navbar.tsx
SAME  components/ServerSection.tsx
SAME  next.config.js
```
⇒ **九檔 blob 雜湊全同** ⇒ 在 worktree 跑的 lint／build 驗的**確實是要進 commit 的內容**，⛔ 不是工作樹版。
worktree `git status --short` 恰為這 9 檔 ` M`，⛔ 無 `app/layout.tsx`、⛔ 無 `app/staff/page.tsx`。

---

## 54 — worktree（index 版本）`yarn build` ⇒ `exit=0`

**本驗證者的驗法**：在 `/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index` 跑 `yarn build`，
輸出重導到檔案（⛔ 不用 pipe，避免 zsh 下量不到 exit code），再 `echo "exit=$?"`。
落檔：`docs/tasks/F9-evidence/thirdparty/54-worktree-build.log`

```
$ cd "<worktree>" && yarn build > <log> 2>&1; echo "exit=$?"
exit=0
```
log 重點（逐字節錄）：
```
   ▲ Next.js 14.1.0
   - Environments: .env.local
 ✓ Compiled successfully
   Linting and checking validity of types ...
 ✓ Generating static pages (13/13)
Route (app)                              Size     First Load JS
┌ ○ /                                    4.66 kB         110 kB
├ ○ /modServer                           3.78 kB         109 kB
├ ○ /sponsor                             4.63 kB         110 kB
├ ○ /team                                2.44 kB         108 kB
ƒ Middleware                             74.9 kB
Done in 6.71s.
```
（另有兩條 `Browserslist: caniuse-lite is outdated` 提示——**既有環境提示，與 F9 無關**，⛔ 不是錯誤。
機密檢查：log 只出現檔名 `.env.local`，⛔ 無任何變數值。）

**結論：✅ 通過。** `exit=0`，且輸出含 `Linting and checking validity of types` 與完整路由表
⇒ TypeScript 型別檢查確實跑過（裁決 ④甲 條件渲染的 optional-chain 收窄⛔ 未報型別錯）。

⚠️ **本驗證者實際踩到並拆除了已知陷阱**：這次 build **確實**在 worktree 產生了
`.next/standalone/node_modules -> <主樹>/node_modules` 的 symlink（`ls -ld` 實見，時間戳 `Sep 12 00:13`）。
已用 `[ -L ] && rm` **只移除連結本身**，並複查主樹 `node_modules` 頂層仍為 **351** 項。
⇒ 這條陷阱是**真的**，⛔ 不是傳聞；後續任何人若要清該 worktree 的 `.next`，仍須先確認此連結不存在。

---

## 55 — worktree 的 lint canary 負向對照 ⇒ `exit=1`

**本驗證者的驗法**：同 §27，但在 **worktree** 內做（因為它跑的是 index 版本的 `.eslintrc.json` 與
`next.config.js`）。先量正向、再放 canary、再還原。

**正向（無 canary）**
```
$ cd "<worktree>" && yarn lint --max-warnings 0
✔ No ESLint warnings or errors
exit=0
```

**負向（canary `data/tpCanary.tsx`，內容同 §27、僅函式名改 `TpCanaryWt`）**
```
$ yarn lint --max-warnings 0
./data/tpCanary.tsx
3:10  Warning: Using `<img>` could result in slower LCP and higher bandwidth. ...  @next/next/no-img-element
error Command failed with exit code 1.
exit=1
$ yarn -s lint 2>&1 | grep -c "no-img-element"
1
```

**還原**
```
$ rm data/tpCanary.tsx                  → rm_exit=0
$ git status --short                    → 恰 9 檔 ` M`（與放 canary 前逐行相同）
$ find . -name "*anary*" …              → （無輸出）
$ yarn lint --max-warnings 0            → ✔ No ESLint warnings or errors / exit=0
```

**結論：✅ 通過。** index 版本的設定下，`no-img-element` 同樣**會紅也會綠**
⇒ §54 與 worktree 正向 lint 的 `exit=0` 是有效證據，⛔ 不是空測。

---
## 28-附 — `package.json` 一度出現 `left-pad` 的暫態：**是本驗證者做的負向對照**

主迴圈 2026-09-12 轉達稽核側觀測到一個暫態 diff（`+    "left-pad": "^1.3.0"`）並要求交代。
**據實回答：是本驗證者所為**，即上面 §28 的負向對照，⛔ 不是任何人的誤操作、⛔ 不是殘留。

- **為什麼要做**：`CLAUDE.md`「CI 現況」節的一般原則——「凡把某指令當閘門，**必須有一次『它真的會 fail』的負向對照**」。
  第 28 條把 `yarn install --frozen-lockfile` 當閘門，若只跑正向拿 `exit=0`，⛔ 無法排除「這個旗標根本沒在檢查」。
- **為什麼選 `left-pad`**：需要一個**必定不在 `yarn.lock` 裡**的套件名。`left-pad` 是公認的哏、極好辨識，
  且本輪**⛔ 從未真的安裝它**（`--frozen-lockfile` 在 Resolving 階段就中止）⇒ `node_modules/left-pad` 不存在、`yarn.lock` 零命中。
  ⚠️ 稽核側觀測到的三項（lock 0 命中／`node_modules` 無此目錄／原始碼引用 0 檔）**正是預期現象**，⛔ 不是異常。
- **加了什麼**：`package.json` `dependencies` 末尾一行 `"left-pad": "^1.3.0"`（7 → 8 項），⛔ 未動 `yarn.lock`。
- **實際輸出**：
  ```
  $ yarn install --frozen-lockfile
  [1/4] Resolving packages...
  warning left-pad@1.3.0: use String.prototype.padStart()
  error Your lockfile needs to be updated, but yarn was run with `--frozen-lockfile`.
  exit=1
  ```
- **怎麼還原**：**備份檔**（⛔ 不用 `git checkout`——會連同已 staged 的正式改動一起清掉）。
  備份路徑：`/private/tmp/claude-501/-Users-quasi-pc-Desktop-Projects-Nameless-Realms-namelessrealms-web/cef371bf-ba51-4336-bd13-a85d6c48e8a6/scratchpad/package.json.bak`
  （同一 scratchpad 另存 `yarn.lock.bak` 備而未用）。
- **還原後證明**：
  ```
  $ diff <bak> package.json         → （無輸出）exit=0
  $ md5 -r package.json             → 066e2c9b253ab74d17b22e3ba8589944（與注入前逐字相同）
  $ md5 -r yarn.lock                → 1c92ad40f6c718d3f79e6122bfd41aa4（與注入前逐字相同）
  $ git status --porcelain package.json yarn.lock → （無輸出）
  $ grep -c "left-pad" package.json → 0
  ```
- ⚠️ **這個暫態存在期間任何 `yarn install --frozen-lockfile` 都會紅**——若有人在那個窗口內量到紅燈，那是本對照造成的，⛔ 與 F9 無關。
  本驗證者的正向量測（§28）是在**注入之前**跑的，⛔ 未受影響。

**收尾複查（主迴圈指定的四項，本驗證者於報告收尾前實跑）**
```
$ git status --short -- package.json yarn.lock      → （無輸出）
$ node -e '…Object.keys(deps).length'               → 7
$ grep -rl "left-pad" . --exclude-dir={node_modules,.git,.next}
                                                    → 只有 docs/tasks/F9-verification-audit.md
                                                      （稽核側記錄該暫態的文字，⛔ 不是程式碼／lock 命中）
$ ls node_modules/left-pad                          → 不存在（exit=1）
$ git diff --cached --name-only | wc -l             → 31
```

---

## 35 — `yarn dev` 的**終端 log** 無 `⨯` / `Error:`

**本驗證者的驗法**：⛔ 不看畫面、⛔ 不靠印象——把 dev server 的 stdout+stderr 重導到檔案落檔，
依序開四頁後對 log 做**負面樣式計數 + 一條正控**（證明同一把 grep 抓得到東西）。
落檔：`docs/tasks/F9-evidence/thirdparty/35-dev-3100.log`（四頁開完、⛔ 尚未做 §65 canary 時的快照）
與 `35-dev-3100-full.log`（含 §65 canary 前後的完整歷程）。

**log 全文（18 行，逐字）**
```
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next dev -p 3100
   ▲ Next.js 14.1.0
   - Local:        http://localhost:3100
   - Environments: .env.local

 ✓ Ready in 722ms
 ○ Compiling / ...
Browserslist: browsers data (caniuse-lite) is 8 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
 ✓ Compiled / in 2.5s (635 modules)
 ✓ Compiled in 125ms (319 modules)
 ✓ Compiled /api/auth/[...nextauth] in 398ms (542 modules)
 ✓ Compiled /sponsor in 136ms (863 modules)
 ✓ Compiled /team in 94ms (869 modules)
 ✓ Compiled /modServer in 115ms (881 modules)
```

**負面樣式計數**
```
⨯            0
Error:       0
Unhandled    0
error        0
Warning      0
```
**正控（同一把 grep）**
```
$ grep -c "Compiled" dev-3100.log
6
```
⇒ grep ⛔ 不是對空檔在跑；四頁（`/`、`/sponsor`、`/team`、`/modServer`）**都留下了 `✓ Compiled` 行**
⇒ log 確實涵蓋四頁的實際載入，⛔ 不是「只開了一頁」。

**據實補充**：第 2 行 `warning ../../../../package.json: No license field` 是 **yarn 自己**的小寫 `warning`
（⛔ 不是 Next 的、⛔ 不是錯誤），本 repo 每一條 yarn 指令都會印；`Browserslist … caniuse-lite is outdated`
是既有環境提示。兩者皆⛔ 不屬於 `⨯` / `Error:` / `Unhandled`。
**機密檢查**：log 只出現檔名 `.env.local`（`- Environments: .env.local`），⛔ 無任何變數值。

**結論：✅ 通過。**

---

## 36 — 四頁瀏覽器 console

**本驗證者的驗法**：⚠️ 第一次讀 console 時發現**分頁的 console 緩衝是累積的**（含先前造訪殘留，
例如上一頁的 LCP 警告），拿它當「本頁的 console」會誤判 ⇒ 改為**每頁開一個全新分頁**，
載入 → 捲到底停 2.5 秒 → 捲回頂停 1.5 秒（讓 `loading="lazy"` 全部載完）→ 才讀 console。
再對每頁補一條**資源層正控**：把該頁所有本地資源逐一 `fetch` 查狀態碼，證明 console 的那條 404 到底是誰。

| 頁 | docHeight | `<img>` 數 | `complete=false 或 naturalWidth=0` | console error | console warn | 外部資源 |
|---|---|---|---|---|---|---|
| `/` | 3114 | 5 | **0** | 1（404） | 0 | `grainy-gradients.vercel.app/noise.svg` |
| `/sponsor` | 2524 | 4 | **0** | 1（404） | 0 | grainy + `paypalobjects.com/…/pp_cc_mark_111x69.jpg` |
| `/team` | 1870 | 6 | **0** | 1（404） | 0 | grainy |
| `/modServer` | 3842 | 5 | **0** | **0** | 0 | 兩張 `namelessrealms.com/_next/image?…` |

（`docHeight` 四項與 `capture.sh` 第 8 行寫死的 `H=( home 3114 sponsor 2524 team 1870 modServer 3842 )` **逐頁相等**
⇒ 本驗證者的量測與截圖用的是同一把尺。）

**⛔ 不得出現的訊息——全部 0 命中，且已配正控**
- `missing required "src"`：四頁 **0**。
- `has either width or height modified, but not the other`：四頁 **0**。
- Next 錯誤覆蓋層：四頁皆無（`nextjs-portal` / 覆蓋層元素未出現，且頁面正常渲染、`<img>` 全部 `complete`）。
- **正控（證明「0 命中」⛔ 不是因為讀不到 console）**：同一個 console 讀取器在三頁各抓到 1 條 `[error]`；
  另在 §65 用 headless Chrome 的 `--enable-logging=stderr` 對**同一個 iframe 內的頁面**注入
  `console.warn('TPCTRL-has either width or height modified, but not the other')` 與
  `console.error('TPCTRL-Image is missing required "src" property')`，兩條**都被完整收到**
  （見 `65-console-*.err`）⇒ 這兩種字串若真的發生，**一定看得到**。

**那條 404 是誰、以及它在 HEAD 版也一樣有**
1. 逐一 `fetch` 該頁所有本地資源：`/` 14 個、`/sponsor` 11 個、`/team` 14 個 ⇒ **狀態碼 ≥400 者 0 個**。
2. ⇒ 唯一可能 404 的只剩外部資源。`/sponsor` 的 PayPal 圖實測 `naturalWidth=226 naturalHeight=142`（載入成功）。
3. 直接量該 URL：
   ```
   $ curl -s -o /dev/null -w "status=%{http_code}\n" https://grainy-gradients.vercel.app/noise.svg
   status=404
   ```
4. **頁面層相關性**：`/modServer` 是四頁中**唯一⛔ 不引用** grainy 的頁（見下），它的 console **恰好 0 error**。
5. **原始碼層**：`git grep` 於 **HEAD** 得 6 處，與工作樹**同一字串**：
   ```
   HEAD:app/donate/page.tsx:12       HEAD:app/sponsor/page.tsx:20
   HEAD:app/staff/page.tsx:8         HEAD:app/team/page.tsx:15
   HEAD:app/voteModpack/page.tsx:28  HEAD:components/ServerSection.tsx:31
   ```
   它是 Tailwind 的 `bg-[url('…')]` **CSS 背景**，⛔ 不是 `<img>`／`<Image>` ⇒ 結構上與 F9 無關。
6. **機器判準：F9 的改動⛔ 沒碰到那幾行**
   ```
   $ git diff HEAD -- app/sponsor/page.tsx | grep -c grainy   → 0   （同一 diff 有 9 行變動：正控）
   $ git diff HEAD -- app/team/page.tsx    | grep -c grainy   → 0   （同一 diff 有 11 行變動：正控）
   $ git diff --cached components/ServerSection.tsx | grep -c grainy → 0
     （staged 的 numstat 逐字為 `2	1	components/ServerSection.tsx`，變動恰三行：
      `+import Image from 'next/image';` 與 `<img>`→`<Image>` 一減一加）
   ```
   ⚠️ `git diff HEAD -- components/ServerSection.tsx`（**工作樹**版）確實有 2 次 grainy 命中——
   那是該檔長期未 commit 的 173 行舊改動（整檔重排），**⛔ 不在 F9 commit 內**，⛔ 不得混為一談。
7. **執行期（HEAD 版）**：另開一棵**純 HEAD** worktree（`nrw-tp-head`，`git status` 全空）跑 `yarn dev -p 3101`：
   ```
   $ curl -s -o /dev/null -w "%{http_code}" http://localhost:3101/team        → 200
   $ curl -s http://localhost:3101/_next/static/css/app/layout.css \
       | grep -c "grainy-gradients.vercel.app/noise.svg"                      → 1
   $ curl -s -o /dev/null -w "%{http_code}" https://grainy-gradients.vercel.app/noise.svg → 404
   ```
   ⇒ **HEAD 版送出的 CSS 一樣引用該 URL，該 URL 一樣 404。**
   （該 worktree 與 dev server 已於驗畢移除／停止；log 落檔 `36-dev-3101-HEAD.log`。）

**結論：✅ 通過。** 四頁⛔ 無 `missing required "src"`、⛔ 無 width/height-modified 警告、⛔ 無錯誤覆蓋層；
唯一的 404 是 `grainy-gradients.vercel.app/noise.svg`，**在 HEAD 版同樣存在**，⇒ ⛔ 不是本次造成的。

⚠️ **仍未驗（據實）**：HEAD 版的**瀏覽器 console** 本身⛔ 未重播——本輪後段 Browser 面板整個無回應
（`navigate` / `preview_start` / 連 `javascript_exec` 的 `1+1` 都逾時），已改以上述執行期 CSS + URL 狀態 + 頁面層相關性佐證。
⚠️ 另據實記：本輪 console ⛔ 未出現 LCP 警告，但**第一次**（累積緩衝、含先前造訪）的讀取裡出現過
`Image with src "/images/team.png" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.`
——它是 `console.warn`、⛔ 不是 error，屬任務包背景 §B-7 明列的**允許警告**，⛔ 不因它加 `priority`。

---

## 44 — `home.png` 連拍對照：兩次雜湊不同 ⇒ 擷取雜訊，⛔ 不是版面變動

**本驗證者的驗法**（比「重拍一張」更強，⛔ 不只記雜湊）：
① 用**同一份 `capture.sh`**（⛔ 未改任何一行、⛔ 未改高度）對**同一份程式碼**連拍兩趟，存成
`thirdparty/burst1/` 與 `thirdparty/burst2/`；
② 比對**四頁**的雜湊——若差異真的來自擷取雜訊，則只有含影片的 `/` 會變，另三頁應**逐位元組相同**（這就是配對正控）；
③ 自寫純 Python PNG 解碼器做**像素級**比對（⛔ 不靠肉眼、⛔ 不靠檔案大小），量差異像素數、佔比、邊界框；
④ 對 `before/home.png` vs `after/home.png` 跑**同一把尺**，看它是不是同一個現象；
⑤ 逐 300px 橫帶比對兩組的空間分布。

**落檔（皆在 `docs/tasks/F9-evidence/thirdparty/`）**
`burst1/{home,sponsor,team,modServer}.png`、`burst2/…`（各 4 張）、
`44-pngdiff.py`、`44-pngband.py`、`44-pixdiff-*.txt`、`44-band-*.txt`

**② 四頁雜湊（`shasum -a 256`）**
```
burst1/home.png       c59e4226b70e3050f759e322b394b3ede0d47b4a92b21a0611bc184b1bf04a8c
burst2/home.png       04871702d999d42dcbce548665c9b6ff9219111ae51a4e59dc7622147d9bbb86   ← 不同
burst1/sponsor.png    0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d
burst2/sponsor.png    0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d   ← 相同
burst1/team.png       4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131
burst2/team.png       4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131   ← 相同
burst1/modServer.png  84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3
burst2/modServer.png  84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3   ← 相同
（對照）before/home.png  ffbe59cd9aa91c596488b2e827f6f299d4a1500eef2d977a9468564d230c7063
（對照）after/home.png   cb65a0a32cd4c96f72152f83137ac6f504cc5cdd383b55ba5db8fcc1f6185d79
```
⇒ **同一份程式碼、同一支腳本連拍兩次，`home.png` 雜湊就已經不同**；
而 `sponsor` / `team` / `modServer` 兩趟**逐位元組相同** ⇒ 擷取管線本身是**確定性**的，
⇒ `home.png` 的變動源自**頁面本身隨時間變化**，⛔ 不是腳本或環境的隨機性。

**③ 像素級比對（本驗證者自寫解碼器，⛔ 未用任何影像套件——本機無 PIL）**
```
burst1/home.png vs burst2/home.png（同一份程式碼，純雜訊）
  size 1280 x 3114  totalPx 3985920
  diffPx 332501  pct 8.342
  bbox x0,y0,x1,y1 = 0 0 1279 3098
  maxChannelSumDelta 115

before/home.png vs after/home.png（改前 vs 改後）
  size 1280 x 3114  totalPx 3985920
  diffPx 442754  pct 11.108
  bbox x0,y0,x1,y1 = 0 0 1279 3098
  maxChannelSumDelta 154

burst1/sponsor.png vs burst2/sponsor.png（正控／負控二合一）
  diffPx 0  pct 0.0  bbox（無差異）  maxChannelSumDelta 0
```
⇒ sponsor 得到 **0 個差異像素**，證明這把尺**量得準**（⛔ 不是「什麼都說不一樣」的壞工具），
同時證明擷取管線確定性；而 home 在**同一份程式碼下**就已經差 8.34%。

**⑤ 逐 300px 橫帶分布（兩組的空間簽名幾乎一致）**
```
        burst1 vs burst2        before vs after
y    0- 299    2.01%                2.53%
y  300- 599    0.53%                1.35%
y  600- 899    2.25%                3.97%
y  900-1199   21.30%   ←峰          29.54%   ←同一個峰
y 1200-1499    3.70%                7.99%
y 1500-1799    6.65%               10.19%
y 1800-2099   38.55%   ←峰         41.89%   ←同一個峰
y 2100-2399    9.33%               13.42%
y 2400-2699    2.03%                3.54%
y 2700-2999    0.21%                0.78%
y 3000-3113    0.12%                0.28%
```
⇒ 兩組的**峰在同樣的位置、遞減形狀一致**，改前／改後只是幅度約 1.3 倍
⇒ 兩者是**同一個現象**，⛔ 不是版面差異疊在雜訊上。

**為什麼差異遍及整張圖（本驗證者實查出的機制，⛔ 不是推測）**
```
$ grep -n "h-screen\|<video" components/HomeHero.tsx
7:    <section className="relative h-screen flex items-center justify-center overflow-hidden">
10:        <video
```
首頁 hero 是 `h-screen` 且內含 `<video>`；而 `capture.sh` 第 14 行用 `--window-size=1280,${H[$k]}`，
`H[home]=3114` ⇒ **截圖當下 `100vh` 就是 3114px**，hero 影片**填滿整張 1280×3114**，
後續區塊疊在它上面（半透明／陰影／模糊） ⇒ **整張圖每個像素都帶影片畫格成分**，
邊界框 `(0,0)-(1279,3098)` 正是預期，⛔ 不是版面位移。
瀏覽器端亦實見該 `<video>`：`autoplay:true loop:true muted:true 1920×1080`、
讀取當下 `currentTime = 20.264542`（每次擷取落在不同畫格）。

**結論：✅ 通過，且證據已確實落檔。** `before/home.png` 與 `after/home.png` 雜湊不同
**完全由背景影片畫格的擷取雜訊解釋**，⛔ 不是版面變動——理由是同一份程式碼連拍兩次就已經有
同樣性質、同樣空間分布、同一量級的差異，而同批的另三頁逐位元組相同。
⚠️ 稽核側指出「報告引用的對照圖 `e40936a1…` 不在 `F9-evidence/` 任何位置」——本驗證者⛔ 未去找那張圖，
而是**重拍並落檔**了上述 8 張 PNG 與 5 份量測輸出，任何人可用 `44-pngdiff.py` 重現。

---

## 65 — 裁決 ⑨ 的 `h-auto` canary

**本驗證者的驗法**：備份 `app/sponsor/page.tsx` → 只把 #2 那一行的 className 由
`w-12 h-auto object-contain brightness-0 invert` 改成 `w-12 object-contain brightness-0 invert`
→ 量 rect 與 console → **用備份檔**還原 → 同法再量一次 → 兩份輸出逐字 diff。

⚠️ **量測工具改用 headless Chrome**：本輪後段 Browser 面板整個逾時無回應，改為在 `public/` 放一個**臨時同源頁**
`tpMeasure.html`（把 `/sponsor` 放進 1280px 寬的 iframe，讀 `getBoundingClientRect()` 與 `getComputedStyle()`，
把結果寫進 DOM），再用 `--dump-dom` + `--enable-logging=stderr` 取出。該臨時頁**驗畢即刪**（下方有確認）。
⚠️ 這把尺與 §36 的分頁量測**有固定偏移**（iframe 在 `<body>` 預設 margin 內 ⇒ `x`/`y` 各偏 6/4 px，`docHeight` 2528 vs 2524）
——但**有無 `h-auto` 兩次用的是同一把尺**，⇒ 比較有效；⛔ 不得拿它與 §36 的絕對值互比。

**改動內容（`diff` 逐字）**
```
165c165
< ...alt="PayPal" width={226} height={142} className="w-12 h-auto object-contain brightness-0 invert" />
---
> ...alt="PayPal" width={226} height={142} className="w-12 object-contain brightness-0 invert" />
```

**量測結果（PayPal 那筆，`i:3`）**

| 欄位 | **⛔ 沒有** `h-auto` | **有** `h-auto` |
|---|---|---|
| `cls` | `w-12 object-contain brightness-0 invert` | `w-12 h-auto object-contain brightness-0 invert` |
| `x` | 888 | 888 |
| `y` | 1917 | 1917 |
| `w` | 48 | 48 |
| `h` | **30.16** | **30.16** |
| `cssH`（computed） | **`30.1562px`** | **`30.1562px`** |
| `cssW` | `48px` | `48px` |
| `attrW` / `attrH` | `226` / `142` | `226` / `142` |
| `nw` / `nh` | 226 / 142 | 226 / 142 |
| 該頁 `docHeight` | 2528 | 2528 |

**機器判準（⛔ 不靠肉眼看表）**：把兩份 `--dump-dom` 輸出中的 ` h-auto` 字串抹掉後整份 diff：
```
$ diff <(去掉 h-auto 的 NO 版) <(去掉 h-auto 的 WITH 版)
（無輸出）diff_exit=0
```
⇒ **除了 className 那一個字串，四張圖的每一個量測欄位逐字相同。**

**console**
```
$ grep -E "CONSOLE" 65-console-NO-h-auto.err
  "TPCTRL-has either width or height modified, but not the other"     ← 本驗證者注入的正控
  "TPCTRL-Image is missing required \"src\" property"                  ← 本驗證者注入的正控
$ grep -E "CONSOLE" 65-console-WITH-h-auto.err
  （同上兩條，⛔ 無其他）
```
⇒ 兩個版本**都⛔ 沒有** Next 真正發出的 `has either width or height modified, but not the other`；
兩條 `TPCTRL-` 是本驗證者刻意注入的**正控**，證明這個擷取管道抓得到該類訊息（⛔ 不是空測）。
（兩份 `.err` 為不同次執行：Chrome PID `21751` vs `21948`。）

**機制實查（⛔ 不是推理）**——Tailwind preflight 本來就給 `<img>` `height: auto`：
```
$ sed -n '377,381p' node_modules/tailwindcss/src/css/preflight.css
img,
video {
  max-width: 100%;
  height: auto;
}
$ grep -n "height: auto" node_modules/tailwindcss/src/css/preflight.css
237:  height: auto;
380:  height: auto;
```
且它**確實被送到瀏覽器**（⛔ 不只是在 `node_modules` 裡）：
```
$ curl -s http://localhost:3100/_next/static/css/app/layout.css | sed -n '495,499p'
img,
video {
  max-width: 100%;
  height: auto;
}
```

**還原證明**
```
$ cp <scratchpad>/sponsor-page.tsx.bak app/sponsor/page.tsx
$ diff <bak> app/sponsor/page.tsx        → （無輸出）diff_exit=0
$ shasum -a 256 app/sponsor/page.tsx
  3cd1bb581f96c0a9ad91f3513a9055f19f1bc0cf36c38ccb1c37046ceb0765ad   ← 與改動前逐字相同
$ git status --short app/sponsor/page.tsx → `M  app/sponsor/page.tsx`
  （⛔ 不是 `MM` ⇒ 工作樹已完全回到 staged 內容，staging ⛔ 未被動過）
$ sed -n '165p' app/sponsor/page.tsx      → 含 `w-12 h-auto object-contain brightness-0 invert`
$ rm public/tpMeasure.html; git status --porcelain | grep -i tpMeasure → （無命中）
```
備份檔路徑：`/private/tmp/claude-501/-Users-quasi-pc-Desktop-Projects-Nameless-Realms-namelessrealms-web/cef371bf-ba51-4336-bd13-a85d6c48e8a6/scratchpad/sponsor-page.tsx.bak`

**結論：✅ 通過——「有沒有 `h-auto` 結果完全相同」成立。**

⚠️⚠️ **由此浮出一件事實（⛔ 本驗證者不做裁決，只據實記）**：
`F9-plan-review.md` 的 **⛔ 1** 判定「#2 換 `next/image` 後框會變成 48×142、比現在高 112px」，
並據此新開了**裁決點 ⑨**。**本驗證者實測推翻這個前提**：拿掉 `h-auto` 之後
rect 仍是 **48 × 30.16**、computed `height` 仍是 **30.1562px**，⛔ 沒有任何一欄改變。
成因：`height="142"` 只是**呈現屬性提示**，優先序低於**任何**作者樣式表規則，
而 Tailwind preflight 的 `img { height: auto }`（preflight.css 第 380 行、送出的 CSS 第 498 行）
**對全 repo 每一張 `<img>` 都生效** ⇒ `h-auto` 這個 utility class 在本 repo 是**冗餘**的。
⇒ 裁決 ⑨甲 所加的 ` h-auto` **無害但不必要**，且它是 10 處裡**唯一**一處偏離
「`className` 逐字保留」的地方。

✅ **處置已定案：留**（⛔ 不是待裁，⛔ 不擋路，⛔ 不必改碼、⛔ 不必重跑 P5）。
主迴圈 2026-09-12 轉達：架構師**前後拍板兩次，第二次是知情後的重新確認**——
2026-09-11 首次裁「甲（加）」時的前提，正是上面被本驗證者推翻的那一條；
主迴圈其後**據實回報前提不成立**，並明講當初只驗了因果鏈前半段（只查 Next、⛔ 沒查 preflight）就回報「已驗證」；
架構師在知情後逐字答「**留**」，理由兩點：**不必依賴 preflight 一直存在**、
**與 `app/team/page.tsx` 既有 `h-auto` 寫法一致**。規劃側已回填 `F9-plan-review.md` 第 10 列。
⇒ 本節的實測結論（`h-auto` 在現況下冗餘）**成立且已成為該裁決記錄的一部分**，
它證明的是「加了也不會壞」，⛔ 不是「應該拿掉」。本驗證者⛔ 未動那一行、⛔ 未代填任何批覆。

---
## 與既有兩份報告的比對

> ⚠️ 以下是**八節結論全部寫定之後**才開 `F9-verification.md` 與 `F9-verification-audit.md` 做的比對。
> 本驗證者⛔ 未因比對而回頭修改上面任何一個數字。
> ⚠️ 比對時發現 `F9-verification.md` 已被原實作側於 2026-09-12 更新過（狀態 `AM`，含「同碼連拍補拍」一節）
> ——那是**他們的**產出，⛔ 不是本輪所為。

| # | 事項 | 本驗證者實測 | 兩份報告的說法 | 判定 |
|---|---|---|---|---|
| 27 | N1 canary | `exit=1`、`grep -c` 印 **1**、命中檔恰為 canary；刪除後 `exit=0`、四重確認乾淨 | verification：`exit=1`、命中 `./data/lintCanary.tsx`、刪除後 `git status` 無輸出 | **✅ 一致** |
| 28 | `--frozen-lockfile` | `exit=0`；`yarn.lock`／`package.json` **md5 前後逐字相同**；`node_modules` 351 | verification：`exit=0`、`git diff --stat` 無輸出 | **✅ 一致**（本輪**多加**了報告沒有的負向對照） |
| 35 | dev 終端 log | `⨯`／`Error:`／`Unhandled`／`error`／`Warning` **各 0 命中**，正控 `Compiled` **6** 命中、四頁皆有 `✓ Compiled` | verification：`grep -nE "⨯\|Error:\|Unhandled\|error"` 無命中 | **✅ 一致**（稽核側指其 log **未落檔**——本輪已落檔 `35-dev-3100.log` / `35-dev-3100-full.log`，並補上報告缺的配對正控） |
| 36 | 四頁 console | 四頁⛔ 無 `missing required "src"`、⛔ 無 width/height-modified、⛔ 無錯誤覆蓋層；`/`、`/sponsor`、`/team` 各 **1 條 404**、`/modServer` **0 條**；404 = grainy，**HEAD 版執行期同樣存在** | verification：同樣四項皆無；404 為既有、HEAD 版逐頁有一模一樣三筆 | **✅ 一致**（詳見下方「兩點差異／補充」第 1 點） |
| 44 | `home.png` 連拍 | 同碼連拍兩次 `home.png` 雜湊不同（`c59e4226…` / `04871702…`），另三頁**兩次逐位元組相同**；像素級 8.342% vs 改前改後 11.108%、空間分布同形；`sponsor` 對照 **0 個差異像素** | verification（2026-09-12 補）：`after/home.png` `cb65a0a3…` vs `after-recheck/home.png` `5cf5806e…` 不同，另三頁同雜湊 | **✅ 一致，且本輪交叉驗到他們的新證據**（見第 2 點） |
| 54 | worktree `yarn build` | `exit=0`，含 `Linting and checking validity of types`、13 條路由、`Done in 6.71s.` | verification：`exit=0`、`Done in 9.00s.` | **✅ 結論一致**；`Done in` 秒數不同屬**不同次執行**的正常差異，⛔ 不是矛盾。依鐵則 7，本報告只採本驗證者自量的 **6.71s** |
| 55 | worktree canary | `exit=1`、`grep -c` 印 1；刪除後 `git status` 仍恰 **9 檔 ` M`** | verification：`exit=1`、刪除後仍是那 9 檔 | **✅ 一致** |
| 65 | `h-auto` canary | 有無 `h-auto`：rect 皆 `48×30.16`、computed `height` 皆 `30.1562px`、`docHeight` 皆 2528、**除 className 外量測輸出逐字相同**；console 兩版皆無該警告（配 TPCTRL 正控）；`.bak` 還原後 shasum 相同、`git status` 回到 `M ` | verification「裁決 ⑨ 的實測」：rect 仍 `{"x":882,"y":1913,"w":48,"h":30.16}`、console 無該警告、`.bak` 還原 `diff` 無輸出，並明寫「**前提不成立**」 | **✅ 一致**（含「⑨ 的前提不成立」這個結論本身） |

**統計：8 條全部與既有報告一致；⛔ 0 條不一致。**
⚠️ **無法取證者 1 項（局部）**：第 36 條的「**HEAD 版瀏覽器 console**」⛔ 未能重播——
本輪後段 Browser 面板整個無回應（`navigate` / `preview_start` / 連 `javascript_exec` 的 `1+1` 都逾時）。
已改以 HEAD worktree 的**執行期**證據（送出的 CSS 含該 URL、該 URL 實測 404、頁面層相關性）替代，
⇒ 結論同樣成立，但**取證手段與 verification 不同**，據實標示。

### 兩點差異／補充（⛔ 不是矛盾，但應留痕）

1. **LCP 警告**：verification 寫「⛔ 沒有 LCP `Please add the "priority" property` 警告」。
   本驗證者在**乾淨的**每頁新分頁量測中**同樣沒有**看到 ⇒ 該句對「乾淨載入」成立。
   ⚠️ 但本輪**第一次**讀 console 時（分頁緩衝**累積**、含先前造訪殘留）確實出現過一條：
   `Image with src "/images/team.png" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property if this image is above the fold.`
   ⇒ 該警告在某些載入時序下**是會出現的**。它是 `console.warn`、⛔ 不是 error，屬任務包背景 §B-7
   明列的**允許警告**，⇒ ⛔ 不影響 F9 過線、⛔ 不因它加 `priority`。
   ⚠️ 那條殘留的來源（是本輪的第一次載入，還是面板沿用先前工作階段的緩衝）**⛔ 未查明**，
   本驗證者⛔ 不替任何人解釋。建議 verification 把該句由「沒有」改為
   「**乾淨載入下沒有；累積緩衝中曾見一條 `/images/team.png` 的 LCP `console.warn`（允許的警告）**」。

2. **`e40936a1…` 那張圖**：稽核側指它不在 `.evidence/` ——**至今仍然不在**（本驗證者⛔ 未去找、⛔ 無從複核）。
   原實作側已於 2026-09-12 承認並**重拍落檔** `after-recheck/`（4 張）。
   ⭐ **本驗證者獨立驗證了他們的新證據**（自己 `shasum`，⛔ 非轉抄）：
   ```
   5cf5806efc7041e1748594e64845ef7a69221cefe586b4653b2209530967d126  after-recheck/home.png
   84de39f29250fb8b9c2aec2ca0e4ae5d92516bae19f6dde47c95c74d204d6aa3  after-recheck/modServer.png
   0a495a16bee2594e8e68b4f165ee4ded2fb0e5a72da7e414d191b76eca731f5d  after-recheck/sponsor.png
   4e3fc443554d728c379e4078147cb5ee89f8a2cc20b9daeb40ec3e2c0a89a131  after-recheck/team.png
   ```
   ⇒ 其中 `modServer` / `sponsor` / `team` 三張的雜湊，與**本驗證者自己拍的** `burst1` / `burst2`
   **完全相同**（同一組 `84de39f2…` / `0a495a16…` / `4e3fc443…`）
   ⇒ 兩人、兩個時間、四趟擷取得到同樣位元組 ⇒ 擷取管線確定性**跨人成立**。
   而 `home.png` 在這四趟得到**四個不同雜湊**（`cb65a0a3…` / `5cf5806e…` / `c59e4226…` / `04871702…`）
   ⇒ 「同碼連拍也會不同」這件事**已由兩個獨立來源各自證出**。

### 本輪額外查出、⛔ 不在原 8 條內的事實（供架構師參考，⛔ 非裁決）

> ⭐ 下列第 **1** 與第 **3** 條是本輪最該被單獨引用的兩條（主迴圈 2026-09-12 指定獨立成條），
> ⛔ 不要當成附註讀過去。

1. ⭐ **worktree 內容 == 主樹 staged blob（九檔雜湊全同）**——**原本沒有任何一條驗收用機器判準證過這一環**。
   作法：`git ls-files -s <檔>`（主樹 index 的 blob）對 `git hash-object <worktree 的同名檔>`，九檔逐檔比對，全部 `SAME`。
   **意義**：在 worktree 跑的 lint／build（第 54、55 條）**因此才真的等於在驗要進 commit 的內容**，
   ⛔ 不是在驗工作樹版（工作樹的 `ServerSection.tsx` 還帶著 173 行未 commit 舊改動，兩者⛔ 不同）。
   ⚠️ 少了這一環，第 54／55 條的 `exit=0` 只證明「某棵樹過得了」，⛔ 證明不了「commit 內容過得了」。
2. **`.next/standalone/node_modules` symlink 陷阱是真的**——本輪 build 實際產生了它（時間戳 `Sep 12 00:13`），
   已只移除連結本身，主樹 `node_modules` 仍 351 項。
3. ⭐ **`home.png` 全圖雜訊的機制已查清**：`components/HomeHero.tsx` 第 7 行 hero 是 `h-screen`、第 10 行內含 `<video>`，
   而 `capture.sh` 第 14 行用 `--window-size=1280,${H[$k]}`、`H[home]=3114`
   ⇒ **截圖當下 `100vh` 就是 3114px，影片填滿整張 1280×3114**，後續區塊疊在它上面。
   **意義**：這正是為什麼「像素級 8.34%（同碼連拍）vs 11.11%（改前改後）、邊界框都是 `(0,0)-(1279,3098)`」
   **⛔ 不構成版面變動的證據**——差異覆蓋全圖是**預期**，⛔ 不是版面位移。
   ⚠️ 少了這條機制解釋，那兩個百分比很容易被誤讀成「改後版面全頁都變了」。
4. **`h-auto` 在本 repo 是冗餘 utility**（Tailwind preflight 第 380 行已給全站 `img { height: auto }`，
   且該規則確實出現在送出的 `layout.css` 第 498 行）⇒ 裁決 ⑨甲 的那個 ` h-auto` **無害但不必要**。
   ✅ **已定案：留**（架構師 2026-09-12 知情後重新確認；理由見 §65 結尾）。本驗證者⛔ 未動那一行。
5. **headless Chrome 拍完不自行退出**的已知陷阱，本輪**又重現一次**（`--dump-dom` 跑重運算腳本時卡住 >400s，
   須 `pkill`）⇒ `capture.sh` 現行的「背景執行 + 輪詢 + 強制 kill」寫法是必要的，⛔ 不可簡化。

---

## 本輪對 repo 狀態的影響（收尾實查）

```
$ git diff --cached --name-only | wc -l     → 31   （與開工時相同，staging ⛔ 未被動過）
$ git worktree list
  …/namelessrealms-web  df2b8ff [developers]
  …/nrw-f9-index        df2b8ff (detached HEAD)   ← 本輪⛔ 未移除（依 plan-review：架構師確認 commit 後才清）
  （本輪臨時建的 …/nrw-tp-head 已 `git worktree remove --force` 清除）
$ for p in 3100 3101 3102; do lsof -iTCP:$p -sTCP:LISTEN; done → 全部無輸出（兩個 dev server 皆已停）
```

**本輪新增的檔（本驗證者一律⛔ 未 `git add`，現況皆為 `??`；進版控由主迴圈統一逐檔處理）**

> ✅ **進不進 git 已定案（主迴圈 2026-09-12）：文字證據進、PNG ⛔ 不進。**
> ⚠️ 據實標明來源：這是**主迴圈依架構師既有兩次裁決的同一條理路所作的套用**，
> ⛔ **不是**架構師對本目錄的新裁決（主迴圈已在回報中告知他，他可推翻）。
> 理路＝他 2026-09-12 裁「evidence 根層四檔**要**進」時採納的理由：
> **沒有量測工具的定義，進版控的數據就沒有「這把尺是什麼」。**
> ⇒ 本檔與 `thirdparty/` 下的 **log／txt／py／sh 等文字檔進 git**；
> **8 張 PNG ⛔ 不進**（沿裁決 ⑥乙），⇒ 它們在 `git status` 是**預期的 `??`**，⛔ 不是漏 add。

- `docs/tasks/F9-thirdparty-recheck.md`（本檔）⇒ **進**
- `docs/tasks/F9-evidence/thirdparty/`：`burst1/` `burst2/` 各 4 張 PNG ⇒ **⛔ 不進（預期 `??`）**；以下文字檔 ⇒ **進**：
  `35-dev-3100.log`、`35-dev-3100-full.log`、`36-dev-3101-HEAD.log`、`54-worktree-build.log`、
  `44-pngdiff.py`、`44-pngband.py`、`44-pixdiff-{burst1-vs-burst2,before-vs-after,sponsor-control}.txt`、
  `44-band-{burst1-vs-burst2,before-vs-after}.txt`、
  `65-measure-{NO,WITH}-h-auto.html`、`65-console-{NO,WITH}-h-auto.err`

**本輪⛔ 未做的事**：⛔ 未 commit、⛔ 未 push、⛔ 未 `git add`、⛔ 未 `git reset`、
⛔ 未動 `CLAUDE.md`、⛔ 未動 `app/layout.tsx`／`app/staff/page.tsx`、
⛔ 未寫 `F9-plan-review.md`／`F9-verification-audit.md`、⛔ 未代填任何批覆或裁決。
⛔ 未讀、未印 `.env.local` 的任何值。

**所有臨時物皆已還原／移除**：`data/tpCanary.tsx`（主樹）、`data/tpCanary.tsx`（worktree）、
`public/tpMeasure.html`、`package.json` 的 `left-pad`、`app/sponsor/page.tsx` 的 `h-auto` 移除、
`nrw-tp-head` worktree、`.next/standalone/node_modules` symlink——**每一項都附了還原後的 `diff`／`shasum`／`git status` 證明**（見各節）。

---

## 收尾：本驗證者曾提出的三題，⛔ 均已有答案（⛔ 無待決事項）

> 主迴圈 2026-09-12 逐題回覆，本節據實轉錄處置與**來源層級**（架構師裁決／主迴圈套用），⛔ 不混為一談。

| # | 題目 | 處置 | 來源層級 |
|---|---|---|---|
| 1 | 裁決 ⑨ 加的 ` h-auto` 要不要留 | ✅ **留。已定案，⛔ 不擋路、⛔ 不改碼、⛔ 不重跑 P5** | **架構師裁決**（2026-09-11 首裁「甲」；2026-09-12 **知情後重新確認**「留」）。詳見 §65 結尾與 `F9-plan-review.md` 第 10 列 |
| 2 | `thirdparty/` 與本檔進不進 git | ✅ **文字證據（log／txt／py／sh／md）進；8 張 PNG ⛔ 不進**（沿裁決 ⑥乙，為**預期的 `??`**）。⛔ 本驗證者不自行 `git add`，由主迴圈統一逐檔處理 | **主迴圈套用**既有裁決理路（「沒有量測工具的定義，進版控的數據就沒有『這把尺是什麼』」），⛔ **不是**架構師對本目錄的新裁決；已告知他、他可推翻 |
| 3 | verification 第 268 行「⛔ 沒有 LCP 警告」要不要加限定語 | ✅ **由原實作側改他們自己的報告**，⛔ 不是本驗證者改。本檔**保留本驗證者的原始觀測**（「乾淨載入下沒有／累積緩衝中見過一次 `/images/team.png` 的 LCP `console.warn`、來源未查明」），⛔ 不等對方改完 | **主迴圈處置**；本驗證者「⛔ 不動別人的 verification」的判斷經確認**正確** |

### 教訓：會改動共用檔的負向對照，必須即時留痕或先告知並行的稽核側

本輪第 28 條的 `left-pad` 負向對照**做法正確、已被採認為正式證據**
（稽核側當時是唯讀、且 `yarn install` 被 `audit-write-guard` 擋在執行之前，
⇒ 它只能觀測到一個**來歷不明的暫態**並如實留痕——**那⛔ 不是對本驗證者的質疑**）。

⚠️ **但這件事暴露一個多代理並行下的真實風險，應成為往後的規矩**：

- **負向對照本身常常要動共用檔**（`package.json`／設定檔／原始碼），
  而那些檔**同時**在被別的代理唯讀觀測 ⇒ **注入到還原之間的那個窗口，任何人量到的都是紅燈**。
- ⇒ 規矩兩選一，**⛔ 不得都不做**：
  ① **事前**告知並行的稽核側「我要在 X 檔注入 Y、預計窗口多長」；或
  ② **即時**把注入寫進自己的報告（⛔ 不是等整輪結束才補），讓觀測者能在同一份檔裡對上。
- ⚠️ 本輪走的是「事後補寫」——結論正確，但**中間讓稽核側花了篇幅追一個非異常的暫態**。
  ⇒ 下次同類負向對照（尤其 `package.json`／`yarn.lock`／`.eslintrc.json` 這種全域閘門檔）**先留痕再動手**。
- ⚠️ 附帶提醒：本輪的還原用的是**備份檔**（`⛔ 不用 git checkout`）——這點⛔ 不可放寬，
  因為工作樹此刻帶著 31 項 staged 改動，`git checkout` 會把它們一起清掉。

### 狀態（本驗證者⛔ 無後續動作）

- staging 仍 **31** 項，⛔ 未被本輪動過；主迴圈將逐檔 `git add` 後 commit。
- ⛔ **push 仍未獲授權。** 本驗證者⛔ 未 commit／⛔ 未 push／⛔ 未 `git add`／⛔ 未 `git reset`。
- **本檔⛔ 無待回答項目。**
