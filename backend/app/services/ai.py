import json
from groq import Groq
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_weekly_digest(entries: list) -> dict:
    entries_text = "\n\n".join([
        f"Date: {e['date']}\nTitle: {e['title']}\nBuilt: {e['built']}\nLearned: {e['learned']}\nMood: {e['mood']}\nTags: {e['tags']}"
        for e in entries
    ])

    prompt = f"""You are summarizing a developer's week from their daily dev journal entries.

Entries:
{entries_text}

Generate a weekly dev digest as JSON:
{{
  "headline": "string (punchy one-line summary of the week)",
  "summary": "string (2-3 sentences, narrative style, as if written by the developer)",
  "highlights": ["string", "string", "string"],
  "technologies": ["string", "string"],
  "mood_trend": "string (e.g. 'Consistently energized', 'Challenging but rewarding')",
  "next_week_suggestion": "string (one actionable suggestion based on what they built/learned)"
}}

Return ONLY valid JSON."""

    resp = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=800,
    )
    raw = resp.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"): raw = raw[4:]
    return json.loads(raw.strip())
