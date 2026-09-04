# 審計：F1 驗收報告（`F1-verification.md`）

> 稽核側（`nr-auditor`）產出。審計對象：`docs/tasks/F1-verification.md`。
> 格式沿用 `docs/tasks/verification-audit_template.md`。
> **⛔ 不信報告自述**：以下每一條都附本側實跑的指令與原始輸出。
> ⚠️ 本側對現場**唯讀**：全程未 `git add / commit / checkout / reset / tag`、
> 未改任何實碼、未改 `.env.local`、未改 F1 四份文件、未重建已刪除的臨時 fixture。
> ⚠️ 本側**看不到**實作側的 plan 推理與主迴圈派工訊息中的數字，所有數字自量。
>
> 稽核日期：2026-09-04。稽核時 HEAD = `a593cfb`。

---

## 審計結論

**⚠️ 有條件通過**

實質內容全數屬實 —— 包含本次最有後果的發現（`yarn lint --max-warnings 0` 是空測），
本側**獨立重跑完全重現**。實碼淨變動為零、fixture 已刪、機密零外洩、
D4 的隱含假設誠實標註、C3 首次失敗未被隱瞞 —— 這些都經本側實測確認。

條件為**三處文字級更正**（見「⛔ 必改」節），⛔ **不需要改任何實碼、⛔ 不需要重跑任何測試**。
其中最重要的一條是：**F2／F4 的驗收報告從來沒有跑過 `yarn lint`**（兩份都經架構師明確豁免）
⇒ 報告中「若曾以 `yarn lint` exit 0 作為佐證」這個前提**經本側實查為偽**，
⇒ 實際上**沒有任何已收案的 lint 佐證受到影響**。這件事會直接影響架構師要記進 backlog 的那一行怎麼寫。

---

## 獨立抽查

### 群組 1 —— ⚠️⚠️ ESLint 空測（最高優先，逐條獨立重跑）

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 1.1 | `yarn lint --max-warnings 0` exit 0 | 自跑一次，取退出碼 | `EXIT_CODE=0` | ✅ 相符 |
| 1.2 | exit 0 但**根本沒 lint 任何檔案** | 自跑並看輸出 | 輸出只有互動式問卷，⛔ 無任何檔案清單、⛔ 無 `✔ No ESLint warnings or errors` | ✅ 相符 |
| 1.3 | 工作樹⛔ 無任何 ESLint 設定檔 | `ls .eslintrc* eslint.config.*` + `find -maxdepth 2` | `no matches found`；`find` 零筆 | ✅ 相符 |
| 1.4 | `package.json` ⛔ 無 `eslintConfig` | `grep -c` | `0` | ✅ 相符 |
| 1.5 | HEAD 版控內容⛔ 無 eslint 設定檔（含負向對照） | `git ls-tree -r HEAD` | eslint 類 = `0`；負向對照 `tsconfig.json` = `1` | ✅ 相符（對照有效） |
| 1.6 | `.eslintrc.json` 於 `16635f9`（2022-05-13）新增 6 行 | `git log -1` + `git show --numstat` | `16635f9 2022-05-13 Convert next.js framework` / `6	0	.eslintrc.json` | ✅ 相符 |
| 1.7 | `.eslintrc.json` 於 `5afda1a`（2026-02-12）刪除 6 行 | 同上 | `5afda1a 2026-02-12 chore: reorganize project structure and migrate to app router` / `0	6	.eslintrc.json` | ✅ 相符 |
| 1.8 | 套件確實裝著、缺的只是設定檔 | `node -p` 讀兩個 `package.json` | eslint `8.57.1`、eslint-config-next `14.1.0`；`package.json` 33/34 行有兩個依賴 | ✅ 相符 |
| 1.9 | 「CI」欄⛔ 沒寫成「lint 通過」 | 讀 `F1-verification.md:416` | 逐字為 `| yarn lint --max-warnings 0 | **0** | ⛔ **不是「通過」——見下方：這是空測** |` | ✅ 相符 |
| 1.10 | ⛔ 無美化／擴大解釋 | 讀 `F1-verification.md:615-621` | 逐字寫「該佐證的**證明力受本發現影響**；⛔ **不是**「佐證已失效」，也⛔ **不是**「無影響」」——與架構師裁定措辭一致 | ✅ 相符 |

**本側獨立重跑的原始輸出**（`cat -v` 保留控制序列）：

```
$ cd <repo> && yarn lint --max-warnings 0 < /dev/null 2>&1 | cat -v
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0
? How would you like to configure ESLint? https://nextjs.org/docs/basic-features/eslint
^[[?25lM-bM-^]M-/  Strict (recommended)
   Base
   Cancel M-bM-^ZM-  If you set up ESLint yourself, we recommend adding the Next.js ESLint plugin. See https://nextjs.org/docs/basic-features/eslint#migrating-existing-config
Done in 0.63s.

$ yarn lint --max-warnings 0 < /dev/null > /dev/null 2>&1; echo "EXIT_CODE=$?"
EXIT_CODE=0
```

⇒ 本側輸出與 `E3-lint.log` 實質相同（`E3-lint.log` 本側 `wc -lc` = `8 409`，與報告 §CI 的「8 行 / 409 bytes」相符）。

```
$ ls -la .eslintrc* eslint.config.* 2>&1
(eval):1: no matches found: .eslintrc*
exit=1

$ find . -maxdepth 2 -name '.eslintrc*' -not -path './node_modules/*' -o -maxdepth 2 -name 'eslint.config.*' -not -path './node_modules/*'
（零輸出）

$ grep -c 'eslintConfig' package.json
0

$ git ls-tree -r HEAD --name-only | grep -cE 'eslintrc|eslint\.config'
0
負向對照 $ git ls-tree -r HEAD --name-only | grep -cx 'tsconfig.json'
1

$ git ls-files | grep -cE 'eslintrc|eslint\.config'
0

$ git log --oneline --follow --all -- .eslintrc.json
5afda1a chore: reorganize project structure and migrate to app router
16635f9 Convert next.js framework
```

**本側追加的兩項（報告未做，結論同向）**：

```
$ sed -n '/"scripts"/,/^  }/p' package.json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
⇒ lint script 本身⛔ 不含 --max-warnings ⇒ CLAUDE.md 要求「旗標不可省」為事實

跑完 lint 後再查一次：
$ ls -la .eslintrc* eslint.config.* 2>&1
(eval):5: no matches found: .eslintrc*
⇒ 互動式問卷在無 TTY 下⛔ 未寫出任何設定檔 ⇒ 現場未被 lint 這一跑改變
$ git status --short   ⇒ 與跑之前逐字相同（見群組 2）
```

#### ⚠️ 本群組的一項實查差異（→ 必改 1）

報告 §「待處理」寫「**F2／F4 的驗收報告若曾以 `yarn lint` exit 0 作為佐證**……」。
本側查已歸檔的兩份報告：

```
$ grep -n -i 'lint' docs/tasks/archive/F2-verification.md
198:   Linting and checking validity of types ...
621:- yarn lint --max-warnings 0 依架構師裁定明確豁免(本任務未動任何 .ts/.tsx)。
633:- `yarn lint --max-warnings 0` → **⛔ 未跑**。
634:  ⚠️ 依任務包「lint / build 裁示」節，架構師 2026-08-30 裁定「甲」時
635:  **明確豁免 lint**（理由：本任務未動任何 `.ts` / `.tsx`，lint 對象集合不變）。
639:- ⚠️ **本專案沒有 build/lint CI**（唯一 workflow `push-docker.yaml` 只在 tag `v*.*.*` 時 build image）。

$ grep -n -i 'lint' docs/tasks/archive/F4-verification.md
380:  - `yarn lint --max-warnings 0` → ⛔ **未跑，經架構師 2026-08-31 明確豁免**
381:    （理由：本任務⛔ 未動任何 `.ts` / `.tsx`，lint 對象集合不變）。
383:- ⚠️ **本專案沒有 build/lint CI**（唯一 workflow `push-docker.yaml` 只在 tag
```

⇒ **F2 與 F4 都⛔ 沒有跑過 `yarn lint`**（`F2-verification.md:198` 的 `Linting and checking validity of types` 是
`next build` 的內建 TypeScript 階段，⛔ 不是 `next lint`）。
⇒ 報告那句話用「若曾」是**有 hedge 的**、⛔ 不構成不實陳述，
但**前提為偽** ⇒ 讀者（與 backlog）會被導向「有已收案佐證受影響」，而實際上**一件都沒有**。
判定：**⚠️ 有差異（前提經實查為偽）**。

---

### 群組 2 —— 淨變動為零 / 守界

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 2.1 | `git status --short` 只有三個舊 modified + `WORKFLOW.md` + F1 文件 | 實跑 | 見下逐字；與報告一致（報告已註明 `F1-verification.md` 於其對帳後才落檔） | ✅ 相符 |
| 2.2 | staged = 0 筆 | `git diff --cached --name-only \| wc -l` | `0` | ✅ 相符 |
| 2.3 | `middleware.ts` / auth route / `.gitignore` / `package.json` 皆零 diff | `git diff --stat --` 四檔 | 零輸出、`exit=0` | ✅ 相符 |
| 2.4 | `find app -type d -name 'admin*'` 零筆 | 實跑 | 零輸出、`exit=0` | ✅ 相符 |
| 2.5 | `app/` 恢復 9 個目錄 | 實跑 + 對 `CLAUDE.md` 程式碼地圖 | 9 個，逐一與地圖相符 | ✅ 相符 |
| 2.6 | HEAD = origin/developers = `a593cfb849b…` | `git rev-parse` | 兩者同值 | ✅ 相符 |
| 2.7 | `git diff --stat HEAD` 四檔 201/98 | 實跑 | 逐字相同 | ✅ 相符 |
| 2.8 | `middleware.ts` 20 行 / 529 bytes | `wc -lc` | `20 529` | ✅ 相符 |
| 2.9 | `package.json` 的 `"dev"` 至今無 `-p` | `grep -n` | `14:    "dev": "next dev",` | ✅ 相符 |
| 2.10 | ⛔ 未打任何 tag | 讀 `.git/refs/tags` 與 `.git/packed-refs` | `.git/refs/tags` **空目錄**；`packed-refs` 內 `refs/tags` 零筆 ⇒ 本 clone **一個 tag 都沒有** | ✅ 相符 |
| 2.11 | `WORKFLOW.md` 的 modified ⛔ 不屬於 F1，且⛔ 未隱瞞 | 讀報告 + 查該檔 diff 是否涉 F1 | 報告在 `git status` 區塊、守界聲明專節、變更檔案表**三處**披露；該檔 diff 中 `F1`／`f1-probe`／`3100` 出現次數 = **0** | ✅ 相符 |
| 2.12 | 三個舊 modified 是 F1 前就存在 | `stat` 取 mtime | 三檔 mtime 皆 **2026-03-28**，早於 F1（09-02～09-04）**五個月** ⇒ 客觀佐證 | ✅ 相符（本側追加證據） |
| 2.13 | `data/` 未動 | `git diff --stat -- data/ components/` | `data/` 零筆；`components/` 只有 `ServerSection.tsx`（即 2.12 的舊改動） | ⚠️ 見必改 3 |
| 2.14 | `package-lock.json` 未復活 | `ls -l` | `ls: package-lock.json: No such file or directory` / `ls_exit=1` | ✅ 相符 |
| 2.15 | `yarn.lock` 未被動到 | `shasum -a 256` 對 `yarn.lock.before.sha256` | 兩者皆 `a751386e39e543654dcf4f7520cc20d0f291314fd59c15848dc555d20e3bab48` | ✅ 相符 |
| 2.16 | 本側活動未污染現場 | 跑完 build / lint / dev server 後再 `git status --short` | 與稽核開始時**逐字相同** | ✅ |

```
$ git status --short
 M WORKFLOW.md
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F1-plan-review.md
?? docs/tasks/F1-plan.md
?? docs/tasks/F1-verification.md
?? docs/tasks/F1.md

$ git diff --cached --name-only | wc -l
       0

$ git diff --stat -- middleware.ts "app/api/auth/[...nextauth]/route.ts" .gitignore package.json
（零輸出）
exit=0

$ find app -type d -name 'admin*'
（零輸出）
exit=0

$ find app -maxdepth 1 -mindepth 1 -type d | sort
app/api
app/apply
app/donate
app/launcher
app/modServer
app/sponsor
app/staff
app/team
app/voteModpack
count=9

$ git rev-parse HEAD origin/developers
a593cfb849b57fc524d52429c87b072e276a9d0f
a593cfb849b57fc524d52429c87b072e276a9d0f

$ git diff --stat HEAD
 WORKFLOW.md                  | 118 ++++++++++++++++++++++++++---
 app/layout.tsx               |   2 +-
 app/staff/page.tsx           |   6 +-
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
 4 files changed, 201 insertions(+), 98 deletions(-)

$ wc -lc middleware.ts
      20     529 middleware.ts

$ ls -la .git/refs/tags
total 0
drwxr-xr-x  2 quasi-pc  staff   64 Feb 23  2022 .
drwxr-xr-x  6 quasi-pc  staff  192 May 13  2022 ..
$ grep -c 'refs/tags' .git/packed-refs
（零筆）

$ git diff -- WORKFLOW.md | grep -cE '^[+-].*(F1|f1-probe|3100)'
0
$ git diff -- WORKFLOW.md | grep -E '^\+## '
+## 檔案管道(五件套)

$ stat -f '%Sm  %N' -t '%Y-%m-%d %H:%M:%S' app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
2026-03-28 00:28:50  app/layout.tsx
2026-03-28 00:28:16  app/staff/page.tsx
2026-03-28 00:52:00  components/ServerSection.tsx

$ git diff --stat -- data/ components/
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
 1 file changed, 88 insertions(+), 85 deletions(-)
```

---

### 群組 3 —— 機密零外洩

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 3.1 | 四份 F1 文件中的 17–19 位數字**只有**假 ID `000000000000000001` | `grep -oE '[0-9]{17,19}' \| sort -u` 逐檔 | `F1.md` 0 筆；`F1-plan.md` 4 筆、`F1-plan-review.md` 1 筆、`F1-verification.md` 2 筆 —— **unique 值全部只有 `000000000000000001`** | ✅ 相符 |
| 3.2 | 文件中⛔ 無 secret 賦值 | grep 四個變數名後接非空白 | 命中的兩處皆為 grep **樣式字串**本身；`F1-plan.md:383` 的 `printf` 骨架五格**全空** | ✅ 相符 |
| 3.3 | ⛔ 無 Discord webhook URL | `grep -cE 'discord(app)?\.com/api/webhooks'` | 四檔皆 `0` | ✅ 相符 |
| 3.4 | 10 個 `*.log` 落檔機密掃描全為 0 | 逐檔三種 grep 自量 | 10 檔 × 3 欄 **全部 0**，與報告表格逐格相同 | ✅ 相符 |
| 3.5 | 報告出現的雜湊皆為整檔／lock／fixture 摘要 | 逐一重算 | `91a29db3…` = `.env.local` 整檔 md5（重算相符）；`a751386e…` = `yarn.lock` sha256（相符）；`0ce5baf8…` = fixture sha256（相符）；`f20669bb…` 無法重算（見未能重量） | ✅ 相符（`f20669bb…` 除外） |
| 3.6 | 鐵則 1：機密只在 server 端 | grep 全 `*.ts`/`*.tsx` | 僅 `middleware.ts`、`app/api/apply/route.ts`、`app/api/auth/[...nextauth]/route.ts` 三檔引用；三檔 `use client` 計數皆 0；全源碼 `NEXT_PUBLIC` 出現 **0** 次 | ✅ 相符（本側追加證據） |

```
$ for f in F1.md F1-plan.md F1-plan-review.md F1-verification.md; do
    echo "$f unique:"; grep -oE '[0-9]{17,19}' "$f" | sort -u; done
F1.md unique:
F1-plan.md unique:
    000000000000000001
F1-plan-review.md unique:
    000000000000000001
F1-verification.md unique:
    000000000000000001

$ for f in <scratchpad>/f1/*.log; do ... done
FILE                       NXSEC   DCSEC DIG17_19
A0-yarn-install.log            0       0       0
A2-devserver.log               0       0       0
A3-devserver.log               0       0       0
C-devserver-2.log              0       0       0
C-devserver.log                0       0       0
D-devserver.log                0       0       0
E3-build.log                   0       0       0
E3-install.log                 0       0       0
E3-lint.log                    0       0       0
E4-devserver.log               0       0       0
（log 檔總數 = 10，與報告的「10 個落檔」相符）

$ grep -rln 'ADMIN_DISCORD_ID\|DISCORD_CLIENT_SECRET\|DISCORD_WEBHOOK_URL\|NEXTAUTH_SECRET' --include='*.ts' --include='*.tsx' . | grep -v node_modules
middleware.ts
app/api/apply/route.ts
app/api/auth/[...nextauth]/route.ts
$ grep -rn 'NEXT_PUBLIC' --include='*.ts' --include='*.tsx' . | grep -vc node_modules
0
```

**本側追加掃描（報告未涵蓋，據實補列）**：scratchpad 的 `*.txt` 留證檔中，
`D4-PASSED.txt` 與 `D5-PASSED.txt` 各有 **1 筆** 17–19 位數字：

```
$ grep -oE '[0-9]{17,19}' D4-PASSED.txt   → 000000000000000001
$ grep -oE '[0-9]{17,19}' D5-PASSED.txt   → 000000000000000001
$ grep -oE '[0-9]{17,19}' D4-PASSED.txt | grep -vc '^000000000000000001$'  → 0
$ grep -oE '[0-9]{17,19}' D5-PASSED.txt | grep -vc '^000000000000000001$'  → 0
```

⇒ **全部是 D2 刻意寫入的假值，⛔ 無真實 ID。** 報告的掃描表格範圍是 `*.log`，
⇒ 那張表本身⛔ 沒有錯，本項只是補齊 `*.txt` 的覆蓋。判定 ✅ 無外洩。

**`.env.local` 的遮罩檢查（⛔ 全程未輸出任何機密值）**：

```
$ grep -oE '^[A-Z_]+=' .env.local
ADMIN_DISCORD_ID=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
$ grep -c '^ADMIN_DISCORD_ID=' .env.local            → 1   （只有一份，差分對照的前提成立）
$ grep -qE '^ADMIN_DISCORD_ID=[0-9]{18}$' .env.local && echo true || echo false   → true
$ grep -qxF 'NEXTAUTH_URL=http://localhost:3100' .env.local && echo true || echo false   → true
$ grep -c $'\r' .env.local                            → 0   （⛔ 無 CRLF）
$ stat -f '%Sp %z bytes' .env.local                   → -rw------- 1095 bytes
$ wc -l < .env.local                                  → 21
```

**骨架檢查**（B1「骨架只有變數名」）：

```
$ grep -oE '^[A-Z_]+=' <scratchpad>/f1/env.local.skeleton
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
ADMIN_DISCORD_ID=
$ grep -cE '^[A-Z_]+=.+' <scratchpad>/f1/env.local.skeleton
0        ⇒ 五格皆⛔ 無值
```

---

### 群組 4 —— 負向對照是否真的存在且有效

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 4.1 | 四份 probe 落檔 `grep -c 'F1 admin probe'` = 0 | 逐檔重量 | 四檔皆 `0`（另 `C1-probe-response-2.txt` 亦為 0，共五檔） | ✅ 相符 |
| 4.2 | 對照：同字串在原始檔計數 = 1 | 用 `f1-probe-page.tsx.archived` 重量 | `1` ⇒ grep 樣式測得出來 ⇒ 四個 0 ⛔ 不是空測 | ✅ 相符（對照有效） |
| 4.3 | 對照的**耐久性** | 查該字串是否也在版控物中 | `docs/tasks/F1.md:274` 與 `F1-plan.md:126` 皆含 `<h1>F1 admin probe</h1>` ⇒ 對照來源進版控後**耐久**，⛔ 不只在 scratchpad | ✅（本側追加確認） |
| 4.4 | A1：fixture 與任務包**逐位元組**相同、251 bytes、sha `0ce5baf8…5b255b` | 從**版控物** `F1.md` 抽 271–278 行，與存檔副本 `diff` + `shasum` | `diff_exit=0`；兩者 sha 皆 `0ce5baf8b211a1f408cf442518eba88983e56ad0daa875ff349d6806659b255b`；皆 251 bytes | ✅ 相符（本側改用耐久來源重量） |
| 4.5 | `check-ignore --no-index` 正向命中 `.gitignore:33` | 實跑 | `.gitignore:33:.env*.local	.env.local` / `exit=0`；`sed -n '33p' .gitignore` → `.env*.local` | ✅ 相符 |
| 4.6 | 負向：`.env.local.f1-backup` ⛔ 不被擋 | 實跑 | `exit=1` ⇒ A5 附帶結論（備份必須放 scratchpad）成立 | ✅ 相符 |
| 4.7 | `git status \| grep -c 'env.local'` = 0 | 實跑 | `0`；另 `git ls-files --error-unmatch .env.local` → `did not match any file(s) known to git` / `exit=1` | ✅ 相符 |
| 4.8 | `git check-ignore` **不支援** `--exclude-from`，實測 exit=129 | 實跑 | `error: unknown option 'exclude-from=…'` / `exit=129` | ✅ 相符 |
| 4.9 | 改用 `-c core.excludesFile=` 重量**成立且結論不變** | 對已追蹤 `yarn.lock` 跑正負兩次 | 無 `--no-index` → `exit=1`（空測）；加 `--no-index` → 命中 `*lock*`、`exit=0` ⇒ 地雷第 5 條**確實重現** | ✅ 相符 |
| 4.10 | git 版本 2.47.1 | `git --version` | `git version 2.47.1` | ✅ 相符 |

```
$ head -1 A2-probe-response.txt;      grep -i '^location:' A2-probe-response.txt
HTTP/1.1 307 Temporary Redirect
location: /api/auth/error?error=Configuration
grep -c 'F1 admin probe' = 0

$ head -1 A3-probe-response.txt;      grep -i '^location:' A3-probe-response.txt
HTTP/1.1 307 Temporary Redirect
location: /api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe
grep -c 'F1 admin probe' = 0

$ head -1 C1-probe-response.txt;      grep -i '^location:' C1-probe-response.txt
HTTP/1.1 307 Temporary Redirect
location: /api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe
grep -c 'F1 admin probe' = 0

$ head -1 C1-probe-response-2.txt;    grep -i '^location:' C1-probe-response-2.txt
HTTP/1.1 307 Temporary Redirect
location: /api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe
grep -c 'F1 admin probe' = 0

$ head -1 D3-probe-anon.txt;          grep -i '^location:' D3-probe-anon.txt
HTTP/1.1 307 Temporary Redirect
location: /api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe
grep -c 'F1 admin probe' = 0

負向對照 $ grep -c 'F1 admin probe' f1-probe-page.tsx.archived
1

$ diff <(sed -n '271,278p' docs/tasks/F1.md) <scratchpad>/f1/f1-probe-page.tsx.archived; echo diff_exit=$?
diff_exit=0
$ sed -n '271,278p' docs/tasks/F1.md | shasum -a 256
0ce5baf8b211a1f408cf442518eba88983e56ad0daa875ff349d6806659b255b  -
$ shasum -a 256 f1-probe-page.tsx.archived
0ce5baf8b211a1f408cf442518eba88983e56ad0daa875ff349d6806659b255b  …/f1-probe-page.tsx.archived

$ git check-ignore --no-index -v .env.local
.gitignore:33:.env*.local	.env.local
exit=0
負向對照 $ git check-ignore --no-index -v .env.local.f1-backup
exit=1
$ git status --short | grep -c 'env.local'
0
$ git ls-files --error-unmatch .env.local
error: pathspec '.env.local' did not match any file(s) known to git
exit=1

$ git --version
git version 2.47.1
$ git check-ignore --exclude-from=<scratchpad>/f1/fake-excludes -v yarn.lock
error: unknown option `exclude-from=…'
usage: git check-ignore [<options>] <pathname>...
exit=129
$ git -c core.excludesFile=<scratchpad>/f1/fake-excludes check-ignore -v yarn.lock
exit=1                       ← 空測：規則命中卻回報「不忽略」
$ git -c core.excludesFile=<scratchpad>/f1/fake-excludes check-ignore --no-index -v yarn.lock
…/fake-excludes:1:*lock*	yarn.lock
exit=0                       ← 加 --no-index 才測得出來
```

---

### 群組 5 —— D4 的隱含假設是否誠實標註

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 5.1 | 報告⛔ 未把 D4 寫成無條件鐵證 | 逐字讀 `F1-verification.md:179-195`、`523`、`658` | 有專屬 `⚠️⚠️ D4 的隱含假設 —— ⛔ 不得寫成無條件鐵證` 引言框；E2E 表 D4 列標「⚠️ **附 session 存續假設**」；「未涵蓋」第 2 條再列一次 —— **三處**均未寫成鐵證 | ✅ 相符 |
| 5.2 | 明列排除 (ii) 的依據（C3/D4 時間相鄰 + 架構師確認未登出未關視窗 + 同視窗未清 cookie） | 同上 | 三條依據逐條列出，且明寫「排除 (ii) 的依據只有三條**間接**證據」 | ✅ 相符 |
| 5.3 | 明說 `/api/auth/session` 在正向情境屬禁區 | 同上 | 逐字寫出，理由為鐵則 1 | ✅ 相符 |
| 5.4 | 結論措辭為「差分佐證」而非「直接證明」 | 同上 | 逐字如此 | ✅ 相符 |
| 5.5 | D4 客觀佐證：`D-devserver.log` ⛔ 從未編譯 `/admin/f1-probe`（含負向對照） | 本側重量兩份 log | `grep -c 'admin/f1-probe' D-devserver.log` = **0**；負向對照 `C-devserver-2.log` = **1** ⇒ 對照有效 | ✅ 相符 |
| 5.6 | 「誠實修正 ①」：該 log 另有 `/not-found` | 本側重量 | `Compiled /` / `Compiled /api/auth/[...nextauth]` / `Compiled /middleware` / `Compiled /not-found` / `Compiling /` —— **確實有 `/not-found`**，報告的自我修正正確 | ✅ 相符 |
| 5.7 | 差分邏輯的**未言明前提**：fixture 在 D3–D5 期間仍存在 | 報告全文 grep + 自行從 mtime 重建時間軸 | 報告**⛔ 未陳述亦未舉證**此前提。本側重建：C-devserver-2 於 `00:01:21` 結束（`Done in 553.31s` ⇒ 起於 ~23:52:08）；D-devserver 於 `00:08:29` 結束（`Done in 427.68s` ⇒ 起於 ~00:01:21）；`D4-PASSED.txt` mtime `00:05:42`（落在 D server 存續區間內）；`E3-install.log` mtime `00:08:43` ⇒ **E2 刪除發生於 00:08:29–00:08:43**，即 D 全部步驟之後 ⇒ **前提成立** | ⚠️ 見必改 2 |

```
$ grep -oE '(Compiling|Compiled) [^ ]+' D-devserver.log | sort -u
Compiled /
Compiled /api/auth/[...nextauth]
Compiled /middleware
Compiled /not-found
Compiling /
$ grep -c 'admin/f1-probe' D-devserver.log
0
負向對照 $ grep -c 'admin/f1-probe' C-devserver-2.log
1
（C-devserver-2.log 逐字含：` ✓ Compiled /admin/f1-probe in 134ms (806 modules)`）

$ grep -H 'Done in' C-devserver-2.log D-devserver.log
C-devserver-2.log:Done in 553.31s.
D-devserver.log:Done in 427.68s.
$ stat -f '%Sm  %N' -t '%Y-%m-%d %H:%M:%S' …（節錄，依時間排序）
2026-09-04 00:01:21  C-devserver-2.log
2026-09-04 00:01:21  C3-PASSED.txt
2026-09-04 00:01:56  D3-probe-anon.txt
2026-09-04 00:05:42  D4-PASSED.txt
2026-09-04 00:08:29  D-devserver.log
2026-09-04 00:08:29  D5-PASSED.txt
2026-09-04 00:08:43  E3-install.log
```

⇒ 附帶量出：**C3 通過（00:01:21）與 D4（00:05:42）相距約 4 分 21 秒** ——
報告「時間相鄰（分鐘級）」為事實，本側把它量成了數字。
⚠️ 但這條時間軸**只存在於 scratchpad 的 mtime**（會隨 session 消失）⇒ 見必改 2。

---

### 群組 6 —— D6 還原的證明力

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 6.1 | `.env.local` md5 = `91a29db3359bbca9e7aa96b608e8fdd0` | `md5 -q` | `91a29db3359bbca9e7aa96b608e8fdd0` | ✅ 相符 |
| 6.2 | D1 備份 md5 同值 | `md5 -q` | `91a29db3359bbca9e7aa96b608e8fdd0` | ✅ 相符 |
| 6.3 | `diff -q` exit 0 | 實跑 | `diff_exit=0` | ✅ 相符 |
| 6.4 | `ADMIN_DISCORD_ID` 回為 18 位純數字、權限 600 | 布林 grep + `stat` | `true`；`-rw------- 1095 bytes` | ✅ 相符 |
| 6.5 | 報告誠實說明「D6 只證明**檔案內容**還原，⛔ 不證明**環境可通行**」 | 逐字讀 `F1-verification.md:655-657` | 逐字為「D6 的 `diff` exit 0 + md5 回到原值只證明**檔案內容**還原，⛔ 不證明**執行環境**在還原後仍如 C3 般可通行」 | ✅ 相符 |
| 6.6 | D7 標「未做」是架構師定案 | 讀 `F1-plan-review.md` Q2 與報告 D7 列 | plan-review Q2 建議「做」；報告記「經回報後架構師維持原裁決 ⇒ 定案」並在「未涵蓋」第 1 條列出代價 —— 記錄一致 | ✅ 相符 |
| 6.7 | 還原⛔ 未用 `git checkout` | 報告自述 + 現場反證 | 若曾 `git checkout`，三個舊 modified（mtime 2026-03-28）會被清掉；現場三檔仍 modified 且 mtime 未變 ⇒ 客觀支持 | ✅ 相符（本側追加證據） |

```
$ md5 -q .env.local
91a29db3359bbca9e7aa96b608e8fdd0
$ md5 -q <scratchpad>/f1/env.local.D1-backup
91a29db3359bbca9e7aa96b608e8fdd0
$ diff -q <scratchpad>/f1/env.local.D1-backup .env.local; echo diff_exit=$?
diff_exit=0
$ grep -qE '^ADMIN_DISCORD_ID=[0-9]{18}$' .env.local && echo true || echo false
true
$ stat -f '%Sp %z bytes' .env.local
-rw------- 1095 bytes
```

---

### 群組 7 —— `yarn build` 產物

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 7.1 | `yarn build` exit 0 | **本側自跑一次** | `BUILD_EXIT=0`、`Done in 8.86s.` | ✅ 相符 |
| 7.2 | route 表 **12 列**（含 `/_not-found`） | 對 `E3-build.log` 與**本側新 build** 各數一次 | 兩者皆 `12` | ✅ 相符 |
| 7.3 | λ = 2、○ = 10 | 同上 | 兩者皆 `2` / `10` | ✅ 相符 |
| 7.4 | `Generating static pages (13/13)` 是另一個內部計數、⛔ 不等於表項數 | 對 `E3-build.log` 全文 | log 中確有 `(0/13) (3/13) (6/13) (9/13) (13/13)` 進度序列，與 route 表的 12 列**分屬兩處輸出** ⇒ 報告的釐清正確 | ✅ 相符 |
| 7.5 | 產物中⛔ 無 `/admin` 路由 | `grep -c 'admin'` E3-build.log + 讀本側新 build 的 manifest | `E3-build.log` admin 出現 **0** 次；`.next/app-path-routes-manifest.json` 共 **12** 項、⛔ 無任何 `/admin` | ✅ 相符（本側加驗 manifest） |

```
$ grep -cE '^[┌├└]' E3-build.log        → 12
$ grep -cE '^[┌├└] λ' E3-build.log      →  2
$ grep -cE '^[┌├└] ○' E3-build.log      → 10
$ grep -c 'admin' E3-build.log          →  0

本側自跑：
$ yarn build 2>&1 | tail -45
...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
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


ƒ Middleware                             74.9 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand using Node.js

Done in 8.86s.

$ yarn build > /dev/null 2>&1; echo BUILD_EXIT=$?
BUILD_EXIT=0

$ cat .next/app-path-routes-manifest.json
{"/_not-found":"/_not-found","/api/auth/[...nextauth]/route":"/api/auth/[...nextauth]","/apply/page":"/apply","/donate/page":"/donate","/api/apply/route":"/api/apply","/modServer/page":"/modServer","/launcher/page":"/launcher","/page":"/","/sponsor/page":"/sponsor","/staff/page":"/staff","/voteModpack/page":"/voteModpack","/team/page":"/team"}
⇒ 12 項，⛔ 無 /admin
```

⚠️ **一項無害差異（⛔ 不是報告的錯）**：本側新 build 的 `ƒ Middleware` 為 **74.9 kB**，
`E3-build.log` 為 **74.8 kB**。本側已確認 `E3-build.log` 內逐字就是 74.8 kB
⇒ 差異來自兩次不同的 build run（次數級抖動），⛔ 不是報告轉抄錯誤。

⚠️ **措辭精確度（→ 報告更正）**：報告該區塊標題為「**`yarn build` 逐字末段**」，
但貼出的內容**省略了 3 行 `chunks/…` 與 `○ (Static)` / `λ (Dynamic)` 圖例**、且未加省略記號。
數值本身⛔ 無誤，但在本 repo「逐字」是承重詞。

---

### 群組 8 —— 架構師口頭回報的處理 + 真機步驟

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 8.1 | 報告把 C2/C3/D4/D5 標為口頭回報、⛔ 未混充為 Claude 量測 | 逐字讀報告頁首分工聲明、N1/N2/N3 各節、E2E 表、「未涵蓋」第 8 條 | 頁首逐字「真機步驟（C2／C3／D4／D5）由**架構師 Yu 本人**在主迴圈逐步領路下操作」；C2 標「（架構師口述；⚠️ 本輪未重量——真機步驟。）」；D4/D5 標「（架構師）」「架構師逐字回」；「未涵蓋」第 8 條再宣告一次 | ✅ 相符 |
| 8.2 | C3 首次失敗（Discord 回「無效的 OAuth2 redirect_uri」）據實記錄、⛔ 未隱瞞 | 對 `C3-attempt1-FAILED.txt` 逐字比對報告引用 | 留證檔逐字含該句；報告在「正向流程」表、逐字記錄區塊、E2E 表 C3 列、P2 列、「未涵蓋」第 4 條 —— **五處**都記了這次失敗 | ✅ 相符 |
| 8.3 | 後續補正據實記錄、Claude ⛔ 未代改後台 | 同上 + `F1-plan.md:428` P2 列 | 留證檔逐字「Claude ⛔ 未代改後台」；plan v3 的 P2 列亦記「分兩次：2026-09-02 先加 3000；埠改 3100 後 C3 首試失敗，架構師本人於 2026-09-04 補加 3100」 | ✅ 相符 |
| 8.4 | B2 的一次修正（secret 長度 70 → 32）據實記錄 | 讀報告 §B2 | 逐字記錄往返，並明寫「⛔ 不美化成『一次填對』」；⛔ 未輸出任何字元 | ✅ 相符 |
| 8.5 | P2 Claude 端⛔ 無法獨立複驗 | 本側嘗試 | 本側同樣⛔ 無法查 Discord 後台 ⇒ 報告的自我限縮正確 | ✅ 相符 |

```
$ cat C3-attempt1-FAILED.txt
C3 首次嘗試 = 失敗
Discord 回應：無效的 OAuth2 redirect_uri（中文介面）
判定：P2（後台 redirect URI 註冊）尚未生效於本 client_id
處置：依 plan §1 / C3「若卡在 OAuth」條款停手回報架構師，Claude ⛔ 未代改後台
時間：2026-09-03

$ cat C3-PASSED.txt
C3 = 通過（2026-09-04）
證據：Yu 本人 OAuth 登入後，無痕視窗 localhost:3100/admin/f1-probe 顯示 probe 頁
probe 頁內文：看得到這頁 = middleware 已放行（token.sub 符合 ADMIN_DISCORD_ID）
⚠️ 截圖含 Yu 的 Discord 頭像 ⇒ 依 plan C2/C3 遮蔽條款，報告以文字記錄，⛔ 不附原圖
⚠️ 首次嘗試曾失敗（Discord 回「無效的 OAuth2 redirect_uri」），Yu 於後台補正後重試成功 —— 見 C3-attempt1-FAILED.txt

$ cat D5-PASSED.txt
D5 = 通過（2026-09-04）
設定：ADMIN_DISCORD_ID 仍為假值 000000000000000001
Yu 操作：/api/auth/signout 登出 → 重新 Sign in with Discord（本人帳號）
Yu 回報：/api/auth/session = 「空」（逐字回覆：空）
判準（依 plan）：未建立 session ⇒ signIn callback 的 profile.id !== ADMIN_DISCORD_ID 分支確實生效
⚠️ 依 plan 禁區條款：⛔ 未取得、⛔ 未記錄任何 session 原文或 Discord ID（含雜湊、含遮罩）
⚠️ 登入失敗導向 /auth/error 為 404 —— 主迴圈於 D5 前已實測留證（狀態碼 404），
   屬裁決 4甲 的已知現況，⛔ 不算 F1 失敗；⛔ 本任務未修。
```

⇒ 留證檔內容與報告陳述**逐句對得上**，⛔ 無隱瞞、⛔ 無美化。

---

### 群組 9 —— 報告自認「本輪未重量」的五項：本側**補量**

報告「未涵蓋」第 7 條列了五項未重量。本側啟一次 `yarn dev -p 3100` 補量四項（跑完已停，附證明）：

| # | 聲稱（報告記為主迴圈實測） | 本側實測 | 判定 |
|---|---|---|---|
| 9.1 | E4 九頁全部 `200` | 九頁全部 `200` | ✅ 相符 |
| 9.2 | 已刪路由 `/admin/f1-probe` 回 **307**、⛔ 不是 404 | `307` → `/api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe`、body `grep -c` = 0 | ✅ 相符 |
| 9.3 | `/auth/error` 為 **404**（裁決 4甲 已知現況） | `404` | ✅ 相符 |
| 9.4 | `/api/auth/providers` 的 `callbackUrl` = `http://localhost:3100/api/auth/callback/discord` | 逐字相同 | ✅ 相符 |
| 9.5 | D2 假值狀態下的 `.env.local` md5 = `f20669bb1094f2081803b92734b2fd2a` | **⛔ 未能獨立重量** —— 該狀態已於 D6 還原、⛔ 不可重現；且重現需改 `.env.local`（本側禁區） | ⛔ 未能獨立重量 |

```
$ lsof -nP -iTCP:3100 -sTCP:LISTEN | wc -l      → 0   （起跑前）
$ pgrep -f 'next dev' | wc -l                    → 0   （起跑前）
$ yarn dev -p 3100 &  （背景）

PAGE / CODE 200
PAGE /apply CODE 200
PAGE /launcher CODE 200
PAGE /modServer CODE 200
PAGE /staff CODE 200
PAGE /team CODE 200
PAGE /sponsor CODE 200
PAGE /donate CODE 200
PAGE /voteModpack CODE 200

$ curl -sI http://localhost:3100/admin/f1-probe | head -2
HTTP/1.1 307 Temporary Redirect
location: /api/auth/signin?callbackUrl=%2Fadmin%2Ff1-probe
$ curl -s http://localhost:3100/admin/f1-probe | grep -c 'F1 admin probe'
0

$ curl -s -o /dev/null -w 'status=%{http_code}' http://localhost:3100/auth/error
status=404

$ curl -s http://localhost:3100/api/auth/providers
{"discord":{"id":"discord","name":"Discord","type":"oauth","signinUrl":"http://localhost:3100/api/auth/signin/discord","callbackUrl":"http://localhost:3100/api/auth/callback/discord"}}
```

**本側追加的負向對照（報告的「307 是路徑空間保護」附帶發現，需要它才不是空測）**：

```
$ curl -s -o /dev/null -w 'status=%{http_code} redirect=%{redirect_url}' http://localhost:3100/admin/nonexistent-xyz
status=307 redirect=http://localhost:3100/api/auth/signin?callbackUrl=%2Fadmin%2Fnonexistent-xyz
        ← /admin 底下任一不存在路徑也是 307

負向對照 $ curl -s -o /dev/null -w 'status=%{http_code}' http://localhost:3100/nonexistent-xyz
status=404
        ← ⚠️ 非 /admin 的不存在路徑是 404 ⇒ 307 確實由 matcher ["/admin/:path*"] 造成，
          ⛔ 不是本站對所有 404 的通用行為 ⇒ 報告的「守的是路徑空間」結論成立
```

**停機證明**：

```
$ pkill -f 'next dev'
$ lsof -nP -iTCP:3100 -sTCP:LISTEN | wc -l      → 0
$ pgrep -f 'next dev' | wc -l                    → 0
$ curl --max-time 3 http://localhost:3100/ ; echo curl_exit=$?
curl_exit=7                                       ← Couldn't connect ⇒ 已停
$ git status --short                              → 與稽核開始時逐字相同
```

⇒ 報告 E1 列「lsof 0 行、`pgrep -fl 'next dev'` 0 個」本側**前後各量一次皆為 0**。✅

---

### 群組 10 —— 其餘散項

| # | 聲稱 | 本側怎麼查 | 實測結果 | 判定 |
|---|---|---|---|---|
| 10.1 | A2/A3 實際跑在 3002、成因是 3000/3001 被別的專案 Docker 佔用 | 讀兩份 log | 兩份逐字皆有 `Port 3000 is in use, trying 3001 instead.` / `Port 3001 is in use, trying 3002 instead.` / `- Local: http://localhost:3002` | ✅ 相符 |
| 10.2 | A2 有 `[next-auth][error][NO_SECRET]` | `grep` | `A2-devserver.log` 逐字含 `[next-auth][error][NO_SECRET]` | ✅ 相符 |
| 10.3 | 「plan 原列 500 為可能之一 —— 實測不成立，兩種情境都是 307」 | 讀兩份落檔狀態行 | 皆 `307`，差別只在 location ⇒ 據實記錄、⛔ 未套用 plan 預期值 | ✅ 相符 |
| 10.4 | 「C 之後各 phase 的 log **首行**皆為 `$ next dev -p 3100`」 | 逐檔 `head` | 該字串實際在**第 3 行**（第 1 行 `yarn run v1.22.18`、第 2 行 license warning）；`-p 3100` 與 `Local: http://localhost:3100` 本身**確實存在**於 C/D/E4 三份 log | ⚠️ 措辭不精確（實質為真） |
| 10.5 | 本 repo 無測試框架（`package.json` 無 test script） | `grep -c '"test"'` | `0` | ✅ 相符 |
| 10.6 | 鐵則 2：middleware 與 auth route 一個字都沒改；行號引用正確 | `cat -n` 兩檔 | `middleware.ts:13` = `return !!token && token.sub === process.env.ADMIN_DISCORD_ID`；`route.ts:16-19` = `if (profile?.id === adminId) { return true; } return false;` ⇒ 引用**行號與內容皆正確** | ✅ 相符 |
| 10.7 | `.env.local` 只有**一份** `ADMIN_DISCORD_ID`（差分對照的前提） | `grep -c` | `1` | ✅ 相符 |
| 10.8 | ⛔ 未建 `.evidence/`（裁決 Q3） | `ls -ld` | `ls: .evidence: No such file or directory`；且 `F1-plan-review.md` Q3 逐字認可此做法、`WORKFLOW.md` 第五節要求的是「關鍵行貼進 verification」 | ✅ 相符 |
| 10.9 | plan v3 埠號全案改 3100 | `grep -c` | `localhost:3100` 13 處；`localhost:3000` 僅 **1** 處（`F1-plan.md:78`），內容是「2026-09-02 當時註冊的是 3000 那條」的歷史記錄 ⇒ ⛔ 不是漏改 | ✅ 相符 |

#### 證據耐久性專項判定（稽核側硬紀律）

本 repo 經架構師裁決（`F1-plan-review.md` Q3 + `WORKFLOW.md` 第五節）**⛔ 不建 `.evidence/`**，
耐久物 = **貼進進版控的 `verification.md` 的關鍵行**。依此標準逐項核：

- ✅ **耐久**：實碼零 diff、`git status`／`diff --stat`、`find app`、build route 表、
  lint 空測全鏈證據、`.gitignore` 正負對照、`.env.local` md5／diff／權限、
  四份 probe 落檔的狀態行與 `grep -c`、`D-devserver.log` 的 compile 清單與負向對照、
  `E4-devserver.log` 的 compile 清單、C3 首次失敗逐字 —— **關鍵行都貼進報告本文**。
- ✅ **耐久**：負向對照字串 `F1 admin probe` 的來源不只在 scratchpad
  （`F1.md:274`、`F1-plan.md:126` 均含，且本側已驗與存檔副本逐位元組相同）。
- ⚠️ **不耐久（→ 必改 2 / 報告更正）**：E4 的九個 `200`、已刪路由的 `307`、
  `/auth/error` 的 `404`、`/api/auth/providers` 的 `callbackUrl`
  —— 這四項的**原始輸出既不在報告、也不在 scratchpad 落檔**，
  報告只有一句「主迴圈實測、本輪未重量」。⚠️ 本側已於群組 9 全數補量並把原始輸出貼進**本檔**
  ⇒ 缺口已補，但報告**當時提交的形態**確實引用了未落檔的終端輸出。
- ⚠️ **不耐久（→ 必改 2）**：支撐 D4 差分邏輯的時間軸（fixture 於 D3–D5 期間仍存在、
  C3→D4 相隔 4 分 21 秒）只能由 **scratchpad 的 mtime** 推出。本側已把該時間軸貼進本檔。
- ⛔ **無耐久物**：D2 假值狀態的 md5 `f20669bb…`（狀態已還原，⛔ 永久不可重現）。

---

## ⛔ 必改（收案前修正；均為**文字級**，⛔ 不需改實碼、⛔ 不需重跑測試）

1. **`F1-verification.md` §「待處理／建議另立任務」第二節（615–621 行）的前提為偽。**
   現行文字：「F2／F4 的驗收報告**若曾**以 `yarn lint` exit 0 作為佐證，該佐證的證明力受本發現影響」。
   **實查**：`docs/tasks/archive/F2-verification.md:633` 逐字寫 `yarn lint --max-warnings 0` → **⛔ 未跑**
   （架構師 2026-08-30 明確豁免）；`archive/F4-verification.md:380` 逐字寫
   **⛔ 未跑，經架構師 2026-08-31 明確豁免**。
   ⇒ **兩份已收案報告都從來沒有把 lint exit 0 當佐證** ⇒ 實際受影響的佐證是 **0 件**。
   **修法（定案，⛔ 不必回迴圈）**：把該節條件句改為據實陳述 ——
   「本側實查 `archive/F2-verification.md:633` 與 `archive/F4-verification.md:380`：
   兩案的 `yarn lint --max-warnings 0` 皆經架構師明確豁免、**⛔ 從未執行**
   ⇒ ⛔ **沒有**已收案的 lint 佐證受本發現影響。架構師 2026-09-04 裁定的
   『證明力受本發現影響，但不回頭改已收案文件』**維持有效**，適用對象為**日後**引用該指令的報告。」
   ⚠️ 這一改**⛔ 不放寬也⛔ 不加重**架構師的裁定，只是把它掛在正確的事實上；
   ⚠️ 它會直接改變主迴圈要記進 backlog 的那一行怎麼寫 ⇒ **必須在收案前定案**。

2. **`F1-verification.md` §「測試結果 N2」需補一句 D4 的未言明前提 + 其證據的耐久性缺口。**
   D4 的差分邏輯（「token 不變、僅 `ADMIN_DISCORD_ID` 改變 ⇒ 由放行翻為擋下」）
   **隱含一個報告全文未陳述的前提**：臨時 fixture 在 D3–D5 期間**仍然存在**。
   ⚠️ 若 fixture 在 D4 之前就已刪除，`307` 會被「頁面不存在 + middleware 攔截路徑空間」
   完全解釋掉（報告自己的附帶發現正好證明了這一點）⇒ 差分結論會失去效力。
   **實查（本側，證據來源為 scratchpad mtime ⇒ ⛔ 不耐久）**：
   D dev server 存續 `00:01:21`–`00:08:29`；`D4-PASSED.txt` mtime `00:05:42`（在區間內）；
   `E3-install.log` mtime `00:08:43` ⇒ E2 刪除發生於 `00:08:29`–`00:08:43`，**在 D 全部步驟之後**
   ⇒ **前提成立**。
   **修法（定案）**：在 N2 的 ⚠️⚠️ 框內補列第 ④ 條依據 ——
   「④ fixture 於 D3–D5 全程仍在（E2 刪除發生於 D dev server 停止之後）。
   ⚠️ 此點的直接證據為 scratchpad 檔案時序，**存在但⛔ 不具耐久性**」，
   並把上列三個時間點抄進報告本文（依 `WORKFLOW.md` 第五節：只存在於 scratchpad
   的證據⛔ 不得寫成「不存在」，須據實寫「存在但不耐久」）。
   ⚠️ 同一節請一併把群組 9 補量到的四項原始輸出（九個 `200`、`307` + location、
   `404`、`callbackUrl`）抄進報告 ——⚠️ 它們目前**既不在報告也不在落檔**。

3. **`F1-verification.md` §「未違反鐵則」表格「鐵則 5」列措辭過寬。**
   現行：`✅ ⛔ 未動 data/、⛔ 未動任何元件`。
   **實查**：`git diff --stat -- data/ components/` → `data/` **零筆**（相符），
   但 `components/ServerSection.tsx` 在工作樹中**是 modified**（88+/85-）。
   本側已以 mtime 佐證該改動是 F1 前就存在的舊債（`2026-03-28 00:52:00`，早於 F1 五個月）
   ⇒ **F1 確實沒動它**，但只讀這一列的人會與 `git status` 對撞。
   **修法（定案）**：該列改為
   `✅ data/ 零 diff（git diff --stat -- data/ 零筆）；components/ 僅 ServerSection.tsx 為 F1 前既存的舊改動（地雷第 6 條，mtime 2026-03-28），F1 ⛔ 未動任何元件`。

---

## 報告更正（文字級，隨修正一併更新 verification）

- §「產物重建」的「**`yarn build` 逐字末段**」：實際貼出的內容**省略了 3 行 `chunks/…`
  與 `○ (Static)` / `λ (Dynamic)` 圖例**且未加省略記號。數值⛔ 無誤，
  但「逐字」在本 repo 是承重詞 ⇒ 建議改標「**節錄（省略 chunks 明細與圖例）**」，
  或補上完整末段。本側已在群組 7 貼出未省略版本。
- §「設計重點 1」：「C 之後各 phase 的 log **首行**皆為 `$ next dev -p 3100`」——
  該字串實際位於**第 3 行**（第 1、2 行為 `yarn run v1.22.18` 與 license warning）。
  ⇒ 建議改「起始數行含」。實質為真，僅措辭。
- §「審計確認 A」的機密掃描表範圍是 `*.log`（10 檔，本側逐格重量全符）。
  本側追加掃描 `*.txt` 留證檔，發現 `D4-PASSED.txt` / `D5-PASSED.txt` 各含 1 筆
  17–19 位數字，**經逐一比對確認 100% 是 D2 的假值 `000000000000000001`**。
  ⇒ ⛔ 無外洩，建議在該節補一句把 `*.txt` 也納入宣告範圍。
- 本側新 build 的 `ƒ Middleware` = **74.9 kB**，`E3-build.log` = **74.8 kB**。
  已確認 `E3-build.log` 內逐字就是 74.8 kB ⇒ 差異來自不同 build run，
  ⛔ **不是報告轉抄錯誤**，⛔ 不需更正；在此留痕以免日後被誤認為不符。

---

## 追認（計畫差異；均說明為何認可）

1. **A2/A3 跑在 3002 而非 3100** —— 認可。兩者執行於埠裁決之前，只驗情境 (a)、⛔ 不涉 OAuth 回跳；
   報告以「例外（歷史事實，⛔ 不改寫）」據實標明，⛔ 未回頭改寫歷史。本側確認兩份 log 逐字皆為 3002。
2. **plan 原列「500」未成立，實測皆為 307** —— 認可。報告據實記錄「⛔ 不套用 plan 的預期值」，
   本側重量兩份落檔狀態行皆 `307`。這是正確的處理方向。
3. **`git check-ignore` 改用 `-c core.excludesFile=` 而非原始旗標** —— 認可。
   本側實測 `--exclude-from` 確實 `exit=129`（不支援），替代做法能**同時**重現空測（exit=1）
   與正確測法（exit=0）⇒ 地雷第 5 條**確實被重現**、結論不變。
   報告自承「原始執行用的旗標本側無法確認」，此誠實標註本側認可。
4. **D7 未做** —— 認可為架構師定案。`F1-plan-review.md` Q2 建議「做」，架構師維持不做；
   報告在 E2E 表與「未涵蓋」第 1 條把代價（缺少「還原確實生效」的直接證據）寫清楚
   ⇒ 符合任務交辦的「標『未做』是正確的」。
5. **⛔ 不建 `.evidence/`** —— 認可。`F1-plan-review.md` Q3 已裁定，
   且與 `WORKFLOW.md` 第五節（耐久物 = 貼進報告的關鍵行）一致；
   本側據此把「貼進進版控報告」視同耐久，僅對**未貼進報告**的四項判 ⚠️（見必改 2）。
6. **`yarn lint` 空測⛔ 未順手修** —— 認可。符合開發守則第 1 條與架構師 2026-09-04 裁「甲」
   （另立 backlog 任務）。本側確認工作樹在稽核前後皆**⛔ 無任何 ESLint 設定檔**，
   ⇒ 報告確實⛔ 沒有偷偷補上。
7. **`WORKFLOW.md` 的 modified 不計入 F1** —— 認可。本側查該檔 diff 中
   `F1`／`f1-probe`／`3100` 出現 **0** 次、新增節為「檔案管道(五件套)」
   ⇒ 與 F1 無關；且報告在**三處**披露其存在與行數 ⇒ ⛔ 無隱瞞。

---

## ⛔ 未能獨立重量（附原因，⛔ 不得視為已核）

| # | 項目 | 原因 |
|---|---|---|
| 1 | `yarn install --frozen-lockfile` 的 exit 0 與 `Done in 0.60s.` | **`audit-write-guard` 阻擋 install 類指令**（逐字：「偵測到檔案改動類指令」）⇒ 稽核側⛔ 無法自跑。⚠️ 其**衍生結論已獨立重量**：`yarn.lock` sha256 前後同值、`package-lock.json` 不存在（`ls_exit=1`）；`E3-install.log` 內容本側已逐字讀過。 |
| 2 | D2 假值狀態的 `.env.local` md5 `f20669bb1094f2081803b92734b2fd2a` | 該狀態已於 D6 還原、**⛔ 永久不可重現**；重現需改 `.env.local`（本側禁區，內含架構師真實憑證）。報告已自標「主迴圈實測值，本輪⛔ 未重量」。 |
| 3 | C2 / C3 / D4 / D5 的真機瀏覽器結果 | 真機 OAuth 步驟**本質上不可由 Claude 執行**（需架構師本人的 Discord 帳號）。本側僅能核對**留證檔與報告陳述是否一致**（已核，逐句相符）與**客觀側證**（D-devserver.log 差分、C-devserver-2.log 的 `Compiled /admin/f1-probe`）。 |
| 4 | P2（Discord 開發者後台的 redirect URI 註冊狀態） | 稽核側同樣⛔ 無法登入該後台。僅能核對間接實測（C3 首試回「無效的 OAuth2 redirect_uri」→ 補正後通過）—— 報告的自我限縮「⛔ 不得寫成『已驗證後台設定』」本側認可。 |
| 5 | 任何需要**臨時 fixture 存在**才能量的正向聲稱（例：C3 放行時 probe 頁的實際 body） | **重建 `app/admin/f1-probe/page.tsx` 會破壞裁決 3甲 的「淨變動為零」** ⇒ 本側依交辦一律⛔ 不重建。替代：已從**版控物** `F1.md:271-278` 抽出並驗與存檔副本逐位元組相同（sha `0ce5baf8…5b255b`、251 bytes）。 |
| 6 | `git tag` 列表 | `audit-write-guard` 阻擋 `git tag`（可建 tag）。⚠️ 已改用**唯讀替代**：`.git/refs/tags` 為**空目錄**、`.git/packed-refs` 內 `refs/tags` 零筆 ⇒ 「⛔ 未打任何 tag」**已獨立確認**。 |

---

## carryover 對號

報告 §carryover 五條，本側逐條核對後對號如下（⚠️ **登記動作由主迴圈執行**，稽核側⛔ 不代登記）：

1. **ESLint 設定缺失 ⇒ `next lint` 空測** —— ✅ 本側**獨立重跑完全重現**（見群組 1）。
   ⚠️ 登記文字須採必改 1 的更正版（受影響的已收案佐證 = **0 件**）。
   ⚠️ 報告要求「新任務須驗證 `next lint` **真的會 fail**」——本側認可且強調：
   本次成因正是 **exit 0 ≠ 有 lint**，故新任務⛔ 不得只看退出碼。
2. **F2／F4 報告的 lint 佐證證明力受影響** —— ⚠️ **需依必改 1 改寫**：
   實查兩份報告**皆⛔ 未跑 lint**（明確豁免）⇒ 無實際受影響的佐證。
   架構師「⛔ 不回頭改已收案文件」的裁定不受影響、繼續有效。
3. **`CLAUDE.md` 地雷清單第 1 條的改寫** —— ✅ 本側確認報告的事實基礎正確：
   前半（`app/` 底下無 `admin/`）本側 `find` 零輸出**仍為事實**；
   後半（保護是否有效）已由實測支持，且範圍是**路徑空間**
   ——本側以「非 `/admin` 的不存在路徑回 404、`/admin/*` 回 307」的負向對照獨立確認。
   ⚠️ 改寫文字由主迴圈於收案時決定，稽核側⛔ 不代寫。
4. **`/auth/error` 404** —— ✅ 本側**獨立重量為 404**；`route.ts:30` 逐字為
   `error: '/auth/error', // 登入失敗導向` 而 `app/` 底下無該路由 ⇒ 成因明確。
   屬裁決 4甲 已知現況，是否另立任務由架構師決定。
5. **`.env.local` 保留在硬碟** —— ✅ 本側確認：存在、權限 `600`、1095 bytes、
   被 `.gitignore:33:.env*.local` 擋住（`--no-index` 正向命中 + 負向對照 exit 1）、
   `git status` 看不到（`grep -c` = 0）、`git ls-files` 不認識它。
   ⚠️ 埠與 Discord 後台 redirect URI 的連動提醒本側認可（⛔ 只有架構師本人能改後台）。

---

## 修畢後的回報格式

- 貼：三處文字更正的段落前後對照、以及被補進報告的原始輸出清單
  （九個 `200`、`307` + location、`404`、`callbackUrl`、D3–D5 時間軸三個時間點）。
- ⛔ **不需要重跑任何測試**——三項必改皆為文字級，⛔ 不涉實碼、⛔ 不涉產物。
- ⛔ **commit/push 仍待架構師確認。** 本稽核報告與其中任何措辭
  ⛔ **均不構成 commit/push 預授權**；`git add` 時仍須**逐檔 add**（⛔ 不用 `git add .`
  —— 地雷第 6 條，工作樹仍帶三個 F1 前的舊 modified）。
