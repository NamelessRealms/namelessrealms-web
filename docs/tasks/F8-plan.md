# F8 實作計畫：補回 ESLint 設定檔，讓 `yarn lint` 從空測變成真閘門

> 實作側（nr-implementer）產出。依 `docs/tasks/F8.md`（任務包）與 `docs/tasks/F8-background.md`（背景）。
> ⚠️ **狀態**：已依規劃側審核檔的 ⛔ 阻斷點 1–3 修訂（2026-09-09）——§2 裁決①④、§3 步驟 0/3/5、§4 P1a/P1b・N2・P2・P3'、§5 全數改寫。
> ⛔ 仍**未動工**：修訂結果須先回報主迴圈過目，之後才依 §3 執行。
> ⚠️ 本輪只做**勘查**；勘查期間暫放的兩處改動**已全部移除**（見 §1.7 還原對帳）。

## 追溯資訊
- **日期**：2026-09-07
- **分支**：`developers`（⛔ 不是 `main`）
- **repo**：僅 namelessrealms-web
- **型別**：債（backlog F8）
- **前置**：F1 已收案。無其他前置。

---

## 一、勘查結果（本輪實跑，⛔ 非推理）

> ⚠️ 以下每一段都是**實際執行輸出**，指令與 `exit` code 逐字附上。
> ⚠️ 本 repo ⛔ 無 `.evidence/` 慣例（`ls -d .evidence` → `No such file or directory`），
> ⇒ 依核心紀律「證據必須耐久」，原文**直接落在本檔**（repo 檔），⛔ 不引用會消失的終端輸出。

### 1.1 勘查前工作樹基準

```
$ git status --short
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F8-background.md
?? docs/tasks/F8.md
exit=0
```

⇒ 三個舊改動檔（`CLAUDE.md` 地雷第 6 條）確實在；本檔的還原對帳以此為準。

### 1.2 N0 起始基準——證明現在真的是空測（補設定**前**）

```
$ yarn lint < /dev/null; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint
? How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint
[?25l❯  Strict (recommended)
   Base
   Cancel ⚠ If you set up ESLint yourself, we recommend adding the Next.js ESLint plugin. See https://nextjs.org/docs/basic-features/eslint#migrating-existing-config
Done in 0.66s.
exit=0
```

⇒ **空測已實測坐實**：輸出跳出互動式問卷、**⛔ 沒有任何檔名、⛔ 沒有任何規則名**、`exit=0`。
⚠️ 這就是 `CLAUDE.md`「CI 現況」節那段警告的實證（此前只是 F1 的舊結論，本輪重跑確認仍然成立）。

### 1.3 待 lint 檔案數（自行量測，⛔ 非轉抄任務包）

```
$ for d in app components data lib; do find $d -type f \( -name '*.ts' -o -name '*.tsx' \) | wc -l; done
app/ = 12
components/ = 12
data/ = 3
lib/ = 0
總計(app+components+data+lib) = 27
$ ls -d pages src/pages
ls: pages: No such file or directory
ls: src/pages: No such file or directory
```

⇒ 27 個 `.ts`/`.tsx`，與任務包一致（我自己量過）。`lib/` 仍為空目錄。
⇒ **無 `pages/` 也無 `src/pages/`** ⇒ 坐實裁決② 附註：⛔ 不得用 `yarn lint --strict` 產生設定檔
（`runLintCheck.js` 第 288 行只在 `pages/` 存在時才寫檔）。**本次全程手寫**，⛔ 未使用 `--strict`。

### 1.4 暫放設定檔後的違規實數

暫放內容（依裁決② 甲，手寫）：

```json
{
  "root": true,
  "extends": "next/core-web-vitals"
}
```

以及（依裁決③ 乙）`next.config.js` 加 `eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },`。

```
$ yarn lint; echo "exit=$?"
lint_exit=0
$ yarn lint --max-warnings 0; echo "exit=$?"
lint_maxwarn0_exit=1
```

機器計數（對同一份輸出檔統計，⛔ 非目視）：

```
warning行數=10
error行數=0
檔案數=7
規則統計:
  10 @next/next/no-img-element
```

**逐檔分佈（10 條，全部同一條規則 `@next/next/no-img-element`，全部 warn 級）**：

| 檔案 | 條數 | 行:欄 |
|---|---|---|
| `app/sponsor/page.tsx` | 2 | 38:13、162:21 |
| `app/team/page.tsx` | 2 | 28:13、42:17 |
| `components/FeatureRow.tsx` | 1 | 33:21 |
| `components/FeatureSection.tsx` | 1 | 46:15 |
| `components/HomeHero.tsx` | 1 | 24:11 |
| `components/Navbar.tsx` | 2 | 29:11、79:15 |
| `components/ServerSection.tsx` | 1 | 90:33 |

⇒ **error 0 條 / warning 10 條 / 落在 7 個檔 / 只有 1 條規則。**
⚠️ 這個結果比任務包「預期會噴出大量既有錯誤」**小很多**，且**沒有任何 error 級**——
這直接改寫裁決點① 與 ④ 的風險前提（見 §2）。

⚠️ 同時實測到兩件與嚴格指令有關的事：
- `yarn lint`（不帶旗標）在有 10 條 warning 之下 **`exit=0`**；
- `yarn lint --max-warnings 0` **`exit=1`**。
⇒ **`CLAUDE.md`「`--max-warnings 0` 不可省」自此從推理變成實測**（等價於驗收 N2 的後半，
⚠️ 但**素材是既有 warning、⛔ 不是任務包指定的 canary**，正式驗收仍須依 N2 用 canary 重跑一次）。

### 1.5 `dirs` 到底吃不吃 `middleware.ts`（實測，正控 + 對照組）

⚠️⚠️ **先回報一個坑：任務包驗收步驟 P3 的做法是空測，⛔ 不能用。**
任務包 P3 假設「JSON formatter 連 0 問題的檔也列」⇒ 用 `--format json` 的 `filePath` 清單證明覆蓋數。
**實跑推翻**：

```
$ yarn next lint -f json -o <暫存檔> --no-cache
exit=0
覆蓋清單（含 dirs）：
app/sponsor/page.tsx
app/team/page.tsx
components/FeatureRow.tsx
components/FeatureSection.tsx
components/HomeHero.tsx
components/Navbar.tsx
components/ServerSection.tsx
count=7
```

只列出 **7 個有問題的檔**，⛔ 不是 24 也不是 28。成因已核到原始碼：

```
node_modules/next/dist/lib/eslint/customFormatter.js 第 80 行
  let resultsWithMessages = results.filter(({ messages })=> messages?.length);
```
（`runLintCheck.js` 第 202 行把 `results` 先交給 `formatResults`，**過濾發生在 formatter 之前**
⇒ 不論 `-f json` 還是預設 formatter，**0 問題的檔一律不出現**。）

⇒ **這是本 repo 第四個同型坑**（「指令有跑、檢查沒跑」）：
拿 `-f json` 的檔案清單當覆蓋證明，會把「這個檔很乾淨」與「這個檔根本沒被 lint」混為一談。
⇒ **P3 必須改寫成正控 canary**（見 §4 的 P3'）。

**改用正控 canary 實測**（規則 `@next/next/no-assign-module-variable`，`recommended` 之下為 **error** 級，
在純 `.ts` 也會觸發 ⇒ 適合探測非 JSX 位置）：

- 新建 `data/lintProbe.ts`（內容 `export const lintProbe = 1;` + `let module = {};`）；
- `middleware.ts` **先 `cp` 備份**再於檔尾附加 `let module = {};`（⛔ 未用 `git checkout` 還原）。

**Run A（`dirs` 含 `'middleware.ts'`）**：
```
./data/lintProbe.ts
2:1  Error: Do not assign to the variable `module`. ...  @next/next/no-assign-module-variable
./middleware.ts
22:1  Error: Do not assign to the variable `module`. ...  @next/next/no-assign-module-variable
```

**Run B（對照組：`dirs` 改成 `['app', 'components', 'data', 'lib']`，canary 原封不動）**：
```
./data/lintProbe.ts
2:1  Error: Do not assign to the variable `module`. ...  @next/next/no-assign-module-variable
runB_exit=1
```
⇒ `middleware.ts` 那條**消失了**，即使檔案裡的 error 級違規還在。

**結論（實測，⛔ 非推理）**：
1. ✅ **`eslint.dirs` 吃檔案路徑**——`'middleware.ts'` 被接受，且它就是 `middleware.ts` 被 lint 的**唯一原因**（有對照組）。
   ⇒ **裁決③ 乙可以原樣採用，⛔ 不需要退成「`dirs` + `--file`」混合方案。**
2. ✅ **`data/` 被 `dirs` 覆蓋**（canary 在兩個 run 都被抓到）。
3. ✅ **error 級違規會讓 `next lint` 非 0 離開**（Run B `exit=1`）
   ⚠️ 但**素材是本輪自製的 `no-assign-module-variable` canary、⛔ 不是任務包 N1 指定的
   `components/LintCanary.tsx` / `react-hooks/rules-of-hooks`** ⇒ 正式驗收仍須依 N1 重跑一次。

### 1.6 `yarn build` 在設定檔就位之下是綠的（裁決① 的關鍵風險已解除）

```
$ yarn build; echo "exit=$?"
build_exit=0
   ▲ Next.js 14.1.0
 ✓ Compiled successfully
   Linting and checking validity of types ...
（接著印出與 §1.4 相同的 10 條 no-img-element warning）
```

⇒ **實測坐實**：build 期確實跑了 ESLint（輸出裡有那 10 條 warning），
且 **warning 級⛔ 不會讓 build 失敗**（`exit=0`）。
⇒ 任務包裁決點① 所列「設定檔一進版控就可能把發版路徑（Dockerfile `npm run build`）弄紅」的風險，
**在目前的碼況下⛔ 不成立**——因為 error 數 = 0。

⚠️ ⛔ **未驗**：「有 error 級違規時 build 會失敗」**本輪沒有實跑**
（我只跑了 lint 的 error 情境、沒把 canary 留著跑 build）⇒ 留給驗收 **N1b**。

### 1.7 還原對帳（暫放的兩處改動已全部移除）

- `.eslintrc.json`：`rm`（新檔，直接刪）。
- `next.config.js`：**從勘查前的 `cp` 備份檔覆蓋還原**，⛔ 未用 `git checkout`。
- `middleware.ts`：**從備份檔還原**；`git diff --stat middleware.ts` **無輸出**，`wc -c` = **529**（與備份檔同為 529 B）。
- `data/lintProbe.ts`：`rm`。
- `next.config.js.tmpbak`（`sed -i` 產生的副檔）：`rm -f`。

```
$ git status --short
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F8-background.md
?? docs/tasks/F8.md
exit=0
```

⇒ **與 §1.1 逐字相同 ⇒ 工作樹已回到勘查前狀態。**
⚠️ `yarn.lock` / `package.json` 全程未動（未出現在 `git status`）；⛔ 全程未跑 `npm install`、⛔ 未裝任何套件、⛔ 未打任何 tag。
⚠️ `.next/` 因 §1.6 的 build 而更新，該目錄在 `.gitignore` 內、⛔ 未出現在 `git status`。

---

## 二、四個裁決點的落位

### 裁決② —— **依裁決：甲**（架構師 2026-09-07 拍板）

根目錄手寫 `.eslintrc.json`：

```json
{
  "root": true,
  "extends": "next/core-web-vitals"
}
```

⛔ 零新增套件、⛔ 不動 `yarn.lock`、⛔ 不用 `--strict` 產生（§1.3 已坐實本 repo 無 `pages/`）。
✅ 本輪勘查已用同一份內容實跑過（§1.4），確認 `next lint` 認得、能 lint 到 TS/TSX。

### 裁決③ —— **依裁決：乙**（架構師 2026-09-07 拍板）

`next.config.js` 加一行：

```js
eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },
```

✅ **實測結果：`dirs` 吃 `middleware.ts`，⛔ 不需要退混合方案**（§1.5，含對照組）。
⇒ 裁決③ 附帶的「若不吃就退為 `dirs` + `--file`」條款**不觸發**。

### 裁決① —— **依裁決：丙**（架構師 2026-09-09 於對話拍板）

**裁決內容**：在 `.eslintrc.json` 裡**明確關掉 `@next/next/no-img-element` 這一條規則、並寫明理由**；
既有那 10 條 warning **本次不修**，改成把清單抄進 verification ＋ 建議另開一筆 backlog。
⇒ **目的**是讓 `yarn lint --max-warnings 0` 成為**真的會綠也會紅**的閘門，⛔ 不是把 warning 清零。

⇒ **最終要落檔的 `.eslintrc.json`**（＝裁決② 甲原文 ＋ 一個 `rules` 鍵；⛔ 不得順手多關第二條規則）：

```json
{
  "root": true,
  "extends": "next/core-web-vitals",
  "rules": {
    "@next/next/no-img-element": "off"
  }
}
```

⚠️ **代價照樣留著，⛔ 不得因為選了它就抹掉**：下表「丙」列寫的「對這條規則又變回空測」
**就是本裁決選中的那一項**，架構師是在知道這個代價之下拍的。
⇒ 「**`@next/next/no-img-element` 自此不被檢查**」這句必須出現在三處：
(a) `F8-verification.md`、(b) 給 `CLAUDE.md`「CI 現況」節的建議改寫文字、(c) backlog 建議條目文字。

**勘查實數：error 0 條 / warning 10 條 / 7 個檔 / 唯一規則 `@next/next/no-img-element`（warn 級）。
`yarn build` `exit=0`（發版路徑不受影響）。`yarn lint --max-warnings 0` `exit=1`。**

**四個選項原文（⛔ 保留存查；架構師 2026-09-09 選中 **丙**，甲／乙／丁未選中）**：

| 選項 | 內容 | 在**實數已知**之下的代價 |
|---|---|---|
| **甲** | 只補設定檔，違規一條不修 | 發版路徑安全（error 0 ⇒ build 綠，§1.6 已實測）。但 `yarn lint --max-warnings 0`（`CLAUDE.md` 的嚴格指令）**永遠是紅的**，⇒ 日後每份驗收報告都要解釋這 10 條。 |
| **乙** | 補設定檔 + 修完全部 10 條 | 需把 7 個檔的 `<img>` 換成 `next/image` 或加 `eslint-disable` 註解。⚠️ 換 `next/image` **會改到視覺行為**（尺寸、`fill`/`sizes`、外部網域需設 `images.remotePatterns`）⇒ ⛔ 不是無風險的機械改動。⚠️ 且 7 檔之一是 `components/ServerSection.tsx`（觸發裁決④）。 |
| **丙** | 把 `@next/next/no-img-element` 在設定檔關掉 | ⇒ 對這條規則又變回空測，與 F8 存在理由相悖。 |
| **丁** | 只修 error 級、warning 另立任務 | ⚠️ **本案 error = 0 ⇒ 丁在實作上等於甲**，差別只在「是否同時開一筆 backlog 收這 10 條 warning」。 |

⚠️ 以下是**裁決前**寫的實作側觀察，⛔ 保留存查、⛔ 不再構成選項（① 已裁為丙）：
- 規模比任務包預估小一個量級（10 條 / 1 條規則 / 0 error），乙**做得完**；
- 但乙的實際內容是「改圖片渲染方式」，那是**產品外觀變更**、⛔ 不是 lint 清潔工作，
  已超出「補回閘門」的題目；且⛔ 沒有頁面截圖或視覺回歸手段可驗。
- 若要在不動外觀的前提下清零，唯一手段是逐處加 `// eslint-disable-next-line @next/next/no-img-element`
  ——那是**選項丙的逐行版**，同樣會讓那 10 個位置變回不被檢查。

**backlog 條目建議文字（實作側寫進 verification，⛔ 不動 vault、⛔ 本任務不自己開 backlog）**——至少須含：
- **10 處 `<img>` / 7 個檔 / 逐條「行:欄」清單**（逐字取自 §1.4 的表）；
- **修法二選**：換 `next/image`（⚠️ 會動視覺，需頁面目視回歸）或逐處
  `// eslint-disable-next-line @next/next/no-img-element`；
- **完成判準**：從 `.eslintrc.json` 移除該條 `"off"` 之後，`yarn lint --max-warnings 0` **仍綠**；
- ⚠️ 註明「在此 backlog 完成前，`@next/next/no-img-element` 對**全 repo** 不被檢查」。

### 裁決④ —— **免裁**（架構師 2026-09-09：① 選丙 ⇒ 不動那三個舊改動檔）

**實測：三個舊改動檔的違規分佈**

| 檔案 | 違規 |
|---|---|
| `app/layout.tsx` | **0 條** |
| `app/staff/page.tsx` | **0 條** |
| `components/ServerSection.tsx` | **1 條**，`90:33`，`@next/next/no-img-element`（**warn** 級） |

⇒ 條件雖觸發，但**⛔ 沒有 error 級**；且 ① 裁為丙之下**⛔ 不修任何原始碼**，
`components/ServerSection.tsx` 本來就不會被動到 ⇒ **④ 不需要裁**（架構師 2026-09-09 明示免裁）。
⚠️ 這三個舊改動檔在本任務全程維持 modified、⛔ 不進 F8 的 commit（見 §3「進 commit 的檔案」）。
（選項原文保留存查：甲：這檔不修 / 乙：`git add -p` 挑 hunk / 丙：先處理三個舊改動再回頭修。）

---

## 三、實作步驟（⛔ 等 `F8-plan-review.md` 放行才執行）

0. **⛔ 未實查，實作側必查：先探測 `.eslintrc.json` 吃不吃 `//` 註解。**
   ⚠️ 裁決① 丙要求「寫明理由」，但 `.eslintrc.json` 是 JSON，**嚴格 JSON 不允許註解**；
   ESLint 舊式設定載入器歷來會先剝註解再解析（⚠️ 這只是印象、⛔ 未核 `node_modules` 行號、⛔ 未跑過），
   `next lint` 走不走同一條路徑也未驗。
   **探測方式**：設定檔內放一行 `// 探測用` 之後跑 `yarn lint; echo "exit=$?"` ⇒
   **`exit=0` 且輸出⛔ 不含 parse error** 才算「吃」；原文貼進 verification。
   **兩條路（依探測結果二選一）**：
   - **吃註解** ⇒ 理由直接寫在 `rules` 那行**上方**，措辭至少含：
     「架構師 2026-09-09 裁決① 丙；既有 10 處 `<img>` 未修、見 backlog 建議；⚠️ 此規則自此不被檢查」。
   - **不吃註解** ⇒ 設定檔**保持純 JSON、⛔ 不硬塞**；理由改落三處：
     (a) `docs/tasks/F8-verification.md` 專節、(b) 給 `CLAUDE.md`「CI 現況」節的建議改寫文字、
     (c) backlog 建議條目文字（見 §2 裁決①）。
   ⛔ **不得用 `"_comment": "..."` 之類的假鍵當備援**——eslintrc 頂層鍵有 schema 驗證，未知鍵可能讓整份設定報錯
   （⚠️ 這點同樣未實查，而這正是它⛔ 不可當備援的理由：它本身就是要驗的東西）。
   ⚠️ **另一條路是改用 `.eslintrc.js`（可寫註解）—— 那偏離裁決② 甲的檔案形式，⛔ 實作側不得自選**；
   若認為值得，**停下回報**，由規劃側列選項給架構師。**既定路線：不吃就走純 JSON ＋ 理由落三處。**
1. **落檔 `.eslintrc.json`**（根目錄，內容逐字同 §2 裁決① 的最終版＝甲原文 ＋ `rules` 那條 `off`）。
   手寫，⛔ 不用 `--strict`。
   ⚠️ 驗收 P1a 需要**先跑不含 `rules` 的版本** ⇒ 實作順序是「先落甲原文跑 P1a → 再加 `rules` 跑 P1b」，
   ⛔ 不是一次寫完就跑（見 §4）。
2. **改 `next.config.js`**：在 `output: 'standalone',` 之後加一行
   `eslint: { dirs: ['app', 'components', 'data', 'lib', 'middleware.ts'] },`。
   ⚠️ 精確錨點編輯，⛔ 不整份重寫。
3. **依裁決① 丙處理既有 10 條 warning ＝ ⛔ 不改任何原始碼。**
   只做兩件事：(a) 把 §1.4 那 10 條（檔名 / 行:欄 / 規則名）**逐字抄進 verification**；
   (b) 附上「建議 backlog 條目」文字（內容見 §2 裁決①）。
   ⛔ 不得改任何 `.tsx`、⛔ 不得用 `eslint --fix`、⛔ 不得逐處加 `eslint-disable` 註解。
4. **跑完 §4 的驗收步驟全部項目**（含負向對照），每步貼原文與 `exit`。
5. **產 `docs/tasks/F8-verification.md`**（格式沿用 `docs/tasks/verification_template.md`），內含：
   勘查實數對帳、N0～P3' 全部輸出、**步驟 0 的註解探測結果原文**、
   **建議收案時改寫 `CLAUDE.md`「CI 現況」節的文字**（⛔ 本任務不自己改 `CLAUDE.md`）。
   ⚠️ 該建議文字**必須明寫**：「`@next/next/no-img-element` 已於 `.eslintrc.json` 關閉、
   既有 10 處 `<img>` 未修、已列 backlog 建議」——⛔ 不得只寫「lint 已實測會擋」而漏掉這個洞。
6. **⛔ commit / push 前回報，待架構師確認。** ⛔ 不打任何 tag。

**進 commit 的檔案（逐檔 `git add`，⛔ 禁 `git add .`）**
- `.eslintrc.json`
- `next.config.js`
- ⛔ **無原始碼改動**（① 裁為丙 ⇒ 那 10 條不修；三個舊改動檔依裁決④ 免裁、⛔ 不進本次 commit）
- `docs/tasks/F8-plan.md`、`docs/tasks/F8-verification.md`
- （`docs/tasks/F8.md`、`docs/tasks/F8-background.md` 目前是 untracked，是否納入由收案時決定）
- ⛔ `components/LintCanary.tsx` 不得出現在 `git status`

---

## 四、驗收步驟（N0 / P1a / P1b / N1 / N1b / N2 / N3 / P2 / P3'）

> ⚠️ 每步 `; echo "exit=$?"`，貼原文。⚠️ 還原一律用備份檔，⛔ 不用 `git checkout`。
> ⚠️ **執行順序（讓每一步只差一個變因）**：P1a（無 `rules`）→ P1b（加 `rules`）→ N1 → N1b → N2 → N3 → P2 → P3'。

- **N0 起始基準**（補設定**前**）：`yarn lint < /dev/null` ⇒ 預期問卷 + 無檔名 + `exit=0`。
  ✅ 本輪已實跑一次（§1.2），驗收時因設定檔已就位而⛔ 無法重現 ⇒
  **verification 逐字複製 §1.2 那段輸出**，並標「取樣自 `F8-plan.md` §1.2，2026-09-07」，⛔ 不得只寫「見 plan」。
- **P1a 正向（設定檔⛔ 不含 `rules` 鍵，＝裁決② 甲原文）**：跑 `yarn lint` ⇒
  預期 **10 warning / 0 error / `exit=0`**，且檔名與「行:欄」與 §1.4 的表**逐條相符**、⛔ 無問卷。
  ⇒ 這才是「真的 lint 到了那 27 個檔」與「§1.4 勘查數字可重現」的證據。
- **P1b 正向（加上 `rules`，＝最終落檔內容）**：把 `"@next/next/no-img-element": "off"` 加進去再跑 `yarn lint` ⇒
  預期印「✔ No ESLint warnings or errors」、`exit=0`。
  ⚠️ P1a → P1b 之間的差**只有那一條 `off`** ⇒ 10 條消失即證明 `off` 生效、且⛔ 沒有關錯規則。
- **N1 負向（error 級）**：建立 `components/LintCanary.tsx`（任務包指定的 `react-hooks/rules-of-hooks` 版本），
  `yarn lint` ⇒ 輸出含 `components/LintCanary.tsx` 與 `react-hooks/rules-of-hooks`、**`exit ≠ 0`**。
  ⚠️ 若 `exit=0` ⇒ 停下回報。
  （⚠️ 本輪已用**不同 canary**實測「error 會非 0 離開」= §1.5 Run B `exit=1`；N1 仍須用指定素材重跑。）
- **N1b 負向（build 路徑）**：canary 仍在 ⇒ `yarn build` 應在「Linting and checking validity of types」失敗、`exit ≠ 0`。
  ⚠️ **本輪⛔ 未驗**，是驗收時唯一還沒有任何實測支撐的一步。
- **N2 負向（warning 級）**：⚠️ **素材已換掉**——任務包原本拿 `<img>`（`@next/next/no-img-element`）當 warning 素材，
  該規則在丙之下已 `off` ⇒ 用它跑 `--max-warnings 0` 會直接 `exit=0`，**N2 自己變成第五個空測**。
  改用 **`react-hooks/exhaustive-deps`**（背景表已於檔案層核為 **warn** 級，
  `eslint-plugin-react-hooks.development.js` 第 2579–2580 行）。
  `components/LintCanary.tsx` 整檔內容（新檔，⛔ 驗完必刪）：

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

  預期：`yarn lint` `exit=0` 且輸出**恰好 1 條** warning、規則名 `react-hooks/exhaustive-deps`、
  檔名 `components/LintCanary.tsx`；`yarn lint --max-warnings 0` **`exit ≠ 0`**。
  ⚠️ 丙之下既有 warning 已為 0 ⇒ 舊 plan「帶 canary 11 條／不帶 canary 10 條」的條數對照**不再需要**，
  N2 是乾淨的 **1 vs 0**。
  ⛔ **未實查，實作側必查**：此素材是否真的**只**觸發那一條（會不會連帶觸發別的規則）。
  ⚠️ 若它觸發不了 warn ⇒ 備援素材用 **`@next/next/no-css-tags`**（`recommended` 之下 warn 級；
  ⛔ 行號未核，以輸出的規則名為準）：`return <link rel="stylesheet" href="/x.css" />;`。
  無論用哪個，**verification 都要貼規則名原文**。
- **N3 移除 canary**：`rm components/LintCanary.tsx` ⇒ `git status --porcelain components/LintCanary.tsx` 無輸出。
- **P2 正向（目標狀態）**：
  `yarn install --frozen-lockfile`（`exit=0`）／`yarn lint --max-warnings 0`／`yarn build`。
  - **目標＝三條全 `exit=0`**：install `exit=0`、
    **`yarn lint --max-warnings 0` `exit=0`（綠）並印「✔ No ESLint warnings or errors」**、
    build `exit=0`（✅ §1.6 已預先實測為 0）。
  - ⚠️ 若 lint 非 0 ⇒ 表示那條 `off` 沒生效、或還有別的違規 ⇒ **停下回報**，⛔ 不得自行再關第二條規則。
  ⚠️ **但 verification 的「CI／lint」欄仍須據實寫**：
  「**綠，但 `@next/next/no-img-element` 已 off、既有 10 處 `<img>` 未修（已附 backlog 建議）**」
  ——⛔ 不得只寫「lint 通過」四個字。
  另貼 `git diff --stat yarn.lock package.json`（裁決② 甲之下應為空）。
- **P3'（覆蓋範圍證明，⚠️ 取代任務包 P3）**：
  ⛔ **不得用 `yarn next lint --format json` 的 `filePath` 清單**——§1.5 已實測它只列**有問題的檔**
  （`customFormatter.js` 第 80 行過濾），拿它當覆蓋證明是**空測**。
  改用**正控 canary + 對照組**：
  1. 在 `data/` 放一個帶 **error 級**違規的臨時檔（`@next/next/no-assign-module-variable`），
     `middleware.ts` 用**備份檔**保護後於檔尾附加同一條違規；
  2. `yarn lint` ⇒ 兩個位置都必須被列出（證明 `data/` 與 `middleware.ts` 都在覆蓋內）；
  3. 對照組：`dirs` 暫時拿掉 `'middleware.ts'` 再跑 ⇒ `middleware.ts` 那條必須**消失**
     （證明是 `dirs` 那一項在起作用，⛔ 不是別的預設）；
  4. 還原：`rm` 臨時檔、`cp` 備份檔覆蓋 `middleware.ts`、`next.config.js` 改回，
     並貼 `git status --short`、`git diff --stat middleware.ts`、`git diff --stat next.config.js` 對帳。
     ⚠️ `next.config.js` 的 diff **預期⛔ 不是空的**——步驟 2 的正式改動（`eslint.dirs` 那行）本來就在
     ⇒ 要對的是「**diff 只有那一行**」，⛔ 不是「diff 為空」。
  ✅ 本輪已完整實跑一次（§1.5），驗收時照同一套重跑並貼原文。
- **回歸**：`yarn build` 過（P2）。⚠️ ① 裁為丙之下**⛔ 不改任何原始碼、⛔ 不動任何頁面**
  ⇒ ⛔ 不需要 `yarn dev` 目視回歸（那是未被選中的乙才需要的）。
  ⚠️ 本次⛔ 不會動到 `app/api/apply/route.ts` 或 `middleware.ts` 的**邏輯**
  （`middleware.ts` 只在 P3' 期間被 canary 暫時附加、事後由備份檔還原）⇒ 守則 8 的 `curl` 正負向測試⛔ 不觸發。
  ⚠️ 但 P3' 動過 `middleware.ts` 的檔案內容 ⇒ verification 必須附還原對帳（`git diff --stat middleware.ts` 空 + 位元組數）。

---

## 五、待裁決事項

**無。** 四個裁決點都已落定：① 丙、② 甲、③ 乙、④ 免裁（見 §2，以及規劃側審核檔的「裁決記錄」節）。

⚠️ **唯一會重新產生裁決需求的情況**：步驟 0 探測顯示 `.eslintrc.json` **不吃註解**，
且實作側認為值得改用 `.eslintrc.js`（可寫註解）—— 那**偏離裁決② 甲的檔案形式**，
⇒ ⛔ 實作側不得自選，**停下回報**，由規劃側列選項給架構師。
⚠️ 本 plan 的既定路線是**不改形式**：不吃註解就走純 JSON ＋ 理由落三處。

## 六、本輪已知但尚未驗證的事

- ⛔ **未驗**：「有 error 級違規時 `yarn build` 會失敗」——留給 N1b（§1.6）。
- ⛔ **未驗**：任務包 N1 指定的 `components/LintCanary.tsx` 素材本身（本輪用的是另一組 canary）。N2 素材已依裁決① 丙換成 `react-hooks/exhaustive-deps`，同樣未跑過。
- ⛔ **未驗**：`yarn install --frozen-lockfile`（本輪未跑；`yarn.lock` 與 `package.json` 全程未被改動）。
- ⛔ **未驗**：`.eslintrc.json` 吃不吃 `//` 註解（規劃側審核檔 ⛔ 第 3 點標「未實查，實作側必查」）——留給 §3 步驟 0 的探測。
- ⛔ **未驗**：N2 新素材（`react-hooks/exhaustive-deps`）是否恰好只觸發那一條規則——留給 N2；備援 `@next/next/no-css-tags`（行號未核）。
