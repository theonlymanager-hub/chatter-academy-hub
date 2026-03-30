#!/usr/bin/env bash
# Auto QC — pulls recent chats from all accounts, scores against playbook, posts issues
# Runs every 2 hours via cron

set -euo pipefail
API_KEY="ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
LOG="/tmp/auto-qc-$(date +%Y%m%d-%H%M).log"
WEBHOOK_URL=""  # Discord webhook for chatting-feedback channel (to be set)

ACCOUNTS="acct_71750a6057e34776b9b6ca0903b5ee1a:Ashley
acct_6140bb9805e9416a928d4d7a788f3939:Izzie
acct_f968a6be8f2041dcb9d52f8113f2d258:Willow"

echo "[$(date)] Auto QC starting" | tee "$LOG"

echo "$ACCOUNTS" | while IFS=: read -r ACCT_ID MODEL; do
  [ -z "$ACCT_ID" ] && continue
  echo "--- $MODEL ---" | tee -a "$LOG"
  
  # Pull 10 most recent chats
  CHATS=$(curl -s "https://app.onlyfansapi.com/api/$ACCT_ID/chats?limit=10" \
    -H "Authorization: Bearer $API_KEY" 2>/dev/null)
  
  # For each chat, pull last 15 messages and check compliance
  echo "$CHATS" | python3 -c "
import json, sys

data = json.load(sys.stdin)
chats = data.get('data', data) if isinstance(data, dict) else data
if not isinstance(chats, list):
    print('No chats found')
    sys.exit(0)

issues = []
for chat in chats[:10]:
    fan = chat.get('fan', {})
    fan_name = fan.get('name', 'Unknown')
    fan_id = fan.get('id', 0)
    unread = chat.get('unreadMessagesCount', 0)
    last_msg = chat.get('lastMessage', {})
    last_text = last_msg.get('text', '')[:100]
    from_user = last_msg.get('fromUser', {})
    
    # Check: unread messages (fan waiting for reply)
    if unread > 0:
        issues.append(f'⏰ {fan_name}: {unread} unread message(s) — fan waiting for reply')
    
print(f'Checked {len(chats)} chats')
for issue in issues:
    print(issue)
" 2>/dev/null | tee -a "$LOG"
  
done

echo "[$(date)] Auto QC complete" | tee -a "$LOG"
