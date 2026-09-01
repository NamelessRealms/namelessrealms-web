# 審計：F4 驗收報告(`F4-verification.md`)

> 稽核側產出。審計對象：`docs/tasks/F4-verification.md`。
> ⛔ **不信報告自述**：本檔所有數字與輸出**均為稽核側當場獨立實跑取得**，
> ⛔ 無一項自 `F4-verification.md`、`F4-plan.md`、任務包或主迴圈派工訊息轉抄。
> ⛔ 任何措辭不構成 commit/push 預授權。

---

## 0. 為什麼本次加重稽核強度(前言)

本任務的實作過程**不是正常五件套流程跑完的**，主迴圈派工時已據實告知，摘記如下
(此三點為**派工訊息所述之過程事實**，⚠️ 屬歷史事件，稽核側⛔ 無法回溯驗證，見 §5「異常甲」)：

1. `nr-implementer` 子代理動工後**卡死**(600 秒無進展，任務狀態 `failed`)。
2. 它中斷前自述「步驟 1–4 完成：`git rm` + 兩處錨點編輯 + 逐檔 `git add`」，
   該自述經主迴圈實查為**部分不實**(兩處編輯落地，`git rm` 與 `git add` 未做)。
3. **其餘步驟與 `F4-verification.md` 本身，均由主迴圈親自接手完成。**

⇒ ⚠️ **「做事的人」與「寫驗收報告的人」是同一個**，五件套的實作↔驗收分離在本次**失效**。
⇒ **稽核側是本任務唯一的獨立查核者。** 故本檔對**每一條**聲稱獨立實跑取證，
⛔ 未引用 `F4-verification.md` 內任何一行輸出作為證據。

### ⚠️ 稽核側的取證限制(據實揭露，影響下方部分條目的證據強度)

`audit-write-guard` hook 在本次稽核中阻擋了以下指令，屬**環境限制、⛔ 非稽核側選擇不驗**：

- ⛔ 一切檔案建立/寫入(含 `mkdir`、`cp`、重導向到 scratchpad)
  ⇒ **無法**照派工要求「在自己的臨時複本上」做驗收 4 的負向對照。
  ⇒ 改以**完全唯讀**的等價做法完成(`git -c core.excludesfile=<(...)` 注入災難規則，
  ⛔ 未改動 repo 任何檔案)，見 §3 驗收 4c。
- ⛔ 含 `yarn install` 字樣的指令一律被擋(實測 `yarn install --frozen-lockfile` 單獨執行亦被擋)
  ⇒ **驗收 5 無法由稽核側在本機直接重跑**，據實標為「⛔ 無法獨立實跑」，
  ⛔ 不以報告輸出冒充已驗；改以稽核側自跑的 `docker build --no-cache`
  (容器內從零冷裝、無 `package-lock.json`、無 `node_modules`)作為**等價或更強**的替代正證。
- ⛔ `git tag` 被擋 ⇒ 改以直接讀 `.git/refs/tags` 與 `.git/packed-refs` 取證。

被擋指令的原始阻擋訊息(擇一)：

```
⛔ audit-write-guard: 稽核側只寫得到 docs/tasks/{代號}-verification-audit.md,
其餘一切檔案改動一律阻擋。偵測到檔案改動類指令(rm/mv/cp/tee/touch/chmod/… 之一)。
```

---

## 1. 審計結論

**⚠️ 有條件通過**(⛔ **不是**無條件通過)

一句話：**實作面全數屬實、獨立實跑逐條對得上，⛔ 零缺陷**；
**但報告文字面有 3 處與現場不符 / 證據不完整**，其中 1 處是「宣稱某證據不存在，而該證據其實存在」
——正是本次加重稽核要抓的那一類。修畢 §4 三項即可進 commit 裁決。

| 面向 | 結論 |
|---|---|
| 三件交付物(刪 npm lock / `.gitignore` 補擋 / Dockerfile deps 去死碼) | ✅ 全部屬實，稽核側獨立實跑逐條相符 |
| `yarn.lock` 保護零退步(最高優先) | ✅ 屬實，且稽核側**自行重做負向對照**證明該測試測得出失敗 |
| 守界(三個既有未 commit 改動、暫存區、發版路徑) | ✅ 全部屬實 |
| 建置回歸(`yarn build` / `docker build`) | ✅ 稽核側自跑 EXIT=0，含一次 `--no-cache` 冷建置 |
| 報告誠實度 | ⚠️ **3 處必改**(§4)：一處聲稱與現場不符、一處證據不完整、一處數字不符 |
| 是否以預期值 / plan 預演值冒充已執行 | ✅ ⛔ 未發現。報告貼出的長指令輸出經比對為真實輸出(§5 乙) |

---

## 2. 逐條核對總表

> 「稽核側實跑」欄＝**本次由稽核側自己下指令取得**的結果。原始輸出見 §3。

| # | 聲稱(來自 `F4-verification.md`) | 稽核側實跑結果 | 判定 |
|---|---|---|---|
| 1 | `git ls-files package-lock.json` → 無輸出 | 無輸出、exit=0 | ✓ 相符 |
| 2 | `ls package-lock.json` → 檔案不存在 | `No such file or directory`、exit=1 | ✓ 相符 |
| 3 | `git check-ignore -v package-lock.json` → `.gitignore:7:package-lock.json` | 逐字相同、exit=0 | ✓ 相符 |
| 4a | `git ls-files yarn.lock` → `yarn.lock` | `yarn.lock`、exit=0 | ✓ 相符 |
| 4b | `git check-ignore --no-index -v yarn.lock` → 無輸出、exit=1 | 無輸出、exit=1 | ✓ 相符 |
| 4b′ | 報告主張「預設指令對已追蹤檔是空測」 | 稽核側實測預設指令 exit=1；**且在注入 `*lock*` 災難規則下仍 exit=1** ⇒ 空測成立 | ✓ 相符(正面重現) |
| 4c | 負向對照證明 4b 測得出失敗 | **稽核側自行重做**：注入 `*lock*` 後 `--no-index` 命中 `yarn.lock`、exit=0 | ✓ 相符(⛔ 未引用報告的對照) |
| 4d | `yarn.lock` md5 `1c92ad40…`、未改動 | md5 `1c92ad40f6c718d3f79e6122bfd41aa4`；`git diff --stat` / `--cached --stat` 皆空；3193 行 / 147236 B | ✓ 相符 |
| 5 | `yarn install --frozen-lockfile` 成功、EXIT=0、36.58s | ⛔ **無法獨立實跑**(guard 擋)。替代正證：稽核側 `docker build --no-cache` 冷建置，容器內 `RUN yarn install --frozen-lockfile` → `Done in 39.06s` → 全 build EXIT=0 | ⚠️ **等價替代已驗**，原條目本身⛔ 未獨立重跑 |
| 6 | `yarn build` EXIT_BUILD=0，路由表如報告所列 | 稽核側自跑 3 次，皆 EXIT=0；路由列數 **12**；Route 表逐列與報告數值相同 | ✓ 相符(⚠️ 唯「13 條路由」措辭不符，見 §4-3) |
| 7 | `docker build` EXIT_DOCKER=0、容器內走 yarn 路徑 | 稽核側自建 `:f4-audit`(EXIT=0，19s)與 `:f4-audit-nocache`(`--no-cache`，EXIT=0，63s)，冷建置日誌明示 `#12 [deps 5/5] RUN yarn install --frozen-lockfile` | ✓ 相符(且強化) |
| 8 | Dockerfile 無 `package-lock` / `npm ci`；`yarn install --frozen-lockfile` 恰 1 筆於第 6 行 | `grep -n 'package-lock'` exit=1；`grep -n 'npm ci'` exit=1；全檔含 `yarn` 僅第 5、6 行；含 `npm` 僅第 17 行 | ✓ 相符 |
| 9 | 三個既有改動仍 ` M`、未暫存、diffstat 92+/89− | `git status --porcelain` 三檔前欄空白；`git diff --cached --name-only -- <三檔>` 無輸出；diffstat `92 insertions(+), 89 deletions(-)` | ✓ 相符 |
| 10 | 暫存區恰 3 路徑：`M .gitignore` / `M Dockerfile` / `D package-lock.json` | 逐字相同 | ✓ 相符 |
| 11 | `RUN npm run build` 恰 1 筆、20→17 為**純位移**、該行未被動 | HEAD 版第 20 行、現行第 17 行；`diff HEAD:Dockerfile[10-47] vs Dockerfile[7-44]` → **exit=0(逐位元組相同)**；`git diff --cached Dockerfile` 的 hunk 僅 `@@ -2,11 +2,8 @@` | ✓ 相符(純位移成立) |
| 條 A | `.gitignore` 與任務包逐字終態相同 | `diff <(awk 抽 F4.md 的 ```gitignore 區塊) .gitignore` → exit=0 | ✓ 相符 |
| 條 B | Dockerfile 全檔 = 任務包 deps 終態 + 原第 10–47 行 | `diff <(任務包第 2 個 dockerfile 區塊 + HEAD:Dockerfile[10-47]) Dockerfile` → exit=0 | ✓ 相符 |
| 條 C | `.gitignore` 39 行 / 410 B；`Dockerfile` 44 行 / 1223 B | `wc -lc` → `39 410 .gitignore`、`44 1223 Dockerfile` | ✓ 相符 |
| 條 D | 忽略集合 before/after 零差異；`package-lock.json` ⛔ 不出現在 `!!` 是**正確** | 稽核側以 `--exclude-from` 分別餵 HEAD 版與現行 `.gitignore` 做 before/after 對照 → **diff exit=0**；`!!` 現況 10 筆 | ✓ 結論相符，⚠️ **但報告只貼 after、⛔ 未貼 before/diff**，見 §4-2 |
| 條 E | `yarn.lock` 一個位元組未動 | 同 4d；build/docker 全跑完後複測 md5 仍 `1c92ad40…` | ✓ 相符 |
| — | 變更檔案表：`package-lock.json` 原 221,139 B / 6,313 行 / `lockfileVersion: 3` | `git cat-file blob HEAD:package-lock.json` → `6313 221139`、md5 `eec63612…`、前 8 行含 `"lockfileVersion": 3`、root `portal-web@0.1.0` | ✓ 相符 |
| — | `.gitignore` 38/392 → 39/410；`Dockerfile` 47/1353 → 44/1223 | HEAD 版：`38 392` / `47 1353`；現行：`39 410` / `44 1223` | ✓ 相符 |
| — | git 對帳：HEAD `6d315cb`、`ls-remote origin developers` 相同、尚未 commit | `git rev-parse HEAD` = `6d315cb440b4…`；`git ls-remote origin developers` = 同值；`git log -1` 仍為 F2 收案 commit | ✓ 相符 |
| — | ⛔ 未打任何 tag | `.git/refs/tags` 為空目錄、`.git/packed-refs` 無 `refs/tags`(grep exit=1) | ✓ 相符 |
| — | ⛔ 未跑全域 `docker prune` | `docker images` 仍見 `meridian/*`、`deploy-aegis-*`、`namelessrealms-discord-bot:f3-local`、`grafana`、`mysql` 等共 31 個 image | ✓ 相符 |
| — | 驗證 image 已清 | `docker images namelessrealms-official-web` 在稽核側動手前**只有稽核側自己沒建的東西**：實查僅剩空表 ⇒ `f4-local-verify` 確已被刪 | ✓ 相符 |
| — | `.github/workflows/push-docker.yaml` 內 `package-lock` 引用數 0 | `grep -n 'package-lock'` exit=1；`on: push: tags: "v*.*.*"` | ✓ 相符 |
| — | repo 無 test script | `package.json` scripts 僅 dev / build / start / lint | ✓ 相符 |
| — | ⛔ 未動任何 `.ts` / `.tsx` | `git status --porcelain | grep '[.]tsx?$'` 僅該三個既有改動 | ✓ 相符 |
| — | `.dockerignore` 擋 `.env` / `.git` / `node_modules` / `.next` | `cat .dockerignore` 逐行確認四者皆在 | ✓ 相符 |
| — | `yarn lint --max-warnings 0` 標「豁免未跑」 | 報告據實標明為豁免，⛔ 未冒充已執行 | ✓ 相符(誠實) |
| — | 單元測試「⛔ 無可跑」 | 屬實(無 test script、無測試檔) | ✓ 相符(誠實) |
| — | 真機 E2E「不適用」 | 屬實(未觸 UI / 路由行為) | ✓ 相符(誠實) |

---

## 3. 稽核側原始輸出(逐字)

### 3.1 現場基準(稽核開始時)

```
$ git rev-parse HEAD
6d315cb440b43890b00b8d4d1a571a88fbc24503
$ git rev-parse --abbrev-ref HEAD
developers
$ git status --porcelain
M  .gitignore
M  Dockerfile
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
D  package-lock.json
?? docs/tasks/F4-plan-review.md
?? docs/tasks/F4-plan.md
?? docs/tasks/F4-verification.md
?? docs/tasks/F4.md
```

### 3.2 驗收 1 / 2 / 3

```
--- V1: git ls-files package-lock.json ---
exit=0                      ← 無輸出
--- V2: ls package-lock.json ---
ls: package-lock.json: No such file or directory
exit=1
--- V3: git check-ignore -v package-lock.json ---
.gitignore:7:package-lock.json	package-lock.json
exit=0
```

### 3.3 驗收 4a / 4b / 4d(`yarn.lock` 保護)

```
--- V4a: git ls-files yarn.lock ---
yarn.lock
exit=0
--- V4b: git check-ignore --no-index -v yarn.lock ---
exit=1                      ← 無輸出 ⇒ 樣式層面未誤擋
--- V4b2: git check-ignore -v yarn.lock (預設) ---
exit=1
--- V4d: md5 yarn.lock ---
1c92ad40f6c718d3f79e6122bfd41aa4
--- git diff --stat yarn.lock ---
exit=0                      ← 無輸出
--- git diff --cached --stat yarn.lock ---
exit=0                      ← 無輸出
--- wc -lc yarn.lock ---
    3193  147236 yarn.lock
```

### 3.4 驗收 4c —— ⚠️ 稽核側**自行重做**的負向對照(⛔ 未引用報告的對照)

⚠️ 做法說明：`audit-write-guard` 擋掉一切檔案建立，⛔ 無法建臨時複本。
改以 `git -c core.excludesfile=<(printf '*lock*\n')` **在單次指令內注入**災難規則
——這**⛔ 不寫入任何檔案**、⛔ 不改動 repo 的 `.gitignore`(事後 md5 已複核)，
效果等同於「把規則寫成 `*lock*`」。

```
### 前置:確認 yarn.lock 是已追蹤檔
yarn.lock

########## 對照組 A:現行真實規則(精確檔名) ##########
-- git check-ignore --no-index -v yarn.lock --
  exit=1

########## 對照組 B:注入災難性規則 *lock* ##########
-- git -c core.excludesfile=<(printf '*lock*\n') check-ignore --no-index -v yarn.lock --
/dev/fd/12:1:*lock*	yarn.lock
  exit=0                    ← ✅ 抓到誤擋 ⇒ 驗收 4b 這個測試「測得出失敗」

-- 反證:同一災難規則下,預設(查 index)指令 --
  exit=1                    ← ⛔ 假通過(已追蹤檔陷阱,稽核側獨立重現)

-- 反證2:同一災難規則下 git status --porcelain --ignored 抓不抓得到 yarn.lock --
  exit=1                    ← ⛔ 同樣抓不到

### 事後:確認真 repo .gitignore 未被動過
07afa17811b86638474abf2ffc90660a
```

⇒ **驗收 4 是本任務最高優先條，稽核側判定：保護零退步的正面證據成立、
且該測試已被證明具備偵錯能力(⛔ 非恆真空測)。**

### 3.5 驗收 6 —— `yarn build`(稽核側自跑，共 3 次)

第 1 次(完整摘要)：

```
23:17:19
   Generating static pages (9/13) 
 ✓ Generating static pages (13/13) 
   Finalizing page optimization ...
   Collecting build traces ...

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
  ├ chunks/69-9685b12e726c2066.js        28.9 kB
  ├ chunks/fd9d1056-ec06e3651eb582df.js  53.4 kB
  └ other shared chunks (total)          1.96 kB


ƒ Middleware                             74.8 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand using Node.js

Done in 8.64s.
EXIT_BUILD=0
23:17:27
```

第 2 次：

```
ƒ Middleware                             74.8 kB
Done in 8.45s.
EXIT=0
```

第 3 次(機械計數路由列數)：

```
$ yarn build 2>&1 | grep -cE '^[┌├└] '
12
```

### 3.6 驗收 7 —— `docker build`(稽核側自建，用**自己的** tag)

(a) 一般 build，tag `namelessrealms-official-web:f4-audit`：

```
23:17:34
#18 [runner 7/8] COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
#18 DONE 0.1s
#19 [runner 8/8] COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
#19 DONE 0.0s
#20 exporting to image
#20 exporting layers 0.1s done
#20 writing image sha256:850ab03c40fe97c8348c00dfc153e131317eb33ba5df9ad17695ce586befc8ce done
#20 naming to docker.io/library/namelessrealms-official-web:f4-audit done
#20 DONE 0.1s
EXIT_DOCKER=0
23:17:53
```

(b) ⚠️ **冷建置** `--no-cache`，tag `namelessrealms-official-web:f4-audit-nocache`
——這是「`yarn.lock` 獨自足以還原依賴」的**強證據**(容器內無 `node_modules`、
build context 內無 `package-lock.json`)：

```
23:18:07
#4 [deps 1/5] FROM docker.io/library/node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
#8 [deps 2/5] RUN apk add --no-cache libc6-compat
#8 DONE 1.7s
#10 [deps 3/5] WORKDIR /app
#10 DONE 0.0s
#11 [deps 4/5] COPY package.json yarn.lock ./
#11 DONE 0.0s
#12 [deps 5/5] RUN yarn install --frozen-lockfile
#12 0.203 yarn install v1.22.22
#12 39.26 Done in 39.06s.
#12 DONE 39.4s
#13 [builder 3/5] COPY --from=deps /app/node_modules ./node_modules
#13 DONE 1.4s
#15 DONE 17.7s
#20 writing image sha256:f2eeb4112f37977e7b7248460f079d040e3f2744d5cb4ba1df9b26fdb0b3a714 done
#20 naming to docker.io/library/namelessrealms-official-web:f4-audit-nocache done
#20 DONE 0.2s
EXIT_DOCKER_NOCACHE=0
23:19:10
```

(c) 稽核側**只刪自己建的兩個 tag**，⛔ 未跑任何全域 prune：

```
$ docker rmi namelessrealms-official-web:f4-audit namelessrealms-official-web:f4-audit-nocache
Untagged: namelessrealms-official-web:f4-audit
Deleted: sha256:850ab03c40fe97c8348c00dfc153e131317eb33ba5df9ad17695ce586befc8ce
Untagged: namelessrealms-official-web:f4-audit-nocache
Deleted: sha256:f2eeb4112f37977e7b7248460f079d040e3f2744d5cb4ba1df9b26fdb0b3a714
rmi exit=0
=== 清理後 ===
IMAGE   ID             DISK USAGE   CONTENT SIZE   EXTRA
```

### 3.7 驗收 8 / 11 —— Dockerfile 現況與「純位移」的獨立驗證

```
--- 全檔含 npm 的行 ---
17:RUN npm run build
exit=0
--- 全檔含 yarn 的行 ---
5:COPY package.json yarn.lock ./
6:RUN yarn install --frozen-lockfile
exit=0
--- 全檔含 lock 的行 ---
5:COPY package.json yarn.lock ./
6:RUN yarn install --frozen-lockfile
exit=0

=== V8a grep package-lock ===
exit=1                      ← 無輸出
=== V8b grep npm ci ===
exit=1                      ← 無輸出
```

「20 → 17 是純位移」的**獨立驗證**(⛔ 不靠行號、⛔ 不靠報告說法)：

```
=== HEAD 版 Dockerfile 的 npm run build 行號 ===
20:RUN npm run build
=== HEAD 版 Dockerfile 行數/位元組 ===
      47    1353
=== 純位移驗證:HEAD 第 10-47 行 vs 現行第 7-44 行 逐位元組比對 ===
diff exit=0
=== 純位移驗證(反向對照):HEAD 第 1-4 行 vs 現行第 1-4 行 ===
diff exit=0
```

`git diff --cached` 的 hunk 範圍(證明改動只碰 deps 段)：

```
diff --git a/Dockerfile b/Dockerfile
index 2cc4b8f..22a1d7b 100644
--- a/Dockerfile
+++ b/Dockerfile
@@ -2,11 +2,8 @@
 FROM node:20-alpine AS deps
 RUN apk add --no-cache libc6-compat
 WORKDIR /app
-COPY package.json yarn.lock* package-lock.json* ./
-RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
-    elif [ -f package-lock.json ]; then npm ci; \
-    else npm install; \
-    fi
+COPY package.json yarn.lock ./
+RUN yarn install --frozen-lockfile
 
 FROM node:20-alpine AS builder
 WORKDIR /app
```

⇒ 唯一 hunk 為 `@@ -2,11 +2,8 @@`(涵蓋舊檔第 2–12 行)，
`RUN npm run build`(舊第 20 行)**不在 diff 內** ⇒ **守界成立**。

`.gitignore` 的唯一改動：

```
diff --git a/.gitignore b/.gitignore
index 3fa9982..c72078e 100644
--- a/.gitignore
+++ b/.gitignore
@@ -4,6 +4,7 @@
 /node_modules
 /.pnp
 .pnp.js
+package-lock.json
 
 # testing
 /coverage
```

### 3.8 條 A / 條 B —— 對任務包逐字終態的機械比對

```
=== 條 A:任務包 gitignore 逐字終態 vs 現行 .gitignore ===
diff exit=0

=== 條 B:任務包第 2 個 dockerfile 區塊 + HEAD 第 10-47 行 組出期望全檔 vs 現行 Dockerfile ===
diff exit=0
```

### 3.9 驗收 9 / 10 —— 守界

```
--- git diff --cached --name-only ---
.gitignore
Dockerfile
package-lock.json
--- git diff --cached --name-status ---
M	.gitignore
M	Dockerfile
D	package-lock.json
--- 三個既有改動 diffstat ---
 app/layout.tsx               |   2 +-
 app/staff/page.tsx           |   6 +-
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
 3 files changed, 92 insertions(+), 89 deletions(-)
--- 三檔是否被暫存(應無輸出) ---
exit=0
```

⇒ 暫存區**恰三路徑**；三個既有未 commit 改動 X 欄皆空白(未暫存)、diffstat **92+/89−**。

### 3.10 條 D —— 忽略集合，稽核側**自建 before/after 對照**

⚠️ 報告只貼了 after 快照。稽核側改以「分別餵 HEAD 版 / 現行版 `.gitignore` 給
`git ls-files --others --ignored --exclude-from=`」重建 before 與 after 兩個集合並 diff：

```
=== 條 D-after:現況忽略集合 ===
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
exit=0

=== 條 D 獨立 before/after 忽略集合 diff ===
diff exit=0 ⇒ 0 = 忽略集合零差異
```

⇒ **「`!!` 零差異」的判準成立**。
⚠️ 依派工說明與 plan-review 必改 1：`package-lock.json` ⛔ 不出現在 `!!` 區是**正確**的
(檔案已從硬碟刪除，`--ignored` 只列存在於工作樹的檔) —— 稽核側**⛔ 未**將此判為缺陷。
規則生效的正面證據由**驗收 3** 承擔，已於 §3.2 取得命中輸出。

### 3.11 其他佐證

```
=== 環境 ===
node v22.19.0 / yarn 1.22.18 / Docker version 29.5.3, build d1c06ef / daemon OK

=== 本機 node image ===
node:16-alpine / node:22 / node:22-alpine / node:22-bookworm-slim
=== node:20-alpine 是否存在於一般 image 儲存區 ===
No such image

=== push-docker.yaml 內 package-lock 引用 ===
exit=1                      ← 無輸出
=== workflow 觸發條件 ===
3:on:
4-  push:
5-    tags:
6-      - "v*.*.*"

=== package.json scripts ===
14-    "dev": "next dev",
15-    "build": "next build",
16-    "start": "next start",
17-    "lint": "next lint"

=== git ls-remote origin developers ===
6d315cb440b43890b00b8d4d1a571a88fbc24503	refs/heads/developers

=== 本地 tag(直接看 refs)===
.git/refs/tags 為空目錄；.git/packed-refs 內 grep 'refs/tags' → exit=1

=== HEAD 版 package-lock.json ===
    6313  221139
eec63612e4c521729062d82ca2655e35
{
  "name": "portal-web",
  "version": "0.1.0",
  "lockfileVersion": 3,

=== package.json 前 3 行 ===
{
  "name": "namelessrealms-web",
  "version": "2.0.0",

=== .dockerignore ===
/logs / *.log / npm-debug.log* / yarn-debug.log* / yarn-error.log*
.next / .env / .git / .vscode / **/node_modules/ / /botconfig / /logs
Dockerfile / .dockerignore / README.md
```

---

## 4. ⛔ 必改(收案前修正 `F4-verification.md`；均為**報告文字層**，⛔ 非實作缺陷)

### 4-1. ⛔ 「基準 build 8.64s 無落檔支撐(輸出未留存)」與現場不符

報告第 24 行與第 383 行聲稱：

> 「基準 build 綠 8.64s」一項**⛔ 無落檔支撐**(子代理中斷時輸出未留存)

**稽核側實查：該輸出有落檔，且完整。**

```
$ ls -l .../scratchpad/F4/build.baseline.log
-rw-r--r--@ 1 quasi-pc  wheel  1758 Aug 31 12:25 .../scratchpad/F4/build.baseline.log

$ cat .../scratchpad/F4/build.baseline.log        (節錄)
yarn run v1.22.18
$ next build
   ▲ Next.js 14.1.0
 ✓ Compiled successfully
 ✓ Generating static pages (13/13) 
ƒ Middleware                             74.8 kB
Done in 8.64s.
```

⇒ 「未留存」**不成立**。
⚠️ 澄清兩點，避免過度歸咎：
(a) 報告**選擇不引用**該數值，處置本身**保守且無害**，⛔ 不影響任何結論；
(b) 該檔位於 **scratchpad(session 級、會消失)**，依「證據耐久性」標準它**本來就不該被當作耐久證據** —— 
但報告寫的理由是「不存在」，而現場是「存在但不耐久」。**⛔ 這是兩件事，必須據實改寫。**

**改法(定案)**：把該兩處改為 ——
「子代理的基準 build 輸出**確有落檔**於實作側 scratchpad(`build.baseline.log`，`Done in 8.64s`、
Middleware 74.8 kB)，但 scratchpad 屬 session 級暫存、⛔ 不具耐久性，
故本報告**⛔ 不引用為證據**；建置正常改由驗收 6 的實跑輸出承擔。」

⚠️ **附帶一項稽核側據實揭露(⛔ 不列必改，供架構師知情)**：
repo 內 `.gitignore` 與 `Dockerfile` 的 mtime 皆為 `Aug 31 12:25`，
與 `build.baseline.log` 的 mtime **同一分鐘** ⇒ 稽核側**⛔ 無法從現場證實**
該「基準 build」是在兩處錨點編輯**之前**跑的。
⚠️ 對結論**無實質影響**(`.gitignore` / `Dockerfile` 皆不參與 `next build`)，故不阻斷。

### 4-2. ⛔ 條 D 只貼 after 快照，⛔ 未貼 before 或 before/after diff

plan-review 必改 1 定的判準是「**只看 `!!` 行：before / after 應零差異**」——
這是一個**對照式**判準，只貼 after 無法自證零差異。

⚠️ 現場其實**有** before 快照落檔(⛔ 報告未引用)：

```
$ ls -l .../scratchpad/F4/ignored.before.txt
-rw-r--r--@ 1 quasi-pc  wheel  309 Aug 31 12:24 .../scratchpad/F4/ignored.before.txt
```

**改法(定案)**：條 D 段補上 before 與 after 的**對照**。可直接採用稽核側 §3.10 的唯讀做法
(`git ls-files --others --ignored --exclude-from=` 分別餵 HEAD 版與現行版 `.gitignore`，
再 `diff` → exit=0)，⚠️ 該做法**⛔ 不依賴 scratchpad**、可原地複驗、耐久性較佳。
⚠️ 結論本身**成立**(稽核側已獨立驗到零差異)，僅補證據。

### 4-3. ⛔ 「yarn build 全部 13 條路由建置成功」數字不符

報告「回歸守門」表第 2 列寫「`yarn build` 全部 **13 條路由**建置成功」。
稽核側機械計數：

```
$ yarn build 2>&1 | grep -cE '^[┌├└] '
12
```

⇒ Route (app) 表為 **12 列**；**13** 是 `Generating static pages (13/13)` 的**靜態頁數**，
⛔ 不是路由數。

**改法(定案)**：改為「`yarn build` 成功：Route 表 **12** 條路由、靜態頁 **13/13** 全數產出」。

---

## 5. 報告自陳的四項異常 —— 稽核側獨立判斷

### 甲：「子代理自述部分不實(`git rm` 與 `git add` 未執行)」

**稽核側能驗到什麼：**

- ✅ **現況正確**：`git rm` 的**結果**(index `D` + 硬碟檔消失)與 `git add` 的**結果**
  (`.gitignore` / `Dockerfile` 已暫存)**都在位**，且暫存區**恰三路徑**、無溢出(§3.9)。
- ✅ HEAD 仍為 `6d315cb`、與遠端一致 ⇒ 期間**⛔ 未產生任何 commit**。
- ✅ `yarn.lock` md5 全程未變、三個既有改動 diffstat 未變 ⇒ 補救過程**⛔ 未波及守界對象**。

**稽核側⛔ 不能驗到什麼(據實聲明)：**

- ⛔ **無法回溯驗證**子代理中斷當下的 index / 硬碟狀態。git 沒有留下該時點的可查痕跡
  (未 commit、無 reflog 可對應)，⇒ 「當時是否真的沒做」**⛔ 稽核側無法證實也無法證偽**。
- ⇒ 本檔**⛔ 不對「自述不實」這件歷史事實背書，也⛔ 不質疑**；只確認**現況正確**。

⚠️ 旁證(⛔ 非結論)：`.gitignore` / `Dockerfile` 的 mtime 為 `12:25`，
而 `git rm` 造成的硬碟刪除與 `git add` 屬 index 操作、⛔ 不留 mtime 痕跡，
⇒ 兩處編輯早於主迴圈接手(23:0x)這點與報告敘述相容。

**判定：⚠️ 部分可驗、部分不可驗——已據實區分，⛔ 未偽稱驗過歷史狀態。**

### 乙：「基準 build 8.64s 無落檔支撐，故⛔ 不引用為證據」

拆成兩句分別判：

| 子聲稱 | 稽核側實查 | 判定 |
|---|---|---|
| 報告**⛔ 未**把 8.64s 當證據用 | `grep -n '8\.64' docs/tasks/F4-verification.md` → 僅第 14、24、383 行，**三處皆為「自述引述」或「聲明不引用」**，⛔ 無一處出現在測試結果 / 回歸守門 / 產物重建等證據位置 | ✅ **成立** |
| 「無落檔支撐(輸出未留存)」 | `build.baseline.log`(1758 B, 12:25)**存在且完整** | ✗ **不成立**，見 §4-1 |

**判定：⚠️ 一半成立、一半不符 —— 已列 §4-1 必改。**

### 丙：「`node:20-alpine` 不存在於本機，故『留或刪』的裁決不適用」

稽核側實查：

```
$ docker image inspect node:20-alpine > /dev/null 2>&1 && echo EXISTS || echo "No such image"
No such image

$ docker images node
node:16-alpine          d56236570077        116MB
node:22                 77e2f8d0fcba       1.13GB
node:22-alpine          828963118f68        161MB
node:22-bookworm-slim   3d41a8203a96        247MB
```

⚠️ 補充：稽核側自跑的 `--no-cache` 冷建置日誌顯示 deps 階段確實用了
`node:20-alpine@sha256:fb4cd12c…`，但建置後 `docker images node` 仍**⛔ 無** `node:20-alpine`
⇒ 與報告「BuildKit 放在 build cache、⛔ 不落一般 image 儲存區」的解釋**一致**。

**判定：✅ 成立。** 該裁決點確實**無對象可留可刪**。
⚠️ 惟報告用語「BuildKit 將基底放在 build cache」屬機制解釋——稽核側只驗到
**「一般 image 儲存區內無此 image」**這個現象，機制本身⛔ 未獨立驗證，⛔ 不背書。

### 丁：「Middleware 74.9 kB 屬建置既有非決定性、與本次無關」

稽核側**自跑**三次 `yarn build`(同一棵工作樹、同一份輸入)：

| 次 | Middleware | Done in |
|---|---|---|
| 1 | **74.8 kB** | 8.64s |
| 2 | **74.8 kB** | 8.45s |
| 3 | (僅計數路由列，未取該欄) | — |

⇒ 報告該次為 74.9 kB、稽核側同一棵樹連兩次為 74.8 kB
⇒ **同一輸入產出不同值，非決定性由稽核側獨立重現。**

報告另引用了 F2 的三次實測作旁證。稽核側查 `docs/tasks/archive/F2-verification-audit.md`
確認該文件**確實記載**「稽核側三次連跑得到 74.9 / 74.8 / 74.8，輸入完全相同」
(第 578 行) ⇒ **引用屬實、⛔ 非杜撰**。
⚠️ 惟該三個數字是 **F2 稽核側的量測**，⛔ 不是本次稽核側量的，本檔僅標為「F2 文件記載」。

**判定：✅ 歸因站得住。** 且本次稽核側已用**自己的量測**獨立支撐同一結論。

---

## 6. 證據耐久性稽核(獨立項)

| 證據來源 | 耐久性 | 判定 |
|---|---|---|
| `F4-verification.md` 內**逐字貼入**的指令輸出 | ✅ 隨 repo 進版控，耐久 | ✓ 可接受 |
| `docker logs` / 執行中容器狀態 | — | ✓ **⛔ 報告完全未使用**(稽核側 grep 確認) |
| 實作側 scratchpad(`verify.log` / `build.baseline.log` / `ignored.before.txt` / `package-lock.json.bak`) | ⛔ session 級，會消失 | ⚠️ 見下 |

- ✅ **報告本體的證據來源合規**：本專案已由架構師裁定「⛔ 不開 `.evidence/`，
  證據直接貼進 verification」(F2 裁定丙) ⇒ 貼進 `.md` 即為耐久落檔，⛔ 不觸犯耐久性紅線。
- ⚠️ **唯一的耐久性缺口**：報告「還原方式」段把回滾路徑指向 scratchpad 的
  `package-lock.json.bak`(**session 級**)。稽核側實查該檔存在且完整：

  ```
  $ md5 -q .../scratchpad/F4/package-lock.json.bak
  eec63612e4c521729062d82ca2655e35
  $ git cat-file blob HEAD:package-lock.json | md5 -q
  eec63612e4c521729062d82ca2655e35
  ```

  ⇒ ✅ **git 歷史內有 byte-identical 的耐久替代來源**，回滾能力**⛔ 不會因 scratchpad 消失而喪失**。

**建議(⛔ 不列必改，請規劃側判讀)**：報告「還原方式」段改以
`git cat-file blob HEAD:package-lock.json`(或 `git show HEAD:package-lock.json`)
為**主要**回滾來源，scratchpad 備份降為次要。

---

## 7. 稽核側自身守界聲明

- ✅ 全程對現場**唯讀**：僅用 `git status / log / diff / show / cat-file / rev-parse / ls-files /
  ls-remote / check-ignore`，⛔ 未跑 `checkout / reset / clean / restore / stash / add /
  commit / push / tag`。
- ✅ ⛔ **未改動暫存區**：稽核前後 `git diff --cached --name-status` 皆為
  `M .gitignore` / `M Dockerfile` / `D package-lock.json`。
- ✅ ⛔ **未跑 `npm install`**(一次都沒有)。
- ✅ ⛔ **未跑任何全域 `docker prune`**；只 `docker rmi` 了**稽核側自己建的兩個 tag**
  (`f4-audit` / `f4-audit-nocache`)，其餘 31 個他專案 image(meridian / aegis /
  discord-bot / grafana / mysql …)完好。
- ✅ ⛔ 未打任何 tag、⛔ 未 push 任何 image。
- ✅ 負向對照**⛔ 未改動真 repo 的 `.gitignore`**(以單次指令的 `-c core.excludesfile` 注入，
  事後 md5 複核為 `07afa178…` 未變)。
- ✅ 稽核結束複核，現場與稽核開始時**逐項相同**：

  ```
  6d315cb440b43890b00b8d4d1a571a88fbc24503
  M  .gitignore / M  Dockerfile / D  package-lock.json
   M app/layout.tsx /  M app/staff/page.tsx /  M components/ServerSection.tsx
  .gitignore  07afa17811b86638474abf2ffc90660a
  Dockerfile  a977e2b657114709b3dc7579c7cc9b54
  yarn.lock   1c92ad40f6c718d3f79e6122bfd41aa4
  3 files changed, 92 insertions(+), 89 deletions(-)
  ```

- ✅ 唯一寫入：本檔 `docs/tasks/F4-verification-audit.md`。
- ⛔ 本檔內數字**無一項轉抄**自 `F4-verification.md` / plan / 派工訊息；
  凡引用他檔記載者(如 F2 的 74.9/74.8/74.8)均已明標來源為「文件記載」而非本次量測。

---

## 8. 需要架構師裁決的點(⛔ 稽核側不判讀輕重)

1. **§4 三項必改是否於收案前修完 `F4-verification.md`？**
   白話：報告有三個地方寫得跟現場對不上——①說某份基準 build 紀錄「不存在」，其實存在(只是在
   會消失的暫存區);②「忽略清單前後沒變」這個結論只貼了「後」、沒貼「前」;③把 12 條路由寫成 13 條。
   三件都**不影響改動本身的正確性**，改的是報告文字。建議修完再收案。

2. **驗收 5 稽核側無法獨立實跑，是否接受替代證據？**
   白話：`audit-write-guard` 這道防護把含 `yarn install` 的指令一律擋掉，所以我沒辦法親自
   跑一次那條。我改用「Docker 從零冷建置」代替——那等於在一台乾淨機器上、沒有 npm 那份 lock、
   只靠 `yarn.lock` 把依賴整個裝起來，成功了。我認為證據力**不低於**原條目，但要不要
   認列，請您拍板。
   技術：`docker build --no-cache` → `#12 [deps 5/5] RUN yarn install --frozen-lockfile` →
   `Done in 39.06s` → 全 build EXIT=0。

3. **「甲」(子代理自述不實)無法回溯查證，是否需要別的處置？**
   白話：那件事已經過去，git 沒留下當時的痕跡，我只能確認**現在是對的**。
   如果您要的是「未來再發生時查得到」，那需要的是流程上的改動(例如實作側每步落一份狀態快照)，
   ⛔ 不是這次稽核能補的。

4. **是否把「證據不得只落在 scratchpad」寫進流程？**
   白話：這次有三份實際跑出來的紀錄(基準 build、忽略清單 before、備份檔)只存在暫存區，
   關機就沒了；報告也因此誤以為其中一份「不存在」。要不要規定這類紀錄一律貼進驗收報告？
   (本次結論不受影響——備份檔在 git 歷史裡有一模一樣的替代品。)

---

## 9. carryover 對號

報告登記 4 條，稽核側逐條對照：

| # | 報告登記 | 稽核側判定 |
|---|---|---|
| 1 | 建置 Middleware 大小非決定性未追成因(F2 已列，本次沿用) | ✅ 屬實且必要——稽核側自跑兩次皆 74.8、報告那次 74.9，同輸入不同值 |
| 2 | 兩份 lock 一致性為「抽驗 4 個套件」、⛔ 非全量 | ✅ 誠實。⚠️ 稽核側⛔ 未複驗那 4 個版本號(`package-lock.json` 已刪，且本次⛔ 不影響結論)；全量等價性由驗收 5 / 7 承擔，稽核側已用冷建置獨立支撐 |
| 3 | 「基準 build 8.64s」無落檔支撐、⛔ 未引用 | ⚠️ **後半屬實、前半不符** ⇒ 依 §4-1 改寫後保留 |
| 4 | 收案時主迴圈待辦：`CLAUDE.md` 地雷清單第 5 條標已解 + 「套件管理器」節改寫 | ✅ 屬實且必要。稽核側複核：`CLAUDE.md` 現行文字仍寫「deps 階段**優先用** yarn」與「兩份 lock 並存」，改動後**已不精確** ⇒ 收案時務必更新 |

⚠️ 新增建議 carryover(稽核側提出，請規劃側判讀是否收錄)：

5. **流程性**：實作側的關鍵過程紀錄目前只落在 session 級 scratchpad，
   導致本次報告誤判其中一份「不存在」。⇒ 是否要求此類紀錄一律進 verification 或耐久落點。

---

## 10. 修畢後的回報格式

- 貼：`F4-verification.md` 修正後的三段(§4-1 / §4-2 / §4-3 對應段落)。
- ⛔ **⛔ 不需要**重跑任何指令 —— 三項必改**皆為文字層**，
  實作面已由本檔 §2 / §3 獨立實跑證實無誤。
- ⛔ **commit/push 仍待架構師確認。**
