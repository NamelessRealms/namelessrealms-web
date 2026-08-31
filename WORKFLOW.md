# Nameless Realms 官方網站 — 協作規則（WORKFLOW.md）

> 用途：這份把「架構師 ↔ 協作 Claude ↔ Claude Code」三方的協作方式明文化。
> 換新專案、換新對話，靠這份把工作方式一次帶過去，不用重講。
> 這是**流程契約**，不是技術規格；技術看 spec / CLAUDE.md；機器路徑與環境速查看 WORKSPACE.md。
> **管道以檔案為主**：三方透過 repo `docs/tasks/` 內的落檔交接，你不轉貼內容、只做一句話觸發。
> （若協作 Claude 沒有 Filesystem 存取權，退回附錄的「貼上備援模式」。）

---

## ⭐ 0. 目前的執行形態（2026-08-30 起，⚠️ 先讀這段）

> ⚠️ **下面第「三方角色分工」節起的內容，描述的是「協作 Claude 在**另一個對話**、
> Claude Code 在終端」的原始三方模式。三方的**職能分工完全不變**，
> 但**載體**已改成 Claude Code 內的 subagent 編排——閱讀時請自行對應。**

| 原始三方模式 | 現行載體（`.claude/agents/`） |
|---|---|
| 協作 Claude（另一個對話） | `nr-planner`（規劃側：產任務包、審 plan、審計驗收報告） |
| Claude Code（終端） | `nr-implementer`（實作側：產 plan、寫實作、產 verification） |
| —（原本沒有獨立稽核） | `nr-auditor`（稽核側：對 verification 逐條取證，⛔ 不動現場） |
| 架構師（你） | 不變：裁決、真機執行、`git push` |

**五道 hook 守門會擋什麼**（⚠️ 這些是**機制**，不是紀律）：
- `git push` **一律擋**，⛔ 無例外通道
- `{代號}-plan-review.md` / `{代號}-verification-audit.md` 只有**規劃側／稽核側／主迴圈**寫得到，⛔ 實作側不可
- 稽核側**只寫得到自己那一份 audit 檔**，連 `git add` 都擋（它動到現場，「聲稱 vs 現場」的比較基準就毀了）
- **Obsidian Vault 只有主迴圈碰得到**，三個 subagent 一律擋
- 每次開對話自動自檢上面四道還在不在——⚠️ **全過時是安靜的**，沒訊息 = 正常

⛔ **四件套已變五件套**：任務包 → plan → plan-review → verification → **verification-audit**。

> 📝 完整規格（含判準與已知分岔）見組織層 `ORG-WORKFLOW.md` §7.0。
> ⚠️ 若你的組織沒有那份檔，`.claude/` 內的三個 agent 檔與五支 hook **本身就是可執行的規格**。

---

## 三方角色分工

| 角色 | 是誰 | 負責 |
|------|------|------|
| **架構師 / 決策者** | 你（人） | 定方向、拍板設計決策、一句話觸發（「執行 xxx」「計畫好了」「照 review 改」）、真機 E2E、commit/push 批准 |
| **協作 Claude**（對話） | 這個對話裡的 Claude | ①產任務包 ②審 Plan（落檔 review）③審計驗收報告 ④維護知識庫 |
| **Claude Code**（實作） | 你 IDE 裡的 agent | 依任務包提 Plan → 放行後實作 → 產驗收報告。**只做實作，不接觸知識庫** |

> 關鍵界線：**協作 Claude 不寫實作碼、Claude Code 不自行擴大範圍**。
> 實體隔離是單向的：知識庫（vault）只有協作 Claude 讀寫；repo 由 Claude Code 實作，
> 協作 Claude 讀（審計）+ 寫 `docs/tasks/`（交接件）。**Claude Code 連讀 vault 都不碰。**

---

## 檔案管道（四件套）

交接檔案一律放主要變更 repo 的 `docs/tasks/`，`{代號}` 如 `M2-3` 或 `f12-1`：

| 檔案 | 產出者 | 讀者 |
|------|--------|------|
| `{代號}.md` | 協作 Claude（任務包） | Claude Code |
| `{代號}-plan.md` | Claude Code（實作計畫） | 協作 Claude |
| `{代號}-plan-review.md` | 協作 Claude（審核，阻斷點明標 ⛔） | Claude Code |
| `{代號}-verification.md` | Claude Code（驗證報告） | 協作 Claude |

**歸檔慣例**：任務收案後，該任務四件套全數移入 `docs/tasks/archive/`（按任務歸檔）。
`docs/tasks/` 根層只留骨架模板與**進行中**任務——目錄列表本身就是「目前在做什麼」的答案。

---

## 每個子任務的工作迴圈（嚴格照順序）

1. **協作 Claude 產任務包** → 寫入 `docs/tasks/{代號}.md`，含明確範圍邊界、「不做什麼」清單、註明動哪個/哪些 repo。若任務造成**結構性變更**（新增/移動模組、新路由群、新資料表、分層調整），任務包固定附一條「更新該 repo `CLAUDE.md` 程式碼地圖對應段落」；非結構變更勿動地圖。

   > ⛔ **任務包必須自我完備：不得引用任何知識庫路徑或要求 Claude Code 去讀知識庫檔。**
   > 規劃文件的內容需要被 Claude Code 知道時，**直接抄進任務包**，不招手叫它去拿。
   > 違反此條的責任在任務包撰寫者（協作 Claude），不在實作側。

2. **你一句話觸發**（「執行 {代號}」）→ **Claude Code 提 Plan** → 落檔 `{代號}-plan.md`，先不動手。
3. **協作 Claude 審 Plan** → 落檔 `{代號}-plan-review.md`（阻斷點明標 ⛔，結論寫「放行／阻斷」）→ **放行過你，才開始實作**。
4. **Claude Code 實作** → 自動產 `{代號}-verification.md`（不必等人要求）。
5. **協作 Claude 審計驗收報告**：git 對帳、產物重建、實際執行輸出逐項查。
6. **remote Actions 綠（附 run 連結）+ 真機 E2E（若涉 UI，你執行，見下方協議）** → 你簽核。
7. **更新 PROGRESS.md**；里程碑收尾走下方 checklist；收案四件套歸檔。

> 一次只走一個子任務。上一個沒驗收過，不開下一個。
> **裁決點不省**：Plan 放行、真機驗證、commit/push 確認逐一過你。
> ⛔ **push 裁決點不得被任務包措辭預授權**：任務包驗收段一律寫
> 「commit/push 前回報待確認」，不得寫成「push 後 CI 綠」這類隱含預授權的流程句。
> （踩過雷：驗收段措辭使 Claude Code 先 push 後真機，繞過了人的確認點。）

---

## 輕量修復流程（hotfix，不走完整任務包）

> 目的：讓臨時小修有規則可循，不變成「隨手改」破壞紀律，
> 也不逼每個 typo 都走完整迴圈。

**適用門檻（全部滿足才可走輕量）**：
- 改動 ≤ 2 個檔案、且屬明顯修正（typo、log 訊息、顯示文案、明確的一行 bug）。
- **不動** schema / migration / 權限 / 鐵則相關邏輯 / 對外 API 介面 / 跨模組（跨 repo）契約。
- 不引入新套件、不改建置設定（依賴清單不動）。

**輕量流程仍必做**：
1. 你一句話觸發「hotfix：改什麼、為什麼」→ 協作 Claude 口頭核准即可，免任務包。
2. 實作後回報：變更檔案 + git 三步對帳 + 該跑的 lint/build（免完整驗收報告）。
3. PROGRESS.md 的 Decision Log **記一行**（標 `[hotfix]` 前綴）。

**熔斷**：實作中發現超出門檻（越改越大、牽動 schema、影響鐵則、動到跨模組/跨 repo 契約）→
**立刻停手**，轉正規任務包重走迴圈。不得「都改一半了就做完吧」。

---

## 新對話開機（bootstrap）

> 換新對話時，協作 Claude 的**開場唯一必讀是 WORKSPACE.md**（機器路徑、管道慣例、
> 環境速查、**下一棒交接**節）。其餘知識庫檔一律依本次任務主題按需點讀，不預讀。

給協作 Claude 的開場指示（可放 Project 指示或每次貼）：

```
每個新對話先用 Filesystem 讀 /Users/quasi-pc/Documents/Obsidian Vault/Claude 知識庫/namelessrealms-web/WORKSPACE.md，再處理正題。
讀完用 3-5 行複述當前狀態：目前里程碑、上一個完成的子任務、
進行中/下一個子任務、活躍 Blockers。我確認無誤後才開工。
```

> 重點在「先讀、複述、經確認、才開工」——防止新對話拿著過期狀態直接往前衝。
> 每輪收尾時，協作 Claude 把「下一棒交接」寫回 WORKSPACE.md，讓下個對話零成本接手。

---

## Plan 審查要點（協作 Claude 審 Claude Code 的 Plan）

- **範圍有無超界**：有沒有偷做別的模組/里程碑？有沒有「順手多做」違反鐵則？
- **技術選型對不對**：有沒有擅自換棧、引入未列套件？
- **架構界線對不對**：例：機密只在 server 端(Route Handler / middleware)讀取,client component 不得碰 env;清單內容一律走 data/,不散寫進元件
- **驗收步驟夠不夠**：正向 + 負向流程都有？能真跑證明、不是紙上談兵？
- **schema 對真實 codebase 驗證**：Plan 對資料表/欄位/狀態值的假設，要對**實際
  資料庫與約束**核對，不能憑印象。（踩過雷：狀態值寫錯、只在 Claude Code 真查
  DB 時才抓到。）
- **建立在既有之上**：能重用現有抽象/trait/模組的，就不要重寫一份。
- **有無製造重複**：新程式碼有沒有把既有邏輯再抄一遍？該共用的有沒有共用？
  對照 CLAUDE.md 的「撰碼規約」。

---

## 失敗路徑處理（非 happy path 的規則）

1. **Plan 連退 2 次** → 不再讓 Claude Code 猜第三次。協作 Claude 整理
   「卡點 + 各方案利弊」升級給架構師拍板，拍板結果記入 Decision Log。
2. **驗收不過** → PROGRESS.md 該子任務標 `🔴 驗收未過`，附一行原因。
   修復走同一個任務包補驗，不開新任務包；連續 2 次補驗不過 → 視同卡點升級拍板。
3. **任務中止/放棄** → 子任務標 `⛔ 中止`，Decision Log 記「為何中止 + 學到什麼」，
   未解部分明文列入 carryover。中止的決策照樣歸檔進 DECISIONS-ARCHIVE——
   「為什麼不做」跟「為什麼這樣做」一樣值錢。
4. **實作中發現任務包前提錯誤**（spec 切片與現實不符等）→ Claude Code 停手回報，
   協作 Claude 修任務包重發，不得現場自行改題。

---

## 驗收報告要求（Claude Code 產、協作 Claude 審）

驗收報告至少要有：變更檔案、設計重點、測試結果、正向/負向流程實際輸出、
審計確認、回歸守門、守界聲明。此外幾個硬要求：

1. **git 三步對帳**（防「有東西沒 commit，manual `git status` 才發現」）：
   ```
   git log --oneline -1
   git status
   git rev-parse HEAD origin/<慣例分支>   # 確認本地與遠端一致；分支名見 WORKSPACE
   ```
2. **改原始碼必記錄產物重建**：`yarn build` 要在報告裡確認跑過；
   若有「A repo 被 B repo 當依賴」的關係，改 A 必須在 **B 端**重建確認拉到新碼，
   不能只在 A 本地 build。無原始碼變更則據實標「沿用現有產物」。
3. **CI 措辭精確**：本地驗證只能講「local green，remote Actions 待確認」，
   **不可講「CI 通過」**。驗收 = **local green + remote Actions 綠（附 run 連結）**。
   - lint/型檢指令要用**嚴格參數**逐字跑（例：`yarn lint --max-warnings 0`、
     `yarn build`）。踩過雷：本地指令參數不夠嚴，連兩次 push 沒抓到 lint error。
4. **負向測試的還原一律用備份檔**，⛔ 不用 `git checkout`——
   （踩過雷：`git checkout` 把同檔**未 commit 的正式改動**一併清掉。）

> **不得用範本/預期值/設計推理冒充已執行。** 真機做不到就誠實標「待人工」。

---

## 真機 E2E 協議（你執行、協作 Claude 領路）

適用：涉 UI 的重大變更，**先真機後 commit**。

1. 協作 Claude 須**事先備好並交付測試素材**（fixture 檔案包），
   不得只給步驟讓你自備檔。
2. 你說「開始真機 E2E」後，協作 Claude **一次只給一個步驟**、附過線標準，
   **等你回報結果才給下一步**。不得一次貼整份步驟表。
3. 完整步驟表仍照寫進驗收報告（供日後複驗），但執行時以逐步對話為準。
4. 真機揭出的**既有缺口**（非本輪迴歸）不現場擴大處理——登記進 PROGRESS 待排，收案不受阻。

---

## 里程碑收尾 checklist（收尾時逐項打勾）

- [ ] 該里程碑所有子任務都 ✅（含補驗過的 🔴 已轉 ✅）。
- [ ] 收案任務的四件套移入 `docs/tasks/archive/`（可併入下一輪實作 commit 或獨立 `docs:` commit）。
- [ ] PROGRESS.md 該里程碑的 Decision Log **整段原封**搬進 DECISIONS-ARCHIVE.md
      （含理由、含中止決策）。
- [ ] carryover 逐條處理：轉入下一里程碑的任務規劃，或明文留在
      DECISIONS-ARCHIVE 該里程碑區塊。
- [ ] PROGRESS.md 里程碑總覽狀態更新、Blockers 清掉已解項、「最後更新」改日期。
- [ ] DEV-INDEX.md 若里程碑實際範圍與原規劃有出入，回頭修正對照表。
- [ ] 規格漂移檢查：spec / UI 規範與實作有出入的，回頭修正。
- [ ] WORKSPACE.md「下一棒交接」節更新到最新狀態。

---

## 溝通慣例

> 📝 依你的習慣調整。以下記的是實際跑順的一套。

- 語言：一律繁體中文。
- 你的確認多為單字（「可以」「好」「甲」「b」「你推的」）；協作 Claude 要能據此
  推進，不重複問已確認的事。短答即定案，定案的所有連帶事項一併執行、不再回問。
- 協作 Claude 呈現決策時：給**明確建議 + 理由**，多個決策批次列成甲/乙/丙一次確認。
- 任務包要**自足**（見工作迴圈第 1 步的 ⛔ 條）。

---

## 知識庫維護慣例

- **開場唯一必讀**：`WORKSPACE.md`。其餘（CLAUDE.md 副本、DEV-INDEX、PROGRESS、
  spec 各章）依任務主題**按需點讀，不預讀**——常駐塞太多會拖慢每次回應。
- **檔案分工**：WORKSPACE = 路徑/管道/環境/下一棒交接（會頻繁更新）；
  PROGRESS = 里程碑進度/Blockers/Decision Log；DECISIONS-ARCHIVE = 已收案決策的凍結存放。
- **就地編輯**：協作 Claude 用 Filesystem 直接編輯知識庫檔，你在 Obsidian 看 diff。
  知識庫更新在**里程碑/收案節點**做，不逐句即時維護。
- **轉寫紀律（協作 Claude 編輯知識庫時遵守）**：
  - 檔案讀取偶見中文顯示為 `�`——多為傳輸假象非真損壞。編輯前先位元組核對，勿照顯示「修」字。
  - **大段中文由模型轉寫有真實的鄰碼漂移風險**（實測：目標字誤出為相鄰碼位、字形極相似、肉眼難審）。
    紀律：**能搬就不要重寫**——大檔重組一律 `move_file` 搬整檔、再以短錨點 `edit_file` 微調，
    讓內文不經過模型；非重寫不可時先 `dryRun` 驗證。
    `edit_file` 不匹配即失敗（安全失敗），優於 `write_file` 直接覆寫。

---

## 附錄：貼上備援模式（協作 Claude 無 Filesystem 時）

檔案管道退化為人工轉貼，其餘規則不變：

1. 協作 Claude 產任務包時以「**給 Claude Code 的文字：**」區塊輸出
   （copy-paste-ready 純文字碼區塊，不用 markdown 表格混排），你整包貼給 Claude Code。
2. Plan、驗收報告由你貼回給協作 Claude 審。
3. CI 結果改貼截圖，協作 Claude 逐 job 目視（有 Filesystem 時以 run 連結 + 報告內
   實際輸出為據，不需截圖）。
4. PROGRESS.md 更新方式改為協作 Claude 產**替換整份的新檔**、你覆蓋。

---

# ⚠️ 本專案在地化附註（namelessrealms-web，2026-08-30 導入模板包時附加）

> 本節**覆蓋**上方通用內文中與此衝突的敘述。上方原文一字未改（模板包原版），
> 差異集中寫在這裡，方便日後與模板包對帳。

## 一、⛔ 本專案沒有 build/lint CI

`.github/workflows/push-docker.yaml` 是**唯一**的 workflow，觸發條件是
**push tag `v*.*.*`**，內容只有 build docker image 並推私有 registry。

⇒ 上方「驗收 = local green + remote Actions 綠（附 run 連結）」**在本專案不適用**。
本專案的收案標準是：

- **本地嚴格指令逐字跑過並附輸出**：
  ```
  yarn install --frozen-lockfile
  yarn lint --max-warnings 0
  yarn build
  ```
- ⛔ 驗收報告不得寫「等 remote Actions 綠」——那件事不會發生。
- ⚠️ `next lint` 預設**不會**因 warning 失敗 ⇒ `--max-warnings 0` 是必要的，⛔ 不可省。
- ⚠️ **打 `v*.*.*` tag 就是發版**（會 build 並推 image）。⛔ 不得為測試打 tag。

## 二、知識庫(vault)

`/Users/quasi-pc/Documents/Obsidian Vault/Claude 知識庫/namelessrealms-web/`

| 檔 | 內容 |
|----|------|
| `WORKSPACE.md` | **開場唯一必讀**;機器路徑、環境速查、協作紀律、下一棒交接 |
| `BACKLOG.md` | **`F{n}` backlog、Blockers、Decision Log** |
| `DECISIONS-ARCHIVE.md` | 已收案決策凍結存放 |

⚠️ 本專案是 **backlog 制,⛔ 不是里程碑制** ⇒ ⛔ 沒有 `PROGRESS.md`。
上方通用內文提到 `PROGRESS.md` 之處,一律改讀 `BACKLOG.md`;
「里程碑收尾 checklist」在本專案**沒有對應節點**,收案以單一 `F{n}` 為單位。

⛔ **本專案沒有 `spec` 主檔,也沒有 `DEV-INDEX.md`** —— 它是完成品,
規格的等價物是 repo `CLAUDE.md` 的程式碼地圖與**地雷清單**。
⇒ 任務包要的背景**直接讀實碼抄進包裡**,⛔ 不要去找不存在的 spec 章節。

## 三、分支

- 慣例工作分支：**`developers`**，⛔ 不是 `main`（遠端兩支都存在）。
- git 對帳第三步請用：`git rev-parse HEAD origin/developers`
- ⚠️ 遠端真值一律用 `git ls-remote origin developers` 直接問，
  ⛔ 不看本機 `origin/*` 快照（它只在 fetch/push 時更新）。

## 四、逐檔 `git add`

工作樹長期帶著未收斂的改動（2026-08-30 實查三檔 modified）。
⇒ ⛔ **禁用 `git add .`**，一律逐檔 `git add <path>`。

## 五、⛔ 關鍵過程紀錄不得只落在 scratchpad

✅ **架構師 Yu 2026-08-31 裁定生效（F4 收案時新增）。**

**規則**：任何要在驗收報告中被當成證據、或被拿來說明「某件事發生過 / 沒發生過」的
過程紀錄（build log、before/after 快照、負向對照輸出、退出碼），
⇒ **必須即時把關鍵行摘要進 `docs/tasks/{代號}-verification.md`**。
scratchpad **只是工作區**，⛔ 不是證據的歸宿。

**Why（實際事故，⛔ 不是預防性條文）**：F4 實作時 `nr-implementer` 中途卡死，
主迴圈接手後在驗收報告中寫下「基準 build 的輸出**未留存**」——
**那句話是錯的**：該檔（`build.baseline.log`，1,758 bytes）一直都在實作側 scratchpad，
只是主迴圈**沒查就斷言它不存在**。
⚠️ 這個錯是稽核側**碰巧還讀得到那個 scratchpad** 才抓出來的，
而稽核側自己也明講「下次讀不到」。⇒ **靠運氣的把關不算把關。**

**How**：
- 產出過程紀錄後，⛔ 不要只寫「輸出見 scratchpad」——把**關鍵行貼進報告**。
- 若某項證據確實只存在於 scratchpad，⛔ 不得寫成「不存在 / 未留存」；
  據實寫「**存在但不具耐久性**」，並說明處置。⚠️ 這兩件事⛔ 不可混為一談。
- 回滾來源優先指向**耐久物**（git 歷史 blob），scratchpad 備份只列為次要來源。

⚠️ **本條⛔ 不要求實作側每步落狀態快照** —— 該提案（F4 稽核側提出）經 Yu 2026-08-31
裁定**不採**：現況查核由稽核側獨立重跑承擔，逐步快照會讓報告膨脹且收益有限。
