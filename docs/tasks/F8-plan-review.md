# Plan 審核：F8 補回 ESLint 設定檔，讓 `yarn lint` 從空測變成真閘門

> 規劃側（nr-planner）審 `docs/tasks/F8-plan.md`（2026-09-07 版）後落檔。實作側依此修正或動工。
> **阻斷點一律以 ⛔ 明標**；沒有 ⛔ 的條目是建議（可採納可說明不採）。
> 結論只有兩種：**放行**（過架構師確認後才實作）／**阻斷**（修 Plan 重審）。
> ⚠️ 規劃側**沒有 Bash**：本檔凡標「**⛔ 未實查，實作側必查**」者都是需要執行才驗得到的事；
> 本檔以 Read / Grep / Glob 核過的數字標「檔案層已核」。
> 審核日期：2026-09-09。

## 審核結論

**⛔ 阻斷**（勘查品質很好、P3' 改寫正確；但 plan 是在裁決① 未定時寫的，
2026-09-09 架構師裁① = 丙之後，**步驟 3、P1、P2、N2 四處都還停在甲/乙/丁的假設上**，
且「規則 off 的理由寫在哪」這個必實測點沒有寫進 plan。修完 ⛔ 三點即可動工，⛔ 不需整份重審——
只需把改過的段落回報主迴圈過目。）

## 逐項審核

### 檔案層已核（規劃側用 Glob / Grep 對過的數字，供實作側對照）

| plan 聲稱 | 規劃側核對結果 |
|---|---|
| §1.3：待 lint 檔 27 個（app 12 / components 12 / data 3 / lib 0） | ✅ Glob 一致：`app/` 12（含 `app/api/**` 兩支 `route.ts`）、`components/` 12、`data/` 3 |
| §1.3：無 `pages/`、無 `src/pages` | ✅ Glob 無命中 |
| §1.7：勘查殘留已清（`.eslintrc.json`、`data/lintProbe.ts`、`components/LintCanary.tsx`） | ✅ Glob 三者皆不存在；根目錄亦無任何 `.eslintrc*` / `eslint.config.*` |
| §3 步驟 2：錨點 `output: 'standalone',` | ✅ `next.config.js` 第 3 行存在，且該檔目前**沒有** `eslint` 鍵 ⇒ 錨點唯一、可用 |
| `package.json` `"lint": "next lint"` | ✅ 第 17 行 |
| §1.4 的 10 條 / 7 檔 / 行:欄、§1.5 的兩個 run、§1.6 build exit、§1.7 `wc -c` = 529 | **⛔ 未實查**（執行結果，規劃側查不到）；⚠️ 這些是實作側自己量的實數，驗收時照 §4 重跑即為複核 |

### ⛔ 阻斷點（必改，不改不得動工）

1. **⛔ 裁決① 已裁「丙」，plan §2「裁決① —— ⏳ 待裁」、§3 步驟 3、§5 全部要改寫。**
   架構師 2026-09-09 裁：**在設定檔裡明確關掉 `@next/next/no-img-element` 這一條規則並寫明理由，
   另開一筆 backlog 日後處理那 10 條**；目的是讓 `yarn lint --max-warnings 0` 成為**真的會綠也會紅**的閘門，
   ⛔ 不是把 warning 清零。⚠️ 這與任務包 / plan §2 表格裡的「丙：把規則關掉 ⇒ 對這條規則又變回空測」
   **是同一個選項**，架構師是在知道這個代價之下拍的——plan 改寫時把這句代價**照樣留著**（進 verification、進 backlog 建議文字），⛔ 不得因為選了它就把「這條規則自此不被檢查」的事實抹掉。
   具體要改的位置：
   - **§2 裁決①**：改成「依裁決：丙」；設定檔內容改為
     ```json
     {
       "root": true,
       "extends": "next/core-web-vitals",
       "rules": {
         "@next/next/no-img-element": "off"
       }
     }
     ```
     （`rules` 鍵之外，其餘逐字同裁決② 甲；⛔ 不得順手多關第二條規則。）
   - **§2 裁決④**：改成「免裁（架構師 2026-09-09：①選丙 ⇒ 不動那三個舊改動檔）」。
   - **§3 步驟 3**：改成「⛔ 不改任何原始碼；把 §1.4 那 10 條（檔名 / 行:欄 / 規則）逐字抄進 verification，
     並附『建議 backlog 條目』文字（見 ⛔ 第 3 點）」。⚠️ 「若裁為乙：逐檔改…依裁決④…」整段刪除。
   - **§5 待裁決事項**：兩條都已裁，改成「無」或刪節。
   - **§3 步驟 5**（verification 內容）：「建議收案時改寫 `CLAUDE.md` CI 現況節的文字」必須**明寫**
     「`@next/next/no-img-element` 已於設定檔關閉、既有 10 處 `<img>` 未修、已列 backlog」——
     ⛔ 不得只寫「lint 已實測會擋」而漏掉這個洞。

2. **⛔ 驗收段 P1 / P2 / N2 三處要依「①＝丙」改寫，否則 N2 自己變空測、P2 停在錯的目標。**
   - **P2 目標狀態**：改為「`yarn install --frozen-lockfile` `exit=0`、**`yarn lint --max-warnings 0` `exit=0`（綠）並印
     『✔ No ESLint warnings or errors』**、`yarn build` `exit=0`」。⛔ 現行「甲、丁之下 lint `exit=1` 並附剩餘 10 條」
     與「乙之下三條全 0」兩段都刪；⛔ 不得再寫「嚴格指令尚紅」。
     ⚠️ 但 verification 的「CI／lint」欄仍須據實寫「**綠，但 `@next/next/no-img-element` 已 off、10 處 `<img>` 未修**」，
     ⛔ 不得只寫「lint 通過」四個字。
   - **P1 拆成兩段（P1a / P1b）**：丙之下設定檔一次寫完就直接綠，`yarn lint` 只會印「✔ No ESLint warnings or errors」——
     **沒有檔名、沒有規則名**，與任務包 P1「輸出有檔名 + 規則名」的判準對不上，也無法與 §1.4 的 10 條對帳。
     ⇒ 改成：
     **P1a**：先落**不含 `rules` 的**設定檔（= 裁決② 甲原文）跑 `yarn lint` ⇒ 預期 10 warning / 0 error / `exit=0`、
     檔名與 §1.4 逐條相符（這才是「真的 lint 到了 27 檔」與「勘查數字可重現」的證據）；
     **P1b**：把 `rules` 加進去再跑 ⇒ 預期「✔ No ESLint warnings or errors」、`exit=0`。
     ⚠️ P1a→P1b 的差只有那一條 `off` ⇒ 10 條消失即證明 off 生效且沒關錯規則。
   - **N2 素材必須換**：任務包 N2 的 canary 是 `<img>`（`@next/next/no-img-element`），該規則在丙之下已 off
     ⇒ 用它跑 `yarn lint --max-warnings 0` 會直接 `exit=0`，**N2 自己變成第五個空測**。
     改用 **`react-hooks/exhaustive-deps`**（任務包背景表已檔案層核為 **warn** 級，
     `eslint-plugin-react-hooks.development.js` 第 2579–2580 行）。素材（規劃側備好；新檔，⛔ 驗完必刪）
     ——`components/LintCanary.tsx` 整檔替換為：
     ```tsx
     // F8 負向對照用 canary —— 驗完必刪，⛔ 不得進 commit
     import { useEffect, useState } from "react";

     export function LintCanary({ id }: { id: number }) {
       const [v, setV] = useState(0);
       useEffect(() => {
         setV(id); // 故意漏列 id 於依賴陣列 ⇒ react-hooks/exhaustive-deps（warn 級）
       }, []);
       return <span>{v}</span>;
     }
     ```
     預期：`yarn lint` `exit=0` 且輸出**恰好 1 條** warning、規則名 `react-hooks/exhaustive-deps`、檔名 `components/LintCanary.tsx`；
     `yarn lint --max-warnings 0` **`exit≠0`**。⚠️ 丙之下既有 warning 已為 0 ⇒ 舊 plan「帶 canary 11 條／不帶 10 條」的對照**不再需要**，
     N2 變成乾淨的 1 vs 0。
     **⛔ 未實查，實作側必查**：此素材是否真的只觸發那一條（例如是否連帶觸發別的規則）——若觸發不了 warn，
     備援素材用 `@next/next/no-css-tags`（recommended 之下 warn 級；⛔ 規劃側未核行號，實作側以輸出的規則名為準）：
     `return <link rel="stylesheet" href="/x.css" />;`。無論用哪個，verification 要貼規則名原文。
   - **N1 / N1b / N3 / P3' 不受①影響**，維持原文。⚠️ N1 素材（`react-hooks/rules-of-hooks`）沒有被 off，仍成立。

3. **⛔ `.eslintrc.json` 能不能寫註解——⛔ 未實查，實作側必查；plan 必須先寫明「若不吃註解，理由寫在哪」。**
   裁決① 丙要求「寫明理由」。`.eslintrc.json` 是 JSON，**嚴格 JSON 不允許註解**；ESLint 舊式設定載入器
   歷來會先剝註解再解析（⛔ 這是規劃側的印象，⛔ 沒有核到 `node_modules` 行號、更沒有跑過），
   `next lint` 走的是不是同一條路徑也未驗。
   ⇒ 實作側在步驟 1 之前加一個探測：在設定檔放一行 `// ...` 註解跑 `yarn lint` ⇒
   `exit=0` 且輸出**不含** parse error 才算吃；貼原文進 verification。
   ⚠️ ⛔ **不得用 `"_comment": "..."` 之類的假鍵當備援**——ESLint 對 eslintrc 頂層鍵有 schema 驗證，未知鍵會整份設定報錯（⛔ 未實查，但這正是它不可當備援的理由：它本身就是要驗的東西）。
   plan 要寫明兩條路：
   - **吃註解** ⇒ 理由直接寫在 `rules` 那行上方，措辭至少含：「架構師 2026-09-09 裁決① 丙；既有 10 處 `<img>` 未修、見 backlog；
     ⚠️ 此規則自此不被檢查」。
   - **不吃註解** ⇒ 設定檔保持純 JSON、⛔ 不硬塞；理由改落在 (a) `F8-verification.md` 專節、(b) 給 `CLAUDE.md` CI 現況節的建議改寫文字、(c) backlog 建議條目文字。
     ⚠️ 另一條路是改用 `.eslintrc.js`（可寫註解）——**但這偏離裁決② 甲的檔案形式**，⛔ 實作側不得自選；
     若實作側認為值得，停下回報，由規劃側列選項給架構師。**規劃側建議**：不吃就走純 JSON + 三處落理由，
     ⛔ 不為了一行註解去改裁決過的形式。

### ⚠️ 建議（不阻斷）

- **§4 N0**：plan 說驗收時「以 §1.2 原文為準並註明取樣時點」——同意，但 verification 的 N0 段請**逐字複製** §1.2 那段輸出並標「取樣自 F8-plan.md §1.2，2026-09-07」，⛔ 不要只寫「見 plan」。
- **§4 P3'**：對照組會暫改 `next.config.js`；還原後除了 `git status --short`，也貼 `git diff --stat next.config.js`
  ——⚠️ 這裡的預期**不是空**（正式改動 `eslint.dirs` 那行本來就在），要對的是「diff 只有那一行」。
- **§3 步驟 1 與 ⛔ 第 2 點 P1a/P1b 的順序**：實作順序建議 P1a（無 rules）→ P1b（加 rules）→ N1 → N1b → N2 → N3 → P2 → P3'，
  讓每一步的差異都只有一個變因。
- **backlog 條目建議文字**（實作側寫進 verification，⛔ 不動 vault）：至少含「10 處 `<img>`、7 檔、行:欄清單、
  修法二選（換 `next/image` 會動視覺；或逐處 `eslint-disable-next-line`）、完成判準 = 從設定檔移除 `off` 後 `yarn lint --max-warnings 0` 仍綠」。
- **§1.5 結論 3** 已把「error 級會讓 `next lint` 非 0」實測過一次（自製 canary）；N1 用指定素材重跑後，verification 可把兩次並列，證據更耐久。

### ✅ 確認事項

- 裁決② 甲：設定檔內容、`root: true`、零套件、⛔ 不用 `--strict`（§1.3 已坐實無 `pages/`）——✅ 與任務包一致。
- 裁決③ 乙：`dirs` 吃 `middleware.ts` 已由 §1.5 **含對照組**實測 ⇒ 乙原樣採用、混合方案不觸發——✅ 設計正確。
- **P3'（canary 正控＋對照組）取代任務包 P3**：任務包 P3 用 `-f json` 的 `filePath` 清單當覆蓋證明是**空測**
  （plan §1.5 核到 `customFormatter.js` 第 80 行先過濾 0 問題檔）——✅ 任務包這一步是規劃側的錯，P3' 是正確的改法；架構師 2026-09-09 已認可。
- 守界：⛔ 不裝套件、⛔ 不動 Dockerfile / workflow、⛔ 不打 tag、⛔ 不 `npm install`、⛔ 不 `git add .`、還原用備份檔——✅ §1.7、§3、§4 都有寫到並在勘查中實踐（§1.7 對帳與 §1.1 逐字相同）。
- **無隱含 push 預授權**：§3 步驟 6「⛔ commit / push 前回報，待架構師確認。⛔ 不打任何 tag」——✅；「進 commit 的檔案」段只列清單、未寫「即可 push」——✅。
- 三個舊改動檔：丙之下不會被動到——✅（§2 裁決④耦合分析正確）。
- 進 commit 檔案清單：`.eslintrc.json`、`next.config.js`、`F8-plan.md`、`F8-verification.md`——✅；`F8.md` / `F8-background.md` 與本檔依架構師 2026-09-07 指示「等裁決記錄補完後再一起 commit」，由收案時處理。

## 對任務包的回饋

- **任務包 P3 前提錯誤**（規劃側自認）：「JSON formatter 連 0 問題的檔也列」不成立，`next lint` 的 formatter 在輸出前先濾掉無訊息的檔。
  ⇒ 以 plan §4 的 P3' 為準；架構師 2026-09-09 已認可，⛔ 不另重發任務包，本檔即為修正紀錄。
- **任務包 N2 素材**在裁決① 丙之下失效（見 ⛔ 第 2 點）；替代素材已在本檔備好。
- 任務包裁決① 的規模預估（「大概會噴一堆」）與實數（10 warn / 0 error / 1 規則）差一個量級——⛔ 不影響選項結構，但 plan §1.4 的實數才是之後所有文件的依據。

## 放行條件

- 照上述 ⛔ 1–3 修 `F8-plan.md`（§2 裁決①④、§3 步驟 3 / 5、§4 P1a/P1b / P2 / N2、新增註解探測與備援路徑），
  **修完回報主迴圈過目即可動工，⛔ 不需再開一輪完整審核**；
  ⚠️ 唯一例外：若實作側想改用 `.eslintrc.js`（⛔ 第 3 點）⇒ 停下，那是要架構師再裁的。
- 提醒：實作完成產 `docs/tasks/F8-verification.md`；**commit/push 前回報待架構師確認**；⛔ 不打任何 tag。

## 裁決記錄（拍板後由 nr-planner 追加，⛔ 不另立檔）

> 📝 架構師在對話中拍板後，由 **nr-planner** 在本節**追加**一條（⛔ 不是主迴圈、⛔ 不是實作側）：
> **逐字轉錄**架構師原話或所選選項、標明「架構師 YYYY-MM-DD 於對話拍板」、甲/乙/丙選項原文保留存查。
> 未拍板的裁決點一律留「⏳ 待批覆」，⛔ 不得預填。本檔已放行後才拍的裁決**也追加在這裡**
> （架構師 2026-09-03 裁決：⛔ 不另立 `{代號}-decisions.md`，五件套不變六件套；先例 Meridian M1-8 檔末「結案裁決」節）。

⚠️ **據實聲明（兩輪皆適用）**：架構師這兩輪都是**在主迴圈提供的白話版摘要上拍板的**，
⛔ 未審閱任務包 `F8.md` 全文、⛔ 未審閱 `F8-plan.md` 全文。選項原文（甲/乙/丙/丁）保留於 `F8.md`「裁決點」節與 `F8-plan.md` §2 存查。

| # | 裁決點 | 架構師裁決（逐字） | 來源 / 日期 |
|---|---|---|---|
| 1 | 第一輪總批 | 「都你的建議」（＝採納主迴圈所提建議；白話版摘要上拍板） | 架構師 2026-09-07 於對話拍板 |
| 1a | ② 設定檔形式與是否新增套件 | **甲**：手寫根目錄 `.eslintrc.json`＝`{ "root": true, "extends": "next/core-web-vitals" }`，⛔ 零新增套件 | 架構師 2026-09-07（承「都你的建議」） |
| 1b | ③ lint 覆蓋範圍 | **乙**：`next.config.js` 加 `eslint: { dirs: [...] }`。（實作側已實測 `dirs` 吃 `middleware.ts` ⇒ 乙原樣採用） | 架構師 2026-09-07（承「都你的建議」） |
| 1c | ① 範圍、④ 三個舊改動檔 | **暫緩**，等勘查實數再裁 | 架構師 2026-09-07 |
| 1d | 文件 commit 時點 | `F8.md` 等文件等裁決記錄補完後再一起 commit | 架構師 2026-09-07 |
| 2 | 第二輪總批 | 「丙,P3' 認可,NR-D7 等 F8 裁完再做」（白話版摘要上拍板） | 架構師 2026-09-09 於對話拍板 |
| 2a | ① 範圍——既有違規怎麼辦 | **丙**：在設定檔裡**明確關掉 `@next/next/no-img-element` 這一條規則**並寫明理由，另開一筆 backlog 日後處理那 10 條。⇒ 目的是讓 `yarn lint --max-warnings 0` 成為**真的會綠也會紅**的閘門，⛔ 不是把 warning 清零 | 架構師 2026-09-09 |
| 2b | P3 改寫為 P3'（canary 正控＋對照組） | **認可** | 架構師 2026-09-09 |
| 2c | ④ 三個舊改動檔 | **免裁**（①選丙 ⇒ 不需要動那三個舊改動檔） | 架構師 2026-09-09 |
| 2d | NR-D7 | 「等 F8 裁完再做」（⚠️ 非 F8 範圍內事項，僅逐字留痕；內容不在本包） | 架構師 2026-09-09 |
| 3 | ⛔ 第 3 點備援路徑（若 `.eslintrc.json` 不吃註解、且實作側想改 `.eslintrc.js`） | ⏳ 待批覆（只在觸發時才需裁；規劃側建議：純 JSON + 理由落三處，⛔ 不改形式） | |
