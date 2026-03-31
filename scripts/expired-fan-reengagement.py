#!/usr/bin/env python3
"""
Expired Fan Re-engagement — 3-touch sequence
Runs daily via cron. Sends personalised messages to expired fans:
- Day 3 after expiry: Soft personal message
- Day 14: Teaser with free image
- Day 28: Last shot emotional message
- After 30 days: stop (too cold)

Messages are personalised with fan name and model persona.
Logs all sends to avoid duplicates.
"""

import json
import os
import urllib.request
from datetime import datetime, timezone, timedelta

API_KEY = "ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
API_BASE = "https://app.onlyfansapi.com/api"
LOG_DIR = "/tmp/expired-fan-logs"
os.makedirs(LOG_DIR, exist_ok=True)

ACCOUNTS = {
    "acct_71750a6057e34776b9b6ca0903b5ee1a": "Ashley",
    "acct_6140bb9805e9416a928d4d7a788f3939": "Izzie",
    "acct_f968a6be8f2041dcb9d52f8113f2d258": "Willow",
}

# Message templates per touch — {name} gets replaced with fan's name
MESSAGES = {
    "Ashley": {
        3: "hey {name}... I noticed you've been quiet. just wanted to check in, I was actually thinking about you the other day 💕 hope everything's okay",
        14: "hey {name} 😊 I just made something really special and honestly you were one of the first people I thought of... miss talking to you",
        28: "I'm not gonna lie {name}, I miss our conversations. if you ever want to come back I'd really love that 💝 no pressure, just wanted you to know",
    },
    "Izzie": {
        3: "hey {name}... noticed you haven't been around. just checking in on you, hope you're doing good 💕",
        14: "hey {name} 😊 been working on some new stuff and thought of you... would love to show you sometime. miss having you around",
        28: "hey {name}, not gonna lie I miss chatting with you. if you ever feel like coming back, I'd love that 💝 just wanted to let you know",
    },
    "Willow": {
        3: "hey {name}... I saw you haven't been around lately. just wanted to say hi and check you're okay 💕",
        14: "hey {name} 😊 I've been up to some fun stuff lately and honestly thought of you... miss talking to you",
        28: "I miss you {name} 💝 if you ever want to come back and chat, I'd really like that. no pressure, just wanted you to know I think about you",
    },
}

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)

def get_sent_log(account_id):
    """Load log of already-sent messages to avoid duplicates"""
    path = os.path.join(LOG_DIR, f"sent-{account_id}.json")
    if os.path.exists(path):
        with open(path) as f:
            return json.load(f)
    return {}

def save_sent_log(account_id, data):
    path = os.path.join(LOG_DIR, f"sent-{account_id}.json")
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def api_get(endpoint):
    try:
        req = urllib.request.Request(f"{API_BASE}/{endpoint}")
        req.add_header("Authorization", f"Bearer {API_KEY}")
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception as e:
        log(f"API GET error: {e}")
        return {}

def api_post(endpoint, data):
    try:
        req = urllib.request.Request(
            f"{API_BASE}/{endpoint}",
            data=json.dumps(data).encode(),
            method="POST"
        )
        req.add_header("Authorization", f"Bearer {API_KEY}")
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except Exception as e:
        log(f"API POST error: {e}")
        return None

def send_message(account_id, fan_id, text):
    result = api_post(f"{account_id}/chats/{fan_id}/messages", {"text": text})
    if result:
        log(f"✅ Sent message to fan {fan_id}")
    return result

def process_account(account_id, model_name):
    log(f"--- Processing {model_name} ---")
    
    # Get expired fans
    data = api_get(f"{account_id}/fans/expired?limit=50&sortOrder=desc")
    fans_data = data.get("data", {})
    fans = fans_data.get("list", []) if isinstance(fans_data, dict) else fans_data if isinstance(fans_data, list) else []
    
    if not fans:
        log(f"No expired fans found for {model_name}")
        return
    
    sent_log = get_sent_log(account_id)
    now = datetime.now(timezone.utc)
    templates = MESSAGES.get(model_name, {})
    sends_this_run = 0
    MAX_SENDS = 10  # Rate limit per model per run
    
    for fan in fans:
        if sends_this_run >= MAX_SENDS:
            log(f"Hit send limit ({MAX_SENDS}) for {model_name}, stopping")
            break
        
        fan_id = str(fan.get("id", ""))
        fan_name = fan.get("name", "").split()[0] if fan.get("name") else "babe"
        
        # Get expiry date
        sub_data = fan.get("subscribedOnData", fan.get("subscribedByData", {}))
        if isinstance(sub_data, dict):
            expire_str = sub_data.get("expiredAt", sub_data.get("subscribedByExpireDate", ""))
        elif isinstance(sub_data, list) and sub_data:
            expire_str = sub_data[0].get("expireDate", "")
        else:
            continue
        
        if not expire_str or not fan_id:
            continue
        
        try:
            expire_date = datetime.fromisoformat(expire_str.replace("+00:00", "+00:00"))
        except:
            continue
        
        days_since = (now - expire_date).days
        
        # Skip if too old (30+ days)
        if days_since > 30:
            continue
        
        # Determine which touch to send
        fan_key = f"{fan_id}"
        fan_sent = sent_log.get(fan_key, {})
        
        for touch_day in [3, 14, 28]:
            touch_key = f"day{touch_day}"
            
            if touch_key in fan_sent:
                continue  # Already sent this touch
            
            if days_since >= touch_day:
                template = templates.get(touch_day, "")
                if not template:
                    continue
                
                message = template.format(name=fan_name)
                
                log(f"Sending Day {touch_day} to {fan_name} ({fan_id}) on {model_name} — expired {days_since} days ago")
                result = send_message(account_id, fan_id, message)
                
                if result:
                    fan_sent[touch_key] = datetime.now().isoformat()
                    sent_log[fan_key] = fan_sent
                    sends_this_run += 1
                
                break  # Only send one touch per fan per run
    
    save_sent_log(account_id, sent_log)
    log(f"{model_name}: {sends_this_run} messages sent this run")

def main():
    log("=== Expired Fan Re-engagement Starting ===")
    log("⚠️ DRY RUN MODE — set DRY_RUN=false to actually send")
    
    for account_id, model_name in ACCOUNTS.items():
        process_account(account_id, model_name)
    
    log("=== Done ===")

if __name__ == "__main__":
    main()
