# F9 背景交付件（主迴圈落檔，供 `nr-planner` 讀）

> ⚠️ 本檔存在的理由：規劃側**讀不到知識庫**（`vault-guard` 強制）。
> 依架構師 2026-09-04 裁決 D-1，主迴圈要交給規劃側的背景**先落成 repo 檔**再派它讀，
> ⛔ 不經派工訊息、⛔ 不抄進任務包。
> ⚠️ 本檔是**背景**，⛔ 不是任務包本身；任務包由 `nr-planner` 產出為 `docs/tasks/F9.md`。
> 落檔者：主迴圈，2026-09-10。HEAD `df2b8ff`。

---

## 一、F9 是什麼（backlog 原文轉錄）

| # | 型別 | 內容 | 狀態 |
|---|------|------|------|
| F9 | 債 | **10 處 `<img>` 未改用 `next/image`**（`@next/next/no-img-element` 目前在 `.eslintrc.json` 被**明確關閉**）。⚠️ **這是 F8 裁決① 丙的代價**：那條規則自此對全 repo 不被檢查，這個洞在本條完成前一直在。**位置（F8 實跑取得）**：`app/sponsor/page.tsx` 38:13、162:21／`app/team/page.tsx` 28:13、42:17／`components/FeatureRow.tsx` 33:21／`components/FeatureSection.tsx` 46:15／`components/HomeHero.tsx` 24:11／`components/Navbar.tsx` 29:11、79:15／`components/ServerSection.tsx` 90:33。⚠️ **修法是產品外觀變更、⛔ 不是 lint 清潔工作**：換 `next/image` 牽涉尺寸／`fill`／`sizes`／外部網域 `remotePatterns`，且本專案**沒有視覺回歸手段** ⇒ 開包時必須先解決「怎麼驗沒改壞外觀」。⚠️ `components/ServerSection.tsx` 那 1 處落在**長期未 commit 的舊改動檔**上，動它前先看下方警告。**完成判準**：從 `.eslintrc.json` 移除該條 `"off"` 後，`yarn lint --max-warnings 0` **仍為 exit 0**。（F8 產出；Yu 2026-09-09 裁「丙」時明示另開一筆）| ⬜ |

**架構師本次裁決（2026-09-10，白話版拍板；⛔ 未審閱任何全文）**：

主迴圈就「怎麼驗沒改壞外觀」列四案：
- 甲：人工目視前後比對（`yarn dev -p 3100` 開頁截圖，改前改後兩組放進 verification 由架構師親眼看）
- 乙：只做 lint 判準能過的最小改法（`unoptimized` / 原尺寸屬性保外觀，驗收只認 lint 綠 + build 綠 + 開頁不炸）
- 丙：甲 + 乙合併（最小改法降低變動面，再用截圖當證據）
- 丁：先不開 F9

架構師逐字：「**丙，ServerSection 只收 img 那幾行**」。⇒ 兩件已裁：
1. **驗法 = 丙**：最小改法 + 改前／改後外觀證據。
2. **`components/ServerSection.tsx` 的長期未 commit 舊改動⛔ 不進 F9 的 commit**，只收 `<img>` 那幾行的改動。

**關聯條目（同為 backlog，供任務包交代邊界，⛔ 本包不做）**：
- **F6**（債）：`lib/` 是空目錄 ⇒ 第一個放進去的人負責建立慣例，且須把 `'lib'` 加回 `next.config.js` 的 `eslint.dirs`。⚠️ F9 若把共用的圖片元件或常數抽進 `lib/`，就會順帶觸發 F6——⛔ 建議不抽，理由見 §四。
- **F10**（已收案）：`eslint.dirs` 現為 `['app', 'components', 'data', 'middleware.ts']`，F9 動的檔全在範圍內。

---

## 二、主迴圈已實跑的事實（2026-09-10 實查，規劃側無 Bash ⇒ 由此處提供）

> ⚠️ 以下為**執行後的實際輸出**，⛔ 不是推測。規劃側可直接引用，
> 但凡本節沒有的執行結果，一律標「⛔ 未實查，實作側必查」。

### 2-1 現行設定（檔案原文）

`.eslintrc.json` 全文（10 行）：

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

⚠️ 完成判準是「移除該條 `off`」⇒ 第 4–6 行那三行註解也失去意義，要一併處理（拿掉或改寫）。
⚠️ 拿掉 `rules` 後檔案剩 `root` + `extends` 兩鍵；⛔ 不得順手動 `extends`。

`next.config.js` 全文（8 行）——**⛔ 沒有 `images` 區塊**：

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: { dirs: ['app', 'components', 'data', 'middleware.ts'] },
    // 如果有其他配置可以加在這裡
};

module.exports = nextConfig;
```

`package.json` dependencies：`clsx` / `lucide-react` / `next 14.1.0` / `next-auth` / `react` / `react-dom` / `tailwind-merge`。
**⛔ 沒有 `sharp`**（`ls node_modules/sharp` 無輸出）。

### 2-2 lint 實跑（HEAD `df2b8ff`，工作樹另有三個與本任務無關的舊改動，見 §三）

**正向（現行 repo 設定，規則 off）**：
```
$ yarn -s lint --max-warnings 0
✔ No ESLint warnings or errors
exit=0
```

**負向對照（規則 on；⛔ 一個 repo 檔都沒改）**——用 `-c` 指向 `node_modules` 內既存 preset：
```
$ yarn -s lint --max-warnings 0 -c node_modules/eslint-config-next/core-web-vitals.js
./app/sponsor/page.tsx
38:13  Warning: Using `<img>` could result in slower LCP ... @next/next/no-img-element
162:21  Warning: ...
./app/team/page.tsx
28:13  Warning: ...
42:17  Warning: ...
./components/FeatureRow.tsx
33:21  Warning: ...
./components/FeatureSection.tsx
46:15  Warning: ...
./components/HomeHero.tsx
24:11  Warning: ...
./components/Navbar.tsx
29:11  Warning: ...
79:15  Warning: ...
./components/ServerSection.tsx
90:33  Warning: ...
exit=1
$ yarn -s lint -c node_modules/eslint-config-next/core-web-vitals.js 2>&1 | grep -c "no-img-element"
10
```
⇒ 10 處、7 檔，與 backlog 記錄**完全一致**（⚠️ `ServerSection.tsx` 的 90:33 是**工作樹**的行號；HEAD 版是 81 行，見 §三）。
⚠️ 該規則在 `core-web-vitals` preset 裡是 **warning**，⛔ 不是 error ⇒ `--max-warnings 0` 是讓它 fail 的必要條件。
⚠️ 主迴圈先試過把 config 放在 scratchpad 目錄 ⇒ `Failed to load config "next/core-web-vitals" to extend from`（ESLint 相對 config 檔位置解析 `extends`）⇒ **負向對照的 `-c` 必須指向 `node_modules/eslint-config-next/core-web-vitals.js`**，⛔ 不要自己另寫一份。

### 2-3 十處 `<img>` 逐一盤點（src 來源、頁面、尺寸）

| # | 檔:行（工作樹） | `src` | 來源類型 | 在哪個頁面 | 現行 className 關鍵 |
|---|---|---|---|---|---|
| 1 | `app/sponsor/page.tsx:38` | `/images/sponsor.png`（891×914） | 本地 `public/` | `/sponsor` | `w-full h-full object-contain p-12 drop-shadow-[…] group-hover:scale-105`（父層 `aspect-square`） |
| 2 | `app/sponsor/page.tsx:162` | `https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_111x69.jpg` | **外部網域** | `/sponsor` | `w-12 object-contain brightness-0 invert` |
| 3 | `app/team/page.tsx:28` | `/images/team.png`（1920×1080） | 本地 | `/team` | `w-full h-auto block group-hover:scale-105` |
| 4 | `app/team/page.tsx:42` | `{staff.img}` = `/images/quasi.png`（512×512）／`/images/Moon_Flame.png`（476×512）／`/images/liujuhsin.png`（512×512） | 本地（陣列寫死在 `app/team/page.tsx` 第 7–9 行，⚠️ ⛔ 不是 `data/staff.ts`） | `/team` | `w-full h-full object-cover group-hover:scale-110`（父層 `w-32 h-32`） |
| 5 | `components/FeatureRow.tsx:33` | `{img}` prop；`/modServer` 傳入 `/images/server_quasi.png`（989×1076）與 **兩個外部 URL** `https://namelessrealms.com/_next/image?url=…vote.34df0024.png&w=3840&q=75`、`…regular.f5401680.png…` | 本地 + **外部網域（正式站自己的 `_next/image` 端點）** | `/modServer` | `w-full h-full object-contain drop-shadow-[…] group-hover:scale-105`（父層 `max-w-md aspect-square`） |
| 6 | `components/FeatureSection.tsx:46` | `{f.img}` = `/images/server_quasi.png`（989×1076）／`/images/launcher.png`（1024×1024） | 本地（陣列寫死在元件內） | `/` | `w-full h-full object-contain drop-shadow-[…] group-hover:scale-105`（父層 `max-w-lg aspect-square`） |
| 7 | `components/HomeHero.tsx:24` | `/images/logo.png`（1024×1024） | 本地 | `/` | `w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[…]` |
| 8 | `components/Navbar.tsx:29` | `/images/logo.png`（1024×1024） | 本地 | **全站**（`app/layout.tsx` 與各頁都掛 `<Navbar />`） | `w-10 h-10 object-contain` |
| 9 | `components/Navbar.tsx:79` | `{session.user?.image \|\| ""}` | **外部網域（Discord CDN，登入後才有；只有 `ADMIN_DISCORD_ID` 本人登得進）** | 全站，僅登入時 | `w-8 h-8 rounded-full border` |
| 10 | `components/ServerSection.tsx:90`（HEAD 為 :81） | `{s.image}` = `/images/server_01.png`（1920×1031） | 本地 | `/` | 工作樹：`absolute inset-0 h-full w-full object-cover opacity-65`；HEAD：`w-full h-full object-cover group-hover:scale-105 opacity-50 grayscale group-hover:grayscale-0` |

尺寸由 `sips -g pixelWidth -g pixelHeight` 實量；`public/images/` 另有 `regular.png`（706×865）、`vote.png`（894×1080）**未被任何 `<img>` 引用**（`/modServer` 引的是正式站的外部 URL，⛔ 不是這兩個本地檔——這是既有現況，⛔ 本包不順手改）。

⚠️ **#9 的 `src` 可能是空字串**（`|| ""`）：`next/image` 對空 `src` 會**丟例外**（`Image is missing required "src" property`）⇒ 直接換會讓登入狀態炸頁。⛔ 未實查，實作側必查（規劃側請把它列為獨立處理項）。

⚠️ **#10 在工作樹的 `servers` 陣列是空的**（`const servers: any[] = []`，全部註解掉）⇒ 現在開 `/` **根本不會渲染這張圖**；HEAD 版才有一筆。⇒ 這一處的外觀證據在工作樹拿不到，見 §三。

### 2-4 `next/image` 在本專案的三個已知限制（⚠️ 規劃側請自行到 `node_modules/next/dist/` 核檔案層；執行面⛔ 未實查）

1. **外部網域**：`next/image` 對 `http(s)://` 的 `src`，若 `next.config.js` 的 `images.remotePatterns`（或舊制 `domains`）沒列該 hostname，**執行期丟錯**（`Invalid src prop … hostname "…" is not configured under images in your next.config.js`），⛔ 不是 build 期。本包涉及三個外部 hostname：`www.paypalobjects.com`、`namelessrealms.com`、Discord CDN（`cdn.discordapp.com`；⚠️ 實際 hostname 以登入後 session 為準，主迴圈⛔ 未實查）。
   解法二選一：`remotePatterns` 列白名單（走 `/_next/image` 最佳化）或每張 `unoptimized`（維持原 URL 直出，**外觀與現行 `<img>` 完全相同**）。
2. **尺寸**：`next/image` 必須給 `width`+`height`，或 `fill`（父層需 `position: relative`），否則執行期丟錯。現行 10 處全靠 Tailwind class 定尺寸（`w-full h-full` / `w-10 h-10` …）；`width`/`height` 只用於防 CLS 的 aspect 計算，class 仍可覆蓋。⚠️ 給錯 `width`/`height` 比例會在 `h-auto`（#3）那類位置改變版面。
3. **最佳化器**：⛔ 沒裝 `sharp`。Next 14.1.0 production 沒 `sharp` 會 fallback 到內建 squoosh，並在 server log 印警告（`Warning: For production Image Optimization with Next.js, the optional 'sharp' package is strongly recommended`）；Docker runtime 是 `node:20-alpine` standalone。⚠️ 若全站 `images.unoptimized: true` 則完全不走最佳化器，此限制消失。⛔ 這是**技術棧層的取捨**（要不要為此新增 `sharp` 依賴），依 `CLAUDE.md` 技術棧節 ⇒ **要架構師裁**，⛔ 規劃側與實作側不得自加套件。

⚠️ 以上三條主迴圈只憑 Next.js 文件知識；規劃側請以 `node_modules/next/dist/shared/lib/get-img-props.js`（或同版對應檔）核對錯誤訊息與條件，核不到的標「⛔ 未實查，實作側必查」。

### 2-5 環境事實

- 本機 dev 埠 **3100**（`yarn dev -p 3100`），實查 `lsof -iTCP:3100` 目前空閒。⚠️ 3000/3001 被別的專案 Docker 佔用，⛔ 不要用。
- `.env.local` 存在於 repo 根目錄（權限 600、`.gitignore` 擋、git 看不到），內含架構師真實 Discord 憑證 ⇒ ⛔ 不得讀值、⛔ 不得入 log、⛔ 不得貼進任何文件。dev server 會讀它。
- 沒有 `.claude/launch.json`。

---

## 三、工作樹狀態與 `ServerSection.tsx` 的特殊處置（2026-09-10 實查）

```
$ git status --short
 M app/layout.tsx
 M app/staff/page.tsx
 M components/ServerSection.tsx
$ git diff --stat
 app/layout.tsx               |   2 +-
 app/staff/page.tsx           |   6 +-
 components/ServerSection.tsx | 173 ++++++++++++++++++++++---------------------
```

三檔皆為**長期未 commit 的舊改動**，與任何任務無關。`app/layout.tsx` 與 `app/staff/page.tsx` 不在 F9 範圍，⛔ 不碰。

**`components/ServerSection.tsx` 的問題**：未 commit 的 diff 是**整檔重排縮排 + 卡片區改版 + `servers` 陣列清空**（173 行變動），
`<img>` 那一行在 HEAD（第 81 行）與工作樹（第 90 行）**className 不同、所在 hunk 也被整個改寫**。
架構師裁「只收 img 那幾行」⇒ 這代表：

- **commit 裡的 `ServerSection.tsx` = HEAD 版 + 只把第 81 行 `<img>` 換成 `next/image`（含 import）**。
- **工作樹的 `ServerSection.tsx` = 現行未 commit 版 + 把第 90 行 `<img>` 換成 `next/image`（含 import）**——因為 lint 跑的是工作樹，工作樹不改 lint 過不了。
- ⇒ 兩個版本的檔各要改一次，且**⛔ 不能用 `git add -p`**（那個 hunk 是整段重寫，互動式選 hunk 分不出 img 行；且本環境無 TTY）。
  可行做法（主迴圈提示，實作側在 plan 裡自行決定並實證）：`git show HEAD:components/ServerSection.tsx` 取出 HEAD 版 → 套 img 改動 → 用 `git hash-object -w` + `git update-index --cacheinfo` 直接寫進 index；或做成 patch 用 `git apply --cached`。
- ⚠️ **驗「commit 版本 lint 也過」**：工作樹 lint 過⛔ 不等於 index 版本 lint 過。需要對 index 內容另跑一次（例：`git worktree add` 一個乾淨樹、symlink `node_modules`、在那裡跑 `yarn lint --max-warnings 0` 與 `yarn build`），⛔ 不得用 `git stash`（會動到另外兩個舊改動檔，且與 `CLAUDE.md` 守則「還原用備份檔」同精神）。
- ⚠️ **每筆 commit 前先 `git diff --cached --name-status` 與 `git diff --cached components/ServerSection.tsx` 看 staging**，確認只含 img 行與 import，⛔ 不要把 add 與 commit 串同一行（F10 實測：`set -e` 擋不住 commit 漏檔）。
- ⚠️ 外觀證據：工作樹的 `servers` 為空 ⇒ `/` 頁**不會渲染** #10 那張圖，改前／改後截圖都拍不到。這一處只能靠**index 版本**（有一筆 server）另起 dev server 才看得到，或據實標「外觀待人工」——**要規劃側列為裁決點**。

---

## 四、本任務的硬約束（來自 repo `CLAUDE.md`，規劃側可自行複查）

1. **技術棧不得擅自更換**：⛔ 不得新增套件（含 `sharp`）；要加一律列裁決點給架構師。
2. **鐵則 5**：內容資料改 `data/`，不改元件。⚠️ 但 `app/team/page.tsx` 第 7–9 行與 `components/FeatureSection.tsx` 內的陣列是**既有的違例**，⛔ 本包不順手搬（那是另一筆債，可在 verification 建議另開）。
3. **撰碼規約 §B「純函式外置放 `lib/`」與 §C「複製到第二個檔就抽共用」**：10 處 `<img>` 換法高度相似，會有抽共用 `<Img>` 包裝元件的衝動。⚠️ 主迴圈建議**⛔ 不抽**：一抽就觸發 F6（`lib/` 慣例 + 加回 `eslint.dirs`）並擴大 F9 範圍；`next/image` 本身已是那個共用抽象。要抽一律列裁決點。
4. **守則 8**：改過 Route Handler / middleware 才需 curl 正負向——本包不動這兩者。但**改過原始碼 → 必跑 `yarn build`**；且 `next/image` 的執行期錯誤（§2-4）**build 抓不到**，⇒ 驗收必須實際開頁。
5. **守則 8 既有註解全稱比對**：本包會動 `.eslintrc.json` 的三行註解與各元件——收稿前 `git show HEAD:<檔>` 逐行比對，⛔ 不抽查。
6. **⛔ 逐檔 `git add`、⛔ 禁 `git add .`**（工作樹另有兩個無關舊改動檔）。
7. **驗收「CI／lint」欄措辭**：本包完成後 `no-img-element` 重新生效 ⇒ `CLAUDE.md`「CI 現況」節那段「綠，但 `no-img-element` 已 off、10 處未修」的措辭要改——沿 F8/F10 慣例由**主迴圈收案時**套用，實作側在 verification 附建議文字，⛔ 不自己改 `CLAUDE.md`（除非裁決另有指示）。
8. **負向對照紀律**：凡把某指令當閘門，必須有一次「它真的會 fail」的負向對照，且素材要先確認真的走到被測程式（F10 經驗①）。本包的天然負向對照 = §2-2 那條 `-c` 指令在**改前** exit=1、**改後**同指令 exit=0。

---

## 五、外觀驗證協定（裁決丙的落地；主迴圈提案，規劃側可調整後寫進任務包）

> 目標：讓「沒改壞外觀」有**可比對的證據**，⛔ 不是只寫「看起來一樣」。

1. **改前基線先拍**（⚠️ 必須在動任何原始碼之前）：`yarn dev -p 3100`，固定視窗寬度（建議 1280），開 `/`、`/sponsor`、`/team`、`/modServer` 四頁，對每處 `<img>` 捲到可見後截圖存檔。
2. **DOM 度量**（比截圖更可量化）：在每頁用 `document.querySelectorAll('img')` 對每張圖記錄 `currentSrc`、`alt`、`getBoundingClientRect()` 的 `width`/`height`/`top`/`left`、`naturalWidth`/`naturalHeight`、computed `object-fit` / `opacity` / `filter` / `border-radius`，存成 JSON。⚠️ `next/image` 最終也是渲染成 `<img>`，同一段查詢改後照樣可跑 ⇒ 前後 JSON 逐欄 diff，**rect 與 computed style 應一致**，`currentSrc` 若走最佳化會變成 `/_next/image?url=…`（這是預期差異，⛔ 不算壞）。
3. **改後同法再跑一次**，截圖與 JSON 並列進 `F9-verification.md`（或 `F9-evidence.md`）。
4. **拍不到的據實標**：#9（需登入，只有架構師本人登得進）與 #10（工作樹陣列為空）⇒ 標「待人工／待架構師」或依裁決另處理。
5. **架構師人工看圖**（裁決丙的「甲」部分）：verification 裡放前後截圖檔路徑清單，由架構師親眼比對後在 plan-review 裁決記錄回填「外觀已人工核」。
6. 截圖／JSON 存放位置：主迴圈提議 `docs/tasks/F9-evidence/`（收案時是否進 git 由架構師裁，⚠️ PNG 進 repo 會膨脹，列為裁決點）。

---

## 六、規劃側需要設計的裁決點（主迴圈提示，⛔ 規劃側不自選）

至少涵蓋：
1. **外部網域怎麼處理**：`remotePatterns` 白名單 vs 每張 `unoptimized` vs 全站 `images.unoptimized: true`。⚠️ 丙的「最小改法」精神偏向 `unoptimized`（外觀零差異、不需 `sharp`、不需 `remotePatterns`），但那等於只滿足 lint、放棄 `next/image` 的最佳化價值——要把這個取捨講白給架構師。
2. **`sharp` 要不要加**（技術棧層；只有選「走最佳化」時才成為問題）。
3. **`width`/`height` vs `fill` 逐處決定**（可在包裡給建議表，由實作側在 plan 落實）。
4. **#9 空 `src` 的處理**（條件渲染 / fallback 圖 / 保留 `<img>` 加 eslint-disable 註解——⚠️ 最後一種等於留一個洞，要講明）。
5. **#10 的外觀證據怎麼拿**（index 版本另起 dev server / 待人工）。
6. **證據檔進不進 git**。
7. **抽不抽共用元件**（主迴圈建議不抽，理由 §四-3）。

---

## 七、規格的等價物在哪

本 repo ⛔ 沒有 spec 主檔、沒有 `DEV-INDEX.md`。規格等價物：
- `CLAUDE.md` 程式碼地圖（本包涉及的 7 檔都在圖上；⛔ 無結構性變更 ⇒ 地圖不必改，但「CI 現況」節措辭要改，見 §四-7）。
- `CLAUDE.md` 地雷清單第 6 條（工作樹長期未 commit 改動）。
- 前案裁決：`docs/tasks/archive/F8-plan-review.md`「裁決記錄」（裁決① 丙 = 關閉規則、另開 F9）、`docs/tasks/archive/F10-plan-review.md`「裁決記錄」（`eslint.dirs` 現況）。
