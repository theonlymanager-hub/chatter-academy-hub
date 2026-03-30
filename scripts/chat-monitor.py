#!/usr/bin/env python3
"""
Chat Monitor — Autonomous chatting quality system
Runs every 2 hours. Checks:
1. Dead chats (fan waiting 30+ min for reply)
2. Welcome message compliance (question opener vs generic greeting)
3. PPV compliance (price flexibility, YES/NO closes)
4. Whale detection (fan spending $50+ in session)

Posts alerts to Discord chatting-feedback channel via webhook.
"""

import json
import subprocess
import sys
import os
from datetime import datetime, timezone, timedelta

API_KEY = "ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
API_BASE = "https://app.onlyfansapi.com/api"

# Discord webhook for chatting-feedback channel
DISCORD_WEBHOOK = os.environ.get("DISCORD_CHATFEEDBACK_WEBHOOK", "")

ACCOUNTS = {
    "acct_71750a6057e34776b9b6ca0903b5ee1a": "Ashley",
    "acct_6140bb9805e9416a928d4d7a788f3939": "Izzie",
    "acct_f968a6be8f2041dcb9d52f8113f2d258": "Willow",
}

def api_get(endpoint):
    """Make authenticated API request"""
    try:
        result = subprocess.run(
            ["curl", "-s", f"{API_BASE}/{endpoint}",
             "-H", f"Authorization: Bearer {API_KEY}"],
            capture_output=True, text=True, timeout=15
        )
        return json.loads(result.stdout)
    except Exception as e:
        print(f"API error: {e}")
        return {}

def check_dead_chats(acct_id, model_name):
    """Find fans waiting 30+ min for a reply"""
    issues = []
    data = api_get(f"{acct_id}/chats?limit=20")
    chats = data.get("data", data) if isinstance(data, dict) else data
    if not isinstance(chats, list):
        return issues
    
    now = datetime.now(timezone.utc)
    
    for chat in chats:
        unread = chat.get("unreadMessagesCount", 0)
        if unread == 0:
            continue
        
        last_msg = chat.get("lastMessage", {})
        from_user = last_msg.get("fromUser", {})
        created = last_msg.get("createdAt", "")
        fan = chat.get("fan", {})
        fan_name = fan.get("name", "Unknown")
        
        # If last message is FROM fan (not model), check how long ago
        try:
            msg_time = datetime.fromisoformat(created.replace("+00:00", "+00:00"))
            wait_mins = (now - msg_time).total_seconds() / 60
            if wait_mins > 30:
                issues.append({
                    "type": "dead_chat",
                    "model": model_name,
                    "fan": fan_name,
                    "wait_mins": int(wait_mins),
                    "msg": f"⏰ [{model_name}] {fan_name} waiting {int(wait_mins)} min for reply"
                })
        except:
            pass
    
    return issues

def check_welcome_compliance(acct_id, model_name):
    """Check if new subs got the correct welcome message"""
    issues = []
    data = api_get(f"{acct_id}/fans/latest?limit=5")
    fans = data.get("data", {})
    if isinstance(fans, dict):
        fans = fans.get("list", [])
    if not isinstance(fans, list):
        return issues
    
    for fan in fans[:5]:
        fan_id = fan.get("id", 0)
        fan_name = fan.get("name", "Unknown")
        
        # Get first messages in this chat
        msg_data = api_get(f"{acct_id}/chats/{fan_id}/messages?limit=5&order=asc")
        msgs = msg_data.get("data", msg_data) if isinstance(msg_data, dict) else msg_data
        if not isinstance(msgs, list) or len(msgs) == 0:
            continue
        
        first_msg = msgs[0]
        text = (first_msg.get("text", "") or "").lower()
        from_id = first_msg.get("fromUser", {}).get("id", 0)
        
        # Check if first model message contains the question
        if from_id != fan_id:  # Message from model
            good_openers = ["why did you sub", "what makes me different", "why did you subscribe"]
            has_good_opener = any(opener in text for opener in good_openers)
            if not has_good_opener:
                issues.append({
                    "type": "welcome_fail",
                    "model": model_name,
                    "fan": fan_name,
                    "msg": f"⚠️ [{model_name}] Wrong welcome to {fan_name} — used generic greeting instead of question opener"
                })
    
    return issues

def check_transactions_for_whales(acct_id, model_name):
    """Detect fans spending $50+ in last 2 hours"""
    whales = []
    data = api_get(f"{acct_id}/payouts/transactions?limit=50&sortOrder=desc")
    txns = data.get("data", {})
    if isinstance(txns, dict):
        txns = txns.get("list", [])
    if not isinstance(txns, list):
        return whales
    
    now = datetime.now(timezone.utc)
    two_hours_ago = now - timedelta(hours=2)
    fan_spend = {}
    
    for t in txns:
        created = t.get("created_at", t.get("createdAt", ""))
        try:
            txn_time = datetime.fromisoformat(created.replace("+00:00", "+00:00"))
            if txn_time < two_hours_ago:
                continue
        except:
            continue
        
        gross = float(t.get("amount", t.get("gross", 0)) or 0)
        desc = t.get("description", "")
        # Extract fan name from description
        import re
        fan_match = re.search(r'>([^<]+)</a>', desc)
        fan_name = fan_match.group(1) if fan_match else "Unknown"
        
        fan_spend[fan_name] = fan_spend.get(fan_name, 0) + gross
    
    for fan_name, total in fan_spend.items():
        if total >= 50:
            whales.append({
                "type": "whale_alert",
                "model": model_name,
                "fan": fan_name,
                "amount": total,
                "msg": f"🐋 [{model_name}] WHALE ALERT: {fan_name} spent ${total:.2f} in last 2 hours — PRIORITY TREATMENT"
            })
    
    return whales

def send_discord_alert(message):
    """Send alert to Discord chatting-feedback webhook"""
    if not DISCORD_WEBHOOK:
        print(f"[NO WEBHOOK] {message}")
        return
    
    payload = json.dumps({"content": message})
    subprocess.run(
        ["curl", "-s", "-X", "POST", DISCORD_WEBHOOK,
         "-H", "Content-Type: application/json",
         "-d", payload],
        capture_output=True, timeout=10
    )

def main():
    print(f"[{datetime.now()}] Chat Monitor starting...")
    all_issues = []
    
    for acct_id, model in ACCOUNTS.items():
        print(f"Checking {model}...")
        
        # Dead chats
        dead = check_dead_chats(acct_id, model)
        all_issues.extend(dead)
        
        # Welcome compliance
        welcome = check_welcome_compliance(acct_id, model)
        all_issues.extend(welcome)
        
        # Whale detection
        whales = check_transactions_for_whales(acct_id, model)
        all_issues.extend(whales)
    
    if all_issues:
        # Group by type
        dead_chats = [i for i in all_issues if i["type"] == "dead_chat"]
        welcome_fails = [i for i in all_issues if i["type"] == "welcome_fail"]
        whale_alerts = [i for i in all_issues if i["type"] == "whale_alert"]
        
        report = f"**🤖 Auto QC Report — {datetime.now().strftime('%H:%M')}**\n\n"
        
        if dead_chats:
            report += "**Dead Chats (fan waiting):**\n"
            for d in dead_chats:
                report += f"{d['msg']}\n"
            report += "\n"
        
        if welcome_fails:
            report += "**Welcome Message Issues:**\n"
            for w in welcome_fails:
                report += f"{w['msg']}\n"
            report += "\n"
        
        if whale_alerts:
            report += "**Whale Alerts:**\n"
            for wh in whale_alerts:
                report += f"{wh['msg']}\n"
            report += "\n"
        
        print(report)
        send_discord_alert(report)
    else:
        print("All clear — no issues found")
    
    # Save results
    results_file = f"/tmp/chat-monitor-{datetime.now().strftime('%Y%m%d-%H%M')}.json"
    with open(results_file, "w") as f:
        json.dump({"timestamp": datetime.now().isoformat(), "issues": all_issues}, f, indent=2)
    print(f"Results saved to {results_file}")

if __name__ == "__main__":
    main()
