#!/usr/bin/env bash
# Daily OF API Revenue Pull — updates Supabase daily_model_stats
# Run via pm2 cron or launchd: every 3 hours
# Uses GROSS figures (what Luke sees on OF dashboard)

API_KEY="ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
SUPABASE_URL="https://teekywdpkhquacjmvlnw.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZWt5d2Rwa2hxdWFjam12bG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTQyODIsImV4cCI6MjA4OTA3MDI4Mn0.Sqa7Zs33KOPbC4uUcwVaPa9aZneCX0ghrDTwtcC1kWM"
TODAY=$(date -u +%Y-%m-%d)

echo "[$(date)] Starting OF API revenue update for $TODAY"

# Account IDs — one per line to avoid associative array issues
ACCOUNTS="acct_71750a6057e34776b9b6ca0903b5ee1a:Ashley
acct_6140bb9805e9416a928d4d7a788f3939:Izzie
acct_f968a6be8f2041dcb9d52f8113f2d258:Willow"

echo "$ACCOUNTS" | while IFS=: read -r ID NAME; do
  [ -z "$ID" ] && continue
  
  # Pull earning stats
  EARNINGS=$(curl -s "https://app.onlyfansapi.com/api/$ID/payouts/earning-statistics" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Accept: application/json")
  
  # Pull subscriber count
  SUBS=$(curl -s "https://app.onlyfansapi.com/api/$ID/me" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Accept: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin).get('data',{}).get('subscribesCount',0))" 2>/dev/null)
  
  # Parse today's GROSS revenue
  PARSED=$(python3 -c "
import json, sys
from datetime import datetime, timezone

data = json.loads('''$EARNINGS''')
today = '$TODAY'
today_ts = datetime.strptime(today, '%Y-%m-%d').timestamp()
tomorrow_ts = today_ts + 86400

total_gross = 0
msg_gross = 0
tip_gross = 0
sub_gross = 0

months = data.get('data', {}).get('list', {}).get('months', {})
for month_data in months.values():
    for category in ['tips', 'chat_messages', 'subscribes', 'posts', 'streams']:
        for entry in month_data.get(category, []):
            t = entry.get('time', 0)
            if today_ts <= t < tomorrow_ts:
                g = entry.get('gross', 0)
                total_gross += g
                if category == 'chat_messages': msg_gross += g
                elif category == 'tips': tip_gross += g
                elif category == 'subscribes': sub_gross += g

print(f'{total_gross:.2f}|{msg_gross:.2f}|{tip_gross:.2f}|{sub_gross:.2f}')
" 2>/dev/null)
  
  if [ -z "$PARSED" ]; then
    echo "  $NAME: ERROR parsing earnings"
    continue
  fi
  
  TOTAL=$(echo "$PARSED" | cut -d'|' -f1)
  MSG=$(echo "$PARSED" | cut -d'|' -f2)
  TIP=$(echo "$PARSED" | cut -d'|' -f3)
  SUB=$(echo "$PARSED" | cut -d'|' -f4)
  
  # Upsert to Supabase — try PATCH first
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH \
    "$SUPABASE_URL/rest/v1/daily_model_stats?model_name=eq.$NAME&date=eq.$TODAY" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"total_revenue\":$TOTAL,\"subscription_revenue\":$SUB,\"message_revenue\":$MSG,\"tip_revenue\":$TIP}")
  
  if [ "$HTTP_CODE" = "204" ]; then
    echo "  $NAME: Updated (gross \$$TOTAL, subs: $SUBS)"
  else
    # INSERT if no existing row
    curl -s -o /dev/null -w "" -X POST \
      "$SUPABASE_URL/rest/v1/daily_model_stats" \
      -H "apikey: $SUPABASE_KEY" \
      -H "Authorization: Bearer $SUPABASE_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      -d "{\"model_name\":\"$NAME\",\"date\":\"$TODAY\",\"total_revenue\":$TOTAL,\"subscription_revenue\":$SUB,\"message_revenue\":$MSG,\"tip_revenue\":$TIP}"
    echo "  $NAME: Inserted (gross \$$TOTAL, subs: $SUBS)"
  fi
done

echo "[$(date)] Revenue update complete"
