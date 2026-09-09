# 驗收報告：F8 補回 ESLint 設定檔，讓 `yarn lint` 不再是空測

> ⚠️⚠️ **執行者是主迴圈，⛔ 不是實作側**（架構師 2026-09-09 裁「甲」）。
> 原因：實作側於 P3' 階段被用量上限中斷（4:10am 重置），其 context 內的所有輸出隨之遺失。
> ⇒ 主迴圈以 Bash **實跑同一組驗收步驟**並就地存證，⛔ 未以設計推理或預期值補寫。
> **本報告每一個數字與 exit code 都來自實跑**，逐字原文見 `docs/tasks/F8-evidence.md`（286 行）。
> ⚠️ 這是分工上的一次偏離，據實留痕於此，⛔ 不粉飾。

## 變更檔案

- `.eslintrc.json`（**新增**）— `{ "root": true, "extends": "next/core-web-vitals" }`
  + `"rules": { "@next/next/no-img-element": "off" }`，關閉理由以註解寫在該規則上方。
- `next.config.js` — 新增一行 `eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] }`。
- `docs/tasks/F8-evidence.md`（**新增**）— 驗收逐字原始輸出。
- ⛔ **無任何原始碼變更**（裁決① 丙 ⇒ 那 10 處 `<img>` 本次不修）。

## 設計重點

- **裁決② 甲**：手寫 `.eslintrc.json`，⛔ 零新增套件、`yarn.lock` 全程未動。
  ⚠️ ⛔ 未用 `yarn lint --strict` 產生 —— 本 repo 無 `pages/`，該路徑會印「設定成功」卻不寫檔。
- **裁決③ 乙**：範圍寫進 `next.config.js` 的 `eslint.dirs`，使 **lint 與 build 共用同一份範圍**。
  ⇒ `data/`（內容資料唯一落點）與 `middleware.ts`（鐵則 2 的一半）自此納入檢查。
- **裁決① 丙**：明確關閉 `@next/next/no-img-element` 並寫明理由，既有 10 處不修、另立 backlog。
  ⚠️ **代價據實聲明：這條規則自此對全 repo 不被檢查**，在該 backlog 完成前這個洞一直在。
- **裁決④ 免裁**：① 選丙 ⇒ ⛔ 未動那三個帶舊改動的檔。
- **`.eslintrc.json` 吃註解（實測）**：關閉理由直接寫在規則上方，⛔ 未使用 `"_comment"` 假鍵、
  ⛔ 未改成 `.eslintrc.js`（那會偏離裁決② 甲的形式）。

## 測試結果

> ⚠️ 每一步都以 `out=$(cmd 2>&1); st=$?` 取狀態碼，⛔ 未用 pipeline 取值（見末節「過程中的一次自我糾錯」）。

### 正向

| 步驟 | 內容 | 實際結果 |
|---|---|---|
| **P1a** | 暫時移除 `rules` 後 `yarn lint` | **10 條** `@next/next/no-img-element` warning、7 檔、`exit=0`；與 plan 勘查逐條相符 |
| **P1b** | 最終設定（含 `rules`）`yarn lint` | `✔ No ESLint warnings or errors`、`exit=0` |
| **P2** | 三條嚴格指令 | `yarn lint` `exit=0`／`yarn lint --max-warnings 0` `exit=0`／`yarn build` `exit=0` |

### 負向（⚠️ 本任務的存在理由，每道閘門都要證明它會 fail）

| 步驟 | 素材 | 實際結果 |
|---|---|---|
| **N1** | error 級 canary（`components/LintCanary.tsx` 內 `<script src>`） | `yarn lint` **`exit=1`**，`Error: Synchronous scripts should not be used … @next/next/no-sync-scripts` |
| **N1b** | 同一個 canary | `yarn build` **`exit=1`**、`Failed to compile.` ⇒ **閘門確實守得到發版路徑** |
| **N2** | warning 級 canary（`react-hooks/exhaustive-deps`，⚠️ ⛔ 不可用 `<img>` —— 該規則已 off，用它會變空測） | `yarn lint` `exit=0` 且**恰好 1 條** warning；`yarn lint --max-warnings 0` **`exit=1`** ⇒ 乾淨的 **1 vs 0**，證明 `--max-warnings 0` ⛔ 不可省 |
| **N3** | 移除 canary | `components/LintCanary.tsx` 已刪，`git status` 回到動工前狀態 |

- **還原方式**：一律 `cp` 自暫存備份檔（`.eslintrc.json` / `next.config.js` / `middleware.ts`），
  ⛔ **未使用 `git checkout`**（工作樹另有三個與本任務無關的舊改動）。
  還原後逐檔 md5 對帳相符；`middleware.ts` 與 HEAD **零行差異**。

### P3' 覆蓋證明（⛔ 不得以「設定裡寫了」當覆蓋）

| 回合 | 設定 | 輸出中出現的檔 |
|---|---|---|
| **Run A** | `dirs` 含 `'middleware.ts'` | `./data/lintCanary.ts`、`./middleware.ts` **都出現** |
| **Run B** | 從 `dirs` 拿掉 `'middleware.ts'`（對照組） | 只剩 `./data/lintCanary.ts`；**`middleware.ts` 消失，但其違規仍原封不動留在檔案裡** |

⇒ 差別只可能來自 `dirs` 那一項 ⇒ **`data/` 與 `middleware.ts` 確實被 lint 到**，是證明、⛔ 不是宣稱。
⚠️ 任務包原訂的 P3（用 `next lint -f json` 數檔案）**已判定為空測**並改寫為 P3'：
Next 的 formatter 在交給輸出前就濾掉「沒有 messages 的檔」⇒ 只會列出有問題的檔，
拿它當覆蓋證明會把「這檔很乾淨」與「這檔根本沒被 lint」混為一談。

## 本次未修的違規（依裁決① 丙，已列 backlog）

共 **10 處 / 7 檔**，全部是 `@next/next/no-img-element`：

| 檔案 | 位置（行:欄） |
|---|---|
| `app/sponsor/page.tsx` | 38:13、162:21 |
| `app/team/page.tsx` | 28:13、42:17 |
| `components/FeatureRow.tsx` | 33:21 |
| `components/FeatureSection.tsx` | 46:15 |
| `components/HomeHero.tsx` | 24:11 |
| `components/Navbar.tsx` | 29:11、79:15 |
| `components/ServerSection.tsx` | 90:33 |

⚠️ **完成判準（給日後那筆 backlog）**：從 `.eslintrc.json` 移除該條 `"off"` 之後，
`yarn lint --max-warnings 0` **仍為 exit 0**。
⚠️ 修法是把 `<img>` 換成 `next/image`，那牽涉尺寸／`fill`／`sizes`／外部網域白名單
⇒ 是**產品外觀變更**，⛔ 不是 lint 清潔工作，需要視覺回歸手段。

## 審計確認

- ⛔ 未新增任何 `console.log` / `console.error`；⛔ 無 token、webhook URL、`ADMIN_DISCORD_ID` 入 log。
- ⛔ 未讀取 `.env.local` 內容。

## 產物重建

- [x] 改過設定（影響 build 行為）→ 已跑 `yarn build`，`exit=0`（附輸出於證據檔）。
- [x] 另於 N1b 以 canary 證明 build **會**因 error 級違規失敗（`exit=1`）。
- [ ] 跨 repo 依賴：不適用。

## git 對帳

```
git log --oneline -1   → fc0af69 chore(claude): NR-D6 規矩與文件對齊……
git status --short     → 11 列（見下）
git rev-parse HEAD     → fc0af69ba088ba7c5a4bdd43c48ec63673ede46d
git ls-remote origin developers → 50a9facb820568866ca09f57169230e507ceabf3
```

⚠️ **本地 HEAD ≠ 遠端**：`fc0af69`（NR-D6 那筆）**尚未 push**，⇒ 據實標記，⛔ 非本任務造成。
⚠️ 本任務的產物（`.eslintrc.json` / `next.config.js` / 三份 F8 文件）**尚未 commit**。
⚠️ 工作樹另有：`.claude/TEMPLATE-VERSION`（架構師跑模板升級造成，另筆處理）、
`app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`（長期舊改動，⛔ 不進本次 commit）。

## CI／lint

- 本地：`yarn lint --max-warnings 0 && yarn build` → **綠（兩者皆 `exit=0`）**。
- ⚠️⚠️ **⛔ 不得只寫「lint 通過」**：本次的綠是在
  **`@next/next/no-img-element` 已被關閉、既有 10 處 `<img>` 未修**的前提下取得的（已列 backlog 建議）。
- ⚠️ **本專案沒有 build/lint CI**（唯一 workflow 只在 tag `v*.*.*` 時 build image）
  ⇒ 收案標準 = 本地嚴格指令逐字跑過並附輸出，⛔ 不得寫「等 remote Actions 綠」。
  ⛔ 未為測試打任何 tag。
- ✅ **本報告起，`yarn lint` 的 exit 0 首次成為有效佐證** —— 但依規約仍須連同 N1／N2 的負向對照一起引用，
  ⛔ 單獨的 exit 0 永遠不構成「檢查真的跑了」。

## 真機 E2E

不適用（⛔ 無原始碼變更、⛔ 無 UI 行為改動）。

## 回歸守門

- `yarn build` `exit=0` ⇒ 既有頁面編譯無誤。
- ⛔ 未動任何原始碼 ⇒ 執行期行為不變。
- `middleware.ts` 與 HEAD 零差異（P3' 用過的 canary 已由備份還原並對帳）。

## 守界聲明

- 只做任務包範圍：補設定檔（②甲）、設定覆蓋範圍（③乙）、關閉一條規則並記清單（①丙）。
- ⛔ 未新增套件、⛔ 未跑 `npm install`、⛔ 未動 `yarn.lock` / `package.json`。
- ⛔ 未改 `Dockerfile`、⛔ 未改 `.github/workflows/`、⛔ 未加 lint CI、⛔ 未打 tag。
- ⛔ 未動那三個舊改動檔、⛔ 未動 `.claude/` 任何檔、⛔ 未改 `CLAUDE.md`。
- **carryover**：
  ① 那 10 處 `<img>`（已列 backlog，完成判準見上）。
  ② `CLAUDE.md`「CI 現況」節目前仍寫著「`yarn lint` 是空測」——**本任務完成後該段已過期**，
     建議改寫，⚠️ 但那是 `CLAUDE.md` 語意變更 ⇒ ⛔ 未自行動手，附建議文字待架構師裁。
- ⛔ **尚未 commit/push，等待架構師確認。**

## ⚠️ 過程中的一次自我糾錯（據實留痕）

主迴圈第一次取 exit code 時用了 `${PIPESTATUS[0]}`，但本機 shell 是 **zsh**（陣列為 1-based、
變數名為 `pipestatus`）⇒ 所有 `exit=` 欄位**都是空的**，等於沒量到。
⚠️ 這與本 repo 已記錄的三次「指令有跑、檢查沒跑」是**同一型**（第四次）。
⇒ 改為 `out=$(cmd 2>&1); st=$?` 後重跑，並補一次**負向對照**（故意傳不存在的旗標，
確認取得 `exit=1`）證明取值機制真的抓得到非 0，才繼續後續步驟。
