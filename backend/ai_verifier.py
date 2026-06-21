import httpx
import json
import base64
import logging
from config import settings

ACTIVITY_POINT_MAP = {
    "Tree Plantation": 100,
    "Community Cleanup": 80,
    "Waste Segregation": 20,
    "Public Transport": 30,
    "Cycling": 25,
    "Reusable Bottle": 10,
    "Cloth Bag": 10,
    "Other Eco Action": 15,
}

CARBON_SAVINGS_MAP = {
    "Tree Plantation": 20.0,
    "Community Cleanup": 5.0,
    "Public Transport": 2.5,
    "Cycling": 1.5,
    "Waste Segregation": 1.0,
    "Reusable Bottle": 0.5,
    "Cloth Bag": 0.3,
    "Other Eco Action": 1.0,
}

SYSTEM_PROMPT = """You are an AI verifier for EcoQuest India, a sustainability challenge platform.
Your job is to analyze uploaded images and determine if they show a genuine eco-friendly activity.

Activities to detect:
- Tree Plantation (planting or nurturing trees/saplings)
- Community Cleanup (cleaning parks, roads, beaches, public spaces)
- Waste Segregation (sorting waste into bins, composting)
- Public Transport (bus, metro, train tickets or photos inside)
- Cycling (person on bicycle, cycle path, helmet)
- Reusable Bottle (person with steel/glass reusable water bottle)
- Cloth Bag (person with cloth/jute shopping bag)
- Other Eco Action (solar panels, rainwater harvesting, etc.)

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "activity": "<one of the activity names above, or 'Unknown'>",
  "confidence": <integer 0-100>,
  "points": <integer, base points for activity>,
  "carbon_saved": <float, estimated kg CO2 saved>,
  "reason": "<one sentence explaining your determination>"
}

If the image does not show any eco-friendly activity, return confidence below 40.
If the image is unclear, blurry, or irrelevant, return confidence below 30.
Do not award points for screenshots, memes, or computer-generated images."""

_DEMO_RESULT = {
    "activity": "Other Eco Action",
    "confidence": 60,
    "points": 15,
    "carbon_saved": 1.0,
    "reason": "AI verification running in demo mode (no valid Gemini key). Auto-approved for testing.",
}

_FALLBACK_API_ERROR = {
    "activity": "Other Eco Action",
    "confidence": 55,
    "points": 15,
    "carbon_saved": 1.0,
}


async def verify_image_bytes(image_bytes: bytes, content_type: str = "image/jpeg") -> dict:
    """Send raw image bytes to Gemini Vision — single source of truth for AI verification."""
    key = settings.GEMINI_API_KEY or ""
    if not key or not key.startswith("AIza"):
        return {**_DEMO_RESULT}

    image_b64 = base64.b64encode(image_bytes).decode()
    payload = {
        "contents": [{"parts": [
            {"text": SYSTEM_PROMPT},
            {"inline_data": {"mime_type": content_type, "data": image_b64}},
        ]}],
        "generationConfig": {"temperature": 0.1, "maxOutputTokens": 256},
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
                params={"key": settings.GEMINI_API_KEY},
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            text = text.strip()
            result = json.loads(text)
            result["confidence"] = max(0, min(100, int(result.get("confidence", 0))))
            detected = result.get("activity", "Other Eco Action")
            result["points"] = ACTIVITY_POINT_MAP.get(detected, 15)
            result["carbon_saved"] = float(result.get("carbon_saved", CARBON_SAVINGS_MAP.get(detected, 1.0)))
            return result

    except httpx.HTTPStatusError as e:
        logging.warning(f"Gemini API error {e.response.status_code}: {e.response.text[:200]}")
        return {
            **_FALLBACK_API_ERROR,
            "reason": f"AI verification unavailable (API error {e.response.status_code}). Activity queued for manual review.",
        }
    except Exception as e:
        logging.warning(f"Gemini verification failed: {e}")
        return {
            **_FALLBACK_API_ERROR,
            "reason": "AI verification unavailable. Activity queued for manual review.",
        }


async def verify_image(image_url: str) -> dict:
    """Fetch image from URL, then delegate to verify_image_bytes()."""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(image_url)
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "image/jpeg").split(";")[0]
            return await verify_image_bytes(resp.content, content_type)
    except Exception as e:
        logging.warning(f"Failed to fetch image from {image_url}: {e}")
        return {
            **_FALLBACK_API_ERROR,
            "reason": "AI verification unavailable (could not fetch image). Activity queued for manual review.",
        }
