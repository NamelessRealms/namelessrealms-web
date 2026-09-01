# 實作計畫：F4 收斂 lock 檔——移除 package-lock.json + Dockerfile deps 去死碼

> 實作側（`nr-implementer`）依 `docs/tasks/F4.md` 產出。
> ⛔ **本檔落檔時尚未動手實作**，等 `docs/tasks/F4-plan-review.md` 放行才動工
> （repo `CLAUDE.md` 開發守則第 7 條）。
>
> ⚠️ 本檔內所有數值**均為實作側自行實測**，⛔ 無一項自任務包 / 主迴圈 / 他處轉抄。
> 取得數值的指令逐條附在該數值旁，可原地複驗。
> ⚠️ 凡**未實跑**者一律明標「⛔ 未驗」，⛔ 不以源碼推理冒充。

---

## 0. 基準事實複驗（⚠️ 全部自行實跑，⛔ 不轉抄任務包）

### 0.1 基準 commit — ✅ 與任務包一致

```
$ git rev-parse HEAD
6d315cb440b43890b00b8d4d1a571a88fbc24503

$ git rev-parse --abbrev-ref HEAD
developers
```

⇒ 任務包寫的 `6d315cb` **複驗相符**（短碼為此長碼前 7 碼）。分支 `developers` 正確。

### 0.2 兩份 lock 檔現況 — ✅ 與任務包一致

```
$ wc -lc yarn.lock package-lock.json
    3193  147236 yarn.lock
    6313  221139 package-lock.json

$ ls -l yarn.lock package-lock.json
-rw-r--r--  1 quasi-pc  staff  221139 Feb 12  2026 package-lock.json
-rw-r--r--  1 quasi-pc  staff  147236 Feb 12  2026 yarn.lock

$ git ls-files yarn.lock package-lock.json
package-lock.json
yarn.lock

$ md5 -q yarn.lock package-lock.json
1c92ad40f6c718d3f79e6122bfd41aa4     # yarn.lock
eec63612e4c521729062d82ca2655e35     # package-lock.json
```

⇒ 任務包的 147,236 / 3,193 與 221,139 / 6,313、兩者 mtime 2026-02-12、均入版控
——**逐項複驗相符**。`yarn.lock` 的 md5 `1c92ad40…` 是本任務「⛔ 一個位元組都不動」的對帳基準（見 §4 條 E）。

### 0.3 依賴解析抽驗（自行重跑，⛔ 不轉抄任務包的表）

```
$ for p in next react next-auth lucide-react; do
    y=$(grep -A2 "^\"\?$p@" yarn.lock | grep -m1 '^  version' | tr -d ' "' | sed 's/version//')
    n=$(python3 -c "import json;d=json.load(open('package-lock.json'));print(d['packages'].get('node_modules/$p',{}).get('version','?'))")
    printf "%-14s yarn=%-10s npm=%s\n" "$p" "$y" "$n"
  done
next           yarn=14.1.0     npm=14.1.0
react          yarn=18.3.1     npm=18.3.1
next-auth      yarn=4.24.13    npm=4.24.13
lucide-react   yarn=0.330.0    npm=0.330.0
```

⇒ 抽驗 4 個一致，與任務包相符。⚠️ 這是**抽驗**，⛔ 不是全量比對——驗收引用時照任務包措辭寫「抽驗一致」。

### 0.4 `.gitignore` 現況 — ✅ 與任務包一致

```
$ wc -lc .gitignore
      38     392 .gitignore

$ md5 -q .gitignore
c00fe3e470d64c88983b06a29cb0ddb6
```

38 行 / 392 bytes，即 F2 收案後終態（`md5` 與 F2 驗收報告記載的改後值一致）。
逐行核過：`# dependencies` 節為第 3–6 行（`/node_modules` / `/.pnp` / `.pnp.js`），
**目前沒有**任何 `package-lock` 相關規則，也**沒有**任何會誤傷 `yarn.lock` 的樣式
（實測 `grep -n 'lock' .gitignore` → **無輸出、exit=1** ⇒ 全檔目前**零條**含 `lock` 字樣的規則）。

### 0.5 `Dockerfile` 現況 — ✅ 與任務包一致

```
$ wc -lc Dockerfile
      47    1353 Dockerfile

$ md5 -q Dockerfile
107a8a9e39a4216cf31a3ae3ac3adfd0
```

第 1–9 行（deps 階段）與任務包背景區逐字相符，含第 5 行
`COPY package.json yarn.lock* package-lock.json* ./` 與第 6–9 行的三分支 `if`。
第 20 行為 `RUN npm run build`（⛔ 本次不動）。
`EXPOSE 56130` / `ENV PORT=56130` / `CMD ["node", "server.js"]` 分別在第 43 / 44 / 47 行。

### 0.6 `package-lock` 在 repo 內的其他引用（本計畫加查，⛔ 任務包未列）

```
$ grep -rn --exclude-dir=node_modules --exclude-dir=.git \
      --exclude=package-lock.json --exclude=yarn.lock -l 'package-lock' .
Dockerfile
CLAUDE.md
docs/tasks/F4.md
docs/tasks/archive/F2.md
```

⇒ ⚠️ **`.github/workflows/push-docker.yaml` 內無任何 `package-lock` 引用**
（唯一 workflow 只做 `docker build` + push）⇒ **刪檔不會弄壞發版流程**。
`CLAUDE.md` 的引用由主迴圈於收案時處理（任務包已列，⛔ 非本次範圍）；
`docs/tasks/archive/F2.md` 為歷史文件，⛔ 不動。

### 0.7 工作樹守界基線

```
$ git status --porcelain
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F4.md

$ git diff --cached --name-only
（無輸出，exit=0 ⇒ 暫存區乾淨）

$ git diff --stat app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
 app/layout.tsx               |   2 +-
 app/staff/page.tsx           |   6 +-
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
 3 files changed, 92 insertions(+), 89 deletions(-)
```

⇒ 三個既有未 commit 改動存在、暫存區乾淨。⚠️ `ServerSection.tsx` 改動量不小（173 行受影響），
對 `yarn build` 有可歸因性影響，見 §5 R-1。

### 0.8 環境（自行實跑）

```
$ node -v            → v22.19.0
$ yarn -v            → 1.22.18
$ docker --version   → Docker version 29.5.3, build d1c06ef
$ docker info        → 成功（daemon 在跑）
$ df -h / | tail -1  → /dev/disk3s1s1  460Gi 已用 16Gi  可用 122Gi
$ du -sh node_modules → 439M
$ ls -l node_modules/.yarn-integrity → 76659 bytes, Feb  7  2026
$ ls -d .next        → .next（已有前次建置產物）
```

⚠️ **`docker images` 實查：本機無 `node:20-alpine`**（有 `node:16-alpine` / `node:22-alpine`
/ `node:22` / `node:22-bookworm-slim`，⛔ 就是沒有 20）。
⇒ 驗收第 7 條的 `docker build` 會**冷拉基底 image + 容器內冷裝依賴**，見 §5 R-2 的耗時評估。

`.dockerignore` 實查（`cat .dockerignore`）：擋 `.next` / `.env` / `.git` / `.vscode` /
`**/node_modules/` / `*.log` / `Dockerfile` / `README.md` 等，
⛔ **未擋 `package.json` 或 `yarn.lock`** ⇒ deps 階段的精確 COPY 拿得到檔案，且 context 不吞機密。

---

## 1. 事前預演（⚠️ 已完成，⛔ 未觸碰本 repo 工作樹）

為避免紙上談兵，已先在 scratchpad 內 `git clone --branch developers` 一份複本，
把**檔案層**的整套改動與可在檔案層取證的驗收條**完整跑過一遍**。

**預演複本同源證明**：

```
$ git rev-parse HEAD   → 6d315cb440b43890b00b8d4d1a571a88fbc24503
$ md5 -q .gitignore Dockerfile yarn.lock package-lock.json
c00fe3e470d64c88983b06a29cb0ddb6
107a8a9e39a4216cf31a3ae3ac3adfd0
1c92ad40f6c718d3f79e6122bfd41aa4
eec63612e4c521729062d82ca2655e35
```
——四個 md5 與真 repo（§0.2 / §0.4 / §0.5）逐一相同。

**⛔ 預演刻意不做的事（誠實標示）**：
`yarn install --frozen-lockfile`、`yarn build`、`docker build` **一律未跑**
（成本高、且複本無 `node_modules` 屬冷裝情境，與真 repo 的熱裝情境不同，跑了也不能代表真值）。
⇒ 驗收第 5、6、7 條在本計畫中**全部標為「⛔ 未驗，動工後實跑」**，⛔ 不以預演值冒充。

**預演的四項關鍵產出**（→ 直接決定下方步驟與 §6 的任務包問題回報）：

1. §2 的兩處錨點編輯，產物與任務包逐字終態 **byte-identical**（`diff` 無輸出、exit=0）。
2. `git rm package-lock.json`（⛔ 無 `--cached`）行為正確：index 記 `D`、硬碟檔案消失。
3. ⛔ **驗收第 10 條照任務包的操作順序跑會失敗**——見 §6.1。
4. ⛔ **驗收第 4 條後半（`git check-ignore yarn.lock` 不命中）是「恆真」的空測**
   ——即使規則寫成災難性的 `*lock*` 它照樣過。這是本計畫**最重要的發現**，見 §6.2。

預演複本與工作檔位於（⛔ repo 之外）：
`/private/tmp/claude-501/-Users-quasi-pc-Desktop-Projects-Nameless-Realms-namelessrealms-web/5c08e08c-f6dd-4bb8-811e-bdf42a3d38a9/scratchpad/F4/`
本計畫以 `$SCRATCH` 代表該目錄。

---

## 2. 逐步驟操作序列

> ⚠️ 每步都寫明「跑什麼 / 改哪裡 / 預期結果」。
> ⛔ 全部步驟等 `F4-plan-review.md` 放行後才開始。
> ⚠️ **步驟順序已與任務包「操作順序建議」不同**（`git add` 提前到取證之前），理由見 §6.1。

### 步驟 0：備份 + before 基準

```
SCRATCH=/private/tmp/claude-501/-Users-quasi-pc-Desktop-Projects-Nameless-Realms-namelessrealms-web/5c08e08c-f6dd-4bb8-811e-bdf42a3d38a9/scratchpad/F4
mkdir -p "$SCRATCH/backup"
cp package-lock.json "$SCRATCH/backup/package-lock.json"
cp .gitignore        "$SCRATCH/backup/gitignore.before"
cp Dockerfile        "$SCRATCH/backup/Dockerfile.before"
md5 -q "$SCRATCH/backup/package-lock.json" package-lock.json
md5 -q .gitignore Dockerfile yarn.lock
git rev-parse HEAD
git status --porcelain
```

- **預期**：備份的 `package-lock.json` md5 = `eec63612e4c521729062d82ca2655e35`（**與原檔相同**
  ⇒ 221,139 bytes 的備份完整，回滾可用）；`.gitignore` = `c00fe3e4…`、
  `Dockerfile` = `107a8a9e…`、`yarn.lock` = `1c92ad40…`。
- ⚠️ **`package-lock.json` 這次是真刪**（⛔ 不是 `--cached`），⇒ **備份是唯一的本地回滾路徑**，
  ⛔ 這一步不可省。（次要保險：`git show HEAD:package-lock.json` 亦可取回，⛔ 但不用 `git checkout`。）
- **證據落點**：以上輸出直接貼進 `F4-verification.md`；⛔ 不開 `.evidence/`。

### 步驟 0.5：基準 `yarn build`（本計畫加的，⛔ 任務包未列）

```
yarn build 2>&1 | tail -40; echo "pipestatus=$pipestatus[1]"
```

- ⚠️ zsh 管線退出碼用 `$pipestatus[1]`（索引從 1 起），⛔ 不是 bash 的 `PIPESTATUS`。
- **為什麼加**：工作樹帶著 `ServerSection.tsx` 等 173 行未 commit 改動（§0.7），
  改後 build 若紅**可能與 F4 完全無關**。先取基準才有可歸因的對照組（沿用 F2 R-1 的做法）。
- ⚠️ **基準紅 ⇒ ⛔ 立即停手回報，⛔ 不進步驟 1、⛔ 不修 `.ts`/`.tsx`**（超出範圍）。
- ⛔ **未驗**：本計畫階段未跑（守界，見 §7）。

### 步驟 1：`git rm package-lock.json`

```
git rm package-lock.json
```

- ⛔ **不加 `--cached`**——本次連工作目錄一起刪。⚠️ 與 F2 對 `web.log` 的處理**相反**，
  ⛔ 不得沿用 F2 肌肉記憶。
- **預期輸出**（預演實測）：`rm 'package-lock.json'`；index 記 `D package-lock.json`（已暫存）；
  硬碟檔案消失（`ls package-lock.json` → `No such file or directory`，exit=1）。

### 步驟 2：改 `.gitignore` 至逐字終態（一處錨點編輯）

⚠️ ⛔ **不整份重寫**，用 Edit 工具做**精確錨點取代**；錨點不匹配即失敗（安全失敗）。

| 錨點（old，唯一匹配） | 取代為（new） | 效果 |
|---|---|---|
| `/.pnp⏎.pnp.js⏎⏎# testing` | `/.pnp⏎.pnp.js⏎package-lock.json⏎⏎# testing` | `package-lock.json` 加在 `# dependencies` 節末尾 |

（`⏎` 僅為標示換行，實際不含此符號。錨點連下一節註解 `# testing` 一起錨，
讓錨點語義自帶「插在 dependencies 節末、testing 節前」的意圖；預演已驗證此串在現況檔內唯一。）

- **預期結果（預演實測，⛔ 非推算）**：

```
$ wc -lc .gitignore
      39     410 .gitignore

$ md5 -q .gitignore
07afa17811b86638474abf2ffc90660a
```

  ⚠️ 392 → 410 = +18 bytes = `package-lock.json\n` 的長度（17+1），行數 38 → 39，
  與任務包「39 行 = 現況 38 行 + 1」相符。
- ⚠️ **規則採精確檔名 `package-lock.json`**，⛔ 嚴禁 `*lock*` / `*.lock` 等寬鬆樣式（見 §6.2）。

### 步驟 3：改 `Dockerfile` deps 階段至逐字終態（一處錨點編輯）

| 錨點（old，第 5–9 行，唯一匹配） | 取代為（new） |
|---|---|
| `COPY package.json yarn.lock* package-lock.json* ./⏎RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \⏎    elif [ -f package-lock.json ]; then npm ci; \⏎    else npm install; \⏎    fi⏎` | `COPY package.json yarn.lock ./⏎RUN yarn install --frozen-lockfile⏎` |

- ⛔ 第 1 行註解、第 10 行起（builder / runner，**含 `RUN npm run build`**）一字不動。
- **預期結果（預演實測）**：

```
$ wc -lc Dockerfile
      44    1223 Dockerfile
```

  47 → 44 行（5 行換 2 行 = −3）、1353 → 1223 bytes。

### 步驟 4：逐檔 `git add`（⚠️ 提前到取證之前，見 §6.1）

```
git add .gitignore Dockerfile
```

- ⛔ **禁用 `git add .`**（會把 §0.7 那三個無關改動一起帶走）。
- ⛔ 本次**只**能 `git add` 這兩個路徑（`package-lock.json` 的刪除已由步驟 1 的 `git rm` 暫存）。
- **預期**（預演實測）：`git diff --cached --name-status` 恰為
  `M .gitignore` / `M Dockerfile` / `D package-lock.json` 三行。

### 步驟 5：檔案層取證（§4 條 1–4、8–11 + 條 A–E）

跑 §4 表列指令，**輸出逐條直接貼進 `F4-verification.md`**（⛔ 不落 repo 內任何證據目錄）。

### 步驟 6：`yarn install --frozen-lockfile`（驗收第 5 條，核心證明）

```
yarn install --frozen-lockfile 2>&1 | tail -30; echo "pipestatus=$pipestatus[1]"
```

- **證明什麼**：`package-lock.json` 已從硬碟消失的前提下，`yarn.lock` **獨自足以還原依賴**。
- ⚠️ **對工作樹與後續 build 的影響評估**（⛔ 以下為推論，未實跑，實跑數據進 verification）：
  - 已知事實：`node_modules` 439M 已存在；`node_modules/.yarn-integrity` mtime 為 **2026-02-07**，
    而 `yarn.lock` mtime 為 **2026-02-12**（§0.2 / §0.8 實測）。
  - ⇒ 推論：integrity 檔可能**早於**現行 lock ⇒ yarn 1.22 有機會判定不一致而**重裝**，
    ⛔ 不一定是秒回的 `Already up-to-date`。
  - **耗時預估：數十秒（快取命中）至數分鐘（需重下載）**——⛔ **未驗，屬預估**，
    verification 一律以 `time` 實測值為準。
  - `node_modules/` 已被 `.gitignore` 第 4 行 `/node_modules` 擋住 ⇒ **重裝⛔ 不會污染 `git status`**
    （§4 條 D 的忽略集合快照 diff 即為此事的正面證據）。
  - `yarn install` ⛔ **不動 `.next/`** ⇒ 步驟 0.5 的基準 build 產物仍在；步驟 7 會再跑一次完整 build。
- ⚠️ **失敗時的處置**：`--frozen-lockfile` 失敗代表 `yarn.lock` 與 `package.json` 本來就不同步
  ——那是**既有缺口，⛔ 不是 F4 造成**（本任務一個位元組都沒動 `yarn.lock` / `package.json`）。
  ⇒ ⛔ **停手回報架構師，⛔ 不得改 `yarn.lock`、⛔ 不得跑 `yarn install` 去「修好」它**
  （那會改寫 lock 檔，直接違反任務包守界）。⛔ 更不得跑 `npm install`。

### 步驟 7：`yarn build`（驗收第 6 條，硬約束必跑）

```
yarn build 2>&1 | tail -40; echo "pipestatus=$pipestatus[1]"
```

- ✅ 架構師 2026-08-31 裁「甲」＝ build 必跑、lint 豁免，⛔ 實作側不得自行翻案。
- **預期**：成功，且與步驟 0.5 基準結果一致。
- **證據**：完整結尾摘要 + `pipestatus` **直接貼進 `F4-verification.md`**，
  ⛔ 不得以「成功」二字代替實際輸出。
- **失敗處置**：見 §5 R-1 的三種歸因分支。

### 步驟 8：`docker build`（驗收第 7 條）

```
docker info > /dev/null && echo "daemon OK"
time docker build -t namelessrealms-official-web:f4-local-verify . 2>&1 | tail -40
echo "pipestatus=$pipestatus[1]"
docker images namelessrealms-official-web:f4-local-verify
```

- ⚠️ tag 用**非發版**名稱 `f4-local-verify`；⛔ 不得 `docker push`、⛔ 不得打任何 `v*.*.*` git tag。
- **證明什麼**：改後的 deps 階段（精確 COPY + 無條件 yarn）在**沒有 `package-lock.json`** 的
  build context 下仍能完整走完三個階段（含 builder 的 `npm run build`）。
- ⚠️ ⛔ **未驗，屬預估**：本機無 `node:20-alpine`（§0.8 實查）⇒ 需冷拉基底 image
  （node:22-alpine 本機佔 161MB，20-alpine 量級相近）+ 容器內冷裝依賴 + 完整 next build。
  **預估數分鐘、需網路**；磁碟可用 122Gi ⇒ 空間⛔ 不是瓶頸。實測時間進 verification。

### 步驟 9：清理本機 image（⚠️ 任務包只寫「非必要」，本計畫定為必做）

```
docker rmi namelessrealms-official-web:f4-local-verify
docker images | grep -c 'namelessrealms-official-web' || true
```

- **預期**：`grep -c` 為 **0**（本專案的驗證 image 已清乾淨）。
- ⛔ **不跑 `docker system prune` / `docker builder prune` / `docker image prune`**
  ——⚠️ 本機還有 `meridian/*`、`deploy-aegis-*`、`grafana`、`mysql` 等**其他專案**的 image 與快取
  （§0.8 `docker images` 實查），全域清理會誤傷它們。**只砍指名的那個 tag。**
- ⛔ **不刪基底 `node:20-alpine`**：它是可共用的基底層，留著無害且省下次拉取；
  ⚠️ 若架構師要求連基底一起清，請在 review 指示（本計畫預設保留）。

### 步驟 10：產 `F4-verification.md` 後停手回報

- ⛔ **不 commit、不 push**。commit 訊息草稿寫進 verification 供架構師過目。
- ⛔ commit 訊息不得含 `Co-Authored-By: Claude` 或任何讓 Claude 進作者 / 共同作者欄的寫法。
- ⛔ 不打任何 `v` 開頭的 tag。⚠️ `push-gate` hook 無條件擋 push，⛔ 不嘗試繞過。
- ⚠️ commit 切法建議見 §6.3（待架構師裁決）。

---

## 3. 守界自檢（三個既有未 commit 改動不被帶走）

| 機制 | 具體做法 |
|---|---|
| **⛔ 禁 `git add .`** | 全程只出現一次 `git add`，且明寫兩個路徑 `.gitignore Dockerfile`（步驟 4）。另有一次 `git rm package-lock.json`（步驟 1，指名單一路徑）。 |
| **暫存區白名單驗證** | 步驟 5 跑 `git diff --cached --name-status`，**必須**恰為 `M .gitignore` / `M Dockerfile` / `D package-lock.json` 三行。多一行即停手。 |
| **工作樹狀態驗證** | `git status --porcelain` 必須仍見三檔為 ` M`（**前一欄空白**＝未暫存）。 |
| **內容不變驗證** | 額外跑 `git diff --stat app/layout.tsx app/staff/page.tsx components/ServerSection.tsx`，比對是否仍為 `92 insertions(+), 89 deletions(-)`（§0.7 實測基線）。⚠️ 這條任務包沒有：porcelain 的 ` M` 只證明「有改動」，⛔ 不證明「改動未被動過」。 |
| **⛔ 不用 `git checkout`** | 任何還原一律用步驟 0 的備份檔（§5）。 |
| **⛔ 不用 `git stash`** | stash 會把三個既有改動一起收走，⛔ 全程不用。 |

---

## 4. 驗收如何取證（對照任務包 12 條，逐條指令）

> **全部輸出直接貼進 `docs/tasks/F4-verification.md`**（架構師裁定，⛔ 不開 `.evidence/`）。
> ⚠️ 「預期」欄凡標【預演】者為 §1 檔案層預演的**實測值**；標【⛔ 未驗】者本計畫階段未跑，
> ⛔ 不得以本表冒充已執行——真值一律以 verification 的實跑輸出為準。
> ⚠️ 空輸出無法自證「跑過」⇒ 一律附 `; echo "exit=$?"`，把該行實際輸出貼進 verification。

| # | 指令 | 預期 |
|---|---|---|
| 1 | `git ls-files package-lock.json; echo "exit=$?"` | 【預演】**無輸出**，⚠️ **exit=0**（不是 1）⇒ 判準是「輸出為空」，⛔ 不是「非零退出」 |
| 2 | `ls package-lock.json; echo "exit=$?"` | 【預演】`ls: package-lock.json: No such file or directory`、`exit=1` ⇒ 硬碟檔案已刪 |
| 3 | `git check-ignore -v package-lock.json; echo "exit=$?"` | 【預演】`.gitignore:7:package-lock.json	package-lock.json`、`exit=0`。⚠️ **必須在步驟 1 的 `git rm` 之後才跑**——刪除前它仍在 index，check-ignore 會回 exit=1（見 §6.4） |
| 4a | `git ls-files yarn.lock; echo "exit=$?"` | 【預演】`yarn.lock`、`exit=0` ⇒ 仍入版控 |
| 4b | ⚠️ **改用** `git check-ignore --no-index -v yarn.lock; echo "exit=$?"` | 【預演】**無輸出、exit=1** ⇒ 樣式層面未誤擋。⛔ **任務包原寫的無 `--no-index` 版本是空測**，見 §6.2 |
| 4c | 負向對照（見 §6.2 的做法） | 【預演】把規則暫改為 `*lock*` 時，`--no-index` **會**命中 `yarn.lock` ⇒ 證明條 4b 這個測試**測得出失敗** |
| 5 | `yarn install --frozen-lockfile` | 【⛔ 未驗】成功；⚠️ 耗時實測進 verification |
| 6 | `yarn build` | 【⛔ 未驗】exit 0（架構師裁「甲」＝必跑） |
| 7 | `docker build -t namelessrealms-official-web:f4-local-verify .` | 【⛔ 未驗】三階段全過、`Successfully tagged`；⚠️ 耗時實測進 verification |
| 8a | `grep -n 'package-lock' Dockerfile; echo "exit=$?"` | 【預演】無輸出、`exit=1` |
| 8b | `grep -n 'npm ci' Dockerfile; echo "exit=$?"` | 【預演】無輸出、`exit=1` |
| 8c | `grep -c 'yarn install --frozen-lockfile' Dockerfile` + `grep -n …` | 【預演】計數 **1**；`6:RUN yarn install --frozen-lockfile`（deps 階段） |
| 9 | `git status --porcelain` | 【預演】三檔仍 ` M` 未暫存；另見 `M .gitignore` / `M Dockerfile` / `D  package-lock.json`（前兩者於步驟 4 後轉為已暫存） |
| 10 | `git diff --cached --name-only` 與 `git diff --cached --name-status` **兩條都跑** | 【預演】`--name-only` 恰為 `.gitignore` / `Dockerfile` / `package-lock.json` 三路徑；`--name-status` 恰為 `M` / `M` / `D`。⚠️ **必須在步驟 4 `git add` 之後跑**，見 §6.1 |
| 11 | `grep -c 'npm run build' Dockerfile` + `grep -n 'npm run build' Dockerfile` | 【預演】計數 **1**；⚠️ **行號會從 20 變成 17**（前面少了 3 行），⛔ 這是預期的位移，**不是**該行被動過——見 §6.5 |
| 12 | 還原一律用備份檔 | 見 §5，⛔ 不用 `git checkout` |

**額外五條（本計畫加的，⛔ 不在任務包 12 條內）：**

| # | 指令 | 預期 | 為什麼加 |
|---|---|---|---|
| **A** | `awk '/^```gitignore$/{f=1;next} f&&/^```$/{exit} f{print}' docs/tasks/F4.md > "$SCRATCH/target.gitignore"`<br>`diff "$SCRATCH/target.gitignore" .gitignore; echo "exit=$?"` | 【預演】無輸出、`exit=0` | 逐字終態的**機械**比對，⛔ 不靠肉眼。用 awk 從任務包機械抽取而非手打，避免轉寫誤差（`CLAUDE.md` 撰碼紀律） |
| **B** | 以任務包**第 2 個** ```dockerfile 區塊 + 原 Dockerfile 第 10 行起 組出期望全檔，再 `diff` | 【預演】無輸出、`exit=0`；期望全檔 **44 行 / 1223 bytes** | 任務包只給 deps 段逐字終態，⛔ 沒給全檔。此條同時證明「deps 段正確」**且**「第 10 行起一字未動」——比條 11 的單點 grep 強 |
| **C** | `md5 -q .gitignore` / `md5 -q Dockerfile` / `wc -lc` 兩檔 | 【預演】`.gitignore` = `07afa17811b86638474abf2ffc90660a`、39 行 / 410 bytes；`Dockerfile` 44 行 / 1223 bytes | 可原地複驗的指紋 |
| **D** | `git status --porcelain --ignored` 取 before / after 快照後 `diff` | 【⛔ 未驗，動工時取】**只看 `!!` 行：before / after 應零差異**。⚠️ `package-lock.json` **不會**出現在 `!!` 區是**預期正確結果**，⛔ 不是「新規則沒生效」——`git status --ignored` 只列**存在於工作樹**的檔案，而本次是**連硬碟真刪**（⚠️ 與 F2 的 `web.log` 保留檔案不同）。<br>`??` 行僅多出 F4 流程文件（`F4-plan.md` / `F4-plan-review.md` / `F4-verification.md`），⛔ 不列入判準；暫存 / 修改狀態行（`M  .gitignore` / `M  Dockerfile` / `D  package-lock.json`）的變化亦⛔ 不列入本條判準，由驗收第 9、10 條專責取證 | 忽略集合**零退步**的完整證明。⚠️ 「`package-lock.json` 被新規則忽略」的正面證據由**驗收第 3 條**（`check-ignore -v` 命中）承擔，⛔ 不由本條承擔（依 `F4-plan-review.md` ⛔ 必改 1 修正） |
| **E** | `md5 -q yarn.lock` + `git diff --stat yarn.lock` + `git diff --cached --stat yarn.lock` | 【預演】md5 仍為 `1c92ad40f6c718d3f79e6122bfd41aa4`；兩條 `diff --stat` 皆無輸出 | ⚠️ 任務包硬約束「⛔ 不動 `yarn.lock` 一個位元組」**沒有對應的驗收條**。此條補上正面證據，且能抓到「`yarn install` 意外改寫 lock」這個真實風險（步驟 6 之後**再測一次**） |

---

## 5. 風險與回滾

| 代號 | 風險 | 等級 | 緩解 / 回滾 |
|---|---|---|---|
| **R-1** | ⚠️ **`yarn build` 在髒工作樹上跑**：`ServerSection.tsx` 有 173 行受影響的未 commit 改動（§0.7），build 若失敗**可能與 F4 完全無關**；而本次⛔ 不得改 `.ts`/`.tsx`、⛔ 不得還原那三檔。 | **高** | 步驟 0.5 先取基準 build 對照組。<br>• 基準綠、改後綠 ⇒ 正常收案。<br>• 基準**紅** ⇒ ⛔ 停手回報（既有缺口，非 F4 造成，⛔ 不現場擴大修）。<br>• 基準綠、改後紅 ⇒ ⛔ 停手回報，用備份檔還原三檔後複驗。 |
| **R-2** | **`docker build` 冷跑失敗或超時**：本機無 `node:20-alpine`（§0.8），需拉基底 + 容器內冷裝 + 完整 next build，**需網路**。 | 中 | 步驟 8 前先 `docker info`；失敗先看是**網路 / 拉取**失敗還是 **Dockerfile 改壞**——前者重試、後者用 `$SCRATCH/backup/Dockerfile.before` 還原後複驗。磁碟 122Gi 可用 ⇒ ⛔ 不是瓶頸。 |
| **R-3** | ⚠️ **`git rm` 誤寫成 `--cached`**，留一份過期 lock 在硬碟（與任務包意圖相反）。 | 中 | 指令逐字寫死在步驟 1；驗收第 2 條取證檔案不存在。誤做時：`git rm --cached` 後補 `rm package-lock.json`。 |
| **R-4** | ⚠️ **`package-lock.json` 被真刪，回滾無工作樹副本可用**（與 F2 的 `web.log` 保留檔案不同）。 | 中 | **步驟 0 先備份 221,139 bytes 到 `$SCRATCH/backup/`**，並以 md5 對帳備份完整（`eec63612…`）。<br>回滾：`cp "$SCRATCH/backup/package-lock.json" package-lock.json && git add package-lock.json`（⚠️ 該路徑已被新規則忽略，`git add` 對**已在 index 的還原**仍有效；必要時 `git add -f`）。<br>次要保險：`git show HEAD:package-lock.json > package-lock.json`。<br>⛔ **不用 `git checkout`**（會清掉三個既有未 commit 改動）。 |
| **R-5** | `.gitignore` 規則寫太寬誤擋 `yarn.lock`。 | 中（任務包標「高」，⚠️ 見下方修正） | 錨點編輯 + 條 A 機械 diff + 條 4b 的 `--no-index` 正面證據 + 條 4c 負向對照 + 條 D 忽略集合 diff，**五重把關**。 |
| **R-6** | Dockerfile 改壞（COPY 少檔 / RUN 語法錯）。 | 中 | 條 B 全檔機械 diff（⛔ 不只 deps 段）+ 驗收第 7 條實跑 `docker build` 直接證明；`Dockerfile.before` 可回滾。 |
| **R-7** | commit 誤帶三個既有改動。 | 中 | §3 五道自檢；驗收第 9、10 條取證。 |
| **R-8** | 誤動 builder 的 `RUN npm run build`（發版路徑）。 | 中（觸架構師明確禁令） | 條 B 的全檔 diff 是最強證據（第 10 行起 byte-identical）；驗收第 11 條 grep 為輔。⚠️ 注意行號位移，見 §6.5。 |
| **R-9** | 誤打 `v*.*.*` tag / 誤 push image。 | 低（後果高） | 步驟 8 tag 寫死 `f4-local-verify`；⛔ 全程無 `docker push`、⛔ 無 `git tag`；`push-gate` 兜底。 |

> ⚠️ **R-5 等級的實測修正（⛔ 不翻案，只是把話講準）**：任務包風險表把此項標「高」，
> 並寫「直接破壞建置可重現性」。實測後應更精確地說：`yarn.lock` **目前是已追蹤檔**（§0.2），
> 而 **git 的 ignore 規則不影響已追蹤檔** ⇒ 就算誤寫 `*lock*`，`yarn.lock` **不會**當場消失、
> 現有建置**不會**當場壞掉。真正的傷害是**潛伏的**：日後 `yarn.lock` 一旦被移出版控或在新流程中重建，
> 就再也 `git add` 不回去。⇒ **防護價值不變、做法不變**，僅把「立即」改為「潛伏」。

---

## 6. ⚠️ 我認為任務包有問題的地方（plan-review 前最後一次修正機會）

### 6.1 ⛔ 驗收第 10 條照任務包的「操作順序建議」跑會**失敗**（預演實測，非推理）

任務包操作順序：①備份 ②`git rm` ③改 `.gitignore` ④改 `Dockerfile`
**⑤跑驗收步驟全部指令、取證** ⑥逐檔 `git add .gitignore Dockerfile` ⑦回報。

但驗收第 10 條要求 `git diff --cached --name-only` → 三個路徑
（`package-lock.json` 的 D、`.gitignore`、`Dockerfile`）。

⚠️ `git diff --cached` 比的是 **index vs HEAD**。在第 ⑤ 步時只有 `git rm` 暫存過刪除，
`.gitignore` / `Dockerfile` 還只在工作樹。預演實測輸出：

```
$ git diff --cached --name-status      # git add 之前
D	package-lock.json

$ git status --porcelain
 M .gitignore
 M Dockerfile
D  package-lock.json
```

⇒ 只有一行，**第 10 條當場不成立**。`git add` 之後才是：

```
$ git diff --cached --name-only
.gitignore
Dockerfile
package-lock.json

$ git diff --cached --name-status
M	.gitignore
M	Dockerfile
D	package-lock.json
```

**我的處置（已寫進 §2）**：把 `git add`（任務包第 ⑥ 步）**提前為步驟 4**，排在取證之前。
⚠️ 這**只是順序調整**，⛔ 不增減任何一件事、⛔ 不改題。
⚠️ 這與 F2 的問題**同型但不同因**：F2 是任務包**整個漏寫** `git add`；
F4 有寫，只是排在需要它的驗收條**之後**。

### 6.2 ⛔ 驗收第 4 條後半是「恆真的空測」——⚠️ 這是最重要的發現

任務包驗收第 4 條寫：`git check-ignore yarn.lock` → **不命中**（退出碼 1、無輸出）。

⚠️ 問題：**`git check-ignore` 預設會查 index，而已追蹤的路徑一律回「不忽略」**
（這正是 `--no-index` 選項存在的理由）。`yarn.lock` 是已追蹤檔（§0.2）
⇒ **不論 `.gitignore` 寫什麼**，這條都會回 exit=1。⇒ 它證明不了任何事。

**預演實測（在 clone 複本內，⛔ 未觸碰真 repo）**：

```
########## A. 正確規則 package-lock.json ##########
check-ignore            yarn.lock : exit=1        ← 通過
check-ignore --no-index yarn.lock : exit=1        ← 通過

########## B. 錯誤規則 *lock*（負向對照） ##########
7:*lock*
check-ignore            yarn.lock : exit=1        ← ⛔ 照樣通過！
check-ignore --no-index yarn.lock : .gitignore:7:*lock*	yarn.lock
                                    exit=0        ← ✅ 正確地抓到了
git status --porcelain --ignored | grep yarn.lock : exit=1   ← ⛔ 也抓不到
```

⇒ ⛔ **任務包原寫的第 4 條後半，在災難性的 `*lock*` 規則下照樣「通過」。**
順帶一提，`git status --porcelain --ignored`（我原想拿來當備援證據）**同樣抓不到**，
理由相同：已追蹤檔永遠不會出現在 ignored 清單裡。

**我的處置（已寫進 §4 條 4b / 4c）**：

- **條 4b**：改用 `git check-ignore --no-index -v yarn.lock; echo "exit=$?"`
  → 預期無輸出、exit=1。這才是「樣式本身不會誤擋 `yarn.lock`」的**真**正面證據。
- **條 4c 負向對照**：在 **`$SCRATCH` 的複本**上把規則暫改為 `*lock*`，
  展示 `--no-index` 會命中 ⇒ 證明條 4b **測得出失敗**（否則它跟空測沒兩樣）。
  ⚠️ ⛔ **負向對照只在 scratchpad 複本做，⛔ 不在真 repo 上改 `.gitignore` 再改回來**
  （真 repo 上做等於製造一次無謂的改動窗口）。
- 條 4a（`git ls-files yarn.lock` 有輸出）保留——它證明的是「仍入版控」，本來就有效。

⚠️ **這是對驗收條文的修正，⛔ 不是加強而已**——原條文無效。**請 review 明確裁示**是否採納。

### 6.3 ⚠️ commit 切法：F4 流程文件要不要進同一個 commit（請裁決）

任務包驗收第 10 條寫「（加上 `docs/tasks/` 的 F4 流程文件**若一併入 commit**）」——**未定案**。

**F2 的實際做法（我查了 git log，⛔ 非推測）**：

```
86b37c6 chore(gitignore): web.log 移出版控並去除重複樣板段
        .gitignore | 11 +++--------
        web.log    | 17 -----------------
9ffe9a7 docs(tasks): 補 F2 交接五件套（任務包 / plan / 放行 / 驗收 / 稽核）
        docs/tasks/F2-*.md（5 檔）
```

⇒ F2 的**實作 commit 只含實作檔**，五件套走**另一個 `docs:` commit**。

**我的建議：沿用 F2 切法**——
① `chore(deps): 移除 package-lock.json 並收斂 Dockerfile deps 階段`
（`package-lock.json` D / `.gitignore` M / `Dockerfile` M，恰三檔）；
② 五件套齊備後另一個 `docs(tasks):` commit。
**理由**：實作 commit 保持可逐檔對帳、與驗收第 10 條「無其他檔案」對得最乾淨；
且與 F2 前例一致，日後翻歷史不用解釋兩種切法。
⚠️ **⛔ 兩個 commit 都待架構師確認才執行**，本計畫⛔ 不自行 commit。

### 6.4 ⚠️ 驗收第 3 條有時序前提（不阻斷，補記）

`git check-ignore -v package-lock.json` 若在 `git rm` **之前**跑，會回 exit=1（同 §6.2 的 index 語義）。
⇒ 必須排在步驟 1 之後。已在 §4 條 3 註明。

### 6.5 ⚠️ 驗收第 11 條的行號會位移（不阻斷，避免稽核側誤判）

任務包多處寫「builder 階段**第 20 行** `RUN npm run build`」。改動後 deps 段少 3 行
⇒ 該行變成**第 17 行**（預演實測 `17:RUN npm run build`）。
⚠️ **這是預期的位移，⛔ 不是該行被動過。** 第 11 條的判準是「計數恰為 1」，該判準仍成立。
⇒ 真正該用來證明「第 10 行起一字未動」的是**條 B 的全檔機械 diff**，⛔ 不是行號。
**⚠️ 請稽核側注意：⛔ 不得把 20→17 誤判為違反守界。**

### 6.6 ⚠️ 任務包硬約束「⛔ 不動 `yarn.lock` 一個位元組」沒有對應驗收條（不阻斷，已補）

12 條驗收裡沒有任何一條驗 `yarn.lock` 內容不變。而步驟 6 的 `yarn install` 是**唯一可能改寫它**
的動作（`--frozen-lockfile` 設計上不會改，但那是設計、⛔ 不是證據）。
⇒ 已加條 E（md5 + `git diff --stat`），並要求在步驟 6 **之後**再測一次。**建議 review 一併認可。**

### 6.7 ⚠️ 任務包對 `docker rmi` 只寫「非必要條件」（不阻斷，已定為必做）

任務包第 7 條括號寫「驗畢可 `docker rmi …` 清掉，非必要條件」。
⇒ 我把它定為**必做步驟 9**，並補上「⛔ 不得跑全域 prune」的護欄
（本機有 `meridian/*`、`deploy-aegis-*`、`grafana`、`mysql` 等其他專案的 image，§0.8 實查）。
**建議 review 認可此加強。**

### 6.8 ✅ 任務包中經我複驗**無誤**的部分（留痕）

- 基準 commit `6d315cb`、分支 `developers` ✅（§0.1）
- `yarn.lock` 147,236 B / 3,193 行、`package-lock.json` 221,139 B / 6,313 行、
  mtime 2026-02-12、兩者均入版控 ✅（§0.2）
- 4 套件解析一致（next 14.1.0 / react 18.3.1 / next-auth 4.24.13 / lucide-react 0.330.0）✅（§0.3）
- `package.json` 為 `namelessrealms-web@2.0.0`；`package-lock.json` root 為 `portal-web@0.1.0`
  ⇒ 舊專案名殘留 ✅（實測 `grep -n '"name"' package.json` + `python3 -c` 讀 lock）
- `.gitignore` 38 行 / F2 收案後乾淨版、無 `package-lock` 規則、無誤傷 `yarn.lock` 的樣式 ✅（§0.4）
- Dockerfile deps 第 1–9 行逐字相符；第 20 行 `RUN npm run build`；
  `EXPOSE 56130` / `ENV PORT=56130` / `CMD ["node", "server.js"]` ✅（§0.5）
- `.dockerignore` 擋 `.env` / `.git` / `**/node_modules/` / `.next`，⛔ 未擋 `yarn.lock` / `package.json` ✅（§0.8）
- docker daemon 在跑 ✅（§0.8）。⚠️ 版本實測為 **29.5.3**——任務包背景區寫 29.5.3，相符。
- ⚠️ **`npm ci` / `npm install` 兩分支永遠走不到**的判定 ✅：`yarn.lock` 確實存在且入版控，
  `if [ -f yarn.lock ]` 恆真。
- **無 `test` script、repo 無自動化測試** ✅（`grep '"scripts"' -A6 package.json` 實查：
  只有 dev / build / start / lint）⇒ 回歸基線只有 build + docker build。

---

## 7. 守界聲明（本計畫階段）

- 本階段**只寫了 `docs/tasks/F4-plan.md` 一個檔**。
- ⛔ 未刪 `package-lock.json`、⛔ 未改 `.gitignore`、⛔ 未改 `Dockerfile`、
  ⛔ 未跑 `yarn install`、⛔ 未跑 `yarn build`、⛔ 未跑 `docker build`、
  ⛔ 未 `git add` / `git rm`、⛔ 未 commit、⛔ 未 push、⛔ 未打 tag、⛔ 未 `docker push`。
- ⛔ 未跑 `npm install`（一次都沒有）。
- ⛔ 未觸碰任何 `.ts` / `.tsx` / `data/` / `.github/workflows/` / `CLAUDE.md` / `yarn.lock`。
- ⛔ 未存取知識庫（vault）任何路徑。
- **本 repo 工作樹複驗（預演後）**：`git status --porcelain` 仍為三檔 ` M` + `?? docs/tasks/F4.md`；
  四個 md5 與 §0.2 / §0.4 / §0.5 完全一致；`git diff --cached` 空 ⇒ **零影響**。
- 唯一的「執行」是 §0 的唯讀查詢與 §1 在 `$SCRATCH` 內 clone 複本上的檔案層預演。
- ⛔ 不做 F1 / F5 / F6。

---

## 8. 待架構師裁決 / 待 review 明示的事項

> ⚠️ 白話版在前，技術理由在後。

1. **【最重要】驗收第 4 條後半的測試本身無效，要不要照我的改法換掉？**
   白話：任務包那條「檢查 `yarn.lock` 沒被誤擋」的指令，**不管規則寫得多離譜都會說通過**——
   我實地把規則改成最壞的寫法試過，它照樣說沒事。我提議換成一個真的測得出來的指令
   （加 `--no-index`），再附一次「故意寫錯給你看它會抓到」的對照。
   技術：見 §6.2；⛔ 這是**修正無效條文**，不是單純加強，故請 review 明確裁示。
2. **操作順序：`git add` 提前到取證之前。**
   白話：任務包叫我先取證再 `git add`，但其中一條證據**必須** `git add` 之後才拿得到。
   我把兩步對調，內容一件不多一件不少。技術：見 §6.1。
3. **commit 要切一個還是兩個？**
   白話：實作的三個檔一個 commit，F4 的五份流程文件另一個 commit（F2 就是這樣做的）——
   還是全部塞同一個？我建議照 F2 切兩個。技術：見 §6.3。
4. **四條加強條（A / B / D / E）與兩項加強做法（步驟 0.5 基準 build、步驟 9 必清 image）
   請一併認可或退回。** 白話：這些都是「多驗一點」，不改任何要做的事。
   技術：條 A 逐字機械比對、條 B 全檔 diff（比 grep 更能證明沒動到發版那行）、
   條 D 忽略集合零退步、條 E 證明 `yarn.lock` 一個位元組沒動；
   步驟 0.5 給 build 失敗一個可歸因的對照組；步驟 9 清掉驗證 image 不留垃圾。
5. **`docker rmi` 之後要不要連 `node:20-alpine` 基底一起刪？**
   白話：跑 docker build 會順便下載一個約 160MB 的基底映像檔。我預設**留著**（下次省下載、
   而且它可能被別的專案共用）。要清就在 review 說一聲。技術：見步驟 9。

⛔ 以上任一項未獲 review 明示前，實作側一律**以任務包原文為準**照跑，
並在 verification 據實記錄「原條文無效 / 順序衝突」的實測輸出，⛔ 不自行改題。
