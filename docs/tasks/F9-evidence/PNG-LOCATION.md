# F9 截圖（PNG）的存放位置

> ⚠️ 依架構師 2026-09-12 裁決 ⑥乙：**度量 JSON 與文字證據進版控、PNG ⛔ 不進**，
> 並於**收案時由主迴圈搬離 repo 目錄另行保管**。本檔是搬離後的指路牌。

## 搬到哪

```
/Users/quasi-pc/Desktop/Projects/Nameless Realms/_evidence/F9-png/
```

⚠️ 那是**本機路徑、⛔ 不在版控內** ⇒ fresh clone 不會有這些圖。
⚠️ 目錄結構與原本的 `docs/tasks/F9-evidence/` **一致**，故 verification／audit／third-party
三份報告裡寫的相對路徑（例 `before/home.png`）**直接對得上**，只需把前綴換成上面那個目錄。

## 有幾張、怎麼核對

**28 張**，清單與 SHA-256 在 `_evidence/F9-png/SHA256SUMS.txt`（搬移**前**在 repo 內算的）。
搬移後已跑過 `shasum -a 256 -c SHA256SUMS.txt`：**28 全 OK、0 FAILED** ⇒ 搬移過程未損毀。

核對方式（在 `_evidence/F9-png/` 底下跑）：

```
shasum -a 256 -c SHA256SUMS.txt
```

## 各批是什麼

| 目錄 | 張數 | 內容 |
|---|---|---|
| `before/` | 4 | 改前基線（主迴圈拍，HEAD `df2b8ff`、動原始碼之前）。⚠️ **最不可重現的一批** |
| `after/` | 4 | 改後（實作側拍）。⚠️ `sponsor`／`team`／`modServer` 與 `before/` **同 SHA-256** |
| `before-index/` | 4 | 乾淨樹的 HEAD 版基線（`/` 多渲染一張伺服器卡片 ⇒ `docHeight` 3520、⛔ 非 3114） |
| `after-index/` | 4 | 乾淨樹的改後版（＝進 commit 的內容） |
| `after-recheck/` | 4 | 同碼連拍對照（實作側補拍，因原本那張未落檔） |
| `thirdparty/burst1/`、`burst2/` | 各 4 | 第三方獨立連拍兩趟 |

⚠️ **`home.png` 每次雜湊都不同是預期的**：首頁 hero 是 `h-screen` + `<video>`，
截圖高度 3114 ⇒ 影片填滿整張圖 ⇒ 差異邊界框覆蓋全圖。
⇒ `/` 的人工看圖請看**版面**，⛔ 不要看雜湊。其餘三頁同碼連拍**逐位元組相同**（兩個獨立來源各自證出）。
