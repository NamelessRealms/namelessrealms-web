# Plan 審核：F9 把 10 處 `<img>` 換成 `next/image`，並重新啟用 `@next/next/no-img-element`

> 規劃側（nr-planner）審 `docs/tasks/F9-plan.md`（2026-09-10 版，HEAD `df2b8ff`）後落檔。實作側依此修正或動工。
> **阻斷點一律以 ⛔ 明標**；沒有 ⛔ 的條目是建議（可採納可說明不採）。
> 結論只有兩種：**放行**（過架構師確認後才實作）／**阻斷**（修 Plan 重審）。
> ⚠️ 規劃側**沒有 Bash**：本檔凡標「**⛔ 未實查，實作側必查**」者是需要執行才驗得到的事，並寫明要跑什麼；
> 標「**檔案層已核**」者是規劃側用 Read / Grep / Glob 對 repo、`before/*.json`、`node_modules` 原始碼核過的數字。
> 審核日期：2026-09-11。

## 審核結論

**✅ 放行（附三條 ⛔ 修正與一個新裁決點 ⑨；⛔ 修正已在本檔給出逐字版本，照抄即可，⛔ 不需修 plan 重審）**

一句話：八項裁決全部寫明「依裁決 X」且與架構師 2026-09-10 拍板一致；10 處行號、className、尺寸數字與 `before/*.json` 逐筆核過；
驗收計畫 N0/P1/N1/P2/P3/P4/P5/P6/P7/P8 完整、每條有 exit 預期、canary 為新檔以 `rm` 清除、⛔ 無 `git checkout`／`git stash`／`git add .`；⛔ 無任何 push 預授權措辭。
**但 plan 有一處會讓它自己的 P5 閘門必然失敗（#2 PayPal 圖少了 `h-auto`，見 ⛔ 1），以及兩條驗收判準寫得不夠嚴或預期達不到（⛔ 2、⛔ 3）。**
⛔ 1 需要架構師一句話（裁決點 ⑨），⇒ **plan §12 步驟 1–2（P0、建 worktree、拍 `before-index`）可先做；步驟 3「改主樹 7 檔」之後要等 ⑨ 拍板。**

## 逐項審核

### 檔案層已核（規劃側用 Read / Grep / Glob 對過的數字，供實作側對照）

| plan 聲稱 | 規劃側核對結果 |
|---|---|
| §3.1 十處「檔:行」：sponsor 38／162、team 28／42、FeatureRow 33、FeatureSection 46、HomeHero 24、Navbar 29／79、ServerSection（工作樹）90 | ✅ Read 逐檔一致；十處 `className` 原文逐字一致（含 `transform`、`drop-shadow-[…]`、`brightness-0 invert`、`opacity-65`） |
| §3 `before/*.json` 的 `naturalWidth×naturalHeight`：logo 1024²、sponsor 891×914、team 1920×1080、quasi 512²、Moon_Flame 476×512、liujuhsin 512²、server_quasi 989×1076、launcher 1024²、PayPal **226×142**、vote 894×1080、regular 706×865 | ✅ 四個 JSON 逐筆一致 |
| §3.1 #2 驗算：`rect.h` **30.16**（`sponsor.json` `i:3`）；#3 驗算：`rect` **1022×574.88**（`team.json` `i:2`） | ✅ 一致；48×142/226 = 30.159…、1022×1080/1920 = 574.875 ⇒ 兩處比例值給對 |
| §3.1 #4 三張 `rect` **126×126**（`team.json` `i:3/4/5`）；#5 三張 **448×448**（`modServer.json` `i:2/3/4`）；#6 兩張 **492×504**（`home.json` `i:3/4`）；#7 **192×192**；#8 每頁兩筆 **40×40** | ✅ 一致 ⇒ 「名目值不影響版面」的證據成立（同一位置不同 natural 尺寸的圖 rect 完全相同） |
| §5.5／P5(b) `docHeight` `home 3114 / sponsor 2524 / team 1870 / modServer 3842`；`capture.sh` 第 8 行 `H` 同四值；第 14 行 URL 寫死 `localhost:3100` | ✅ 一致 |
| §6 P5：`before/*.json` 頂層鍵為 `page / viewport / docHeight / imgs`（物件非陣列）；`metrics.js` ⛔ 無 `attrW`/`attrH`；JSON 單行、冒號後無空格；`modServer.json` 兩筆 `src` 含 `namelessrealms.com/_next/image?url=`；每頁 `"currentSrc":"http` 筆數 home 5 / sponsor 4 / team 6 / modServer 5；`loading`/`decoding` 皆 `auto` | ✅ 全部一致（＝主迴圈 2026-09-11 實跑結論的檔案層對照） |
| §4.3 `.eslintrc.json` 10 行、第 4–6 行三條註解、第 3 行行尾逗號；§4.2 `next.config.js` 8 行、第 5 行註解 | ✅ Read 一致 |
| §3.2 import 表：sponsor 3–5 行（`'react'`／`'lucide-react'`／`"@/components/Navbar"`）、team 第 3 行雙引號、Navbar 3–6 行、FeatureRow／FeatureSection／HomeHero 第 1 行 `'use client';` 第 2 行空行、ServerSection 第 1 與 3 行各一次 `'use client';`、5–6 行 import；縮排 FeatureRow／ServerSection 4 空白、其餘 2 空白 | ✅ 一致 |
| §1／§2 `get-img-props.js`：88–96 `generateImgAttrs` unoptimized 早退；223–226 空 `src` ⇒ `unoptimized = true; isLazy = false`；228–230 `config.unoptimized`；240 `NODE_ENV !== "production"`；244–248 `if (!src)`；335–357 LCP `warnOnce`；359–371 `imgStyle`；419–434 最終 props | ✅ 行號與內容一致 |
| §2 §B-3 列「`missing required "width"/"height"` 在第 **253–262** 行 throw」 | ⚠️ **行號錯**：253–262 是 `fill` 與 `style.position/width/height` 的 throw；缺 `width`/`height` 的 throw 在 **267–276**（`is missing required "width" property` 第 268、`"height"` 第 273）。結論不變（同在 240 的 dev-only 區塊內），verification 引用時改行號 |
| §2 `image-optimizer.js` 497–500 standalone 無 `sharp` ⇒ `throw new ImageError(500, …)`；§4.2 `config-schema.js` 第 373 行 `unoptimized: _zod.z.boolean().optional()` | ✅ 一致 |
| §2 `next-auth/providers/discord.js` 15–29 `profile()` 恆給 `image`；第 18／21 行 hostname `cdn.discordapp.com` | ✅ 一致。另核 `next-auth/core/types.d.ts` 第 453 行 `image?: string \| null` ⇒ §4.1 對型別的描述正確 |
| §2 「雙 Navbar 在 HEAD 就存在」 | ✅ 工作樹 `app/layout.tsx` 第 24 行 `<Navbar />`，且 `app/page.tsx` 9、`sponsor` 19、`team` 14、`modServer` 43、`launcher` 15、`voteModpack` 26 各掛一次（Grep）。HEAD 版第 24 行由主迴圈 `git show` 複查屬實；規劃側無 git ⇒ 見未實查 U1 |
| §5.3 worktree 內 symlink `node_modules`／`.env.local` 與 `.next` 是否被 `.gitignore` 擋 | ✅ `.gitignore` 第 4 行 `/node_modules`、第 13 行 `/.next/`、第 33 行 `.env*.local` ⇒ 三者都不會出現在 worktree 的 `git status`；plan P6-2「另可能有 `??`」的顧慮檔案層排除 |
| plan 全文無 push 預授權 | ✅ Grep `push` 命中：第 643 行「commit / push 前一律回報，待架構師確認」與第 794 行；無其他 |
| §2 ／ §6 各項「我本輪已實跑」（`sips`、`lsof`、`lint` 四次、`wc -c`、`which jq`、`node -v`）、§11 位元組 | **實作側已跑、稽核側複驗**——執行結果，規劃側查不到；驗收時重跑即為複核 |

### ⛔ 阻斷點（必改；本檔已給逐字修正，照抄即可動工，⛔ 不需重審）

**⛔ 1. §3.1 #2（`app/sponsor/page.tsx:162` PayPal 圖）照 plan 寫法會改變版面，plan 自己的 P5(a) 閘門必然失敗 ⇒ 需裁決點 ⑨（見「裁決記錄」）。**

- 白話：這張圖現在的 class 只寫了「寬 48px」，高度是瀏覽器照圖片比例自己算出來的（30.16px）。換成 `next/image` 之後，標籤上會多出 `height="142"` 這個屬性；瀏覽器把它當「預設高度」用，**只有 CSS 也寫了高度才會蓋掉它**。`w-12` 沒寫高度 ⇒ 改後這張圖的框會變成 48×142，比現在高 112px。
- 檔案層依據：(a) HTML 規範把 `<img>` 的 `width`/`height` 屬性映射成 CSS `width`/`height` 的呈現提示，作者樣式**逐屬性**覆蓋；(b) Next 自己就為這個情境設了警告——`node_modules/next/dist/client/image-component.js` 第 107–110 行：`heightModified`／`widthModified` 只改其一就 `warnOnce('… has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.')`。
- 其餘 9 處⛔ 不受影響（規劃側逐處核：#1／#4／#5／#6／#10 `w-full h-full`、#3 `w-full h-auto`、#7 `w-32 h-32 md:w-48 md:h-48`、#8 `w-10 h-10`、#9 `w-8 h-8`——寬高都被 CSS 蓋掉）。**只有 #2 是「只設寬」且沒有 `h-auto`**（Grep `h-auto` 於 `app`/`components` 只有 `app/team/page.tsx:31` 一處，即 #3）。
- ⚠️ PNG 上**很可能看不出來**：父層 `w-20 h-20 … flex items-center justify-center`（第 161 行）沒有 `overflow-hidden`，48×142 的框垂直置中後，畫出來的商標仍在同一位置；但 JSON 的 `rect.y`/`rect.h` 會變、框會蓋到上下相鄰元素。⇒ 這正是「度量 JSON 比截圖可靠」的實例，⛔ 不得因 PNG 看起來一樣就放過。
- 處置：見裁決點 ⑨；建議甲（className 加 `h-auto`）。**⑨ 拍板前 ⛔ 不得進 plan §12 步驟 3**（其餘 9 處可以先改，但 P1 要 10 處都換完才過得了，實務上等於整個步驟 3 等 ⑨）。
- 選甲時 P5(a) 的預期要改：`sponsor` 那頁的 diff **恰好一處**（`i:3` 的 `className` 多 ` h-auto`），其餘三頁無輸出。加跑一條把 `className` 也剔除的版本證明「只差這一欄」：
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web/docs/tasks/F9-evidence" && diff <(jq -S '.imgs | map(del(.loading, .decoding, .className))' before/sponsor.json) <(jq -S '.imgs | map(del(.loading, .decoding, .className))' after/sponsor.json); echo "exit=$?"
  ```
  預期：無輸出、`exit=0`。並逐字貼 `jq -r '.imgs[3].className' before/sponsor.json` 與 `after/sponsor.json` 兩行。
- P4 過線標準 2 **加一條⛔ 不得出現的警告**：`has either width or height modified, but not the other`（它是 ⛔ 1 這類問題的機器訊號；10 處都正確時不會出現）。

**⛔ 2. §5.4 `git diff --cached components/ServerSection.tsx` 的判準「只含 import 一行 + `<Image>` 那一行」不夠嚴，且 plan 內部數字互相矛盾。**

- plan 第 268 行寫「共 `+3 -1`」、第 289 行寫「`--stat` 應顯示 `2 +-` 或 `4 ++--` 量級」——三個數字沒有一個對。依 §3.2（第 6 行之後插 import，第 7 行本來就是空行，⛔ 不另加空行）+ 第 81 行換一行 ⇒ **新增 2 行、刪除 1 行**，`--stat` 是 `3 ++-`。
- 「肉眼看 diff 只有兩個 hunk」是抽查式判準。改成三個**機器判準**，全部通過才算：
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --cached --numstat components/ServerSection.tsx; echo "exit=$?"
  ```
  預期**逐字**：`2	1	components/ServerSection.tsx`（tab 分隔）。多一行少一行都停下回報。
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git diff --cached components/ServerSection.tsx | grep -E '^[+-]' | grep -vE '^(\+\+\+|---)'; echo "exit=$?"
  ```
  預期**恰三行**：`+import Image from 'next/image';`、`-…<img src={s.image} …HEAD 版 className… />`、`+…<Image src={s.image} alt={s.name} width={1920} height={1031} className="…同一串…" />`。
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git ls-files -s components/ServerSection.tsx; echo "exit=$?"
  ```
  預期：mode `100644`（與寫入前同一條指令的輸出比對，mode 不變；blob 雜湊 = §5.4 第一條印出的 `$BLOB`）。
- plan 第 290 行的「⛔ 不得出現」禁字清單（`servers: any[] = []`、`opacity-65`、`max-w-6xl`、`min-h-[260px]` …）是**負向對照**，但它只在「這些字串在 HEAD 版不存在」時才有鑑別力。⇒ 寫 index **之前**先跑：
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && git show HEAD:components/ServerSection.tsx | grep -cE 'opacity-65|any\[\] = \[\]|min-h-\[260px\]|max-w-6xl'; echo "exit=$?"
  ```
  預期印 `0`（`grep -c` 無命中時 exit=1 是正常的，證據是那個 `0`）。若不是 0 ⇒ 該字串不能當禁字，據實換掉。⚠️ 規劃側無法 `git show` ⇒ 未實查 U2。

**⛔ 3. P3-b 的 grep 樣式與任務包 P5 犯同一種錯：`/modServer` 的兩個外部 `src` 本身就含 `/_next/image`，「無輸出」的預期在 build 產物上同樣達不到。**

- 檔案層依據：`app/modServer/page.tsx` 第 30、36 行 `img: "https://namelessrealms.com/_next/image?url=…"` 是字面常數 ⇒ 會原樣出現在 `.next/server/app/modServer*`（HTML／RSC／SSR bundle）。`grep -rlo "/_next/image" .next/server/app` 至少命中 modServer ⇒ 實作側會「停下回報」白繞一輪，或更糟——把它解讀成 ①丙沒生效。
- 修正版（本地端點的 URL 在產物裡一定緊接在引號或 `(` 之後，外部的則是 `.com/_next/image`）：
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && grep -rEo "[\"'(]/_next/image\?" .next/server/app | head; echo "exit=$?"
  ```
  預期：**無輸出**（`exit` 是 `head` 的，⛔ 不當證據；證據是空輸出）。
  配對正控兩條（證明 grep 抓得到、且樣式能區分本地／外部）：
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && grep -rlo "namelessrealms.com/_next/image" .next/server/app | head; echo "exit=$?"
  ```
  預期：**有輸出**（modServer 相關檔）。
  ```bash
  cd "/Users/quasi-pc/Desktop/Projects/Nameless Realms/namelessrealms-web" && grep -rlo "/images/logo.png" .next/server/app | head; echo "exit=$?"
  ```
  預期：**有輸出**。
- 要不要留 P3-b：**留**。它是本輪唯一能在不跑 Docker 的前提下、對 **production build 產物**佐證 ①丙的手段（dev 與 production 的 `unoptimized` 路徑相同，但只有 build 產物是要被裝進 image 的東西）。⚠️ 仍⛔ 不是 Docker 實測（plan §9 第 1 條措辭維持）。
- ⚠️ 執行順序：P3-b 必須在 P4 `yarn dev` **之前**跑（dev 會覆寫 `.next/`）——plan §12 第 5→6 步的順序已對，verification 貼出時註明。

### ⚠️ 建議（不阻斷）

1. **§4.1 #9 的 TypeScript 顧慮很可能不成立，但備案可接受。** TS 3.7 起對 `a?.b` 做真值檢查時會把 `a` 一併收窄為非空（optional chain narrowing）⇒ `{session.user?.image && (<Image src={session.user.image} …/>)}` 預期能直接過型別檢查。⚠️ 這是規劃側對語言行為的認知，**⛔ 未實查**（U5：`yarn build` 的 `Linting and checking validity of types` 段會驗到）。若報錯，plan 列的 `{session.user && session.user.image && (…)}` 可接受；⛔ 禁 `any`／`@ts-ignore`／`!` 的界線正確。verification 寫明實際用了哪一種。
2. **P5「先捲到底、等 2 秒、再捲回頂」算同一把尺——認可**，理由：`metrics.js` 的 `rect` 用 `r.top + scrollY`／`r.left + scrollX`（第 9 行）⇒ 文件座標，與捲動位置無關；捲動只影響 `complete`／`naturalWidth`（lazy 圖有沒有載），⛔ 不影響任何比對欄位。但要**對稱**：`before-index`／`after-index`（P6-1／P6-4）也做同樣前置，即使 HEAD 版是 `loading:auto` 用不到。verification 把這個前置寫成一行固定程序。
   ⚠️ `capture.sh` 用 `--window-size=1280,H`（視窗高 = 整頁高）⇒ lazy 圖理論上全在視窗內、`--virtual-time-budget=8000` 內會載入；**⛔ 未實查**（U8）。若 after PNG 有空白圖但 JSON `complete:true`，先懷疑是 headless 的 lazy 時序、⛔ 不要當版面壞了，也⛔ 不要為此加 `priority`。
3. **待裁 3（`capture.sh` 高度）——放行，條件照主迴圈 2026-09-11 的三條**（見下方「非架構師層級處置」表）。另給一個可選的更好做法（乙）：把第 8 行的 `H` 改成從同階段 JSON 讀 `docHeight`（`H[$k]=$(jq -r .docHeight "$DIR/$k.json")`，缺檔時回退寫死值），⇒ 腳本本身變成「同一把尺」、⛔ 不需人工覆寫。前提：(i) `metrics.js` 必須先於 `capture.sh` 跑（plan §12 與 P5／P6 的順序已是如此）；(ii) `before/` 四張 PNG 仍有效——因為寫死值與 `before/*.json` 的 `docHeight` **逐頁相等**（檔案層已核）；(iii) 這是**改腳本**，⛔ 不用 `.bak` 暫時覆寫那套，而是**一次改、之後所有階段都用**，並在 verification 貼 `diff` 與理由；(iv) 若待裁 4 裁「進 git」，進的就是改後版本。甲（暫時覆寫）與乙擇一皆可，⛔ 不得混用；verification 寫明選了哪個。
4. **「改檔」段的 `git diff --stat` 預期改成精確 `--numstat`**（plan 自註是量級，但既然算得出來就算出來）：依 §3.1／§3.2 的改法——`app/sponsor/page.tsx` `5 2`（import +1；#1 換行 −1+1、+2 行寬高；#2 −1+1）、`app/team/page.tsx` `7 2`、`components/FeatureRow.tsx` `5 1`（import +1、空行 +1、−1+1、+2）、`components/FeatureSection.tsx` `5 1`、`components/HomeHero.tsx` `3 1`、`components/Navbar.tsx` `5 2`（#9 一行變三行）、`.eslintrc.json` `1 7`、`next.config.js` `1 0`。⚠️ 若裁決 ⑨ 選甲，sponsor 仍是 `5 2`（`h-auto` 在同一行內）。實作時貼 `git diff --numstat -- <八檔>`，與此表對不上就查原因。
5. **P7(b) 的 `echo "exit=$?"` 量到的是最後一個 `for` 的狀態，⛔ 不當證據**；證據是「`MISSING` 行的完整清單」。預期 `MISSING` 只有：`.eslintrc.json` 三行註解、`app/sponsor/page.tsx` 第 162 行（含 `https://`）。⚠️ plan 第 599 行對 Navbar 第 79 行的推測「若未被樣式抓到則不會出現」——該行沒有 `//`、`/*`、`*/`（Read 核過），⛔ 不會出現；verification 直接寫「不出現」，⛔ 不寫「若」。
6. **§2 §B-3 行號**：`253–262` → `267–276`（見上表）。§8 建議的 `CLAUDE.md` 地雷條目引 `image-optimizer.js` 第 497–500 行——正確，沿用。
7. **P0-D 把 `md5 -r` 結果寫到 `/tmp/f9-recheck.txt`**：實作側也有 scratchpad 紀律，改寫到自己的 scratchpad 路徑；與結論無關。
8. **P8 對帳表的 `before-index/`／`after-index/` JSON 只有 `home.json` 一檔**（P6-1／P6-4 只對 `/` 跑 `metrics.js`；`capture.sh` 則會拍四頁 PNG）——表裡寫清楚「各 1 個 JSON、各 4 張 PNG」，免得收案時以為漏了三檔。
9. **§9 未驗清單 10 條——據實留著，⛔ 不要為了好看去補。** 第 9 條（`before-impl/`）是可選；第 10 條（index 版 `/` 的高度與筆數是推算）在 P6-1 實跑後從「未驗」移到「已驗」並貼實際值。建議**加一條**：「#2 加 `h-auto` 後的版面正確性只由 P5 JSON 的 `rect` 證明，PNG 上因父層無 `overflow-hidden` 而肉眼分不出——這是度量 JSON 的價值所在，⛔ 不是未驗」（放守界聲明或 P5 註即可）。
10. **`before-index` 只拍 `/` 的度量、但 `capture.sh` 連 `/sponsor` `/team` `/modServer` 也拍**——plan 說「留著」，同意；但 verification 的截圖對照表要把這 6 張（`before-index`／`after-index` 各 3）標成「index 版、非主要證據」，避免架構師人工看圖時混淆。
11. **worktree 與主樹輪流用 3100**（plan §5.5 取代任務包建議的 3101）——認可，理由充分（`capture.sh` 第 14 行寫死 3100，改埠就要動腳本）。每次起 dev 前 `lsof -iTCP:3100 -sTCP:LISTEN` 重查（U6）。

### ✅ 確認事項

- **八項裁決落位**：§1 表逐項「①丙／②甲／③甲／④甲+甲／⑤甲／⑥乙／⑦甲／⑧甲」與架構師 2026-09-10 拍板一致；表頭據實註明「白話版摘要上拍板，⛔ 未審閱全文」——✅。
- **①丙實施**：`next.config.js` 只加第 5 行 `    images: { unoptimized: true },`（4 空白縮排、單引號風格、行尾逗號、既有註解仍為物件內最後一行）——✅ 與任務包 §A-2 指定位置一致；⛔ 不加 `remotePatterns`（`get-img-props.js` 88–96 已核 loader 不被呼叫）。
- **②甲**：P3 以 `git diff --stat yarn.lock package.json` 無輸出實證零變動——✅。
- **③甲**：10 處全 `width`/`height`；#2、#3 用實量比例值且驗算相符；名目值四處的「父層定尺寸」理由有 JSON 佐證——✅（⛔ 1 是另一件事：`h-auto`，⛔ 不是比例值錯）。
- **④甲(a)**：§4.1 改後全文只換中間一行、第 77 行與登出鈕不動——✅；**④甲(b)**：E2E 表四步、一次一步、fixture 為 `metrics.js`、期望值用 `rect.w`/`rect.h` = 32（已對齊 `metrics.js` 欄名，⛔ 不是任務包 fixture 的 `rectW`）——✅；「無改前對照」措辭——✅。
- **⑤甲**：worktree 路徑在 repo 之外；symlink 兩項皆被 `.gitignore` 擋（檔案層已核）；⛔ 不 `cp` `app/layout.tsx`／`app/staff/page.tsx`；P6-2 預期恰 9 檔 ` M`——✅；P6-3 含 worktree 自己的 canary 負向對照——✅。
- **⑥乙**：§7 只 add `**/*.json`、PNG 為預期 `??`、雜湊用 `shasum -a 256`——✅。
- **⑦甲**：無新檔、不碰 `lib/`、不動 `eslint.dirs`——✅。
- **⑧甲**：刪 `rules` 與第 4–6 行；逗號處置見「非架構師層級處置」表——✅。
- **N0／P1／N1／P2 的負向對照設計**：N0（改前 `-c` preset ⇒ exit=1、10 命中）→ P1（同指令 exit=0）→ N1（repo 設定 + canary ⇒ exit=1、1 命中）→ P2（exit=0）；P2 單獨不算數已明寫——✅ 符合 `CLAUDE.md`「CI 現況」的負向對照紀律。
- **canary 清除三重確認**（`rm`、`ls data/`、`git status --porcelain data/`）+ P8 再查——✅；⛔ 無 `git checkout`。
- **P7 全稱比對**用 `grep -Fqx` 整行逐字——✅ 符合守則 8 ⭐「⛔ 不抽查」；`ServerSection.tsx` 改用 `git diff --cached` + worktree 版 (b)——✅。
- **§7 逐檔 `git add`、add 與 commit 不串同一行、`ServerSection.tsx` 走 `update-index`**——✅；`F9.md`／`F9-background.md`／`F9-plan-review.md`／`.claude/launch.json` 留收案——✅。
- **據實措辭**：§3 P3「`yarn build` 綠證明不了 `width`/`height` 沒漏」、§9 第 1 條「未驗 Docker」、第 7 條「symlink 依賴⛔ 不等於乾淨安裝」——✅。
- **無 push 預授權**、**commit 訊息⛔ 無 `Co-Authored-By`**——✅（第 643–644 行）。
- **HEAD `df2b8ff`**：與派工上下文的 git 快照一致（規劃側⛔ 未執行 git）。

### ⛔ 未實查，實作側必查（規劃側無 Bash；逐條寫明要跑什麼）

| # | 事項 | 要跑什麼才驗得到 |
|---|---|---|
| U1 | HEAD 版 `ServerSection.tsx` 第 81 行原文與 className（含 `transform` / `transition-transform duration-1000`）、import 在 5–6 行、第 1／3 行重複 `'use client';`（主迴圈已複查屬實，規劃側無 git） | `git show HEAD:components/ServerSection.tsx \| sed -n '1,8p;81p'` 貼原文 |
| U2 | ⛔ 2 的禁字清單在 HEAD 版為 0 命中（負向對照的前提） | ⛔ 2 第四條指令，預期印 `0` |
| U3 | ⛔ 3 修正版樣式在 build 產物 0 命中，且兩條正控有輸出 | ⛔ 3 三條指令（在 P4 起 dev 之前跑） |
| U4 | 裁決 ⑨ 選甲後 #2 的 `rect` 恢復 `48×30.16`、`y` 1913（`sponsor.json` `i:3`） | P5(a) + ⛔ 1 的 `del(.className)` 版 diff |
| U5 | §4.1 #9 條件渲染的型別檢查 | P3 `yarn build`（`Linting and checking validity of types` 段） |
| U6 | 3100 是否空閒（主迴圈 2026-09-11 實查 3100／3101／3102 皆空閒，但那是快照） | 每次起 dev 前 `lsof -iTCP:3100 -sTCP:LISTEN` |
| U7 | symlink `node_modules` 下 worktree 的 `next dev`／`next lint`／`next build` 能跑 | P6-1／P6-3 |
| U8 | headless Chrome 全高視窗下 lazy 圖是否在 `--virtual-time-budget=8000` 內載入 | after PNG 目視 + 同頁 JSON `complete` 對照 |
| U9 | P4 console 無 `has either width or height modified, but not the other`、無 `Image is missing required "src" property` | P4 逐頁 console |
| U10 | `git update-index --cacheinfo` 後 mode 仍 `100644`、blob = `$BLOB` | ⛔ 2 第三條 `git ls-files -s` |
| U11 | index 版 `/` 的 `docHeight` 與 #10 的 `rect.y + rect.h`（決定 `capture.sh` 高度要不要覆寫） | P6-1 `metrics.js` |
| U12 | `sharp` 未安裝 | P0-E `ls node_modules/sharp` |

## 對任務包的回饋（含實作側推翻／更正之處；⚠️ 這些都是規劃側自己的稿，據實記）

| # | 任務包／背景原文 | 判定 | 處置 |
|---|---|---|---|
| 1 | `F9.md` P5 四條指令：`jq -S 'map(del(.loading,.decoding,.attrW,.attrH))'`（頂層 `map`）、`del(.attrW,.attrH)`、`grep -c "_next/image" after/*.json` 預期四檔皆 0、正控 `'"currentSrc": "http'`（冒號後有空格） | **實作側對，任務包原文有誤**（主迴圈 2026-09-11 實跑：頂層 `map` exit=5；`.imgs[0]` 欄位無 `attrW`/`attrH`；`grep -c` 於 `before/modServer.json` 得 1；有空格樣式命中 0；規劃側檔案層對照一致）。**成因**：任務包 P5 是照「實作要點」自備 fixture 的欄位形狀寫的，但同一包 §G 又規定「`before/` 附腳本以那份為準」——兩段互相矛盾，規劃側沒把 P5 對齊 `metrics.js`。 | **以 plan §6 P5 (a)–(d) 修正版為準**；任務包⛔ 不重發（本檔即更正紀錄）。verification 附四點實測輸出作為「為什麼改指令」的證據 |
| 2 | `F9.md` §A-4 第 10 列 HEAD 版 className 寫成 `w-full h-full object-cover group-hover:scale-105 opacity-50 grayscale group-hover:grayscale-0`（背景檔 §2-3 第 10 列同） | **抄漏 `transform` 與 `transition-transform duration-1000`**（實作側 `git show` 實讀、主迴圈複查屬實）。成因：規劃側轉抄了背景檔的「className 關鍵」節錄欄，卻標成完整原文。 | 以 plan §3.1 10b 列為準；U1 再貼一次原文 |
| 3 | `F9-background.md` §2-3 註「空 `src` 會丟例外」 | 任務包 §B-6 已在檔案層推翻（`get-img-props.js` 223–226、244–248），plan §2 再核一次——**任務包這條沒錯**，是背景檔的推測錯 | 無 |
| 4 | `F9.md` §C-3「`app/layout.tsx` HEAD 版是否掛 Navbar ⛔ 未實查」 | 已查清：HEAD 第 24 行就有（主迴圈 `git show`；該檔未 commit 改動只有 `metadata.description` 一行）⇒ **雙 Navbar 是 HEAD 既有問題**，`F9-evidence/README.md` 第 35–37 行已更正 | 無；backlog 建議措辭沿 plan §8 第 4 點 ③ |
| 5 | `F9.md` §G 第二個 dev server 建議 3101 | plan 改為與主樹輪流用 3100（守 `capture.sh` 同一套腳本）——**認可** | 無 |
| 6 | `F9.md` E2E 步驟 3 期望值用 fixture 欄名 `rectW`/`rectH`/`naturalW` | plan 已改為 `metrics.js` 的 `rect.w`/`rect.h`/`naturalWidth`——**plan 對** | 無 |
| 7 | `F9.md`「改檔」預期 `.eslintrc.json 應 -6`（裁決 ⑧ 甲） | **任務包錯**：第 3 行行尾逗號也要動 ⇒ `-7 +1`（plan §6 對） | 無 |
| 8 | `F9.md` 實作要點對 #2 只寫「只設寬、比例錯會改佔位高度」 | **規劃側漏了 `h-auto` 這件事**（見 ⛔ 1）——比例給對只解決載入前的佔位，`height` 屬性當呈現提示這一層任務包沒提 | 裁決點 ⑨ |

## 放行條件

- **照本檔 ⛔ 1–3 修正即可動工，⛔ 不需修 plan 重審**；建議 1–11 可採納或在 verification 說明不採。
- **順序**：plan §12 步驟 1–2（P0 含 N0、建 worktree、`before-index`）**現在可做**；步驟 3 之後**等裁決點 ⑨**（架構師一句話：甲／乙）。
- 待裁 4（evidence 根層四檔進不進 git）**⛔ 不擋實作**，commit 前需答（見裁決記錄第 9 列）。
- 提醒：實作完成產 `docs/tasks/F9-verification.md`（格式沿用 `docs/tasks/verification_template.md`，內含 §8 的 `CLAUDE.md` 建議文字、前後截圖路徑對照表、PNG `shasum -a 256`、§9 未驗清單）；
  **commit/push 前回報待架構師確認**；⛔ 不打任何 tag；⛔ worktree 在架構師確認 commit 之後才 `git worktree remove`。

## 裁決記錄（拍板後由 nr-planner 追加，⛔ 不另立檔）

> 📝 架構師在對話中拍板後，由 **nr-planner** 在本節**追加**一條（⛔ 不是主迴圈、⛔ 不是實作側）：
> **逐字轉錄**架構師原話或所選選項、標明「架構師 YYYY-MM-DD 於對話拍板」、甲/乙/丙選項原文保留存查。
> 未拍板的裁決點一律留「⏳ 待批覆」，⛔ 不得預填。本檔已放行後才拍的裁決**也追加在這裡**
> （架構師 2026-09-03 裁決：⛔ 不另立 `{代號}-decisions.md`，五件套不變六件套；先例 Meridian M1-8 檔末「結案裁決」節）。

⚠️ **據實聲明（第 0、1 輪皆適用）**：架構師這兩輪都是**在主迴圈提供的白話版摘要上拍板的**，
⛔ 未審閱任務包 `F9.md` 全文、⛔ 未審閱 `F9-plan.md` 全文、⛔ 未審閱本檔全文。
第 0 輪的甲/乙/丙/丁四案原文由主迴圈持有，本 repo `F9-background.md` §一 留有四案摘要；
第 1 輪 ①–⑧ 的甲/乙/丙選項原文保留於 `F9.md`「裁決點」節存查。
⚠️ 第 1 輪的 ①② 是**架構師反問後才裁的**：他原話「**如果以後要優化圖呢？加吧？**」⇒ 主迴圈查證後答覆三點
（晚點加無額外代價／現在加只有 Docker 實測驗得到而本 repo 無 build CI 且打 tag 就發版／開最佳化會讓他已裁的「改前改後逐欄相同」驗法失效）
⇒ 他改裁「①丙 ②甲，最佳化另開一筆」。**最佳化已另開 backlog（⛔ 不在本包範圍）。**
⚠️ **2026-09-11／09-12 追加的第 9、10、12、13 列同樣是白話版摘要上拍板**（⛔ 未審閱本檔、`F9-verification.md`、`F9-verification-audit.md` 全文）；
其中第 10 列（⑨）的原裁決前提事後被實測推翻，架構師是在被告知後**重新確認**「留」，經過完整記於該列。

| # | 裁決點 | 架構師裁決（逐字） | 來源 / 日期 |
|---|---|---|---|
| 0 | 怎麼驗「沒改壞外觀」（主迴圈列甲「人工目視前後比對」／乙「只做 lint 判準能過的最小改法」／丙「甲+乙合併」／丁「先不開 F9」） | 「**丙，ServerSection 只收 img 那幾行**」⇒ 兩項已裁：驗法 = 丙（最小改法 + 改前／改後外觀證據由架構師人工看）；`components/ServerSection.tsx` 的長期未 commit 舊改動 ⛔ 不進 F9 commit | 架構師 2026-09-10 於對話拍板（白話版摘要上拍板） |
| 1 | ① 圖片最佳化路線（甲每張 `unoptimized` prop／乙走最佳化 + `remotePatterns`／丙全站 `images.unoptimized: true`） | 「**①丙 ②甲，最佳化另開一筆**」⇒ **丙**：`next.config.js` 加 `images: { unoptimized: true }`，10 處 `<Image>` 都不寫 `unoptimized` prop | 架構師 2026-09-10 於對話拍板（白話版摘要上拍板；反問「如果以後要優化圖呢？加吧？」後改裁） |
| 2 | ② 要不要新增 `sharp`（甲不加／乙加） | 同上句 ⇒ **甲**：⛔ 不加 `sharp`；最佳化另開 backlog | 同上 |
| 3 | ③ `width`/`height` vs `fill`（甲全部 `width`/`height`／乙全部 `fill`／丙混用） | 「**甲，甲，甲，乙，甲，甲**」（依序對應 ③④⑤⑥⑦⑧）⇒ **甲**：10 處全給 `width`/`height`，⛔ 不用 `fill` | 架構師 2026-09-10 於對話拍板（白話版摘要上拍板） |
| 4 | ④ #9 Navbar 頭像：(a) 甲條件渲染／乙保留 `\|\| ""`／丙保留 `<img>` + eslint-disable；(b) 甲架構師登入拍改後／乙待人工 | **甲 + 甲**：(a) 條件渲染；(b) 改後由架構師本人登入拍一張，依「真機 E2E 一次一步」執行，據實記「無改前對照」 | 同上 |
| 5 | ⑤ #10 ServerSection 外觀證據（甲 `git worktree` 開 HEAD 乾淨樹拍／乙待人工／丙暫時填回工作樹陣列） | **甲**：`git worktree` 開 HEAD 乾淨樹拍 ServerSection 那張圖，並在同棵樹驗 index 版本的 lint + build | 同上 |
| 6 | ⑥ 證據檔進不進 git（甲全進／乙 JSON 進、PNG 不進／丙全不進） | **乙**：`docs/tasks/F9-evidence/{before,after}/` 的度量 JSON 進 git、PNG ⛔ 不進（記 `shasum -a 256`，收案時由主迴圈搬離） | 同上 |
| 7 | ⑦ 抽不抽共用元件（甲不抽／乙抽到 `components/Img.tsx`／丙抽進 `lib/`） | **甲**：⛔ 不抽共用元件 | 同上 |
| 8 | ⑧ `.eslintrc.json` 三行註解（甲整段刪，回到 F8 裁決 1a 原形／乙留一行沿革註解） | **甲**：`.eslintrc.json` 的 `rules` 區塊與第 4–6 行三行說明整段刪 | 同上 |
| 8+ | 額外：`.claude/launch.json` 收案時要不要進 git | 「**好**」⇒ 要進，由主迴圈收案時處理 | 架構師 2026-09-10 於對話拍板 |
| 9 | **待裁 4**：`docs/tasks/F9-evidence/` **根層**的 `README.md`／`metrics.js`／`capture.sh`／`MD5SUMS.txt` 進不進 git（裁決 ⑥乙 的選項原文只涵蓋 `{before,after}/` 兩個子目錄，這四檔不在範圍內）。**白話**：JSON 是量出來的數字，這四個檔是「用什麼尺量的」——不進 git 的話，以後看到那些數字不知道怎麼量的。**甲：四檔全進 git**（plan 實測合計約 5.9 KB：`README.md` 3107 B、`capture.sh` 1295 B、`metrics.js` 1121 B、`MD5SUMS.txt` 356 B——實作側 `wc -c`，規劃側未核）；**乙：只進 `README.md` + `metrics.js`**（JSON 的尺），`capture.sh`／`MD5SUMS.txt` 隨 PNG 一起搬離；**丙：全不進**。**規劃側建議甲**：verification 會記 PNG 的 `shasum`，`capture.sh` 就是那些雜湊的出處；`MD5SUMS.txt` 是「基線自落檔後沒被動過」（P0-D）的依據；四檔都是文字、幾 KB。⚠️ **⛔ 不擋實作，commit 前需答** | 「**要**」⇒ **甲**：`README.md`／`metrics.js`／`capture.sh`／`MD5SUMS.txt` 四檔進 git（仍逐檔 `git add`，⛔ 不用 `git add .`）。⚠️ 裁決 ⑥乙 其餘不變：`{before,after}/` 的 **JSON 進、PNG ⛔ 不進**。理由（主迴圈提出、架構師採納）：⑥乙 的選項原文只涵蓋 `{before,after}/` 兩個子目錄；沒有 `metrics.js`／`capture.sh`，進版控的 JSON 就沒有「這把尺是什麼」的定義。**架構師 2026-09-12 於對話拍板（白話版摘要上拍板，⛔ 未審閱本檔全文）**；由 nr-planner 2026-09-12 回填 |
| 10 | **裁決點 ⑨（本檔 ⛔ 1 新增）**：#2 PayPal 圖（`app/sponsor/page.tsx:162`，className `w-12 object-contain brightness-0 invert`）換 `next/image` 後會多 `height="142"` 屬性，CSS 沒寫高度 ⇒ 框變 48×142。**白話**：這張圖只寫了「多寬」沒寫「多高」，換寫法後瀏覽器會拿新標籤上的高度數字當預設高度，圖框會變高 112px；要補一句「高度自動」才會跟現在一樣。**甲：className 加 `h-auto`**（改成 `w-12 h-auto object-contain brightness-0 invert`；與同 repo #3 `app/team/page.tsx:31` 的既有寫法一致；⛔ 不加 inline style；JSON 只有這一筆的 `className` 欄多 ` h-auto`，rect 應完全相同）；**乙：加 `style={{ height: 'auto' }}`**（className 逐字不動，但違反 plan §3.2「⛔ 不加 `style`」，且 `metrics.js` 量不到 inline style ⇒ 證據看不出改了什麼）；**丙：不處理，接受版面差異**（違反第 0 輪已裁的「外觀零差異」，⛔ 列出只為完整）。**規劃側建議甲**。⚠️ 這是規劃側在任務包裡漏掉的事（見「對任務包的回饋」第 8 列），⛔ 不是實作側的錯 | **(1) 原裁決**：「**甲**」⇒ 加 `h-auto`。架構師 2026-09-11 於對話拍板（白話版摘要上拍板）。實作側已照做（現行 `app/sponsor/page.tsx` 第 165 行 className `w-12 h-auto object-contain brightness-0 invert`；規劃側 Grep 核過。⚠️ 本列左欄的 `:162` 與 `app/team/page.tsx:31` 是改前行號，`team` 的 `h-auto` 現行在第 34 行）。<br>**(2) ⚠️ 事後實測：本裁決的前提不成立**（據實記）。原前提（規劃側於本檔 ⛔ 1 提出、主迴圈複查後轉達）：換 `<Image>` 後標籤多出 `height="142"`，CSS 沒寫高度就蓋不掉 ⇒ 框由 48×30.16 變 48×142 並觸發 aspect-ratio warning。**實際**：TailwindCSS preflight（`node_modules/tailwindcss/src/css/preflight.css` 第 377–381 行，規劃側 Read 核過）已對全站下 `img, video { max-width: 100%; height: auto; }` ⇒ **不加 `h-auto` 也是 48×30.16、也不會跳警告**。實作側以「把 `h-auto` 拿掉再量一次」的 canary 對照確認（`F9-verification.md`「裁決 ⑨ 的實測」節：拿掉後 `i:3` rect 仍 `{"x":882,"y":1913,"w":48,"h":30.16}`、console 無警告、備份檔還原 `diff` 無輸出）；主迴圈與稽核側（`F9-verification-audit.md` #64）各自複查屬實。<br>**(3) 錯在哪（據實記）**：主迴圈當時只驗證了因果鏈的**前半段**（確認 Next 自己不補 `height:auto`），**⛔ 沒有查 Tailwind preflight 這個全站來源**，就向架構師回報「已驗證，成立」⇒ 架構師的 ⑨ 是在**不完整的資訊**上拍板的。規劃側附註：這條前提最初是規劃側在本檔 ⛔ 1 寫的，規劃側同樣沒查 preflight，⛔ 不只是主迴圈的錯。<br>**(4) 知情後重新確認**：2026-09-12 主迴圈據實告知後，架構師逐字答「**留**」⇒ **維持加 `h-auto`**。⚠️ 此為**知情後的重新確認**，⛔ 不是原裁決的自動延續。保留理由（主迴圈提供、架構師採納）：不必依賴 Tailwind preflight 一直存在；與 `app/team/page.tsx` 既有的 `h-auto` 寫法一致。代價：`after/sponsor.json` 的 `i:3` `className` 欄比 `before/sponsor.json` 多一個 ` h-auto`（**預期差異**；規劃側 Read 兩檔核過，rect 四欄逐字相同）。**架構師 2026-09-11（甲）／2026-09-12（留）於對話拍板，皆為白話版摘要上拍板、⛔ 未審閱本檔或 verification 全文**；由 nr-planner 2026-09-12 回填 |
| 11 | 外觀已人工核（架構師看完 verification 的前後截圖對照表後回填） | ⏳ 待驗收後 | |
| 12 | **`CLAUDE.md` 三段改寫**：`F9-verification.md`「建議的 `CLAUDE.md` 改寫文字」(1)–(3) 要不要採用（實作側⛔ 未自己改 `CLAUDE.md`，沿 F8 收案 commit `028c4eb`／F10 收案 commit `ff14496` 慣例：實作側草擬、主迴圈收案時套用） | 「**採用**」⇒ 三段全採。**已由主迴圈套用**（規劃側 Read 現行 `CLAUDE.md` 核過落點）：① 「CI 現況」節改寫為 F9 收案後的事實（第 116–125 行：`no-img-element` 於 2026-09-11 重新生效、`images: { unoptimized: true }`），並保留「引用 lint 一律連同兩個負向對照」的要求（第 118–123 行）；② 地雷清單新增第 7 條（第 289–297 行：standalone + 無 `sharp` ⇒ `/_next/image` 回 500）；③ 地雷清單新增第 8 條（第 299–304 行：worktree + symlink `node_modules` ⇒ 清 `.next` 會清空主樹）。另在第 6 條底下（第 283–287 行）補 F9 的 `ServerSection.tsx` 雙版本經驗與 `git diff --cached --numstat` 應為 `2	1` 的判準。主迴圈自述已對 `CLAUDE.md` 跑全稱比對：HEAD 有而現行沒有的**恰 4 行**，全部是 ① 刻意取代掉的那段、無誤刪 —— ⚠️ **⛔ 規劃側未實查**（無 Bash，需 `git show HEAD:CLAUDE.md` 逐行 diff 才驗得到），列為稽核側／實作側必查。**架構師 2026-09-12 於對話拍板（白話版摘要上拍板，⛔ 未審閱三段全文）**；由 nr-planner 2026-09-12 回填 |
| 13 | **commit 批准**：主迴圈問「稽核結果出來後就可以提交了嗎？要不要我先擬提交訊息給你看？」 | 「**直接提交**」⇒ 批准 commit、且⛔ 不需先審提交訊息。⚠️ **據實附註**：該批准是在**稽核報告（`F9-verification-audit.md`）產出之前**給的；稽核報告隨後於「稽核側認為『不該現在 commit』的理由」節列出五條事實（⑨ 重裁中、本檔第 9／10 列仍待批覆、N1 未經第三方獨立證實、#31 一格數字不符、#9 Navbar 真機 E2E 未執行），主迴圈據此**先補完缺口再下 commit**（本列與第 9／10／12 列的回填即為其一；⛔ 未擅自放寬，亦⛔ 未擱置架構師的批准）。⚠️ **本列只涵蓋 commit；push ⛔ 仍未獲授權**（`push-gate` 無條件擋），push 前另行回報待架構師確認。**架構師 2026-09-12 於對話拍板**；由 nr-planner 2026-09-12 回填 |

### 非架構師層級的處置（主迴圈／規劃側，⛔ 不是架構師裁決；留痕供稽核）

| 待裁 | 處置者 / 日期 | 內容 |
|---|---|---|
| 待裁 1（任務包 P5 四條指令） | 主迴圈 2026-09-11 實跑證實；規劃側本檔認可 | 照 plan §6 P5 (a)–(d) 修正版執行（見「對任務包的回饋」第 1 列） |
| 待裁 2（`.eslintrc.json` 第 3 行行尾逗號） | 主迴圈 2026-09-11 **讀既有裁決**（⛔ 不是新裁決）；規劃側本檔核對 | **拿掉**。依據：架構師所選 ⑧甲的選項原文（`F9.md` 裁決點 ⑧ 表）本身就寫「檔案剩 `{ "root": true, "extends": "next/core-web-vitals" }`」——**沒有行尾逗號**（規劃側 Read 核過）；「兩鍵一個字元都不動」指**鍵名與值**，⛔ 不是分隔符；留 `"rules": {}` 會與「整段刪、回到 F8 裁決 1a 原形」直接矛盾。⇒ 改後全檔 4 行、`git diff --numstat` `1 7` |
| 待裁 3（`capture.sh` 高度可否為 index 版暫時覆寫） | 主迴圈 2026-09-11 澄清**自己寫的** README 規則；規劃側本檔認可並補乙案 | **可以**，條件三個：(a) 同一棵樹的改前與改後**用同一個高度值**；(b) 用 `.bak` 備份原檔、事後還原並以 `diff` 證明還原無誤（⛔ 不用 `git checkout`）；(c) verification 寫明「index 版用的高度值與工作樹版不同、原因是 index 版多渲染一張伺服器卡片」，⛔ 不得讓讀者以為兩組數字可以直接互比。可選乙案（腳本改讀 JSON `docHeight`）見建議 3 |
