# Plan 審核：F2 移除入版控的 web.log + .gitignore 去重

> 規劃側審 `docs/tasks/F2-plan.md` 後落檔。實作側依此修正或動工。
> **阻斷點一律以 ⛔ 明標**;沒有 ⛔ 的條目是建議(可採納可說明不採)。
> 結論只有兩種:**放行** / **阻斷**(修 Plan 重審或修完動工,見「放行條件」)。

## 審核結論

**⛔ 阻斷(退回修正)** —— plan 的技術內容品質很高(預演實測、錨點法、守界自檢均正確,
對任務包的兩處補正也成立),**唯一的阻斷原因是證據落點**:plan 全篇採 `.evidence/F2/` 方案,
與架構師 2026-08-31 新裁定(裁定 B,採「丙」)牴觸。修正範圍明確、機械,
**照下方 ⛔ 必改事項逐條改完即可動工、免重審**(超出列明範圍才需重審)。

---

## 先立兩條硬約束(架構師已裁定,⛔ 非可翻案點)

### 裁定 A(2026-08-30):`yarn build` 必跑、`yarn lint --max-warnings 0` 明確豁免
- plan 步驟 5 已遵守(build 必跑、未自行豁免)✅。本 review 依裁定**不翻案**。

### 裁定 B(2026-08-31,新裁):⛔ 不開 `.evidence/` 目錄
- 驗證輸出**一律直接貼進 `docs/tasks/F2-verification.md`**——五件套的驗收報告本就是裝證據的地方,稽核側反正要逐條重跑。
- 開未追蹤目錄會踩 `CLAUDE.md` 地雷第 6 條(工作樹長期帶未收斂改動)的老問題;
  把 `.evidence/` 加進 `.gitignore` 則偏離任務包逐字終態(硬約束)。
- ⇒ plan §6.3 請架構師裁決的甲/乙/丙:**裁定為丙的變體**——甲、乙均不採;
  丙的「證據耐久」疑慮由「輸出貼進 verification.md(入版控)」解決,scratchpad 只放**過程性工作檔**。
- ⇒ `.gitignore` 逐字終態 ⛔ 維持任務包原樣,⛔ 不得為此新增 `.evidence/` 規則。

---

## 逐項審核

### ⛔ 阻斷點(必改,不改不得動工)

1. **⛔ 全篇移除 `.evidence/` 方案,改為「輸出直接貼進 `F2-verification.md`」**(裁定 B)。
   受影響位置逐一列出,⛔ 一處都不可留:
   - **步驟 0**:刪 `mkdir -p .evidence/F2`;各 `tee` / `>` 落檔改寫——
     指令輸出(基準 build、`git status --porcelain --ignored` before 快照、HEAD)
     **直接貼進 `F2-verification.md` 對應段**;
     過程性工作檔(`.gitignore` 備份、before 快照檔、awk 抽出的 target 檔)改放
     **實作側自己的 scratchpad 暫存目錄**,⛔ 不落 repo 內任何路徑。
   - **步驟 1**:`awk … > .evidence/F2/target.gitignore` 的落點改 scratchpad;
     `diff <scratchpad>/target.gitignore .gitignore` 的**實際輸出(含空輸出的證明方式,如 `; echo exit=$?`)貼進 verification**。
   - **步驟 4、5**:`tee .evidence/F2/…` 全改為輸出直接貼 verification
     (build 輸出至少含完整結尾摘要 + exit 狀態,⛔ 不得以「成功」二字代替實際輸出)。
   - **§4 前言**「全部輸出 tee 進 .evidence/」、**條 A / 條 B** 的檔案路徑:同步改 scratchpad + 貼 verification。
   - **§5 R-3**:回滾備份檔路徑改 scratchpad(回滾是**同 session 內**的需求,scratchpad 夠用;
     耐久證據的載體是 verification.md,兩者職責分開)。**R-6 整條刪除**(前提消失)。
   - **§6.3 整節改寫為「已由架構師裁定(丙變體),見 F2-plan-review.md」**,⛔ 不再是待裁決項。
   - ⚠️ 修正時用**錨點編輯**逐處改,⛔ 不整份重寫 plan(轉寫紀律同 WORKFLOW「知識庫維護慣例」)。

### ⚠️ 建議(不阻斷)

- **驗收第 9 條的指令逐字對齊**:任務包寫 `git diff --cached --name-only`,plan 用
  `--name-status`。後者是**加強**(多了 M/D 狀態字母,能驗「後者為 D 刪除」),予以認可;
  但建議取證時**兩條都跑**(成本一行),讓 verification 與任務包條文逐字對得上,稽核側零解讀成本。
- **錨點 3 的理由措辭**:plan 稱單錨 `.env*.local` 有「前綴混淆」風險——以 Edit 精確匹配語義而言,
  `.env*.local` 在現況檔內其實**唯一**(第 42 行的 `.env` 不含該字串),此理由不成立;
  但連 `# local env files` 一起錨**更保險、無害**,做法本身不必改,僅供紀錄精確。
- **§3 內容不變驗證**(`git diff --stat` 比對 92/89 基線):任務包沒有、plan 加的,屬合理加強,認可保留。

### ✅ 確認事項(審核時逐一核過,留痕供驗收對照)

**(a)由主迴圈實跑複驗、本 review 採信的三項**(⚠️ 規劃側無 Bash,git 層事實非本人實跑):
1. HEAD = `f9696a2`(完整雜湊 `f9696a2ec77b623e0ace6009748e366f645d4756`)——plan §0.1 相符。
2. **任務包確實漏寫 `git add .gitignore`**:任務包硬約束(第 175 行)寫「逐檔 git add(本次只有 .gitignore)」,
   但操作步驟全文無此步;驗收第 9 條卻需要它才成立。⇒ **plan §6.1 / 步驟 3 補上此步是對任務包漏寫的正確補寫,
   ⛔ 不是實作側改題,本 review 明白背書**。plan 附的預演證據(`git diff --cached` 只剩 `web.log` 一行)與
   `git diff --cached` 比對 index vs HEAD 的語義一致,判斷成立。
3. 工作樹未被 plan 階段動過:`git status --porcelain` 僅三個既有改動 + 未追蹤的 `docs/tasks/F2*.md`;
   `.gitignore` 仍 43 行 / 432 bytes;`web.log` 仍入版控。⇒ plan §7 守界聲明屬實。

**(b)本 review 以檔案層(Read/Grep)獨立核過的項**:
4. **現況 `.gitignore` 逐行核對**:43 行內容與 plan §0.2 表完全一致(第 36、39 行為空行,
   檔尾 37–43 為重複段,`.vscode` / `.env` 僅在檔尾出現一次)。
5. **四處錨點的唯一性**:`*.pem`、`.pnpm-debug.log*`、`# local env files`+`.env*.local`、
   `*.tsbuildinfo` 起頭的檔尾整段——在現況檔內**各僅一處匹配**,錨點編輯安全失敗性質成立。
6. **終態推導獨立驗算**:依四處錨點對現況檔手工推導,產物與任務包逐字終態**逐行一致**,共 **38 行**;
   位元組以主迴圈複驗的 432 為基底推算:432 + 21(新增 `.vscode\n`+`web.log\n`+`.env\n`)
   − 61(刪第 36–43 行)= **392**——與 plan 預告的 `wc -l -c` = 38 / 392 相符。
   **⇒ §6.2「第 36 行空行必須納入刪除範圍」的補正,判定正確**:只刪 37–43 會讓檔尾殘留孤兒空行、
   與逐字終態不符;錨點 4 從 `*.tsbuildinfo` 起頭把它一併吃掉是對的。**不改變終態,予以背書。**
7. **終態行號對點**:`web.log` 落終態第 28 行、`.env` 第 31 行、`.vscode` 第 21 行、
   `yarn-error.log*` 第 26 行——plan §4 表列的四條 `check-ignore -v` 預期行號**全部與獨立推導一致**。
8. **`grep -c '^yarn-error\.log$'` 1→0 判定確認**:終態上半段第 26 行 `yarn-error.log*`
   以 glob 完整涵蓋 `yarn-error.log`,檔尾精確字串行刪除後計數歸零是**正確且預期**,⛔ 不是弄丟規則;
   plan 加的條 C(`git check-ignore -v yarn-error.log`)正是涵蓋性的正面證據,認可。
   **⚠️ 稽核側注意:audit 時 ⛔ 不得把這個 1→0 誤判為退步。**
9. **忽略集合 before/after 快照 diff(plan §0.6 / 條 B)裁示:採,定性為「加強」⛔ 不是改題**——
   任務包 9 條照跑不減,快照 diff 是**疊加**的完整性證明,直接補上 §6.4 指出的抽樣缺口
   (鐵則 1 的零退步本來只靠第 4、5、6 條抽樣)。⚠️ diff 的 `??` 行會因新增的
   `docs/tasks/F2-plan.md` / `F2-plan-review.md` / `F2-verification.md` 而增加,判準以
   **`!!`(忽略)行僅多出 `web.log`、其餘一字不差**為準,verification 請照此措辭取證。
10. **髒工作樹上跑 `yarn build` 的安排(步驟 0 基準 build)裁示:足夠,無更好替代**——
    基準綠/紅 × 改後綠/紅的三種處置(R-1)完備;基準紅即停手回報、⛔ 不現場修 `.tsx`,
    符合 WORKFLOW「真機揭出的既有缺口不現場擴大處理」;任何 stash/還原三檔的替代方案都違反
    任務包「⛔ 不碰三個既有改動」,故基準對照組是唯一合規做法。
11. **回滾策略確認**:R-3 用備份檔還原 `.gitignore`、R-4 用 `git show HEAD:web.log > web.log`
    復原誤刪——**全程無 `git checkout`**,符合 CLAUDE.md 開發守則第 8 條與 WORKFLOW 第 4 硬要求 ✅
    (備份檔落點依阻斷點 1 改 scratchpad)。
12. **鐵則對齊**:鐵則 1(`.env` 保護零退步)由錨點 3 + 驗收第 4 條 + 快照 diff 三重保障;
    鐵則 4(⛔ 不打 `v` tag)、逐檔 `git add`、⛔ commit/push 前回報——plan 步驟 6 / §3 均已寫死 ✅。
    範圍守界:未動 `.ts`/`.tsx`/`data/`/Dockerfile/workflow/`CLAUDE.md`,未做 F1/F4–F6 ✅。
13. **驗收第 8 條時序拆分**(commit 前驗三檔守界、commit 後補驗 `web.log` 消失,verification
    據實標「待放行後補」):與任務包括號「於 commit 後驗」一致,且**誠實不冒充**,認可。
14. **check-ignore 語義說明**(§4:比對路徑字串、不看檔案是否存在)——語義正確,
    預先堵住稽核側誤判第 4 條(`.env` 檔不存在於硬碟)的空間,認可留存。
15. **plan §6.5**(`git ls-files` 查無時 exit 0,判準是「輸出為空」非退出碼):語義正確,認可。

**(c)⛔ 未實查、實作側必查項**(規劃側無 Bash,以下 plan 數值無法在檔案層複驗,
⛔ 本 review 不背書其值,只背書其方法;實作時重跑即自然複驗):
- md5 值(`68c2d3…` before / `c00fe3…` after)——實作時 `md5 -q .gitignore` 重跑比對。
- §1 預演 clone 的全部結果(byte-identical、`git rm --cached` 行為、第 9 條失敗重現)——
  實作時在真 repo 逐條重跑即為複驗。
- §0.5 的 `git diff --stat` 基線(92 insertions / 89 deletions)、§0.6 快照 13 行、
  §0.7 環境值(node v22.19.0 / yarn 1.22.18)——實作時重取,⛔ 不轉抄 plan。

---

## 對任務包的回饋

1. **任務包漏寫 `git add .gitignore` 操作步**(已由主迴圈複驗確認為任務包之失,非實作側改題)。
   本 review 已背書 plan 的補寫(見確認事項 2),**任務包不需重發**——以本 review 為準即可;
   收案後由規劃側在任務包歸檔版加註。
2. **任務包背景區刪除範圍少列第 36 行空行**(確認事項 6 已獨立驗算背書 plan §6.2 的補正)。
   同上,不需重發,歸檔時加註。
3. 任務包驗收第 6 條抽樣不完整(plan §6.4)——由條 B 快照 diff 補強,已於確認事項 9 採納。

## 放行條件

- **照 ⛔ 阻斷點 1 逐處修完 `F2-plan.md` 即可動工,免重審**;
  修訂僅限本 review 列明事項,若修訂超出列明範圍 ⇒ 重審。
- 動工後照裁定 A:`yarn build` 必跑(基準 + 改後各一次),`yarn lint` 豁免。
- 實作完成產 `docs/tasks/F2-verification.md`(沿用 `verification_template.md`,
  各驗收指令**實際輸出直接貼入**,⛔ 不得用預期值 / plan 預演值冒充已執行);
  第 8 條後半(`web.log` 自 status 消失)據實標「待放行 commit 後補驗」。
- ⛔ **commit/push 前回報,待架構師確認**——本 review 與任務包任何措辭均不構成 commit/push 預授權;
  `push-gate` 擋 push 是預期行為,⛔ 不得繞過。
