#!/bin/zsh
# F9 外觀截圖腳本（改前／改後共用，⛔ 不得為改後另寫一份）。用法：capture.sh <before|after>
# 前提：yarn dev -p 3100 已在跑。用 headless Chrome 以固定寬 1280 拍整頁（高度依各頁 docHeight，量自 metrics.js）。
# ⚠️ headless Chrome 寫完 png 後有時不會自行退出（2026-09-10 實測卡住 >3 分鐘）⇒ 改為背景執行、輪詢檔案出現後強制結束。
set -u
DIR="$(cd "$(dirname "$0")" && pwd)/$1"; mkdir -p "$DIR"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
typeset -A H; H=( home 3114 sponsor 2524 team 1870 modServer 3842 )
typeset -A P; P=( home "/" sponsor "/sponsor" team "/team" modServer "/modServer" )
for k in home sponsor team modServer; do
  PROFILE="$(mktemp -d)"; OUT="$DIR/$k.png"; rm -f "$OUT"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$PROFILE" \
    --window-size=1280,${H[$k]} --virtual-time-budget=8000 \
    --screenshot="$OUT" "http://localhost:3100${P[$k]}" >/dev/null 2>&1 &
  PID=$!
  for i in {1..40}; do [[ -s "$OUT" ]] && break; sleep 1; done
  sleep 1; kill $PID 2>/dev/null; wait $PID 2>/dev/null
  [[ -s "$OUT" ]] && echo "$k ok $(stat -f %z "$OUT") bytes" || echo "$k FAILED"
  rm -rf "$PROFILE"
done
ls -la "$DIR"
