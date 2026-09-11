# F9 實作計畫（`docs/tasks/F9-plan.md`）

> 實作側（nr-implementer）產出，2026-09-10。**⛔ 本輪只產計畫，未動任何原始碼。**
> 依開發守則 7：**等 `docs/tasks/F9-plan-review.md` 放行才動手**。
> HEAD：`df2b8ff`（本檔自查：`git rev-parse --short HEAD` 實跑得 `df2b8ff`）。
> 分支：`developers`。

---

## 0. 本檔的量測紀律聲明

⚠️ 依實作側鐵則 7，**本檔出現的每一個數字都是我自己在本輪實跑／實讀取得的**，
⛔ 不從 `F9.md`、`F9-background.md` 或主迴圈訊息轉抄。取得方式逐項記於 §3 與 §5。
凡我**沒有**自己量到的，一律標「⛔ 未實查」並寫明原因（見 §9）。

⚠️ 本輪已跑過的指令都是**唯讀**（`git status` / `git show` / `sed` / `cat` / `sips` /
`yarn lint`），⛔ 沒有寫入任何原始碼、⛔ 沒有 `git add`、⛔ 沒有 commit。

---

## 1. 八項裁決的落地（每點寫明「依裁決 X」）

| 裁決 | 內容（架構師 2026-09-10 於**白話版摘要**上拍板，⛔ 未審閱 `F9.md` 全文、⛔ 未審閱本 plan） | 本計畫的具體動作 |
|---|---|---|
| **①丙** | 圖片最佳化路線＝全站 `images: { unoptimized: true }`，10 處 `<Image>` **都不寫** `unoptimized` prop | 在 `next.config.js` 第 4 行之後、第 5 行既有註解之前插入一行 `    images: { unoptimized: true },`（見 §4.2）。10 處元件端⛔ 不加任何 `unoptimized`。⛔ 不加 `remotePatterns`（我已自核 `node_modules/next/dist/shared/lib/get-img-props.js` 第 88–96 行：`generateImgAttrs` 在 `unoptimized` 時直接 `return { src, srcSet: undefined, sizes: undefined }`，loader 從不被呼叫 ⇒ hostname 檢查不會跑；第 228–230 行 `if (config.unoptimized) { unoptimized = true }` 強制每張生效） |
| **②甲** | ⛔ 不加 `sharp`；「最佳化另開一筆」由主迴圈回填 backlog | `package.json` / `yarn.lock` **零變動**（P3 以 `git diff --stat` 實證）。⛔ 不跑 `npm install`、⛔ 不 `yarn add` |
| **③甲** | 10 處全部給 `width`/`height` 數字，⛔ 不用 `fill` | 逐處數值見 §3 表。#2、#3 用**實量比例值**；陣列／prop 驅動的 #4/#5/#6/#10 用**名目值**並在表中寫明理由 |
| **④甲+甲** | (a) #9 改條件渲染；(b) 改後由架構師本人登入拍證據，一次一步 | (a) 見 §3 第 9 列與 §4.1；(b) 步驟表見 §6「E2E #9」，⚠️ 執行時**一次只給一步**。verification 據實記「**改後對期望值，無改前對照**」 |
| **⑤甲** | `git worktree add` 開 HEAD 乾淨樹，symlink `node_modules` 與 `.env.local`，在那裡拍 #10 改前／改後，並跑 index 版本的 lint + build | 見 §5（含埠實查結果與 `capture.sh` 高度參數的處置） |
| **⑥乙** | `**/*.json` 進 git；PNG ⛔ 不進，只記路徑 + `shasum -a 256`；PNG 在 `git status` 是**預期的 `??`** | 見 §7 檔案清單與 §8 的 P8 對帳。⚠️ **有一個未涵蓋的縫**：`F9-evidence/` 內的 `README.md` / `metrics.js` / `capture.sh` / `MD5SUMS.txt` **不是 `.json`**，裁決 ⑥ 沒說 ⇒ 列為 §10 待裁事項 1 |
| **⑦甲** | ⛔ 不抽共用元件、⛔ 不碰 `lib/` | 10 處各自寫 `<Image …>`；⛔ 不新增任何檔到 `components/` 或 `lib/`；`next.config.js` 的 `eslint.dirs` ⛔ 不動（不觸發 F6） |
| **⑧甲** | `.eslintrc.json` 刪 `rules` 區塊與第 4–6 行三行說明；`"root"` / `"extends"` 兩鍵一個字元都不動 | 見 §4.3。⚠️ **一個必須講明的例外**：第 3 行 `"extends": "next/core-web-vitals",` 行尾的**逗號**必須拿掉，否則不是合法 JSON。⇒ 兩個鍵的**鍵名與值文字**一字不動，只移除該分隔逗號。列為 §10 待裁事項 2（若架構師認為連逗號都不能動，唯一替代是保留一個空 `"rules": {}`，我⛔ 不自行選） |

**另兩項更早已裁（⛔ 不再是裁決點）**：
- 驗法＝丙（最小改法 + 改前／改後外觀證據由架構師人工看）。
- `components/ServerSection.tsx` 的長期未 commit 舊改動 **⛔ 不進 F9 commit**，只收 `<img>` 那幾行（含 import）。

**額外**：`.claude/launch.json` 進 git 由主迴圈收案處理，⛔ 不在本計畫範圍（P8 對帳時它是**預期的 `??`**）。

---

## 2. 我在本輪清掉的「⛔ 未實查，實作側必查」項目

任務包／背景檔標為未實查的項目，逐條查掉：

| 出處 | 原標記 | 我的實查結果 | 取得方式 |
|---|---|---|---|
| `F9.md` 裁決 ④(a) | next-auth Discord provider 的 `profile()` 是否**恆給** `image` | ✅ **恆給**。`node_modules/next-auth/providers/discord.js` 第 15–29 行：`avatar === null` 時給 `https://cdn.discordapp.com/embed/avatars/{n}.png`，否則給 `https://cdn.discordapp.com/avatars/{id}/{avatar}.{png\|gif}`；兩條路都寫進 `image`。本 repo 的 `app/api/auth/[...nextauth]/route.ts` 只覆寫 `authorization.params.scope`，**⛔ 沒有覆寫 `profile()`** ⇒ 「沒頭像」分支實務上到不了 | 我自己 `cat -n` 兩個檔 |
| `F9.md` §C-3 | `app/layout.tsx` 的 **HEAD 版**是否也掛 `<Navbar />` | ✅ **有**。`git show HEAD:app/layout.tsx` 第 24 行 `<Navbar />` ⇒ **雙 Navbar 在 HEAD 就存在**，⛔ 不是那個未 commit 舊改動造成的。該舊改動實際只有一行：`description: "Minecraft Modded Community"` → `"Minecraft Mod Community"` | 我自己 `git show` + `git diff app/layout.tsx` |
| `F9.md` §A-4 第 10 列 | HEAD 版 `ServerSection.tsx` 的 `<img>` 行號與 className | ✅ **HEAD 第 81 行**。className 實際為 `w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0`。⚠️ **任務包 §A-4 抄漏了 `transform` 與 `transition-transform duration-1000`**（寫成 `w-full h-full object-cover group-hover:scale-105 opacity-50 grayscale group-hover:grayscale-0`）⇒ **以我實讀的全文為準** | 我自己 `git show HEAD:components/ServerSection.tsx \| cat -n` |
| `F9.md` §A-5 | HEAD 版 `ServerSection.tsx` 的 import 位置 | ✅ 第 5–6 行（`react`、`lucide-react`，單引號）。⚠️ 第 1 與第 3 行**各有一次** `'use client';`（HEAD 與工作樹皆然，⛔ 本包不修） | 同上 |
| `F9.md` §G | 第二個 dev server 的埠 3101 是否空閒 | ✅ 本輪實查 `lsof -iTCP:310{0,1,2} -sTCP:LISTEN`：**3100 / 3101 / 3102 皆空閒**。⚠️ 派工訊息說「3100 已被主迴圈 dev server 佔用」——**本輪實查時它已不在**；執行前一律**重查一次**，⛔ 不憑本檔的快照決定 | 我自己 `lsof` |
| `F9.md` P5 | `jq` 是否可用 | ✅ `/usr/bin/jq` 存在；`node -v` = `v22.19.0` | 我自己 `which jq` / `node -v` |
| `F9.md` P0-D | `before/` 基線是否存在 | ✅ 存在：`home/sponsor/team/modServer` 各一 `.json` 一 `.png`，另有 `MD5SUMS.txt`、`README.md`、`metrics.js`、`capture.sh`。⇒ **改後一律用 `metrics.js` + `capture.sh` 這同一套**，⛔ 不另寫 | 我自己 `ls -laR` + `cat` |
| `F9-background.md` §2-3 註 | #9 空 `src` 是否會炸頁 | ✅ **不會 throw**。`get-img-props.js` 第 223–226 行：`if (!src …) { unoptimized = true; isLazy = false }`；第 244–248 行 dev 檢查 `if (!src) { unoptimized = true } else { …width/height throw… }` ⇒ 空 `src` 連寬高檢查都跳過。⇒ 背景檔「會丟例外」的推測**是錯的** | 我自己 `sed -n '215,285p'` 讀原始碼 |
| `F9.md` §B-3 | 非 `fill` 缺 `width`/`height` 只在 dev 炸 | ✅ 整段包在 `if (process.env.NODE_ENV !== "production")` 內（第 240 行），`missing required "width"/"height" property` 在第 253–262 行 throw ⇒ **`yarn build` 抓不到，必須實際開頁** | 同上 |
| `F9.md` §B-4 | standalone + production + 無 `sharp` ⇒ `/_next/image` 回 500 | ✅ `node_modules/next/dist/server/image-optimizer.js` 第 497–500 行：`if (showSharpMissingWarning && nextConfigOutput === "standalone") { log.error(…); throw new ImageError(500, "Internal Server Error") }` | 我自己 `sed -n '490,505p'` |
| `F9.md` §B-5 | `next/image` 最終多加哪些屬性 | ✅ `get-img-props.js` 第 359–371 行 `imgStyle`：**非 `fill` 時只有 `{ color: "transparent" }`**；第 419–434 行最終 props：`loading`（lazy）、`fetchPriority`、`width`、`height`、`decoding: "async"`、`className`（原樣透傳）、`style`、`sizes`、`srcSet`、`src`。⇒ rect / `object-fit` / `opacity` / `filter` / `border-radius` / `padding` **不受影響** | 同上 |
| `F9.md` §A-3 | `sharp` 是否已安裝 | ⛔ **本輪未查**（P0 會查 `ls node_modules/sharp`）。⚠️ 但②甲下我們**不需要**它，且我不新增任何套件 | — |

---

## 3. 10 處逐一改法表（每個數值我自己核過一次）

**數值來源共三種，逐處標明**：
- **(實量-檔案)**：我自己跑 `sips -g pixelWidth -g pixelHeight public/images/<f>.png`（2026-09-10 本輪實跑）。
- **(實量-DOM)**：我自己 `cat` `docs/tasks/F9-evidence/before/*.json`，取該張 `<img>` 的 `naturalWidth`/`naturalHeight`。
- **(名目)**：來源尺寸不一（陣列／prop 驅動），父層或自身已用 CSS 定死尺寸 ⇒ `width`/`height` 只當**長寬比提示**，⛔ 不影響版面。

**我本輪 `sips` 實跑的原始輸出**（9 個本地檔）：
```
sponsor.png    891 914
team.png       1920 1080
quasi.png      512 512
Moon_Flame.png 476 512
liujuhsin.png  512 512
server_quasi.png 989 1076
launcher.png   1024 1024
logo.png       1024 1024
server_01.png  1920 1031
```

**我本輪從 `before/*.json` 讀到的 `naturalWidth×naturalHeight`**（用來核 `sips` 與外部圖）：
`logo.png` 1024×1024、`sponsor.png` 891×914、`team.png` 1920×1080、
`quasi.png` 512×512、`Moon_Flame.png` 476×512、`liujuhsin.png` 512×512、
`server_quasi.png` 989×1076、`launcher.png` 1024×1024、
**PayPal `pp_cc_mark_111x69.jpg` = 226×142**（⚠️ 檔名寫 111×69 是**騙人的**，實際是 2 倍圖）、
`namelessrealms.com` 的 `vote` 894×1080、`regular` 706×865。
⇒ 兩把尺（`sips` 對本地檔、DOM `naturalWidth` 對全部）**逐檔一致**。

### 3.1 改法表

| # | 檔:行（現況） | 現行原文 | 改後原文 | `width`×`height` | 數值怎麼來的 | 父層要不要動 |
|---|---|---|---|---|---|---|
| 1 | `app/sponsor/page.tsx:38`（多行） | `<img`<br>`  src="/images/sponsor.png"`<br>`  alt="Sponsor"`<br>`  className="w-full h-full object-contain p-12 drop-shadow-[0_20px_60px_rgba(255,125,0,0.15)] transform group-hover:scale-105 transition-all duration-1000"`<br>`/>` | 同結構，`<img`→`<Image`，在 `alt` 之後插 `width={891}` / `height={914}` 兩行 | **891×914** | (實量-檔案) + (實量-DOM) 一致 | ⛔ 不動。父層 `aspect-square` 定尺寸，自身 `w-full h-full` |
| 2 | `app/sponsor/page.tsx:162`（單行） | `<img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg" alt="PayPal" className="w-12 object-contain brightness-0 invert" />` | 同單行，`<img`→`<Image`，`alt` 後插 `width={226} height={142}` | **226×142** | (實量-DOM) `before/sponsor.json` `i:3` `naturalWidth:226,naturalHeight:142`。**驗算**：`w-12`=48px，48×142/226 = **30.159…**，與該筆 `rect.h` **30.16** 相符 ⇒ 比例給對 | ⛔ 不動。⚠️ 這是**只設寬**的兩處之一，比例錯會改載入前佔位高度 |
| 3 | `app/team/page.tsx:28`（多行） | `<img`<br>`  src="/images/team.png"`<br>`  alt="Team"`<br>`  className="w-full h-auto block transform group-hover:scale-105 transition-all duration-1000"`<br>`/>` | 同結構，`<img`→`<Image`，`alt` 後插 `width={1920}` / `height={1080}` | **1920×1080** | (實量-檔案) + (實量-DOM)。**驗算**：容器寬 1022px，1022×1080/1920 = **574.875**，與 `before/team.json` `i:2` 的 `rect.h` **574.88** 相符 | ⛔ 不動。⚠️ 這是 `h-auto` 那一處 |
| 4 | `app/team/page.tsx:42`（多行，`{staff.img}`） | `<img`<br>`  src={staff.img}`<br>`  alt={staff.name}`<br>`  className="w-full h-full object-cover transform group-hover:scale-110 transition-all duration-700"`<br>`/>` | 同結構，`alt` 後插 `width={512}` / `height={512}` | **512×512（名目）** | (名目)。三個來源實量為 512×512 / **476×512** / 512×512 ⇒ 尺寸不一，取 512×512。**⛔ 不影響版面的理由**：父層 `w-32 h-32 … overflow-hidden` 定死尺寸、自身 `w-full h-full object-cover` ⇒ 三張的 `rect` 在基線 JSON 都是 **126×126**（`before/team.json` `i:3/4/5` 實讀），與 `width`/`height` 無關 | ⛔ 不動。⛔ **不往 `members` 陣列加尺寸欄位**（鐵則 5 既有違例，本包不搬） |
| 5 | `components/FeatureRow.tsx:33`（多行，`{img}` prop） | `<img`<br>`  src={img}`<br>`  alt={label}`<br>`  className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(255,125,0,0.1)] transform group-hover:scale-105 transition-all duration-1000"`<br>`/>` | 同結構，`alt` 後插 `width={1024}` / `height={1024}` | **1024×1024（名目）** | (名目)。`/modServer` 傳入三個來源：本地 `server_quasi.png` 989×1076、外部 vote 894×1080、外部 regular 706×865（全為 (實量-DOM)）⇒ 三者不一。**⛔ 不影響版面的理由**：父層 `relative w-full h-full max-w-md aspect-square` 是定尺寸方盒、自身 `w-full h-full object-contain` ⇒ 三張 `rect` 在 `before/modServer.json` 皆為 **448×448**（`i:2/3/4` 實讀） | ⛔ 不動。⛔ 不改 prop 介面（`FeatureRowProps` 不加 `width`/`height`） |
| 6 | `components/FeatureSection.tsx:46`（多行，`{f.img}`） | `<img`<br>`  src={f.img}`<br>`  alt={f.label}`<br>`  className="w-full h-full object-contain drop-shadow-[0_20px_60px_rgba(255,125,0,0.15)] transform group-hover:scale-105 transition-all duration-1000"`<br>`/>` | 同結構，`alt` 後插 `width={1024}` / `height={1024}` | **1024×1024（名目）** | (名目)。兩個來源：`server_quasi.png` 989×1076、`launcher.png` 1024×1024 ⇒ 不一。**⛔ 不影響版面的理由**：父層 `relative w-full h-full max-w-lg aspect-square`、自身 `w-full h-full object-contain` ⇒ 兩張 `rect` 在 `before/home.json` 皆為 **492×504**（`i:3/4` 實讀） | ⛔ 不動。⛔ **不往 `features` 陣列加尺寸欄位**（鐵則 5 既有違例） |
| 7 | `components/HomeHero.tsx:24`（單行） | `<img src="/images/logo.png" alt="Nameless Realms Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-4 drop-shadow-[0_0_30px_rgba(255,125,0,0.3)]" />` | 同單行，`alt` 後插 `width={1024} height={1024}` | **1024×1024** | (實量-檔案) + (實量-DOM) | ⛔ 不動。尺寸寫在**自身** class；`before/home.json` `i:2` rect **192×192**（1280 寬 ⇒ `md:w-48` 生效） |
| 8 | `components/Navbar.tsx:29`（單行） | `<img src="/images/logo.png" alt="Nameless Realms Logo" className="w-10 h-10 object-contain" />` | 同單行，`alt` 後插 `width={1024} height={1024}` | **1024×1024** | 同上 | ⛔ 不動。四頁基線各有**兩筆** rect `40×40`（雙 Navbar，⛔ 本包不修） |
| 9 | `components/Navbar.tsx:79`（單行，在第 77 行 `{session && (` 之內） | `<img src={session.user?.image \|\| ""} alt="Avatar" className="w-8 h-8 rounded-full border border-brand-primary" />` | **依裁決 ④(a) 改條件渲染**：<br>`{session.user?.image && (`<br>`  <Image src={session.user.image} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full border border-brand-primary" />`<br>`)}` | **32×32（名目）** | (名目)。Discord CDN 頭像實際像素**⛔ 未實查**（只有架構師登得進）；自身 `w-8 h-8` = 32px 定死尺寸 ⇒ 取 32×32 讓比例＝1:1、與 CSS 一致 | ⛔ 不動第 77 行 `{session && (`、⛔ 不動第 80–82 行登出按鈕。⚠️ 「沒頭像」分支實務上到不了（§2 已核） |
| 10a | `components/ServerSection.tsx:90`（**工作樹版**，單行） | `<img src={s.image} alt={s.name} className="absolute inset-0 h-full w-full object-cover opacity-65" />` | 同單行，`alt` 後插 `width={1920} height={1031}` | **1920×1031（名目）** | (實量-檔案) `server_01.png` 1920×1031。標名目是因為 `{s.image}` 由陣列驅動；父層 `relative min-h-[260px] overflow-hidden` + 自身 `absolute inset-0 h-full w-full object-cover` ⇒ 比例不影響版面 | ⛔ 不動。⚠️ 工作樹 `servers: any[] = []` ⇒ **這一版渲染不出來**，改它純粹是為了讓工作樹 lint 過 |
| 10b | `components/ServerSection.tsx:81`（**HEAD／index 版**，單行） | `<img src={s.image} alt={s.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0" />` | 同單行，`alt` 後插 `width={1920} height={1031}` | **1920×1031（名目）** | 同上 | ⛔ 不動。⚠️ className 與 10a **不同**，各自原樣保留、⛔ 不互相對齊 |

### 3.2 逐處通則（⛔ 不得偏離）

- `src`、`alt`、`className` **逐字保留**，含 `transform` / `group-hover:*` / `drop-shadow-[…]` / `brightness-0 invert` / `opacity-*` / `grayscale` / `absolute inset-0`。
- **只加 `width` / `height`**。⛔ 不加 `priority`、`sizes`、`placeholder`、`quality`、`style`、`unoptimized`、`fill`（裁決 ①丙 + ③甲 + 範圍節）。
- **排版風格不變**：原本單行的改後仍單行、原本多行的改後仍多行、縮排沿用該檔既有寬度（`FeatureRow.tsx` / `ServerSection.tsx` 為 4 空白系；其餘為 2 空白系）。
- 每檔加一行 `import Image from …'next/image';`，**位置與引號規則**（我本輪逐檔 `cat -n` 核過現況）：

| 檔 | 現況 | 插入位置 | 引號 |
|---|---|---|---|
| `app/sponsor/page.tsx` | 3 `'react'`／4 `'lucide-react'`／5 `"@/components/Navbar"` | **第 4 行之後**（成為新第 5 行，`@/` 之前） | 單 `'next/image'` |
| `app/team/page.tsx` | 3 `"@/components/Navbar"`（唯一 import，雙引號） | **第 3 行之前**（成為新第 3 行） | 雙 `"next/image"`（與該檔唯一風格一致） |
| `components/Navbar.tsx` | 3 `'react'`／4 `'next/link'`／5 `'lucide-react'`／6 `"next-auth/react"` | **第 4 行之後** | 單 `'next/image'` |
| `components/FeatureRow.tsx` | 1 `'use client';`／2 空行／3 `interface …` | 第 2 行之後加 import，**再補一行空行** | 單 |
| `components/FeatureSection.tsx` | 1 `'use client';`／2 空行／3 `export default …` | 同上 | 單 |
| `components/HomeHero.tsx` | 1 `'use client';`／2 空行／3 `export default …` | 同上 | 單 |
| `components/ServerSection.tsx`（**兩版皆是** 1 `'use client';`／2 空行／3 `'use client';`／4 空行／5 `'react'`／6 `'lucide-react'`） | **第 6 行之後** | 單 |

⚠️ ⛔ **不重排既有 import**、⛔ 不修 `ServerSection.tsx` 重複的 `'use client';`。

---

## 4. 設定檔與 #9 的改後全文

### 4.1 `components/Navbar.tsx` 第 77–83 行（依裁決 ④(a)）

改前（我本輪實讀）：
```tsx
          {session && (
            <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
              <img src={session.user?.image || ""} alt="Avatar" className="w-8 h-8 rounded-full border border-brand-primary" />
              <button onClick={() => signOut()} className="text-white/40 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          )}
```
改後（**只換中間那一行**，其餘一字不動）：
```tsx
          {session && (
            <div className="flex items-center space-x-4 border-l border-white/10 pl-6">
              {session.user?.image && (
                <Image src={session.user.image} alt="Avatar" width={32} height={32} className="w-8 h-8 rounded-full border border-brand-primary" />
              )}
              <button onClick={() => signOut()} className="text-white/40 hover:text-red-500 transition-colors">
                <LogOut size={18} />
              </button>
            </div>
          )}
```
⚠️ TypeScript：`session.user?.image` 的型別是 `string | null | undefined`；`&&` 收窄後 `session.user.image` 仍需 `session.user` 非空——`?.` 已保證 `session.user` 存在時才進真值分支，但 TS 的收窄**不會**穿過 `?.` 傳到 `session.user`。
⇒ **若 `yarn build` 型別檢查報錯**，改用 `{session.user?.image && (<Image src={session.user.image!} …)}` 之外的**非 `!` 寫法**：把條件寫成 `{session.user && session.user.image && (…)}`。
⚠️ 我**⛔ 未實跑型別檢查**（本輪不動碼）⇒ 這是 §9 未驗清單第 6 條，P3 會驗到；先寫死一種再依 build 結果調整，**調整方式限上述兩種**，⛔ 不改用 `any` / `@ts-ignore`。

### 4.2 `next.config.js`（依裁決 ①丙）

改前（我本輪 `cat -n` 實讀，8 行、238 B）：
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: { dirs: ['app', 'components', 'data', 'middleware.ts'] },
    // 如果有其他配置可以加在這裡
};

module.exports = nextConfig;
```
改後（**只加第 5 行**，既有註解仍是物件內最後一行）：
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: { dirs: ['app', 'components', 'data', 'middleware.ts'] },
    images: { unoptimized: true },
    // 如果有其他配置可以加在這裡
};

module.exports = nextConfig;
```
⛔ 不動 `output`、⛔ 不動 `eslint.dirs`、⛔ 不動第 5 行既有註解。
（`images.unoptimized` 是合法鍵：我自核 `node_modules/next/dist/server/config-schema.js` 第 373 行 `unoptimized: z.boolean().optional()`。）

### 4.3 `.eslintrc.json`（依裁決 ⑧甲）

改前（我本輪 `cat -n` 實讀，10 行、403 B、檔尾為 `\n}\n`）：
```json
{
  "root": true,
  "extends": "next/core-web-vitals",
  // @next/next/no-img-element 於此關閉:架構師 2026-09-09 裁決① 丙。
  // 既有 10 處 <img>(7 檔)本次未修,已列 backlog 建議(見 docs/tasks/F8-verification.md)。
  // ⚠️ 此規則自此對全 repo 不被檢查——在該 backlog 完成前,這個洞一直在。
  "rules": {
    "@next/next/no-img-element": "off"
  }
}
```
改後（4 行）：
```json
{
  "root": true,
  "extends": "next/core-web-vitals"
}
```
⚠️ **逐字聲明**：`"root": true` 與 `"extends": "next/core-web-vitals"` 的**鍵名、值、縮排**一個字元都沒動；
唯一動到的是第 3 行**行尾的分隔逗號**——那是 JSON 語法要求（後面沒有鍵了），⛔ 不留會是語法錯誤。見 §10 待裁 2。
被刪的三行註解在 P7 **逐條列出**並標「既有、依裁決 ⑧ 明示刪除」。

---

## 5. `components/ServerSection.tsx` 兩版本的處理

### 5.1 為什麼是兩版本（我本輪實查）

- 工作樹版 112 行、HEAD 版 109 行；`git diff --stat` 為 `173 ++++----`（整檔重排縮排 + 卡片區改版 + `servers` 陣列清空）。
- 工作樹 `<img>` 在**第 90 行**、HEAD 在**第 81 行**，className **不同**（§3.1 第 10a/10b 列，我已逐字實讀）。
- 架構師已裁「只收 img 那幾行」⇒ **commit 內容 = HEAD 版 + 那一行 + import**；**工作樹也要改**（否則 `yarn lint` 過不了）。

### 5.2 worktree 建立（依裁決 ⑤甲）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git worktree add "/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index" HEAD; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index" && ln -s "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/node_modules" node_modules; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index" && ln -s "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/.env.local" .env.local && ls -la node_modules .env.local; echo "exit=$?"
```
⚠️ `.env.local` **⛔ 不得 `cat`、⛔ 不得入 log、⛔ 不得貼進任何文件**（鐵則 1）。`ls -la` 只看連結存在，⛔ 不看內容。
⚠️ worktree 路徑在 repo **之外**（`Nameless Realms/nrw-f9-index`）⇒ ⛔ 不會污染 `git status`。

### 5.3 worktree 內容 = commit 內容

在 worktree 裡：
1. 改 `components/ServerSection.tsx`（**第 81 行** + 第 6 行後加 import）。
2. 把主樹改好的另外 6 個原始檔 + `.eslintrc.json` + `next.config.js` **逐檔 `cp`** 進 worktree：
```bash
SRC="/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web"; DST="/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index"; for f in app/sponsor/page.tsx app/team/page.tsx components/FeatureRow.tsx components/FeatureSection.tsx components/HomeHero.tsx components/Navbar.tsx .eslintrc.json next.config.js; do cp "$SRC/$f" "$DST/$f"; done; echo "exit=$?"
```
⚠️ ⛔ **不 `cp` `app/layout.tsx` 與 `app/staff/page.tsx`**——worktree 要保持 HEAD 版（那才是 commit 內容）。
3. `git status --short` 在 worktree 內應**只列這 9 個檔**為 ` M`，⛔ 不得出現 `app/layout.tsx` / `app/staff/page.tsx`。

### 5.4 寫進 index（⛔ 不用 `git add`、⛔ 不用 `git stash`、⛔ 不用 `git checkout`）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && BLOB=$(git hash-object -w "/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index/components/ServerSection.tsx"); echo "blob=$BLOB exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git update-index --cacheinfo "100644,$BLOB,components/ServerSection.tsx"; echo "exit=$?"
```
（⚠️ `BLOB` 在同一個 shell 會話內不跨呼叫存活 ⇒ 執行時把兩條**寫成同一條**用 `&&` 串，但 `echo "exit=$?"` 只量得到最後一段
⇒ 依紀律**分成兩條各取 `$?`**：第一條把 blob 印出來，第二條把印出的雜湊**逐字貼回**指令。⛔ 不用 pipe 取 exit code。）

驗證：
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --cached --stat components/ServerSection.tsx; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --cached components/ServerSection.tsx; echo "exit=$?"
```

**`git diff --cached components/ServerSection.tsx` 的預期輸出樣貌**（只有兩個 hunk，共 `+3 -1`）：
```diff
diff --git a/components/ServerSection.tsx b/components/ServerSection.tsx
index <old>..<new> 100644
--- a/components/ServerSection.tsx
+++ b/components/ServerSection.tsx
@@ -4,6 +4,7 @@
 
 import { useState } from 'react';
 import { Copy, CheckCircle, Users, ExternalLink } from 'lucide-react';
+import Image from 'next/image';
 
 export default function ServerSection() {
   const [copied, setCopied] = useState(false);
@@ -78,7 +79,7 @@
             <div key={i} className="group relative bg-white/[0.01] …">
                 <div className="flex-1 relative aspect-video md:aspect-auto overflow-hidden bg-gray-900">
-                        <img src={s.image} alt={s.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0" />
+                        <Image src={s.image} alt={s.name} width={1920} height={1031} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 opacity-50 grayscale group-hover:grayscale-0" />
                     <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0c] via-transparent to-transparent hidden md:block"></div>
```
（⚠️ 上面的 context 行是示意，**實際輸出以當時為準**；`--stat` 應顯示 `2 +-` 或 `4 ++--` 量級。）
**⛔ 不得出現**：`servers: any[] = []`、`// {` 註解掉的陣列、縮排重排、`max-w-6xl`、`opacity-65`、`grid md:grid-cols-…`、`min-h-[260px]` 等**任何**工作樹改動的行。若出現任何一行 ⇒ **停下回報**，⛔ 不 commit。

### 5.5 worktree 的 dev server 與 #10 截圖

- **埠**：`capture.sh` 第 14 行把 URL 寫死成 `http://localhost:3100` ⇒ **worktree 的 dev server 也跑 3100**，
  且**與主樹的 dev server 互斥、輪流跑**（先 `lsof -iTCP:3100 -sTCP:LISTEN` 確認空閒才起）。
  ⇒ 這比另起 3101 更能守「同一套腳本」。⚠️ 若執行時 3100 被別的東西佔住，改 3101 就**必須**動 `capture.sh`，⇒ 見 §10 待裁 3。
- **截圖階段名**：`./capture.sh before-index`（worktree 改動前）與 `./capture.sh after-index`（改動後），
  都從**主樹**的 `docs/tasks/F9-evidence/` 執行 ⇒ 產物落在 `docs/tasks/F9-evidence/{before-index,after-index}/`。
  ⚠️ 這會連 `/sponsor` `/team` `/modServer` 一起拍——**留著**，因為那正是 **commit 內容**的外觀（比工作樹版更貼近要發布的東西）。
- **⚠️ 高度問題（必須先量）**：`capture.sh` 第 8 行的高度是寫死的
  `home 3114 / sponsor 2524 / team 1870 / modServer 3842`（我本輪 `cat` 實讀），
  這組數字來自**工作樹**的 `docHeight`（`before/*.json` 的 `docHeight` 欄我實讀為 `3114 / 2524 / 1870 / 3842`，逐頁相符）。
  **index 版的 `/` 會多渲染一張伺服器卡片 ⇒ `docHeight` 必然大於 3114** ⇒ `home.png` 會被裁掉底部、**很可能剛好裁掉 #10 那張圖**。
  ⇒ **處置**：先用 `metrics.js` 量 index 版 `/` 的 `docHeight` 與該張圖的 `rect.y + rect.h`；
  若超出 3114，就**用備份檔紀律**把 `capture.sh` 的 `H[home]` 暫時改成實測值（`before-index` 與 `after-index` **用同一個數字**），兩次拍完後從 `.bak` 還原並 `diff` 證明還原乾淨：
  ```bash
  cd ".../docs/tasks/F9-evidence" && cp capture.sh capture.sh.bak && ls -la capture.sh.bak; echo "exit=$?"
  ```
  ```bash
  cd ".../docs/tasks/F9-evidence" && cp capture.sh.bak capture.sh && diff capture.sh capture.sh.bak; echo "exit=$?"
  ```
  ⚠️ 我把這視為**參數**（截圖高度）而非**方法**的變更，且前後兩階段共用同一參數 ⇒ 尺不變。
  **但它踩到 README「⛔ 不得另寫一套方法」的字面** ⇒ 列為 §10 待裁 3，請 plan-review 明確放行或否決。
- worktree 在**架構師確認 commit 之後**才 `git worktree remove`，⛔ 不在 P6 之前清。

---

## 6. 驗收步驟 P0–P8（具體指令 + 預期輸出）

> 紀律：每條指令後接 `; echo "exit=$?"`，貼**原文**。
> ⛔ 不用 pipe 取 exit code（zsh 的 `${PIPESTATUS[0]}` 恆為空；`pipestatus` 是 1-based）。
> ⛔ 不把關鍵指令用 `&&` 串起來後只取一個 `$?`。
> 負向測試還原**一律用備份檔**，⛔ 不用 `git checkout`。

### P0 改前基線（動任何原始碼之前）

**P0-A**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git rev-parse --short HEAD; echo "exit=$?"
```
預期：` M` 恰三行（`app/layout.tsx`、`app/staff/page.tsx`、`components/ServerSection.tsx`）＋ `??` 為 `.claude/launch.json`、`docs/tasks/F9-background.md`、`docs/tasks/F9-evidence/`、`docs/tasks/F9.md`、`docs/tasks/F9-plan.md`；HEAD `df2b8ff`。
⚠️ 若多出別的 ` M` ⇒ **停下回報**。

**P0-B 正向基線**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
```
預期：`✔ No ESLint warnings or errors`、`exit=0`。
（⚠️ 我**本輪已實跑**過這條，得 `✔ No ESLint warnings or errors`；exit code 當時未單獨取 ⇒ 實作時重跑並取 `$?`。）

**N0 改前負向基線**（⛔ 一個 repo 檔都沒改）
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 -c node_modules/eslint-config-next/core-web-vitals.js; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn -s lint -c node_modules/eslint-config-next/core-web-vitals.js 2>&1 | grep -c "no-img-element"
```
**我本輪已實跑，實得**：第一條 `exit=1`、列出 7 檔 10 處（`app/sponsor/page.tsx` 38:13 / 162:21、`app/team/page.tsx` 28:13 / 42:17、`components/FeatureRow.tsx` 33:21、`components/FeatureSection.tsx` 46:15、`components/HomeHero.tsx` 24:11、`components/Navbar.tsx` 29:11 / 79:15、`components/ServerSection.tsx` 90:33）；第二條印 **`10`**。
⇒ 這就是「**改前這個閘門真的會擋、且量得準**」的證明。實作時**重跑一次貼當時原文**。
⚠️ `-c` **必須**指向 `node_modules/eslint-config-next/core-web-vitals.js`，⛔ 不自寫一份（會 `Failed to load config … to extend from`）。

**P0-C 尺寸實量**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && for f in sponsor team quasi Moon_Flame liujuhsin server_quasi launcher logo server_01; do printf "%-18s " "$f.png"; sips -g pixelWidth -g pixelHeight "public/images/$f.png" | awk '/pixelWidth|pixelHeight/{printf "%s ", $2}'; echo; done; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && jq -r '.imgs[] | "\(.alt)\t\(.naturalWidth)x\(.naturalHeight)"' before/sponsor.json; echo "exit=$?"
```
預期：與 §3 開頭我實跑的九行一致；PayPal 一筆為 **226×142**。
⚠️ **⛔ 不需要 `curl` 下載 PayPal 圖**——`before/sponsor.json` 的 `naturalWidth/Height` 已是瀏覽器對**同一個 URL** 的實量（226×142），比 `curl` 更貼近渲染現場；且避免對外網的不確定性。（任務包 P0-C 的 `curl` 版本列為備援。）

**P0-D 基線存在性**
```bash
ls -la "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence/before/"; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence/before" && md5 -r *.json *.png > /tmp/f9-recheck.txt; diff <(sort /tmp/f9-recheck.txt | awk '{print $1, $2}') <(sort MD5SUMS.txt | awk '{print $1, $2}'); echo "exit=$?"
```
預期：8 個檔都在；`diff` 無輸出、`exit=0`（證明基線自主迴圈落檔後**沒被動過**）。
⚠️ 若對不上 ⇒ **停下回報**，⛔ 不自行重拍當成主迴圈基線。

**P0-E `sharp` 現況**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls node_modules/sharp; echo "exit=$?"
```
預期：`No such file or directory`、`exit` 非 0（裁決 ②甲：本包⛔ 不加）。

### 改檔（依 §3、§4）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --stat; echo "exit=$?"
```
預期：`app/layout.tsx | 2 +-`、`app/staff/page.tsx | 6 +-` **不變**；
`app/sponsor/page.tsx` `+4 -2` 量級、`app/team/page.tsx` `+5 -2`、`components/FeatureRow.tsx` `+4 -1`、
`components/FeatureSection.tsx` `+4 -1`、`components/HomeHero.tsx` `+3 -1`、`components/Navbar.tsx` `+5 -2`、
`components/ServerSection.tsx` 仍是 **173 行量級**（工作樹舊改動 + 本次 2 行，⛔ 這是預期的）、
`.eslintrc.json` `+1 -7` 量級、`next.config.js` `+1`。
⚠️ 行數是**量級預估**，實作時貼實際輸出，⛔ 不硬套本檔數字。

### P1 正向：同一條負向指令現在過了

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0 -c node_modules/eslint-config-next/core-web-vitals.js; echo "exit=$?"
```
預期：`✔ No ESLint warnings or errors`、**`exit=0`**（N0 那條**一個字不改**，從 1 變 0）。

### P2 完成判準：repo 自己的設定下規則已重新生效

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && cat .eslintrc.json; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
```
預期：`cat` 顯示 4 行、**沒有** `rules`、**沒有** `no-img-element`；lint `exit=0`。
⚠️ **這條單獨⛔ 不算數**（`exit 0` 不等於檢查真的跑了），必須配 N1。

### N1 負向對照（canary）：證明這個閘門在 repo 設定下真的會擋

建立 `data/lintCanary.tsx`（新檔，逐字；`data` 在 `eslint.dirs` 內）：
```tsx
// F9 負向對照 canary —— 驗完必刪，⛔ 不得進 commit
export function LintCanary() {
  return <img src="/images/logo.png" alt="canary" />;
}
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn -s lint 2>&1 | grep -c "no-img-element"
```
預期：第一條輸出含 `./data/lintCanary.tsx` 與 `@next/next/no-img-element`、**`exit=1`**；第二條印 **`1`**。
⚠️ 若 `exit=0` ⇒ 規則沒生效 ⇒ P2 的 `exit=0` **無效**，**停下回報**。
⇒ 這條同時是 P1「0 命中」與 P5「本地 `_next/image` 0 命中」的**配對正控**（證明 grep 本身抓得到東西）。

**canary 如何確保不留在 `git status`**：它是**新檔**（未追蹤），刪掉即消失，⛔ 不涉及 `git checkout`。
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && rm data/lintCanary.tsx; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && ls data/; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --porcelain data/; echo "exit=$?"
```
預期：`ls data/` 只有 `modpackHistory.ts` / `news.ts` / `staff.ts`（實作時貼實際清單）；`git status --porcelain data/` **無輸出**、`exit=0`。
⚠️ P8 會**再查一次**（雙保險）。

### P3 嚴格三指令（canary 已移除）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn install --frozen-lockfile; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn lint --max-warnings 0; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn build; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --stat yarn.lock package.json; echo "exit=$?"
```
預期：三條全 `exit=0`；build 輸出含 `Linting and checking validity of types` 與路由表；`git diff --stat yarn.lock package.json` **無輸出**（裁決 ②甲）。
⚠️ **據實**：`yarn build` 綠**證明不了** `width`/`height` 沒漏（§2 已核：檢查只在 `NODE_ENV !== "production"` 跑）⇒ P4 必做。

**P3-b 產物層佐證裁決 ①丙真的生效**（本輪新增，⛔ 不需 Docker）：
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && grep -rlo "/_next/image" .next/server/app 2>/dev/null | head; echo "exit=$?"
```
預期：**無輸出**（production build 的 HTML／RSC payload 裡沒有任何本地 `/_next/image?url=` ⇒ `images.unoptimized: true` 生效 ⇒ §2 的 500 陷阱踩不到）。
⚠️ 配對正控：同一批產物 `grep -rlo "/images/logo.png" .next/server/app | head` 應**有輸出**（證明 grep 抓得到）。
⚠️ 這仍**⛔ 不是**正式 Docker 環境的實測（§9 未驗 1）。

### P4 實際開頁：四頁無執行期錯誤

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && lsof -iTCP:3100 -sTCP:LISTEN; echo "exit=$?"
```
預期：無輸出（`lsof` 沒結果時 exit 非 0 是正常的）。

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && yarn dev -p 3100 2>&1 | tee "<scratchpad>/dev-3100.log"
```
（背景執行。）然後用瀏覽器工具依序開 `http://localhost:3100/`、`/sponsor`、`/team`、`/modServer`，
**每頁從頂捲到底再捲回頂**（讓 `loading="lazy"` 的圖全部載完），滑鼠移出頁面（避免 `group-hover` 縮放），視窗固定 **1280×900**（與基線 `viewport` 欄一致）。

**逐頁過線標準（逐頁貼）**：
1. 沒有 Next 錯誤覆蓋層。
2. DevTools console **沒有紅字 error**。允許的警告只有兩類，出現就**逐字貼**：
   - `Image with src "…" was detected as the Largest Contentful Paint (LCP). Please add the "priority" property…`（我自核 `get-img-props.js` 第 335–357 行，是 `console.warn`）⇒ **⛔ 不因它加 `priority`**（最小改法）。
   - `[next-auth][warn]…`。
   ⚠️ **⛔ 不得出現** `Image is missing required "src" property`（裁決 ④(a) 條件渲染就是為了消掉它）。
3. 終端 log 沒有 `⨯`、`Error:`、`Unhandled`。貼相關段落前**過目確認無機密**（`Environments: .env.local` 這種**檔名**提示可留，⛔ 值不可留）。
4. 每張圖都有顯示（`complete: true`、`naturalWidth` 非 0，由 P5 的 JSON 佐證）。
5. **首屏圖不因 `loading="lazy"` 閃爍**（README 比對判準第 3 條）——Navbar logo 與 HomeHero logo 在首次載入時肉眼確認，據實記錄。

### P5 外觀證據：改後 + 前後 diff

用 **`docs/tasks/F9-evidence/metrics.js` 原檔**（⛔ 不改一個字）對四頁各跑一次，存
`docs/tasks/F9-evidence/after/{home,sponsor,team,modServer}.json`；
再從 `docs/tasks/F9-evidence/` 執行 **`./capture.sh after`** 產四張 PNG。

⚠️ **`metrics.js` 執行前的程序性前置**（⛔ 不是改腳本）：先把頁面捲到底、等 2 秒、再捲回頂，然後才貼腳本。
理由：`next/image` 非 `priority` 一律 `loading="lazy"`（§2 已核），不先捲過去的話下方圖會 `complete:false` / `naturalWidth:0`，
與基線（`loading:"auto"` 全部即時載入）對不上。⚠️ 若捲過之後仍有 `complete:false` ⇒ **那是真的行為差異**，據實記錄、⛔ 不掩蓋。

**⚠️ 任務包 P5 的三條指令我實查後判定寫錯，本計畫改用下列版本**（差異與證據見 §10 待裁 4）：

**(a) 逐欄 diff**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && for p in home sponsor team modServer; do echo "== $p"; diff <(jq -S '.imgs | map(del(.loading, .decoding))' "before/$p.json") <(jq -S '.imgs | map(del(.loading, .decoding))' "after/$p.json"); echo "exit=$?"; done
```
- ⚠️ 任務包寫的是 `jq -S 'map(del(.loading,.decoding,.attrW,.attrH))'`。我實查 `jq -r 'keys|join(",")' before/home.json` 得 **`docHeight,imgs,page,viewport`** ⇒ 頂層是**物件不是陣列**，`map` 會直接報錯；且 `metrics.js` **根本沒有** `attrW`/`attrH` 欄位（我逐行讀過該檔）。
- 預期：四頁 `diff` **皆無輸出、`exit=0`**（`src`、`currentSrc`、`alt`、`complete`、`naturalWidth/Height`、`rect`、`objectFit`、`opacity`、`filter`、`borderRadius`、`padding`、`className` 逐字相同）。

**(b) 版面總高不變**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && for p in home sponsor team modServer; do printf "%-10s before=%s after=%s\n" "$p" "$(jq -r .docHeight before/$p.json)" "$(jq -r .docHeight after/$p.json)"; done; echo "exit=$?"
```
- 預期：逐頁相同。我本輪實讀的 before 值為 `home 3114 / sponsor 2524 / team 1870 / modServer 3842`（也正是 `capture.sh` 寫死的高度）。
- ⚠️ 若變了 ⇒ **版面真的改了**，先查原因，⛔ 不改腳本高度了事（README 明文）。

**(c) 預期差異只有 `loading` / `decoding`**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && for p in home sponsor team modServer; do echo "== $p"; jq -r '.imgs[] | "\(.i)\t\(.loading)\t\(.decoding)"' "after/$p.json"; done; echo "exit=$?"
```
- 預期：每筆皆 `lazy` / `async`（before 皆為 `auto` / `auto`，我實讀確認）。

**(d) 沒有任何一張走本地最佳化端點**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && for f in after/*.json; do printf "%-24s %s\n" "$f" "$(grep -o 'localhost:3100/_next/image' "$f" | wc -l)"; done; echo "exit=$?"
```
- ⚠️ 任務包寫的是 `grep -c "_next/image" after/*.json`、預期「四檔皆 0」。**我實跑 before 得 `before/modServer.json:1`** ——因為 `/modServer` 那兩張圖的 `src` **本來就是**正式站的 `https://namelessrealms.com/_next/image?url=…`（既有現況，⛔ 本包不改），且 `grep -c` 數的是**行數**、JSON 是單行 ⇒ 這條預期**永遠達不到**。
- 正確判準：**本地** 端點 0 命中。我實跑 `grep -o 'localhost:3100/_next/image' before/*.json | wc -l` ⇒ 四檔皆 **0**；改後應仍為 **0**。
- **0 命中的配對正控**：
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && for f in after/*.json; do printf "%-24s %s\n" "$f" "$(grep -o '"currentSrc":"http' "$f" | wc -l)"; done; echo "exit=$?"
```
- ⚠️ 任務包寫的樣式是 `'"currentSrc": "http'`（冒號後有空格），但 `metrics.js` 用的是 `JSON.stringify(x)` **無縮排** ⇒ 那個樣式命中 0，會被誤讀成「圖都沒載到」。正確樣式無空格。
- 我實跑 before 得：`home 5 / modServer 5 / sponsor 4 / team 6` ⇒ 與各頁 `<img>` 筆數相符。改後應**完全相同**。

**(e) `srcSet` 沒被加上**（`metrics.js` ⛔ 沒有這個欄位 ⇒ 只能在瀏覽器現場查一次，據實記為現場觀察）
```js
[...document.querySelectorAll('img')].map(im => [im.alt, im.getAttribute('srcset'), im.getAttribute('width'), im.getAttribute('height')])
```
- 預期：`srcset` 皆 `null`（裁決 ①丙），`width`/`height` 皆為 §3 表的數字。

**(f) PNG 雜湊**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && shasum -a 256 before/*.png after/*.png before-index/*.png after-index/*.png; echo "exit=$?"
```
- 依裁決 ⑥乙：PNG **⛔ 不進 git**，verification 記路徑 + `shasum -a 256`。
- verification 列「前後截圖檔路徑對照表」供架構師人工看；看完由規劃側在 plan-review 回填「外觀已人工核」（⛔ 不是我寫）。

### P6 index 版本（commit 內容）另樹 lint + build + #10 證據

依 §5.2 建 worktree（此時**主樹 dev server 已停**，3100 讓給 worktree）。

**P6-1 改動前拍 index 基線**：worktree 跑 `yarn dev -p 3100`，用 `metrics.js` 抓 `/` 存 `before-index/home.json`（先量 `docHeight` 與 #10 那張的 `rect`），
再從主樹 evidence 目錄跑 `./capture.sh before-index`（高度處置見 §5.5）。
預期：`before-index/home.json` 的 `imgs` 應比 `before/home.json` **多 1 筆**（`alt` 為 `模組包生存伺服器`，`src` `/images/server_01.png`）⇒ 共 **6 筆**。

**P6-2 套改動**：依 §5.3 改 worktree 的 `ServerSection.tsx` 並 `cp` 另外 8 個檔。
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index" && git status --short; echo "exit=$?"
```
預期：**只列 9 個檔**為 ` M`（`.eslintrc.json`、`next.config.js`、6 個元件／頁面、`components/ServerSection.tsx`），
⛔ **不得出現** `app/layout.tsx`、`app/staff/page.tsx`。⚠️ 另可能有 `??` 的 `node_modules`／`.env.local`／`.next` ⇒ 需確認 `.gitignore` 已擋（若列出來，據實記錄並在 P8 說明它不影響主樹 index）。

**P6-3 index 版本的 lint 與 build**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index" && yarn lint --max-warnings 0; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index" && yarn build; echo "exit=$?"
```
預期：皆 `exit=0`。⚠️ **工作樹 lint 過⛔ 不等於 commit 內容 lint 過**，這一步才是對 commit 內容的閘門。
**負向對照（證明這棵樹的 lint 真的在跑）**：在 worktree 建同一份 `data/lintCanary.tsx`，跑 `yarn lint --max-warnings 0` 應 `exit=1` 且含 `no-img-element`，然後 `rm` 掉並 `git status --short` 確認消失。

**P6-4 拍 #10 改後**：worktree 重開 `yarn dev -p 3100`，`metrics.js` 抓 `/` 存 `after-index/home.json`，`./capture.sh after-index`。
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && diff <(jq -S '.imgs | map(del(.loading, .decoding))' before-index/home.json) <(jq -S '.imgs | map(del(.loading, .decoding))' after-index/home.json); echo "exit=$?"
```
預期：**無輸出、`exit=0`**；並確認該筆 `alt` 為伺服器名稱、`className` 為 HEAD 版那串（含 `grayscale`）。

**P6-5 寫 index 並驗**：依 §5.4，貼 `git diff --cached --stat` 與 `git diff --cached components/ServerSection.tsx` 全文。

### P7 既有註解全稱比對（守則 8，⛔ 不抽查）

**(a) 整檔 diff（定位差異範圍）**
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && for f in app/sponsor/page.tsx app/team/page.tsx components/FeatureRow.tsx components/FeatureSection.tsx components/HomeHero.tsx components/Navbar.tsx .eslintrc.json next.config.js; do echo "== $f"; git show "HEAD:$f" | diff - "$f"; echo "exit=$?"; done
```
預期：每檔 `exit=1`（有差異才對），且差異**只有** import 行、`<img>`→`<Image>` 的行、`.eslintrc.json` 的 `rules` 與三行註解、`next.config.js` 的 `images` 那一行。

**(b) 全稱比對（逐行、⛔ 不抽查）**——把 HEAD 版**每一行含註解記號的行**逐字回查現行檔：
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && for f in app/sponsor/page.tsx app/team/page.tsx components/FeatureRow.tsx components/FeatureSection.tsx components/HomeHero.tsx components/Navbar.tsx .eslintrc.json next.config.js; do echo "== $f"; git show "HEAD:$f" | grep -nE '//|/\*|\*/' | while IFS= read -r line; do body="${line#*:}"; grep -Fqx -- "$body" "$f" || echo "MISSING $line"; done; done; echo "exit=$?"
```
- `grep -Fqx` = **整行、逐字、含縮排**比對 ⇒ 這是全稱比對，⛔ 不是抽查。
- 樣式 `//|/\*|\*/` 是**刻意過寬**的（會把含 `https://` 的 class／URL 行也抓進來）——寧可多查。
- **預期的 `MISSING` 清單（只有這些，多一條就是紅旗）**：
  1. `.eslintrc.json` 第 4、5、6 行三條註解 ⇒ **既有、依裁決 ⑧甲明示刪除**（verification 逐條列出全文）。
  2. `app/sponsor/page.tsx` 第 162 行 PayPal 那一行（含 `https://` 才被樣式抓到；它是本包**明示改動**的 `<img>` 行，⛔ 不是註解）。
  3. `components/Navbar.tsx` 第 79 行（同理，`session.user?.image || ""` 那行本身無 `//`，若未被樣式抓到則不會出現）。
- **⛔ 不得出現在 MISSING 裡的既有註解**（我本輪已逐檔實讀確認它們的存在，改動不碰它們）：
  `app/sponsor/page.tsx` 的 `// onClick={() => window.open("https://www.paypal.me/liujuhsin", "_blank")}` 與各 `{/* … */}`；
  `app/team/page.tsx` 第 15 行的 `bg-[url('https://grainy-gradients.vercel.app/noise.svg')]`；
  `components/FeatureSection.tsx` 的 `{/* 移除 background 色塊，改用微妙的邊框裝飾 */}`、`{/* 背景裝飾光暈 - 代替色塊 */}`；
  `components/HomeHero.tsx` 的 `{/* 影片背景 */}`、`{/* 上下漸層遮罩，讓文字更好看 */}`、`{/* 文字與按鈕 (不再有大盒子) */}`；
  `components/Navbar.tsx` 的 `{/* 首頁 */}`、`{/* 伺服器下拉選單 */}`、`{/* 手機版選單 (同步優化下拉邏輯) */}` 等；
  `next.config.js` 第 5 行 `// 如果有其他配置可以加在這裡`。
  （⚠️ 上列是**我實讀後的舉例**，⛔ 不是完整清單——判定以指令輸出為準，**逐條**列進 verification。）

**(c) `components/ServerSection.tsx`**：⛔ 不用 (a)/(b)（工作樹 vs HEAD 本來就是 173 行 diff）。
改用 P6-5 的 `git diff --cached components/ServerSection.tsx`，並額外對 **worktree 版**跑一次 (b) 的全稱比對：
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/nrw-f9-index" && git show "HEAD:components/ServerSection.tsx" | grep -nE '//|/\*|\*/' | while IFS= read -r line; do body="${line#*:}"; grep -Fqx -- "$body" components/ServerSection.tsx || echo "MISSING $line"; done; echo "exit=$?"
```
預期：**無 `MISSING`**（HEAD 版的既有註解一條都沒動）。

### P8 git 對帳（commit 前）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --short; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --cached --name-status; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git status --porcelain data/; echo "exit=$?"
```

**預期對帳表**：

| 狀態 | 路徑 | 說明 |
|---|---|---|
| `M ` (staged) | `.eslintrc.json` | 逐檔 `git add` |
| `M ` | `app/sponsor/page.tsx`、`app/team/page.tsx`、`components/FeatureRow.tsx`、`components/FeatureSection.tsx`、`components/HomeHero.tsx`、`components/Navbar.tsx` | 逐檔 `git add` |
| `M ` | `next.config.js` | 裁決 ①丙 |
| `MM` | `components/ServerSection.tsx` | index = HEAD+img（`update-index` 寫入）；工作樹仍帶舊改動 ⇒ **`MM` 是預期的** |
| `A ` | `docs/tasks/F9-plan.md`、`docs/tasks/F9-verification.md` | |
| `A ` | `docs/tasks/F9-evidence/**/*.json`（`before`/`after`/`before-index`/`after-index`） | 裁決 ⑥乙 |
| ` M` **未 staged** | `app/layout.tsx`、`app/staff/page.tsx` | ⛔ **不得進 staging** |
| `??` **預期的未追蹤** | `docs/tasks/F9-evidence/**/*.png` | 裁決 ⑥乙：PNG 不進 git，收案時由主迴圈搬離 |
| `??` 預期 | `.claude/launch.json`、`docs/tasks/F9.md`、`docs/tasks/F9-background.md`、`docs/tasks/F9-evidence/README.md` / `metrics.js` / `capture.sh` / `MD5SUMS.txt` | 由主迴圈／規劃側收案處理（`README.md` 等見 §10 待裁 1） |
| ⛔ **不得出現** | `data/lintCanary.tsx`、`capture.sh.bak` | canary 與備份檔驗完必刪 |

⛔ **commit / push 前一律回報，待架構師確認。** 本任務包與派工訊息的任何措辭均⛔ 不構成 push 預授權。
commit 訊息⛔ 不得含任何 `Co-Authored-By` 行。

### 真機 E2E（#9，裁決 ④甲(b)；⚠️ 執行時**一次只給一步**，等架構師回報才給下一步）

| # | 步驟 | 過線標準 | 結果 |
|---|---|---|---|
| 1 | 我確認 `yarn dev -p 3100` 在跑、P4 四頁已過，回報「可以登入了」 | 終端無 error | 待人工 |
| 2 | 架構師開 `http://localhost:3100/api/auth/signin`，用本人 Discord 帳號登入 | 回到首頁、Navbar 右側出現頭像與登出鈕 | 待人工 |
| 3 | 架構師在 DevTools console 貼 `metrics.js` 全文，把回傳存 `after/home-signed-in.json`；另截一張 Navbar 區截圖 | 該 JSON 內有一筆 `alt: "Avatar"`：`rect.w`/`rect.h` = **32**、`borderRadius` 為圓（`9999px` 或 `50%`）、`currentSrc` 非空且 hostname 為 `cdn.discordapp.com`、`complete: true`、`naturalWidth` 非 0；console **無** `Image is missing required "src" property` 紅字 | 待人工 |
| 4 | 架構師登出 | Navbar 回到未登入樣式 | 待人工 |

⚠️ 素材（`metrics.js` 路徑、URL、期望值）已備齊，⛔ 不得叫架構師自備。
⚠️ verification 據實寫「**#9 為改後對期望值，無改前基線**」（裁決 ④(b) 明文）。
⚠️ `cdn.discordapp.com` 是我從 `node_modules/next-auth/providers/discord.js` 第 18/21 行讀到的**檔案層事實**，實際回應⛔ 未實查 ⇒ 若架構師拍到別的 hostname，**據實記錄**、⛔ 不改期望值當沒發生。

---

## 7. 進 commit 的檔案（逐檔 `git add`，⛔ 禁 `git add .`、⛔ 禁 `git add -p`）

```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add .eslintrc.json; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add next.config.js; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add app/sponsor/page.tsx; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add app/team/page.tsx; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add components/FeatureRow.tsx; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add components/FeatureSection.tsx; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add components/HomeHero.tsx; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add components/Navbar.tsx; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add docs/tasks/F9-plan.md docs/tasks/F9-verification.md; echo "exit=$?"
```
```bash
cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git add docs/tasks/F9-evidence/before/*.json docs/tasks/F9-evidence/after/*.json docs/tasks/F9-evidence/before-index/*.json docs/tasks/F9-evidence/after-index/*.json; echo "exit=$?"
```
- `components/ServerSection.tsx`：**⛔ 不用 `git add`**，走 §5.4 的 `hash-object` + `update-index`。
- ⛔ `docs/tasks/F9-evidence/**/*.png` 不 add（裁決 ⑥乙）。
- `docs/tasks/F9.md`、`F9-background.md`、`F9-plan-review.md`、`.claude/launch.json`：沿慣例由**收案時**處理，⛔ 不在本包 add。
- ⛔ **add 與 commit ⛔ 不串同一行**（F10 實測：`set -e` 擋不住 commit 漏檔）；每次 add 後看 `git diff --cached --name-status`。

---

## 8. `CLAUDE.md` 改寫建議（我在 verification 附文字，⛔ 不自己改）

1. **「CI 現況」節**：把現行「⚠️⚠️ 但⛔ 不得單獨寫『lint 通過』：F8 依裁決① 丙明確關閉了 `@next/next/no-img-element`（既有 10 處 `<img>` 未修，見 backlog F9）…」改寫為 F9 收案後的事實（規則已重新生效、10 處已換成 `next/image`；「綠」仍須連同 N0／N1 兩個負向對照一起引用）。
2. **地雷清單新增一條**（草擬文字放 verification）：`output: 'standalone'` + `NODE_ENV=production` + 無 `sharp` ⇒ `/_next/image` 端點回 500（`node_modules/next/dist/server/image-optimizer.js` 第 497–500 行），**dev 與 build 都看不出來**；本 repo 因此在 `next.config.js` 設 `images: { unoptimized: true }`，要開最佳化必須先加 `sharp`。
3. **程式碼地圖⛔ 不動**（7 檔都在圖上、無新檔、`lib/` 仍空 ⇒ 非結構性變更）。
4. verification 另建議三筆 backlog（由主迴圈回填）：① 加 `sharp` + `remotePatterns` 開最佳化；② 鐵則 5 兩處既有違例（`app/team/page.tsx` `members`、`components/FeatureSection.tsx` `features`）搬 `data/`；③ 雙 Navbar（`app/layout.tsx` 與各頁重複掛，**HEAD 版就有**）。

---

## 9. 風險與「這輪驗不到」的清單（⛔ 不得在 verification 寫成已驗）

| # | 驗不到的事 | 原因 | verification 措辭 |
|---|---|---|---|
| 1 | **正式 Docker 環境行為** | ⛔ 不跑 `docker build`、⛔ 不打 `v*` tag（鐵則 4）；本 repo 打 tag 就是發版且沒有 build CI 可擋 | 「未驗：Docker 映像內行為。裁決 ①丙的效果只以 P3-b 的 build 產物層 grep 佐證」 |
| 2 | **#9 無改前對照** | 基線由主迴圈在**未登入**狀態拍 | 「#9 為改後對期望值，⛔ 無改前基線」（裁決 ④(b) 明文） |
| 3 | **Discord CDN 實際 hostname** | 只有 `ADMIN_DISCORD_ID` 本人登得進 | 「期望 `cdn.discordapp.com`（來源：`next-auth/providers/discord.js` 第 18/21 行**檔案層**），實際回應由 E2E 步驟 3 記錄」 |
| 4 | **`loading="lazy"` 對首屏圖的視覺影響** | 只有肉眼看得出閃爍；`metrics.js` 量不到 | P4 標準 5 據實記錄；若有閃爍 ⇒ 據實寫，⛔ 不因此偷加 `priority`（要加須回頭問架構師） |
| 5 | **`srcset` 前後對照** | `metrics.js` ⛔ 沒有這個欄位、⛔ 不得改腳本 | 只有改後的現場觀察（P5(e)），標「無改前對照，靠裁決 ①丙 + `get-img-props.js` 第 88–96 行推定」 |
| 6 | **#9 條件渲染的 TypeScript 收窄** | 本輪⛔ 未跑型別檢查 | P3 `yarn build` 會驗到；若報錯依 §4.1 的兩種非 `!` 寫法擇一，並在 verification 寫明實際採用哪一種與原因 |
| 7 | **worktree 的 lint/build 用 symlink 的 `node_modules`** | 與主樹共用同一份依賴 | 據實寫「index 版本的 lint/build 在 symlink 依賴下通過」；⛔ 不宣稱「等同乾淨安裝」 |
| 8 | **`capture.sh` 的 index 版高度** | 見 §5.5 / §10 待裁 3 | 若動了高度參數，逐字寫明改了什麼、兩階段用同一值、以及還原的 `diff` 證據 |
| 9 | **`before/` 基線是主迴圈拍的，`after/` 是我拍的** | 兩人、可能不同瀏覽器狀態 | 若我在 P0 順手用同一 `metrics.js` 自拍一份 `before-impl/`，就多一組「同一雙手」的對照；⛔ 非阻斷、有就記、沒有就寫沒有 |
| 10 | **`before-index/` 的高度與筆數預期** | 我⛔ 未實際跑過 index 版的 dev server | P6-1 的「應多 1 筆、共 6 筆」是**推算**，實跑結果為準 |

**守界聲明（已知、⛔ 本包不修，verification 要列出）**：
雙 Navbar（HEAD 版就存在）、`components/ServerSection.tsx` 重複的 `'use client';`（HEAD 與工作樹皆有）、
`/modServer` 引正式站外部 URL 而 `public/images/regular.png`、`vote.png` 無人引用、
鐵則 5 的兩處既有違例（`members` / `features` 陣列寫死在元件裡）、
`app/layout.tsx` 與 `app/staff/page.tsx` 的長期未 commit 舊改動。

---

## 10. ⛔ 需要 plan-review 明確回覆才動手的四件事

> 依「擋住路的才等」：**1、2、4 會左右對錯**（影響 commit 內容與驗收判準）⇒ 我**停下等**；
> **3** 是方法邊界，也停下等（README 有明文禁令）。

1. **`F9-evidence/` 裡的非 `.json` 檔進不進 git？**
   裁決 ⑥乙只講了「`**/*.json` 進、PNG 不進」，但該目錄還有 `README.md`、`metrics.js`、`capture.sh`、`MD5SUMS.txt`。
   ⚠️ 沒有 `metrics.js` / `capture.sh`，進版控的 JSON **就沒有「這把尺是什麼」的定義**。
   **我的建議**：這三個文字檔（約 5.5 KB 合計，我實測 `README.md` 3107 B、`capture.sh` 1295 B、`metrics.js` 1121 B）**進 git**，`MD5SUMS.txt`（356 B）一併進。⛔ 我不自選。

2. **`.eslintrc.json` 第 3 行行尾的逗號**（見 §4.3）。
   裁決 ⑧甲說「`"root"` 與 `"extends"` 兩鍵一個字元都不動」，但刪掉 `rules` 後那個逗號必須拿掉才是合法 JSON。
   **我的理解**：「兩鍵不動」指的是鍵名與值，逗號是語法分隔符 ⇒ 拿掉。**我的建議**：拿掉（＝回到 F8 裁決 1a 的原形）。
   若架構師的意思是連逗號都不能動，唯一合法替代是留一個空的 `"rules": {}` —— ⛔ 我不自選。

3. **`capture.sh` 的高度參數可不可以為 index 版暫時覆寫？**（見 §5.5）
   README 寫「⛔ 不得為改後另寫一套方法」。我要改的**不是方法**，是那支腳本裡寫死的截圖高度常數，且 `before-index` 與 `after-index` 會用**同一個**值、用完以 `.bak` 還原並 `diff` 證明。
   ⚠️ 若不放行，`before-index/home.png` 與 `after-index/home.png` 會在 3114px 處被截斷，**#10 那張卡片很可能整個不在畫面裡** ⇒ 裁決 ⑤甲要的證據拿不到。
   **我的建議**：放行（參數而非方法），並要求 verification 逐字記錄。⛔ 我不自選。

4. **任務包 P5 的三條指令我判定寫錯，是否照我 §6 P5 的修正版執行？**
   三處實查證據（都是我本輪自己跑的）：
   - `jq -S 'map(…)'` ⇒ 頂層是物件（`jq -r 'keys|join(",")' before/home.json` 得 `docHeight,imgs,page,viewport`），`map` 會報錯；正確是 `.imgs | map(…)`。
   - `del(.attrW,.attrH)` ⇒ `metrics.js` **沒有**這兩個欄位（我逐行讀過）。
   - `grep -c "_next/image" after/*.json` 預期「四檔皆 0」**達不到**：我實跑 before 得 `before/modServer.json:1`（`/modServer` 那兩張圖的 `src` 本來就是正式站的 `_next/image` URL）。正確判準是**本地**端點 0 命中（`grep -o 'localhost:3100/_next/image'`，before 實測四檔皆 0）。
   - 附帶：正控樣式 `'"currentSrc": "http'`（冒號後空格）在 `JSON.stringify` 無縮排輸出下命中 0；正確樣式 `'"currentSrc":"http'`，before 實測 `home 5 / modServer 5 / sponsor 4 / team 6`。
   **我的建議**：照修正版執行，並在 verification 附上這四點的實測輸出作為「為什麼改指令」的證據。⛔ 我不自選。

---

## 11. 檔案位元組數（撰碼規約 §A，參考數字；⛔ 不是閘門）

我本輪 `wc -c` 實測（改前）：
```
.eslintrc.json                        403
next.config.js                        238
app/sponsor/page.tsx                11966
app/team/page.tsx                    3463
components/FeatureRow.tsx            1860
components/FeatureSection.tsx        2495
components/HomeHero.tsx              2529
components/Navbar.tsx                5111
components/ServerSection.tsx         6329
```
本包每檔只動 2–8 行 ⇒ **⛔ 不構成 §A 的「顯著改動」**、⛔ 不觸發分檔評估。
改後的實測值我會順手記在 verification（1 KB = 1024 B）。
⚠️ §A 的觸發判準是「這個檔裝了幾件**不相干**的事」，⛔ 不是位元組數；本包⛔ 不因此拆任何檔（也符合裁決 ⑦甲）。

---

## 12. 執行順序（每步只差一個變因）

1. **P0**（含 N0 負向基線、P0-C 尺寸、P0-D 基線完整性、P0-E `sharp`）— ⛔ 動任何原始碼之前。
2. 建 worktree（§5.2）→ worktree 跑 dev（3100）→ 拍 `before-index`（§6 P6-1）→ **停掉 worktree dev**。
3. 改主樹 7 檔（§3）→ 改 `.eslintrc.json`（§4.3）→ 改 `next.config.js`（§4.2）→ 貼 `git diff --stat`。
4. **P1** → **P2** → **N1**（canary）→ 移除 canary + 三重確認。
5. **P3** 嚴格三指令 + **P3-b** 產物層 grep。
6. **P4** 主樹 dev（3100）開四頁 → **P5** `after/` JSON + PNG + diff → **停掉主樹 dev**。
7. **P6** worktree 套改動 → lint/build（含 worktree canary 負向對照）→ worktree dev 拍 `after-index` → 寫 index → `git diff --cached`。
8. **P7** 註解全稱比對 → **P8** git 對帳。
9. 產 `docs/tasks/F9-verification.md`（沿用 `docs/tasks/verification_template.md`）。
10. **回報，等架構師確認才 commit。** E2E #9 依表**一次一步**。
11. 架構師確認 commit 後才 `git worktree remove`。
