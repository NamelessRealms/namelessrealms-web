# Nameless Realms 服務目錄(組織層單一來源)

> 📦 **這份檔由 `upgrade.sh` 同步為各 repo 的副本 `.claude/shared/service-catalog.md`,再由各 repo `CLAUDE.md` 以相對路徑 `@.claude/shared/service-catalog.md` 引用**(⚠️ `@` 只吃 repo 內相對路徑;web NR-D17 2026-09-13 實測);七 repo 讀到的是**同一份文字**;⛔ 不得手改副本。
> 用途:讓每個專案的 AI **動手前就知道**「這件事全組織裡誰負責、已經有沒有、該去找誰」,⛔ 不重複造(Yu 2026-09-12:「Meridian 想做 API 可能自己建一支,可是我們有 api 專案在做 API 的事」)。
> 粒度:**只寫負責範圍,⛔ 不列端點、⛔ 不列 schema**(Yu 裁「甲」);細節在各專案自己的規格檔,由主迴圈依 §一規則去問該專案。
> 維護者:組織層總管(依 INTEGRATION-MAP 與 Yu 裁決改);⛔ 各專案不得直接改本檔 —— 責任變動走 NR 流程。
> ⚠️ 本檔⛔ 不寫「詳見 vault 某檔」(子代理讀不到 vault);要指路只指**專案名**與 **repo 內**的檔。
> 狀態:**v0.1(2026-09-12)**;§二 責任表 **Yu 2026-09-12 逐字「批」**(在白話版上批,十條逐條列出後批)⇒ 硬規矩。⏳ 尚未接進任何 repo(等引用模式那一步)。

---

## 一、規則:先查目錄,再決定造不造

1. **要新建「跨專案性質」的能力前,先查本檔 §二**。跨專案性質的例子:對外 HTTP API、帳號 / 登入 / token、白名單、玩家資料、資料庫、監控 / 告警、Discord 互動、遊戲 / 模組元資料、檔案下載 / 校驗。
2. **§二 寫明歸屬別家的 ⇒ ⛔ 不自建**。由**主迴圈**依 ORG-WORKFLOW §九 直傳協定去問該專案(對象是專案,不是 repo;Nymless 群以 cwd=Nymless 的 session 代表三 repo);談成的介面 / 契約變更以 `NR-N{n}` 知會組織層總管更新 INTEGRATION-MAP。
   - 你只是**用**別家已有的東西 ⇒ 不用問,自己讀對方 repo 的規格檔即可(讀碼自己讀、對方才知道的事才發問詢)。
   - 你需要對方**新增或改**東西 ⇒ 直傳;對方若有要 Yu 裁的題,送回你這邊、由你在自己的 session 問 Yu。
3. **§二 沒寫、或落在 §四 灰色地帶 ⇒ 問 Yu**,⛔ 不自行判定歸屬、⛔ 不先做再說。Yu 裁了之後總管回填本檔。
4. 對方專案**沒有 session**(目前:daedalus 未納管)⇒ 需求直接問 Yu。

---

## 二、責任表(✅ Yu 2026-09-12 批;硬規矩)

| 能力 | 歸誰 | 其他專案的義務 |
|---|---|---|
| **對外 HTTP API、平台後端** | `namelessrealms-api` | ⛔ 不自建對外 HTTP 服務;需要新端點 ⇒ 直傳 api(Nymless 群 session) |
| **帳號、登入、token、撤銷** | `namelessrealms-api` | ⛔ 不自建帳號系統;身分一律經 api |
| **白名單申請資料、玩家資料、MySQL** | `namelessrealms-api` | ⛔ 不自建資料庫存這些;bot / web 只做入口與呈現,資料經 api |
| **MC 遊戲版本 / 模組載入器元資料(靜態 JSON、S3)** | `namelessrealms-daedalus`(未納管、無 session) | 需要新元資料 ⇒ 問 Yu |
| **啟動器桌面端 UI(Tauri + React)** | `Nymless` | — |
| **啟動引擎:下載 / 校驗 / manifest 同步 / 啟動 JVM** | `allay_core` | Nymless 只呼叫,⛔ 不在前端重寫下載或校驗邏輯 |
| **分散式 MC 伺服器本體(shard / 轉移 / 邊界鏡像 / Velocity)** | `Meridian` | — |
| **機房基建:監控、控制、自動修復、告警、核准流程** | `Aegis` | ⛔ 不自建監控 / 告警管道;要被監控或要發告警 ⇒ 找 Aegis |
| **官方網站、對外內容頁** | `namelessrealms-web` | web ⛔ 不自建資料層;需要資料 ⇒ 經 api(規劃線) |
| **Discord 社群互動:斜線指令、白名單申請入口、伺服器狀態播報** | `namelessrealms-discord-bot` | bot ⛔ 不自建資料庫;資料經 api |

---

## 三、各專案負責範圍(現況;「規劃中」= 尚未實作,⛔ 不可當作已能用)

### namelessrealms-api — 平台後端(Node.js + Express 5 + MySQL)
- 提供:對外 HTTP API、帳號 / 登入 / token、玩家資料、白名單申請資料、NR 錯誤代碼制。
- 現役使用者:Nymless(HTTP)、discord-bot(白名單申請 / 玩家查詢)。規劃中:web。
- 不做:桌面端、遊戲伺服器、機房。
- 規格在 repo 內 `docs/` 與 Nymless 群共用契約(契約 A / B / C / D、§6 錯誤模型);找誰:Nymless 群 session。

### Nymless — 啟動器桌面前端(Tauri 2 + React 19)
- 提供:啟動器 UI、與 api 的登入 / 同步流程。
- 依賴:allay_core(Cargo)、api(HTTP)、CurseForge / Modrinth / S3 雙池、daedalus 元資料。
- 不做:自己的後端、自己的下載引擎。

### allay_core — Rust 啟動引擎
- 提供:模組 / 資源下載與校驗(sha 親算)、manifest 與同步引擎(契約 E)、JVM 啟動。
- 使用者:Nymless(Cargo 依賴;allay_core 改了 Nymless 必須重建確認)。
- 不做:UI、帳號。

### namelessrealms-daedalus — 遊戲 / 模組載入器元資料服務(未納管)
- 提供:靜態元資料檔(S3),供啟動器查詢。已上線被引用。
- 無 session、無 vault ⇒ 需求問 Yu。

### Meridian — 分散式 Minecraft 伺服器(Java / Velocity + NeoForge)
- 提供:多 shard 無縫轉移、邊界鏡像、跨界互動的伺服器本體。
- 規劃中:部署後納入 Aegis 監控 / 修復;帳號 / 白名單是否通 api **未定**(見 §四)。
- 不做:對外 HTTP API(要 ⇒ 找 api)、機房監控(要 ⇒ 找 Aegis)。

### Aegis — 機房管理平台(Rust + Node + React)
- 提供:Proxmox / MC / Omada / UPS / TrueNAS 的監控、控制、AI 半自動修復、告警、Discord 核准雙軌、全程審計。
- 規劃中:納管 Meridian 伺服器。
- 不做:玩家 / 帳號資料、社群互動。

### namelessrealms-web — 官方網站(Next.js 14)
- 提供:對外內容頁、兩支 Route Handler、Discord 登入(next-auth)。
- 規劃中:呼叫 api(endpoint / auth / 錯誤模型屆時對齊 api 契約)。
- 不做:自己的資料庫。

### namelessrealms-discord-bot — 社群機器人(discord.js 14)
- 提供:斜線指令、白名單申請與驗證入口、伺服器狀態播報、socket.io 遊戲端事件。
- 依賴:api(白名單 / 玩家查詢;`x-api-key` 契約 09-10 直傳對齊中,bot 側 F21 待補)。
- 不做:自己的資料庫、機房告警。

---

## 四、灰色地帶(⏳ 待 Yu 裁;裁前遇到 ⇒ 問 Yu)

| 題 | 為什麼模糊 |
|---|---|
| Meridian 的玩家帳號 / 白名單要不要通 api? | INTEGRATION-MAP 🔍 待盤點,Yu 2026-08-20 未定 |
| 「伺服器狀態播報」(bot)與「告警」(Aegis)的邊界 | 兩者都會往 Discord 送伺服器狀態;哪種訊息歸誰、是否同一個 Discord 應用,未盤 |
| Aegis 的 Discord 核准管道與 bot 是否共用 bot 帳號 | 未盤 |
| web 的 Discord 登入(next-auth)與 api 的帳號系統關係 | web 規劃線尚未實作;屆時身分是 web 自持還是經 api,未定 |

---

## 五、維護
- 責任表變動、灰色地帶裁決 ⇒ Yu 裁 → 總管改本檔 + INTEGRATION-MAP,同一輪。
- 契約細節⛔ 不進本檔;進 INTEGRATION-MAP(組織層)與該專案的規格檔。
- 本檔改版 ⇒ 模板 `VERSION` 一起 bump,`upgrade.sh` C 層以「引用行 + 目標 md5」比對(引用模式)。
