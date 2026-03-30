#!/usr/bin/env bash
# OF API Revenue + Subs Pull — updates Supabase + writes JSON for dashboard
# Runs every 3 hours via pm2

API_KEY="ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
SUPABASE_URL="https://teekywdpkhquacjmvlnw.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZWt5d2Rwa2hxdWFjam12bG53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTQyODIsImV4cCI6MjA4OTA3MDI4Mn0.Sqa7Zs33KOPbC4uUcwVaPa9aZneCX0ghrDTwtcC1kWM"
TODAY=$(date -u +%Y-%m-%d)
OUTPUT_FILE="$(dirname "$0")/../public/revenue-data.json"

echo "[$(date)] Revenue update for $TODAY"

ACCOUNTS="acct_71750a6057e34776b9b6ca0903b5ee1a:Ashley
acct_6140bb9805e9416a928d4d7a788f3939:Izzie
acct_f968a6be8f2041dcb9d52f8113f2d258:Willow"

echo "$ACCOUNTS" | while IFS=: read -r ID NAME; do
  [ -z "$ID" ] && continue
  SUBS=$(curl -s "https://app.onlyfansapi.com/api/$ID/me" \
    -H "Authorization: Bearer $API_KEY" | python3 -c "import json,sys; print(json.load(sys.stdin).get('data',{}).get('subscribesCount',0))" 2>/dev/null)
  
  EARNINGS=$(curl -s "https://app.onlyfansapi.com/api/$ID/payouts/earning-statistics" \
    -H "Authorization: Bearer $API_KEY")
  
  REV=$(python3 -c "
import json, sys
from datetime import datetime
data = json.loads(sys.stdin.read())
today_ts = datetime.strptime('$TODAY', '%Y-%m-%d').timestamp()
total = 0
for md in data.get('data',{}).get('list',{}).get('months',{}).values():
    for cat in ['tips','chat_messages','subscribes','posts','streams']:
        for e in md.get(cat,[]):
            if today_ts <= e.get('time',0) < today_ts+86400:
                total += e.get('gross',0)
print(f'{total:.2f}')
" <<< "$EARNINGS" 2>/dev/null)
  
  [ -z "$REV" ] && REV="0"
  [ -z "$SUBS" ] && SUBS="0"
  
  curl -s -o /dev/null -X PATCH \
    "$SUPABASE_URL/rest/v1/daily_model_stats?model_name=eq.$NAME&date=eq.$TODAY" \
    -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY" \
    -H "Content-Type: application/json" -H "Prefer: return=minimal" \
    -d "{\"total_revenue\":$REV,\"subscription_revenue\":$SUBS}"
  
  echo "  $NAME: \$$REV gross, $SUBS subs"
done

# Build weekly JSON from Supabase
# Week starts Monday — find this Monday's date
MONDAY=$(python3 -c "
from datetime import datetime, timedelta
today = datetime.strptime('$TODAY', '%Y-%m-%d')
monday = today - timedelta(days=today.weekday())
print(monday.strftime('%Y-%m-%d'))
")
SUNDAY_BEFORE=$(python3 -c "
from datetime import datetime, timedelta
today = datetime.strptime('$TODAY', '%Y-%m-%d')
monday = today - timedelta(days=today.weekday())
sunday = monday - timedelta(days=1)
print(sunday.strftime('%Y-%m-%d'))
")

python3 -c "
import json, urllib.request

url = '$SUPABASE_URL/rest/v1/daily_model_stats?date=gte.$SUNDAY_BEFORE&model_name=in.(Ashley,Izzie,Willow)&order=date.asc'
req = urllib.request.Request(url)
req.add_header('apikey', '$SUPABASE_KEY')
req.add_header('Authorization', 'Bearer $SUPABASE_KEY')

with urllib.request.urlopen(req) as resp:
    rows = json.loads(resp.read())

result = {
    'updated_at': '$(date -u +%Y-%m-%dT%H:%M:%SZ)',
    'date': '$TODAY',
    'week_start': '$MONDAY',
    'models': {}
}

for name in ['Ashley', 'Izzie', 'Willow']:
    model_rows = [r for r in rows if r['model_name'] == name]
    
    # Sunday baseline (before this week)
    baseline_row = next((r for r in model_rows if r['date'] == '$SUNDAY_BEFORE'), None)
    baseline_subs = int(baseline_row['subscription_revenue']) if baseline_row and baseline_row['subscription_revenue'] else 0
    
    # This week's rows (Monday onwards)
    week_rows = [r for r in model_rows if r['date'] >= '$MONDAY']
    week_rev = sum(r['total_revenue'] for r in week_rows)
    
    # Latest subs count
    latest = max(week_rows, key=lambda r: r['date']) if week_rows else None
    current_subs = int(latest['subscription_revenue']) if latest and latest['subscription_revenue'] else 0
    
    # New subs this week
    new_subs = max(current_subs - baseline_subs, 0) if baseline_subs > 0 else 0
    
    # Weekly LTV
    ltv = round(week_rev / new_subs, 2) if new_subs > 0 else 0
    
    # Today's rev
    today_row = next((r for r in model_rows if r['date'] == '$TODAY'), None)
    today_rev = today_row['total_revenue'] if today_row else 0
    
    result['models'][name] = {
        'today_gross': today_rev,
        'week_gross': week_rev,
        'total_subs': current_subs,
        'new_subs_week': new_subs,
        'ltv_week': ltv
    }

with open('$OUTPUT_FILE', 'w') as f:
    json.dump(result, f, indent=2)

for n, d in result['models'].items():
    print(f'  {n}: today=\${d[\"today_gross\"]}, week=\${d[\"week_gross\"]}, subs={d[\"total_subs\"]}, new={d[\"new_subs_week\"]}, LTV=\${d[\"ltv_week\"]}')
"

echo "[$(date)] Done"
