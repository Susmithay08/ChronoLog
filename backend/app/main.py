from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import logs
from app.core.database import init_db

app = FastAPI(title="ChronoLog")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
def startup(): init_db()

app.include_router(logs.router, prefix="/api")
