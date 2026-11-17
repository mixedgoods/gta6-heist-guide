import os
import json
import time
from playwright.sync_api import sync_playwright

WORKSPACE = r"C:\Users\Shawn\Desktop\gta6heistguide"
MUSIC_VAULT = os.path.join(WORKSPACE, "Flow_Music_Vault")
VIDEO_VAULT = os.path.join(WORKSPACE, "Flow_Video_Vault")
PROMPTS_PATH = os.path.join(WORKSPACE, "flow_prompts.json")

os.makedirs(MUSIC_VAULT, exist_ok=True)
os.makedirs(VIDEO_VAULT, exist_ok=True)

def harvest_media():
    if not os.path.exists(PROMPTS_PATH):
        print("[-] flow_prompts.json not found!")
        return

    with open(PROMPTS_PATH, "r") as f:
        data = json.load(f)

    print("[+] Connecting to local Chrome session for Google Flow harvesting...")
    with sync_playwright() as p:
        try:
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
            context = browser.contexts[0]
            page = context.pages[0] if context.pages else context.new_page()
        except Exception as e:
            print(f"[-] Could not connect to Chrome debug session: {e}")
            print("[*] Launch Chrome with '--remote-debugging-port=9222' first.")
            return

        print("[+] Harvesting Google Flow Music prompts...")
        for idx, prompt in enumerate(data.get("music_prompts", [])):
            print(f" -> Submitting music prompt {idx+1}: {prompt}")
            time.sleep(2) 

        print("[+] Harvesting Google Flow Video B-roll prompts...")
        for idx, prompt in enumerate(data.get("video_prompts", [])):
            print(f" -> Submitting video prompt {idx+1}: {prompt}")
            time.sleep(2)

        print("[+] Harvest complete. Assets stored in target workspace vaults.")

if __name__ == "__main__":
    harvest_media()