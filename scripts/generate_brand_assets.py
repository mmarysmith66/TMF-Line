"""Generate favicon + OG image for TMF Line."""
import asyncio
import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")
OUT = Path("/app/frontend/public")

PROMPTS = [
    ("og_image", "Premium ultra-modern fintech brand banner for 'TMF Line', dark near-black background, abstract geometric emerald green and cyan blue glowing lines forming a stylized capital letter mark, the words 'TMF Line' in elegant modern typography in white, subtle prismatic light refractions, cinematic dramatic lighting, 1200x630 wide aspect ratio, no people, sleek and corporate"),
    ("favicon_source", "Minimal premium fintech logo mark icon for 'TMF Line', square format, abstract geometric mark resembling intersecting lines forming a 'T', emerald green to cyan blue gradient, on a deep near-black background with subtle glow, ultra clean, centered, square 1:1, high contrast, simple shape no text, app icon style"),
    ("apple_touch", "Square premium app icon for 'TMF Line' fintech brand, 'TMF' bold modern wordmark centered in white on a deep dark gradient background with emerald to cyan accent border, rounded corners feel, premium iOS-quality icon, square 1:1, ultra crisp, no extra elements"),
]


async def main():
    api_key = os.getenv("EMERGENT_LLM_KEY")
    for i, (name, prompt) in enumerate(PROMPTS):
        try:
            chat = LlmChat(api_key=api_key, session_id=f"tmf-icon-{i}", system_message="You generate premium fintech branding visuals.")
            chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
            text, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
            if images:
                target = OUT / f"{name}.png"
                target.write_bytes(base64.b64decode(images[0]["data"]))
                print(f"[{name}] saved -> {target}")
            else:
                print(f"[{name}] no images")
        except Exception as exc:
            print(f"[{name}] FAILED: {exc}")


if __name__ == "__main__":
    asyncio.run(main())
