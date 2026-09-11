# 審計:F9 驗收報告(`F9-verification.md`)

> 稽核側(nr-auditor)2026-09-12 產出。審計對象:`docs/tasks/F9-verification.md`。
> **⛔ 不信報告自述**:下表每一格的數字都是稽核側本輪在本機**自己重跑**取得的,
> ⛔ 不從 verification、⛔ 不從 plan／plan-review、⛔ 不從派工訊息／主迴圈通知轉抄。
> ⚠️ 稽核側對現場**唯讀**:全程未 commit、未 push、未改任何原始碼／證據檔,
> 未用 `checkout / reset / clean / restore / stash / add / worktree`。
> 唯一寫出的檔就是本檔(由 `audit-write-guard` 放行)。
> ⛔ 任何措辭不構成 commit/push 預授權。

## 審計結論

**⚠️ 有條件通過** —— 報告的**實質內容經得起重跑**:61 條相符、1 條數字不符(`Middleware` 體積)、
3 條結構上不可重跑(改前狀態已不存在)、8 條需**非報告作者**的第三方補跑(其中 N1 是 backlog 完成判準的關鍵負向對照)。
另有**三項已執行但在現場查不到落檔記錄的裁決**(`F9-plan-review.md` 裁決記錄第 9、10 列至今仍寫「⏳ 待批覆」),
以及**一次與 F9 無關、稽核期間出現又消失的 `package.json` 暫態改動**(見「附帶發現」第 6 條——⛔ 非稽核側所為、⛔ 非稽核側還原)。

計數(稽核側自量):**✓ 相符 61 / ✗ 不符 1 / ⏳ 待第三方補跑 8 / 結構上不可重跑 3**,合計 73 條。

---

## ⚠️ 收稿期間的現場變動(2026-09-12,稽核側自行複查,⛔ 不轉抄通知)

| 事項 | 稽核側自己量到的 | 對本審計的影響 |
|---|---|---|
| `CLAUDE.md` 由**主迴圈**套用 F9 verification 建議的三段改寫 | `git status --short` 顯示 ` M CLAUDE.md`(**未 staged**);`git diff --numstat` = **`32 4`**;位元組 HEAD **21332** → 現行 **24256** | `git status` 對帳**加一列預期的 ` M CLAUDE.md`**,⛔ 不記為不符、⛔ 不記為實作側超範圍(它⛔ 不是本審計的對象) |
| staged 內容是否受影響 | `git diff --cached --name-status \| wc -l` = **31**,`git diff --cached --name-only -- CLAUDE.md` **無輸出** | ⛔ 無影響,#2 的 31 項結論不變 |
| 裁決 ⑨(`h-auto`)架構師答「留」 | 屬對話層事實,稽核側⛔ 無從量;**但現場碼與證據維持有 `h-auto` 的狀態**(#17／#39／#41／#48 皆已核) | 原先標「⏳ 未定案」的那組條目**改標為已定案**,⛔ 不需重跑;唯 #65(拿掉 `h-auto` 的 canary)仍是 ⏳ |
| 架構師已批准 commit | 同上,對話層 | ⛔ 不改變本審計的任何判定;下方「commit 前仍該處理」已據此重寫 |
| **⚠️ `package.json` 一度被加入 `"left-pad": "^1.3.0"`,隨後又消失** | 稽核側三次實測(時間序見「附帶發現」第 6 條);**⛔ 不是稽核側改的、⛔ 也不是稽核側還原的** | #10／#32 的「`yarn.lock`／`package.json` 零變動」**已於事後重驗仍成立**(兩條 `git diff --stat` 皆無輸出、`dependencies` 7 項);但該暫態存在期間 `yarn install --frozen-lockfile` **必定會失敗**(`yarn.lock` 內 `left-pad` 0 命中)⇒ #28 的第三方補跑**須在確認 `package.json` 乾淨之後才跑** |

---

## 稽核側的界線(據實聲明,⛔ 不粉飾)

- **需要建檔(canary)才驗得了的條目,稽核側⛔ 不自跑**(鐵則 9):N1 canary、worktree canary、
  裁決 ⑨ 的 `h-auto` canary、`home.png` 連拍對照。一律標「⏳ 待第三方補跑」,
  ⛔ 不改判 ✓(沒證據不是相符),⛔ 不要求放寬守門。
- **`yarn install --frozen-lockfile` 被 `audit-write-guard` 擋下**(指令含 `install`,判為檔案改動類),
  ⇒ 標「⏳ 待第三方補跑」。但該條的**實質結果**(`yarn.lock`／`package.json` 零變動、無 `sharp`)稽核側已另行實測。
- **凡以「0 命中／無輸出」為證的條目,稽核側一律另配正控**,並自問「這個檔完全空白會不會也過」(鐵則 10)。
  下表凡標 ✓ 且屬「0 命中」型的,括號內都附了稽核側自己跑的正控數字。
- **`yarn lint` / `yarn build` 屬 `CLAUDE.md`「CI 現況」指定的本地嚴格指令**,稽核側實跑;
  兩者只寫 `.next/`(未追蹤產物),⛔ 未動任何被追蹤檔。

---

## 逐條核對表

### 一、git 現況與變更檔案表

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 1 | HEAD `df2b8ff`、本地 = `origin/developers`、尚未 commit | `git rev-parse HEAD` / `git rev-parse origin/developers` | ✓ 兩者皆 `df2b8ffd3e61dbf77cec0760e37ae49daa260f2e` |
| 2 | staged 內容(8 原始碼 + `next.config.js` + 文件與證據) | `git diff --cached --name-status` 逐行 + `wc -l`(收稿當下、`CLAUDE.md` 變動後、`package.json` 異動後各量一次) | ✓ 三次皆 **31 項**:`M` **9**(含 `next.config.js`)、`A` **22**(20 證據檔 + `F9-plan.md` + `F9-verification.md`) |
| 3 | 九檔 `--numstat`:`1 7` / `1 0` / `5 2` / `7 2` / `5 1` / `5 1` / `3 1` / `5 2` / `2 1` | `git diff --cached --numstat -- <九檔>`(事後再複驗四格) | ✓ 逐格相符 |
| 4 | 改後位元組 56 / 273 / 12087 / 3615 / 1970 / 2589 / 2591 / 5249 / 6390 / index 6318 | `wc -c` + `git cat-file -s <index blob>` | ✓ 逐格相符(index blob `73c40574…` = **6318**) |
| 5 | 改前位元組 403 / 238 / 11966 / 3463 / 1860 / 2495 / 2529 / 5111 | `git show HEAD:<檔> \| wc -c` | ✓ 八檔逐格相符 |
| 6 | `components/ServerSection.tsx`「改前 6329」 | `git cat-file -s HEAD:…` = **6257**;回推工作樹改前 = 6390 − 32(import 行) − 2(`<img`→`<Image`) − 27(` width={1920} height={1031}`) = **6329** | ✓ 數字正確,但**指的是工作樹改前、⛔ 不是 HEAD 版**(HEAD 版是 6257)。⚠️ 同欄其餘八格都是 HEAD 版 ⇒ 措辭易誤導,建議報告加註 |
| 7 | `.eslintrc.json` 回到 4 行、只剩 `root` + `extends`、第 3 行行尾逗號移除 | `cat .eslintrc.json` + `git diff --cached` | ✓ 逐字相符 |
| 8 | `next.config.js` 第 5 行插入 `    images: { unoptimized: true },`,既有註解仍是最後一行 | `cat next.config.js` + staged diff | ✓ 逐字相符(既有註解 `// 如果有其他配置可以加在這裡` 原位保留) |

### 二、八項裁決的落碼

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 9 | 裁決 ①丙:10 處 `<Image>` ⛔ 都不寫 `unoptimized` prop、⛔ 無 `remotePatterns` | 對 **index(staged)版** grep `fill`/`priority`/`sizes=`/`placeholder=`/`quality=`/`unoptimized`;`next.config.js` 只出現一次 | ✓ 七個元件檔命中 **0**;唯一 2 筆在 `app/sponsor/page.tsx`,是既有的 `fill-brand-primary` class 與 `placeholder="150"` 輸入框(HEAD 版同一條 grep 也是 **2** ⇒ 非本包新增) |
| 10 | 裁決 ②甲:⛔ 不加 `sharp`、`yarn.lock`／`package.json` 零變動 | `ls node_modules/sharp`、`git diff --stat` + `git diff --cached --stat`、`grep -c sharp package.json`、正控 `jq '.dependencies\|length'`;⚠️ 因「附帶發現 6」的暫態,**事後再驗一次** | ✓ `No such file or directory`;兩條 stat 皆無輸出;`sharp` 0 命中,`dependencies` **7** 項(⇒ 非空測)。**事後複驗仍為 7 項、兩條 stat 仍無輸出** |
| 11 | 裁決 ③甲:10 處全給 `width`/`height`、⛔ 無 `fill` | 對 index 版逐檔數 `<Image` / `width={` / `height={` | ✓ 2/2/2、2/2/2、1/1/1、1/1/1、1/1/1、2/2/2、1/1/1 ⇒ **10 個 `<Image>`、10 組 width+height** |
| 12 | 裁決 ④甲(a):`{session.user?.image && (<Image …/>)}`,⛔ 無 `!`／`any`／`@ts-ignore` | staged diff 全文 | ✓ 逐字相符;第 77 行 `{session && (` 與登出鈕未動 |
| 13 | 裁決 ⑤甲:worktree 在 repo 外、symlink `node_modules` 與 `.env.local` | `ls -la` worktree、worktree `git rev-parse HEAD` + `git status --short` | ✓ worktree HEAD = `df2b8ff…`,`.env.local` 為 symlink,`git status` 恰 **9 檔 ` M`**、⛔ 無 `app/layout.tsx`／`app/staff/page.tsx` |
| 14 | 裁決 ⑥乙:JSON 進 git、PNG ⛔ 不進 | 目錄清點 + `git diff --cached --name-only -- docs/tasks/F9-evidence \| wc -l` | ✓ **16 JSON + 4 根層檔 = 20 已 staged**;**16 PNG 全為 `??`** |
| 15 | 裁決 ⑦甲:⛔ 無新元件、⛔ 不碰 `lib/`、⛔ 不動 `eslint.dirs` | `git status --short` 全域 + `cat next.config.js` | ✓ 無新增元件檔;`eslint.dirs` 仍是 `['app', 'components', 'data', 'middleware.ts']` |
| 16 | 裁決 ⑧甲:`.eslintrc.json` 的 `rules` 與三行說明整段刪 | staged diff `1 7` + `cat` | ✓ 相符 |
| 17 | 裁決 ⑨甲:sponsor #2 className 加 `h-auto` | staged diff + build 產物 HTML | ✓ `class="w-12 h-auto object-contain brightness-0 invert"` 出現在 `.next/server/app/sponsor.html`(⚠️ 架構師 2026-09-12 已答「留」⇒ 本格為終局狀態) |

### 三、P0 改前基線

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 18 | P0-A 改前 `git status` 恰三行 ` M` | —— | **結構上不可重跑**(改前工作樹狀態已不存在)。可間接佐證:`app/layout.tsx`、`app/staff/page.tsx` 至今仍是未 staged 的 ` M`(見 #62) |
| 19 | P0-B 改前 `yarn lint --max-warnings 0` exit=0 | —— | **結構上不可重跑**(改前原始碼已不在硬碟) |
| 20 | N0 改前負向基線:`-c` 指 preset ⇒ exit=1、7 檔 10 處、`grep -c` 印 `10` | 無法重跑改前狀態。**間接實測**:對 **HEAD 版**逐檔算 `<img` 的行:欄 | **結構上不可重跑**,但間接佐證成立:HEAD 版恰 **10 處、7 檔**,位置 `38:13 / 162:21 / 28:13 / 42:17 / 33:21 / 46:15 / 24:11 / 29:11 / 79:15` 與報告 N0 **逐格相同**;第 10 處報告寫 `90:33`(工作樹版),HEAD 版為 `81:25` ⇒ 與「N0 跑在工作樹」一致 |
| 21 | P0-C 九張本地圖尺寸 | `sips -g pixelWidth -g pixelHeight` 逐檔 | ✓ 891×914 / 1920×1080 / 512×512 / 476×512 / 512×512 / 989×1076 / 1024×1024 / 1024×1024 / 1920×1031,**逐格相符** |
| 22 | PayPal 外部圖實為 226×142 | `after/sponsor.json` 的 `naturalWidth/Height` + build 產物 HTML 的 `width="226" height="142"` | ✓ 相符 |
| 23 | P0-D 基線八檔自落檔後未被動過 | `md5 -r *.json *.png` 與 `before/MD5SUMS.txt` 排序後 `diff` | ✓ `diff_exit=0`,八筆 md5 逐筆相同 |
| 24 | P0-E `sharp` 未安裝 | `ls node_modules/sharp` | ✓ `No such file or directory`、exit=1 |

### 四、lint 閘門(P1 / P2 / N1)

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 25 | P1:N0 那條同一指令現在 exit=0 | 逐字重跑 `yarn lint --max-warnings 0 -c node_modules/eslint-config-next/core-web-vitals.js` | ✓ `✔ No ESLint warnings or errors`、**exit=0** |
| 26 | P2:repo 自己的設定下 lint exit=0 | `cat .eslintrc.json` + `yarn lint --max-warnings 0` | ✓ exit=0。**另加鑑別力檢查**:`eslint --print-config app/page.tsx` 顯示 `@next/next/no-img-element` = `["warn"]`(規則**確實開著**),同一份 config 共 **52** 條規則(⇒ 非空 config) |
| 27 | N1:在 `data/` 放 canary ⇒ exit=1、`grep -c` 印 `1`;驗完已刪 | **需建檔 ⇒ 稽核側⛔ 不自跑**(鐵則 9) | **⏳ 待第三方補跑**。⚠️ 稽核側另取得**唯讀等效負向對照**(⛔ 一個檔都沒建):用 **repo 自己的 `.eslintrc.json`** lint 一個 node_modules 內既存、含 `<img>` 的 tsx ⇒ 實際噴出 3 筆 `@next/next/no-img-element` 並 **exit=1**(輸出見下方「⏳ 待第三方補跑」節)。另實測 `yarn lint --max-warnings 0 --error-on-unmatched-pattern` 仍 exit=0 ⇒ `eslint.dirs` 四個 pattern **都確實匹配到檔案**。⇒ 閘門「開著且會紅」有唯讀佐證,但「canary 落在 `data/` 內」這一條仍須第三方 |

### 五、P3 / P3-b 嚴格指令與產物層

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 28 | `yarn install --frozen-lockfile` exit=0 | 被 `audit-write-guard` 擋(指令含 `install`) | **⏳ 待第三方補跑**。⚠️ 補跑前**先確認 `package.json` 乾淨**(見「附帶發現」第 6 條) |
| 29 | `yarn lint --max-warnings 0` exit=0 | 實跑 | ✓ exit=0 |
| 30 | `yarn build` exit=0、`Generating static pages (13/13)`、路由表、`/` 4.07 kB / 110 kB | 實跑 `yarn build` | ✓ exit=0、`✓ Generating static pages (13/13)`、路由表 13 條、`○ / 4.07 kB / 110 kB` 逐格相符 |
| 31 | 「`Middleware 74.8 kB`(index 版 74.9 kB)」 | 同一棵主樹實跑 `yarn build` | ✗ **不符**:稽核側主樹實測 `ƒ Middleware 74.9 kB`(原文見下方「✗ 不符」節) |
| 32 | `git diff --stat yarn.lock package.json` 無輸出 | 實跑(工作樹 + `--cached` 兩條);⚠️ 因暫態異動**事後再驗一次** | ✓ 兩條皆無輸出(事後複驗仍無輸出);正控:`git ls-files` 證明兩檔確實被追蹤 |
| 33 | width/height 的 throw 在 `get-img-props.js` **267–276**(`"width"` 268、`"height"` 273),整段包在第 240 行的 NODE_ENV 判斷內 | `sed -n '240p'`、`sed -n '267,276p'`、`grep -n 'is missing required'` | ✓ 第 240 行為 `if (process.env.NODE_ENV !== "production") {`;throw 分別在 **268** 與 **273** |
| 34 | P3-b:`grep -rEo "[\"'(]/_next/image\?" .next/server/app` 無輸出;兩條正控有輸出 | 重新 `yarn build` 後逐條重跑 | ✓ 主判準**無輸出**;正控 1 命中 `modServer.html` / `modServer/page.js`;正控 2 命中 10 個檔;**額外正控**:`.next/server/app` 底下實有 **64** 個檔被掃 ⇒ ⛔ 非「掃到空目錄」 |

### 六、P4 開頁

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 35 | dev 終端 log 無 `⨯`／`Error:`／`Unhandled`／`error` | 需起 dev server(會覆寫 `.next/`)且**該 log ⛔ 未落檔於 `.evidence/`** | **⏳ 待第三方補跑**(鐵則 7:證據來源不耐久)。⚠️ 且該條是「grep 0 命中」型,報告未附配對正控 ⇒ 空檔案也會過 |
| 36 | 四頁 console 只有既有 404 與 React DevTools info;⛔ 無 `missing required "src"`、⛔ 無 `width or height modified`、⛔ 無 LCP 警告、`nextjs-portal` 為 0 | 需起 dev server + CDP;擷取結果⛔ 未落檔 | **⏳ 待第三方補跑**。⚠️ 報告自己已附「同一套擷取抓到了 404 與 info 兩類訊息」的配對正控,鑑別力聲明本身據實 |
| 37 | 每張圖都有顯示(`after/` 四頁 20 筆 `complete=true`、`naturalWidth` 全非 0) | `jq` 對四檔逐筆掃 | ✓ **0 筆** `complete==false or naturalWidth==0`,而同一條掃描的總筆數是 **20**(⇒ 非空測) |

### 七、P5 外觀證據

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 38 | 儀器正控:`before-index/{sponsor,team,modServer}.json` 與 `before/` 逐欄完全相同;PNG 同雜湊 | `diff <(jq -S . before/X.json) <(jq -S . before-index/X.json)` 三頁 | ✓ 三頁 `diff_exit=0`(**整份 JSON**、不只 imgs);三張 PNG SHA-256 亦相同(見 #49)。**這是全報告最強的一條,稽核側確認成立** |
| 39 | P5(a) 逐欄 diff:四頁只有 sponsor 的 `className` 多 ` h-auto` | 逐字重跑報告那條 `jq -S '.imgs \| map(del(.loading,.decoding))'` 的 diff | ✓ home/team/modServer `diff_exit=0`;sponsor 僅第 68 行 className 一處 |
| 40 | 預期差異 1／2:`loading` auto→lazy、`decoding` auto→async,**各全 20 筆** | **⛔ 不只看剔除後的結果**——另跑**不剔除任何欄位**的完整 diff | ✓ 完整 diff 的差異**恰好**是 `decoding` ×20 + `loading` ×20 + className ×1(5+4+6+5 = 20 筆逐一對上),⛔ 無任何被 `del()` 藏住的第三類差異 |
| 41 | 預期差異 3:sponsor `i:3` className 多 ` h-auto`,同筆 `rect` 完全相同 | `jq -c '.imgs[3] \| {className,rect}'` 前後對比 | ✓ 兩邊 `rect` 皆 `{"x":882,"y":1913,"w":48,"h":30.16}` |
| 42 | 預期差異 4:index 版 `home` 多一筆 img、`docHeight` 3520 vs 3114 | `jq` 掃 16 檔的 `page`/`viewport`/`docHeight`/`imgs\|length` | ✓ 主樹 home 5 筆 / 3114;index home 6 筆 / 3520;**16 檔 `viewport` 全為 `[1280,900]`** |
| 43 | 預期差異 5:#10 那筆兩版 className 不同,各自原樣保留 | `jq` 讀 `before-index`／`after-index` 的 `imgs[5]`;另讀工作樹檔第 91 行 | ✓ index 版 className 為 `w-full h-full object-cover transform group-hover:scale-105 …opacity-50 grayscale…`;工作樹版為 `absolute inset-0 h-full w-full object-cover opacity-65` ⇒ 兩版各自保留 |
| 44 | 預期差異 6:`home.png` 前後雜湊不同是背景影片雜訊;**對照實驗**「同碼連拍兩次也不同(`cb65a0a3…` vs `e40936a1…`)」 | 找遍 `docs/tasks/F9-evidence` 全目錄(36 檔) | **⏳ 待第三方補跑**。⚠️ **雜湊 `e40936a1…` 的那張 PNG ⛔ 不存在於 `.evidence/` 任何位置**(鐵則 7:證據未落檔、無從複核)。稽核側**只能佐證前提**:`components/HomeHero.tsx` 第 10–18 行確有 `<video autoPlay loop muted playsInline>` + `/video/front.mp4` ⇒ 「每次擷取畫格不同」的機制屬實,但**「連拍兩次也不同」這個實驗本身未留下可核物** |
| 45 | P5(b) 四頁 `docHeight` 前後不變 | 同 #42 | ✓ 3114/2524/1870/3842 前後相同;index 版 3520/2524/1870/3842 前後相同 |
| 46 | P5(c) `after/` 逐筆 `lazy async complete=true`、nat 值 | `jq` 逐筆列印 | ✓ 20 筆全 `lazy async true`;nat 值 home `1024,1024,1024,989,1024`、sponsor `1024,1024,891,226`、team `1024,1024,1920,512,476,512`、modServer `1024,1024,989,894,706` **逐格相符** |
| 47 | P5(d) 八檔 `localhost:3100/_next/image` 皆 0;正控 `"currentSrc":"http` = 5/5/4/6 | 逐檔重跑兩條 grep | ✓ 主判準八檔皆 **0**;正控 before 5/5/4/6、after 5/5/4/6 **逐格相符**。**額外鑑別力**:`modServer.json` 內「裸」`_next/image` 實有 **4** 筆(外部正式站 URL)⇒ 報告所加的 `localhost:3100/` 限定詞確實是必要的 |
| 48 | P5(e) `srcset` 全為 null;width/height 與改法表逐筆相符 | 報告該條是**未落檔的現場觀察**。稽核側改用**耐久來源**:`.next/server/app/*.html` 預繪的 HTML | ✓ 全部預繪 HTML 中 `srcset` 命中 **0**,而同批 HTML 實有 **28** 個 `<img `、`loading="lazy"` 28 筆、`decoding="async"` 28 筆(⇒ 非空測);width/height 實際值 `1024×1024`(17+5 筆)、`512×512`(3)、`1920×1080`、`891×914`、`226×142` **與改法表相符** |
| 49 | P5(f) 16 張 PNG 的 SHA-256 與尺寸 | `shasum -a 256` 全部重算 + `sips` 量尺寸 | ✓ **16 筆逐字相符**;`before/after` 的 sponsor/team/modServer **三頁同雜湊**屬實;home 1280×3114、index home 1280×3520 |
| 50 | `capture.sh` 已用 `.bak` 還原、`.bak` 已刪、第 8 行回到 3114、`wc -c` 1295 | `cat capture.sh`、`wc -c`、`ls capture.sh.bak` | ✓ 第 8 行為 `typeset -A H; H=( home 3114 sponsor 2524 team 1870 modServer 3842 )`;1295 B;`capture.sh.bak` 不存在 |

### 八、P6 index 版本

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 51 | P6-1 index 基線 home 6 筆、`docHeight=3520`、#10 那筆 `alt=模組包生存伺服器`、`rect={x:125,y:2831,w:430.5,h:378.5}`、`loading=auto`、`nat=1920` | `jq -r '.imgs[5]'` | ✓ **逐欄逐字相符** |
| 52 | P6-2 worktree 恰 9 檔 ` M`,`--numstat` 與主樹逐檔相同、ServerSection `2 1` | worktree `git status --short` + `git diff --numstat` | ✓ 恰 9 檔;numstat 九格與主樹 staged **逐格相同**。**額外**:稽核側逐檔比對 worktree 檔案與主樹 index blob ⇒ **九檔全部 SAME** ⇒ 「worktree 跑的就是要 commit 的內容」成立 |
| 53 | P6-3 worktree `yarn lint --max-warnings 0` exit=0 | 進 worktree 實跑(⛔ 未改任何檔) | ✓ exit=0。**同棵樹鑑別力對照**:以相對路徑 lint 一個含 `<img>` 的既存檔 ⇒ exit=1 ⇒ 該樹的 lint ⛔ 不是空跑 |
| 54 | P6-3 worktree `yarn build` exit=0、`Done in 9.00s.` | 需在 worktree 寫 `.next/`,且有 `standalone/node_modules` symlink 陷阱(排除它要 `rm`) | **⏳ 待第三方補跑** |
| 55 | P6-3 worktree 內建 canary ⇒ exit=1、刪除後 status 仍是那 9 檔 | 需建檔 | **⏳ 待第三方補跑** |
| 56 | P6-4 index 版逐欄 diff 與主樹同型;#10 那筆只差 `loading` | 逐字重跑 P6-4 的四頁 `jq` diff + 讀 `imgs[5]` | ✓ home/team/modServer 無輸出;sponsor 只差 className;#10 兩版 `rect`、className **逐字相同**,只有 `loading` 由 `auto` 變 `lazy` |
| 57 | P6-5 三條機器判準(numstat `2	1`;diff 恰三行;`ls-files -s` mode 100644、blob = `$BLOB`) | 逐條重跑 | ✓ `2	1	components/ServerSection.tsx`;`+/-` 行 **恰 3 行**(1 行 import + 1 增 1 刪的 img 行);`100644 73c40574a982925d64f50fc3caa58aeb8ca2d486 0`,寫入前的 HEAD blob 為 `1be7861…` **皆相符** |
| 58 | P6-5 禁字:HEAD 版 0、staged diff 0、工作樹 diff 3 | 逐條重跑同一條 `grep -cE 'opacity-65\|any\[\] = \[\]\|min-h-\[260px\]\|max-w-6xl'` | ✓ HEAD **0**、staged diff **0**、index blob **0**;配對正控:工作樹 diff **3**、工作樹檔案本身 **3** ⇒ ⛔ 非空測 |

### 九、P7 註解全稱比對 / P8 對帳

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 59 | P7(a) 八檔整檔 diff,差異只有 import / `<img>`→`<Image>` / `.eslintrc.json` 的 rules 與三行註解 / `next.config.js` 一行 | 自行重跑八檔 staged diff **全文** | ✓ 差異確實只有這些(全文已逐檔看過)。⚠️ **但報告本身並未附上那份全文**(只寫「已逐檔貼在本輪執行記錄」)⇒ 報告讀者無從複核,屬鐵則 7 的「未落檔輸出」;本審計已代為補上 |
| 60 | P7(b) MISSING 只有 `.eslintrc.json` 三行 + `app/sponsor/page.tsx:162`;空測自查數 `6/4/0/2/5/5/3/2` | 自寫同一條全稱比對(`git show HEAD:<檔> \| grep -nE '//\|/\*\|\*/'` 每行 `grep -Fqx` 回查) | ✓ MISSING 清單**逐字相同**;八檔抓到的行數 **6/4/0/2/5/5/3/2** 逐格相符。⇒ 報告自陳「`FeatureRow.tsx` 是 0、那一格是空測」**據實**,且已改以整檔 diff 佐證 ⇒ 符合鐵則 10 |
| 61 | P7(c) ServerSection 用 worktree 版比對、無 MISSING、樣式抓到 5 行 | 稽核側改用**更貼近 commit 的來源**:直接對 **index blob** `git cat-file -p` 做同一條全稱比對 | ✓ HEAD 抓到 **5** 行(非空測)、**0 筆 MISSING** |
| 62 | P8:`app/layout.tsx`、`app/staff/page.tsx` 仍 ` M` 未 staged、本包一個字都沒動 | `git diff --cached --name-only` 對兩檔(無輸出)+ `git diff` 全文 | ✓ 兩檔皆未 staged;工作樹 diff 僅 `1 1` 與 `3 3`,內容為 `metadata.description` 一行與縮排／尾空白(與 F9 無關)。**鑑別力**:兩檔 `next/image` 0 命中、`<img` 也 0 命中 ⇒ 本包確實沒碰它們 |
| 63 | P8:`data/lintCanary.tsx`、`capture.sh.bak`、`_noise/` 都不在 | `ls data/`、`ls` 三個路徑 | ✓ `data/` 只有 `modpackHistory.ts`／`news.ts`／`staff.ts`;三個不得出現的路徑皆 `No such file or directory` |

### 十、裁決 ⑨ 的實測 / 審計確認 / E2E / 仍未驗

| # | 報告的聲稱 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 64 | 前提不成立的原因:Tailwind preflight 已對全站 `img` 下 `height: auto` | `grep -n -A6 '^img,$' node_modules/tailwindcss/src/css/preflight.css` + 產物 CSS | ✓ preflight **第 377–381 行**確為 `img, video { max-width: 100%; height: auto; }`;build 產物 `.next/static/css/39c40d8ecb2b57e5.css`(42741 B)內含 `img,video{max-width:100%;height:auto}` |
| 65 | 主動 canary:拿掉 `h-auto` 後 `rect` 仍是 `48×30.16`、console 無該警告、`.bak` 還原無誤 | 需改檔 | **⏳ 待第三方補跑**(⚠️ 架構師既已裁「留」,此條是**報告聲稱的正確性**問題,⛔ 不再影響落碼) |
| 66 | 措辭:「已照裁決執行,但據實記錄前提不符;要不要保留由架構師決定」 | 逐字讀報告第 581–601 行 | ✓ **據實**,⛔ 未寫成「已改判」、⛔ 未自行改回。⚠️ 架構師 2026-09-12 已答「留」⇒ 該節現況正確,收案時可補一句裁決結果 |
| 67 | ⛔ 機密不入 log:`.env.local` 未讀值、未印出;log 只出現檔名 | 全檔 grep 報告與 16 份 JSON;稽核側全程亦未讀 `.env.local` | ✓ 報告與證據檔內⛔ 無任何疑似密鑰字串;dev log 段只有 `Environments: .env.local` 檔名 |
| 68 | 真機 E2E #9 四步全標 ⏳ 待人工、⛔ 沒用假帳號替代 | 數 E2E 表列數;查 `after/home-signed-in.json` 是否存在;全 16 份 JSON grep `Avatar`／`discordapp` | ✓ **4 步、全部 ⏳ 待人工**;`home-signed-in.json` **不存在**;16 份 JSON 內 `Avatar`／`discordapp` **0 命中**,而同批 JSON 的 `alt` 欄實有 `Nameless Realms Logo` / `Team` / `Yu // 無名` 等值(⇒ 非空測)⇒ **⛔ 沒有偽造 #9 證據** |
| 69 | 「本輪仍然驗不到的」共 9 條 | `awk` 切段後 `grep -c '^\| [0-9]'` | ✓ **9** 條 |
| 70 | U1–U12 十二條全標「已查」 | 切段計數 + 逐條抽驗(U2 禁字、U4 rect、U10 blob、U11 docHeight、U12 sharp、U1 HEAD 第 81 行) | ✓ **12** 列;抽驗六條全部屬實(HEAD `ServerSection.tsx` 第 81 行含 `<img`、第 1／3 行各一次 `'use client';` 屬實) |
| 71 | 守界聲明:⛔ 沒改 Dockerfile／workflow／`package.json`／`.gitignore`／`CLAUDE.md`、⛔ 沒打 tag | `git status --short` 全域 | ✓ **實作側**未動這些檔(最終態:`package.json` 乾淨、`CLAUDE.md` 的改動是主迴圈所為)。⚠️ 期間曾出現與 F9 無關的 `package.json` 暫態,見「附帶發現」第 6 條 |

### 十一、收稿期間變動的複查(稽核側自量,⛔ 不轉抄通知)

| # | 待核事項 | 稽核側怎麼量 | 結果 |
|---|---|---|---|
| 72 | `CLAUDE.md` 為未 staged 的 ` M`,且 staged 的 31 項不受影響 | `git status --short`、`git diff --cached --name-only -- CLAUDE.md`、`git diff --cached --name-status \| wc -l` | ✓ ` M CLAUDE.md`(未 staged);`--cached` 對 `CLAUDE.md` 無輸出;staged 仍 **31**。`git diff --numstat -- CLAUDE.md` = **`32 4`**,位元組 **21332 → 24256** |
| 73 | `CLAUDE.md` 的改寫沒有誤刪既有內容(全稱比對) | 稽核側**自跑**:`git show HEAD:CLAUDE.md` 的**每一行**用 `grep -Fqx` 回查現行檔 | ✓ HEAD 共 **304 行**(⇒ 非空比對),MISSING 恰 **4 行**,且四行全是被刻意取代的 F8「`no-img-element` 已 off、10 處未修」那段(逐字列於「附帶發現」第 5 條)⇒ **⛔ 無誤刪**。另核新增的地雷第 7 條所引 `image-optimizer.js` 第 497–500 行、第 6 條補述的 `2	1` 判準,皆與稽核側實測一致 |

---

## ✗ 不符(1 條,附原始輸出)

### #31 `Middleware` 體積:報告寫主樹 74.8 kB,稽核側主樹實測 **74.9 kB**

報告「回歸守門」節原文:

> `yarn build` 路由表與改前同樣 13 條,`Middleware 74.8 kB`(index 版 74.9 kB)。

稽核側 2026-09-12 在**同一棵主樹**實跑 `yarn build` 的原始輸出(尾段):

```
+ First Load JS shared by all            84.2 kB
  ├ chunks/69-9685b12e726c2066.js        28.9 kB
  ├ chunks/fd9d1056-ec06e3651eb582df.js  53.4 kB
  └ other shared chunks (total)          1.96 kB


ƒ Middleware                             74.9 kB

○  (Static)   prerendered as static content
λ  (Dynamic)  server-rendered on demand using Node.js

Done in 8.60s.
exit=0
```

⚠️ 同一次輸出裡的其他數字(13 條路由、`○ / 4.07 kB / 110 kB`、`✓ Generating static pages (13/13)`)**都與報告相符** ⇒ 不是整張表抄錯,只有這一格。
⛔ 稽核側**不判斷這一格要不要緊**——判讀回規劃側。

---

## ⏳ 待第三方補跑(8 條;派工對象:**非本報告作者**的 `nr-implementer`)

> 派工三條件(鐵則 9):**先不看報告怎麼寫 / 自行設計自行取證 / 最後才比對**。補跑結果與報告不符 ⇒ 必改。

| # | 條目 | 為什麼稽核側跑不了 | 建議的補跑方式 |
|---|---|---|---|
| 27 | **N1**:repo 自己的設定下閘門真的會擋(canary 落在 `data/`) | 需建 `data/lintCanary.tsx` ⇒ 改檔,鐵則 5 禁止 | 依 plan 原法建檔 → `yarn lint --max-warnings 0` 應 exit=1、`grep -c` 應印 1 → `rm` → `git status --porcelain data/` 應無輸出 |
| 28 | `yarn install --frozen-lockfile` exit=0 | 指令被 `audit-write-guard` 判為檔案改動類 | **先確認 `package.json` / `yarn.lock` 乾淨**(見附帶發現 6),再實跑並貼 exit code |
| 35 | P4 dev 終端 log 無錯誤字樣 | 需起 dev server;且**該 log ⛔ 未落檔** | 重跑並把 log **落檔進 `docs/tasks/F9-evidence/`**;⚠️ 「0 命中」要配正控(例:同時印出 log 實際行數) |
| 36 | P4 四頁瀏覽器 console | 需 dev server + CDP;擷取結果⛔ 未落檔 | 同上,擷取結果落檔 |
| 44 | `home.png`「同碼連拍兩次也不同」的對照實驗 | 需重新擷取;**且對照那張 PNG(`e40936a1…`)⛔ 不在 `.evidence/`,已無從複核** | 重做一次連拍,**兩張都落檔**(或至少把雜湊與檔案一起保管);⚠️ 這是目前唯一用來解釋「`before/after` 的 `home.png` 雜湊不同」的證據 |
| 54 | worktree(index 版)`yarn build` exit=0 | 需在 worktree 寫 `.next/`,且排除 `standalone/node_modules` symlink 需 `rm` | 先 `rm .next/standalone/node_modules` 再 `rm -rf .next`,然後 `yarn build`;完成後回主樹 `yarn install --frozen-lockfile` 確認 `node_modules` 完整 |
| 55 | worktree 內的 canary 負向對照 | 需建檔 | 同 #27,在 worktree 內做 |
| 65 | 裁決 ⑨ 的 `h-auto` canary(拿掉後 `rect` 是否仍 48×30.16) | 需改 `app/sponsor/page.tsx` + 重跑度量 | 備份檔紀律(⛔ 不用 `git checkout`)。⚠️ 架構師已裁「留」⇒ 這條只影響**報告該段陳述的正確性**,⛔ 不影響要 commit 的碼 |

### ✅ 原「與未定案的裁決 ⑨ 相關」的條目 —— **已定案(架構師 2026-09-12 答「留」),⛔ 不需重跑**

#17(落碼)、#39 / #41(P5(a) 的 className 差異與 `rect` 相同)、#48(產物 HTML 內 `class="w-12 h-auto …"`)、#64(preflight 前提)、#66(措辭)
——六條都是在「有 `h-auto`」的現況下量的,與終局狀態一致。

---

## 附帶發現(⛔ 不在報告的聲稱範圍,但影響收案判讀)

1. **⚠️ 已執行的三項裁決,在現場仍查不到落檔記錄。**
   `docs/tasks/F9-plan-review.md`(至今仍是未追蹤的 `??`)「裁決記錄」表:
   - 第 **9** 列(待裁 4,證據根層四檔進 git)末欄仍為 `⏳ 待批覆（主迴圈 2026-09-11 已提請）`,
     但那四個檔**已經 staged**;
   - 第 **10** 列(裁決點 ⑨)末欄仍為 `⏳ 待批覆（**擋 plan §12 步驟 3**）`,
     但 `h-auto` **已寫進碼**、且架構師 2026-09-12 已答「留」;
   - 2026-09-12 的兩項新裁決(**採用 verification 的 `CLAUDE.md` 三段改寫**、**批准 commit**)
     在該表內**尚無任何一列**。
   ⇒ 依該節自訂流程,應由 `nr-planner` 逐字追加。⛔ 稽核側不判斷責任歸屬,只記錄「已執行 ≠ 有記錄」。

2. **⚠️ 本輪實測到 `exit 0 ≠ 檢查真的跑了` 的兩個新實例**(可補進 `CLAUDE.md`「CI 現況」的既有清單,目前是①–⑤):
   - **`next lint --file` 給絕對路徑時,靜默一個檔都不 lint、exit 0。** 同一個檔改用相對路徑則會噴 3 筆 `no-img-element` 並 exit=1。稽核側原本想用「從主樹 lint worktree 的九個檔」當唯讀槓桿,就是被這一點作廢的(它回報 `✔ No ESLint warnings or errors` 但其實什麼都沒看)。
   - **`next lint --dir` 指向會被 ignore 的目錄時,同樣 exit 0**(pattern 不匹配預設不報錯)。
   ⇒ 凡拿 `next lint --file`／`--dir` 的 exit 0 當證據,**必須先證明那條路徑真的會紅**。

3. **`docs/tasks/F9-evidence/README.md` 現為 3468 B**,內含 2026-09-11 追加的「⚠️ 更正」段(推翻初版對雙 Navbar 成因的說法)。報告把它僅列為「新增(證據檔)」,未提內容在本輪被修訂過。屬低風險的措辭問題,收案時據實寫明即可。

4. **報告的「`before/` 是主迴圈拍、`after/` 是我拍」風險(仍未驗第 8 條)確實被壓到很低**:稽核側獨立確認 `before-index/{sponsor,team,modServer}.json` 與 `before/` 對應檔**整份 JSON 逐字相同**、PNG **SHA-256 相同**。這條自我揭露是誠實且有效的。

5. **`CLAUDE.md` 全稱比對的 4 行 MISSING 逐字如下**(稽核側自跑,⛔ 非轉抄),全部落在被刻意取代的同一段:
   ```
   - ⚠️⚠️ **但⛔ 不得單獨寫「lint 通過」**：F8 依裁決① 丙**明確關閉了
     `@next/next/no-img-element`**（既有 10 處 `<img>` 未修，見 backlog F9）
     ⇒ 「CI／lint」欄一律據實寫「**綠，但 `no-img-element` 已 off、10 處未修**」。
     ⚠️ 該規則在 F9 完成前**對全 repo 不被檢查**。
   ```
   ⇒ HEAD 的 304 行中其餘 300 行**全部原字保留**,⛔ 無誤刪。

6. **🔴 稽核期間 `package.json` 出現又消失的暫態改動(與 F9 無關;⛔ 非稽核側所為、⛔ 非稽核側還原)。**
   稽核側對現場唯讀,全程未執行任何會寫 `package.json` 的指令(`yarn install` 那一條被 hook 擋在執行之前)。
   時間序(三次實測,皆為稽核側自量):
   - **(T1,稽核中段)**:`git diff --stat yarn.lock package.json` **無輸出**;`jq '.dependencies|length'` = **7**。
   - **(T2,稽核末段)**:`git status --short` 出現 ` M package.json`,`git diff -- package.json` 原文為
     ```
     -    "tailwind-merge": "^2.2.1"
     +    "tailwind-merge": "^2.2.1",
     +    "left-pad": "^1.3.0"
     ```
     且**未 staged**(`git diff --cached --name-only -- package.json` 無輸出)。
     同時實測:`grep -c "left-pad" yarn.lock` = **0**、`ls -d node_modules/left-pad` = `No such file or directory`、
     `app`/`components`/`data`/`middleware.ts` 內引用 `left-pad` 的檔案數 = **0**。
   - **(T3,緊接 T2)**:`git status --short -- package.json` **無輸出**(乾淨)、`jq '.dependencies'` 回到原本 **7** 項、
     `stat` 顯示 mtime `Sep 12 00:12:37 2026`、955 bytes。
   ⇒ 事實:**該套件從未進入 `yarn.lock`、從未被安裝、從未被任何原始碼引用,且已不在工作樹**;
   staged 的 31 項**自始至終未受影響**(T2 當下也是 31)。
   ⚠️ 但**該暫態存在期間 `yarn install --frozen-lockfile` 必定失敗**(lock 與 manifest 不同步)
   ⇒ #28 的第三方補跑**務必先確認 `package.json` 乾淨再跑**,否則會拿到一個與 F9 無關的紅燈。
   ⛔ 稽核側**不推測成因、不判斷責任**,只留痕;建議主迴圈在 commit 前**再跑一次** `git status --short` 確認。

---

## 稽核側認為「commit 前仍該處理」的理由(事實陳述,⛔ 不代判)

> ⚠️ 架構師已批准 commit;以下⛔ 不是反對,是把**尚未閉合的格子**列出來,由規劃側／主迴圈決定要不要先補。
> ⚠️ 原先列為第 1 項的「裁決 ⑨ 未定案」**已解除**(架構師 2026-09-12 答「留」)。

1. **commit 前請再確認一次 `git status --short`** —— 附帶發現 6 顯示工作樹在稽核期間曾出現與 F9 無關的
   `package.json` 改動(已消失)。`git add` 逐檔、⛔ 不用 `git add .` 仍是必要的。
2. **`F9-plan-review.md` 的裁決記錄尚未回填**(第 9、10 列仍「⏳ 待批覆」,2026-09-12 的兩項裁決尚無列)。
   ⇒ commit 之後,repo 裡會出現「碼已改、證據已進 git,但准它的裁決在檔案上還是待批覆」的狀態。
3. **backlog F9 的完成判準本體(N1:規則重新生效後閘門真的會擋)尚未由第三方獨立證實。**
   稽核側取得的是**唯讀等效對照**(以 repo 設定 lint node_modules 內含 `<img>` 的檔 ⇒ exit=1),
   ⛔ 不等於 plan 指定的「canary 落在 `eslint.dirs` 內」那一條。
   ⚠️ 而**新版 `CLAUDE.md` 已把這條 canary 寫成日後引用 lint 綠的必要負向對照之一** ⇒ 值得先補實。
4. **報告有一格數字不符**(#31 `Middleware 74.8` vs 實測 `74.9`),`verification` 需更正。
5. **#9 Navbar 頭像的真機 E2E 四步全未執行**(⏳ 待架構師本人登入),
   這是 10 處裡唯一有邏輯改動(條件渲染)且無任何外觀證據的一處。
6. **另外 5 條 ⏳ 待第三方補跑**(#28／#35／#36／#54／#55)在 commit 後仍可補,
   但 **#44**(`home.png` 雜湊差異的唯一解釋)其對照物已不存在 ⇒ 拖越久越難補。

> ⛔ 本審計任何措辭均不構成 commit/push 預授權。

---

## 修畢後的回報格式(給實作側／第三方)

- 貼:修正後的 `verification` 段落清單、第三方補跑 8 條的**原始輸出**(含 exit code)、與本審計逐條對號。
- ⛔ **commit/push 仍待架構師確認。**
