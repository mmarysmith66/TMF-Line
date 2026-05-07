"""Generate premium fintech images for TMF Line using Gemini Nano Banana."""
import asyncio
import os
import base64
import sys
from pathlib import Path
from dotenv import load_dotenv
from emergentintegrations.llm.chat import LlmChat, UserMessage

load_dotenv("/app/backend/.env")

OUT = Path("/app/frontend/public/images")
OUT.mkdir(parents=True, exist_ok=True)

PROMPTS = [
    ("hero_abstract", "Abstract 3D glassmorphic geometric shapes floating in dark space, subtle emerald green and cyan blue edge lighting, premium fintech aesthetic, cinematic lighting, sleek corporate, very dark background near-black, ultra-detailed, wide landscape 16:9, photorealistic render"),
    ("mca_hero", "Wide-angle architectural photograph of a modern dark glass office tower interior at night, overlooking a softly glowing city skyline, subtle emerald and cool cyan ambient lighting, premium corporate feel, no people, cinematic depth of field, dark moody, 16:9"),
    ("loans_architecture", "Close-up architectural detail of a brutalist premium concrete building intersecting with reflective dark glass, deep shadows, subtle cool blue accent lighting, high contrast, dark professional, 16:9"),
    ("about_executives", "Silhouette of two executives in tailored suits walking in a sleek dark premium office corridor, illuminated by soft cyan and emerald LED strip lighting on the floor, highly professional, mysterious upscale, wide landscape 16:9"),
    ("funding_prism", "Macro photography of a sleek crystal glass prism refracting a single beam of emerald green light into cyan blue against a pitch black background, financial clarity metaphor, ultra sharp, dramatic, 16:9"),
    ("topography_lines", "Abstract topographical contour map lines glowing faintly in emerald green on a deep matte black background, ultra minimal, tech and finance metaphor, 16:9"),
    ("heloc_house", "Architectural night photograph of a modern luxury home with floor-to-ceiling glass windows, warm interior lighting visible, dark exterior, subtle emerald path lighting, premium real estate, 16:9"),
    ("data_flow", "Abstract flowing ribbons of soft emerald and cyan light against deep black background, capital flow metaphor, smooth sleek motion blur, premium 3D render, 16:9"),
    ("contact_atmosphere", "Soft volumetric fog in a dark studio illuminated by a single vertical emerald-cyan LED light bar, minimal negative space, premium aesthetic, 16:9"),
]


async def generate_one(idx: int, name: str, prompt: str):
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print(f"[{name}] no API key")
        return
    try:
        chat = LlmChat(api_key=api_key, session_id=f"tmfline-img-{idx}", system_message="You generate premium fintech imagery.")
        chat.with_model("gemini", "gemini-3.1-flash-image-preview").with_params(modalities=["image", "text"])
        msg = UserMessage(text=prompt)
        text, images = await chat.send_message_multimodal_response(msg)
        if images:
            image_bytes = base64.b64decode(images[0]["data"])
            target = OUT / f"{name}.png"
            target.write_bytes(image_bytes)
            print(f"[{name}] saved {target} ({len(image_bytes)} bytes)")
        else:
            print(f"[{name}] no images returned, text={text[:80]}")
    except Exception as exc:
        print(f"[{name}] FAILED: {exc}")


async def main():
    # generate sequentially to avoid rate limits
    for i, (name, prompt) in enumerate(PROMPTS):
        await generate_one(i, name, prompt)


if __name__ == "__main__":
    asyncio.run(main())
