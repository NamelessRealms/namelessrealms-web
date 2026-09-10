# Plan 審核：F10 把空目錄 `lib` 從 `next.config.js` 的 `eslint.dirs` 拿掉

> 規劃側（nr-planner）審 `docs/tasks/F10-plan.md`（2026-09-10 版，HEAD `3a15b70`）後落檔。實作側依此修正或動工。
> **阻斷點一律以 ⛔ 明標**；沒有 ⛔ 的條目是建議（可採納可說明不採）。
> 結論只有兩種：**放行**（過架構師確認後才實作）／**阻斷**（修 Plan 重審）。
> ⚠️ 規劃側**沒有 Bash**：本檔凡標「**實作側已跑、稽核側複驗**」者是 plan 貼出的執行結果，規劃側⛔ 沒有、也不能核過；
> 本檔以 Read / Grep / Glob 核過的數字標「檔案層已核」。
> 審核日期：2026-09-10。

## 審核結論

**✅ 放行**（三個裁決點全部寫明「依裁決 X」且與架構師 2026-09-10 拍板一致；驗收計畫 N0/P1/N1/P2/P3/P4/P5
逐條對應任務包、指令完整、預期 exit 明確、canary 皆為新檔以 `rm` / `rmdir` 清除、⛔ 無 `git checkout`；
改動範圍守界；進 commit 清單逐檔列且排除三個舊改動檔；⛔ 無任何 push 預授權措辭。
**⛔ 無阻斷點**。下方建議均不阻斷，實作側可採納或在 verification 說明不採。）

## 逐項審核

### 檔案層已核（規劃側用 Read / Grep / Glob 對過的數字，供實作側對照）

| plan 聲稱 | 規劃側核對結果 |
|---|---|
| §2.5：`next.config.js` 8 行、現行全文 | ✅ Read 逐字一致（第 4 行 `eslint: { dirs: [...] }`、第 5 行 `// 如果有其他配置可以加在這裡`、4 空白縮排、單引號）；檔尾有換行（Read 顯示第 9 行為空） |
| §2.2：`lib` 存在且為空 | ✅ Read 該路徑回 `EISDIR`（是目錄）、Glob `lib/**` 0 檔 ⇒ 與 plan 一致 |
| §2.4 B-1：`constants.js` 第 235–241 行 `ESLINT_DEFAULT_DIRS = ["app","pages","components","lib","src"]` | ✅ Grep 一致 |
| §2.4 B-1/B-5：`cli/next-lint.js` 第 121 行 `args["--dir"] ?? …eslint.dirs`、第 126 行 `filesToLint.length ? filesToLint : ESLINT_DEFAULT_DIRS`、第 128 行 `existsSync`、第 116 行 `baseDir` 的 `existsSync`、第 54 行 `errorOnUnmatchedPattern: args[...] ? … : false` | ✅ Grep 五處行號全部一致 |
| §2.4 B-3/B-4：`verifyAndLint.js` 第 33 行 `lintDirs`、第 35 行 `existsSync`、`eslintOptions` 只有 `cacheLocation`（第 42 行）、該檔零命中 `errorOnUnmatchedPattern` | ✅ Grep 一致（`errorOnUnmatchedPattern` 在該檔 0 命中） |
| §2.4 B-4：`runLintCheck.js` 第 134 行 `errorOnUnmatchedPattern: false` | ✅ Grep 一致（該檔僅此一處） |
| §6 三處 `CLAUDE.md` 錨點（107–109、191–192、237） | ✅ Read / Grep 逐字一致，可直接用於精確錨點編輯 |
| §1 表 ② 列「其餘四處 … 38 / 168 / 195 行」 | ⚠️ Grep 實數：`CLAUDE.md` 提到 `lib` 的行為 38、109、168、191、192、195、237 共 7 行；§6 三處覆蓋 109、191–192、237，其餘是 38、168、195 = **三處**（§6 引言寫的「三處」才對，§1 的「四處」是誤數，見建議 3） |
| §5-P2 引用 F8 P3' Run B（`F8-verification.md` 第 54–61 行） | ✅ 行號與內容一致 |
| §2.3 引用「與 F8 稽核 `exit=1` 一致」 | ✅ `F8-verification-audit.md` 第 344–348 行 `===== exit=1 =====`、第 460–461 行「`exit=1`（稽核側實測）」一致 |
| §5-N1「ESLint 只報第一個不匹配樣式」（任務包 B-6） | ✅ `F8-verification-audit.md` 第 351–358 行一致 |
| plan 全文無 push 預授權 | ✅ Grep `push` 三處命中（第 136、165 行是原始碼 `res.push`；第 261 行是 workflow 檔名；第 288、545 行是「commit / push 前回報，待架構師確認」禁令）⇒ 無 |
| §2.1 / §2.7 `git status`、§2.3 四次 lint 實跑、§2.4 版本 `14.1.0`（`node -e`）、§2.5 `wc` 實量、§2.6 殘留檢查 | **實作側已跑、稽核側複驗**——執行結果，規劃側查不到；驗收時依 §5 重跑即為複核 |

### ⛔ 阻斷點（必改，不改不得動工）

**無。**

### ⚠️ 建議（不阻斷）

1. **N1 還原指令的 exit 有兩種來源，⛔ 不能只憑「非 0」**。
   `rmdir f10-empty-canary && ls -ld f10-empty-canary; echo "exit=$?"`：
   若 `rmdir` 成功 ⇒ `$?` 是 `ls` 的非 0；若 `rmdir` 失敗（例如目錄非空）⇒ `&&` 短路、`$?` 是 `rmdir` 的非 0——**兩種情況 exit 都非 0**。
   plan 寫「`exit` 非 0（那是 `ls` 的 exit ⇒ 代表目錄已清）」這句推論不成立；
   **證據是 `ls: f10-empty-canary: No such file or directory` 那行原文**（plan 的預期輸出已含此行，verification 必貼）。
   建議 verification **附加**（⛔ 不取代任務包指令）單獨一條
   `ls -ld f10-empty-canary; echo "exit=$?"` ⇒ 預期 `exit=1` + 上述訊息。
   同族問題：N1 主指令 `mkdir f10-empty-canary && yarn lint …; echo "exit=$?"`——若 `mkdir` 因殘留而失敗，`exit=1` 會與 lint 的 `exit=1` 撞號；
   證據是 `No files matching '…/f10-empty-canary' were found.` 那行（plan 已列為預期）。§2.6 已確認無殘留，風險低，但 verification 請確保該訊息行貼出。
2. **P2 第三備援素材（規劃側交付；已由 F8 實證會對 `data/*.ts` 觸發）**。
   plan §8 說主素材與 `.tsx` 備援都觸發不了就停下回報——同意；但補一條**免裁決**的備援，避免為了驗收素材再繞一輪：
   F8 P3' 的 `data/lintCanary.ts` 實際觸發的是 **`import/no-anonymous-default-export`（warn 級）**
   （`docs/tasks/archive/F8-evidence.md` 第 195–208 行：`./data/lintCanary.ts` / `1:1 Warning: Assign object to a variable before exporting as module default import/no-anonymous-default-export`）。
   ⚠️ 這也證實 F8 **沒有**驗過 `rules-of-hooks` 對無 JSX `.ts` 是否觸發 ⇒ plan §9 把它標未驗是**正確的**。
   備援三內容（新檔 `data/lintCanary.ts`，⛔ 驗完必刪）：
   ```ts
   // F10 覆蓋證明用 canary（備援三）—— 驗完必刪，⛔ 不得進 commit
   export default { f10Canary: true };
   ```
   ⚠️ 用備援三時 P2 的預期**要改**：`yarn lint` ⇒ **`exit=0`**（warn 級不會非 0）、輸出含 `./data/lintCanary.ts` 與 `import/no-anonymous-default-export`；
   並**加跑** `yarn lint --max-warnings 0; echo "exit=$?"` ⇒ 預期 **`exit=1`**（借 `--max-warnings 0` 取非 0）。
   P2 的判準本來就是「`data/` 的 canary **出現在輸出**」，⛔ 不是 exit 本身；verification 寫明實際用了哪一個素材與規則名原文。
   優先順序維持：主素材 → `.tsx` 備援 → 備援三；三者全不觸發才是 §8 的停下回報情境。
3. **§1 表 ② 「其餘四處」與 §6 引言「三處（38、168、195）」不一致**。Grep 實數是三處（見上表）。verification 請統一寫**三處**，⛔ 不要把誤數帶進 `CLAUDE.md` 建議文字。
4. **§6.1 建議文字的日期「F10（2026-09-10）」**：任務包建議措辭寫 2026-09-09（裁「甲」之日），plan 寫 2026-09-10（拍板三裁決之日）。
   兩者都不是收案日；由主迴圈收案套用時填**實際收案日期**即可，實作側⛔ 不必改。
5. **N0 第一條的 exit 計量瑕疵（plan 異議 3）**：處置認可（證據取 `ls -ld` 輸出行）。
   同建議 1 的做法，verification 可**附加**一條 `ls -ld lib; echo "exit=$?"`（⛔ 不取代任務包指令），讓 `ls -ld` 自己的 exit 也有據。
6. **§2.4 `sed -n '30,46p'` 貼出 15 行**（對應 30–44，缺 45–46）——與結論無關（Grep 已核 33 / 35 / 42 行），verification 若重貼請據實貼全或改寫範圍。
7. **P4 第二條 `grep -n '//'`**：`next.config.js` 第 1 行 `/** @type … */` 不含 `//`，故兩側各應只回 `5:    // 如果有其他配置可以加在這裡` 一行——plan 預期「同一行」正確；verification 請把兩側輸出都貼、⛔ 不要只寫「相同」。

### ✅ 確認事項

- **裁決落位**：§1 表三行逐一寫明「①丙 / ②甲 / ③甲」，與架構師 2026-09-10 拍板一致；並據實註明「白話版摘要上拍板，⛔ 非審閱全文」——✅。
- **裁決① 丙的實施方式**：實作側⛔ 不改 `CLAUDE.md`，只在 verification 附建議文字，由主迴圈收案套用（沿 F8 `028c4eb` 慣例）——✅ 與任務包「誰改 `CLAUDE.md`」條一致；三處錨點逐字相符（見上表）。
- **裁決② 甲**：§3「不做什麼」第 1 條 ⛔ 不 `rmdir lib`；N0 基線已在目錄存在時量過、且 §4 步驟 0 要求動工當下重量——✅ 無時序風險。
- **裁決③ 甲**：§7「收案後續」只標記主迴圈回填 backlog，實作側零動作——✅。
- **驗收計畫逐條對應任務包 N0/P1/N1/P2/P3/P4/P5**：指令與任務包逐字相同、每條附 `; echo "exit=$?"`、預期 exit 明確（N0-B `1` / P1 `0` / N1 `1` / P2 `1` / P3 三條 `0` / P4 `diff` `1`）——✅。
- **負向對照分工**：N1 管旗標（`--dir` 隔離、真 `mkdir`、一次只一個空目錄）；P2 管設定被讀（`data` 不在 Next 預設清單 ⇒ canary 被抓 = `dirs` 被讀）——✅ 設計正確，且 §2.4 B-2 明寫「⛔ 不得用不存在的假目錄」。
- **canary 清除與時點**：§4 步驟 3–4 與 §5-P2「P3 之前必須確認 canary 已移除」、以 `git status --porcelain data/` 無輸出為證——✅；空目錄 `rmdir`、新檔 `rm`，⛔ 無 `git checkout`（§3 第 13 條）——✅。
- **改動範圍守界**：只動 `next.config.js` 一行、錨點定位、⛔ 不碰第 5 行註解 / 第 3 行 / `module.exports`、⛔ 不碰 `.eslintrc.json`、⛔ 不往 `lib/` 放檔、⛔ 不動 Dockerfile / workflow / `package.json` / `yarn.lock`、⛔ 不打 tag、⛔ 不 `npm install`、⛔ 不 `docker build`——✅ §3 十四條全數列出。
- **P4 既有註解全稱比對**：`git show HEAD:next.config.js | diff - next.config.js` 取 `diff` exit（管線最後一段 ⇒ 可當證據，plan 已自註）+ `grep -n '//'` 兩側對帳——✅ 符合守則 8 ⭐「⛔ 不抽查」。
- **進 commit 檔案清單**：`next.config.js`、`F10-plan.md`、`F10-verification.md` 逐檔列；⛔ 排除三個舊改動檔、canary、`CLAUDE.md`；⛔ 無 `git add .`——✅。
- **「CI／lint」欄措辭**：§5-P3 逐字「綠，但 `no-img-element` 已 off、10 處未修」——✅；並註明 P1-B 單獨不算數、N1 + P2 才是佐證——✅。
- **據實措辭**：§2.4 B-3/B-4 結論「本機才有的假失敗來源、⛔ 不得寫修好發版風險」；§5-P3 註明 `yarn build` 是回歸⛔ 不是「修好 build」——✅。
- **無 push 預授權**：§4 步驟 7、§7 檔尾均為「commit / push 前回報，待架構師確認」——✅（Grep 已核）。
- **HEAD `3a15b70`**：與本輪 git 快照最新 commit 一致（規劃側由派工上下文核對，⛔ 未執行 git）。

## 對任務包的回饋（含實作側六條異議的判定）

| plan 異議 | 規劃側判定 | 是否改任務包 / 背景 |
|---|---|---|
| 1. 背景 §2-1 寫「7 行」、任務包寫「8 行」矛盾 | **實作側對**（Read 逐字：8 行 + 檔尾換行）。**主迴圈已於本輪把背景檔第 36 行訂正為「8 行，`wc -l` 實量；原誤寫 7 行，實作側 2026-09-10 抓到」** ⇒ 本條結案。⚠️ plan 推測成因「漏數空行」是猜測，⛔ 不入紀錄。 | 已改（背景檔），任務包不必動 |
| 2. 任務包 §A 8 行自洽 | 非異議，留痕 | 否 |
| 3. N0 第一條 `ls -ld lib && ls -A lib \| wc -l; echo "exit=$?"` 的 `$?` 是 `wc` 的 | **實作側對**。這是**規劃側自認**的任務包計量瑕疵（與 `CLAUDE.md`「CI 現況」第 ④ 種空測同族）。plan 處置（取 `ls -ld` 輸出行為證、⛔ 不取 exit）**認可**；另見建議 5 的附加指令。 | 否（指令保留逐字一致，以註明處理；本檔即為修正紀錄） |
| 4. 進 commit 清單與 P5 的 `??` 一致 | 非異議，留痕 | 否 |
| 5. 背景 §2-3 第 2 點行號「125–130」略偏 | **不成立**：Grep 實核 `existsSync` 在 `cli/next-lint.js` 第 128 行；背景的 125–130 與任務包的 126–131 **都包含 128**，只是區塊起點取法不同，⛔ 都不算錯。`verifyAndLint.js` 33–37 亦相符（plan 自己也這樣判）。 | 否 |
| 6. 無阻斷級異議 | 同意 | — |

⚠️ 任務包裁決① 建議措辭裡的日期（2026-09-09）與 plan §6.1（2026-09-10）不同——見建議 4，由收案時定，⛔ 不重發任務包。

## 放行條件

- **照本檔即可動工，⛔ 不需修 plan 重審。** 建議 1–7 可採納或在 verification 說明不採；
  ⚠️ 唯一例外：P2 三種素材（主素材 / `.tsx` 備援 / 備援三）**全部**觸發不了 ⇒ 停下回報（plan §8），由規劃側列選項給架構師。
- 動工順序依 plan §4：`N0 重跑（改前）→ 改檔 → P1 → N1 → P2 → 移除 canary → P3 → P4 → P5`，每步只差一個變因。
- 提醒：實作完成產 `docs/tasks/F10-verification.md`（格式沿用 `docs/tasks/verification_template.md`，內含 §6 三處 `CLAUDE.md` 建議文字與 §9 仍未驗清單）；
  **commit/push 前回報待架構師確認**；⛔ 不打任何 tag。

## 裁決記錄（拍板後由 nr-planner 追加，⛔ 不另立檔）

> 📝 架構師在對話中拍板後，由 **nr-planner** 在本節**追加**一條（⛔ 不是主迴圈、⛔ 不是實作側）：
> **逐字轉錄**架構師原話或所選選項、標明「架構師 YYYY-MM-DD 於對話拍板」、甲/乙/丙選項原文保留存查。
> 未拍板的裁決點一律留「⏳ 待批覆」，⛔ 不得預填。本檔已放行後才拍的裁決**也追加在這裡**
> （架構師 2026-09-03 裁決：⛔ 不另立 `{代號}-decisions.md`，五件套不變六件套；先例 Meridian M1-8 檔末「結案裁決」節）。

⚠️ **據實聲明（兩輪皆適用）**：架構師這兩輪都是**在主迴圈提供的白話版摘要上拍板的**，
⛔ 未審閱任務包 `F10.md` 全文、⛔ 未審閱 `F10-plan.md` 全文、⛔ 未審閱本檔全文。
第 0 輪（2026-09-09）的甲/乙/丙/丁四案原文由主迴圈持有（vault 層），本 repo 僅 `F10-background.md` §一 留有甲、乙摘要；
第 1–3 項的甲/乙/丙選項原文保留於 `F10.md`「裁決點」節存查。

| # | 裁決點 | 架構師裁決（逐字） | 來源 / 日期 |
|---|---|---|---|
| 0 | F10 要不要開、怎麼解（主迴圈列甲/乙/丙/丁四案） | **甲：先開 F10，把 `lib` 從 `eslint.dirs` 拿掉**（一行改動；F6 日後放第一個檔進 `lib/` 時再加回。乙「往 `lib/` 放第一個真實共用檔、同時解 F6」被主迴圈評為「為抽而抽」，⛔ 未被選） | 架構師 2026-09-09 於對話拍板（白話版摘要上拍板） |
| 1 | ① `CLAUDE.md` 要改幾處 | **丙**（三處：CI 現況節 `eslint.dirs` 清單 + 撰碼規約 §B「第一個放進去的人」條 + 程式碼地圖 `lib/` 列） | 架構師 2026-09-10 於對話拍板（白話版摘要上拍板） |
| 2 | ② 硬碟上的空 `lib/` 刪不刪 | **甲**（不刪） | 架構師 2026-09-10 於對話拍板（白話版摘要上拍板） |
| 3 | ③ backlog F6 補一條「加回 `eslint.dirs`」 | **甲**（主迴圈收案時回填） | 架構師 2026-09-10 於對話拍板（白話版摘要上拍板） |
