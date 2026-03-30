#!/usr/bin/env zsh
# Daily OF API Revenue Pull — updates Supabase daily_model_stats
# Run via cron or pm2: every 6 hours
# Usage: bash scripts/update-revenue.sh

API_KEY="ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
SUPABASE_URL="https://teekywdpkhquacjmvlnw.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZWt5d2Rwa2hxdWFjam12bG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTQyODIsImV4cCI6MjA4OTA3MDI4Mn0.Sqa7Zs33KOPbC4uUcwVaPa9aZneCX0ghrDTwtcC1kWM"
TODAY=$(date +%Y-%m-%d)

echo "[$(date)] Starting OF API revenue update for $TODAY"

# Account IDs
declare -A ACCOUNTS
ACCOUNTS[Izzie]="acct_6140bb9805e9416a928d4d7a788f3939"
ACCOUNTS[Willow]="acct_f968a6be8f2041dcb9d52f8113f2d258"
ACCOUNTS[Ashley]="acct_71750a6057e34776b9b6ca0903b5ee1a"

for NAME in Ashley Izzie Willow; do
  ID="${ACCOUNTS[$NAME]}"
  
  # Pull earning stats
  EARNINGS=$(curl -s "https://app.onlyfansapi.com/api/$ID/payouts/earning-statistics" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Accept: application/json")
  
  # Parse into today's revenue
  PARSED=$(python3 -c "
import json, time, sys
from datetime import datetime

data = json.loads(sys.stdin.read())
months = data.get('data', {}).get('list', {}).get('months', {})

today_start = datetime.strptime('$TODAY', '%Y-%m-%d').timestamp()
today_end = today_start + 86400

today_net = 0
today_gross = 0
today_msg = 0
today_tip = 0
today_sub = 0

for month_data in months.values():
    for category in ['tips', 'chat_messages', 'subscribes', 'posts', 'streams']:
        for entry in month_data.get(category, []):
            t = entry.get('time', 0)
            if today_start <= t < today_end:
                today_net += entry.get('net', 0)
                today_gross += entry.get('gross', 0)
                if category == 'chat_messages':
                    today_msg += entry.get('net', 0)
                elif category == 'tips':
                    today_tip += entry.get('net', 0)
                elif category == 'subscribes':
                    today_sub += entry.get('net', 0)

print(json.dumps({
    'total_revenue': round(today_net, 2),
    'message_revenue': round(today_msg, 2),
    'tip_revenue': round(today_tip, 2),
    'subscription_revenue': round(today_sub, 2)
}))
" <<< "$EARNINGS" 2>/dev/null)
  
  if [ -z "$PARSED" ]; then
    echo "  $NAME: ERROR parsing earnings"
    continue
  fi
  
  # Upsert to Supabase
  TOTAL=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin)['total_revenue'])")
  MSG=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin)['message_revenue'])")
  TIP=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin)['tip_revenue'])")
  SUB=$(echo "$PARSED" | python3 -c "import json,sys; print(json.load(sys.stdin)['subscription_revenue'])")
  
  # Try PATCH first (update existing)
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
    "$SUPABASE_URL/rest/v1/daily_model_stats?model_name=eq.$NAME&date=eq.$TODAY" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"total_revenue\":$TOTAL,\"subscription_revenue\":$SUB,\"message_revenue\":$MSG,\"tip_revenue\":$TIP}")
  
  if [ "$HTTP_CODE" = "204" ]; then
    echo "  $NAME: Updated (net \$$TOTAL, msg \$$MSG, tip \$$TIP)"
  else
    # Try INSERT if no existing row
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
      "$SUPABASE_URL/rest/v1/daily_model_stats" \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d "{\"model_name\":\"$NAME\",\"date\":\"$TODAY\",\"total_revenue\":$TOTAL,\"subscription_revenue\":$SUB,\"message_revenue\":$MSG,\"tip_revenue\":$TIP}")
    echo "  $NAME: Inserted ($HTTP_CODE) (net \$$TOTAL)"
  fi
done

echo "[$(date)] Revenue update complete"
