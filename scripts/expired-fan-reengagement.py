#!/usr/bin/env python3
"""
Expired Fan Re-engagement — 3-touch automated sequence
Runs weekly (Sunday 7 PM UK). Sends personalised messages to expired fans.

Touch 1 (Day 3 after expiry): Soft personal — "I was thinking about you"
Touch 2 (Day 14): Teaser — "I just made something special"
Touch 3 (Day 28): Last shot — "I miss talking to you"

After 30 days, fan goes cold — no more messages.
"""

import json
import urllib.request
import os
import re
from datetime import datetime, timezone, timedelta

API_KEY = "ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
API_BASE = "https://app.onlyfansapi.com/api"
LOG_FILE = "/tmp/expired-fan-reengagement.log"
STATE_FILE = os.path.expanduser("~/.openclaw/workspace/expired-fan-state.json")

ACCOUNTS = {
    "acct_71750a6057e34776b9b6ca0903b5ee1a": "Ashley",
    "acct_6140bb9805e9416a928d4d7a788f3939": "Izzie",
    "acct_f968a6be8f2041dcb9d52f8113f2d258": "Willow",
}

# Messages per touch per model
MESSAGES = {
    "Ashley": {
        "touch1": "hey {name}... I noticed you've been quiet. I was actually thinking about you the other day 💕 hope everything's okay",
        "touch2": "hey {name}, I just made something really special and honestly you were the first person I thought of... miss our chats 🙈",
        "touch3": "I'm not going to lie {name}, I miss talking to you. if you ever want to come back, I'd love that 💝",
    },
    "Izzie": {
        "touch1": "hey {name}... I noticed you've been gone for a bit. just wanted to check in, I was thinking about you 💕",
        "touch2": "hey {name}, I just did something really special and you came to mind... would love to show you 🙈",
        "touch3": "hey {name}, I miss our conversations. if you ever want to come back, the door's always open 💝",
    },
    "Willow": {
        "touch1": "hey {name}... I noticed you left. just wanted to say I was thinking about you, hope you're doing well 💕",
        "touch2": "hey {name}, I just created something special and honestly thought of you first... miss having you around 🙈",
        "touch3": "I'm not going to lie {name}, I really miss talking to you. if you ever feel like coming back, I'd love that 💝",
    },
}

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def load_state():
    try:
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    except:
        return {"sent": {}}

def save_state(state):
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def api_get(endpoint):
    import subprocess
    try:
        result = subprocess.run(
            ["curl", "-s", f"{API_BASE}/{endpoint}", "-H", f"Authorization: Bearer {API_KEY}"],
            capture_output=True, text=True, timeout=15
        )
        return json.loads(result.stdout)
    except Exception as e:
        log(f"API GET error: {e}")
        return {}

def send_message(account_id, fan_id, text):
    import subprocess
    url = f"{API_BASE}/{account_id}/chats/{fan_id}/messages"
    payload = json.dumps({"text": text})
    try:
        result = subprocess.run(
            ["curl", "-s", "-X", "POST", url,
             "-H", f"Authorization: Bearer {API_KEY}",
             "-H", "Content-Type: application/json",
             "-d", payload],
            capture_output=True, text=True, timeout=15
        )
        return json.loads(result.stdout)
    except Exception as e:
        log(f"Send error to {fan_id}: {e}")
        return None

def get_expired_fans(account_id):
    data = api_get(f"{account_id}/fans/expired?limit=50&sortOrder=desc")
    fans_data = data.get("data", {})
    if isinstance(fans_data, dict):
        return fans_data.get("list", [])
    return fans_data if isinstance(fans_data, list) else []

def main(dry_run=True):
    log(f"Expired fan re-engagement starting (dry_run={dry_run})")
    state = load_state()
    now = datetime.now(timezone.utc)
    
    for acct_id, model in ACCOUNTS.items():
        log(f"--- {model} ---")
        fans = get_expired_fans(acct_id)
        log(f"Found {len(fans)} expired fans")
        
        for fan in fans:
            fan_id = str(fan.get("id", ""))
            fan_name = fan.get("name", "Fan")
            
            # Get expiry date
            sub_data = fan.get("subscribedOnData", fan.get("subscribedByData", {}))
            if isinstance(sub_data, dict):
                expire_date_str = sub_data.get("expiredAt", sub_data.get("subscribedByExpireDate", ""))
            elif isinstance(sub_data, list) and sub_data:
                expire_date_str = sub_data[0].get("expireDate", "")
            else:
                continue
            
            if not expire_date_str:
                continue
            
            try:
                expire_date = datetime.fromisoformat(expire_date_str.replace("+00:00", "+00:00"))
            except:
                continue
            
            days_since_expiry = (now - expire_date).days
            
            # Skip if expired more than 30 days ago
            if days_since_expiry > 30:
                continue
            
            # Skip if expired less than 3 days ago
            if days_since_expiry < 3:
                continue
            
            # Determine which touch to send
            fan_key = f"{acct_id}:{fan_id}"
            sent_touches = state["sent"].get(fan_key, [])
            
            if days_since_expiry >= 3 and "touch1" not in sent_touches:
                touch = "touch1"
            elif days_since_expiry >= 14 and "touch2" not in sent_touches:
                touch = "touch2"
            elif days_since_expiry >= 28 and "touch3" not in sent_touches:
                touch = "touch3"
            else:
                continue
            
            # Use first name only
            first_name = fan_name.split()[0] if fan_name else "babe"
            msg = MESSAGES[model][touch].format(name=first_name)
            
            if dry_run:
                log(f"[DRY RUN] Would send {touch} to {fan_name} ({fan_id}): {msg}")
            else:
                result = send_message(acct_id, fan_id, msg)
                if result:
                    log(f"✅ Sent {touch} to {fan_name} ({fan_id}) on {model}")
                    if fan_key not in state["sent"]:
                        state["sent"][fan_key] = []
                    state["sent"][fan_key].append(touch)
                    save_state(state)
                else:
                    log(f"❌ Failed {touch} to {fan_name} ({fan_id})")
    
    log("Done")

if __name__ == "__main__":
    import sys
    dry_run = "--send" not in sys.argv
    if dry_run:
        log("Running in DRY RUN mode. Use --send to actually send messages.")
    main(dry_run=dry_run)
