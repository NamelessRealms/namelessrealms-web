# F9 外觀證據（裁決丙：最小改法 + 改前／改後外觀證據）

> 主迴圈 2026-09-10 於 HEAD `df2b8ff`、**動任何原始碼之前**取得 `before/`。
> 實作側改後用**同一套**腳本產 `after/`，⛔ 不得另寫一套方法（否則前後不可比）。
> ⚠️ 本目錄含 PNG（約 3.2 MB）；**收案時進不進 git 由架構師裁**。

## 取得方法（改前／改後相同）
1. `yarn dev -p 3100`（`.env.local` 會被讀入；⛔ 不得把其內容貼進任何檔）。
2. **DOM 度量**：對 `/`、`/sponsor`、`/team`、`/modServer` 四頁各執行一次 `metrics.js`
   （瀏覽器 console 或自動化工具皆可；視窗 1280×900），回傳 JSON 存成 `<階段>/<頁>.json`。
   欄位：每張 `<img>` 的 `src` / `currentSrc` / `alt` / `naturalWidth|Height` / 版面 `rect`（含捲動偏移）/
   computed `object-fit` / `opacity` / `filter` / `border-radius` / `padding` / `loading` / `decoding` / `className`。
3. **整頁截圖**：`./capture.sh <before|after>`（headless Chrome，固定寬 1280，高度 = 各頁 docHeight）。
   ⚠️ 若改後 docHeight 變了，那本身就是版面改變的訊號——先查原因，⛔ 不要只改腳本高度。

## 改前基線（before/）內容
| 檔 | 頁 | `<img>` 數 | 說明 |
|---|---|---|---|
| `home.json/.png` | `/` | 5 | Navbar logo ×2（見下方附帶發現）、HomeHero logo、FeatureSection ×2。⚠️ **ServerSection 那張（F9 #10）沒有出現**：工作樹 `servers` 陣列為空。 |
| `sponsor.json/.png` | `/sponsor` | 4 | Navbar ×2、sponsor.png、PayPal 外部 jpg（`filter: brightness(0) invert(1)`）。 |
| `team.json/.png` | `/team` | 6 | Navbar ×2、team.png（`object-fit: fill`、`h-auto` ⇒ rect 1022×574.88）、3 張頭像 126×126。 |
| `modServer.json/.png` | `/modServer` | 5 | Navbar ×2、server_quasi.png、兩張 **外部** `namelessrealms.com/_next/image?…`（natural 894×1080、706×865）。 |

F9 的 #9（Navbar 登入頭像）需管理員登入，⛔ 基線拍不到；#10 見上。

## 比對判準（給實作側與稽核側）
- `rect`（x/y/w/h）、`object-fit`、`opacity`、`filter`、`border-radius`、`padding`、`alt`、`naturalWidth|Height` **應逐欄相同**。
- `currentSrc` 若從 `/images/x.png` 變成 `/_next/image?url=…` 是**預期差異**（走最佳化）；若採 `unoptimized` 則應完全相同。
- `loading` / `decoding` 可能由 `auto` 變 `lazy` / `async`（`next/image` 預設）——要在 verification 講明，並確認首屏圖（logo / hero）沒被延遲載入造成閃爍。
- `className`：`next/image` 會原樣透傳 `className`，應相同。
- PNG 由架構師人工比對（裁決丙的「甲」部分）。

## 附帶發現（⛔ 不在 F9 範圍，僅記錄）
- 每頁 DOM 有**兩個 Navbar logo**，rect 完全相同（`89,37,40×40`）：`app/layout.tsx` 掛了 `<Navbar />`，各頁 `page.tsx` 又各掛一次 ⇒ 兩個 Navbar 疊在同一位置。建議另開 backlog。
  ⚠️ **更正（2026-09-11，實作側查出、主迴圈複查確認）**：本檔初版寫「此現象可能與 `app/layout.tsx` 的未 commit 舊改動有關」是**錯的**。
  `git show HEAD:app/layout.tsx` 第 24 行**在 HEAD 就有** `<Navbar />`；該檔的未 commit 改動只有一行
  （`metadata.description` 由 `"Minecraft Modded Community"` 改成 `"Minecraft Mod Community"`）⇒ **雙 Navbar 是既有問題，與那個舊改動無關。**
