#!/usr/bin/env bash
# OF API Revenue + Subs Pull — updates Supabase + writes JSON for dashboard
# Runs every 3 hours via pm2
# Uses GROSS figures (what Luke sees on OF dashboard)

API_KEY="ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
SUPABASE_URL="https://teekywdpkhquacjmvlnw.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZWt5d2Rwa2hxdWFjam12bG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTQyODIsImV4cCI6MjA4OTA3MDI4Mn0.Sqa7Zs33KOPbC4uUcwVaPa9aZneCX0ghrDTwtcC1kWM"
TODAY=$(date -u +%Y-%m-%d)
OUTPUT_DIR="$(dirname "$0")/../public"
OUTPUT_FILE="$OUTPUT_DIR/revenue-data.json"

mkdir -p "$OUTPUT_DIR"

echo "[$(date)] Starting OF API revenue update for $TODAY"

ACCOUNTS="acct_71750a6057e34776b9b6ca0903b5ee1a:Ashley
acct_6140bb9805e9416a928d4d7a788f3939:Izzie
acct_f968a6be8f2041dcb9d52f8113f2d258:Willow"

JSON_MODELS=""

echo "$ACCOUNTS" | while IFS=: read -r ID NAME; do
  [ -z "$ID" ] && continue
  
  # Get total subscriber count
  SUBS=$(curl -s "https://app.onlyfansapi.com/api/$ID/me" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Accept: application/json" | python3 -c "import json,sys; print(json.load(sys.stdin).get('data',{}).get('subscribesCount',0))" 2>/dev/null)
  
  # Get today's GROSS revenue
  EARNINGS=$(curl -s "https://app.onlyfansapi.com/api/$ID/payouts/earning-statistics" \
    -H "Authorization: Bearer $API_KEY" \
    -H "Accept: application/json")
  
  REV=$(python3 -c "
import json, sys
from datetime import datetime, timezone
data = json.loads('''$(echo "$EARNINGS" | sed "s/'/\\\\'/g")''')
today = '$TODAY'
today_ts = datetime.strptime(today, '%Y-%m-%d').timestamp()
tomorrow_ts = today_ts + 86400
total = 0
months = data.get('data', {}).get('list', {}).get('months', {})
for md in months.values():
    for cat in ['tips', 'chat_messages', 'subscribes', 'posts', 'streams']:
        for e in md.get(cat, []):
            if today_ts <= e.get('time', 0) < tomorrow_ts:
                total += e.get('gross', 0)
print(f'{total:.2f}')
" 2>/dev/null)
  
  [ -z "$REV" ] && REV="0"
  [ -z "$SUBS" ] && SUBS="0"
  
  # Update Supabase with revenue
  curl -s -o /dev/null -X PATCH \
    "$SUPABASE_URL/rest/v1/daily_model_stats?model_name=eq.$NAME&date=eq.$TODAY" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "{\"total_revenue\":$REV,\"subscription_revenue\":$SUBS}" 2>/dev/null
  
  echo "  $NAME: gross=\$$REV, total_subs=$SUBS"
done

# Now build the JSON file from Supabase (includes yesterday for LTV delta)
YESTERDAY=$(date -u -v-1d +%Y-%m-%d 2>/dev/null || date -u -d "yesterday" +%Y-%m-%d 2>/dev/null)

python3 -c "
import json, sys, urllib.request

url = '$SUPABASE_URL/rest/v1/daily_model_stats?date=in.($TODAY,$YESTERDAY)&model_name=in.(Ashley,Izzie,Willow)&order=date.desc'
req = urllib.request.Request(url)
req.add_header('apikey', '$SUPABASE_KEY')
req.add_header('Authorization', 'Bearer $SUPABASE_KEY')

with urllib.request.urlopen(req) as resp:
    rows = json.loads(resp.read())

result = {'updated_at': '$(date -u +%Y-%m-%dT%H:%M:%SZ)', 'date': '$TODAY', 'models': {}}

for name in ['Ashley', 'Izzie', 'Willow']:
    today_row = next((r for r in rows if r['model_name'] == name and r['date'] == '$TODAY'), None)
    yesterday_row = next((r for r in rows if r['model_name'] == name and r['date'] == '$YESTERDAY'), None)
    
    today_rev = today_row['total_revenue'] if today_row else 0
    today_subs = int(today_row['subscription_revenue']) if today_row else 0  # using sub_rev field for subs count
    yesterday_subs = int(yesterday_row['subscription_revenue']) if yesterday_row else 0
    
    new_subs = max(today_subs - yesterday_subs, 0) if yesterday_subs > 0 else 0
    ltv = round(today_rev / new_subs, 2) if new_subs > 0 else 0
    
    result['models'][name] = {
        'today_gross': today_rev,
        'total_subs': today_subs,
        'new_subs_today': new_subs,
        'ltv_today': ltv
    }

with open('$OUTPUT_FILE', 'w') as f:
    json.dump(result, f, indent=2)

print(f'  JSON written to $OUTPUT_FILE')
for n, d in result['models'].items():
    print(f'  {n}: \${d[\"today_gross\"]} gross, {d[\"total_subs\"]} total subs, {d[\"new_subs_today\"]} new today, \${d[\"ltv_today\"]} LTV')
" 2>/dev/null

echo "[$(date)] Revenue update complete"
