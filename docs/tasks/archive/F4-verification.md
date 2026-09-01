# 驗收報告：F4 lock 檔定案——移除 package-lock.json、Dockerfile deps 去死碼

> ⛔ **不得用範本/預期值/設計推理冒充已執行。** 本報告所有指令輸出均為**當場實跑貼上**。
> 做不到的一律標「待人工」或「⛔ 未驗」。

---

## ⚠️ 執行過程異常聲明（⛔ 必讀，影響責任歸屬）

**本任務的實作由兩個執行者接力完成，⛔ 不是單一實作側跑完的。** 據實記錄如下：

1. **`nr-implementer`（子代理）** 依 `F4-plan-review.md` 放行後動工，執行到長時間指令時
   **卡死**（600 秒無進展，watchdog 未能恢復，任務狀態 `failed`）。
   它中斷前的自述為：「基準 build 綠（8.64s）。步驟 1–4：`git rm` + 兩處錨點編輯 + 逐檔 `git add`」。
2. **⚠️ 該自述經主迴圈實查後確認為「部分不實」**：
   - ✅ 兩處錨點編輯（`.gitignore`、`Dockerfile`）**確實已落地**，且內容正確。
   - ⛔ **`git rm package-lock.json` 並未執行**——實查時該檔仍存在於硬碟且仍入版控。
   - ⛔ **`git add` 並未執行**——實查時暫存區為空。
3. **主迴圈接手完成其餘全部步驟**（備份 → `git rm` → `git add` → 驗收 1–10 →
   負向對照 → 三個長時間指令 → image 清理 → 本報告）。

⇒ **⚠️ 稽核側請特別注意**：本報告的證據由主迴圈產出，
**⛔ 不得因「實作側自述」而降低查核強度**——恰恰相反，本次已證明自述不可信。
⇒ 「基準 build 綠 8.64s」一項本報告**⛔ 不引用為證據**；建置正常的證明改由下方驗收 6
的實跑輸出承擔。

> ### ⚠️ 本節更正（2026-08-31，稽核側指出後查證）
>
> 本報告初版在此寫「該數值**無落檔支撐**（子代理中斷時輸出未留存）」——**這句話不實**。
> 稽核側找到該紀錄，主迴圈複查證實：
> `<實作側 scratchpad>/F4/build.baseline.log`，**1,758 bytes，Aug 31 12:25**，
> 內含 `Done in 8.64s.` 與 `ƒ Middleware  74.8 kB`。
>
> ⚠️ **正確的說法是**：該紀錄**存在**，但只落在 **session 級 scratchpad**（會隨 session 消失）
> ⇒ **⛔ 不具耐久性**，故本報告仍維持「⛔ 不引用為證據」的處置。
> ⚠️ **「不具耐久性」與「不存在」是兩件事** —— 初版把後者當成前者寫，
> 屬**未查證即斷言不存在**，據實更正於此，⛔ 不隱去。

---

## 變更檔案

| 路徑 | 改了什麼 |
|---|---|
| `package-lock.json` | **刪除**（`git rm`，⚠️ 連硬碟檔案一起刪，與 F2 的 `web.log` 保留硬碟檔**不同**）。原 221,139 bytes / 6,313 行 / `lockfileVersion: 3`。 |
| `.gitignore` | `# dependencies` 節新增一行精確檔名 `package-lock.json`（第 7 行）。38 行 / 392 B → **39 行 / 410 B**。 |
| `Dockerfile` | deps 階段去死碼：`COPY` 收斂為精確 `yarn.lock`（⛔ 無星號）、`RUN` 收斂為無條件 `yarn install --frozen-lockfile`。47 行 / 1,353 B → **44 行 / 1,223 B**。 |

⛔ **未動**：`yarn.lock`（md5 `1c92ad40f6c718d3f79e6122bfd41aa4`，全程未變）、
builder 階段 `RUN npm run build`、runner 階段、`package.json`、任何 `.ts` / `.tsx`。

---

## 設計重點

- **為什麼刪 npm 那份而不是 yarn 那份**：Dockerfile deps 階段的分支條件是
  `if [ -f yarn.lock ]`，而 `yarn.lock` 一定存在 ⇒ `npm ci` 分支**永遠走不到**。
  ⇒ npm lock 早已是死檔。另佐證：`package-lock.json` 的 root 仍是 `portal-web@0.1.0`，
  而 `package.json` 早已是 `namelessrealms-web@2.0.0` ⇒ 從專案改名以來從未更新。
- **為什麼連硬碟一起刪**（而非 F2 式的 `--cached`）：留一份過期且無人維護的 lock 在硬碟，
  比刪掉更容易誤導後人。
- **為什麼 COPY 用精確 `yarn.lock` 而非 `yarn.lock*`**（架構師 2026-08-31 裁「甲」）：
  星號原本是為「yarn 或 npm 二選一」的彈性而存在，本任務正是要**取消那個二選一**
  ⇒ 彈性消失後，星號只剩「掩蓋錯誤」一個效果（lock 檔不見時錯誤會延後到 RUN 才爆）。
- **⛔ 為什麼不動 builder 的 `npm run build`**（架構師裁定）：它只是執行 `package.json`
  的 script、⛔ 不需要 lock 檔；改它動到的是**真正的發版路徑**，而本 repo
  **打 tag 就是發版、⛔ 沒有 build CI 可擋**。收益僅風格統一，⛔ 不值得。

---

## 測試結果

- **單元測試：⛔ 無可跑** —— repo 內無測試檔、`package.json` 無 `test` script。
  ⇒ 據實標明，⛔ 不以其他項目冒充。

### 驗收 1：`package-lock.json` 已出版控

```
$ git ls-files package-lock.json
（無輸出）
```

### 驗收 2：硬碟檔案已刪除

```
$ ls package-lock.json
ls: package-lock.json: No such file or directory
```

### 驗收 3：`package-lock.json` 已被忽略

⚠️ 此處用**預設** `check-ignore` 是正確的——`git rm` 後該檔已**未追蹤**，不受下方驗收 4 的陷阱影響。

```
$ git check-ignore -v package-lock.json
.gitignore:7:package-lock.json	package-lock.json
  exit=0
```

### 驗收 4：`yarn.lock` 保護零退步（⚠️ 本任務最關鍵一條）

**4a — 仍入版控：**
```
$ git ls-files yarn.lock
yarn.lock
```

**4b — 未被 `.gitignore` 誤擋（⚠️ 必須用 `--no-index`）：**
```
$ git check-ignore --no-index -v yarn.lock
（無輸出）
  exit=1  ⇒ 1 = 未被忽略 = ✅ 正確
```

> ### ⚠️ 為什麼一定要 `--no-index`（任務包原條文是**空測**，已修正）
>
> `git check-ignore` **預設會查 index，對已追蹤檔一律回「不忽略」**。
> `yarn.lock` 正是已追蹤檔 ⇒ **任務包原本寫的預設指令，不管規則寫得多離譜都會回報通過**。
> 此缺陷由實作側於 plan 階段發現、主迴圈獨立複驗確認，plan-review 已背書為
> **「修正無效條文」，⛔ 不是實作側改題**。

**4c — 負向對照（⚠️ 證明本條測得出失敗，⛔ 沒有這段就只是換了個指令）：**

於 scratchpad 建臨時 repo，放入本 repo 的 `yarn.lock` 與 `.gitignore` 後：

```
########## 對照組 A：現行正確規則 ##########
$ git check-ignore --no-index -v yarn.lock
（無輸出）  exit=1  ⇒ ✅ yarn.lock 未被擋（正確）

########## 對照組 B：故意寫錯成 *lock* ##########
$ printf '*lock*\n' >> .gitignore
$ git check-ignore --no-index -v yarn.lock
.gitignore:40:*lock*	yarn.lock
  exit=0  ⇒ ✅ 抓到誤擋 ⇒ 本條測得出失敗

########## 反證：同一錯誤規則下，預設指令假通過 ##########
$ git check-ignore -v yarn.lock
（無輸出）  exit=1  ⇒ ⛔ 假通過（已追蹤檔的陷阱，重現成功）
```

**4d — `yarn.lock` 一個位元組未動：**
```
$ md5 -q yarn.lock
1c92ad40f6c718d3f79e6122bfd41aa4
$ git diff --stat yarn.lock
（無輸出 ⇒ 未改動）
```

### 驗收 5：`yarn install --frozen-lockfile`（⚠️ 核心證明）

⚠️ 本條證明 **`yarn.lock` 獨自足以還原依賴、⛔ 不需要 npm 那份**——在
`package-lock.json` 已被刪除的狀態下執行：

> ### ⚠️ 稽核側無法獨立重跑本條；替代證據已獲架構師認列（2026-08-31）
>
> 稽核側回報：`audit-write-guard` hook **一律擋下含 `yarn install` 的指令**
> （實測單獨執行亦被擋）⇒ 它**⛔ 無法獨立重跑本條**。
> 它改以 **Docker `--no-cache` 冷建置**作為替代正證：在全新容器內從零執行
> `#12 [deps 5/5] RUN yarn install --frozen-lockfile` → `Done in 39.06s` → EXIT=0。
>
> ✅ **架構師 Yu 2026-08-31 裁定：認列該替代證據。**
> 理由（Yu 採納）：冷建置是在**全新容器裡從零安裝**，⛔ 無既有 `node_modules` 可依賴，
> 條件比本機重跑**更嚴苛** ⇒ 證明力只強不弱。
> ⚠️ 據實標明：本條的**本機**執行由主迴圈完成，稽核側**⛔ 未獨立重跑本機版本**。

```
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 36.58s.
EXIT_INSTALL=0
```
耗時：23:07:03 → 23:07:40（約 37 秒）。

### 驗收 6：`yarn build`

```
Route (app)                              Size     First Load JS
┌ ○ /                                    4.02 kB         105 kB
├ ○ /_not-found                          882 B          85.1 kB
├ λ /api/apply                           0 B                0 B
├ λ /api/auth/[...nextauth]              0 B                0 B
├ ○ /apply                               1.31 kB        85.5 kB
├ ○ /donate                              141 B          84.4 kB
├ ○ /launcher                            6.19 kB         107 kB
├ ○ /modServer                           3.75 kB         105 kB
├ ○ /sponsor                             4.58 kB         106 kB
├ ○ /staff                               141 B          84.4 kB
├ ○ /team                                2.4 kB          104 kB
└ ○ /voteModpack                         4.86 kB         106 kB
+ First Load JS shared by all            84.2 kB
ƒ Middleware                             74.9 kB
EXIT_BUILD=0
```
耗時：23:07:40 → 23:07:50（約 10 秒）。**路由 12 條**（機械計數：以 `┌` `├` `└` 起始的行）。

> ⚠️ **更正（2026-08-31，稽核側指出後查證）**：本報告初版在「回歸守門」表寫
> 「全部 **13** 條路由建置成功」，**數字錯誤**。實際路由為 **12** 條；
> `13` 是建置輸出中 `Generating static pages (13/13)` 的**靜態頁數**，⛔ 不是路由數。

⚠️ `Middleware 74.9 kB` 落在 F2 已記錄的 74.8/74.9 跳動區間內
（F2 稽核側曾以同一 `.gitignore` 狀態連跑三次得 74.9/74.8/74.8，
證明該欄位為**建置既有非決定性**）⇒ ⛔ 與本次改動無關。

### 驗收 7：`docker build` 實跑（⚠️ 改了 Dockerfile 就必須真的 build）

非發版 tag，⛔ 未 push image、⛔ 未打任何 `v*.*.*` tag：

```
$ docker build -t namelessrealms-official-web:f4-local-verify .

#12 [deps 5/5] RUN yarn install --frozen-lockfile
#12 0.240 yarn install v1.22.22
#12 36.87 Done in 36.64s.
...
#20 exporting to image
#20 writing image sha256:c184be5dfa37bf4853bbf63fcd7e57f4e6470286ed2200e96683e9db276b17ca done
#20 naming to docker.io/library/namelessrealms-official-web:f4-local-verify done
#20 DONE 0.1s
EXIT_DOCKER=0
```
耗時：23:07:50 → 23:08:56（約 66 秒，含冷拉基底）。

⚠️ **關鍵證據**：`#12 [deps 5/5] RUN yarn install --frozen-lockfile` +
`yarn install v1.22.22` ⇒ **容器內確實走 yarn 路徑**，且在
`package-lock.json` 已不存在的情況下建置成功 ⇒ 刪檔對發版流程零影響。

**清理**（⛔ 未跑任何全域 `prune`，本機另有 meridian / aegis / discord-bot 等他專案 image）：
```
$ docker rmi namelessrealms-official-web:f4-local-verify
Untagged: namelessrealms-official-web:f4-local-verify
Deleted: sha256:c184be5dfa37bf4853bbf63fcd7e57f4e6470286ed2200e96683e9db276b17ca
```

> ⚠️ **與 plan-review 待裁點的實況出入（據實記錄）**：review 曾請架構師裁決
> 「基底 image `node:20-alpine`（約 160 MB）留或刪」，主迴圈裁「留」。
> **但實查後該裁定不適用**——`docker image inspect node:20-alpine` 回
> `No such image`，本機 `node` repository 下只有 16-alpine / 22 / 22-alpine /
> 22-bookworm-slim。⇒ BuildKit 將基底放在 **build cache**，⛔ 不落在一般 image 儲存區
> ⇒ **⛔ 沒有可留或可刪的對象，本項無須動作**。

### 驗收 8：Dockerfile 已無 npm 死碼

```
$ grep -nE "package-lock|npm ci" Dockerfile
（無輸出）
$ grep -n "npm run build" Dockerfile
17:RUN npm run build
```

deps 階段最終樣貌：
```
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
```

> ⚠️ **稽核側請注意行號位移**：`RUN npm run build` 由原第 **20** 行移到第 **17** 行，
> 這是 deps 段少 3 行造成的**純位移**，⛔ **不是那一行被改動**。
> 佐證：`git diff Dockerfile` 的 hunk 僅涵蓋 deps 段，該行不在 diff 內。

### 驗收 9 / 10：守界與暫存區

```
$ git status --porcelain
M  .gitignore
M  Dockerfile
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
D  package-lock.json
?? docs/tasks/F4-plan-review.md
?? docs/tasks/F4-plan.md
?? docs/tasks/F4.md

$ git diff --cached --name-status
M	.gitignore
M	Dockerfile
D	package-lock.json

$ git diff --stat app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
 3 files changed, 92 insertions(+), 89 deletions(-)
```

⇒ 暫存區**恰 3 個路徑**；三個既有未 commit 改動 X 欄皆為空白（**未暫存**），
diffstat **92+/89-** 與 F2 稽核時記錄的數值相同 ⇒ **內容未被動過**。

### 條 D：忽略集合快照（⚠️ 判準已修正，稽核側勿誤判）

```
$ git status --porcelain --ignored | grep "^!!"
!! .DS_Store
!! .github/.DS_Store
!! .next/
!! .vscode/
!! app/.DS_Store
!! app/api/.DS_Store
!! node_modules/
!! public/.DS_Store
!! web.log
!! yarn-error.log
```

> ### ⚠️ 補上 before 對照與 diff（2026-08-31，稽核側指出後補）
>
> 本報告初版**只貼了 after、⛔ 沒貼 before、也沒貼 diff** —— 而 plan-review 定的判準是
> 「`!!` 行 before/after **零差異**」，那是**對照式判準**，⛔ 只貼一邊自證不了。
> 現場其實有 `<實作側 scratchpad>/F4/ignored.before.txt` 落檔，初版未引用。補跑對照：
>
> ```
> $ diff <(cat <scratchpad>/F4/ignored.before.txt) <(git status --porcelain --ignored | grep "^!!")
> （無輸出）
>   exit=0  ⇒ ✅ before/after 零差異 ⇒ 條 D 判準成立
> ```

⚠️ **`package-lock.json` ⛔ 不出現在 `!!` 區，這是正確結果，⛔ 不是規則沒生效。**
理由：`git status --ignored` 只列**存在於工作樹**的檔，而本任務是**連硬碟一起刪**。
（對照 F2：`web.log` 是 `--cached` 保留硬碟檔，所以它**會**出現在上表——語義不同。）
⇒ 「忽略規則確實生效」的正面證據由**驗收 3** 承擔。
⚠️ plan 原本把 F2 的期望值照搬（期望 `!!` 新增 `package-lock.json`），
已由 plan-review 判定為錯並修正為「`!!` 零差異才是正確預期」。

### 負向流程與還原方式

- **負向對照**見驗收 4c（故意寫錯 ignore 規則 → 證明檢查抓得到）。
- **還原方式（⚠️ 2026-08-31 依稽核側建議改寫，主要來源改為 git 歷史）**：
  - **主要來源 = git 歷史（耐久）**：`git cat-file blob HEAD:package-lock.json`
    → md5 `eec63612e4c521729062d82ca2655e35`。
    ⚠️ 本任務尚未 commit，該 blob 仍在 `HEAD`；即使 commit 後亦可由該 commit 的
    parent 取回 ⇒ **回滾能力⛔ 不會因 scratchpad 消失而喪失**。
  - **次要來源 = scratchpad 備份（⚠️ 非耐久，會隨 session 消失）**：
    `package-lock.json.bak`，221,139 bytes，md5 `eec63612e4c521729062d82ca2655e35`。
  - ✅ 兩者與刪除前原檔 md5 **三方完全相同**（已實跑比對）。
  - ⛔ **全程未使用 `git checkout`**（會清掉三個既有未 commit 改動）。

---

## 審計確認

- ⛔ 本任務未新增任何 `console.log` / `console.error`，⛔ 未觸及任何 Route Handler、
  middleware、認證流程 ⇒ ⛔ 無機密入 log 的風險面。
- ⛔ 本報告未載入任何 token / webhook URL / `ADMIN_DISCORD_ID` 原值。
- `.dockerignore` 已擋 `.env` / `.git` / `node_modules` / `.next`
  ⇒ `docker build` 的 build context ⛔ 不含機密（**鐵則 1** 對齊）。

---

## 產物重建

- [x] 已跑 `yarn build` → `EXIT_BUILD=0`（輸出見驗收 6）。
- [x] 額外已跑 `docker build` → `EXIT_DOCKER=0`（輸出見驗收 7）——
      因本任務改動了建置容器定義，⛔ 只跑 `yarn build` 不足以證明未壞。
- [ ] 跨 repo 依賴：**不適用**（本任務⛔ 未涉及其他 repo）。

---

## git 對帳

```
$ git rev-parse --short HEAD
6d315cb                       ← 基準 commit，⛔ 本任務尚未 commit

$ git status
⛔ 非 clean：本任務改動已暫存（3 路徑）但尚未 commit；
   另有三個既有未 commit 改動（與本任務無關）與三份未追蹤的 F4 文件。

$ git ls-remote origin developers
6d315cb440b43890b00b8d4d1a571a88fbc24503
⇒ 本地 HEAD = 遠端 developers（⚠️ 本任務改動⛔ 尚未 commit，故⛔ 尚未 push）
```

---

## CI

- **本地嚴格指令**：
  - `yarn build` → **EXIT_BUILD=0**（✅ 綠，輸出見驗收 6）
  - `yarn lint --max-warnings 0` → ⛔ **未跑，經架構師 2026-08-31 明確豁免**
    （理由：本任務⛔ 未動任何 `.ts` / `.tsx`，lint 對象集合不變）。
    ⚠️ 據實標明為「豁免未跑」，⛔ 不冒充已執行。
- ⚠️ **本專案沒有 build/lint CI**（唯一 workflow `push-docker.yaml` 只在 tag
  `v*.*.*` 時 build image）⇒ 收案標準 = **本地嚴格指令逐字跑過並附輸出**，
  ⛔ 不得寫「等 remote Actions 綠」。
- ⛔ **未打任何 tag**（打 `v*.*.*` tag 就是發版）。⛔ **未 push 任何 docker image。**

---

## 真機 E2E

**不適用** —— 本任務⛔ 未觸及任何 UI、路由或使用者可見行為。
⇒ ⛔ 不列步驟表，⛔ 不以「不適用」冒充已驗。

---

## 回歸守門

| 證據 | 結果 |
|---|---|
| `yarn install --frozen-lockfile` 在無 `package-lock.json` 下成功 | ✅ EXIT=0 |
| `yarn build` 全部 **12** 條路由建置成功（⚠️ 初版誤寫 13，已更正——13 是靜態頁數） | ✅ EXIT=0 |
| `docker build` 完整三階段成功、容器內走 yarn 路徑 | ✅ EXIT=0 |
| `yarn.lock` md5 未變 | ✅ `1c92ad40…` |
| 三個既有改動 diffstat 未變 | ✅ 92+/89- |
| `.github/workflows/push-docker.yaml` 內 `package-lock` 引用數 | **0**（刪檔⛔ 不動發版流程） |

---

## 守界聲明

- ✅ 只做任務包三件事（刪 npm lock / `.gitignore` 補擋 / Dockerfile deps 去死碼），
  ⛔ 未超前實作 F1、F5、F6。
- ✅ ⛔ 未改 builder 階段 `RUN npm run build`（架構師裁定禁動）。
- ✅ ⛔ 未跑 `npm install`（會重新生成 `package-lock.json`，與本任務相反）。
- ✅ 逐檔 `git add`，⛔ 未用 `git add .`；三個既有未 commit 改動未被暫存或修改。
- ✅ ⛔ 未用 `git checkout`；回滾備份已備妥。
- ✅ ⛔ 未開 `.evidence/` 目錄（沿用 F2 裁定「丙」，證據直接落本報告）。
- ✅ ⛔ 未打 tag、⛔ 未 push image、⛔ 未跑全域 `docker prune`。
- ✅ 鐵則對齊：⛔ 未觸及機密處理、授權判準、對外 API 錯誤格式、`data/` 內容資料。

### carryover（本階段未解，據實列出）

1. ⛔ **建置 Middleware 大小的非決定性未追成因**（74.8/74.9 跳動）——F2 已列，本次沿用。
2. ⛔ **兩份 lock 的一致性為「抽驗 4 個套件」，⛔ 非全量比對**
   （`next` 14.1.0 / `react` 18.3.1 / `next-auth` 4.24.13 / `lucide-react` 0.330.0）。
   ⚠️ 但全量等價性由**驗收 5 + 7** 承擔：`yarn.lock` 獨自完成本機與容器內兩次完整安裝。
3. ⚠️ **子代理中斷時的「基準 build 8.64s」紀錄存在，但只落在 session 級 scratchpad**
   （`build.baseline.log`，1,758 bytes）⇒ **⛔ 不具耐久性**，本報告⛔ 未引用為證據。
   ⚠️ 初版誤寫成「無落檔支撐（未留存）」，經稽核側指出後查證更正 —— 詳見報告開頭的更正框。
4. ⚠️ **收案時主迴圈待辦**（⛔ 不在本包範圍）：
   ① `CLAUDE.md` 地雷清單第 5 條（兩份 lock 並存）標已解；
   ② `CLAUDE.md`「領域專屬約束 → 套件管理器」節須改寫——現行文字說
   「Dockerfile 的 deps 階段**優先用** `yarn install --frozen-lockfile`」，
   改動後 deps 階段已是**無條件** yarn，該描述不再精確。
   ⚠️ 該節「⛔ 不得跑 `npm install`」的條文**應保留**，但理由要改寫
   （原因不再是「會讓兩份 lock 分岔」，而是「會讓已刪除的 npm lock 復活」）。

- ⛔ **尚未 commit / push，等待架構師確認。**
  本報告任何措辭均⛔ 不構成 commit/push 預授權；`push-gate` 擋 push 是預期行為。
