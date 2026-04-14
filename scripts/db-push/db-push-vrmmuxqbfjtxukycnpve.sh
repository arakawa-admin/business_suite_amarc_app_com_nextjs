#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="vrmmuxqbfjtxukycnpve"
DRYRUN=0
if [[ "${1:-}" == "--dry-run" ]]; then DRYRUN=1; fi

# ==========================================================
# 必ず明示的に direct DB URL を環境変数で指定する（最重要）
# → ここを Supabase ダッシュボードの direct URL に書き換えてください
# ==========================================================
export SUPABASE_DB_URL="postgresql://postgres.vrmmuxqbfjtxukycnpve:hS200xNJ8tZt8orp@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

echo "🔌 Using DIRECT DB:"
echo "    $SUPABASE_DB_URL"

echo "🧪 Testing connection..."
if ! psql "$SUPABASE_DB_URL" -c "SELECT version();" >/dev/null 2>&1; then
  echo "❌ DB connection failed. Check password or direct URL."
  exit 1
fi
echo "✅ Connection OK"

echo "🧪 Running dry-run..."
supabase db push --db-url "$SUPABASE_DB_URL" --dry-run || {
  echo "❌ Dry-run failed."
  exit 1
}

if [[ $DRYRUN -eq 1 ]]; then
  echo "✅ Dry-run only"
  exit 0
fi

echo ""
read -r -p "⚠️ Apply to '${PROJECT_REF}'? Type project-ref to confirm: " ans
if [[ "$ans" != "$PROJECT_REF" ]]; then
  echo "🛑 Canceled"
  exit 1
fi

read -r -p "Final confirm: type 'apply': " go
if [[ "$go" != "apply" ]]; then
  echo "🛑 Canceled"
  exit 1
fi

echo "🚀 Applying..."
supabase db push --db-url "$SUPABASE_DB_URL"

echo "🎉 DONE"
