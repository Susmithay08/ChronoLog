from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid, datetime
from app.core.database import get_db, LogEntry, Digest
from app.services.ai import generate_weekly_digest

router = APIRouter()

class LogIn(BaseModel):
    title: str
    body: str
    mood: str = "good"
    tags: str = ""
    built: str = ""
    learned: str = ""
    date: Optional[str] = None

@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(LogEntry).order_by(LogEntry.date.desc()).all()
    return [_fmt(l) for l in logs]

@router.post("/logs")
def create_log(data: LogIn, db: Session = Depends(get_db)):
    date = data.date or datetime.date.today().isoformat()
    # Calculate streak
    prev = db.query(LogEntry).order_by(LogEntry.date.desc()).first()
    streak = 1
    if prev:
        prev_date = datetime.date.fromisoformat(prev.date)
        today = datetime.date.fromisoformat(date)
        if (today - prev_date).days == 1:
            streak = prev.streak + 1
        elif today == prev_date:
            streak = prev.streak
    log = LogEntry(id=str(uuid.uuid4()), date=date, title=data.title,
                   body=data.body, mood=data.mood, tags=data.tags,
                   built=data.built, learned=data.learned, streak=streak)
    db.add(log)
    db.commit()
    db.refresh(log)
    return _fmt(log)

@router.delete("/logs/{log_id}")
def delete_log(log_id: str, db: Session = Depends(get_db)):
    log = db.query(LogEntry).filter(LogEntry.id == log_id).first()
    if not log: raise HTTPException(404, "Not found")
    db.delete(log)
    db.commit()
    return {"deleted": True}

@router.post("/digest")
def create_digest(db: Session = Depends(get_db)):
    # Get last 7 days of entries
    entries = db.query(LogEntry).order_by(LogEntry.date.desc()).limit(7).all()
    if not entries: raise HTTPException(400, "No entries to summarize")
    entry_dicts = [_fmt(e) for e in entries]
    data = generate_weekly_digest(entry_dicts)
    d = Digest(id=str(uuid.uuid4()),
               week_start=entries[-1].date, week_end=entries[0].date,
               summary=data.get("summary",""), highlights=str(data.get("highlights",[])))
    db.add(d)
    db.commit()
    return data

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    logs = db.query(LogEntry).all()
    if not logs: return {"total":0,"streak":0,"moods":{},"tags":[],"heatmap":{}}
    current_streak = max((l.streak for l in logs), default=0)
    moods = {}
    for l in logs:
        moods[l.mood] = moods.get(l.mood, 0) + 1
    all_tags = []
    for l in logs:
        if l.tags:
            all_tags.extend([t.strip() for t in l.tags.split(",")])
    tag_counts = {}
    for t in all_tags:
        if t: tag_counts[t] = tag_counts.get(t,0) + 1
    heatmap = {l.date: 1 for l in logs}
    return {"total": len(logs), "streak": current_streak, "moods": moods,
            "tags": sorted(tag_counts.items(), key=lambda x:-x[1])[:10], "heatmap": heatmap}

def _fmt(l):
    return {"id":l.id,"date":l.date,"title":l.title,"body":l.body,
            "mood":l.mood,"tags":l.tags,"built":l.built,"learned":l.learned,"streak":l.streak}
