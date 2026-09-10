# F10 背景交付件（主迴圈落檔，供 `nr-planner` 讀）

> ⚠️ 本檔存在的理由：規劃側**讀不到知識庫**（`vault-guard` 強制）。
> 依架構師 2026-09-04 裁決 D-1，主迴圈要交給規劃側的背景**先落成 repo 檔**再派它讀，
> ⛔ 不經派工訊息、⛔ 不抄進任務包。
> ⚠️ 本檔是**背景**，⛔ 不是任務包本身；任務包由 `nr-planner` 產出為 `docs/tasks/F10.md`。
> 落檔者：主迴圈，2026-09-09。

---

## 一、F10 是什麼（backlog 原文轉錄）

| # | 型別 | 內容 | 狀態 |
|---|------|------|------|
| F10 | 債 | **`lib/` 是空目錄卻列在 `next.config.js` 的 `eslint.dirs` 裡**（F8 產出）。現況無害（`yarn lint` 實測 `exit=0`），但若日後有人加上 `--error-on-unmatched-pattern`，ESLint 會因該目錄無檔而失敗（主迴圈 2026-09-09 實測 **`exit=2`**，並以「同旗標用在非空目錄 ⇒ `exit=0`」的對照組確認不是旗標打錯）。⇒ 解法二選一：F6 放第一個檔進 `lib/` 時本條自動消失，或先把 `lib` 從 `dirs` 拿掉。⚠️ 與 **F6** 相關聯。（Yu 2026-09-09 裁「記一行」） | ⬜ |

**架構師本次裁決（2026-09-09，白話版拍板）**：主迴圈列甲/乙/丙/丁四案，
架構師選 **甲：先開 F10，把 `lib` 從 `eslint.dirs` 拿掉**（一行改動；F6 日後放第一個檔進 `lib/` 時再加回）。
⚠️ 架構師是在白話版上拍板的，⛔ 不得寫成「已審閱全文」。
乙（往 `lib/` 放第一個真實共用檔、同時解 F6）被主迴圈評為「為抽而抽」，⛔ 未被選。

**關聯條目（同為 backlog，供任務包交代邊界，⛔ 本包不做）**：
- **F6**（債）：`lib/` 是空目錄 ⇒ 第一個放進去的人負責建立慣例。⚠️ 這條**不獨立開包**，隨其他任務順帶。
- **F9**（債）：10 處 `<img>` 未改 `next/image`（`@next/next/no-img-element` 目前在 `.eslintrc.json` 明確關閉）。
  與 F10 無直接關係，但都是 F8 產出；⛔ 本包不碰 `.eslintrc.json`。

---

## 二、主迴圈已實跑的事實（2026-09-09 實查，規劃側無 Bash ⇒ 由此處提供）

> ⚠️ 以下為**執行後的實際輸出**，⛔ 不是推測。規劃側可直接引用，
> 但凡本節沒有的執行結果，一律標「⛔ 未實查，實作側必查」。

### 2-1 現行設定（檔案原文）

`next.config.js` 全文（8 行，`wc -l` 實量；原誤寫 7 行，實作側 2026-09-10 抓到）：

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },
    // 如果有其他配置可以加在這裡
};

module.exports = nextConfig;
```

- `lib/` 在硬碟上**存在且為空**（`ls -la lib/` 只有 `.` 與 `..`）。
- `git ls-files lib/` ⇒ **0 個檔** ⇒ git ⛔ 不追蹤這個目錄（git 不追蹤空目錄）。
  ⇒ ⚠️ **fresh clone 之後 `lib/` 根本不會存在**；它只在本機硬碟上有。

### 2-2 lint 實跑（HEAD `3a15b70`，工作樹另有三個與本任務無關的舊改動，見 §三-6）

```
=== A: yarn -s lint --max-warnings 0 ===
✔ No ESLint warnings or errors
exit=0
=== B: yarn -s lint --max-warnings 0 --error-on-unmatched-pattern ===
No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/lib' were found.
exit=1
```

⚠️ **數字更正**：backlog 原文寫「主迴圈實測 `exit=2`」，但本次重跑得 **`exit=1`**，
F8 稽核報告（`docs/tasks/archive/F8-verification-audit.md` 第 344–348、460–461 行）
當時也是 `exit=1`。⇒ **以 `exit=1` 為準**；backlog 那個 2 是主迴圈先前的記錄錯誤
（可能是 zsh 下 pipe 取值出錯，即 `CLAUDE.md`「CI 現況」列的第 ④ 種空測）。
實作側⛔ 不得轉抄任一數字，**自己再跑一次貼原文**。

### 2-3 Next.js 14.1.0 對 `eslint.dirs` 的實際處理（`node_modules` 原始碼實查）

這三條會直接影響「拿掉 `lib` 到底解決了什麼」，規劃側請據此設計裁決點：

1. **內建預設 dirs 本來就含 `lib`**：
   `node_modules/next/dist/lib/constants.js` 第 235–241 行
   `ESLINT_DEFAULT_DIRS = ["app", "pages", "components", "lib", "src"]`。
   ⇒ 一旦 `next.config.js` 設了 `eslint.dirs`，**預設清單整個被取代**（⛔ 不是合併）；
   ⇒ 拿掉 `lib` 之後，日後 F6 往 `lib/` 放檔時**必須把 `lib` 加回 `dirs`**，否則 `lib/` 永遠不會被 lint。
   ⚠️ 這是甲案的**隱藏代價**，任務包必須明寫、且 `CLAUDE.md` 對應段落要留提醒。
2. **`next lint` 會自動略過「不存在」的目錄**：
   `node_modules/next/dist/cli/next-lint.js` 第 125–130 行：
   `if (!existsSync(currDir)) return res;`
   ⇒ 目錄**不存在**就不會送給 ESLint；目錄**存在但為空**才會被送進去、才會觸發 unmatched pattern。
3. **build 期 lint 走同一種略過邏輯**：
   `node_modules/next/dist/lib/verifyAndLint.js` 第 33–37 行，同樣 `existsSync` 過濾。
   ⇒ **build 期永遠不會因空目錄失敗**（規劃側 2026-09-09 檔案層已核）：`verifyAndLint.js` 第 39–44 行
   只傳 `{ cacheLocation }`，`runLintCheck.js` 第 134 行硬寫 `errorOnUnmatchedPattern: false`
   ⇒ 不論 Dockerfile `COPY . .` 有沒有帶進空目錄都撞不到；且 workflow 用 `actions/checkout@v4` fresh checkout，
   空 `lib/` 本來就不會存在。⇒ ⛔ 不需要跑 `docker build` 實查。

**綜合**：F10 所描述的失敗**只在「本機硬碟上存在空 `lib/`」時成立**；fresh clone 與（很可能）Docker build
都不會撞到。⇒ 它是一個**本機才有的假失敗來源**，⛔ 不是發版風險。這不改變架構師「甲」的裁決，
但任務包的「目標」與「驗收」措辭要據實，⛔ 不得誇大成「修好發版路徑」。

### 2-4 `CLAUDE.md` 內會被本任務牽動的段落（行號為 2026-09-09 HEAD `3a15b70` 實查，⚠️ 動手時一律以錨點文字重定位）

| 行 | 現行文字（節錄） | 與 F10 的關係 |
|---|---|---|
| 38 | `**\`lib/\`**：⚠️ **目前是空目錄**（2026-08-30 實查）。共用邏輯要放這裡。 | 不必改；但可考慮加一句「加檔時記得補回 `eslint.dirs`」 |
| 108–109 | 覆蓋範圍寫在 `next.config.js` 的 `eslint.dirs`（`app` / `components` / `data` / `lib` / `middleware.ts`）⇒ **lint 與 build 共用同一份範圍** | **必改**：清單少了 `lib` |
| 168 | 結構性變更同步更新程式碼地圖（……`lib/` 開始有東西時） | 可在此補「並把 `lib` 加回 `eslint.dirs`」 |
| 191–192 | 純函式外置放 `lib/`……`lib/` 目前是空的——第一個放進去的人負責建立慣例 | 可補同一句提醒 |
| 237 | 程式碼地圖 `\| \`lib/\` \| ⚠️ **空目錄**（共用邏輯預留位） \|` | 可補同一句提醒 |

⚠️ `CLAUDE.md` 是憲法檔，改動範圍屬裁決點（見 §四）。

---

## 三、本任務的硬約束（來自 repo `CLAUDE.md`，規劃側可自行複查）

1. ⛔ **不得為了測試打 `v` 開頭的 tag** —— 打 tag 就是發版（鐵則 4）。
2. **技術棧⛔ 不得擅自替換或引入未列的框架/套件**；本任務⛔ 不應需要任何新套件。
3. 本 repo ⛔ **沒有 build/lint CI** ⇒ 驗收一律以**本地嚴格指令輸出**為準：
   `yarn install --frozen-lockfile` / `yarn lint --max-warnings 0` / `yarn build`，⛔ 不得寫「等 CI 綠」。
   ⚠️ 「CI／lint」欄⛔ 不得單獨寫「lint 通過」，須寫「綠，但 `no-img-element` 已 off、10 處未修」。
4. **套件管理器只用 yarn**，⛔ 不得跑 `npm install`。
5. 慣例工作分支 **`developers`**，⛔ 不是 `main`。
6. ⛔ **逐檔 `git add`**，⛔ 禁用 `git add .` —— 工作樹長期帶著三個與任務無關的舊改動
   （`app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`）。
7. **改過原始碼 → 必重建產物**：`next.config.js` 是 build 讀的設定檔 ⇒ `yarn build` 要在報告裡附輸出。
8. **凡把某指令當閘門，必須有一次「它真的會 fail」的負向對照**，且負向對照本身要先證明量得準。
   本任務的天然負向對照就是 §2-2 的 B（改前 `exit=1`、改後應為 `exit=0`），
   ⚠️ 還要證明改後加 `--error-on-unmatched-pattern` 對「**存在但為空**」的目錄仍會 fail
   （例如臨時 `mkdir` 一個空 canary 目錄再以 `--dir` 指過去），否則「改後 exit=0」可能只是旗標沒生效。
   ⛔ **訂正（規劃側 2026-09-09 抓到）**：本條原寫「指向一個不存在的假目錄」——那會被 §2-3 第 2 點的
   `existsSync` 先濾掉、ESLint 根本看不到 ⇒ 得 `exit=0` 什麼都證明不了，是空測。另 F8 稽核報告
   第 351–358 行證明 ESLint **只報第一個**不匹配樣式 ⇒ 一次只放一個空目錄。
9. ⭐ **既有註解不得被靜默改動**：`next.config.js` 第 5 行有一行既有中文註解（`// 如果有其他配置可以加在這裡`），
   ⛔ 不得順手刪或改；收稿前以 `git show HEAD:next.config.js` 逐行比對。
10. **負向測試的還原一律用備份檔**，⛔ 不用 `git checkout`。
11. ⛔ **commit/push 前回報，待架構師確認**；任務包任何措辭均不構成 push 預授權。

---

## 四、規劃側需要設計的裁決點（主迴圈提示，⛔ 規劃側不自選）

1. **`CLAUDE.md` 改動範圍**：只改必改的 108–109 行清單（最小），還是連同 38 / 168 / 191–192 / 237
   一併補「加檔進 `lib/` 時要把 `lib` 加回 `eslint.dirs`」的提醒（完整）？
   ⚠️ §2-3 第 1 點顯示這個提醒**不是可有可無**——漏了會讓 `lib/` 永遠不被 lint 且沒人發現。
2. **硬碟上的空 `lib/` 目錄本身**要不要一併刪掉（它不在 git 裡，刪了對 repo 零影響；
   但 `CLAUDE.md` 多處寫「`lib/` 是空目錄」，刪了措辭要跟著改）。
3. **F6 關聯**：拿掉 `lib` 後，F6 的「第一個放進去的人」責任清單要不要在 backlog 層補一條
   「加回 `eslint.dirs`」——這是 vault 層的事，規劃側只需在任務包「收案後續」標記「主迴圈回填 backlog」。

---

## 五、規格的等價物在哪

⛔ 本 repo **沒有 spec 主檔、也沒有 `DEV-INDEX.md`**（它是完成品）。
規格的等價物是 repo `CLAUDE.md` 的**程式碼地圖**與**地雷清單**；
前案裁決在 `docs/tasks/archive/F8-plan-review.md` 的「裁決記錄」節（F8 四項裁決，含 `eslint.dirs` 的由來）。

**裁決落檔慣例（NR-D6 D-1）**：架構師拍板後的裁決，由 `nr-planner` 追加在
`F10-plan-review.md` 檔末「裁決記錄」節，逐字附日期；⛔ 不另立 `{代號}-decisions.md`。
