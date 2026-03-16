#!/usr/bin/env zsh
# Daily Stats Cron — pulls OF API earnings per model, updates Supabase
# Runs hourly during active hours via crontab

API_BASE="https://app.onlyfansapi.com/api"
API_KEY="ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
SUPABASE_URL="https://teekywdpkhquacjmvlnw.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZWt5d2Rwa2hxdWFjam12bG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTQyODIsImV4cCI6MjA4OTA3MDI4Mn0.Sqa7Zs33KOPbC4uUcwVaPa9aZneCX0ghrDTwtcC1kWM"

TODAY=$(date -u +%Y-%m-%d)

MODELS=("Ashley" "Izzie" "Willow" "Lucinda")
ACCT_IDS=(
  "acct_71750a6057e34776b9b6ca0903b5ee1a"
  "acct_6140bb9805e9416a928d4d7a788f3939"
  "acct_f968a6be8f2041dcb9d52f8113f2d258"
  "acct_62e65e4c2c0740b386cde14811762f4d"
)

echo "[$(date)] Daily stats cron starting for $TODAY"

for i in {1..4}; do
  MODEL="${MODELS[$i]}"
  ACCT_ID="${ACCT_IDS[$i]}"
  
  RESP=$(curl -sf -H "Authorization: Bearer $API_KEY" -H "Content-Type: application/json" \
    "$API_BASE/$ACCT_ID/payouts/earning-statistics" 2>/dev/null || echo '{}')
  
  TOTAL=$(echo "$RESP" | jq -r '.total // 0' 2>/dev/null || echo "0")
  SUBS=$(echo "$RESP" | jq -r '.subscriptions // 0' 2>/dev/null || echo "0")
  MESSAGES=$(echo "$RESP" | jq -r '.messages // 0' 2>/dev/null || echo "0")
  TIPS=$(echo "$RESP" | jq -r '.tips // 0' 2>/dev/null || echo "0")
  
  echo "  $MODEL: total=$TOTAL subs=$SUBS messages=$MESSAGES tips=$TIPS"
  
  # Upsert into daily_model_stats
  curl -sf -X POST "$SUPABASE_URL/rest/v1/daily_model_stats" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: resolution=merge-duplicates" \
    -d "{
      \"date\": \"$TODAY\",
      \"model_name\": \"$MODEL\",
      \"total_revenue\": $TOTAL,
      \"subscription_revenue\": $SUBS,
      \"message_revenue\": $MESSAGES,
      \"tip_revenue\": $TIPS
    }" 2>/dev/null && echo "  ✅ $MODEL upserted" || echo "  ⚠️ $MODEL upsert failed"
done

echo "[$(date)] Daily stats cron complete"
