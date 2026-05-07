from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="TMF Line API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class FundingCalcInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    business_name: Optional[str] = ""
    monthly_revenue: float = 0
    industry: Optional[str] = ""
    time_in_business: Optional[str] = ""
    credit_score: Optional[str] = ""
    existing_positions: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    desired_amount: Optional[float] = 0
    notes: Optional[str] = ""


class HelocInput(BaseModel):
    model_config = ConfigDict(extra="ignore")
    home_value: float
    mortgage_balance: float = 0
    ltv: float = 80
    credit_score: Optional[str] = "good"
    monthly_income: float = 0
    monthly_debt: float = 0


class ContactLead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    full_name: str
    company: Optional[str] = ""
    email: EmailStr
    phone: Optional[str] = ""
    desired_amount: Optional[float] = 0
    product_interest: Optional[str] = ""
    notes: Optional[str] = ""


# ---------- Calculator logic ----------
def estimate_funding(monthly_revenue: float, time_in_business: str, credit_score: str, existing_positions: str, industry: str):
    base = max(0.0, float(monthly_revenue or 0))
    # 1st position advance: 75-150% of monthly revenue
    multiplier = 1.0
    # time in business
    tib_map = {
        "Under 6 months": 0.5,
        "6 – 12 months": 0.7,
        "1 – 2 years": 0.9,
        "2 – 5 years": 1.1,
        "5+ years": 1.25,
    }
    multiplier *= tib_map.get(time_in_business, 1.0)
    # credit score
    cs_map = {
        "500 – 549": 0.75,
        "550 – 599": 0.85,
        "600 – 649": 0.95,
        "650 – 699": 1.05,
        "700 – 749": 1.15,
        "750+": 1.25,
    }
    multiplier *= cs_map.get(credit_score, 1.0)
    # existing positions
    ep_map = {"None": 1.15, "1 position": 0.95, "2 positions": 0.75, "3+ positions": 0.55}
    multiplier *= ep_map.get(existing_positions, 1.0)
    # industry adjustment - light tweak
    industry_boost = {"Restaurant / Food Service": 1.0, "Retail": 1.05, "E-Commerce": 1.05, "Construction": 0.95, "Healthcare": 1.1, "Transportation": 0.95, "Professional Services": 1.05, "Auto Repair": 1.0, "Beauty / Salon": 1.0, "Manufacturing": 1.05, "Real Estate": 0.95, "Technology": 1.1}
    multiplier *= industry_boost.get(industry, 1.0)

    average = base * multiplier
    conservative = round(average * 0.75 / 250) * 250
    aggressive = round(average * 1.35 / 250) * 250
    average = round(average / 250) * 250
    return {
        "conservative": max(0, int(conservative)),
        "average": max(0, int(average)),
        "aggressive": max(0, int(aggressive)),
    }


def estimate_heloc(home_value: float, mortgage_balance: float, ltv: float, credit_score: str, monthly_income: float, monthly_debt: float):
    if home_value <= 0:
        return {"max_loan": 0, "available_credit": 0, "equity": 0, "dti": 0, "qualified": False}
    equity = max(0.0, home_value - mortgage_balance)
    max_total_debt = home_value * (ltv / 100.0)
    available_credit = max(0.0, max_total_debt - mortgage_balance)
    # credit adjustment
    cs_factor = {"excellent": 1.0, "good": 0.95, "fair": 0.85, "below": 0.7}.get(credit_score, 0.9)
    available_credit *= cs_factor
    dti = (monthly_debt / monthly_income * 100.0) if monthly_income > 0 else 0
    qualified = available_credit > 0 and dti <= 50 and equity > 0
    return {
        "max_loan": round(max_total_debt),
        "available_credit": round(available_credit),
        "equity": round(equity),
        "dti": round(dti, 1),
        "qualified": qualified,
    }


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "TMF Line API"}


@api_router.post("/leads/funding-calculator")
async def submit_funding_calculator(payload: FundingCalcInput):
    estimate = estimate_funding(
        payload.monthly_revenue,
        payload.time_in_business or "",
        payload.credit_score or "",
        payload.existing_positions or "",
        payload.industry or "",
    )
    doc = {
        "id": str(uuid.uuid4()),
        "type": "funding_calculator",
        "created_at": _now_iso(),
        "data": payload.model_dump(),
        "estimate": estimate,
    }
    await db.leads.insert_one(doc)
    return {"id": doc["id"], "estimate": estimate, "ok": True}


@api_router.post("/leads/contact")
async def submit_contact(payload: ContactLead):
    doc = {
        "id": str(uuid.uuid4()),
        "type": "contact",
        "created_at": _now_iso(),
        "data": payload.model_dump(),
    }
    await db.leads.insert_one(doc)
    return {"id": doc["id"], "ok": True}


@api_router.post("/calc/funding-estimate")
async def calc_funding(payload: FundingCalcInput):
    estimate = estimate_funding(
        payload.monthly_revenue,
        payload.time_in_business or "",
        payload.credit_score or "",
        payload.existing_positions or "",
        payload.industry or "",
    )
    return {"estimate": estimate}


@api_router.post("/calc/heloc")
async def calc_heloc(payload: HelocInput):
    return {"result": estimate_heloc(
        payload.home_value,
        payload.mortgage_balance,
        payload.ltv,
        payload.credit_score or "good",
        payload.monthly_income,
        payload.monthly_debt,
    )}


@api_router.get("/leads")
async def list_leads(limit: int = 100, secret: str = ""):
    """Internal listing — gated by ADMIN_SECRET env var."""
    expected = os.environ.get("ADMIN_SECRET", "")
    if not expected or secret != expected:
        raise HTTPException(status_code=401, detail="Unauthorized")
    items = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return {"items": items, "count": len(items)}


# ---------- AI Assistant (Claude Sonnet 4.5) ----------
ASSISTANT_SYSTEM = """You are the TMF Line funding assistant — a premium AI advisor for a business funding platform at tmfline.online.

Your role:
- Help business owners explore funding products: Long-Term Business Loans ($50K–$5M, 1–10 yr), Cash Injection / MCA ($5K–$500K, 3–18 mo), HELOC ($25K–$500K), Line of Credit ($10K–$250K, revolving), Equipment Financing ($10K–$5M), and the Funding Calculator/Estimator.
- Recommend the right product based on their stage, revenue, time in business, credit, and use of funds.
- Explain how MCA remittances, HELOC draws, factor rates, and qualification work — clearly and honestly.
- Always direct serious inquiries to apply at /contact or use /funding-estimator.
- Reference TMF Line's stats: 1–24 hour decisions, $5K–$5M funding range, dedicated advisor, transparent terms.

Tone: confident, concise, professional fintech. Never make hard promises about approval or rates. Never use generic SaaS or AI cliches. Don't say "I'm an AI assistant" — just help.

Keep responses under 150 words unless the user asks for depth. Use short paragraphs and bullet lists where helpful."""


class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant'
    content: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


@api_router.post("/assistant/chat")
async def assistant_chat(payload: ChatRequest):
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(500, "Assistant not configured")
    if not payload.message.strip():
        raise HTTPException(422, "Message cannot be empty")

    # Load history from MongoDB
    history_doc = await db.chat_sessions.find_one({"session_id": payload.session_id}, {"_id": 0})
    history: List[dict] = history_doc.get("messages", []) if history_doc else []

    # Pass prior conversation as a contextual primer (last 10 turns) since the
    # library's auto-history replays would double-bill tokens.
    if history:
        primer = "\n\n".join(f"{m['role'].upper()}: {m['content']}" for m in history[-10:])
        full_input = f"Conversation so far:\n{primer}\n\nUSER: {payload.message}"
    else:
        full_input = payload.message

    chat = LlmChat(api_key=api_key, session_id=payload.session_id, system_message=ASSISTANT_SYSTEM)
    chat.with_model("anthropic", "claude-sonnet-4-5-20250929")
    reply = await chat.send_message(UserMessage(text=full_input))

    new_history = history + [
        {"role": "user", "content": payload.message, "ts": _now_iso()},
        {"role": "assistant", "content": reply, "ts": _now_iso()},
    ]
    await db.chat_sessions.update_one(
        {"session_id": payload.session_id},
        {"$set": {"session_id": payload.session_id, "messages": new_history, "updated_at": _now_iso()}},
        upsert=True,
    )
    return {"reply": reply, "session_id": payload.session_id}


@api_router.get("/assistant/history/{session_id}")
async def assistant_history(session_id: str):
    doc = await db.chat_sessions.find_one({"session_id": session_id}, {"_id": 0, "messages": 1})
    return {"messages": (doc or {}).get("messages", [])}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
