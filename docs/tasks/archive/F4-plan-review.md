# Plan 審核：F4 收斂 lock 檔——移除 package-lock.json + Dockerfile deps 去死碼

> 規劃側審 `docs/tasks/F4-plan.md` 後落檔。實作側依此修正或動工。
> **阻斷點一律以 ⛔ 明標**；沒有 ⛔ 的條目是建議（可採納可說明不採）。
> 結論只有兩種：**放行** / **阻斷**。

## 審核結論

**✅ 放行（條件式：⛔ 必改僅 1 項，照改完即可動工、免重審）**
—— plan 品質高：基準事實全數自行複驗、scratchpad 預演實測、錨點編輯、守界自檢完備；
對任務包的兩處缺陷（驗收第 4 條後半空測、第 10 條時序）的發現**成立且已由主迴圈實驗複驗**。
唯一必改：plan 自己新增的**條 D 判準寫錯**（把 F2 的期望值照搬到「檔案已真刪」的 F4 情境，
該期望在本任務下不可能成立），修正是單點機械改動，⛔ 超出列明範圍才需重審。

---

## 先立硬約束（架構師已裁定，⛔ 非可翻案點，實作側以本節為準）

1. **範圍恰三件**：①`git rm package-lock.json`（**連硬碟一起刪**）②`.gitignore` 補擋
   ③ Dockerfile deps 去死碼。⛔ 不得增減。
2. ⛔ **不得改 builder 的 `RUN npm run build`**（現況第 20 行；⚠️ 改後位移至第 17 行，見確認事項 8）。
3. **Dockerfile COPY 採精確 `yarn.lock`（⛔ 不留星號）**——2026-08-31 架構師裁「甲」。
4. **`yarn lint` 豁免、`yarn build` 必跑**——2026-08-31 架構師裁「甲」。
   實作側順手跑 lint 亦可，非驗收必要條件；build ⛔ 不得自行豁免。
5. **證據落點：⛔ 不開 `.evidence/`**，全部輸出直接貼進 `docs/tasks/F4-verification.md`；
   過程性工作檔（備份、awk 抽出檔）放實作側 scratchpad。
6. ⛔ commit/push 前回報待架構師確認；`push-gate` 擋 push 是預期行為。

---

## 逐項審核

### ⛔ 必改（修完即可動工，免重審）

1. **條 D（忽略集合快照 diff）的判準寫錯，⛔ 照現文執行必然對不上。**
   plan §4 條 D 寫預期為「**`!!`（忽略）行的差異僅為新增 `package-lock.json`**、其餘一字不差」
   ——這是 F2 條 B 的期望值原樣照搬，但 F2 的 `web.log` 是**保留檔案**（刪 index、留硬碟
   ⇒ 變成「存在且未追蹤且被忽略」⇒ 出現在 `!!`）；F4 的 `package-lock.json` 是**連硬碟真刪**
   （任務包範圍第 1 件），`git status --ignored` 只列**存在於工作樹**的檔案
   ⇒ 刪掉的檔**永遠不會**出現在 `!!` 清單。⚠️ 這正是 plan **自己在 §6.2 實測證明過**的語義
   （已追蹤 / 不存在的路徑不進 ignored 清單），條 D 卻沒跟著改。
   另「其餘一字不差」也不成立：after 快照必然多出 `M  .gitignore` / `M  Dockerfile` /
   `D  package-lock.json` 三行暫存狀態（步驟 4 在取證之前）。
   **改法（錨點編輯 plan §4 條 D 該格即可）**：判準改為——
   - **只看 `!!` 行：before / after 應零差異**（忽略集合零退步；`package-lock.json` 不會出現是**預期**，
     因為檔案已不存在）；
   - `??` 行僅多出 F4 流程文件、⛔ 不列入判準（plan 原文已有，保留）；
   - 暫存 / 修改狀態行的變化⛔ 不列入本條判準，由驗收第 9、10 條專責取證。
   - 「`package-lock.json` 被新規則忽略」的正面證據由**驗收第 3 條**（`check-ignore -v` 命中）承擔，
     ⛔ 不由本條承擔。
   **⚠️ 稽核側注意：修正後條 D 的 `!!` 零差異是正確預期，⛔ 不得誤判為「新規則沒生效」。**

### ⚠️ 建議（不阻斷）

- **R-4 回滾說明的一處措辭不精確**：plan 寫「`git add` 對**已在 index 的還原**仍有效」——
  `git rm` 之後該路徑**已不在 index**，還原出的檔案是未追蹤且被新規則忽略，
  裸 `git add` 會被拒。plan 已備「必要時 `git add -f`」兜底，做法可用不必改；
  更乾淨的完整回滾是**三檔一起還原**（`.gitignore` 先回 before 版，規則消失後 `git add` 即不需 `-f`）。
  僅供紀錄精確，不強制改文。
- **條 4c 負向對照的複本時效**：預演 clone 位於 plan session 的 scratchpad；若實作時
  該複本已不存在，重新 clone（或以最小 fixture repo 重現）即可，證據照樣貼 verification。
  ⛔ 維持 plan 原則：負向對照只在 scratchpad 複本做，⛔ 不在真 repo 改 `.gitignore` 再改回。
- **步驟 6 的 `tail -30`**：若 install 失敗且錯誤在前段，`tail` 可能截掉關鍵訊息——
  失敗時請改貼完整輸出（成功時 tail + `$pipestatus[1]` 足矣）。

### ✅ 確認事項（留痕供驗收 / 稽核對照）

**(a) 主迴圈實跑複驗、本 review 採信的裁示（⚠️ 規劃側無 Bash，git / docker 層非本人實跑）：**

1. **【已複驗】任務包驗收第 4 條後半確為空測**：主迴圈以獨立實驗證實
   `git check-ignore` 預設查 index，**已追蹤檔不論規則多離譜一律回「不忽略」（exit=1）**；
   `--no-index` 才抓得到（最壞規則 `*lock*` 下命中 `yarn.lock`）。
   ⇒ **plan 條 4b（改用 `git check-ignore --no-index -v yarn.lock`）＝修正無效條文，
   ⛔ 不是實作側改題，本 review 明白背書採納**；條 4c 的負向對照（scratchpad 複本上
   故意寫 `*lock*` 證明測得出失敗）為主迴圈裁示之**必附**項，⛔ 不得省。
2. **【已複驗】無 `--no-index` 過度套用**：逐條檢過——驗收第 3 條
   （`check-ignore -v package-lock.json`）在 `git rm` 之後該路徑已**未追蹤**，
   預設指令有效，plan 保留預設並在 §6.4 註明時序前提，正確；其餘各條無 index 語義陷阱。
   F2 既有證據（`.env` / `.vscode` / `web.log` 皆未追蹤）不受影響，F2 ⛔ 不需重開。
3. **【已複驗＋裁示採納】`git add` 提前到取證之前（plan §6.1）**：`git diff --cached`
   比 index vs HEAD，任務包原順序下第 10 條當場不成立——主迴圈複驗成立，採納。
   本 review 另在 plan 文本層獨立確認**提前後內容一件不多不少**：全篇僅
   步驟 1 `git rm package-lock.json`（單一路徑）與步驟 4 `git add .gitignore Dockerfile`
   （恰兩路徑）兩處寫入暫存區，§3 白名單驗證強制「恰三行、多一行即停手」⇒ 無擴大空間 ✅。
4. **【裁示採納】commit 切兩個（plan §6.3）**：沿用架構師 2026-08-31 於 F2 裁「乙」前例——
   實作 commit 恰三檔（`.gitignore` M / `Dockerfile` M / `package-lock.json` D），
   五件套另走 `docs(tasks):` commit。⇒ 驗收第 10 條取證時暫存區**不應**含 docs 檔，
   plan 條 10 預期（恰三路徑）與此一致 ✅。⛔ 兩個 commit 都待架構師確認才執行。
5. **【已複驗】基準事實**：HEAD `6d315cb`、分支 `developers`、四檔尺寸行數、
   工作樹僅三個既有 ` M` + 未追蹤 F4 文件（plan 階段零影響）、docker 29.5.3 / daemon 在跑
   ——均經主迴圈實跑確認與 plan 一致。

**(b) 本 review 以檔案層（Read / Grep）獨立核過的項：**

6. **`.gitignore` 錨點與終態獨立驗算** ✅：現況 38 行逐行核過與 plan §0.4 相符；
   錨點 `/.pnp⏎.pnp.js⏎⏎# testing` 在現況檔內**唯一**（`.pnp.js`、`# testing` 各僅一處）；
   套用後產物與任務包逐字終態**逐行一致**（39 行，`package-lock.json` 落**第 7 行**
   ⇒ 驗收第 3 條預期 `.gitignore:7:…` 行號正確）；位元組 392 + 18（`package-lock.json\n`）
   = 410，與 plan 預告一致（基底 392 為主迴圈複驗值）。
7. **Dockerfile 錨點與終態獨立驗算** ✅：現況 47 行逐行核過（deps 第 1–9 行與任務包
   引文逐字相符、第 20 行 `RUN npm run build`、43/44/47 行為 EXPOSE / ENV PORT / CMD）；
   錨點（第 5–9 行整段）唯一；**位元組差經本 review 逐字元獨立計算**：
   刪 5 行共 196 B（51+64+50+24+7）、新 2 行共 66 B（31+35）⇒ −130 B，
   1353 − 130 = **1223 B / 44 行**，與 plan 預告完全一致；
   新檔 `RUN yarn install --frozen-lockfile` 落第 6 行 ⇒ 條 8c 預期行號正確。
8. **行號位移 20 → 17 判定正確** ✅：deps 段淨減 3 行，`RUN npm run build` 由第 20 行
   位移至第 17 行是**純位移**。**⚠️ 稽核側注意：⛔ 不得把 20→17 誤判為該行被動過或違反守界**；
   「第 10 行起一字未動」的真正證據是條 B 全檔機械 diff，⛔ 不是行號。
9. **條 A / 條 B 的抽取來源確認** ✅：`docs/tasks/F4.md` 內 ```` ```gitignore ```` 區塊
   **恰一個**（39 行終態）⇒ 條 A 的 awk 抽取無歧義；```` ```dockerfile ```` 區塊恰兩個，
   **第 2 個**（6 行）即 deps 目標終態，接原 Dockerfile 第 10–47 行（38 行）組出 44 行期望全檔
   ⇒ 條 B 構造正確，且同時證明 deps 段正確**與**第 10 行起一字未動，認可為最強守界證據。
10. **鐵則對齊** ✅：`.dockerignore` 逐行核過——擋 `.env` / `.git` / `**/node_modules/` /
    `.next`，未擋 `package.json` / `yarn.lock` ⇒ 精確 COPY 拿得到檔、build context 不吞機密
    （鐵則 1）；⛔ 無 `v` tag、⛔ 無 `docker push`、image tag 寫死 `f4-local-verify`（鐵則 4）；
    未動 `.ts`/`.tsx`/`data/`/workflow/`CLAUDE.md`/`yarn.lock`，不做 F1/F5/F6（範圍守界）✅。
11. **`push-docker.yaml` 無任何 lock 引用**（本 review 以 Grep 獨立重查）✅
    ⇒ 刪檔不影響發版 workflow，plan §0.6 判定成立。repo 內 `package-lock` 引用面
    僅 Dockerfile（本次改）、`CLAUDE.md`（收案時主迴圈處理）、F4/F2 任務文件（不動）。
12. **驗收覆蓋完整性** ✅：任務包 12 條逐條對到 plan 步驟 0–10 與 §4 表，無遺漏；
    第 6 條依裁定「甲」為必跑（⛔ 非從缺）；條 1 的「`git ls-files` 空輸出、exit=0」
    語義正確（判準是輸出為空，⛔ 非退出碼）；條 3 時序前提（§6.4）正確。
13. **條 E（`yarn.lock` 位元組不動）認可** ✅：任務包硬約束原無對應驗收條，
    md5 對帳 + `git diff --stat` / `--cached --stat` + **步驟 6 之後複測一次**——
    足以抓「`yarn install` 意外改寫 lock」，屬加強⛔ 不是改題，採納。
14. **步驟 0.5 基準 build 認可** ✅：髒工作樹（`ServerSection.tsx` 173 行未 commit 改動）
    上跑 build 需對照組才可歸因，R-1 三分支處置完備（基準紅即停手、⛔ 不現場修 `.tsx`），
    與 F2 前例同型，唯一合規做法。
15. **步驟 9 `docker rmi` 必做 + 護欄認可** ✅（主迴圈已裁採納為必做）：
    只砍指名 tag、⛔ 明禁 `docker system prune` / `builder prune` / `image prune`
    （本機另有其他專案 image），護欄具體且措辭夠硬，充分。
16. **R-5 風險措辭修正（「立即」→「潛伏」）判定正確** ✅：ignore 規則不影響已追蹤檔
    （與確認事項 1 同一語義，主迴圈實驗已證），`yarn.lock` 不會當場消失；
    真實傷害是日後移出版控 / 重建流程時 add 不回去。防護價值與做法不變，僅把話講準，採納。
    ⇒ 任務包風險表該格的「直接破壞建置可重現性」措辭以 plan 版本為準。
17. **回滾策略** ✅：備份先行（含 221,139 B 的 `package-lock.json`，md5 對帳完整性）、
    全程⛔ 無 `git checkout`、⛔ 無 `git stash`，符合 CLAUDE.md 開發守則第 8 條。
18. **步驟 6 失敗處置** ✅：`--frozen-lockfile` 失敗＝既有缺口，停手回報、
    ⛔ 不改 `yarn.lock`、⛔ 不跑 `yarn install` / `npm install` 去「修好」——正確。

**(c) ⛔ 未實查、實作側必查項（規劃側無 Bash，以下數值本 review 只背書方法⛔ 不背書其值；
實作時重跑即為複驗）：**

- 全部 md5 值（`1c92ad40…` / `eec63612…` / `c00fe3e4…` / `107a8a9e…` / 預告的 `07afa178…`）
  ——實作時 `md5 -q` 重跑比對。
- §1 預演 clone 的全部結果（byte-identical diff、`git rm` 行為、條 4b/4c 實驗輸出）
  ——真 repo / scratchpad 實跑重取。
- 步驟 5–8 的一切執行類結果：`yarn install` / `yarn build` / `docker build` 成敗與耗時
  （plan 已誠實標【⛔ 未驗】，verification 一律以實跑輸出為準，⛔ 不得以 plan 預估值冒充）。
- §0.7 `git diff --stat` 基線（92/89）、§0.8 環境值（node v22.19.0 / yarn 1.22.18 /
  本機無 `node:20-alpine`）——實作時重取，⛔ 不轉抄 plan。

---

## 對任務包的回饋

> 以下均為**任務包本身**的缺陷，已由主迴圈複驗或本 review 獨立確認；
> **任務包⛔ 不需重發**——以本 review 裁示為準，收案時由規劃側在歸檔版加註。

1. **驗收第 4 條後半是無效條文（空測）**：`git check-ignore yarn.lock` 對已追蹤檔恆回不命中。
   已由條 4b（`--no-index`）+ 條 4c（負向對照）取代（確認事項 1）。
2. **操作順序第 ⑤⑥ 步順序錯置**：取證（第 10 條）需要 `git add` 之後才成立。
   已由步驟 4 提前修正（確認事項 3）。⚠️ 與 F2「整個漏寫」同型但不同因，F4 是有寫但排錯位。
3. **驗收第 11 條等多處引用「第 20 行」未預告位移**：改後為第 17 行，
   判準（計數恰 1）不受影響（確認事項 8）。
4. **硬約束「⛔ 不動 `yarn.lock` 一個位元組」無對應驗收條**：由條 E 補上（確認事項 13）。
5. **`docker rmi` 寫「非必要」**：升為必做步驟 9 並補全域 prune 禁令（確認事項 15）。
6. **風險表 R-5「立即破壞可重現性」措辭不精確**：應為潛伏傷害（確認事項 16）。

## 需要架構師裁決的點（僅 1 項，低風險、可逆）

- **驗證後要不要連基底 image `node:20-alpine` 一起刪？**
  白話：跑 docker build 會下載一個約 160MB 的基底映像檔，驗完之後專案自己的驗證 image
  一定會清掉（步驟 9），問題只剩這個基底要不要留。
  **甲：保留（plan 預設，本 review 建議）**——下次 build 免重拉、可能被其他專案共用、留著無害。
  **乙：一併刪除**——本機不留任何 F4 帶進來的東西。
  建議**甲**；此點⛔ 不阻斷動工（實作到步驟 9 前拍板即可，預設照甲執行）。

## 放行條件

- **照 ⛔ 必改 1（條 D 判準）以錨點編輯修完 `F4-plan.md` 即可動工，免重審**；
  修訂僅限本 review 列明事項，超出列明範圍 ⇒ 重審。
- plan §8 的五項待裁決，本 review 逐一明示：**1 採納（條 4b/4c）、2 採納（add 提前）、
  3 採納（commit 切兩個）、4 採納（A / B / E + 步驟 0.5 + 步驟 9 必做；D 依必改 1 修正後採納）、
  5 見上方架構師裁決點（預設甲）**。⇒ plan 末行「未獲明示則照任務包原文跑」的退路**不再適用**，
  一律以本 review 為準。
- 動工後照裁定：`yarn build` 必跑（基準 + 改後）、`yarn lint` 豁免；
  `docker build` 用 `f4-local-verify` tag，⛔ 不 push、⛔ 不打 `v` tag。
- 實作完成產 `docs/tasks/F4-verification.md`（沿用 `verification_template.md`，
  各驗收指令**實際輸出直接貼入**，⛔ 不得用預期值 / plan 預演值冒充已執行；
  zsh 管線退出碼用 `$pipestatus[1]`）。
- ⛔ **commit/push 前回報，待架構師確認**——本 review 與任務包任何措辭均不構成
  commit/push 預授權；`push-gate` 擋 push 是預期行為，⛔ 不得繞過。
