# F10 補跑證據：N1 / P2 / P3-1

> **第三方獨立補跑（⛔ 非報告作者、⛔ 非稽核側），日期 2026-09-10。**
>
> 稽核側受 `audit-write-guard` 限制，無法執行需要建檔／建目錄／跑 `yarn install` 的三條驗收
> （見 `docs/tasks/F10-verification-audit.md` 四-2 / 四-3 / 四-4），由本補跑者獨立執行並落檔。
>
> **紀律：先做、後看。** 第一階段動手前**只**讀了 `docs/tasks/F10.md` 的驗收步驟定義
> （N1 / P2 / P3）與 `docs/tasks/F10-plan-review.md` 建議 1、2、5，**⛔ 未讀** `F10-verification.md`
> 的 N1／P2／P3 段，也⛔ 未讀 `F10-verification-audit.md`；指令與 canary 皆自行設計、自行命名。
> 取證全部完成後才進入第二階段開啟那兩份檔比對。
>
> 本檔所有數字與輸出**皆為本補跑者親自執行所得**，⛔ 無一行轉抄自任務包 / plan / verification / 主迴圈。
> 環境：分支 `developers`，zsh，`; echo "exit=$?"` 緊接指令取 exit（⛔ 未用 `${PIPESTATUS[0]}`）。

---

## 動工前 `git status --short`

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
 M next.config.js
?? docs/tasks/F10-background.md
?? docs/tasks/F10-plan-review.md
?? docs/tasks/F10-plan.md
?? docs/tasks/F10-verification-audit.md
?? docs/tasks/F10-verification.md
?? docs/tasks/F10.md
```

⇒ 與派工描述的現況一致：`M next.config.js` + 三個無關舊改動 + 六個 untracked `docs/tasks/F10*.md`。

## 受測對象（唯讀確認，⛔ 未修改）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && cat -n next.config.js
     1	/** @type {import('next').NextConfig} */
     2	const nextConfig = {
     3	    output: 'standalone',
     4	    eslint: { dirs: ['app', 'components', 'data', 'middleware.ts'] },
     5	    // 如果有其他配置可以加在這裡
     6	};
     7	
     8	module.exports = nextConfig;
```

⇒ 現行 `eslint.dirs` 已**不含** `'lib'`（＝ F10 改後狀態），本檔三條全部在此狀態下量測。
⚠️ 本補跑⛔ 未動 `next.config.js`、⛔ 未碰 `.eslintrc.json`、⛔ 未往 `lib/` 放檔、⛔ 未刪空 `lib/`。

---

# 第一階段：自行取證

## N1 —— 改後 `--error-on-unmatched-pattern` 對「存在但為空」的目錄仍會 fail

**自行設計的取證方式（與報告寫法無關，動手時尚未讀報告）**

- canary 目錄自取名 **`f10-3p-empty-canary`**（`3p` = third party，避免與任何既有 canary 撞名）。
- 依派工要求，`--dir` **把現行 `eslint.dirs` 四項一併帶上**再加 canary
  （`--dir` 會整個取代設定檔的 `dirs`，只指 canary 會變成「這次只 lint 一個空目錄」，
  條件比實際情境弱；帶上四項才是「其他目錄都有檔、只有它是空的」這個真實情境）。
- 額外自加**兩條對照**，讓 `exit=1` 的成因無歧義：
  ① 同旗標但**不加** canary ⇒ 應 `exit=0`（證明失敗來自 canary，⛔ 不是四項本身有問題）；
  ② 加 canary 但**拿掉旗標** ⇒ 應 `exit=0`（證明失敗來自旗標，⛔ 不是空目錄本身會爆）。
- `--dir` 是 Array 型參數（`node_modules/next/dist/cli/next-lint.js` 第 73 行 help 文字
  `-d, --dir Array`，本補跑者自行 grep 確認），故可重複給。

### N1-0 殘留前置檢查（動手前確認目錄不存在）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -ld f10-3p-empty-canary; echo "exit=$?"
ls: f10-3p-empty-canary: No such file or directory
exit=1
```

⇒ 動手前不存在 ⇒ 後面的 `mkdir` 必定真的建了新目錄。

### N1-C1 對照①：四項真實目錄 + 旗標，**不加** canary

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 --error-on-unmatched-pattern --dir app --dir components --dir data --dir middleware.ts; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --error-on-unmatched-pattern --dir app --dir components --dir data --dir middleware.ts
✔ No ESLint warnings or errors
Done in 1.28s.
exit=0
```

⇒ ✅ `exit=0`。基準線：現行四項目錄在開旗標下**不會** fail。

### N1-1 建立空 canary 目錄並確認它是空的

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && mkdir f10-3p-empty-canary; echo "exit=$?"
exit=0
```

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -ld f10-3p-empty-canary; echo "exit=$?"
drwxr-xr-x@ 2 quasi-pc  staff  64 Sep 10 12:19 f10-3p-empty-canary
exit=0
```

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -A f10-3p-empty-canary | wc -l
       0
```

⇒ ✅ 目錄**真的存在**（`d` 開頭）且**內容為 0** ⇒ 符合任務包 B-2「必須用存在但為空的目錄，
⛔ 不得用不存在的假目錄（會被 `existsSync` 先濾掉、得 `exit=0`、是空測）」。

### N1-2 主指令（四項真實目錄 + 空 canary + 旗標）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 --error-on-unmatched-pattern --dir app --dir components --dir data --dir middleware.ts --dir f10-3p-empty-canary; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --error-on-unmatched-pattern --dir app --dir components --dir data --dir middleware.ts --dir f10-3p-empty-canary
No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/f10-3p-empty-canary' were found.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
exit=1
```

⇒ ✅ **`exit=1`**，關鍵證據行
**`No files matching '/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/f10-3p-empty-canary' were found.`**
⇒ 改後（`dirs` 已無 `'lib'`）旗標**仍然有效**。
⚠️ 本條的 `mkdir` 與 lint 是**分開兩次執行**（N1-1 / N1-2），⛔ 無 `&&` 短路 ⇒ 這個 `exit=1`
**確定是 lint 的**，⛔ 不可能是 `mkdir` 失敗撞號（`F10-plan-review.md` 建議 1 的同族風險，本補跑用「拆成兩條」根除）。
⚠️ 依任務包 B-6（ESLint 只報第一個不匹配樣式），本輪**只放一個**空目錄。

### N1-C2 對照②：同樣有空 canary，但**拿掉**旗標

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 --dir app --dir components --dir data --dir middleware.ts --dir f10-3p-empty-canary; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --dir app --dir components --dir data --dir middleware.ts --dir f10-3p-empty-canary
✔ No ESLint warnings or errors
Done in 0.75s.
exit=0
```

⇒ ✅ `exit=0`。三條合看，變因逐一隔離：
**空目錄 + 旗標 ⇒ 1**；**空目錄 − 旗標 ⇒ 0**；**旗標 − 空目錄 ⇒ 0**
⇒ `exit=1` 的成因**唯一**是「旗標 × 存在但為空的目錄」，⛔ 不是別的。

### N1-3 還原並單獨證明已清

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && rmdir f10-3p-empty-canary; echo "exit=$?"
exit=0
```

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -ld f10-3p-empty-canary; echo "exit=$?"
ls: f10-3p-empty-canary: No such file or directory
exit=1
```

⇒ ✅ `rmdir` 自己的 `exit=0`（**單獨一條**，⛔ 無短路）＋ `ls -ld` **單獨一條**得
`No such file or directory` / `exit=1` ⇒ 目錄已清，證據無歧義
（`F10-plan-review.md` 建議 1、5：⛔ 不以「非 0」單獨推論，取訊息行 + 拆條）。

---

## P2 —— 改後 `eslint.dirs` 仍被讀（`data/` canary 仍被抓）

**自行設計的取證方式**

- canary 檔自取名 **`data/f10ThirdPartyCanary.ts`**（新檔、`.ts` 無 JSX），
  自行設計內容：在**非元件、非 hook**的具名函式裡呼叫 `useState`，
  預期觸發 `react-hooks/rules-of-hooks`（error 級）。
- 判準取「**canary 是否出現在輸出**」：`data` ⛔ 不在 Next 內建預設清單
  `["app","pages","components","lib","src"]` 內 ⇒ 它被抓 ⇔ 設定檔的 `dirs` 真的被讀。
- 額外自加一條**鑑別力對照**：canary 仍在硬碟上，但用 `--dir` 排除 `data` ⇒ canary 應從輸出消失。

### P2-0 基線（建 canary 前）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --porcelain data/; echo "exit=$?" && yarn lint --max-warnings 0; echo "exit=$?"
exit=0
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0
✔ No ESLint warnings or errors
exit=0
```

⇒ 建 canary 前 `data/` 乾淨、`yarn lint --max-warnings 0` `exit=0`。

### P2-1 canary 內容（逐字，新檔）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && cat -n data/f10ThirdPartyCanary.ts
     1	// F10 第三方補跑 canary（A：error 級素材）—— 驗完必刪，⛔ 不得進 commit
     2	import { useState } from "react";
     3	
     4	export function f10NotAComponent(): number {
     5	  const [v] = useState(0);
     6	  return v;
     7	}
```

### P2-2 主指令（`--max-warnings 0`）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0

./data/f10ThirdPartyCanary.ts
5:15  Error: React Hook "useState" is called in function "f10NotAComponent" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use".  react-hooks/rules-of-hooks

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
exit=1
```

⇒ ✅ **`exit=1`**，輸出含檔案路徑 **`./data/f10ThirdPartyCanary.ts`** 與規則名原文
**`react-hooks/rules-of-hooks`**（位置 `5:15`，**Error 級**）。

### P2-3 素材等級確認（不加 `--max-warnings 0` 也非 0 ⇒ 確為 error 級）

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint

./data/f10ThirdPartyCanary.ts
5:15  Error: React Hook "useState" is called in function "f10NotAComponent" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use".  react-hooks/rules-of-hooks

info  - Need to disable some ESLint rules? Learn more here: https://nextjs.org/docs/basic-features/eslint#disabling-rules
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
exit=1
```

⇒ ✅ 素材是 **error 級**，⛔ 不必借 `--max-warnings 0` 湊非 0
⇒ ⭐ **獨立證實**：`react-hooks/rules-of-hooks` **會**對**無 JSX 的 `.ts` 檔**觸發
（本補跑者親自實測，⛔ 非源碼推理；此點在 `F10.md` 的「實作要點」中原標為「⛔ 未實跑」）。

### P2-C 鑑別力對照：canary 仍在硬碟上，但用 `--dir` 排除 `data`

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 --dir app --dir components --dir middleware.ts; echo "exit=$?"
yarn run v1.22.18
warning ../../../../package.json: No license field
$ next lint --max-warnings 0 --dir app --dir components --dir middleware.ts
✔ No ESLint warnings or errors
Done in 0.65s.
exit=0
```

⇒ ✅ 同一個違規檔仍在 `data/` 裡，但一旦把 `data` 從掃描清單拿掉就**消失**
⇒ P2-2 抓到它**只可能**來自清單裡的 `data` 那一項
⇒ 改後 `next.config.js` 的 `eslint.dirs` **確實被讀**，Next ⛔ 未退回內建預設清單。
⚠️ 這是本輪**自跑**的對照，⛔ 不是引用 F8 的取樣。

### P2-4 移除 canary 並對帳

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && rm data/f10ThirdPartyCanary.ts; echo "exit=$?"
exit=0
```

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --porcelain data/; echo "exit=$?"
exit=0
```

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls -l data/; echo "exit=$?"
total 32
-rw-r--r--  1 quasi-pc  staff  6072 Feb 16  2026 modpackHistory.ts
-rw-r--r--  1 quasi-pc  staff  1014 Feb 12  2026 news.ts
-rw-r--r--  1 quasi-pc  staff   564 Feb 12  2026 staff.ts
```

⇒ ✅ `git status --porcelain data/` **零輸出**；`data/` 只剩三個既有檔
⇒ canary 已刪、從未 `git add`、其他檔未動（⛔ 未用 `git checkout`）。

---

## P3-1 —— `yarn install --frozen-lockfile`

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn install --frozen-lockfile; echo "exit=$?"
yarn install v1.22.18
warning ../../../../package.json: No license field
[1/4] Resolving packages...
[2/4] Fetching packages...
warning Pattern ["string-width@^4.1.0"] is trying to unpack in the same destination "/Users/quasi-pc/Library/Caches/Yarn/v6/npm-string-width-cjs-4.2.3-269c7117d27b05ad2e536830a8ec895ef9c6d010-integrity/node_modules/string-width-cjs" as pattern ["string-width-cjs@npm:string-width@^4.2.0"]. This could result in non-deterministic behavior, skipping.
[3/4] Linking dependencies...
[4/4] Building fresh packages...
Done in 0.55s.
exit=0
```

⇒ ✅ **`exit=0`**（`--frozen-lockfile` 下未因 lock 與 `package.json` 不一致而失敗）。

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --stat yarn.lock package.json; echo "exit=$?"
exit=0
```

⇒ ✅ **零輸出** ⇒ `yarn install` 之後 `yarn.lock` 與 `package.json` 皆未被改動。

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls package-lock.json; echo "exit=$?"
ls: package-lock.json: No such file or directory
exit=1
```

⇒ ✅ `package-lock.json` **不存在**（F4 收案後的狀態未被本輪或 F10 破壞；本補跑⛔ 未跑 `npm install`）。

---

# 第二階段：與報告比對

> 以上取證**全部完成後**才開啟 `docs/tasks/F10-verification.md`（N1／P2／P3 段）
> 與 `docs/tasks/F10-verification-audit.md` 比對。

## 逐條比對

| # | 項目 | 報告值（`F10-verification.md`） | 本補跑實測值 | 判定 |
|---|---|---|---|---|
| 1 | N1 主指令 exit | `exit=1` | `exit=1` | ✅ 一致 |
| 2 | N1 關鍵訊息行 | `No files matching '<repo 絕對路徑>/f10-empty-canary' were found.` | `No files matching '<repo 絕對路徑>/f10-3p-empty-canary' were found.` | ✅ 一致（**訊息格式逐字相同**；僅目錄名不同，本補跑自取 `f10-3p-empty-canary`） |
| 3 | N1 指令構成 | `mkdir … && yarn lint … --dir f10-empty-canary`（**只**指 canary 一個目錄；`mkdir` 與 lint 用 `&&` 串起） | 依派工把現行 `dirs` 四項一併帶上再加 canary；且 `mkdir` 與 lint **拆成兩條**執行 | ⚠️ **做法不同、結論相同**。本補跑條件更嚴（其他目錄都有檔、只有 canary 是空的）且⛔ 無 `&&` 短路撞號疑慮 ⇒ 報告結論獲得**更強**的支持，⛔ 非不一致 |
| 4 | N1 還原（單獨 `ls -ld`） | `ls: f10-empty-canary: No such file or directory` / `exit=1` | `ls: f10-3p-empty-canary: No such file or directory` / `exit=1` | ✅ 一致 |
| 5 | N1 額外對照 | 報告⛔ 無「拿掉旗標」「不加 canary」兩條對照 | 本補跑自加兩條（皆 `exit=0`） | ➕ **本補跑多出的證據**，方向與報告結論相同 |
| 6 | P2 canary 觸發規則 | `react-hooks/rules-of-hooks`，**Error 級** | `react-hooks/rules-of-hooks`，**Error 級** | ✅ 一致 |
| 7 | P2 違規位置 | `5:15` | `5:15` | ✅ 一致（兩份 canary 第 5 行結構相同） |
| 8 | P2 訊息文字 | `React Hook "useState" is called in function "notAComponent" that is neither a React function component nor a custom React Hook function. …` | `… in function "f10NotAComponent" …`，其餘**逐字相同** | ✅ 一致（僅函式名不同，本補跑自取 `f10NotAComponent`） |
| 9 | P2 exit | `yarn lint` ⇒ `exit=1` | `yarn lint` ⇒ `exit=1`；`yarn lint --max-warnings 0` ⇒ `exit=1` | ✅ 一致（本補跑多量一種旗標組合） |
| 10 | P2 檔名 | `data/lintCanary.ts` | `data/f10ThirdPartyCanary.ts` | ⚠️ 檔名不同（自行設計，⛔ 刻意避免撞名）；輸出中檔案路徑均正確顯示在 `./data/` 下 ⇒ 證明力相同 |
| 11 | P2「`rules-of-hooks` 對無 JSX `.ts` 會觸發」 | 報告行 289 稱「順帶清掉 plan §9 的一條未驗，本輪實測」 | **獨立實測復現**（P2-2 / P2-3） | ✅ 一致，且已由第三方獨立復現 |
| 12 | P2 對照組 | 報告**引用 F8 取樣**（`F8-verification.md` 54–61 行），⛔ 未重做 | 本補跑**自跑**鑑別力對照（P2-C：排除 `data` ⇒ canary 消失、`exit=0`） | ➕ **補上報告缺的那一塊**：報告未自跑的對照，本輪以現行設定實測，結論與 F8 取樣一致 |
| 13 | P2 移除後對帳 | `git status --porcelain data/` 零輸出 | 零輸出 | ✅ 一致 |
| 14 | P3-1 exit | `exit=0` | `exit=0` | ✅ 一致 |
| 15 | P3-1 輸出內容 | `yarn install v1.22.18` / `[1/4]～[4/4]` / `string-width` 快取 warning / `Done in 0.61s.` | 同樣的行序與 `string-width` warning；`Done in **0.55s.**` | ✅ 一致（**耗時數字不同屬正常**，⛔ 非事實聲稱；其餘逐行相同） |
| 16 | P3-1 `git diff --stat yarn.lock package.json` | 零輸出 | 零輸出 | ✅ 一致 |
| 17 | `package-lock.json` | 報告 P3-1 未查 | 本補跑查得**不存在**（`exit=1`） | ➕ 本補跑多出的證據，與 `CLAUDE.md`「套件管理器」節現況相符 |

## 比對結論

- **⛔ 無任何一條不一致。** 三條的 exit（N1=1、P2=1、P3-1=0）與關鍵輸出行**全部復現**。
- 差異只有三種，皆⛔ 非矛盾：
  ① **命名不同**（canary 目錄名 / 檔名 / 函式名皆由本補跑者自取，以確保是獨立設計）；
  ② **指令構成不同**（N1 帶上四項真實目錄、`mkdir` 與 lint 拆條）——條件更嚴、歧義更少；
  ③ **耗時數字不同**（`Done in 0.55s.` vs `0.61s.`）——每次執行本就不同。
- **本補跑額外補上報告與稽核都沒有的三塊證據**：
  N1 的兩條變因隔離對照、P2 的自跑鑑別力對照（⛔ 不靠 F8 取樣）、`package-lock.json` 不存在。
- ⚠️ **本補跑⛔ 未驗**：N0-A／N0-B 原式（改前基線，`next.config.js` 已改，時點已過⛔ 無法重現）、
  P1、P3-2、P3-3（`yarn lint --max-warnings 0` 全量與 `yarn build`）、P4、P5——⛔ 不在派工範圍。
  ⚠️ 其中 P2-0 基線那條 `yarn lint --max-warnings 0` `exit=0` 雖與 P3-2 同式，
  但那是本補跑為 P2 取基線時順帶量到的，⛔ 不代表本補跑複核了 P3-2 的全部聲稱。

---

## 收工後 `git status --short`

```
$ cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
 M next.config.js
?? docs/tasks/F10-background.md
?? docs/tasks/F10-evidence.md
?? docs/tasks/F10-plan-review.md
?? docs/tasks/F10-plan.md
?? docs/tasks/F10-verification-audit.md
?? docs/tasks/F10-verification.md
?? docs/tasks/F10.md
```

⇒ ✅ 與動工前逐字相同，**唯一新增**為 `?? docs/tasks/F10-evidence.md`（本檔）。
⇒ ⛔ 未出現 `f10-3p-empty-canary`、⛔ 未出現 `data/f10ThirdPartyCanary.ts`。
⇒ ⛔ 未 `git add`、⛔ 未 commit、⛔ 未 push、⛔ 未打 tag、⛔ 未跑 `npm install`。
