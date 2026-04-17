import os
import requests
import time

SAVE_PATH = "/home/gary/plant-disease-classifier/data/raw/color/background"
# Unsplash provides random images based on keywords
KEYWORDS = ["furniture", "office", "street", "person", "animal", "texture", "car"]
TOTAL_IMAGES = 150

if not os.path.exists(SAVE_PATH):
    os.makedirs(SAVE_PATH)

print(f"🚀 Starting download of {TOTAL_IMAGES} background images...")

for i in range(TOTAL_IMAGES):
    try:
        # Rotate through keywords to get variety
        keyword = KEYWORDS[i % len(KEYWORDS)]
        img_url = f"https://source.unsplash.com/random/224x224/?{keyword}"
        
        response = requests.get(img_url, timeout=10)
        if response.status_code == 200:
            with open(f"{SAVE_PATH}/bg_{i}.jpg", 'wb') as f:
                f.write(response.content)
            if i % 10 == 0:
                print(f"✅ Downloaded {i}/{TOTAL_IMAGES}...")
        
        # Small sleep to avoid hitting rate limits
        time.sleep(0.5)
    except Exception as e:
        print(f"❌ Error downloading image {i}: {e}")

print(f"✨ Done! Your background images are in {SAVE_PATH}")
