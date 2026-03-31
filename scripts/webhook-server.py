#!/usr/bin/env python3
"""
OF API Webhook Receiver
Listens for webhook events and triggers automations:
- subscriptions.new → sends welcome message
- transactions.new → whale detection + revenue tracking
- accounts.authentication_failed → alert Luke immediately
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import subprocess
import os
import time
from datetime import datetime

API_KEY = "ofapi_Lk9Mh9QRXmdL17xMllrWFxp6FiWwx4uBHkIORdO5b9c8e63a"
API_BASE = "https://app.onlyfansapi.com/api"
PORT = 8891
LOG_FILE = "/tmp/webhook-server.log"

# Welcome messages per account
WELCOME_MESSAGES = {
    "acct_71750a6057e34776b9b6ca0903b5ee1a": "hey! I just finished studying and you caught me at a good time 😊 what's your real name? I know some people use fake ones on here",
    "acct_6140bb9805e9416a928d4d7a788f3939": "hey! I just got back from a run and you caught me at a good time 😊 what's your real name? I know some people use fake ones on here",
    "acct_f968a6be8f2041dcb9d52f8113f2d258": "hey! I just got back from the gym and saw your notification 😊 what's your real name? I know some people use fake ones on here",
}

ACCOUNT_NAMES = {
    "acct_71750a6057e34776b9b6ca0903b5ee1a": "Ashley",
    "acct_6140bb9805e9416a928d4d7a788f3939": "Izzie",
    "acct_f968a6be8f2041dcb9d52f8113f2d258": "Willow",
}

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def send_message(account_id, fan_id, text):
    """Send a message to a fan via the OF API"""
    import urllib.request
    url = f"{API_BASE}/{account_id}/chats/{fan_id}/messages"
    data = json.dumps({"text": text}).encode()
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Authorization", f"Bearer {API_KEY}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            result = json.loads(resp.read())
            log(f"Message sent to fan {fan_id} on {account_id}")
            return result
    except Exception as e:
        log(f"ERROR sending message: {e}")
        return None

def handle_new_subscription(data):
    """Handle subscriptions.new webhook"""
    account_id = data.get("account_id", "")
    payload = data.get("payload", {})
    
    # Get fan info from payload
    fan = payload.get("subscriber", payload.get("user", {}))
    fan_id = fan.get("id", payload.get("subscriberId", ""))
    fan_name = fan.get("name", "")
    
    if not fan_id or not account_id:
        log(f"Missing fan_id or account_id in subscription event")
        return
    
    model_name = ACCOUNT_NAMES.get(account_id, "Unknown")
    welcome_msg = WELCOME_MESSAGES.get(account_id)
    
    if welcome_msg:
        # Small delay to not seem instant/robotic
        time.sleep(3)
        send_message(account_id, fan_id, welcome_msg)
        log(f"✅ Welcome sent to {fan_name} (#{fan_id}) on {model_name}")
    else:
        log(f"No welcome message configured for {account_id}")

def handle_new_transaction(data):
    """Handle transactions.new webhook — whale detection"""
    account_id = data.get("account_id", "")
    payload = data.get("payload", {})
    
    amount = float(payload.get("amount", 0))
    txn_type = payload.get("type", "")
    fan_data = payload.get("fanData", {})
    spending = fan_data.get("spending", {})
    total_spend = float(spending.get("total", 0))
    
    model_name = ACCOUNT_NAMES.get(account_id, "Unknown")
    
    # Extract fan name from description
    desc = payload.get("description", "")
    import re
    fan_match = re.search(r'>([^<]+)</a>', desc)
    fan_name = fan_match.group(1) if fan_match else "Unknown"
    
    log(f"💰 {model_name}: ${amount} {txn_type} from {fan_name} (total: ${total_spend})")
    
    # Whale alert if $50+ in this transaction or $200+ total
    if amount >= 50 or total_spend >= 200:
        log(f"🐋 WHALE ALERT: {fan_name} on {model_name} — ${amount} this txn, ${total_spend} total")

def handle_auth_failed(data):
    """Handle accounts.authentication_failed — IMMEDIATE ALERT"""
    account_id = data.get("account_id", "")
    model_name = ACCOUNT_NAMES.get(account_id, account_id)
    log(f"🚨🚨🚨 AUTH FAILED: {model_name} account locked out! Escalate to Luke IMMEDIATELY!")

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)
        
        try:
            data = json.loads(body)
        except:
            self.send_response(400)
            self.end_headers()
            return
        
        event = data.get("event", "")
        log(f"Received webhook: {event}")
        
        if event == "subscriptions.new":
            handle_new_subscription(data)
        elif event == "transactions.new":
            handle_new_transaction(data)
        elif event == "accounts.authentication_failed":
            handle_auth_failed(data)
        elif event == "messages.ppv.unlocked":
            log(f"PPV unlocked: {json.dumps(data.get('payload', {}))[:200]}")
        else:
            log(f"Unhandled event: {event}")
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"ok": True}).encode())
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/plain')
        self.end_headers()
        self.wfile.write(b"OF Webhook Server Running")
    
    def log_message(self, format, *args):
        pass  # Suppress default logging

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), WebhookHandler)
    log(f"Webhook server starting on port {PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log("Server stopped")
        server.server_close()
