# 審計：F2 驗收報告（`docs/tasks/F2-verification.md`）

> 稽核側（`nr-auditor`）產出。審計對象：`docs/tasks/F2-verification.md`。
> ⛔ **不信報告自述**：本檔每一條結論均由稽核側**自行實跑取證**，輸出逐字貼於下方。
> ⛔ 報告給的數字、任務包給的數字、派工訊息給的數字，**一律未轉抄**——全部重量一次。
> ⛔ 本檔任何措辭均不構成 commit / push 預授權。

- **稽核日期**：2026-08-31
- **稽核時 HEAD**：`f9696a2ec77b623e0ace6009748e366f645d4756`（稽核側自行 `git rev-parse HEAD`）
- **分支**：`developers`
- **稽核側對現場為唯讀**：全程未 `add` / `commit` / `push` / `checkout` / `reset` / `stash`，
  未改任何 repo 檔案。唯一寫入為本檔。
  ⚠️ 唯一有副作用的動作是**依派工要求實跑 `yarn build` 三次**（只寫 `.next/`，為被忽略的建置產物）。

---

## 審計結論

**✅ 通過** —— 任務包 9 條驗收準則 + plan 加的 3 條加強，稽核側**逐條獨立實跑，全部相符**；
鐵則 1 的 `.env` / `.vscode` 保護以**正面命中證據**確認零退步；報告自陳的三處異常（甲 / 乙 / 丙）
稽核側獨立複驗**全部成立**，其中「Middleware 74.9→74.8 與本任務無關」由稽核側在**同一份
`.gitignore` 狀態下連跑三次 build 重現跳動**，屬正面重現，⛔ 非採信報告說法。

**⛔ 未發現任何以預期值 / plan 預演值 / 設計推理冒充已執行的段落。** 報告對「待人工 / 未跑」
的三項（第 8 條後半、`yarn lint`、`yarn install --frozen-lockfile`）均據實標示，⛔ 未偽稱已驗。

⚠️ 通過**但有 2 項證據耐久性事項**與 1 項文字級事項需架構師裁決 / 知悉，列於後段，
⛔ 不影響本次技術結論的成立。

---

## 一、任務包 9 條驗收準則 —— 稽核側逐條實跑

### 準則 1：`git ls-files web.log` → 無輸出

稽核側實跑：

```
$ out=$(git ls-files web.log); ec=$?; echo "output=[$out]"; echo "exit=$ec"; echo "byte_len=$(printf '%s' "$out" | wc -c)"
output=[]
exit=0
byte_len=       0
```

補強（repo 內是否還有任何入版控的 `.log`）：

```
$ git ls-files | grep '\.log$'
(nothing above = none tracked)
```

**✓ 相符。** 輸出為空、exit 為 0——報告特別聲明「判準是輸出為空、⛔ 不是退出碼」，
稽核側實測 exit 確為 **0**，該提醒**屬實且必要**。

---

### 準則 2：`ls -l web.log` → 檔案仍在工作目錄

```
$ ls -l web.log
-rw-r--r--  1 quasi-pc  staff  1242 Feb 12  2026 web.log
exit=0

$ wc -l -c web.log
      17    1242 web.log
```

⚠️ 稽核側**額外加驗**（任務包與報告都沒有這條）：工作目錄檔案與 HEAD blob 是否 byte-identical，
以排除「檔案還在但內容被動過」：

```
$ git show HEAD:web.log | wc -c
    1242

$ diff <(git show HEAD:web.log) web.log
exit=0
```

**✓ 相符，且強於報告聲稱。** 1242 bytes / 17 行；且與 HEAD 版本**逐位元組相同**
⇒ ⛔ 未被誤刪、⛔ 未被改動。

---

### 準則 3：`git check-ignore -v web.log` → 命中

```
$ git check-ignore -v web.log
.gitignore:28:web.log	web.log
exit=0
```

**✓ 相符。** 報告聲稱「命中終態第 28 行」——稽核側實測行號**確為 28**。

---

### 準則 4：`git check-ignore -v .env` → 命中（鐵則 1，最高優先）

```
$ git check-ignore -v .env
.gitignore:31:.env	.env
exit=0
```

**✓ 相符。** 這是**正面命中證據**，⛔ 非「沒出錯」的反證。

⚠️ 稽核側同意報告的語義說明，並自行複驗其前提：

```
$ ls -la .env
ls: .env: No such file or directory

$ ls -a | grep -i '^\.env'
(nothing = no .env)
```

⇒ `.env` 檔在硬碟上**確實不存在**，但 `git check-ignore` 比對路徑字串、不看檔案是否存在，
本條照樣成立。⇒ 本條證明的是「規則仍在且仍會命中該路徑」＝ 任務包要的「維持現狀不退步」。
**⛔ 稽核側未把本條判為無效。**

---

### 準則 5：`git check-ignore -v .vscode/settings.json` → 命中

```
$ git check-ignore -v .vscode/settings.json
.gitignore:21:.vscode	.vscode/settings.json
exit=0

$ ls -l .vscode/settings.json
-rw-r--r--  1 quasi-pc  staff  225 May  4  2025 .vscode/settings.json
```

**✓ 相符。** 行號 21、檔案 225 bytes——報告兩個數字稽核側實測皆相符。

---

### 準則 4 / 5 的「陷阱」是否真的存在 —— 稽核側獨立驗證前提

⚠️ 這條任務包與報告都只是**引述**，稽核側自行從 HEAD blob 取證，確認「檔尾那段不是純重複」：

```
$ git show HEAD:.gitignore | sed -n '34,43p' | nl -ba -v34
    34	# typescript
    35	*.tsbuildinfo
    36	
    37	/node_modules
    38	/build
    39	
    40	.DS_Store
    41	.vscode
    42	.env
    43	yarn-error.log

$ git show HEAD:.gitignore | grep -n -E '^(\.vscode|\.env|yarn-error\.log)$'
41:.vscode
42:.env
43:yarn-error.log
```

⇒ 改動前 `.vscode`（第 41 行）與 `.env`（第 42 行）**在全檔各只出現一次，且都在檔尾那段**
⇒ 「整段刪掉會弄丟 `.env` 保護（觸鐵則 1）」的判定**成立**。
⇒ 本次改動把兩者搬進上半段後才刪，**做法正確**。

---

### 準則 6：去重計數各為 1

稽核側實跑（**改動後**現況檔）：

```
$ for p in '^/node_modules$' '^/build$' '^\.DS_Store$' '^\.vscode$' '^\.env$' '^web\.log$' '^yarn-error\.log$'; do printf "%-22s %s\n" "$p" "$(grep -c "$p" .gitignore)"; done
^/node_modules$        1
^/build$               1
^\.DS_Store$           1
^\.vscode$             1
^\.env$                1
^web\.log$             1
^yarn-error\.log$      0
```

稽核側自行取**改動前**基線（⛔ 不轉抄報告的「改動前各為 2」，直接讀 HEAD blob）：

```
$ for p in '^/node_modules$' '^/build$' '^\.DS_Store$' '^\.vscode$' '^\.env$' '^yarn-error\.log$' '^web\.log$'; do printf "%-22s %s\n" "$p" "$(git show HEAD:.gitignore | grep -c "$p")"; done
^/node_modules$        2
^/build$               2
^\.DS_Store$           2
^\.vscode$             1
^\.env$                1
^yarn-error\.log$      1
^web\.log$             0
```

**✓ 相符。** 三條由 **2 → 1**，去重完成；`.vscode` / `.env` 維持 1（未弄丟）；`web.log` 由 0 → 1。

**`yarn-error.log` 由 1 → 0：⛔ 稽核側判定「不是缺陷」**，正面證據見下方【額外條 C】。

---

### 準則 7：`yarn build` → 成功（⛔ 稽核側自行實跑，未引用報告輸出）

⚠️ 依派工要求，本條**由稽核側親自跑，⛔ 不採信報告貼的輸出**。環境先取證：

```
$ node -v
v22.19.0
$ yarn -v
1.22.18
$ echo "$0"
/bin/zsh
$ md5 -q .gitignore
c00fe3e470d64c88983b06a29cb0ddb6
```

**稽核 build 第 1 次（完整輸出）：**

```
$ yarn build 2>&1; echo "AUDIT_BUILD_EXIT=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next build
   ▲ Next.js 14.1.0

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/13) ...
   Generating static pages (3/13) 
   Generating static pages (6/13) 
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


ƒ Middleware                             74.9 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand using Node.js

Done in 9.27s.
AUDIT_BUILD_EXIT=0
```

**✓ 相符。** `yarn build` **exit=0（綠）**——報告聲稱的「改後綠」由稽核側**獨立重現**。
13 條路由的 Size / First Load JS 與報告貼出的表**逐行相同**（稽核側目視逐行比對）。

⚠️ 稽核側**未跑 `yarn lint --max-warnings 0`**：依任務包「lint / build 裁示」節，
架構師 2026-08-30 裁定時**明確豁免**（本任務未動任何 `.ts` / `.tsx`）。
⇒ 報告標「已獲授權的豁免、⛔ 不是漏跑」**屬實**。

⚠️ 稽核側**未跑 `yarn install --frozen-lockfile`**：本任務未動 `package.json` 或任一 lock 檔。
報告據實標「未跑、⛔ 不冒充」——**誠實，⛔ 未偽稱**。

⚠️ **⛔ 本專案沒有 build / lint CI**（唯一 workflow `push-docker.yaml` 只在 tag `v*.*.*` 觸發）
⇒ 本稽核一律以**本地實跑輸出**為準，⛔ 未寫「等 remote Actions 綠」。

---

### 準則 8：`git status --porcelain` → 三個既有改動未被誤觸

```
$ git status --porcelain
M  .gitignore
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
D  web.log
?? docs/tasks/F2-plan-review.md
?? docs/tasks/F2-plan.md
?? docs/tasks/F2-verification.md
?? docs/tasks/F2.md
```

X 欄（暫存區）逐檔取證，`cat -e` 顯行尾以證明**前一欄確為空白**：

```
$ git status --porcelain -- app/layout.tsx app/staff/page.tsx components/ServerSection.tsx | cat -e
 M app/layout.tsx$
 M app/staff/page.tsx$
 M components/ServerSection.tsx$

$ git diff --cached --name-only -- app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
exit=0   （無輸出 ⇒ 三檔均未進暫存區）
```

內容不變驗證（⛔ 不轉抄報告的 92/89，稽核側自行量）：

```
$ git diff --stat app/layout.tsx app/staff/page.tsx components/ServerSection.tsx
 app/layout.tsx               |   2 +-
 app/staff/page.tsx           |   6 +-
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
 3 files changed, 92 insertions(+), 89 deletions(-)
```

**✓ 相符。** 三檔 X 欄皆空白（未暫存），diffstat 為 **92 insertions / 89 deletions**，
與報告聲稱的基線一致 ⇒ 既有改動**未被暫存、未被還原、未被修改**。

**準則 8 後半（`web.log` 自 status 消失）：報告標「待放行 commit 後補驗」——✓ 誠實。**
稽核側複驗時序判斷正確：現況 `web.log` 為 `D `（已暫存的刪除），commit 前⛔ 不會消失；
任務包括號亦寫明「於 commit 後驗」。⇒ **⛔ 未偽稱已驗，屬合規的據實標示。**

---

### 準則 9：暫存區恰為 `.gitignore` 與 `web.log` 兩路徑

```
$ git diff --cached --name-only
.gitignore
web.log

$ git diff --cached --name-only | wc -l
       2

$ git diff --cached --name-status
M	.gitignore
D	web.log
```

**✓ 相符。** 暫存區**恰好只有兩個路徑**，`web.log` 確為 **D（刪除）**，⛔ 無任何其他檔案。

稽核側**額外加驗**暫存內容本身（報告未貼此 patch）：

```
$ git diff --cached -- .gitignore
diff --git a/.gitignore b/.gitignore
index 10e7328..3fa9982 100644
--- a/.gitignore
+++ b/.gitignore
@@ -18,14 +18,17 @@
 # misc
 .DS_Store
 *.pem
+.vscode
 
 # debug
 npm-debug.log*
 yarn-debug.log*
 yarn-error.log*
 .pnpm-debug.log*
+web.log
 
 # local env files
+.env
 .env*.local
 
 # vercel
@@ -33,11 +36,3 @@ yarn-error.log*
 
 # typescript
 *.tsbuildinfo
-
-/node_modules
-/build
-
-.DS_Store
-.vscode
-.env
-yarn-error.log
```

⇒ 暫存的改動**恰為 plan 宣告的四處錨點編輯**（`.vscode` 進 misc、`web.log` 進 debug、
`.env` 進 local env files、檔尾空行 + 重複段整段刪除），⛔ 無夾帶。

```
$ git diff --name-only -- .gitignore
exit=0   （工作樹與 index 對 .gitignore 無差異 ⇒ 暫存的就是最終態）

$ git show :.gitignore | md5 -q
c00fe3e470d64c88983b06a29cb0ddb6
$ git show :.gitignore | wc -l -c
      38     392
```

---

## 二、plan 加的三條加強 —— 稽核側逐條實跑

### 條 A：逐字終態的機械比對

稽核側**自行**以 `awk` 從任務包抽出終態（⛔ 不用實作側留在 scratchpad 的 target 檔）：

```
$ awk '/^```gitignore$/{f=1;next} f&&/^```$/{exit} f{print}' docs/tasks/F2.md | wc -l -c
      38     392
$ awk '/^```gitignore$/{f=1;next} f&&/^```$/{exit} f{print}' docs/tasks/F2.md | md5 -q
c00fe3e470d64c88983b06a29cb0ddb6

$ diff <(awk '/^```gitignore$/{f=1;next} f&&/^```$/{exit} f{print}' docs/tasks/F2.md) .gitignore
exit=0
```

改動前 / 後的體積與雜湊（前者直接讀 HEAD blob，⛔ 不轉抄）：

```
$ git show HEAD:.gitignore | wc -l -c
      43     432
$ git show HEAD:.gitignore | md5 -q
68c2d3488a6612761baa924485b02a07

$ wc -l -c .gitignore
      38     392 .gitignore
$ md5 -q .gitignore
c00fe3e470d64c88983b06a29cb0ddb6
```

**✓ 相符。** 43 行 / 432 bytes / `68c2d34…` → 38 行 / 392 bytes / `c00fe3e…`，
且與任務包逐字終態 **byte-identical（diff exit=0）**。
⚠️ ⛔ **未新增任何 `.evidence/` 規則**（裁定 B）——稽核側逐行核過 38 行全文，零偏離。

```
$ ls -d .evidence
ls: .evidence: No such file or directory
```

⇒ ⛔ 確實**未建立 `.evidence/` 目錄**，符合裁定 B。

---

### 條 B：忽略保護零退步 —— ⚠️ 稽核側改用**更強的正面證據**

⚠️ 報告條 B 的證據是 before/after 兩個 **scratchpad 快照檔的 diff**。稽核側判定：
**該證據路徑本身不耐久**（見後段「證據耐久性」），且 diff「沒多出東西」屬**反證**。
⇒ 稽核側**另建兩道正面證據**，⛔ 不以「沒壞」代替「保護有效」。

**正面證據 (i)：規則集合層面的完整比對（HEAD blob vs 現況，去註解 / 去空行 / 排序去重）**

```
$ diff <(git show HEAD:.gitignore | grep -v '^#' | grep -v '^$' | sort -u) <(grep -v '^#' .gitignore | grep -v '^$' | sort -u)
16a17
> web.log
18d18
< yarn-error.log
exit=1

$ git show HEAD:.gitignore | grep -v '^#' | grep -v '^$' | sort -u | wc -l
      19
$ grep -v '^#' .gitignore | grep -v '^$' | sort -u | wc -l
      19
```

⇒ 全部規則中**只增加 `web.log`、只移除 `yarn-error.log`**（後者被 `yarn-error.log*` 涵蓋，
見條 C）。⇒ **`.env` / `.vscode` 等其餘 18 條規則一條不少**——這是**列舉式**證明，
比快照 diff 更完整。

**正面證據 (ii)：目前每一條被忽略的路徑，逐條 `check-ignore` 正面命中**

```
$ git status --porcelain --ignored | grep '^!!' | sed 's/^!! //' | while read -r p; do printf "%-24s " "$p"; git check-ignore -v "$p" || echo "NOT IGNORED"; done
.DS_Store                .gitignore:19:.DS_Store	.DS_Store
.github/.DS_Store        .gitignore:19:.DS_Store	.github/.DS_Store
.next/                   .gitignore:12:/.next/	.next/
.vscode/                 .gitignore:21:.vscode	.vscode/
app/.DS_Store            .gitignore:19:.DS_Store	app/.DS_Store
app/api/.DS_Store        .gitignore:19:.DS_Store	app/api/.DS_Store
node_modules/            .gitignore:4:/node_modules	node_modules/
public/.DS_Store         .gitignore:19:.DS_Store	public/.DS_Store
web.log                  .gitignore:28:web.log	web.log
yarn-error.log           .gitignore:26:yarn-error.log*	yarn-error.log
```

⇒ **10 條全部正面命中，0 條 NOT IGNORED。**

現況忽略集合快照（稽核側自量）：

```
$ git status --porcelain --ignored
M  .gitignore
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
D  web.log
?? docs/tasks/F2-plan-review.md
?? docs/tasks/F2-plan.md
?? docs/tasks/F2-verification.md
?? docs/tasks/F2.md
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

$ git status --porcelain --ignored | wc -l
      19
$ git status --porcelain --ignored | grep -c '^!!'
10
$ git status --porcelain --ignored | grep -c '^??'
4
$ git status --porcelain --ignored | grep -c '^ M'
3
```

**✓ 相符（結論一致，證據更強）。** 報告的結論「`!!` 行僅多出 `web.log`、其餘一字不差」
稽核側以兩道正面證據**獨立確認成立**。
⚠️ 稽核側現量到 `!!` = 10 / `??` = 4 / 總 19，與報告寫的 18 行差 1 —— 差異**完全來自
本檔稽核期間 `docs/tasks/F2-verification.md` 已落檔成為第 4 個 `??`**，
⛔ 不是忽略集合變化（`!!` 仍為 10）。⇒ **⛔ 不列為不符。**

---

### 條 C：`yarn-error.log` 涵蓋性的正面證據

```
$ git check-ignore -v yarn-error.log
.gitignore:26:yarn-error.log*	yarn-error.log
exit=0
```

**✓ 相符。** `grep -c '^yarn-error\.log$'` 由 1 → 0 **是正確的**：
上半段第 26 行的 `yarn-error.log*` 以 glob 完整涵蓋該檔，稽核側以 `check-ignore` 取得
**正面命中**確認。⇒ ⛔ **稽核側未把此 1→0 判為退步。**

---

## 三、報告自陳三處異常 —— 稽核側獨立判斷

### 甲：Middleware 74.9 → 74.8 kB，報告主張與本任務無關

**⛔ 稽核側未採信報告的歸因說法，改以正面重現測試判斷。**

方法：在**同一份已改動的 `.gitignore`**（md5 `c00fe3e…`，全程未變）與**同一份原始碼**下，
稽核側連跑三次 `yarn build`，觀察 Middleware 值是否自行跳動。

```
$ md5 -q .gitignore        # 三次 build 之前
c00fe3e470d64c88983b06a29cb0ddb6

# 稽核 build 第 1 次
ƒ Middleware                             74.9 kB
Done in 9.27s.
AUDIT_BUILD_EXIT=0

# 稽核 build 第 2 次
ƒ Middleware                             74.8 kB
Done in 8.11s.
AUDIT_BUILD_EXIT(pipestatus[1])=0

# 稽核 build 第 3 次
ƒ Middleware                             74.8 kB
Done in 8.10s.
exit_via_pipestatus=0

$ md5 -q .gitignore        # 三次 build 之後（確認 .gitignore 未被 build 改動）
c00fe3e470d64c88983b06a29cb0ddb6
```

**✓ 歸因成立，且證據強度高於報告自己給的。**
判斷依據（⛔ 非報告說法的覆述）：

1. 稽核側在**`.gitignore` 已是改動後終態**的狀態下跑出了 **74.9 kB**——
   而報告的「改動後」值是 74.8 kB。⇒ **同一個 `.gitignore` 狀態能同時產出 74.9 與 74.8**
   ⇒ 該欄位⛔ 不可能是 `.gitignore` 的函數。
2. 稽核側三次連跑得到 **74.9 / 74.8 / 74.8**，輸入完全相同 ⇒ **跳動由建置本身的非決定性造成**。
3. 13 條路由的 Size / First Load JS 在稽核側三次 build 與報告兩次 build 中**逐行相同**
   ⇒ 差異侷限於 Middleware 這一欄的顯示捨入。

⇒ **與本任務無關的歸因,稽核側獨立確認。** ⚠️ 稽核側同樣⛔ 未追查非決定性成因（超出稽核範圍），
與報告一致列為觀察，建議掛 carryover。

---

### 乙：zsh 下 `PIPESTATUS` 取不到 exit code，重跑取正式基準

**步驟 1 — 先驗其技術前提（稽核側實跑）：**

```
$ true | true; echo "PIPESTATUS[0]=[${PIPESTATUS[0]}]"; echo "pipestatus[1]=[$pipestatus[1]]"; echo "shell=$0"
PIPESTATUS[0]=[]
pipestatus[1]=[0]
shell=/bin/zsh
```

⇒ 本機 shell 為 **zsh**，`${PIPESTATUS[0]}` **確實為空**，`$pipestatus[1]` 才取得到值。
**報告陳述的技術前提屬實。**

**步驟 2 — 驗其補救是否可信（有無以推理補值）：**
稽核側檢查實作側留下的過程檔，確認正式基準 build 是**在 `.gitignore` 未改動狀態下重跑**的：

```
$ md5 -q <scratch>/gitignore.before
68c2d3488a6612761baa924485b02a07

$ grep -E 'Middleware|Done in' <scratch>/build.baseline.txt
ƒ Middleware                             74.9 kB
Done in 8.35s.

$ grep -E 'Middleware|Done in' <scratch>/build.after.txt
ƒ Middleware                             74.8 kB
Done in 9.15s.

$ diff <(sed -n '/^Route (app)/,$p' <scratch>/build.baseline.txt) <(sed -n '/^Route (app)/,$p' <scratch>/build.after.txt)
20c20
< ƒ Middleware                             74.9 kB
---
> ƒ Middleware                             74.8 kB
25c25
< Done in 8.35s.
---
> Done in 9.15s.
exit=1
```

**✓ 補救可信，⛔ 未以推理補值。**

- 基準備份檔的 md5 `68c2d34…` = 稽核側自 HEAD blob 量到的**改動前**雜湊 ⇒ 重跑時 `.gitignore`
  確實仍是改動前狀態,「重跑取得的基準」名副其實。
- 報告貼出的 build 摘要（74.9 / 8.35s、74.8 / 9.15s）與過程檔內容**逐字相符**
  ⇒ ⛔ 沒有編造、⛔ 沒有拿 plan 預演值頂替。
- 報告在【7c】把該次比對的 `exit=1` **據實貼出**（diff 有差異就是 1），⛔ 未美化成 0。

⚠️ **一點須架構師知悉（⛔ 不影響結論）**：報告【7c】歸因表「次序 1 = 改動前（第一次，未記錄
exit 的那次）= 74.8 kB」這一列，**沒有任何留存檔案支撐**（該次輸出未落檔，就是 `PIPESTATUS`
失手的那次）。⇒ 嚴格說,那一格是**不可複驗的終端捲軸值**。
⚠️ 但該列**不影響甲的結論**——稽核側已用自己的三次 build 獨立重現跳動，
⇒ 甲的成立⛔ 不依賴那一格。

---

### 丙：快照行數「沒量就寫」後自查更正為 15 行

稽核側直接讀實作側留存的 before 快照檔逐行點算：

```
$ cat <scratch>/ignored.before.txt
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
?? docs/tasks/F2-plan-review.md
?? docs/tasks/F2-plan.md
?? docs/tasks/F2.md
!! .DS_Store
!! .github/.DS_Store
!! .next/
!! .vscode/
!! app/.DS_Store
!! app/api/.DS_Store
!! node_modules/
!! public/.DS_Store
!! yarn-error.log

$ wc -l < <scratch>/ignored.before.txt
      15
$ grep -c '^!!' <scratch>/ignored.before.txt   → 9
$ grep -c '^??' <scratch>/ignored.before.txt   → 3
$ grep -c '^ M' <scratch>/ignored.before.txt   → 3
```

交叉佐證（`??` 為何是 3 而非 4）：

```
$ ls -lT docs/tasks/F2*.md
-rw-r--r--@ 1 quasi-pc  staff  11130 Aug 31 00:08:56 2026 docs/tasks/F2-plan-review.md
-rw-r--r--@ 1 quasi-pc  staff  25603 Aug 31 00:12:41 2026 docs/tasks/F2-plan.md
-rw-r--r--@ 1 quasi-pc  staff  25460 Aug 31 00:18:48 2026 docs/tasks/F2-verification.md
-rw-r--r--@ 1 quasi-pc  staff  12173 Aug 30 23:49:26 2026 docs/tasks/F2.md
```

⇒ 取 before 快照時（實作開始，plan 最後修訂 00:12:41 之後、verification 00:18:48 之前），
未追蹤文件恰為 `F2.md` / `F2-plan.md` / `F2-plan-review.md` **3 筆** ⇒ 3 + 3 + 9 = **15**。

**✓ 最終數字 15 正確。** 拆解 ` M` 3 + `??` 3 + `!!` 9 稽核側逐項點算**完全相符**；
plan §0.6 寫的 13 確實是**過期值**（當時 `??` 只有 `F2.md` 一筆）。

**對結論的影響評估：無。**

1. 條 B 的判準是「`!!` 行僅多出 `web.log`」，而 `!!` 行數 **9 → 10** 稽核側已獨立確認
   （after 檔 `grep -c '^!!'` = 10，現況 = 10），⇒ 判準⛔ 不受總行數影響。
2. 快照總行數本來就**不是任務包 9 條驗收準則的任何一條**，只是 plan 加的加強項的附帶數字。
3. ⚠️ **但這件事的性質仍須架構師知悉**：報告作者自陳曾「沒量就寫」——
   這正是本稽核制度要防的行為。**本次它自查更正且更正值正確**，
   ⇒ 稽核側判為**已自癒、⛔ 不列必改**，但列入下方「須架構師知悉」。

---

## 四、報告誠實度查核

| 查核點 | 稽核方法 | 結果 |
|---|---|---|
| 有無以**預期值**冒充已執行 | 逐段比對報告數字 vs 稽核側自量值（md5 / 行數 / 位元組 / check-ignore 行號 / diffstat / exit code） | **✓ 無**。全部相符 |
| 有無以 **plan 預演值**冒充實跑 | plan 預演值（md5 `c00fe3e…`、38/392、行號 28/31/21/26）稽核側在真 repo 重量 | **✓ 無**。真 repo 實測與預演值相同，且稽核側量得同值 |
| 有無以**設計推理**代替實跑 | 檢查每條聲稱是否附指令輸出 | **✓ 無**。9 條 + 3 條均附輸出 |
| 有無把「待人工」偽稱已驗 | 檢查第 8 條後半 / `yarn lint` / `yarn install` 三處措辭 | **✓ 無**。三處均據實標「待補驗 / 已授權豁免 / 未跑」 |
| 有無隱瞞不符 | 報告「與 plan 預演不符之處」節 | **✓ 無隱瞞**。甲 / 乙 / 丙三處主動列出，稽核側未再發現第四處 |
| 機密是否入 log / 入報告 | 見下 | **✓ 無** |

機密面稽核側自行複驗：

```
$ grep -icE "token|secret|password|webhook|client_secret|discord\.com/api/webhooks|Bearer|[A-Za-z0-9_-]{40,}" web.log
0

$ git log --oneline --diff-filter=A -- web.log
5afda1a chore: reorganize project structure and migrate to app router
```

⇒ `web.log` 掃描 **0 命中**（稽核側自跑，⛔ 非引用報告）⇒「⛔ 不改寫歷史」的依據成立。
⇒ `web.log` 仍在歷史（commit `5afda1a`）**是任務包明列的「⛔ 不做」事項**，⛔ 非疏漏。

---

## 五、守界稽核

| 守界項 | 稽核側取證 | 結果 |
|---|---|---|
| 三個既有未 commit 改動仍在、未暫存 | `git status --porcelain \| cat -e` X 欄空白；`git diff --cached --name-only -- <3檔>` 無輸出 | **✓ 相符** |
| 三個既有改動內容未變 | `git diff --stat` = 92 insertions / 89 deletions | **✓ 相符** |
| 暫存區恰為 2 個路徑 | `git diff --cached --name-only \| wc -l` = **2** | **✓ 相符** |
| ⛔ 未 commit | `git rev-parse HEAD` = `f9696a2ec77b623e0ace6009748e366f645d4756`（＝任務包基準） | **✓ 相符** |
| ⛔ 未 push | `git ls-remote origin developers` → `f9696a2ec77b623e0ace6009748e366f645d4756	refs/heads/developers`；本機 `.git/refs/remotes/origin/developers` 同值 | **✓ 相符** |
| ⛔ 未打 tag | `ls -la .git/refs/tags` → 空目錄；`.git/packed-refs` 內 `refs/tags` 計數 **0** | **✓ 相符** |
| ⛔ 未動 `.ts` / `.tsx` / `data/` / Dockerfile / workflow / `CLAUDE.md` | `git status --porcelain` 全清單只有 `.gitignore` / `web.log` / 三個既有改動 / 4 個 `??` 文件 | **✓ 相符** |
| ⛔ 未建立 `.evidence/` | `ls -d .evidence` → No such file or directory | **✓ 相符** |
| ⛔ 未用 `git add .` | 效果面取證：暫存區恰 2 路徑，三個既有改動未入 index | **✓ 相符（效果驗證）** |
| ⛔ 未用 `git checkout` | 效果面取證：三檔 diffstat 與 `web.log` 內容均未被還原 | **✓ 相符（效果驗證）** |
| repo 無自動化測試 | `package.json` scripts 僅 `dev` / `build` / `start` / `lint`，⛔ 無 `test` | **✓ 相符**（報告標「不適用」屬實） |
| remote 位址 | `.git/config` → `https://github.com/NamelessRealms/namelessrealms-web.git` | **✓ 相符** |

```
$ sed -n '13,18p' package.json
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
```

⚠️ 「⛔ 未用 `git add .`」與「⛔ 未用 `git checkout`」兩項**性質上只能做效果驗證**
（稽核側看不到實作側的 shell 歷史）。⇒ 稽核側以「暫存區恰 2 路徑 + 三檔內容/diffstat 未變 +
`web.log` 與 HEAD blob byte-identical」三重效果證據支持，**⛔ 不宣稱為過程證據**。

---

## ⛔ 必改

**無。** 稽核側逐條實跑後未發現任何與報告聲稱不符之處。

---

## 報告更正（文字級，⛔ 不影響結論；建議收案前一併更新）

1. **【B】的「改動後完整快照 18 行」已因時間推進而不再是現值。**
   稽核側現量：總 **19** 行（`!!` **10** / `??` **4** / ` M` **3**），
   增加的 1 行是 `?? docs/tasks/F2-verification.md`（報告自己落檔造成）。
   ⇒ 建議報告該處加註「`??` 行數隨交接文件落檔而變動，⛔ 不列入判準」，避免後續稽核誤讀。

2. **【6】的呈現格式非逐字終端輸出。** 報告寫成
   `$ grep -c '^/node_modules$' .gitignore   → 1`，
   真實輸出應是指令下一行單獨一個 `1`。⚠️ **數值稽核側複驗全部正確**，
   ⇒ 僅為排版重寫，⛔ 非造假；但依「逐字原始輸出」紀律，建議日後保留原始換行格式。
   同型狀況見【8】的 `[ M] app/layout.tsx` 方括號標註寫法。

3. **【7c】歸因表「次序 1」那一列無留存證據**（見上方乙）。建議加註
   「此列來自未落檔的終端輸出，⛔ 不可複驗」，或直接刪除該列——
   甲的結論已由另兩列 + 稽核側三次 build 獨立支撐，⛔ 不需要它。

---

## ⚠️ 證據耐久性（稽核側職責範圍內）

**✓ 未發現以 `docker logs` / 執行中容器狀態為證據來源的段落**（本任務無容器面向）。

⚠️ **但有兩項耐久性事項須架構師裁決：**

1. **`docs/tasks/F2-verification.md` 目前是未追蹤檔（`??`），而報告草擬的 commit
   只暫存 `.gitignore` 與 `web.log`。**
   ⇒ 依裁定 B，「耐久證據載體」被指定為 verification.md；但它**此刻並不在版控裡**，
   且照現行 commit 草稿**也不會進去**。
   ⇒ **裁決點**：是否要求同一 commit（或緊接的文件 commit）把
   `docs/tasks/F2.md` / `F2-plan.md` / `F2-plan-review.md` / `F2-verification.md` /
   本檔 一併入版控？否則裁定 B 設想的耐久性⛔ 不成立。
   ⚠️ 稽核側⛔ 不自行判斷要不要緊,依規紀交規劃側裁決。

2. **報告多處以 `<scratch>/…` 為證據路徑**（`build.baseline.txt` / `build.after.txt` /
   `ignored.before.txt` / `ignored.after.txt` / `target.gitignore` / `gitignore.before`）。
   這些是 session 專屬暫存檔，**會消失**。
   ⚠️ 本次稽核**碰巧**還讀得到它們（同 session 未清），已用來交叉佐證乙與丙；
   但下一次任何人都⛔ 讀不到。
   ⇒ 緩解事實：報告**已把該落的實際輸出逐字貼進 verification 內文**
   （稽核側逐段比對過：貼出的摘要與過程檔內容相符），
   ⇒ 實質耐久性由內文承擔,⛔ 未真正依賴 scratchpad。
   ⇒ ⚠️ 唯一例外是【7c】次序 1 那一格（見報告更正 3）——**該值無任何落檔支撐**。

---

## 追認（實作偏離 plan 之處）

1. **plan §0.6 的快照 13 行 → 實測 15 行**：plan 值過期，實作側據實更正。
   稽核側點算確認 15 正確（3 + 3 + 9），⇒ **追認**。
2. **build 跑第一次未取到 exit code、在改動前狀態重跑一次取正式基準**：
   稽核側確認 zsh 前提屬實、重跑時 `.gitignore` 仍為改動前雜湊，⇒ **追認**。
3. **Middleware 74.9 → 74.8**：稽核側以同輸入三次 build 重現跳動，
   確認與 `.gitignore` 改動無因果，⇒ **追認**為建置既有非決定性。

---

## carryover 對號

- **待放行 commit 後補驗**：`web.log` 自 `git status --porcelain` 消失（任務包驗收第 8 條後半）。
  ⚠️ 稽核側確認此為**時序必然**，commit 前⛔ 無法驗；報告標示正確。
- **`CLAUDE.md` 地雷清單第 3、4 條的收掉**：任務包明列由架構師收案時處理，⛔ 非本包範圍。
  ⚠️ 稽核側確認 `CLAUDE.md` 目前**未被修改**（不在 `git status` 內），與守界聲明一致。
- **建置 Middleware 大小的非決定性**：稽核側獨立重現（74.9 / 74.8 / 74.8），
  ⛔ 未追查成因。若架構師要追，建議另開任務。
- **本檔提出的證據耐久性事項 1**（五件套文件是否入版控）——待裁決。

---

## 稽核側自身守界聲明

- ⛔ 未 `add` / `commit` / `push` / `tag` / `checkout` / `reset` / `restore` / `stash` / `clean`。
- ⛔ 未修改任何原始碼、⛔ 未動 `.gitignore`、⛔ 未碰三個既有未 commit 改動、
  ⛔ 未動暫存區（稽核前後 `git diff --cached --name-only` 均為 `.gitignore` + `web.log`）。
- ⛔ 未使用 `npm`（全程 yarn）。
- 唯一寫入 repo 的檔案為**本檔** `docs/tasks/F2-verification-audit.md`。
- ⚠️ 唯一副作用：依派工要求實跑 `yarn build` **三次**，僅寫入被忽略的 `.next/` 建置產物；
  三次前後 `md5 -q .gitignore` 均為 `c00fe3e470d64c88983b06a29cb0ddb6`（未受影響）。
- ⛔ 未存取知識庫（vault）任何路徑。

---

⛔ **commit / push 仍待架構師確認。** 本檔任何措辭均⛔ 不構成 commit / push 預授權。
