# F8 背景交付件（主迴圈落檔，供 `nr-planner` 讀）

> ⚠️ 本檔存在的理由：規劃側**讀不到知識庫**（`vault-guard` 強制）。
> 依架構師 2026-09-04 裁決 D-1，主迴圈要交給規劃側的背景**先落成 repo 檔**再派它讀，
> ⛔ 不經派工訊息、⛔ 不抄進任務包。
> ⚠️ 本檔是**背景**，⛔ 不是任務包本身；任務包由 `nr-planner` 產出為 `docs/tasks/F8.md`。
> 落檔者：主迴圈，2026-09-07。

---

## 一、F8 是什麼（backlog 原文轉錄）

| # | 型別 | 內容 | 狀態 |
|---|------|------|------|
| F8 | 債 | **`yarn lint` 是空測**：`eslint` 8.57.1 與 `eslint-config-next` 14.1.0 都有裝，但⛔ **無任何 ESLint 設定檔**（`.eslintrc.json` 於 **2026-02-12** commit `5afda1a`「reorganize project structure and migrate to app router」被刪除）⇒ `next lint` 跳出互動式設定問卷、**exit 0 但⛔ 未 lint 任何檔案**。⚠️ 補設定後**必須驗證 `next lint` 真的會 fail**，⛔ 不得只看 exit 0（本次發現的成因正是 exit 0 不代表有 lint）。⚠️ 預期補上設定後會噴出大量既有錯誤 ⇒ 屬獨立工作量。 | ⬜ 未開始 |

**出處與裁決**：F1 執行過程中實測發現；架構師 2026-09-04 裁「**甲：另立任務**」
（⇒ ⛔ 不在 F1 內順手修掉，獨立成 F8）。

---

## 二、主迴圈已實跑的事實（2026-09-07 實查，規劃側無 Bash ⇒ 由此處提供）

> ⚠️ 以下為**執行後的實際輸出**，⛔ 不是推測。規劃側可直接引用，
> 但凡本節沒有的執行結果，一律標「⛔ 未實查，實作側必查」。

- `package.json` 第 17 行：`"lint": "next lint"`（⇒ `yarn lint` 就是 `next lint`）
- 已安裝版本（`node_modules` 實查）：`eslint` **8.57.1**、`eslint-config-next` **14.1.0**
- `package.json` 宣告：`"eslint": "^8"`、`"eslint-config-next": "14.1.0"`、
  `"next": "14.1.0"`、`"typescript": "^5"`
- **設定檔：一個都沒有。** 根目錄無任何 `eslint` 開頭的檔；
  全 repo（排除 `node_modules`）`find` 不到 `.eslintrc*`，也不到 `eslint.config.*`（flat config）；
  `package.json` 內**無** `eslintConfig` 欄位。
- 待 lint 的檔案數：`app/` `components/` `data/` `lib/` 底下的 `.ts` / `.tsx` 共 **27 個**。
- ⛔ **主迴圈尚未實跑 `yarn lint`**：目前的「exit 0 但未 lint」是 F1 當時的實測結論，
  ⚠️ 本次⛔ 未重跑 ⇒ 起始基準（exit code、輸出原文）**要由實作側自己跑一次並貼原文**。

---

## 三、本任務的硬約束（來自 repo `CLAUDE.md`，規劃側可自行複查）

1. ⛔ **不得為了測試打 `v` 開頭的 tag** —— 打 tag 就是發版（鐵則 4）。
2. **技術棧⛔ 不得擅自替換或引入未列的框架/套件**；要新增 devDependency 屬選型變更，
   ⇒ **是裁決點，必須列選項問架構師**，⛔ 不得自行決定。
3. 本 repo ⛔ **沒有 build/lint CI** —— 唯一 workflow 只在 tag `v*.*.*` 觸發。
   ⇒ 驗收一律以**本地嚴格指令輸出**為準，⛔ 不得寫「等 CI 綠」。
4. **套件管理器只用 yarn**，⛔ 不得跑 `npm install`（會讓已刪除的 `package-lock.json` 復活）。
5. 慣例工作分支 **`developers`**，⛔ 不是 `main`。
6. ⛔ **逐檔 `git add`**，⛔ 禁用 `git add .` —— 工作樹長期帶著三個與任務無關的舊改動
   （`app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`）。

---

## 四、⚠️ 本任務的核心紀律（⛔ 不可打折）

> 這條是 F8 的**存在理由本身**，⛔ 不是一般提醒。

**⛔ 補完設定檔後，不得以 `yarn lint` exit 0 作為「lint 通過」的佐證。**
必須有一次**負向對照**：**故意寫一段違規碼、證明 `next lint` 真的會 fail（非 0 離開）**，
再把它移除。⛔ 沒有負向對照，就只是把一個空測換成另一個空測。

⚠️ 本 repo 已經踩過**三次**同型的坑（都是「指令有跑、檢查沒跑」）：
1. `next lint` 無設定檔 ⇒ exit 0 但一個檔都沒 lint（就是 F8 本身）；
2. `git check-ignore` 對**已追蹤檔**恆回「不忽略」⇒ 拿它驗保護是空測（需 `--no-index`）；
3. `--debug` 的輸出**不寫 stdout**、寫在別處 ⇒ grep stdout 得到 0 命中，
   差點寫成「沒有警告」（2026-09-07）。

⇒ **判例：`exit 0` / 「grep 沒東西」⛔ 不等於「該檢查真的跑了」。**
凡把某指令當閘門，**必須有一次「它真的會 fail」的負向對照**。

⚠️ 另外：`next lint` 預設**不會**因 warning 失敗 ⇒ 嚴格指令要寫 `--max-warnings 0`，⛔ 不可省。

---

## 五、已知的規模風險（切包時必須先估）

補上設定後**預期會噴出大量既有錯誤**（27 個 `.ts`/`.tsx` 從未被 lint 過）。
⇒ 「補設定檔」與「修既有違規」很可能是**兩種工作量**。
⚠️ 這正是需要規劃側先估、再由架構師裁決範圍的地方 —— 例如：
只補設定 + 記錄違規清單／連同修完／先放寬規則再逐步收緊。
⛔ **規劃側不得自選**，一律列甲/乙/丙 + 建議與理由。

---

## 六、規格的等價物在哪

⛔ 本 repo **沒有 spec 主檔、也沒有 `DEV-INDEX.md`**（它是完成品）。
規格的等價物是 repo `CLAUDE.md` 的**程式碼地圖**與**地雷清單**；
前案裁決在 `docs/tasks/{代號}-plan-review.md` 的「裁決記錄」節
（該節骨架已於 2026-09-07 依 NR-D6 D-2 補進 `docs/tasks/plan-review_template.md`）。

⚠️ **裁決落檔慣例（NR-D6 D-1，2026-09-03 裁決）**：架構師拍板後的裁決，
由 `nr-planner` **追加在 `{代號}-plan-review.md` 檔末「裁決記錄」節**，逐字附日期；
放行後才拍的也追加同節；⛔ 不另立 `{代號}-decisions.md`。**F8 起適用。**
